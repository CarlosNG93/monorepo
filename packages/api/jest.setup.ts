import { FastifyInstance } from 'fastify';
import fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { userController } from './src/adapters/http/controllers/userController';



let server: FastifyInstance;

beforeEach(() => {
  server = fastify();
  server.register(fastifyJwt, { secret: 'supersecret' }); 
  userController(server);
});


export { server };
