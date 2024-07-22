import { IPostRepository } from '../../adapters/persistence/interface/postRepository.interface';
import { Post } from '../../domain/models/post';

export class PostService {
  constructor(private postRepository: IPostRepository) {}

  async createPost(title: string, content: string, authorId: number): Promise<Post> {
    if (!title) {
      throw new Error('Post title is required');
    }
    if (!content) {
      throw new Error('Post content is required');
    }
    const post = new Post(0, title, content, authorId);
    return this.postRepository.save(post);
  }

  async getPostById(id: number): Promise<Post | null> {
    if (!id) {
      throw new Error('Post ID is required');
    }
    return this.postRepository.findById(id);
  }

  async updatePost(id: number, title: string, content: string): Promise<Post> {
    if (!id) {
      throw new Error('Post ID is required');
    }
    if (!title && !content) {
      throw new Error('At least one of title or content must be provided to update the post');
    }

    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new Error('Post not found');
    }

    post.title = title || post.title;
    post.content = content || post.content;

    return this.postRepository.save(post);
  }

  async deletePost(id: number): Promise<void> {
    if (!id) {
      throw new Error('Post ID is required');
    }

    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new Error('Post not found');
    }

    await this.postRepository.delete(id);
  }

  async getAllPostsByAuthor(authorId: number): Promise<Post[]> {
    if (!authorId) {
      throw new Error('Author ID is required');
    }

    return this.postRepository.findByAuthorId(authorId);
  }

  async getAllPosts(): Promise<Post[]> {
    return this.postRepository.findAll();
  }
}
