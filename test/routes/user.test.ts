import tap from "tap";
import { fastify, prisma } from "../../src";

const server = fastify();
const username = "jsoahsjshj";
const password = "sjwijjjsjwokwkwowo2992929_28dfdsw";
const generateLinkId = Math.random().toString(36).slice(2, 7);

tap.teardown(async () => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (user) await prisma.user.delete({ where: { username } });

  await server.close();
});

tap.test("[GET] `/user/:id` route", async (t) => {
  const user = await prisma.user.create({
    data: {
      username,
      password,
      link_id: generateLinkId,
    },
  });

  await t.test("check invalid id", async (t) => {
    const response = await server.inject({
      method: "GET",
      url: "/user/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });

    t.equal(response.statusCode, 404);
    t.match(response.json(), { name: "INVALID_USER_ID" });
  });

  await t.test("success get user", async (t) => {
    const response = await server.inject({
      method: "GET",
      url: `/user/${user.id}`,
    });

    t.equal(response.statusCode, 200);
    t.match(response.json(), { name: "SUCCESS" });
  });
});
