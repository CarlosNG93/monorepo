import { FastifyInstance } from 'fastify';

import { PrismaUserRepository } from '../../persistence/prismaUserRepository';
import { AuthService } from '../../../app/services/authService';

const authService = new AuthService(new PrismaUserRepository());

export const authController = (server: FastifyInstance) => {
  server.post('/login', async (request, reply) => {
    const { email } = request.body as any;
    try {
      const token = await authService.login(email);
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