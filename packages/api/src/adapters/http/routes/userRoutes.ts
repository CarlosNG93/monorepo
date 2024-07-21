import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import { userController } from '../controllers/userController';

export const userRoutes: FastifyPluginCallback = (server: FastifyInstance, options: any, done: () => void) => {
  server.log.info('Registering user routes');
  userController(server);
  done(); 
};
