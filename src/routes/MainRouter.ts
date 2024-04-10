import { FastifyInstance } from "fastify";

/**
 * This code snippet is exporting a default asynchronous function that takes a `FastifyInstance` object as a parameter and returns a `Promise<void>`. Inside the function, there is a route handler for a GET request to the root path ("/") of the server. When this route is accessed, it will return a JSON object with a status code of 200, a name property set to "KiSaRa", and a message property set to "Boom, Welcome Servant!!".
 *
 * @async
 * @function
 * @name default
 * @param {FastifyInstance} server
 * @returns {Promise<void>}
 * @exports
 */
export default async function (server: FastifyInstance): Promise<void> {
  server.get("/", (_request, reply) => {
    return reply.code(200).send({
      statusCode: 200,
      name: "KiSaRa",
      message: "Boom, Welcome Servant!!",
    });
  });
}
