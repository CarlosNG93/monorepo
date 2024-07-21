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
  server.post<{ Body: PostBody }>('/posts', {
    preHandler: [authMiddleware, roleMiddleware('admin')],
    schema: {
      description: 'Create a new post',
      tags: ['Post'],
      summary: 'Create a new post',
      body: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title: { type: 'string' },
          content: { type: 'string' }
        }
      },
      response: {
        201: {
          description: 'Post created successfully',
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            content: { type: 'string' },
            authorId: { type: 'string' }
          }
        },
        401: {
          description: 'Unauthorized',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const userPayload = request.user as MyJwtPayload;
    if (!userPayload) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const { title, content } = request.body;
    const post = await postService.createPost(title, content, userPayload.id);
    server.websocketServer?.clients.forEach((client: { readyState: any; OPEN: any; send: (arg0: string) => void; }) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({ type: 'newPost', data: post }));
      }
    });
    
    return reply.status(201).send(post);
  });

  server.get<{ Params: PostParams }>('/posts/:id', {
    schema: {
      description: 'Get a post by ID',
      tags: ['Post'],
      summary: 'Retrieve a post by its ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Post retrieved successfully',
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            content: { type: 'string' },
            authorId: { type: 'string' }
          }
        },
        404: {
          description: 'Post not found',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const post = await postService.getPostById(Number(id));
    if (!post) {
      return reply.status(404).send({ error: 'Post not found' });
    }
    return reply.send(post);
  });

  server.put<{ Params: PostParams; Body: PostBody }>('/posts/:id', {
    preHandler: [authMiddleware, roleMiddleware('admin')],
    schema: {
      description: 'Update a post by ID',
      tags: ['Post'],
      summary: 'Update a post by its ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title: { type: 'string' },
          content: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Post updated successfully',
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            content: { type: 'string' },
            authorId: { type: 'string' }
          }
        },
        401: {
          description: 'Unauthorized',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        404: {
          description: 'Post not found',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const userPayload = request.user as MyJwtPayload;
    if (!userPayload) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const { title, content } = request.body;
    const { id } = request.params;
    const post = await postService.updatePost(Number(id), title, content);
    server.websocketServer?.clients.forEach((client: { readyState: any; OPEN: any; send: (arg0: string) => void; }) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({ type: 'updatedPost', data: post }));
      }
    });

    return reply.send(post);
  });

  server.delete<{ Params: PostParams }>('/posts/:id', {
    preHandler: [authMiddleware, roleMiddleware('admin')],
    schema: {
      description: 'Delete a post by ID',
      tags: ['Post'],
      summary: 'Delete a post by its ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Post deleted successfully',
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        401: {
          description: 'Unauthorized',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        404: {
          description: 'Post not found',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  },  async (request, reply) => {
    const userPayload = request.user as MyJwtPayload;
    if (!userPayload) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const { id } = request.params;
    await postService.deletePost(Number(id));
    server.websocketServer?.clients.forEach((client: { readyState: any; OPEN: any; send: (arg0: string) => void; }) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({ type: 'deletedPost', data: { id: Number(id) } }));
      }
    });
    
    return reply.send({ message: 'Post deleted' });
  });

  server.get<{ Querystring: PostQuery }>('/posts', async (request, reply) => {
    const { authorId } = request.query;
    const posts = await postService.getAllPostsByAuthor(Number(authorId));
    return reply.send(posts);
  });
};
