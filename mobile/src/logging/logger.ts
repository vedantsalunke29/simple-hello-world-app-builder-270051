const BASE_URL = process.env.EXPO_PUBLIC_LOGGER_API_URL;
const PROJECT_ID = process.env.EXPO_PUBLIC_LOGGER_PROJECT_ID;
const ACCESS_KEY = process.env.EXPO_PUBLIC_LOGGER_PROJECT_ACCESS_KEY;

interface ErrorPayload {
    type?: string;
    message?: string;
    stack?: string;
    source?: string;
    timestamp?: string;
}

async function sendErrorToBackend(payload: ErrorPayload): Promise<void> {
    if (!BASE_URL || !PROJECT_ID || !ACCESS_KEY) {
        console.warn('[Logger] Missing env vars, skipping error report.');
        return;
    }
    try {
        const body = {
            type: payload.type,
            message: payload.message,
            stack: payload.stack,
            source: payload.source,
            timestamp: new Date().toISOString(),
        };
        await fetch(`${BASE_URL}/app-builder/projects/${PROJECT_ID}/mobile-runtime-log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-project-access-key': ACCESS_KEY
            },
            body: JSON.stringify(body)
        });
    } catch (fetchError) {
        console.warn('[Logger] Failed to send error:', fetchError);
    }
}

function extractErrorFields(error: unknown): ErrorPayload {
    if (error instanceof Error) {
        return { type: error.name, message: error.message, stack: error.stack };
    }
    return { type: 'UnknownError', message: String(error) };
}

// Unhandled JS exceptions (covers Hermes promise rejections too)
const originalErrorHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    sendErrorToBackend({
        ...extractErrorFields(error),
        source: isFatal ? 'fatal' : 'global'
    });

    if (isFatal) {
        setTimeout(() => {
            originalErrorHandler?.(error, isFatal);
        }, 2000);
    } else {
        console.warn('[Logger] Non-fatal error caught:', error?.message);
    }
});

// Unhandled promise rejections on JSC / web targets
if (typeof global !== 'undefined') {
    (global as any).onunhandledrejection = (event: { reason: unknown }) => {
        sendErrorToBackend({
            ...extractErrorFields(event?.reason),
            source: 'unhandledRejection'
        });
    };
}

export const logError = (error: unknown, source = 'manual') => {
    sendErrorToBackend({ ...extractErrorFields(error), source });
};
