import { Prisma } from '../generated/prisma/index.js';
import ApiError from "../utils/ApiError.js";
import dotenv from 'dotenv';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
dotenv.config();
const formatZodError = (error) => {
    return error.issues
        .map((err) => {
        const path = err.path.join('.') || 'root';
        const message = err.message;
        if (err.code === 'invalid_enum_value' && 'options' in err) {
            const options = err.options.join(', ');
            return `Field '${path}': ${message}. Expected one of: ${options}`;
        }
        return `Field '${path}': ${message}`;
    })
        .join('\n');
};
export const errorHandler = (err, c) => {
    console.error('Error occurred:', err);
    let statusCode = 500;
    let message = 'Internal Server Error';
    let extra;
    if (err instanceof ZodError) {
        statusCode = 400;
        message = formatZodError(err);
    }
    else if (err?.isAxiosError === true) {
        // Prefer upstream response body over AxiosError.message
        const axiosErr = err;
        const data = axiosErr.response?.data;
        statusCode = typeof axiosErr.response?.status === 'number' ? axiosErr.response.status : 500;
        message = data?.message || axiosErr.message || 'Request failed.';
        extra = {
            ...(data?.code && { code: data.code }),
            ...(data?.requestId && { requestId: data.requestId }),
            ...(data?.details && { details: data.details })
        };
    }
    else if (err instanceof HTTPException) {
        statusCode = err.status;
        message = err.message;
    }
    else if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        statusCode = 400;
        message = err.message;
    }
    else if (err.message) {
        message = err.message;
    }
    if (process.env.NODE_ENV === 'production') {
        if (!(err instanceof ApiError && err.isOperational)) {
            statusCode = 500;
            message = 'Something went wrong. Please try again later.';
        }
    }
    // Ensure status code is valid (200-599)
    if (statusCode < 200 || statusCode > 599) {
        console.error(`Invalid status code ${statusCode}, defaulting to 500`);
        statusCode = 500;
    }
    const response = {
        message,
        code: statusCode,
        ...(extra || {})
    };
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }
    return c.json(response, statusCode);
};
