## Config Types: Shared vs PerUser

Stripe integrations support two configuration modes: `Shared` and `PerUser`. The provided integration context is an array of all enabled integrations, where each item includes `integrationName` and `configType`. To determine the Stripe payment mode, find the matching Stripe integration item and use its `configType`.

### **Shared Config**

- The Stripe credentials are shared by all users and are already configured. Do not ask users for Stripe credentials in this mode.

### Create Checkout Session (POST /payment/create-checkout-session)

**Controller implementation:**

```typescript
import { Stripe } from '@uptiqai/integrations-sdk';
```

1. Get Stripe client:
    ```typescript
    const stripe = new Stripe();
    ```
2. Prepare success and cancel URLs (based on app type):

    ```typescript
    const frontendDomain = process.env.FRONTEND_DOMAIN;

    // For mobile app: Use /--/ prefix for deep-link handling
    // const successUrl = `${frontendDomain}/--/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    // const cancelUrl = `${frontendDomain}/--/payment/cancel`;

    // For web app: Use normal path
    const successUrl = `${frontendDomain}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendDomain}/payment/cancel`;
    ```

3. Create checkout session:
    ```typescript
    const session = await stripe.createCheckoutSession({
        amount: body.amount,
        currency: body.currency,
        productName: body.productName,
        customerEmail: body.customerEmail,
        successUrl,
        cancelUrl,
        // Use backend callback because backend must handle webhook events.
        originalWebhookUrl: `${process.env.BACKEND_DOMAIN}/payment/stripe/webhook`
    });
    ```
4. Return checkout URL: `return c.json({ sessionUrl: session.url, sessionId: session.id });`
5. Do not implement Stripe webhook signature verification in the generated app. IntegrationHub owns webhook relay, signature verification, and forwarding verified events to `originalWebhookUrl`.

---

### **Per User Config**

- Users must provide their Stripe credentials before they can create checkout sessions.
- Assume `prisma`, auth middleware, and `ApiError` already exist in the app, or import them from the app's existing utilities.
- take secretKey(REQUIRED) , webhookSecret(REQUIRED) from the user. and show the redirect url on the frontend modal.
- VERY IMPORTANT: For PerUser Stripe config, for web app show `import.meta.env.VITE_STRIPE_WEBHOOK_URL` or for mobile app show `process.env.EXPO_PUBLIC_STRIPE_WEBHOOK_URL`(dont differ and always use this env variable only) in the Stripe credentials modal (modal) so users can copy it into their Stripe dashboard webhook settings

Step 1: Connect User's Stripe Credentials (PerUser Config)

```typescript
import catchAsync from '../utils/catchAsync';
import { Stripe } from '@uptiqai/integrations-sdk';
import { Hono } from 'hono';

const app = new Hono();
// Connect user's Stripe credentials
app.post(
    '/payment/stripe/connect',
    catchAsync(async c => {
        const { secretKey, webhookSecret } = await c.req.json();
        const currentUserId = c.get('userId'); // From auth middleware

        // Get existing integration userId if user previously connected
        const user = await prisma.user.findUnique({
            where: { id: currentUserId }
        });

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // Initialize Stripe client
        const stripe = new Stripe();

        // Store user's credentials
        const result = await stripe.setUserCredentials({
            userId: user.stripeIntegrationUserId, // Optional: existing integration user ID
            secretKey: secretKey, // REQUIRED: User's Stripe secret key
            webhookSecret: webhookSecret // REQUIRED when using per-user Stripe webhooks
        });

        // Save the returned userId to your database
        await prisma.user.update({
            where: { id: currentUserId },
            data: { stripeIntegrationUserId: result.userId }
        });

        return c.json({
            success: true,
            integrationUserId: result.userId
        });
    })
);
```

Step 2: Create Checkout Session (PerUser Config)

```typescript
import { Stripe } from '@uptiqai/integrations-sdk';

app.post(
    '/payment/create-checkout-session',
    catchAsync(async c => {
        const body = await c.req.json();
        const currentUserId = c.get('userId'); // From auth middleware

        // Get user's integration userId from database
        const user = await prisma.user.findUnique({
            where: { id: currentUserId }
        });

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        if (!user.stripeIntegrationUserId) {
            throw new ApiError(400, 'Please connect your Stripe account first');
        }

        const frontendDomain = process.env.FRONTEND_DOMAIN;
        const successUrl = `${frontendDomain}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${frontendDomain}/payment/cancel`;

        const stripe = new Stripe();
        const session = await stripe.createCheckoutSession({
            userId: user.stripeIntegrationUserId,
            amount: body.amount,
            currency: body.currency,
            productName: body.productName,
            customerEmail: body.customerEmail,
            successUrl,
            cancelUrl,
            // Use backend callback because backend must handle webhook events.
            originalWebhookUrl: `${process.env.BACKEND_DOMAIN}/payment/stripe/webhook`
        });

        return c.json({
            sessionUrl: session.url,
            sessionId: session.id
        });
    })
);
```

---

### Stripe Webhook Callback (POST /payment/stripe/webhook)

**Controller implementation:**

1. Extract webhook event from request body. IntegrationHub has ALREADY verified the Stripe signature.
    ```typescript
    const stripeEvent = await c.req.json();
    ```
2. Process the verified event:
    ```typescript
    if (stripeEvent.type === 'checkout.session.completed') {
        const session = stripeEvent.data.object;
        // Update payment status, activate subscription, etc.
    }
    ```
3. Return success response:
    ```typescript
    return c.json({ received: true });
    ```

**IntegrationHub automatically handles:**

- Stripe webhook signature verification
- Event relay to your app's webhook endpoint
- Retry logic for failed deliveries
