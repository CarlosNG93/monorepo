import { FastifyInstance } from 'fastify';
import { authController } from '../controllers/authController';

export const authRoutes = (server: FastifyInstance) => {
  authController(server);
};
