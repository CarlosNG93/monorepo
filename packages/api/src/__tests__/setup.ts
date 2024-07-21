
import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';

const buildFastify = () => {
  const fastify = Fastify();

  fastify.register(fastifyJwt, { secret: 'supersecret' });

  return fastify;
};

export default buildFastify;
