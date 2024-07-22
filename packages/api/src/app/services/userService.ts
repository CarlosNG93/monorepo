import { ROLE_USER } from 'utilities/src/common/constants';
import { IUserRepository } from '../../adapters/persistence/interface/userRepository.interface';
import { User } from '../../domain/models/user';
import bcrypt from 'bcryptjs';

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async createUser(email: string, password: string, role: string = ROLE_USER, name: string = '', profilePicture: string = ''): Promise<User> {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email address');
    }
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already in use');
    }
    const hashedPassword = await this.hashPassword(password);
    const user = User.create(email, hashedPassword, role, name, profilePicture);
    console.log(`Creating user: ${email}`);
    return this.userRepository.save(user);
  }

  async updateUser(id: number, email: string, password?: string, role?: string, name: string = '', profilePicture: string = ''): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    user.email = email;
    if (password) {
      user.password = await this.hashPassword(password);
    }
    if (role) {
      user.role = role;
    }
    user.name = name || user.name;
    user.profilePicture = profilePicture || user.profilePicture;
    return this.userRepository.save(user);
  }
  
  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async getAllUsers(): Promise<User[]> { 
    return this.userRepository.findAll();
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async updateProfilePicture(id: number, filePath: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.profilePicture = filePath;
    return this.userRepository.save(user);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private isValidEmail(email: string): boolean {
    return /\S+@\S+\.\S+/.test(email);
  }
}
