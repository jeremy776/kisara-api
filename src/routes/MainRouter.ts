import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";

export default async function (server: FastifyInstance): Promise<void> {
  server.get("/", (_request, reply) => {
    return reply.code(StatusCodes.OK).send({
      statusCode: StatusCodes.OK,
      name: "KiSaRa",
      message: "Boooom, Welcome Servant!!",
    });
  });
}
