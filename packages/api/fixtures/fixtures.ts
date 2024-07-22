import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  
  await prisma.post.deleteMany();
  
  
  await prisma.user.deleteMany();

  
  const users: User[] = [];
  for (let i = 1; i <= 5; i++) {
    const hashedPassword = await bcrypt.hash(`password${i}`, 10);
    const role = i === 1 ? 'admin' : 'user';
    const user = await prisma.user.create({
      data: {
        id: i, 
        email: `user${i}@example.com`,
        password: hashedPassword,
        name: `User ${i}`,
        role: role,
        profilePicture: `https://example.com/avatar${i}.png`
      },
    });
    users.push(user);
  }

  
  for (let i = 1; i <= 10; i++) {
    const randomUserIndex = Math.floor(Math.random() * users.length);
    const user = users[randomUserIndex];
    await prisma.post.create({
      data: {
        id: i, 
        title: `Post ${i}`,
        content: `Content of post ${i}.`,
        authorId: user.id,
      },
    });
  }

  console.log('Fixtures have been successfully created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
