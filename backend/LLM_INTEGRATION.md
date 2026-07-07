# Always use "@uptiqai/integrations-sdk" for LLM integration

Do not use this integration for image generation. For image generation use `src/integrations/imageGeneration` strictly.

## Forbidden Dependencies

Never install or import these packages. They are already wrapped in `@uptiqai/integrations-sdk`:

- `ai` - AI SDK core
- `@ai-sdk/google` - Google AI SDK
- `@ai-sdk/anthropic` - Anthropic SDK
- `@ai-sdk/openai` - OpenAI SDK
- `@google/generative-ai` - Direct Google AI
- `@anthropic-ai/sdk` - Direct Anthropic
- `openai` - Direct OpenAI

## Import

Choose the SDK class based on `process.env.LLM_PROVIDER` or the user's prompt.

```ts
import { Anthropic, GoogleGenerativeAI, Openai } from '@uptiqai/integrations-sdk';
```

## Provider Selection

- Use `Openai` when the prompt asks for OpenAI, GPT, or OpenAI-compatible text generation.
- Use `GoogleGenerativeAI` when the prompt asks for Google, Gemini, or Google Generative AI.
- Use `Anthropic` when the prompt asks for Anthropic or Claude.
- When using `process.env.LLM_PROVIDER`, normalize it to lowercase before switching. Supported values are `OpenAI`, `Anthropic`, and `Google`.

```typescript
const getLLM = () => {
    switch (process.env.LLM_PROVIDER?.toLowerCase()) {
        case 'openai':
            return new Openai();
        case 'anthropic':
            return new Anthropic();
        case 'google':
            return new GoogleGenerativeAI();
        default:
            throw new Error('Unsupported LLM_PROVIDER. Use openai, anthropic, or google.');
    }
};
```

## Config Types: Shared vs PerUser

LLM integrations support two configuration modes. Choose the mode based on the user's request and the app's integration configuration.

### **Shared Config**

- The selected provider credentials are shared by all users and are already configured. Do not ask users for API keys in this mode.
- Do not pass `model` in shared config. The integration uses the configured default model.

## LLM: Generate Text (Shared Config)

```ts
const llm = getLLM();

const result = await llm.generateText({
    messages: [{ role: 'user', content: 'Hello!' }],
    options: { temperature: 0.7, maxTokens: 1000, topP: 0.9 }
});
```

The selected provider can be OpenAI, Google, or Anthropic based on `process.env.LLM_PROVIDER`.

## LLM: Stream Text (Shared Config)

```typescript
const llm = getLLM();

const result = await llm.createStream({
    messages: [{ role: 'user', content: 'Hello!' }],
    options: { temperature: 0.7, maxTokens: 1000, topP: 0.9 }
});

c.header('Content-Type', 'text/event-stream');
c.header('Cache-Control', 'no-cache');
c.header('Connection', 'keep-alive');

// Return the stream directly - Hono will handle it
return c.body(result.data);
```

### **Per User Config**

- Users must provide the selected provider API key before they can generate text.
- Assume `prisma`, auth middleware, and `ApiError` already exist in the app, or import them from the app's existing utilities.
- Use the same `setUserCredentials`, `generateText`, and `createStream` methods for `Openai`, `GoogleGenerativeAI`, and `Anthropic`.

Step 1: Connect User's OpenAI API Key (PerUser Config)

```typescript
import catchAsync from '../utils/catchAsync';
import { Openai } from '@uptiqai/integrations-sdk';
import { Hono } from 'hono';

const app = new Hono();
// Connect user's OpenAI API key
app.post(
    '/llm/openai/connect',
    catchAsync(async c => {
        const { apiKey, model } = await c.req.json();
        const currentUserId = c.get('userId'); // From auth middleware

        // Get existing integration userId if user previously connected
        const user = await prisma.user.findUnique({
            where: { id: currentUserId }
        });

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // Initialize OpenAI client
        const openai = new Openai();

        // Store user's credentials
        const result = await openai.setUserCredentials({
            userId: user.openaiIntegrationUserId, // Optional: existing integration user ID
            apiKey: apiKey, // REQUIRED: User's OpenAI API key
            model: model // Optional: per-user default model
        });

        // Save the returned userId to your database
        await prisma.user.update({
            where: { id: currentUserId },
            data: { openaiIntegrationUserId: result.userId }
        });

        return c.json({
            success: true,
            integrationUserId: result.userId
        });
    })
);
```

For Google Generative AI, use `new GoogleGenerativeAI()` and save `googleGenerativeAIIntegrationUserId`.
For Anthropic, use `new Anthropic()` and save `anthropicIntegrationUserId`.

Step 2: Generate Text (PerUser Config)

```typescript
app.post(
    '/ai/chat',
    catchAsync(async c => {
        const { messages, model } = await c.req.json();
        const currentUserId = c.get('userId'); // From auth middleware

        // Get user's integration userId from database
        const user = await prisma.user.findUnique({
            where: { id: currentUserId }
        });

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        const integrationUserId = user.openaiIntegrationUserId; // Replace with the selected provider's integration user ID field.

        if (!integrationUserId) {
            throw new ApiError(400, 'Please connect your selected LLM provider first');
        }

        // Initialize selected LLM client
        const llm = getLLM();
        // Generate text with userId (REQUIRED for PerUser config)
        const result = await llm.generateText({
            userId: integrationUserId, // REQUIRED for PerUser!
            messages: messages,
            model: model
        });

        return c.json({
            success: true,
            result
        });
    })
);
```

**Implement `/ai/chat` endpoint only when the user explicitly requests chat functionality.**
