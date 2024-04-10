import { FastifyInstance } from "fastify";

export default async function (server: FastifyInstance): Promise<void> {
  server.get("/", (_request, reply) => {
    return reply.code(200).send({
      statusCode: 200,
      name: "KiSaRa",
      message: "Boooom, Welcome Servant!!",
    });
  });
}
