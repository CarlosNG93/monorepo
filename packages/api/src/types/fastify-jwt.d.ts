
export interface MyJwtPayload {
    id: number;  
    email: string;
  }
  
  import 'fastify';
  import { FastifyPluginCallback } from 'fastify';
  
  declare module 'fastify' {
    interface FastifyInstance {
      jwt: {
        sign: (payload: any, options?: any) => string;
        verify: (token: string, options?: any) => any;
      };
    }
  }
  
  declare module 'fastify-jwt';
  