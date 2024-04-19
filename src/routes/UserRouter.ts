import { FastifyInstance } from "fastify";
import { GetParamsUser } from "@kisara/types/user/GetParamsUser";
import GetParamsUserSchema from "@kisara/schemas/user/GetParamsUser.json";
import { prisma } from "@kisara/index";

export default async function (server: FastifyInstance): Promise<void> {
  server.get<{ Params: GetParamsUser }>(
    "/:id",
    {
      schema: { params: GetParamsUserSchema },
      preHandler: server.rateLimit({
        max: 45,
        timeWindow: 60 * 1000,
      }),
    },
    async (request, reply) => {
      const { id } = request.params;

      if (id.split("-").join("").length !== 32) {
        return reply.code(400).send({
          statusCode: 400,
          name: "INVALID_VALIDATION",
          message: "Can only be 32 characters, '-' characters are excluded",
        });
      }

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          link_id: true,
          username: true,
          role: true,
          discord_account: true,
          comments: true,
          createdAt: true,
        },
      });

      if (!user) {
        return reply.code(404).send({
          statusCode: 404,
          name: "INVALID_USER_ID",
          message:
            "Oops! 🙈 We couldn't find that user ID! Don't sweat it, though! 😊 Double-check or reach out to us for help! 🌟",
        });
      }

      return reply.code(200).send({ statusCode: 200, name: "SUCCESS", data: user });
    },
  );
}
