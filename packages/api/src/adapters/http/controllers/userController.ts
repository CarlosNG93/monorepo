import { FastifyInstance } from 'fastify';
import { PrismaUserRepository } from '../../persistence/prismaUserRepository';
import { MyJwtPayload, authMiddleware } from '../../../infrastructure/middleware/authMiddleware';
import { UserService } from '../../../app/services/userService';


const userService = new UserService(new PrismaUserRepository());

export const userController = (server: FastifyInstance) => {
  server.post('/signup', async (request, reply) => {
    const { email, password, name } = request.body as any; // Incluye 'password' en el body
    const user = await userService.createUser(email, password, name);
    const token = server.jwt.sign({ id: user.id, email: user.email });
    return { token };
  });

  server.post('/login', async (request, reply) => {
    const { email, password } = request.body as any; // Incluye 'password' en el body
    const user = await userService.getUserByEmail(email);
    if (!user || !(await userService.validatePassword(password, user.password))) {
      return reply.status(400).send({ error: 'Invalid email or password' });
    }
    const token = server.jwt.sign({ id: user.id, email: user.email });
    return { token };
  });

  server.get('/profile', { preHandler: [authMiddleware] }, async (request, reply) => {
    if (!request.user || typeof request.user === 'string') {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const userPayload = request.user as MyJwtPayload;
    const user = await userService.getUserById(userPayload.id);
    return user;
  });

  server.put('/profile', { preHandler: [authMiddleware] }, async (request, reply) => {
    if (!request.user || typeof request.user === 'string') {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const { email, name } = request.body as any;
    const userPayload = request.user as MyJwtPayload;
    const user = await userService.updateUser(userPayload.id, email, name);
    return user;
  });

  server.delete('/profile', { preHandler: [authMiddleware] }, async (request, reply) => {
    if (!request.user || typeof request.user === 'string') {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const userPayload = request.user as MyJwtPayload;
    await userService.deleteUser(userPayload.id);
    return { message: 'User deleted' };
  });
};
