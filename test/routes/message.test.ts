import tap from "tap";
import { fastify, prisma } from "../../src/index.ts";

const server = fastify();
const username = "jsoahsjsj";
const password = "sjwijjjsjwokwkwowo2992929_28ddsw";
const generateLinkId = Math.random().toString(36).slice(2, 7);

tap.teardown(async () => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (user) await prisma.user.delete({ where: { username } });

  await server.close();
});

tap.test("[POST] `/:id` route", async (t) => {
  await prisma.user.create({
    data: {
      username,
      password,
      link_id: generateLinkId,
    },
  });

  await t.test("check invalid link", async (t) => {
    const response = await server.inject({
      method: "POST",
      url: `/message/dummylinkid`,
      payload: { message_content: "dummy" },
    });

    t.equal(response.statusCode, 404);
    t.match(response.json(), { name: "INVALID_LINK_ID" });
  });

  await t.test("create message", async (t) => {
    const response = await server.inject({
      method: "POST",
      url: `/message/${generateLinkId}`,
      payload: { message_content: "dummy" },
    });

    t.equal(response.statusCode, 201);
    t.match(response.json(), { name: "MESSAGE_CREATED" });
  });
});

tap.test("[GET] '/:id route'", async (t) => {
  await t.test("check invalid link id", async (t) => {
    const response = await server.inject({
      method: "GET",
      url: "/message/powjsd",
    });

    t.equal(response.statusCode, 404);
    t.match(response.json(), { name: "INVALID_LINK_ID" });
  });

  await t.test("get data message", async (t) => {
    const user = await prisma.user.findUnique({ where: { username } });
    const response = await server.inject({
      method: "GET",
      url: `/message/${user?.link_id}`,
    });

    t.equal(response.statusCode, 200);
    t.match(response.json(), { name: "SUCCESS" });
  });
});

tap.test("[POST] '/:id/:reply_id route'", async (t) => {
  await t.test("check invalid link id", async (t) => {
    const response = await server.inject({
      method: "POST",
      url: "/message/psidwisi/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      payload: { message_content: "hai" },
    });

    t.equal(response.statusCode, 404);
    t.match(response.json(), { name: "INVALID_LINK_ID" });
  });

  const user = await prisma.user.findUnique({ where: { link_id: generateLinkId } });

  const commentCreate = await prisma.comment.create({
    data: { message_content: "halooo", parentComment: { connect: { id: user!.id } } },
  });

  await t.test("check invalid reply_id comment", async (t) => {
    const response = await server.inject({
      method: "POST",
      url: `/message/${generateLinkId}/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`,
      payload: { message_content: "aaa" },
    });

    t.equal(response.statusCode, 404);
    t.match(response.json(), { name: "INVALID_COMMENT_ID" });
  });

  await t.test("create commemt", async (t) => {
    const response = await server.inject({
      method: "POST",
      url: `/message/${generateLinkId}/${commentCreate.id}`,
      payload: { message_content: "haiii" },
    });

    t.equal(response.statusCode, 201);
    t.match(response.json(), { name: "REPLY_COMMENT_CREATED" });
  });
});

tap.test("[DELETE] '/:id/:reply_id route'", async (t) => {
  await t.test("check invalid link id", async (t) => {
    const response = await server.inject({
      method: "DELETE",
      url: "/message/powjsiid/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });

    t.equal(response.statusCode, 404);
    t.match(response.json(), { name: "INVALID_LINK_ID" });
  });

  const user = await prisma.user.findUnique({ where: { link_id: generateLinkId } });

  const commentCreate = await prisma.comment.create({
    data: { message_content: "haloo", parentComment: { connect: { id: user!.id } } },
  });

  await t.test("check invalid reply_id comment", async (t) => {
    const response = await server.inject({
      method: "DELETE",
      url: `/message/${generateLinkId}/aaaaaabbbbcccccccccccccccccccccc`,
    });

    t.equal(response.statusCode, 404);
    t.match(response.json(), { name: "INVALID_COMMENT_ID" });
  });

  await t.test("delete comment", async (t) => {
    const response = await server.inject({
      method: "DELETE",
      url: `/message/${generateLinkId}/${commentCreate.id}`,
    });

    t.equal(response.statusCode, 200);
    t.match(response.json(), { name: "COMMENT_DELETED" });
  });
});
