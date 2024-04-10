import * as dotenv from "dotenv";
dotenv.config();

import fastifyAutoload from "@fastify/autoload";
import Fastify, { FastifyInstance } from "fastify";
import { join } from "path";
import { Logger as KisaraLogger } from "./structures/Logger";
import { Utils } from "./utils";
import fastifySocketIO from "fastify-socket.io";
import { Socket } from "socket.io";

const Logger = new KisaraLogger();
export const ExportLogger = Logger;

const server = Fastify({
  logger: Logger.getLogger(),
  connectionTimeout: 30000,
});

server.decorateRequest("utils", Utils);
server.register(fastifySocketIO);

server
  .register(fastifyAutoload, {
    dir: join(__dirname, "plugins"),
  })
  .after((err) => {
    if (err) Logger.error("An error occurred while loading the plugin", err);
    Logger.info("All plugins loaded successfully");

    //NotFound handler
    server.setNotFoundHandler(
      {
        preHandler: server.rateLimit(),
      },

      (request, reply) => {
        reply.code(404).send({
          statusCode: 404,
          message: "Uh-oh! Lost in cyberspace. Can't find what you're after. Take a breather and try another route!",
        });
      },
    );
  });

//routes handler
server.register(import("./routes/MainRouter"), {
  prefix: "/",
});
server.register(import("./routes/AuthRouter"), {
  prefix: "/auth",
});

export function fastify(): FastifyInstance {
  return server;
}

/**
 * The `export function fastify(): FastifyInstance {` statement is defining a named function called `fastify` that returns an instance of `FastifyInstance`. This function is intended to be exported from the module so that it can be used externally. In this case, the `fastify` function returns the Fastify server instance that was created earlier in the code. This allows other parts of the application to access and interact with the Fastify server instance through this exported function.
 *
 * @function
 * @name fastify
 * @kind function
 * @returns {FastifyInstance}
 * @exports
 */

async function init(): Promise<void> {
  try {
    const address = await server.listen({
      port: Number(process.env.PORT! || 3000),
      host: "0.0.0.0",
    });

    server.io.on("connection", (socket) => {
      Logger.info(`Socket connected to: ${socket.id}`);
    });

    Logger.info(`Server listening on ${address}`);
  } catch (err) {
    Logger.error(`Error starting server`, err as any);
  }
}

init();

process
  .on("exit", (code) => {
    Logger.info(`Process exiting with code ${code}`);
  })
  .on("unhandleRejection", (reason) => {
    Logger.error(`Unhandled rejection: ${reason}`);
  })
  .on("uncaughtException", (err) => {
    Logger.error(`Uncaught exception: ${err.stack}`);
  });
