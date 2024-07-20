import fastify from 'fastify';
import { postRoutes } from '../adapters/http/routes/postRoutes';
import { userRoutes } from '../adapters/http/routes/userRoutes';
import fastifyJwt from '@fastify/jwt';
import fastifyMultipart from '@fastify/multipart';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';


const app = fastify({ logger: true });


app.register(fastifyJwt, {
  secret: 'supersecret'
});

app.register(fastifyMultipart);


app.setErrorHandler(function (error, request, reply) {
  
  reply.status(500).send({ message: 'Internal app error' });
});


app.register(userRoutes);
app.register(postRoutes);

app.get('/', async (request, reply) => {
  return { hello: 'world' };
});

const start = async () => {
  try {
    const server = createServer(app.server);
    const io = new SocketIOServer(server);

    io.on('connection', (socket) => {
      console.log('a user connected');
      socket.on('disconnect', () => {
        console.log('user disconnected');
      });
    });

    app.decorate('io', io);

    await server.listen(3000);
    console.log('Server listening on http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
