import { PrismaClient } from '@prisma/client';
import { User } from '../../domain/models/user';
import { IUserRepository } from './interface/userRepository.interface';


const prisma = new PrismaClient();

export class PrismaUserRepository implements IUserRepository {
  async save(user: User): Promise<User> {
    const savedUser = await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        name: user.name || null,
        password: user.password,
       
      },
      create: {
        email: user.email,
        name: user.name || null,
        password: user.password,
        
      },
      
    });
    
    return new User(
      savedUser.id,
      savedUser.email,
      savedUser.password,
      savedUser.name || undefined,
      savedUser.createdAt,
      savedUser.updatedAt
    );
  }

  async findById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) return null;
    
    return new User(
      user.id,
      user.email,
      user.password,
      user.name || undefined,
      user.createdAt,
      user.updatedAt
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) return null;
    
    return new User(
      user.id,
      user.email,
      user.password,
      user.name || undefined,
      user.createdAt,
      user.updatedAt
    );
  }

  async delete(id: number): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }
}
