import { prisma } from './src/prisma';

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
