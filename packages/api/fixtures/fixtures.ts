import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
 
  await prisma.user.deleteMany();
  await prisma.post.deleteMany();

  
  const hashedPassword1 = await bcrypt.hash('password1', 10);
  const user1 = await prisma.user.create({
    data: {
      email: faker.internet.email(),
      password: hashedPassword1,
      name: faker.name.fullName(),
      role: 'admin',
      profilePicture: faker.image.avatar()
    },
  });

  const hashedPassword2 = await bcrypt.hash('password2', 10);
  const user2 = await prisma.user.create({
    data: {
      email: faker.internet.email(),
      password: hashedPassword2,
      name: faker.name.fullName(),
      role: 'user',
      profilePicture: faker.image.avatar()
    },
  });

  
  await prisma.post.create({
    data: {
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(),
      authorId: user1.id,
    },
  });

  await prisma.post.create({
    data: {
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(),
      authorId: user2.id,
    },
  });

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
