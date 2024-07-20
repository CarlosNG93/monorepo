import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaPostRepository } from '../../persistence/prismaPostRepository';
import { MyJwtPayload, authMiddleware, roleMiddleware } from '../../../infrastructure/middleware/authMiddleware';
import { PostService } from '../../../app/services/postService';

const postService = new PostService(new PrismaPostRepository());

interface PostParams {
  id: string;
}

interface PostBody {
  title: string;
  content: string;
}

interface PostQuery {
  authorId: string;
}

export const postController = (server: FastifyInstance) => {
  server.post<{ Body: PostBody }>('/posts', { preHandler: [authMiddleware, roleMiddleware('admin')] }, async (request, reply) => {
    const userPayload = request.user as MyJwtPayload;
    if (!userPayload) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const { title, content } = request.body;
    const post = await postService.createPost(title, content, userPayload.id);
    server.io.emit('newPost', post);
    return reply.status(201).send(post);
  });

  server.get<{ Params: PostParams }>('/posts/:id', async (request, reply) => {
    const { id } = request.params;
    const post = await postService.getPostById(Number(id));
    if (!post) {
      return reply.status(404).send({ error: 'Post not found' });
    }
    return reply.send(post);
  });

  server.put<{ Params: PostParams; Body: PostBody }>('/posts/:id', { preHandler: [authMiddleware, roleMiddleware('admin')] }, async (request, reply) => {
    const userPayload = request.user as MyJwtPayload;
    if (!userPayload) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const { title, content } = request.body;
    const { id } = request.params;
    const post = await postService.updatePost(Number(id), title, content);
    server.io.emit('updatedPost', post);
    return reply.send(post);
  });

  server.delete<{ Params: PostParams }>('/posts/:id', { preHandler: [authMiddleware, roleMiddleware('admin')] }, async (request, reply) => {
    const userPayload = request.user as MyJwtPayload;
    if (!userPayload) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const { id } = request.params;
    await postService.deletePost(Number(id));
    server.io.emit('deletedPost', { id: Number(id) });
    return reply.send({ message: 'Post deleted' });
  });

  server.get<{ Querystring: PostQuery }>('/posts', async (request, reply) => {
    const { authorId } = request.query;
    const posts = await postService.getAllPostsByAuthor(Number(authorId));
    return reply.send(posts);
  });
};
