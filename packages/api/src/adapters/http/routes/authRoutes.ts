import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import { createAuthController} from '../controllers/authController';

export const authRoutes: FastifyPluginCallback = (server: FastifyInstance, options: any, done: () => void) => {
  server.log.info('Registering auth routes');
  createAuthController(server, options.authService);
  done();
};
