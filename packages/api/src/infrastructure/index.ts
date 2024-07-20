import fastify from 'fastify';
import { postRoutes } from '../adapters/http/routes/postRoutes';
import { userRoutes } from '../adapters/http/routes/userRoutes';


const server = fastify({ logger: true });


server.register(require('fastify-jwt'), {
  secret: 'your-secret-key'
});


server.setErrorHandler(function (error, request, reply) {
  
  reply.status(500).send({ message: 'Internal server error' });
});


server.register(userRoutes);
server.register(postRoutes);

server.get('/', async (request, reply) => {
  return { hello: 'world' };
});

const start = async () => {
  try {
    await server.listen({ port: 3000 });
    console.log('Server listening on http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
