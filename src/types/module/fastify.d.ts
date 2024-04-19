import { PrismaClient } from "@prisma/client";
import { Utils } from "@kisara/@kisara/utils";
import { Server } from "socket.io";

declare module "fastify" {
  interface FastifyRequest {
    utils: typeof Utils;
  }
  interface FastifyInstance {
    io: Server;
  }
}
