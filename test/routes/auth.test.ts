import tap from "tap";
import { fastify, prisma } from "../../src/index";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

const server = fastify();
tap.teardown(async () => await server.close());

tap.test("[POST] '/auth/login' route", async (t) => {
  const username = "usertest07";
  const password = "128s38";
  const hcaptchaResponse = "snwoowwkkwkwkwowi2992nekwowkwiw";

  await t.test("check invalid hCaptcha", async (t) => {
    const response = await server.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username, password, hcaptchaResponse: "fakeRes" },
    });

    t.equal(response.statusCode, 403);
    t.match(response.json(), { name: "INVALID_CAPTCHA_RESPONSE" });
  });

  //  global.fetch = async (url: any, _opt: any): Promise<any> => {};

  await t.test("created", async (t) => {
    const response = await server.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username, password, hcaptchaResponse },
    });

    t.equal(response.statusCode, 201);
    t.match(response.json(), { message: "USER_CREATED" });
  });

  await t.test("logged in", async (t) => {
    const response = await server.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username, password },
    });

    t.equal(response.statusCode, 200);
    t.match(response.json(), { message: "LOGGED_IN" });
  });

  await t.test("invalid password", async (t) => {
    const response = await server.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username, password: "wrongpassword" },
    });

    t.equal(response.statusCode, 401);
    t.match(response.json(), { name: "INVALID_PASSWORD" });
  });

  const user = await prisma.user.findUnique({ where: { username } });
  if (user) await prisma.user.delete({ where: { username } });
});

const httpServer = createServer();
const ioServer = new SocketIOServer(httpServer);
httpServer.listen(3001);

const mockData = {
  state: "StateToken",
  code: "AuthCode",
  socket_id: "SocketId",
  link_id: "LinkId",
  DISCORD_CLIENT_ID: "DiscordClientId",
  DISCORD_CLIENT_SECRET: "DiscordClientSecret",
  access_token: "AccessToken",
  userJson: {
    id: "user",
    email: "user@example.com",
  },
};

const mockVerifyToken = (state: string) => {
  return { socket_id: mockData.socket_id, link_id: mockData.link_id };
};

const mockFetch = async (url: string, options: any) => {
  if (url.includes("oauth2/token")) {
    return {
      json: async () => ({ access_token: mockData.access_token }),
    };
  } else if (url.includes("users/@me")) {
    return {
      json: async () => mockData.userJson,
    };
  } else if (url.includes("/siteverify")) {
    if (options.body.includes("fakeRes")) return { json: () => ({ success: false }) };
    return {
      json: async () => ({
        success: true,
      }),
    };
  }
};

global.fetch = mockFetch as any;
global.verifyToken = mockVerifyToken as any;

tap.test("GET `/discord/callback` route", async (t) => {
  ioServer.on("connection", (socket) => {
    socket.on("auth_discord_init", () => {
      t.pass("auth_discord_init event emitted");
    });
    socket.on("auth_discord_failed", (data) => {
      t.fail("auth_discord_failed event emitted");
    });
    socket.on("auth_discord_success", (userJson) => {
      t.pass("auth_discord_success event emitted");
      t.same(userJson, mockData.userJson);
    });
  });

  await server.inject({
    method: "GET",
    url: `/discord/callback?state=${mockData.state}&code=${mockData.code}`,
  });

  ioServer.close();
  httpServer.close();
});
