import { Post } from "../../../domain/models/post";


export interface IPostRepository {
  save(post: Post): Promise<Post>;
  findById(id: number): Promise<Post | null>;
  delete(id: number): Promise<void>;
  findByAuthorId(authorId: number): Promise<Post[]>;
}
