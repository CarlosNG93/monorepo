import { UserService } from '../app/services/userService';
import { server } from '../../jest.setup';
import { FastifyReply, FastifyRequest } from 'fastify';


jest.mock('../src/services/userService');  
jest.mock('../src/persistence/prismaUserRepository'); 

const mockCreateUser = jest.fn();
const mockSign = jest.fn();
const mockUserService = UserService as jest.MockedClass<typeof UserService>;

beforeEach(() => {
  mockUserService.mockClear();
  mockCreateUser.mockClear();
  mockSign.mockClear();

  mockUserService.prototype.createUser = mockCreateUser;
});

describe('UserController', () => {
  test('POST /signup - Successful signup', async () => {
    const email = 'test@example.com';
    const password = 'password';
    const name = 'Test User';
    const role = 'user';
    const token = 'fake-jwt-token';

    mockCreateUser.mockResolvedValueOnce({ id: '1', email, role, name });
    server.jwt.sign = mockSign.mockReturnValue(token);

    const response = await server.inject({
      method: 'POST',
      url: '/signup',
      payload: { email, password, name, role },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ token });
    expect(mockCreateUser).toHaveBeenCalledWith(email, password, role, name);
    expect(mockSign).toHaveBeenCalledWith({ id: '1', email, role }, { expiresIn: '1h' });
  });

  test('POST /signup - Error during signup', async () => {
    const email = 'test@example.com';
    const password = 'password';
    const name = 'Test User';
    const role = 'user';

    mockCreateUser.mockRejectedValueOnce(new Error('User creation failed'));

    const response = await server.inject({
      method: 'POST',
      url: '/signup',
      payload: { email, password, name, role },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: 'User creation failed' });
  });
});

test('GET /profile - Successful profile retrieval', async () => {
    const user = { id: '1', email: 'test@example.com', name: 'Test User', role: 'user' };
    const userPayload = { id: '1', email: 'test@example.com', role: 'user' };
    
    server.jwt.verify = jest.fn().mockReturnValue(userPayload);
    mockUserService.prototype.getUserById = jest.fn().mockResolvedValue(user);
  
    const response = await server.inject({
      method: 'GET',
      url: '/profile',
      headers: {
        authorization: 'Bearer fake-jwt-token'
      }
    });
  
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(user);
  });
  
  test('DELETE /profile - Successful profile deletion', async () => {
    const userPayload = { id: '1', email: 'test@example.com', role: 'user' };
  
    mockUserService.prototype.deleteUser = jest.fn().mockResolvedValue(undefined);
    server.jwt.verify = jest.fn().mockReturnValue(userPayload);
  
    const response = await server.inject({
      method: 'DELETE',
      url: '/profile',
      headers: {
        authorization: 'Bearer fake-jwt-token'
      }
    });
  
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ message: 'User deleted' });
  });
  