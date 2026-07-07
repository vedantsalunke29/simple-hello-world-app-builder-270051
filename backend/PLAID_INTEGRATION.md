# Always use "@uptiqai/integrations-sdk" for Plaid integration

Do not install or import the official `plaid` package in application services that talk to the Integration Hub. Plaid must go through `@uptiqai/integrations-sdk`.

> [!IMPORTANT]
> The examples provided below are just sample implementations. While implementing these methods, use whatever logic and fields are required based on the specific application being created.And check integration sdk for supported methods, fields and other details.

## Import

```ts
import { Plaid } from '@uptiqai/integrations-sdk';

const plaid = new Plaid();
```

## Config Type: Shared Config (Hosted Link OAuth)

Plaid integration uses **Shared Config** mode by default with Hosted Link OAuth:

- The Plaid credentials (clientId, clientSecret, countryCodes, clientName) are already configured in the integration settings
- Do not ask users for these developer credentials
- Users complete Hosted Link to connect their bank accounts
- Link completion returns a `userId` that represents the user's connected Item
- **This `userId` must be stored in your database and passed to all API method calls**

This is a **Shared Config** (shared Plaid developer credentials) with **per-user linking** (each user completes Link to get their own Item access token via userId).

**PerUser config (optional):** If the integration is configured as PerUser, each user uses their own Plaid developer credentials. Pass `clientId` and `clientSecret` together on `startHostedLink` (with `userId` when reconnecting). Do not send `clientId` / `clientSecret` for Shared config.

## Connection Flow - IMPORTANT

**Always provide a "Connect bank account" button in your application UI:**

1. **Frontend**: Add a "Connect bank account" button in your settings/integrations page.
2. **Popup**: When clicked, it should open the `url` (obtained from Step 1) in a **popup window**. **Always open the Link flow in a popup.**
3. **Backend**: Hosted Link will redirect to your `originalRedirectUrl`.
4. **Store userId**: Extract and store the `userId` returned in the callback (Step 2 & 3).
5. **Frontend callback**: The frontend `/integrations/plaid/callback` page must notify the parent window with `postMessage` and close the popup.
6. **Use in API calls**: All subsequent Plaid API calls must include this `userId` parameter.

**Connection Status**:

- Check if `user.plaidIntegrationUserId` exists in database to determine if user is connected.
- If not connected, show the "Connect bank account" button.
- If connected, allow access to Plaid features and optionally show "Disconnect" button.

## Hosted Link Flow

Plaid uses Hosted Link OAuth for authentication with automatic callback handling.

### Step 1: Start Hosted Link

Get the Hosted Link URL and redirect the user:

```typescript
const result = await plaid.startHostedLink({
    originalRedirectUrl: `${process.env.BACKEND_DOMAIN}/integrations/plaid/callback`,
    user: {
        client_user_id: appUserId
    }
});
// Returns: { url: 'https://...', userId: '...' }
// Redirect user to this URL
```

### Step 2: Hosted Link Callback (Automatic)

After user completes Link, Plaid redirects to the Integration Hub callback endpoint automatically. The Integration Hub:

1. Completes the Hosted Link session and stores the Item access token
2. Stores the user's access token credentials
3. Redirects user back to your `originalRedirectUrl` with query parameters:
    - `connected=true` - Link was successful
    - `userId=<uuid>` - The integration user ID (REQUIRED - store this in your database!)

**No manual token exchange needed** - the Integration Hub handles this via the callback endpoint.

### Step 3: Handle the Callback

Create a callback route to extract and store the `userId`, generate tokens, and redirect based on the application type:

```typescript
// In your callback handler
app.get(
    '/integrations/plaid/callback',
    catchAsync(async c => {
        const connected = c.req.query('connected');
        const plaidUserId = c.req.query('userId');
        const itemId = c.req.query('itemId');
        const currentUserId = c.get('userId');

        if (connected !== 'true' || !plaidUserId) {
            // ... implement error redirect based on app type (see Step 3 instructions below) ...
        }

        // Save the Plaid integration userId to your database
        const user = await prisma.user.update({
            where: { id: currentUserId },
            data: {
                plaidIntegrationUserId: plaidUserId,
                plaidItemId: itemId ?? null
            }
        });

        // Generate tokens for the redirect
        const tokens = tokenService.generateTokens(user.id, user.email);

        // ... implement success redirect based on app type (see Step 3 instructions below) ...
    })
);
```

