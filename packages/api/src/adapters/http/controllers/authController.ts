import { FastifyInstance } from 'fastify';
import { AuthService } from '../../../app/services/authService';
import { PrismaUserRepository } from '../../persistence/prismaUserRepository';

const authService = new AuthService(new PrismaUserRepository());

export const authController = (server: FastifyInstance) => {
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
        }
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body as any;
    try {
      const token = await authService.login(email, password);
      reply.send({ token });
    } catch (err) {
      if (err instanceof Error) {
        reply.status(401).send({ error: err.message });
      } else {
        reply.status(500).send({ error: 'An unexpected error occurred' });
      }
    }
  });
};
