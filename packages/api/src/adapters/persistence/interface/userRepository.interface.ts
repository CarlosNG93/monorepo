import { User } from "../../../domain/models/user";


export interface IUserRepository {
    save(user: User): Promise<User>;
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    delete(id: number): Promise<void>;
    findAll(): Promise<User[]>;
  }