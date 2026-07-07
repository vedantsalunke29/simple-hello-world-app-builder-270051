import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import prisma from '../client.ts';
import catchAsync from '../utils/catchAsync.ts';

const greetingRoutes = new Hono();

// Zod schema for recording a new greeting
const createGreetingSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(25, 'Name must be 25 characters or less'),
    language: z.string().min(1, 'Language is required'),
    emoji: z.string().min(1, 'Emoji is required')
});

// 1. Get recent greetings list and total count
greetingRoutes.get(
    '/',
    catchAsync(async (c: any) => {
        // Query recent 10 active greetings
        const greetings = await prisma.greeting.findMany({
            where: { isDeleted: false },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Get count of all active greetings
        const totalCount = await prisma.greeting.count({
            where: { isDeleted: false }
        });

        return c.json({
            greetings,
            totalCount
        });
    })
);

// 2. Create/Record a new greeting event
greetingRoutes.post(
    '/',
    zValidator('json', createGreetingSchema),
    catchAsync(async (c: any) => {
        const body = c.req.valid('json' as any) as any;

        const newGreeting = await prisma.greeting.create({
            data: {
                name: body.name,
                language: body.language,
                emoji: body.emoji,
                isDeleted: false
            }
        });

        return c.json(newGreeting, 201);
    })
);

// 3. Soft-delete all greeting records (Set isDeleted: true)
greetingRoutes.delete(
    '/',
    catchAsync(async (c: any) => {
        await prisma.greeting.updateMany({
            where: { isDeleted: false },
            data: { isDeleted: true }
        });

        return c.json({
            success: true,
            message: 'All greeting records soft-deleted successfully'
        });
    })
);

export default greetingRoutes;
