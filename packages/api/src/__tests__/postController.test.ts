
import buildFastify from './setup';
import { postController } from '../adapters/http/controllers/postController';
import supertest from 'supertest';

const mockPostService = {
  createPost: jest.fn(),
  getPostById: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
  getAllPostsByAuthor: jest.fn(),
};

describe('Post Controller', () => {
  const fastify = buildFastify();
  fastify.decorate('websocketServer', { clients: [] });
  fastify.decorate('postService', mockPostService);
  postController(fastify);

  beforeAll(async () => {
    await fastify.listen(0);
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('should create a new post', async () => {
    const newPost = { id: 1, title: 'Test Post', content: 'Test Content', authorId: '123' };
    mockPostService.createPost.mockResolvedValue(newPost);

    const token = fastify.jwt.sign({ id: '123', email: 'test@example.com', role: 'admin' });

    const response = await supertest(fastify.server)
      .post('/posts')
      .send({ title: 'Test Post', content: 'Test Content' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(newPost);
  });

  it('should get a post by ID', async () => {
    const post = { id: 1, title: 'Test Post', content: 'Test Content', authorId: '123' };
    mockPostService.getPostById.mockResolvedValue(post);

    const response = await supertest(fastify.server)
      .get('/posts/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(post);
  });

  it('should update a post by ID', async () => {
    const updatedPost = { id: 1, title: 'Updated Post', content: 'Updated Content', authorId: '123' };
    mockPostService.updatePost.mockResolvedValue(updatedPost);

    const token = fastify.jwt.sign({ id: '123', email: 'test@example.com', role: 'admin' });

    const response = await supertest(fastify.server)
      .put('/posts/1')
      .send({ title: 'Updated Post', content: 'Updated Content' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedPost);
  });

  it('should delete a post by ID', async () => {
    mockPostService.deletePost.mockResolvedValue(undefined);

    const token = fastify.jwt.sign({ id: '123', email: 'test@example.com', role: 'admin' });

    const response = await supertest(fastify.server)
      .delete('/posts/1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Post deleted' });
  });

  it('should get all posts by an author', async () => {
    const posts = [
      { id: 1, title: 'Post 1', content: 'Content 1', authorId: '123' },
      { id: 2, title: 'Post 2', content: 'Content 2', authorId: '123' },
    ];
    mockPostService.getAllPostsByAuthor.mockResolvedValue(posts);

    const response = await supertest(fastify.server)
      .get('/posts')
      .query({ authorId: '123' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(posts);
  });
});
