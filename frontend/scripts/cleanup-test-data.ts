import { PrismaClient } from '@prisma/client';
import { logger } from '../lib/logger';

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
        logger.error('Cleanup error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
