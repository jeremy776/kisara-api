import RateLimit, { RateLimitOptions } from "@fastify/rate-limit";
import FastifyPlugin from "fastify-plugin";

/**
 * This code snippet is exporting a default Fastify plugin that includes rate-limiting functionality. Here's a breakdown of what `export default FastifyPlugin<RateLimitOptions>(async (server) => {` is doing:
 *
 * @property
 * @name default
 * @kind variable
 * @type {FastifyPluginCallback<RateLimitOptions, RawServerDefault, FastifyTypeProviderDefault, FastifyBaseLogger>}
 * @exports
 */
export default FastifyPlugin<RateLimitOptions>(async (server) => {
  await server.register(RateLimit, {
    global: true,
    max: 60,
    timeWindow: 60 * 1000,
    addHeaders: {
      "x-ratelimit-limit": true,
      "x-ratelimit-remaining": true,
      "x-ratelimit-reset": true,
      "retry-after": true,
    },
    errorResponseBuilder: function (_request, context) {
      return {
        statusCode: 429,
        error: "Too Many Requests",
        message: `"Oops! Looks like you've reached our request limit. Take a breather, and you'll be good to go again soon!"`,
        date: Date.now(),
        expiresIn: context.ttl,
      };
    },
  });
});
