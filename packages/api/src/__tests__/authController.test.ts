import { fastify, FastifyInstance } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { createAuthController } from '../adapters/http/controllers/authController';
import { AuthService } from '../app/services/authService';

class MockAuthService extends AuthService {
  login = jest.fn();
}

const buildServer = (authService: AuthService): FastifyInstance => {

  const server = fastify({ logger: false });
  server.register(fastifyJwt, { secret: 'supersecret' });

  createAuthController(server, authService);
  
  return server;
};

describe('authController', () => {
  let server: FastifyInstance;
  let mockAuthService: MockAuthService;

  beforeAll(async () => {
    mockAuthService = new MockAuthService({} as any); 
    server = buildServer(mockAuthService);
    await server.ready();
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a token on successful login', async () => {
    const token = 'fake-token';
    mockAuthService.login.mockResolvedValue(token);

    const response = await server.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: 'test@example.com',
        password: 'password',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ token });
  });

  it('should return 401 for invalid credentials', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

    const response = await server.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: 'test@example.com',
        password: 'wrong-password',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: 'Invalid credentials' });
  });

  it('should call authService.login with correct email and password', async () => {
    const email = 'test@example.com';
    const password = 'password';

    await server.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email,
        password,
      },
    });

    expect(mockAuthService.login).toHaveBeenCalledWith(email, password);
  });

  it('should return 500 for unexpected errors', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Unexpected error'));

    const response = await server.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: 'test@example.com',
        password: 'password',
      },
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ error: 'An unexpected error occurred' });
  });
});
