import { FastifyInstance } from "fastify";
import { postController } from "../controllers/postController";

export const postRoutes = (server: FastifyInstance) => {
  postController(server);
};