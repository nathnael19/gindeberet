let prisma;

try {
  // Generated offline for cPanel (prisma generate OOMs on shared hosting)
  const { PrismaClient } = require('../generated/prisma');
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  prisma
    .$connect()
    .then(() => {
      console.log('Database connected successfully');
    })
    .catch((error) => {
      console.error('Database connection failed:', error);
    });

  process.on('beforeExit', async () => {
    try {
      await prisma.$disconnect();
    } catch (_) {
      /* ignore */
    }
  });
} catch (err) {
  console.error('Prisma client failed to load:', err.message);
  prisma = new Proxy(
    {},
    {
      get(_t, prop) {
        if (prop === '$disconnect') {
          return async () => {};
        }
        throw new Error(
          `Prisma is not ready (tried to use "${String(prop)}"). Upload src/generated/prisma from the repo.`
        );
      },
    }
  );
}

module.exports = prisma;
