import { FastifyInstance } from 'fastify';
import { PrismaUserRepository } from '../../persistence/prismaUserRepository';
import { MyJwtPayload, authMiddleware, roleMiddleware } from '../../../infrastructure/middleware/authMiddleware';
import { UserService } from '../../../app/services/userService';
import fs from 'fs';
import path from 'path';

const userService = new UserService(new PrismaUserRepository());

export const userController = (server: FastifyInstance) => {
  server.post('/signup', async (request, reply) => {
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

  server.post('/login', async (request, reply) => {
    const { email, password } = request.body as any;
    try {
      const user = await userService.getUserByEmail(email);
      if (!user || !(await userService.validatePassword(password, user.password))) {
        return reply.status(400).send({ error: 'Invalid email or password' });
      }
      const token = server.jwt.sign({ id: user.id, email: user.email, role: user.role });
      reply.send({ token });
    } catch (error: unknown) {
      server.log.error(error instanceof Error ? error.message : 'An unexpected error occurred');
      reply.status(400).send({ error: error instanceof Error ? error.message : 'An unexpected error occurred' });
    }
  });

  server.get('/profile', { preHandler: [authMiddleware] }, async (request, reply) => {
    if (!request.user || typeof request.user === 'string') {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const userPayload = request.user as MyJwtPayload;
    try {
      const user = await userService.getUserById(userPayload.id);
      reply.send(user);
    } catch (error: unknown) {
      server.log.error(error instanceof Error ? error.message : 'Failed to fetch user profile');
      reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to fetch user profile' });
    }
  });

  server.put('/profile', { preHandler: [authMiddleware] }, async (request, reply) => {
    if (!request.user || typeof request.user === 'string') {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const { email, name, password, role } = request.body as any;
    const userPayload = request.user as MyJwtPayload;
    try {
      const user = await userService.updateUser(userPayload.id, email, password, role, name);
      server.websocketServer?.clients.forEach((client: { readyState: any; OPEN: any; send: (arg0: string) => void; }) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ type: 'updatedUser', data: user }));
        }
      });
      reply.send(user);
    } catch (error: unknown) {
      server.log.error(error instanceof Error ? error.message : 'Failed to update user profile');
      reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to update user profile' });
    }
  });

  server.delete('/profile', { preHandler: [authMiddleware, roleMiddleware('admin')] }, async (request, reply) => {
    if (!request.user || typeof request.user === 'string') {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const userPayload = request.user as MyJwtPayload;
    try {
      await userService.deleteUser(userPayload.id);
      server.websocketServer?.clients.forEach((client: { readyState: any; OPEN: any; send: (arg0: string) => void; }) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ type: 'deletedUser', data: userPayload.id }));
        }
      });
      reply.send({ message: 'User deleted' });
    } catch (error: unknown) {
      server.log.error(error instanceof Error ? error.message : 'Failed to delete user');
      reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to delete user' });
    }
  });

  server.get('/users', { preHandler: [authMiddleware, roleMiddleware('admin')] }, async (request, reply) => {
    try {
      const users = await userService.getAllUsers();
      reply.send(users);
    } catch (error: unknown) {
      server.log.error(error instanceof Error ? error.message : 'Failed to fetch users');
      reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to fetch users' });
    }
  });

  server.post('/profile/picture', { preHandler: [authMiddleware] }, async (request, reply) => {
    const userPayload = request.user as MyJwtPayload;
    try {
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }

      const uploadDir = path.join(__dirname, '../../../../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, `${userPayload.id}-${data.filename}`);
      const fileStream = fs.createWriteStream(filePath);

      data.file.pipe(fileStream);

      fileStream.on('finish', async () => {
        await userService.updateProfilePicture(userPayload.id, filePath);
        server.websocketServer?.clients.forEach((client: { readyState: any; OPEN: any; send: (arg0: string) => void; }) => {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify({ type: 'updatedProfilePicture', data: { userId: userPayload.id, filePath } }));
          }
        });
        reply.send({ message: 'File uploaded successfully', filePath });
      });

      fileStream.on('error', (err) => {
        server.log.error('Failed to save file:', err);
        reply.status(500).send({ error: 'Failed to save file' });
      });
    } catch (error: unknown) {
      server.log.error(error instanceof Error ? error.message : 'Failed to process file upload');
      reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to process file upload' });
    }
  });
};
