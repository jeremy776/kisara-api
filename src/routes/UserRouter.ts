import { FastifyInstance } from "fastify";
import { GetParamsUser } from "@kisara/types/user/GetParamsUser";
import GetParamsUserSchema from "@kisara/schemas/user/GetParamsUser.json";
import { prisma } from "@kisara/index";
import { StatusCodes } from "http-status-codes";

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
        return reply.code(StatusCodes.BAD_REQUEST).send({
          statusCode: StatusCodes.BAD_REQUEST,
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
        return reply.code(StatusCodes.NOT_FOUND).send({
          statusCode: StatusCodes.NOT_FOUND,
          name: "INVALID_USER_ID",
          message:
            "Oops! 🙈 We couldn't find that user ID! Don't sweat it, though! 😊 Double-check or reach out to us for help! 🌟",
        });
      }

      return reply.code(StatusCodes.OK).send({ statusCode: StatusCodes.OK, name: "SUCCESS", data: user });
    },
  );
}
