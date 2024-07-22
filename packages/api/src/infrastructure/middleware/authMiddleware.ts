import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

export type MyJwtPayload = {
  id: number;
  email: string;
  role: string;
};

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      console.error('No token provided');
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }
    const decoded = jwt.verify(token, 'supersecret') as MyJwtPayload;
    request.user = decoded;
    console.log('User authenticated', decoded);
  } catch (err) {
    console.error('Token verification failed', err);
    reply.status(401).send({ error: 'Unauthorized' });
  }
};

export const roleMiddleware = (requiredRole: string) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as MyJwtPayload;
    if (user.role !== requiredRole) {
      console.error(`User role ${user.role} does not match required role ${requiredRole}`);
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    console.log('User authorized', user);
  };
};
