export class Post {
  constructor(
      public id: number,
      public title: string,
      public content: string | null,
      public authorId: number,
      public createdAt?: Date,
      public updatedAt?: Date
  ) {}

  public static create(title: string, content: string, authorId: number): Post {
      return new Post(0, title, content, authorId);
  }
}
