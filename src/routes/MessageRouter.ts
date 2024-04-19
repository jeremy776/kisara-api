import { FastifyInstance } from "fastify";
import { PostBodyMessage } from "@kisara/types/message/PostBodyMessage";
import PostBodyMessageSchema from "@kisara/schemas/message/PostBodyMessage.json";
import GetParamsMessageSchema from "@kisara/schemas/message/GetParamsMessage.json";
import PostDeleteParamsMessage2Schema from "@kisara/schemas/message/PostDeleteParamsMessage_2.json";
import PostBodyMessage2Schema from "@kisara/schemas/message/PostBodyMessage2.json";
import { prisma } from "@kisara/index";
import { GetParamsMessage } from "@kisara/types/message/GetParamsMessage";
import { PostBodyMessage2 } from "@kisara/types/message/PostBodyMessage2";
import { PostDeleteParamsMessage_2 } from "@kisara/types/message/PostDeleteParamsMessage_2";

export default async function (server: FastifyInstance): Promise<void> {
  server.post<{ Body: PostBodyMessage; Params: GetParamsMessage }>(
    "/:id",
    {
      schema: { body: PostBodyMessageSchema, params: GetParamsMessageSchema },
      preHandler: server.rateLimit({
        max: 45,
        timeWindow: 60 * 1000,
      }),
    },
    async (request, reply) => {
      const { message_content } = request.body;
      const { id } = request.params;
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
          createdAt: comment.createdAt,
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
          id: true,
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
        data: { author: { id: user.id, username: user.username, role: user.role }, comments: user.comments.reverse() },
      });
    },
  );

  server.delete<{ Params: PostDeleteParamsMessage_2 }>(
    "/:id/:reply_id",
    {
      schema: { params: PostDeleteParamsMessage2Schema },
      preHandler: server.rateLimit({
        max: 45,
        timeWindow: 60 * 1000,
      }),
    },
    async (request, reply) => {
      const { id: link_id, reply_id: comment_id } = request.params;

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
          id: comment_id,
        },
      });
      if (!comment) {
        return reply.code(404).send({
          statusCode: 404,
          name: "INVALID_COMMENT_ID",
          message: "Oops! 🙈 Sorry, we couldn't find that comment. If you need help, just let us know! 😊",
        });
      }

      const deleteReply = prisma.replyComment.deleteMany({
        where: {
          parentReplyId: comment.id,
        },
      });
      const deleteComment = prisma.comment.delete({
        where: {
          id: comment.id,
        },
      });

      await prisma.$transaction([deleteReply, deleteComment]);

      return reply.code(200).send({ statusCode: 200, name: "COMMENT_DELETED" });
    },
  );

  server.post<{ Params: PostDeleteParamsMessage_2; Body: PostBodyMessage2 }>(
    "/:id/:reply_id",
    {
      schema: { params: PostDeleteParamsMessage2Schema, body: PostBodyMessage2Schema },
      preHandler: server.rateLimit({
        max: 45,
        timeWindow: 60 * 1000,
      }),
    },
    async (request, reply) => {
      const { id: link_id, reply_id } = request.params;
      const { message_content } = request.body;

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
      if (!comment) {
        return reply.code(404).send({
          statusCode: 404,
          name: "INVALID_COMMENT_ID",
          message: "Oops! 🙈 Sorry, we couldn't find that comment. If you need help, just let us know! 😊",
        });
      }

      const replyComment = await prisma.replyComment.create({
        data: {
          message_content,
          parentReply: {
            connect: {
              id: comment.id,
            },
          },
        },
      });

      return reply.code(201).send({
        statusCode: 201,
        name: "REPLY_COMMENT_CREATED",
        data: {
          id: replyComment.id,
          message_content: replyComment.message_content,
          createdAt: replyComment.createdAt,
        },
      });
    },
  );
}
