import fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import { userRoutes } from '../adapters/http/routes/userRoutes';
import { postRoutes } from '../adapters/http/routes/postRoutes';
import path from 'path';

const app = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  }
});

app.register(fastifyJwt, {
  secret: 'supersecret'
});

app.register(fastifyMultipart);

app.register(fastifyStatic, {
  root: path.join(__dirname, '../../public'),
  prefix: '/public/',
});

app.register(fastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"]
});

app.register(userRoutes);
app.register(postRoutes);

app.get('/test', async (request, reply) => {
  reply.send({ test: 'Server is working correctly' });
});

const start = async () => {
  try {
    app.log.info('Starting the server');
    await app.listen({ port: 3000, host: '0.0.0.0' });
    app.log.info(`Server listening on http://localhost:3000`);

    app.log.info('Registered routes:');
    app.printRoutes();
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