**If it is a web app (not mobile), redirect to frontend with tokens using the original redirect URL:**

```typescript
const frontendUrl = process.env.FRONTEND_DOMAIN;
const redirectUrl = new URL('/integrations/plaid/callback', frontendUrl);
redirectUrl.searchParams.set('accessToken', tokens.accessToken);
redirectUrl.searchParams.set('refreshToken', tokens.refreshToken);
redirectUrl.searchParams.set('connected', 'true');
redirectUrl.searchParams.set('userId', plaidUserId);
if (itemId) {
    redirectUrl.searchParams.set('itemId', itemId);
}
return c.redirect(redirectUrl.toString());
```

**If it is a mobile app, redirect to mobile with tokens (Strictly follow below pattern only don't change redirect url pattern at all):**

```typescript
// Keep this redirect path exactly as-is for mobile deep-link handling.
const frontendUrl = process.env.FRONTEND_DOMAIN;
const redirectUrl = new URL('/--/integrations/plaid/callback', frontendUrl);
redirectUrl.searchParams.set('accessToken', tokens.accessToken);
redirectUrl.searchParams.set('refreshToken', tokens.refreshToken);
redirectUrl.searchParams.set('connected', 'true');
redirectUrl.searchParams.set('userId', plaidUserId);
if (itemId) {
    redirectUrl.searchParams.set('itemId', itemId);
}
return c.redirect(redirectUrl.toString());
```

**On error, redirect based on app type using the original redirect URL:**

- If it is a mobile app, redirect to `${frontendUrl}/--/integrations/plaid/callback?error=Plaid%20connection%20failed`
- Otherwise, redirect to `${frontendUrl}/integrations/plaid/callback?error=Plaid%20connection%20failed`

### Step 4: Frontend Popup Callback Behavior

Plaid Hosted Link must use the popup pattern in all environments. Do not use `window.location.href` as the primary connection flow.

**Service Layer:**

```typescript
async function connectPlaid(): Promise<void> {
    const response = await api.post('/integrations/plaid/start');
    const { url } = response.data;

    // STRICT: Open Plaid Hosted Link URL in a popup ONLY.
    window.open(url, '_blank', 'width=600,height=700');
}
```

**Callback Component (`/integrations/plaid/callback`):**

- Extract `connected`, `userId`, `itemId`, and `error` from URL query params.
- **STRICTLY** handle popup closing in all environments.
- Check if opened as popup using `window.opener`.
- If popup: send `postMessage` to opener window and close.
- Message format: `{ type: 'PLAID_LINK_SUCCESS', userId, itemId }` or `{ type: 'PLAID_LINK_ERROR', message: string }`.
- Target origin: `window.location.origin`.
- Fallback: if not popup, show success/error state and provide a return link.

**Main App Message Handler:**

- Add `message` event listener in `useEffect`.
- Validate event origin matches `window.location.origin`.
- On `PLAID_LINK_SUCCESS`: refresh app state or use `window.location.reload()` if your current page handles connected state.
- On `PLAID_LINK_ERROR`: show error message to user.
- Clean up listener on unmount.

**Important Notes:**

- The frontend callback route should be `/integrations/plaid/callback` because the backend callback redirects to `${process.env.FRONTEND_DOMAIN}/integrations/plaid/callback`.
- Always validate `event.origin` before handling Plaid popup messages.
- On `PLAID_LINK_SUCCESS`, refresh app state or reload the page so connection status and Plaid data access update immediately.
- On `PLAID_LINK_ERROR`, show an error notification to the user.

## Error Handling

All Plaid SDK methods may throw errors. Wrap calls in try/catch blocks:

```typescript
try {
    const result = await plaid.getAccounts({
        userId: user.plaidIntegrationUserId // REQUIRED
    });
} catch (error) {
    // Common errors:
    if (error.message.includes('userId') || error.message.includes('User not found')) {
        throw new ApiError(400, 'Please connect your Plaid account first', { requiresLink: true });
    }
    if (
        error.message.includes('ITEM_LOGIN_REQUIRED') ||
        error.message.includes('INVALID_ACCESS_TOKEN') ||
        error.message.includes('expired')
    ) {
        throw new ApiError(401, 'Plaid connection needs attention. Please reconnect your account');
    }
    // Validation errors from the hub (Zod / 400)
    console.error('Plaid API error:', error.message);
    throw new ApiError(error.statusCode || 500, error.message || 'Plaid API request failed');
}
```

## Plaid: Start Hosted Link

```ts
const result = await plaid.startHostedLink({
    user: {
        client_user_id: appUserId, // stable id in your system
        email_address: 'user@example.com', // optional
        phone_number: '+15551234567' // optional
    },
    userId: user.plaidIntegrationUserId, // optional for Shared; required for PerUser
    // PerUser only — store developer keys on the integration user (no separate hub route):
    // clientId: '...',
    // clientSecret: '...',
    originalRedirectUrl: `${process.env.BACKEND_DOMAIN}/integrations/plaid/callback`,
    hosted_link: {
        is_mobile_app: false,
        url_lifetime_seconds: 14400
    }
});
// Returns: { url: 'https://...', userId: '...' }
```

## Plaid: Get accounts

```ts
const result = await plaid.getAccounts({
    userId: user.plaidIntegrationUserId, // REQUIRED: Integration user ID from Hosted Link
    account_ids: ['acc_xxx'] // optional filter
});
```

## Plaid: Get account balances

```ts
const result = await plaid.getAccountBalances({
    userId: user.plaidIntegrationUserId, // REQUIRED: Integration user ID from Hosted Link
    account_ids: ['acc_xxx'] // optional
});
```

## Plaid: Get Auth (ACH)

```ts
const result = await plaid.getAuth({
    userId: user.plaidIntegrationUserId, // REQUIRED: Integration user ID from Hosted Link
    account_ids: ['acc_xxx'] // optional
});
```

## Plaid: Sync transactions (cursor)

```ts
const result = await plaid.syncTransactions({
    userId: user.plaidIntegrationUserId, // REQUIRED: Integration user ID from Hosted Link
    cursor: previousCursor ?? '', // empty string for first page
    count: 250 // optional, max 500
});
```

## Plaid: Get recurring transactions

```ts
const result = await plaid.getRecurringTransactions({
    userId: user.plaidIntegrationUserId, // REQUIRED: Integration user ID from Hosted Link
    account_ids: ['acc_xxx'] // optional
});
```

## Plaid: Get transactions (legacy date range)

```ts
const result = await plaid.getTransactions({
    userId: user.plaidIntegrationUserId, // REQUIRED: Integration user ID from Hosted Link
    start_date: '2026-01-01',
    end_date: '2026-05-14',
    account_ids: ['acc_xxx'], // optional
    count: 100, // optional
    offset: 0 // optional
});
```

## Plaid: Get Identity

```ts
const result = await plaid.getIdentity({
    userId: user.plaidIntegrationUserId, // REQUIRED: Integration user ID from Hosted Link
    account_ids: ['acc_xxx'] // optional
});
```

## Plaid: Get Item

```ts
const result = await plaid.getItem({
    userId: user.plaidIntegrationUserId // REQUIRED: Integration user ID from Hosted Link
});
```

## Plaid: Remove Item

Disconnects the Item at Plaid and clears stored Plaid tokens on the integration user.

```ts
const result = await plaid.removeItem({
    userId: user.plaidIntegrationUserId // REQUIRED: Integration user ID from Hosted Link
});
```

## Plaid: Get institution by ID

```ts
const result = await plaid.getInstitutionById({
    institution_id: 'ins_10',
    country_codes: ['US'],
    userId: user.plaidIntegrationUserId // required for PerUser; optional for Shared
});
```

## Plaid: Investment holdings

```ts
const result = await plaid.getInvestmentsHoldings({
    userId: user.plaidIntegrationUserId, // REQUIRED: Integration user ID from Hosted Link
    account_ids: ['acc_xxx'] // optional
});
```

## Plaid: Investment transactions

```ts
const result = await plaid.getInvestmentsTransactions({
    userId: user.plaidIntegrationUserId, // REQUIRED: Integration user ID from Hosted Link
    start_date: '2026-01-01',
    end_date: '2026-05-14',
    account_ids: ['acc_xxx'], // optional
    count: 100,
    offset: 0
});
```

## Plaid: Liabilities

```ts
const result = await plaid.getLiabilities({
    userId: user.plaidIntegrationUserId, // REQUIRED: Integration user ID from Hosted Link
    account_ids: ['acc_xxx'] // optional
});
```

## Plaid: Asset Report — create

Requires the linked Item to have been created with the **assets** product (per Plaid rules).

```ts
const result = await plaid.createAssetReport({
    userId: user.plaidIntegrationUserId, // REQUIRED: Integration user ID from Hosted Link
    days_requested: 731, // optional
    options: {} // optional, forwarded to Plaid
});
```

## Plaid: Asset Report — get JSON

```ts
const result = await plaid.getAssetReport({
    userId: user.plaidIntegrationUserId, // optional for Shared; required for PerUser
    asset_report_token: tokenFromCreateOrRefresh,
    include_insights: true, // optional
    fast_report: false // optional
});
```

## Plaid: Asset Report — refresh

```ts
const result = await plaid.refreshAssetReport({
    userId: user.plaidIntegrationUserId, // optional for Shared; required for PerUser
    asset_report_token: token,
    days_requested: 365, // optional
    options: {} // optional
});
```

## Plaid: Asset Report — PDF (base64)

Returns JSON with base64-encoded PDF bytes. Report must be ready (for example after Plaid webhooks).

```ts
const result = await plaid.getAssetReportPdf({
    userId: user.plaidIntegrationUserId, // optional for Shared; required for PerUser
    asset_report_token: token
});
// Returns: { pdf_base64: '...' }
```

## Complete Hosted Link Flow Example (Shared Config)

```typescript
import catchAsync from '../utils/catchAsync';
import { Plaid } from '@uptiqai/integrations-sdk';
import { Hono } from 'hono';

const app = new Hono();

// Step 1: Start Hosted Link — return URL to the client
app.post(
    '/integrations/plaid/start',
    catchAsync(async c => {
        const currentUserId = c.get('userId');
        const plaid = new Plaid();
        const { url, userId } = await plaid.startHostedLink({
            user: { client_user_id: currentUserId },
            userId: undefined, // or persisted plaidIntegrationUserId for PerUser
            originalRedirectUrl: `${process.env.BACKEND_DOMAIN}/integrations/plaid/callback`
        });

        await prisma.user.update({
            where: { id: currentUserId },
            data: { plaidIntegrationUserId: userId }
        });

        return c.json({
            success: true,
            url
        });
    })
);

// Step 2: Handle Hosted Link callback — persist userId (and optional itemId)
app.get(
    '/integrations/plaid/callback',
    catchAsync(async c => {
        const connected = c.req.query('connected');
        const plaidUserId = c.req.query('userId');
        const itemId = c.req.query('itemId');
        const currentUserId = c.get('userId');

        if (connected !== 'true' || !plaidUserId) {
            // ... implement error redirect based on app type (see Step 3) ...
        }

        const user = await prisma.user.update({
            where: { id: currentUserId },
            data: {
                plaidIntegrationUserId: plaidUserId,
                plaidItemId: itemId ?? null
            }
        });

        // Generate tokens for the redirect
        const tokens = tokenService.generateTokens(user.id, user.email);

        // ... implement success redirect based on app type (see Step 3) ...
    })
);

// Step 3: Use Plaid data APIs (userId REQUIRED)
app.get(
    '/plaid/accounts',
    catchAsync(async c => {
        const currentUserId = c.get('userId');

        const user = await prisma.user.findUnique({
            where: { id: currentUserId }
        });

        if (!user || !user.plaidIntegrationUserId) {
            throw new ApiError(400, 'Please connect your Plaid account first');
        }

        const plaid = new Plaid();
        const result = await plaid.getAccounts({
            userId: user.plaidIntegrationUserId // REQUIRED
        });

        return c.json({
            success: true,
            data: result
        });
    })
);
```