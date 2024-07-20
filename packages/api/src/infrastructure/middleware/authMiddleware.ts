import { FastifyRequest, FastifyReply } from 'fastify';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply, done: Function) => {
  try {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }
    const decoded = jwt.verify(token, 'supersecret') as JwtPayload;
    request.user = decoded;
    done();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
};
