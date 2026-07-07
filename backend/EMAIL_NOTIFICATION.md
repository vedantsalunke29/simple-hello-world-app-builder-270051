# Always use "@uptiqai/integrations-sdk" for email integration

Do not install or import the direct `resend` package. Email sending must go through `@uptiqai/integrations-sdk`.

## Import

```ts
import { Resend } from '@uptiqai/integrations-sdk';

// Initialize the client
const resend = new Resend();
```

## Config Types: Shared vs PerUser

Email integrations support two configuration modes: `Shared` and `PerUser`. The provided integration context is an array of all enabled integrations and is the source of truth for which mode to use. Find the matching email integration in that array and use its `configType`;

### **Shared Config**

- The Resend credentials are shared by all users and are already configured. Do not ask users for API keys in this mode.

## Email: Send (Shared Config)

```ts
const result = await resend.sendEmail({
    to: ['user@example.com'],
    subject: 'Welcome to UPTIQ',
    html: '<p>Hello from UPTIQ</p>'
});
```

## Email: Attachments (Shared Config)

```ts
const result = await resend.sendEmail({
    to: ['user@example.com'],
    subject: 'Invoice',
    text: 'Please find the invoice attached.',
    attachments: [
        {
            filename: 'invoice.pdf',
            contentType: 'application/pdf',
            content: base64Pdf
        }
    ]
});
```

### **Per User Config**

- Users must provide their API key before they can send emails.
- Assume `prisma`, auth middleware, and `ApiError` already exist in the app, or import them from the app's existing utilities.
- take apiKey(REQUIRED), from(REQUIRED ) from the user.

Step 1: Connect User's API Key (PerUser Config)

```typescript
import catchAsync from '../utils/catchAsync';
import { Resend } from '@uptiqai/integrations-sdk';
import { Hono } from 'hono';

const app = new Hono();
// Connect user's Resend API key
app.post(
    '/email/connect',
    catchAsync(async c => {
        const { apiKey, from } = await c.req.json();
        const currentUserId = c.get('userId'); // From auth middleware

        // Get existing integration userId if user previously connected
        const user = await prisma.user.findUnique({
            where: { id: currentUserId }
        });

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // Initialize Resend client
        const resend = new Resend();

        // Store user's credentials
        const result = await resend.setUserCredentials({
            userId: user.resendIntegrationUserId, // Optional: existing integration user ID
            apiKey: apiKey, // REQUIRED: User's Resend API key
            from: from // REQUIRED: per-user from address;
        });

        // Save the returned userId to your database
        await prisma.user.update({
            where: { id: currentUserId },
            data: { resendIntegrationUserId: result.userId }
        });

        return c.json({
            success: true,
            integrationUserId: result.userId
        });
    })
);
```

Step 2: Send Email (PerUser Config)

```typescript
import { Resend } from '@uptiqai/integrations-sdk';

app.post(
    '/send-email',
    catchAsync(async c => {
        const { to, subject, html } = await c.req.json();
        const currentUserId = c.get('userId'); // From auth middleware

        // Get user's integration userId from database
        const user = await prisma.user.findUnique({
            where: { id: currentUserId }
        });

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        if (!user.resendIntegrationUserId) {
            throw new ApiError(400, 'Please connect your Resend account first');
        }

        // Initialize Resend client
        const resend = new Resend();
        // Send email with userId (REQUIRED for PerUser config)
        const result = await resend.sendEmail({
            userId: user.resendIntegrationUserId, // REQUIRED for PerUser!
            to: [to],
            subject: subject,
            html: html
        });

        return c.json({
            success: true,
            messageId: result.id
        });
    })
);
```
