import { Utils } from "../../utils";
import { Server } from "socket.io";

declare module "fastify" {
  interface FastifyRequest {
    utils: typeof Utils;
  }
  interface FastifyInstance {
    io: Server;
  }
}
