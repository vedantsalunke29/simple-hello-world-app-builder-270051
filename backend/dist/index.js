import app from "./app.js";
import prisma from "./client.js";
import { serve } from '@hono/node-server';
import dotenv from 'dotenv';
let server;
dotenv.config();
console.log('Starting');
async function main() {
    try {
        await prisma.$connect();
    }
    catch (error) {
        process.exit(1);
    }
    server = serve({
        fetch: app.fetch,
        port: (process.env.PORT || 3000)
    });
    const exitHandler = () => {
        if (server) {
            server.close(() => {
                process.exit(1);
            });
        }
        else {
            process.exit(1);
        }
    };
    const unexpectedErrorHandler = () => {
        exitHandler();
    };
    process.on('uncaughtException', unexpectedErrorHandler);
    process.on('unhandledRejection', unexpectedErrorHandler);
    process.on('SIGTERM', () => {
        if (server) {
            server.close();
        }
    });
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
