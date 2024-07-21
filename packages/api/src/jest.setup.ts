import fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { userController } from '../src/adapters/http/controllers/userController';

const buildServer = () => {
  const server = fastify();
  server.register(fastifyJwt, { secret: 'supersecret' });
  userController(server);
  return server;
};

export { buildServer };
