import { FastifyInstance } from 'fastify';
import { AuthService } from '../../../app/services/authService';
import { ROLE_ADMIN, ROLE_USER } from 'utilities/src/common/constants';
import { UserService } from '../../../app/services/userService';
import { PrismaUserRepository } from '../../persistence/prismaUserRepository';

const userService = new UserService(new PrismaUserRepository());

const createAuthController = (server: FastifyInstance, authService: AuthService) => {
  server.post('/login', {
    schema: {
      description: 'Authenticate a user',
      tags: ['Auth'],
      summary: 'Login a user',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Successful login',
          type: 'object',
          properties: {
            token: { type: 'string' }
          }
        },
        401: {
          description: 'Invalid credentials',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        500: {
          description: 'Unexpected error',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body as any;
    try {
      const token = await authService.login(email, password);
      reply.send({ token });
    } catch (err) {
      if (err instanceof Error && err.message === 'Invalid credentials') {
        reply.status(401).send({ error: err.message });
      } else {
        reply.status(500).send({ error: 'An unexpected error occurred' });
      }
    }
  });

  server.post('/signup', {
    schema: {
      description: 'Register a new user',
      tags: ['User'],
      summary: 'Sign up a new user',
      body: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string', enum: [ROLE_USER, ROLE_ADMIN] }
        }
      },
      response: {
        200: {
          description: 'Successful registration',
          type: 'object',
          properties: {
            token: { type: 'string' }
          }
        },
        400: {
          description: 'Invalid input',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { email, password, name, role } = request.body as any;
    server.log.info(`Signup attempt with email: ${email}`);
    try {
      const user = await userService.createUser(email, password, role, name);
      server.log.info(`User created with ID: ${user.id}`);
      const token = server.jwt.sign({ id: user.id, email: user.email, role: user.role });
      reply.send({ token });
    } catch (error: unknown) {
      server.log.error(error instanceof Error ? error.message : 'An unexpected error occurred');
      reply.status(400).send({ error: error instanceof Error ? error.message : 'An unexpected error occurred' });
    }
  });
};

export { createAuthController };
