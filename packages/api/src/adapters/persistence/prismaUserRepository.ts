import { PrismaClient } from '@prisma/client';
import { User } from '../../domain/models/user';
import { IUserRepository } from './interface/userRepository.interface';

const prisma = new PrismaClient();

export class PrismaUserRepository implements IUserRepository {
  async save(user: User): Promise<User> {
    console.log("Before saving:", user);
  
    const savedUser = await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        password: user.password,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture
      },
      create: {
        email: user.email,
        password: user.password,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  
    console.log("Saving user:", savedUser);
  
    return new User(
      savedUser.id,
      savedUser.email,
      savedUser.password,
      savedUser.role,
      savedUser.name || '',
      savedUser.profilePicture || '',
      savedUser.createdAt,
      savedUser.updatedAt
    );
  }
  
  async findById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return new User(
      user.id,
      user.email,
      user.password,
      user.role,
      user.name || '',
      user.profilePicture || '',
      user.createdAt,
      user.updatedAt
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return new User(
      user.id,
      user.email,
      user.password,
      user.role,
      user.name || '',
      user.profilePicture || '',
      user.createdAt,
      user.updatedAt
    );
  }

  async delete(id: number): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users.map((user: { id: number; email: string; password: string; role: string; name: any; profilePicture: any; createdAt: Date | undefined; updatedAt: Date | undefined; }) => new User(
      user.id,
      user.email,
      user.password,
      user.role,
      user.name || '',
      user.profilePicture || '',
      user.createdAt,
      user.updatedAt
    ));
  }
}
