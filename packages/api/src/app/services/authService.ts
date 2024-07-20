import { IUserRepository } from '../../adapters/persistence/interface/userRepository.interface';
import { User } from '../../domain/models/user';
import jwt from 'jsonwebtoken';

export class AuthService {
  constructor(private userRepository: IUserRepository) {}

  async login(email: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return this.generateToken(user);
  }

  generateToken(user: User): string {
    return jwt.sign({ id: user.id, email: user.email }, 'supersecret', { expiresIn: '1h' });
  }

  verifyToken(token: string): any {
    return jwt.verify(token, 'supersecret');
  }
}
