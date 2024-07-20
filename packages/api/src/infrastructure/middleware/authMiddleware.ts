import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

export type MyJwtPayload = {
  id: number; 
  email: string;
  role: string; 
};

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply, done: Function) => {
  try {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }
    const decoded = jwt.verify(token, 'supersecret') as MyJwtPayload;
    request.user = decoded;
    done();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
};


export const roleMiddleware = (requiredRole: string) => {
  return (request: FastifyRequest, reply: FastifyReply, done: Function) => {
    const user = request.user as MyJwtPayload;
    if (user.role !== requiredRole) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
    done();
  };
};
