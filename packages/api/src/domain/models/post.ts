

export class Post {
    constructor(
      public id: number,
      public title: string,
      public authorId: number,       
      public content?: string,       
      public createdAt?: Date,       
      public updatedAt?: Date        
    ) {}
  
    public static create(title: string, authorId: number, content?: string): Post {
        return new Post(0, title, authorId, content);
      }
    }
  