import fastify from 'fastify';
import { userController } from '../adapters/http/controllers/userController';
import fastifyJwt from 'fastify-jwt';


const server = fastify({ logger: true });

// Registra plugins si los tienes
server.register(require('fastify-jwt'), {
  secret: 'your-secret-key'
});

// Opcional: Registrar un plugin para manejar errores globalmente
server.setErrorHandler(function (error, request, reply) {
  // Puedes decidir qué enviar basado en el error
  reply.status(500).send({ message: 'Internal server error' });
});

// Registrar rutas
server.register(userController);

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
