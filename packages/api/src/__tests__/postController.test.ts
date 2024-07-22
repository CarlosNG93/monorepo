import supertest from 'supertest';
import { PrismaClient } from '@prisma/client';
import { buildServer } from '../jest.setup';

import fastifyJwt from '@fastify/jwt';
import { postController } from '../adapters/http/controllers/postController';

const prisma = new PrismaClient();
const server = buildServer();


server.register(fastifyJwt, { secret: 'supersecret' });
postController(server);

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

  await prisma.post.createMany({
    data: [
      { id: 1, title: 'Post 1', content: 'Content of post 1', authorId: 1 },
      { id: 2, title: 'Post 2', content: 'Content of post 2', authorId: 2 },
    ],
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Post Controller', () => {
  it('should create a new post', async () => {
    const newPost = { title: 'New Test Post', content: 'New Test Content', authorId: 1 };
    const token = server.jwt.sign({ id: 1, email: 'user1@example.com', role: 'admin' });

    const response = await supertest(server.server)
      .post('/posts')
      .send(newPost)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(expect.objectContaining({
      title: 'New Test Post',
      content: 'New Test Content',
      authorId: 1,
    }));
  });

  it('should get a post by ID', async () => {
    const response = await supertest(server.server)
      .get('/posts/2');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      id: 2,
      title: 'Post 2',
      content: 'Content of post 2',
      authorId: 2,
    }));
  });

  it('should update a post by ID', async () => {
    const updatedPost = { title: 'Updated Test Post', content: 'Updated Test Content' };
    const token = server.jwt.sign({ id: 1, email: 'user1@example.com', role: 'admin' });

    const response = await supertest(server.server)
      .put('/posts/2')
      .send(updatedPost)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      id: 2,
      title: 'Updated Test Post',
      content: 'Updated Test Content',
      authorId: 2,
    }));
  });

  it('should delete a post by ID', async () => {
    const token = server.jwt.sign({ id: 1, email: 'user1@example.com', role: 'admin' });

    const response = await supertest(server.server)
      .delete('/posts/2')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Post deleted' });
  });

  it('should get all posts by an author', async () => {
    const response = await supertest(server.server)
      .get('/posts')
      .query({ authorId: '1' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining([
      expect.objectContaining({
        authorId: 1,
      }),
    ]));
  });
});
