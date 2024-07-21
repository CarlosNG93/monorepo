import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { postController } from "../controllers/postController";

export const postRoutes: FastifyPluginCallback = (server: FastifyInstance, options: any, done: () => void) => {
  server.log.info("Registering post routes");
  postController(server);
  done();
};