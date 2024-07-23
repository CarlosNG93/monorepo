import supertest from 'supertest';
import { PrismaClient } from '@prisma/client';
import { buildServer } from '../jest.setup';
import fastifyJwt from '@fastify/jwt';
import { userController } from '../adapters/http/controllers/userController';
import { ROLE_ADMIN, ROLE_USER } from 'utilities/src/common/constants';
import path from 'path';
import fs from 'fs';
import { UserService } from '../app/services/userService';
import fastifyMultipart from '@fastify/multipart';

const prisma = new PrismaClient();
const server = buildServer();

server.register(fastifyMultipart);

server.register(fastifyJwt, { secret: 'supersecret' });
userController(server);

beforeAll(async () => {
  await server.ready();
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log('Usuarios eliminados:', await prisma.user.findMany());

  await prisma.user.createMany({
    data: [
      { id: 1, email: 'user1@example.com', password: 'password1', name: 'User 1', role: ROLE_ADMIN },
      { id: 2, email: 'user2@example.com', password: 'password2', name: 'User 2', role: ROLE_USER },
    ],
  });
});


afterAll(async () => {
  await prisma.$disconnect();
});

describe('User Controller', () => {
  

  it('should get user profile', async () => {
    const token = server.jwt.sign({ id: 1, email: 'user1@example.com', role: ROLE_ADMIN });

    const response = await supertest(server.server)
      .get('/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      id: 1,
      email: 'user1@example.com',
      name: 'User 1',
      role: ROLE_ADMIN,
    }));
  });

  it('should update user profile', async () => {
    const updatedUser = { email: 'updateduser@example.com', name: 'Updated User', password: 'newpassword', role: ROLE_USER };
    const token = server.jwt.sign({ id: 1, email: 'user1@example.com', role: ROLE_ADMIN });

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
    const token = server.jwt.sign({ id: 1, email: 'user1@example.com', role: ROLE_ADMIN });

    const response = await supertest(server.server)
      .delete('/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'User deleted' });
  });

  it('should get all users', async () => {
    const token = server.jwt.sign({ id: 1, email: 'user1@example.com', role: ROLE_ADMIN });

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


describe('User Controller - Profile Picture Upload', () => {
  const testFilePath = path.join(__dirname, 'test-image.jpg');
  const testFileContent = 'dummy content';

  beforeEach(async () => {
    
    if (fs.existsSync(testFilePath)) {
      console.log('Deleting existing test file:', testFilePath);
      fs.unlinkSync(testFilePath);
    }
    console.log('Creating test file:', testFilePath);
    fs.writeFileSync(testFilePath, testFileContent);
  });

  afterEach(async () => {
    if (fs.existsSync(testFilePath)) {
      console.log('Deleting test file:', testFilePath);
      fs.unlinkSync(testFilePath);
    }
  });

  

  it('should return 400 if file already exists', async () => {
    const token = server.jwt.sign({ id: 1, email: 'user1@example.com', role: 'ROLE_ADMIN' });

    console.log('Generated JWT:', token);

    // Simula que el archivo ya existe antes de la subida
    fs.writeFileSync(testFilePath, testFileContent);

    const response = await supertest(server.server)
      .post('/profile/picture')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', testFilePath);

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'File exist' });
  });

  it('should return 401 if user is not authenticated', async () => {
    const response = await supertest(server.server)
      .post('/profile/picture')
      .send();

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
  });

});