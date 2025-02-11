import { FastifyInstance } from 'fastify';
import { PrismaUserRepository } from '../../persistence/prismaUserRepository';
import { MyJwtPayload, authMiddleware, roleMiddleware } from '../../../infrastructure/middleware/authMiddleware';
import { UserService } from '../../../app/services/userService';
import fs from 'fs';
import path from 'path';
import{ ROLE_ADMIN, ROLE_USER} from 'utilities/src/common/constants';

const userService = new UserService(new PrismaUserRepository());

export const userController = (server: FastifyInstance) => {
  

  server.get('/profile', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Get user profile',
      tags: ['User'],
      summary: 'Fetch the profile of the currently authenticated user',
      response: {
        200: {
          description: 'User profile',
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string' }
          }
        },
        401: {
          description: 'Unauthorized',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        500: {
          description: 'Internal Server Error',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    if (!request.user || typeof request.user === 'string') {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const userPayload = request.user as MyJwtPayload;
    try {
      const user = await userService.getUserById(userPayload.id);
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      console.log("usuario", user);
      reply.send({
        id: user.id,
        email: user.email,
        name: user.name || '',  
        role: user.role
      });
    } catch (error: unknown) {
      server.log.error(error instanceof Error ? error.message : 'Failed to fetch user profile');
      reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to fetch user profile' });
    }
  });
  
  

  server.put('/profile', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Update user profile',
      tags: ['User'],
      summary: 'Update the profile of the currently authenticated user',
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          password: { type: 'string' },
          role: { type: 'string', enum: ['user', 'admin'] },
          profilePicture: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Successful update',
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string' },
            profilePicture: { type: 'string' }
          }
        },
        401: {
          description: 'Unauthorized',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        500: {
          description: 'Internal Server Error',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    if (!request.user || typeof request.user === 'string') {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const { email, name, password, role, profilePicture } = request.body as any;
    const userPayload = request.user as MyJwtPayload;
    try {
      const user = await userService.updateUser(userPayload.id, email, password, role, name, profilePicture);
      server.websocketServer?.clients.forEach((client: { readyState: any; OPEN: any; send: (arg0: string) => void; }) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ type: 'updatedUser', data: user }));
        }
      });
      reply.send({
        id: user.id,
        email: user.email,
        name: user.name || '',
        role: user.role,
        profilePicture: user.profilePicture || ''
      });
    } catch (error: unknown) {
      server.log.error(error instanceof Error ? error.message : 'Failed to update user profile');
      reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to update user profile' });
    }
  });
  
  
  server.delete('/profile', {
    preHandler: [authMiddleware, roleMiddleware(ROLE_ADMIN)],
    schema: {
      description: 'Delete user profile',
      tags: ['User'],
      summary: 'Delete the profile of the currently authenticated user',
      response: {
        200: {
          description: 'Successful deletion',
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        401: {
          description: 'Unauthorized',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        500: {
          description: 'Internal Server Error',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
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

  server.get('/users', {
    preHandler: [authMiddleware, roleMiddleware(ROLE_ADMIN)],
    schema: {
      description: 'Get all users',
      tags: ['User'],
      summary: 'Fetch all users',
      response: {
        200: {
          description: 'List of users',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              email: { type: 'string', format: 'email' },
              name: { type: 'string' },
              role: { type: 'string' }
            }
          }
        },
        401: {
          description: 'Unauthorized',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        500: {
          description: 'Internal Server Error',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const users = await userService.getAllUsers();
      reply.send(users);
    } catch (error: unknown) {
      server.log.error(error instanceof Error ? error.message : 'Failed to fetch users');
      reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to fetch users' });
    }
  });

  server.post('/profile/picture', {
    preHandler: [authMiddleware],
    schema: {
      description: 'Upload a profile picture',
      tags: ['User'],
      summary: 'Upload a profile picture for the currently authenticated user',
      response: {
        200: {
          description: 'Successful upload',
          type: 'object',
          properties: {
            message: { type: 'string' },
            filePath: { type: 'string' }
          }
        },
        400: {
          description: 'No file uploaded',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        500: {
          description: 'Internal Server Error',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
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
  
      if (fs.existsSync(filePath)) {
        return reply.status(400).send({ error: 'File exist' });
      }
      await new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(filePath);
        data.file.pipe(fileStream);
  
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
      });
  
     
      await userService.updateProfilePicture(userPayload.id, filePath);
      server.websocketServer?.clients.forEach((client: { readyState: any; OPEN: any; send: (arg0: string) => void; }) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ type: 'updatedProfilePicture', data: { userId: userPayload.id, filePath } }));
        }
      });
  
      return reply.send({ message: 'Successful upload', filePath });
    } catch (error) {
      server.log.error('Error:', error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
};
