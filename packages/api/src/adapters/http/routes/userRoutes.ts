import { FastifyInstance } from "fastify";
import { userController } from "../controllers/userController";

export const userRoutes = (server: FastifyInstance) => {
  userController(server);
};