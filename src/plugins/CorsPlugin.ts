import fastifyCors, { FastifyCorsOptions } from "@fastify/cors";
import FastifyPlugin from "fastify-plugin";

/**
 * This code snippet is exporting a Fastify plugin that enables CORS (Cross-Origin Resource Sharing) functionality in a Fastify server. Here's a breakdown of what `export default fp<FastifyCorsOptions>(async (server) => {` is doing:
 *
 * @property
 * @name default
 * @kind variable
 * @type {FastifyPluginCallback<FastifyCorsOptions, RawServerDefault, FastifyTypeProviderDefault, FastifyBaseLogger>}
 * @exports
 */
export default FastifyPlugin<FastifyCorsOptions>(async (server) => {
  await server.register(fastifyCors, {
    origin: ["*"],
  });
});
