import Fastify from 'fastify';
import { authController } from '../adapters/http/controllers/authController';



const mockAuthService = {
  login: jest.fn(),
};


const server = Fastify();

server.register(authController);

describe('authController', () => {
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
});
