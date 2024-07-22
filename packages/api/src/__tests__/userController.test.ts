import supertest from 'supertest';
import { PrismaClient } from '@prisma/client';
import { buildServer } from '../jest.setup';
import fastifyJwt from '@fastify/jwt';
import { userController } from '../adapters/http/controllers/userController';

const prisma = new PrismaClient();
const server = buildServer();

server.register(fastifyJwt, { secret: 'supersecret' });
userController(server);

beforeAll(async () => {
  await server.ready();
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      { id: 1, email: 'user1@example.com', password: 'password1', name: 'User 1', role: 'admin' },
      { id: 2, email: 'user2@example.com', password: 'password2', name: 'User 2', role: 'user' },
    ],
  });
});


afterAll(async () => {
  await prisma.$disconnect();
});

describe('User Controller', () => {
  it('should sign up a new user', async () => {
    const newUser = { email: 'newuser@example.com', password: 'password', name: 'New User', role: 'user' };

    const response = await supertest(server.server)
      .post('/signup')
      .send(newUser);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should get user profile', async () => {
    const token = server.jwt.sign({ id: 1, email: 'user1@example.com', role: 'admin' });

    const response = await supertest(server.server)
      .get('/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      id: 1,
      email: 'user1@example.com',
      name: 'User 1',
      role: 'admin',
    }));
  });

  it('should update user profile', async () => {
    const updatedUser = { email: 'updateduser@example.com', name: 'Updated User', password: 'newpassword', role: 'user' };
    const token = server.jwt.sign({ id: 1, email: 'user1@example.com', role: 'admin' });

    const response = await supertest(server.server)
      .put('/profile')
      .send(updatedUser)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      id: 1,
      email: 'updateduser@example.com',
      name: 'Updated User',
      role: 'user',
    }));
  });

  it('should delete user profile', async () => {
    
    await prisma.post.deleteMany();
    const token = server.jwt.sign({ id: 1, email: 'user1@example.com', role: 'admin' });

    const response = await supertest(server.server)
      .delete('/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'User deleted' });
  });

  it('should get all users', async () => {
    const token = server.jwt.sign({ id: 1, email: 'user1@example.com', role: 'admin' });

    const response = await supertest(server.server)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ email: 'user1@example.com' }),
      expect.objectContaining({ email: 'user2@example.com' }),
    ]));
  });
});
