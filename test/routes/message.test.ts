import tap from "tap";
import { ExportLogger, fastify, prisma } from "../../src/index.ts";
import { Utils } from "../../src/utils/index.ts";

const server = fastify();
const username = "jsoahsjsj";
const password = "sjwijjjsjwokwkwowo2992929_28ddsw";
const generateLinkId = Math.random().toString(36).slice(2, 7);

tap.teardown(async () => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (user) await prisma.user.delete({ where: { username } });

  await server.close();
});

tap.test("[POST] `/message` route", async (t) => {
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
      url: "/message",
      payload: { message_content: "dummy", link_id: "dummylinkid" },
    });

    t.equal(response.statusCode, 404);
    t.match(response.json(), { name: "INVALID_LINK_ID" });
  });

  await t.test("create message", async (t) => {
    const response = await server.inject({
      method: "POST",
      url: "/message",
      payload: { message_content: "dummy", link_id: generateLinkId },
    });

    t.equal(response.statusCode, 201);
    t.match(response.json(), { name: "MESSAGE_CREATED" });
  });
});

tap.test("[GET] '/:id route'", async (t) => {
  t.test("check invalid link id", async (t) => {
    const response = await server.inject({
      method: "GET",
      url: "/message/powjsd",
    });

    t.equal(response.statusCode, 404);
    t.match(response.json(), { name: "INVALID_LINK_ID" });
  });

  t.test("get data message", async (t) => {
    const user = await prisma.user.findUnique({ where: { username } });
    const response = await server.inject({
      method: "GET",
      url: `/message/${user?.link_id}`,
    });

    t.equal(response.statusCode, 200);
    t.match(response.json(), { name: "SUCCESS" });
  });
});
