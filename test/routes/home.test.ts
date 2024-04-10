import tap from "tap";
import { fastify } from "../../src/index.ts";

const server = fastify();
tap.teardown(async () => await server.close());

tap.test("[GET] `/` route", async (t) => {
  const response = await server.inject({
    method: "GET",
    url: "/",
  });

  t.equal(response.statusCode, 200);
  t.match(response.json(), {
    name: "KiSaRa",
  });
});
