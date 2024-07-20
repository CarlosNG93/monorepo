import { FastifyRequest } from 'fastify';
import { JwtPayload } from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload | string;
  }
  interface FastifyInstance {
    io: SocketIOServer;
  }
}