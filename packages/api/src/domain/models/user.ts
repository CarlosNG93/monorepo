export class User {
    constructor(
      public id: number,
      public email: string,
      public password: string,
      public name?: string,          
      public createdAt?: Date,       
      public updatedAt?: Date       
    ) {}
  
    public static create(email: string, password: string, name?: string): User {
      return new User(0, email, password, name);
    }
  }