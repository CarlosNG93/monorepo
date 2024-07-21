import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import { authController } from '../controllers/authController';

export const authRoutes: FastifyPluginCallback = (server: FastifyInstance, options: any, done: () => void) => {
  server.log.info('Registering auth routes');
  authController(server);
  done();
};
