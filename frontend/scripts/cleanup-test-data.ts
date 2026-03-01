import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- CLEANING UP TEST DATA ---');

    const result = await prisma.user.deleteMany({
        where: {
            username: {
                startsWith: 'TEST_USER_'
            }
        }
    });

    console.log(`Successfully deleted ${result.count} test users.`);
    console.log('--- CLEANUP COMPLETE ---');
}

main()
    .catch((e) => {
        console.error('Cleanup error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
