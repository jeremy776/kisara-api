import * as dotenv from "dotenv";
dotenv.config();

import fastifyAutoload from "@fastify/autoload";
import Fastify, { FastifyInstance } from "fastify";
import { join } from "path";
import { Logger as KisaraLogger } from "./structures/Logger";
import { Utils } from "./utils";
import { PrismaClient } from "@prisma/client";
import fastifySocketIO from "fastify-socket.io";
import { StatusCodes } from "http-status-codes";

const Logger = new KisaraLogger();
export const prisma = new PrismaClient();
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

      (_request, reply) => {
        reply.code(StatusCodes.NOT_FOUND).send({
          statusCode: StatusCodes.NOT_FOUND,
          name: "NOT_FOUND",
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
server.register(import("./routes/MessageRouter"), {
  prefix: "/message",
});
server.register(import("./routes/UserRouter"), {
  prefix: "/user",
});

export function fastify(): FastifyInstance {
  return server;
}

async function init(): Promise<void> {
  try {
    const address = await server.listen({
      port: Number(process.env.PORT! || 3000),
      host: "0.0.0.0",
    });

    server.io.on("connection", (socket) => {
      Logger.info(`Socket connected to: ${socket.id}`);
    });
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
