import { FastifyInstance } from "fastify";
import PostBodyAuthLoginSchema from "../schemas/auth/PostBodyAuthLogin.json";
import GetQueryAuthDiscordCallbackSchema from "../schemas/auth/GetQueryAuthDiscordCallback.json";
import bcrypt from "bcryptjs";
import { prisma } from "../index";
import { PostBodyAuthLogin } from "../types/auth/PostBodyAuthLogin";
import { GetQueryAuthDiscordCallback } from "../types/auth/GetQueryAuthDiscordCallback";
const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } = process.env;

export default async function (server: FastifyInstance): Promise<void> {
  server.post<{ Body: PostBodyAuthLogin }>(
    "/login",
    {
      schema: { body: PostBodyAuthLoginSchema },
      preHandler: server.rateLimit({
        max: 30,
        timeWindow: 60 * 1000,
      }),
    },
    async (request, reply) => {
      const { password, username } = request.body;

      let user = await prisma.user.findUnique({ where: { username } });

      if (user) {
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return reply.code(401).send({
            statusCode: 401,
            name: "INVALID_PASSWORD",
            message:
              "Oops! It seems like the password isn't quite right. Let's try another one, keeping it strong and secure!",
          });
        } else {
          return reply.code(200).send({ statusCode: 200, message: "LOGGED_IN", data: user });
        }
      }
      const hashedPassword = await request.utils.generateHash(password, 12);
      const generateLinkId = Math.random().toString(36).slice(2, 7);

      await prisma.user.create({
        data: {
          username,
          link_id: generateLinkId,
          password: hashedPassword,
        },
      });

      const token = request.utils.signToken({ username, link_id: generateLinkId });

      return reply.code(201).send({ statusCode: 201, message: "USER_CREATED", accessToken: token });
    },
  );

  server.get<{ Querystring: GetQueryAuthDiscordCallback }>(
    "/discord/callback",
    {
      schema: {
        querystring: GetQueryAuthDiscordCallbackSchema,
      },
      preHandler: server.rateLimit({
        max: 30,
        timeWindow: 60 * 1000,
      }),
    },
    async (request, reply) => {
      const { state, code } = request.query;

      const { socket_id, link_id } = request.utils.verifyToken(state) as { socket_id: string; link_id: string };

      const sock = server.io.sockets.sockets.get(socket_id);
      if (!sock) return reply.code(401);

      sock.emit("auth_discord_init");
      const redirect_uri =
        process.env["NODE_ENV"] === "production"
          ? "https://whispering-yard-development.up.railway.app/auth/discord/callback"
          : "http://0.0.0.0:3000/discord/callback";

      const params = new URLSearchParams();
      params.append("grant_type", "authorization_code");
      params.append("code", code);
      params.append("redirect_uri", redirect_uri);

      const authHeader = "Basic " + Buffer.from(DISCORD_CLIENT_ID + ":" + DISCORD_CLIENT_SECRET).toString("base64");

      const response = await fetch("https://discord.com/api/v10/oauth2/token", {
        method: "POST",
        body: params.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: authHeader,
        },
        credentials: "include",
      });

      const data = await response.json();
      if (data.error || !data.access_token) {
        sock.emit("auth_discord_failed", data);
        return;
      }

      const userResponse = await fetch("https://discord.com/api/v10/users/@me", {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      const userJson = await userResponse.json();
      if (userJson.error || !userJson) {
        sock.emit("auth_discord_failed", userJson);
        return;
      }

      try {
        const discordAccount = await prisma.discordAccount.findUnique({ where: { user_id: userJson.id } });

        if (!discordAccount) {
          await prisma.discordAccount.create({ data: { email: userJson.email, user_id: userJson.id } });
        } else {
          await prisma.user.update({
            where: { link_id },
            data: { discord_account: { update: { email: userJson.email } } },
          });
        }
      } catch (err) {
        sock.emit("auth_discord_failed", { error: err instanceof Error ? err.message : err });
      }
      sock.emit("auth_discord_success", userJson);
    },
  );
}
