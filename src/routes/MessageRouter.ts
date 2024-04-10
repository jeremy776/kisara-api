import { FastifyInstance } from "fastify";
import { PostBodyMessage } from "../types/message/PostBodyMessage";
import PostBodyMessageSchema from "../schemas/message/PostBodyMessage.json";
import GetParamsMessageSchema from "../schemas/message/GetParamsMessage.json";
import GetParamsMessage2Schema from "../schemas/message/GetParamsMessage_2.json";
import { prisma } from "../index";
import { GetParamsMessage } from "../types/message/GetParamsMessage";
import { GetParamsMessage_2 } from "types/message/GetParamsMessage_2";

export default async function (server: FastifyInstance): Promise<void> {
  server.post<{ Body: PostBodyMessage }>(
    "/",
    {
      schema: { body: PostBodyMessageSchema },
      preHandler: server.rateLimit({
        max: 45,
        timeWindow: 60 * 1000,
      }),
    },
    async (request, reply) => {
      const { message_content, link_id: id } = request.body;
      const user = await prisma.user.findUnique({ where: { link_id: id } });

      if (!user) {
        return reply.code(404).send({
          statusCode: 404,
          name: "INVALID_LINK_ID",
          message: "Oops! It looks like the message link ID you entered doesn't lead anywhere. 🧐",
        });
      }

      const comment = await prisma.comment.create({
        data: { message_content, parentComment: { connect: { id: user.id } } },
      });

      return reply.code(201).send({
        statusCode: 201,
        name: "MESSAGE_CREATED",
        data: {
          id: comment.id,
          created_at: comment.createdAt,
          message_content: comment.message_content,
        },
      });
    },
  );

  server.get<{ Params: GetParamsMessage }>(
    "/:id",
    {
      schema: { params: GetParamsMessageSchema },
      preHandler: server.rateLimit({
        max: 45,
        timeWindow: 60 * 1000,
      }),
    },
    async (request, reply) => {
      const { id: link_id } = request.params;

      const user = await prisma.user.findUnique({
        where: {
          link_id,
        },
        select: {
          username: true,
          role: true,
          comments: {
            select: {
              message_content: true,
              createdAt: true,
              id: true,
              ReplyComment: {
                select: {
                  message_content: true,
                  createdAt: true,
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        return reply.code(404).send({
          statusCode: 404,
          name: "INVALID_LINK_ID",
          message: "Oops! It looks like the message link ID you entered doesn't lead anywhere. 🧐",
        });
      }

      return reply.code(200).send({
        statusCode: 200,
        name: "SUCCESS",
        data: { author: { username: user.username, role: user.role }, comments: user.comments },
      });
    },
  );

  server.post<{ Params: GetParamsMessage_2 }>(
    "/:id/:reply_id",
    {
      schema: { params: GetParamsMessage2Schema },
      preHandler: server.rateLimit({
        max: 45,
        timeWindow: 60 * 1000,
      }),
    },
    async (request, reply) => {
      const { id: link_id, reply_id } = request.params;

      const user = await prisma.user.findUnique({
        where: {
          link_id,
        },
      });

      if (!user) {
        return reply.code(404).send({
          statusCode: 404,
          name: "INVALID_LINK_ID",
          message: "Oops! It looks like the message link ID you entered doesn't lead anywhere. 🧐",
        });
      }

      const comment = await prisma.comment.findUnique({
        where: {
          id: reply_id,
        },
      });
      if (!comment) return;
    },
  );
}
