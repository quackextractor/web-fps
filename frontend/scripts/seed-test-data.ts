import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('--- SEEDING TEST DATA FOR BACKEND VERIFICATION ---');

    const testUsers = [
        {
            username: 'TEST_USER_ALPHA',
            password: 'Password123!',
            netWorth: 50000,
            kills: 100,
            saveData: JSON.stringify({
                credits: 50000,
                inventory: { item1: 10, item2: 5 },
                machines: [{ id: 'm1', type: 'basic', x: 0, y: 0 }],
                unlockedWeapons: ['pistol', 'shotgun'],
                highestLevelCompleted: 5
            })
        },
        {
            username: 'TEST_USER_BETA',
            password: 'Password123!',
            netWorth: 100000,
            kills: 50,
            saveData: JSON.stringify({
                credits: 100000,
                inventory: { item1: 20 },
                machines: [{ id: 'm2', type: 'advanced', x: 2, y: 2 }],
                unlockedWeapons: ['pistol', 'shotgun', 'chaingun'],
                highestLevelCompleted: 10
            })
        },
        {
            username: 'TEST_USER_GAMMA',
            password: 'Password123!',
            netWorth: 75000,
            kills: 200,
            saveData: JSON.stringify({
                credits: 75000,
                inventory: { item3: 50 },
                machines: [],
                unlockedWeapons: ['pistol', 'chainsaw'],
                highestLevelCompleted: 2
            })
        }
    ];

    for (const testUser of testUsers) {
        console.log(`Processing user: ${testUser.username}...`);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(testUser.password, salt);

        // Upsert user (create if doesn't exist, update if it does)
        await prisma.user.upsert({
            where: { username: testUser.username },
            update: {
                passwordHash,
                netWorth: testUser.netWorth,
                kills: testUser.kills,
                saveData: testUser.saveData,
            },
            create: {
                username: testUser.username,
                passwordHash,
                netWorth: testUser.netWorth,
                kills: testUser.kills,
                saveData: testUser.saveData,
            }
        });

        console.log(`Successfully seeded: ${testUser.username}`);
    }

    console.log('--- SEEDING COMPLETE ---');
}

main()
    .catch((e) => {
        console.error('Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
