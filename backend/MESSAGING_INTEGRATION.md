# Always use "@uptiqai/integrations-sdk" for WhatsApp messaging integration

Do not install or import the direct Twilio or WhatsApp packages. WhatsApp messaging must go through `@uptiqai/integrations-sdk`.

## Import

```ts
import { TwilioWhatsapp } from '@uptiqai/integrations-sdk';

// Initialize the client
const twilioWhatsapp = new TwilioWhatsapp();
```

## Config Types: Shared vs PerUser

WhatsApp messaging integrations support two configuration modes: `Shared` and `PerUser`. The provided integration context is an array of all enabled integrations, where each item includes `integrationName` and `configType`. To determine the WhatsApp messaging mode, find the matching WhatsApp/Twilio integration item and use its `configType`.

### **Shared Config**

- The Twilio WhatsApp credentials are shared by all users and are already configured. Do not ask users for Twilio credentials in this mode.

## WhatsApp: Send Message (Shared Config)

```ts
const result = await twilioWhatsapp.createMessage({
    to: 'whatsapp:+1234567890',
    body: 'Hello world!'
});
```

## WhatsApp: Send Media Message (Shared Config)

```ts
const result = await twilioWhatsapp.createMessage({
    to: 'whatsapp:+1234567890',
    body: 'Here is an image',
    mediaUrls: ['https://example.com/image.png']
});
```

### **Per User Config**

- Users must provide their Twilio WhatsApp credentials before they can send messages.
- take accountSid(REQUIRED), authToken(REQUIRED),from(REQUIRED ) from the user.
  Step 1: Connect User's Twilio WhatsApp Credentials (PerUser Config)

```typescript
import catchAsync from '../utils/catchAsync';
import { TwilioWhatsapp } from '@uptiqai/integrations-sdk';
import { Hono } from 'hono';

const app = new Hono();
// Connect user's Twilio WhatsApp credentials
app.post(
    '/whatsapp/connect',
    catchAsync(async c => {
        const { accountSid, authToken, from, messagingServiceSid } = await c.req.json();
        const currentUserId = c.get('userId'); // From auth middleware

        // Get existing integration userId if user previously connected
        const user = await prisma.user.findUnique({
            where: { id: currentUserId }
        });

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // Initialize Twilio WhatsApp client
        const twilioWhatsapp = new TwilioWhatsapp();

        // Store user's credentials
        const result = await twilioWhatsapp.setUserCredentials({
            userId: user.twilioWhatsappIntegrationUserId, // Optional: existing integration user ID
            accountSid: accountSid, // REQUIRED: User's Twilio Account SID
            authToken: authToken, // REQUIRED: User's Twilio Auth Token
            from: from // REQUIRED: user's WhatsApp sender number
        });

        // Save the returned userId to your database
        await prisma.user.update({
            where: { id: currentUserId },
            data: { twilioWhatsappIntegrationUserId: result.userId }
        });

        return c.json({
            success: true,
            integrationUserId: result.userId
        });
    })
);
```

Step 2: Send WhatsApp Message (PerUser Config)

```typescript
import { TwilioWhatsapp } from '@uptiqai/integrations-sdk';

app.post(
    '/send-whatsapp-message',
    catchAsync(async c => {
        const { to, body, mediaUrls } = await c.req.json();
        const currentUserId = c.get('userId'); // From auth middleware

        // Get user's integration userId from database
        const user = await prisma.user.findUnique({
            where: { id: currentUserId }
        });

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        if (!user.twilioWhatsappIntegrationUserId) {
            throw new ApiError(400, 'Please connect your Twilio WhatsApp account first');
        }

        // Initialize Twilio WhatsApp client
        const twilioWhatsapp = new TwilioWhatsapp();
        // Send message with userId (REQUIRED for PerUser config)
        const result = await twilioWhatsapp.createMessage({
            userId: user.twilioWhatsappIntegrationUserId, // REQUIRED for PerUser!
            to: to,
            body: body,
            mediaUrls: mediaUrls
        });

        return c.json({
            success: true,
            messageSid: result.sid,
            status: result.status
        });
    })
);
```
