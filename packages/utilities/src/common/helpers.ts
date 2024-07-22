import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
}

export const isValidEmail = (email: string): boolean => {
  return /\S+@\S+\.\S+/.test(email);
}
