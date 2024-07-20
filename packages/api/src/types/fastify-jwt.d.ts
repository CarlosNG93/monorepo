
export interface MyJwtPayload {
    id: number;  
    email: string;
  }
  
  import 'fastify';
  import '@fastify/jwt';
  
  declare module 'fastify' {
    interface FastifyInstance {
      jwt: {
        sign(payload: any, options?: any): string;
        verify(token: string, options?: any): any;
      };
    }
  
    interface FastifyRequest {
      user: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
  