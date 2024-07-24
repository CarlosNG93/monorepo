import fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import fastifyWebSocket from '@fastify/websocket';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import path from 'path';
import { userRoutes } from '../adapters/http/routes/userRoutes';
import { postRoutes } from '../adapters/http/routes/postRoutes';
import { authRoutes } from '../adapters/http/routes/authRoutes';
import dotenv from 'dotenv';

dotenv.config();

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

app.register(fastifySwagger as any, {
  routePrefix: '/swagger',
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      description: 'API documentation for the project',
      version: '0.1.0'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'monorepo.carltech.es',
        description: 'Production server'
      }
    ],
    tags: [
      { name: 'User', description: 'User related end-points' },
      { name: 'Post', description: 'Post related end-points' },
      { name: 'Auth', description: 'Authentication end-points' }
    ],
    components: {
      securitySchemes: {
        apiKey: {
          type: 'apiKey',
          name: 'apiKey',
          in: 'header'
        }
      }
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here'
    }
  },
  exposeRoute: true
});


app.register(fastifySwaggerUi as any, {
  routePrefix: '/docs',
  swagger: {
    url: '/swagger/openapi.json'
  },
  uiConfig: {
    docExpansion: 'none',
    deepLinking: false
  },
  staticCSP: true,
  transformStaticCSP: (header: any) => header,
});


app.register(fastifyJwt, {
  secret: 'supersecret'
});

app.register(fastifyMultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024 
  }
});

app.register(fastifyStatic, {
  root: path.join(__dirname, '../../public'),
  prefix: '/public/',
});

app.register(fastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
});

app.register(fastifyWebSocket);


app.get('/ws', { websocket: true }, (connection) => {
  console.log('Client connected');
  console.log('WebSocket clients count:', app.websocketServer?.clients.size);

  connection.socket.on('message', (message: any) => {
    console.log('Received message:', message);
  });

  connection.socket.on('error', (error: any) => {
    console.error('WebSocket error:', error);
  });

  connection.socket.on('close', () => {
    console.log('Client disconnected');
    console.log('WebSocket clients count:', app.websocketServer?.clients.size);
  });

  setInterval(() => {
    console.log('Sending messages to all clients');
    
    if (!app.websocketServer?.clients.size) {
      console.log('No WebSocket clients connected');
      return;
    }

    app.websocketServer?.clients.forEach((client: { readyState: any; OPEN: any; send: (arg0: string) => void; }) => {
      if (client.readyState === client.OPEN) {
        console.log('Sending message to client:', client);
        try {
          client.send(JSON.stringify({ type: 'postCreated', data: { id: 1, title: 'New Post' } }));
          client.send(JSON.stringify({ type: 'postUpdated', data: { id: 1, title: 'Updated Post Title' } }));
          client.send(JSON.stringify({ type: 'postDeleted', data: { id: 1 } }));
          client.send(JSON.stringify({ type: 'userCreated', data: { id: 1, name: 'New User', email: 'newuser@example.com' } }));
          client.send(JSON.stringify({ type: 'userUpdated', data: { id: 1, name: 'Updated User', email: 'updateduser@example.com' } }));
          client.send(JSON.stringify({ type: 'userDeleted', data: { id: 1 } }));
          client.send(JSON.stringify({ type: 'profilePictureUpdated', data: { userId: 1, pictureUrl: 'http://example.com/newpicture.jpg' } }));
          client.send(JSON.stringify({ type: 'genericNotification', data: { message: 'This is a generic notification' } }));
          client.send(JSON.stringify({ type: 'customEvent', data: { customData: 'This is some custom event data' } }));
        } catch (err) {
          console.error('Error sending message:', err);
        }
      } else {
        console.log('Client not ready for sending:', client.readyState);
      }
    });
  }, 5000);
});



app.register(userRoutes);
app.register(postRoutes);
app.register(authRoutes);

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
