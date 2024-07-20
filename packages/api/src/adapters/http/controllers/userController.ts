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
    const user = await userService.createUser(email, password, role, name);
    const token = server.jwt.sign({ id: user.id, email: user.email, role: user.role });
    server.io.emit('newUser', user);
    return { token };
  });

  server.post('/login', async (request, reply) => {
    const { email, password } = request.body as any;
    const user = await userService.getUserByEmail(email);
    if (!user || !(await userService.validatePassword(password, user.password))) {
      return reply.status(400).send({ error: 'Invalid email or password' });
    }
    const token = server.jwt.sign({ id: user.id, email: user.email, role: user.role });
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
    const { email, name, password, role } = request.body as any;
    const userPayload = request.user as MyJwtPayload;
    const user = await userService.updateUser(userPayload.id, email, password, role, name);
    server.io.emit('updatedUser', user);
    return user;
  });

  server.delete('/profile', { preHandler: [authMiddleware, roleMiddleware('admin')] }, async (request, reply) => {
    if (!request.user || typeof request.user === 'string') {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const userPayload = request.user as MyJwtPayload;
    await userService.deleteUser(userPayload.id);
    server.io.emit('deletedUser', userPayload.id);
    return { message: 'User deleted' };
  });

  server.get('/users', { preHandler: [authMiddleware, roleMiddleware('admin')] }, async (request, reply) => {
    const users = await userService.getAllUsers();
    return users;
  });

  server.post('/profile/picture', { preHandler: [authMiddleware] }, async (request, reply) => {
    const userPayload = request.user as MyJwtPayload;
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

    await data.file.pipe(fileStream);

    fileStream.on('close', async () => {
      await userService.updateProfilePicture(userPayload.id, filePath);
      server.io.emit('updatedProfilePicture', { userId: userPayload.id, filePath });
      return reply.status(200).send({ message: 'File uploaded successfully', filePath });
    });

    fileStream.on('error', (err) => {
      return reply.status(500).send({ error: 'Failed to save file' });
    });
  });
};
