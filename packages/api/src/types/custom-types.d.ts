import 'fastify';
import { JwtPayload } from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload | { id: number; email: string; role: string };
  }

  interface FastifyInstance {
    jwt: {
      sign(payload: any, options?: any): string;
      verify(token: string, options?: any): any;
    };
    io: SocketIOServer;
  }
}
