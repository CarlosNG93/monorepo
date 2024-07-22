import { PrismaClient } from '@prisma/client';
import { Post } from '../../domain/models/post';
import { IPostRepository } from './interface/postRepository.interface';

const prisma = new PrismaClient();

export class PrismaPostRepository implements IPostRepository {
  async save(post: Post): Promise<Post> {
    const savedPost = await prisma.post.upsert({
      where: { id: post.id || 0 }, 
      update: {
        title: post.title,
        content: post.content ?? null,
      },
      create: {
        title: post.title,
        content: post.content ?? null,
        authorId: Number(post.authorId), 
      },
    });

    return new Post(
      savedPost.id,
      savedPost.title,
      savedPost.content ?? null,
      savedPost.authorId,
      savedPost.createdAt,
      savedPost.updatedAt
    );
  }

  async findById(id: number): Promise<Post | null> {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!post) return null;

    return new Post(
      post.id,
      post.title,
      post.content ?? null,
      post.authorId,
      post.createdAt,
      post.updatedAt
    );
  }

  async delete(id: number): Promise<void> {
    await prisma.post.delete({ where: { id } });
  }

  async findByAuthorId(authorId: number): Promise<Post[]> {
    const posts = await prisma.post.findMany({
      where: { authorId },
    });

    return posts.map(post => new Post(
      post.id,
      post.title,
      post.content ?? null,
      post.authorId,
      post.createdAt,
      post.updatedAt
    ));
  }

  async findAll(): Promise<Post[]> {
    const posts = await prisma.post.findMany();
    return posts.map(post => new Post(
      post.id,
      post.title,
      post.content ?? null,
      post.authorId,
      post.createdAt,
      post.updatedAt
    ));
  }
}
