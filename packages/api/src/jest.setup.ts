import fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { userController } from '../src/adapters/http/controllers/userController';

require('dotenv').config({ path: '../../.env' });

const buildServer = () => {
  const server = fastify();

  return server;
};

export { buildServer };