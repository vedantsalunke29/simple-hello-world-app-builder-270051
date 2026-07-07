# Always use "@uptiqai/integrations-sdk" for Wealthbox CRM integration

Do not install or import the direct Wealthbox packages. Wealthbox CRM integration must go through `@uptiqai/integrations-sdk`.

> [!IMPORTANT]
> The examples provided below are just sample implementations. While implementing these methods, use whatever logic and fields are required based on the specific application being created.And check integration sdk for supported methods, fields and other details.

## Import

```ts
import { Wealthbox } from '@uptiqai/integrations-sdk';

const wealthbox = new Wealthbox();
```

## Config Type: Shared Config (OAuth-based)

Wealthbox CRM integration uses **Shared Config** mode with OAuth authentication:

- The Wealthbox OAuth credentials (clientId, clientSecret) are already configured in the integration settings
- Do not ask users for these OAuth credentials
- Users complete OAuth flow to connect their personal Wealthbox account
- OAuth callback returns a `userId` that represents the user's connected account
- **This `userId` must be stored in your database and passed to all API method calls**

This is a **Shared Config** (shared OAuth credentials) with **per-user authentication** (each user completes OAuth to get their own access token via userId).

## Connection Flow - IMPORTANT

**Always provide a "Connect to Wealthbox" button in your application UI:**

1. **Frontend**: Add a "Connect to Wealthbox" button in your settings/integrations page.
2. **Popup**: When clicked, it should open the `authorizationUrl` (obtained from Step 1) in a **popup window**. **Always open the authorization flow in a popup.**
3. **Backend**: The OAuth flow will redirect to your `originalRedirectUrl`.
4. **Store userId**: Extract and store the `userId` returned in the callback (Step 2 & 3).
5. **Use in API calls**: All subsequent Wealthbox API calls must include this `userId` parameter.

**Connection Status**:

- Check if `user.wealthboxIntegrationUserId` exists in database to determine if user is connected.
- If not connected, show the "Connect to Wealthbox" button.
- If connected, allow access to Wealthbox features and optionally show "Disconnect" button.

## OAuth Flow

Wealthbox uses OAuth 2.0 for authentication with automatic callback handling.

### Step 1: Initiate OAuth

Get the authorization URL and redirect the user:

```typescript
const result = await wealthbox.oauthInitiate({
    originalRedirectUrl: `${process.env.BACKEND_DOMAIN}/integrations/wealthbox/callback`
});
// Returns: { authorizationUrl: 'https://api.crmworkspace.com/v1/oauth/authorize?...' }
// Redirect user to this URL
```

### Step 2: OAuth Callback (Automatic)

After user authorizes, Wealthbox redirects to the Integration Hub callback endpoint automatically. The Integration Hub:

1. Exchanges the code for an access token
2. Stores the user's access token credentials
3. Redirects user back to your `originalRedirectUrl` with query parameters:
    - `connected=true` - OAuth was successful
    - `userId=<uuid>` - The integration user ID (REQUIRED - store this in your database!)

**No manual code exchange needed** - the Integration Hub handles this via the callback endpoint.

### Step 3: Handle the Callback

Create a callback route to extract and store the `userId`:

```typescript
// In your callback handler
app.get(
    '/integrations/wealthbox/callback',
    catchAsync(async c => {
        const connected = c.req.query('connected');
        const wealthboxUserId = c.req.query('userId');
        const currentUserId = c.get('userId'); // From your auth middleware

        if (connected !== 'true' || !wealthboxUserId) {
            // OAuth failed - redirect to frontend callback with error
            const frontendUrl = process.env.FRONTEND_DOMAIN;
            const redirectUrl = new URL('/integrations/wealthbox/callback', frontendUrl);
            redirectUrl.searchParams.set('error', 'Wealthbox OAuth connection failed');
            return c.redirect(redirectUrl.toString());
        }

        // Save the Wealthbox integration userId to your database
        await prisma.user.update({
            where: { id: currentUserId },
            data: { wealthboxIntegrationUserId: wealthboxUserId }
        });

        // Redirect to frontend callback page (like Google OAuth pattern)
        const frontendUrl = process.env.FRONTEND_DOMAIN;
        const redirectUrl = new URL('/integrations/wealthbox/callback', frontendUrl);
        redirectUrl.searchParams.set('connected', 'true');
        redirectUrl.searchParams.set('userId', wealthboxUserId);
        return c.redirect(redirectUrl.toString());
    })
);
```

## Error Handling

All Wealthbox SDK methods may throw errors. Wrap calls in try-catch blocks:

```typescript
try {
    const result = await wealthbox.getContacts({
        userId: user.wealthboxIntegrationUserId,
        page: 1
    });
} catch (error) {
    // Common errors:
    if (error.message.includes('accessToken is required')) {
        // User hasn't connected Wealthbox or OAuth expired
        throw new ApiError(401, 'Please connect your Wealthbox account', { requiresOAuth: true });
    }
    if (error.message.includes('Invalid token') || error.message.includes('expired')) {
        // Access token expired and refresh failed - need to reconnect
        throw new ApiError(401, 'Wealthbox connection expired. Please reconnect');
    }
    // Network/API errors
    console.error('Wealthbox API error:', error.message);
    throw new ApiError(error.statusCode || 500, error.message || 'Wealthbox API request failed');
}
```

## Wealthbox: Get Contacts

```ts
const result = await wealthbox.getContacts({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    page: 1,
    per_page: 50
});
```

## Wealthbox: Get Contact

```ts
const result = await wealthbox.getContact({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    contactId: 12345 // Contact ID
});
```

## Wealthbox: Create Contact

```ts
const result = await wealthbox.createContact({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com'
});
```

## Wealthbox: Update Contact

```ts
const result = await wealthbox.updateContact({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    contactId: 12345, // Contact ID
    first_name: 'Jane', // Any Wealthbox contact fields to update
    phone: '555-1234'
});
```

## Wealthbox: Delete Contact

```ts
const result = await wealthbox.deleteContact({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    contactId: 12345 // Contact ID
});
```

## Wealthbox: Get Tasks

```ts
const result = await wealthbox.getTasks({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    page: 1,
    per_page: 50,
    complete: false
});
```

## Wealthbox: Get Task

```ts
const result = await wealthbox.getTask({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    taskId: 12345 // Task ID
});
```

## Wealthbox: Create Task

```ts
const result = await wealthbox.createTask({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    name: 'Follow up call', // Required: task name
    due_date: '2026-05-15', // Optional: due date (YYYY-MM-DD)
    contact_id: 123 // Optional: associated contact ID
    // Add any additional Wealthbox task fields as needed
});
```

## Wealthbox: Update Task

```ts
const result = await wealthbox.updateTask({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    taskId: 12345, // Task ID
    complete: true // Any Wealthbox task fields to update
});
```

## Wealthbox: Delete Task

```ts
const result = await wealthbox.deleteTask({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    taskId: 12345 // Task ID
});
```

## Wealthbox: Get Events

```ts
const result = await wealthbox.getEvents({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    page: 1,
    per_page: 50
});
```

## Wealthbox: Get Event

```ts
const result = await wealthbox.getEvent({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    eventId: 12345 // Event ID
});
```

## Wealthbox: Create Event

```ts
const result = await wealthbox.createEvent({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    name: 'Client meeting', // Required: event name
    starts_at: '2026-05-15T10:00:00Z', // Required: start time (ISO 8601)
    ends_at: '2026-05-15T11:00:00Z' // Required: end time (ISO 8601)
    // Add any additional Wealthbox event fields as needed
});
```

## Wealthbox: Update Event

```ts
const result = await wealthbox.updateEvent({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    eventId: 12345, // Event ID
    name: 'Rescheduled client meeting' // Any Wealthbox event fields to update
});
```

## Wealthbox: Delete Event

```ts
const result = await wealthbox.deleteEvent({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    eventId: 12345 // Event ID
});
```

## Wealthbox: Get Opportunities

```ts
const result = await wealthbox.getOpportunities({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    page: 1,
    per_page: 50,
    status: 'open'
});
```

## Wealthbox: Get Opportunity

```ts
const result = await wealthbox.getOpportunity({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    opportunityId: 12345 // Opportunity ID
});
```

## Wealthbox: Create Opportunity

```ts
const result = await wealthbox.createOpportunity({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    name: 'New investment opportunity', // Required: opportunity name
    value: 100000, // Optional: monetary value
    contact_id: 123 // Optional: associated contact ID
    // Add any additional Wealthbox opportunity fields as needed
});
```

## Wealthbox: Update Opportunity

```ts
const result = await wealthbox.updateOpportunity({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    opportunityId: 12345, // Opportunity ID
    status: 'won' // Any Wealthbox opportunity fields to update
});
```

## Wealthbox: Delete Opportunity

```ts
const result = await wealthbox.deleteOpportunity({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    opportunityId: 12345 // Opportunity ID
});
```

## Wealthbox: Get Notes

```ts
const result = await wealthbox.getNotes({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    page: 1,
    per_page: 50
});
```

## Wealthbox: Get Note

```ts
const result = await wealthbox.getNote({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    noteId: 12345 // Note ID
});
```

## Wealthbox: Create Note

```ts
const result = await wealthbox.createNote({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    note: 'Client prefers email communication', // Required: note content
    contact_id: 123 // Optional: associated contact ID
    // Add any additional Wealthbox note fields as needed
});
```

## Wealthbox: Update Note

```ts
const result = await wealthbox.updateNote({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    noteId: 12345, // Note ID
    note: 'Updated note content' // Any Wealthbox note fields to update
});
```

## Wealthbox: Get Projects

```ts
const result = await wealthbox.getProjects({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    page: 1,
    per_page: 50
});
```

## Wealthbox: Get Project

```ts
const result = await wealthbox.getProject({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    projectId: 12345 // Project ID
});
```

## Wealthbox: Create Project

```ts
const result = await wealthbox.createProject({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    name: 'Estate Planning Project', // Required: project name
    contact_id: 123 // Optional: associated contact ID
    // Add any additional Wealthbox project fields as needed
});
```

## Wealthbox: Update Project

```ts
const result = await wealthbox.updateProject({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    projectId: 12345, // Project ID
    status: 'completed' // Any Wealthbox project fields to update
});
```

## Wealthbox: Delete Project

```ts
const result = await wealthbox.deleteProject({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    projectId: 12345 // Project ID
});
```

## Wealthbox: Get Workflows

```ts
const result = await wealthbox.getWorkflows({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    page: 1,
    per_page: 50,
    status: 'active'
});
```

## Wealthbox: Get Workflow

```ts
const result = await wealthbox.getWorkflow({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    workflowId: 12345 // Workflow ID
});
```

## Wealthbox: Create Workflow

```ts
const result = await wealthbox.createWorkflow({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    workflow_template_id: 456, // Required: workflow template to use
    contact_id: 123 // Optional: associated contact ID
    // Add any additional Wealthbox workflow fields as needed
});
```

## Wealthbox: Delete Workflow

```ts
const result = await wealthbox.deleteWorkflow({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    workflowId: 12345 // Workflow ID
});
```

## Wealthbox: Complete Workflow Step

```ts
const result = await wealthbox.completeWorkflowStep({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    workflowStepId: 12345 // The workflow step ID to mark as complete
});
```

## Wealthbox: Revert Workflow Step

```ts
const result = await wealthbox.revertWorkflowStep({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    workflowStepId: 12345 // The workflow step ID to revert
});
```

## Wealthbox: Add Household Member

```ts
const result = await wealthbox.addHouseholdMember({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    household_id: 12345, // The household's ID in Wealthbox
    id: 678, // The contact ID to add as a household member
    title: 'Spouse' // REQUIRED: relationship to household (enum)
});
```

## Wealthbox: Remove Household Member

```ts
const result = await wealthbox.removeHouseholdMember({
    userId: user.wealthboxIntegrationUserId, // REQUIRED: Integration user ID from OAuth
    household_id: 12345, // The household's ID in Wealthbox
    id: 678 // The contact ID to remove from the household
});
```

## Wealthbox: Get Me

```ts
const result = await wealthbox.getMe({
    userId: user.wealthboxIntegrationUserId // REQUIRED: Integration user ID from OAuth
});
```

## Wealthbox: Get Users

```ts
const result = await wealthbox.getUsers({
    userId: user.wealthboxIntegrationUserId // REQUIRED: Integration user ID from OAuth
});
```

## Wealthbox: Get Teams

```ts
const result = await wealthbox.getTeams({
    userId: user.wealthboxIntegrationUserId // REQUIRED: Integration user ID from OAuth
});
```

## Wealthbox: Get Tags

```ts
const result = await wealthbox.getTags({
    userId: user.wealthboxIntegrationUserId // REQUIRED: Integration user ID from OAuth
});
```

## Wealthbox: Get Custom Fields

```ts
const result = await wealthbox.getCustomFields({
    userId: user.wealthboxIntegrationUserId // REQUIRED: Integration user ID from OAuth
});
```

## Wealthbox: Get Contact Roles

```ts
const result = await wealthbox.getContactRoles({
    userId: user.wealthboxIntegrationUserId // REQUIRED: Integration user ID from OAuth
});
```

## Wealthbox: Get Workflow Templates

```ts
const result = await wealthbox.getWorkflowTemplates({
    userId: user.wealthboxIntegrationUserId // REQUIRED: Integration user ID from OAuth
});
```

## Wealthbox: Get Activity

```ts
const result = await wealthbox.getActivity({
    userId: user.wealthboxIntegrationUserId // REQUIRED: Integration user ID from OAuth
});
```

## Complete OAuth Flow Example (Shared Config)

```typescript
import catchAsync from '../utils/catchAsync';
import { Wealthbox } from '@uptiqai/integrations-sdk';
import { Hono } from 'hono';

const app = new Hono();

// Step 1: Initiate OAuth - Get authorization URL
app.post(
    '/wealthbox/connect',
    catchAsync(async c => {
        const wealthbox = new Wealthbox();
        const result = await wealthbox.oauthInitiate({
            originalRedirectUrl: `${process.env.BACKEND_DOMAIN}/integrations/wealthbox/callback`
        });

        return c.json({
            success: true,
            authorizationUrl: result.authorizationUrl
        });
    })
);

// Step 2: Handle OAuth callback - Extract and store userId
app.get(
    '/integrations/wealthbox/callback',
    catchAsync(async c => {
        const connected = c.req.query('connected');
        const wealthboxUserId = c.req.query('userId');
        const currentUserId = c.get('userId'); // From your auth middleware

        if (connected !== 'true' || !wealthboxUserId) {
            // OAuth failed - redirect to frontend callback with error
            const frontendUrl = process.env.FRONTEND_DOMAIN;
            const redirectUrl = new URL('/integrations/wealthbox/callback', frontendUrl);
            redirectUrl.searchParams.set('error', 'Wealthbox OAuth connection failed');
            return c.redirect(redirectUrl.toString());
        }

        // Save the Wealthbox integration userId to your database
        await prisma.user.update({
            where: { id: currentUserId },
            data: { wealthboxIntegrationUserId: wealthboxUserId }
        });

        // Redirect to frontend callback page (like Google OAuth pattern)
        const frontendUrl = process.env.FRONTEND_DOMAIN;
        const redirectUrl = new URL('/integrations/wealthbox/callback', frontendUrl);
        redirectUrl.searchParams.set('connected', 'true');
        redirectUrl.searchParams.set('userId', wealthboxUserId);
        return c.redirect(redirectUrl.toString());
    })
);

// Step 3: Use Wealthbox API methods (userId REQUIRED)
app.get(
    '/wealthbox/contacts',
    catchAsync(async c => {
        const page = parseInt(c.req.query('page') || '1');
        const currentUserId = c.get('userId'); // From your auth middleware

        // Get user's Wealthbox integration userId from database
        const user = await prisma.user.findUnique({
            where: { id: currentUserId }
        });

        if (!user || !user.wealthboxIntegrationUserId) {
            throw new ApiError(400, 'Please connect your Wealthbox account first');
        }

        const wealthbox = new Wealthbox();
        const result = await wealthbox.getContacts({
            userId: user.wealthboxIntegrationUserId, // REQUIRED
            page: page,
            per_page: 50
        });

        return c.json({
            success: true,
            data: result
        });
    })
);

app.post(
    '/wealthbox/contacts',
    catchAsync(async c => {
        const body = await c.req.json();
        const currentUserId = c.get('userId'); // From your auth middleware

        // Get user's Wealthbox integration userId from database
        const user = await prisma.user.findUnique({
            where: { id: currentUserId }
        });

        if (!user || !user.wealthboxIntegrationUserId) {
            throw new ApiError(400, 'Please connect your Wealthbox account first');
        }

        const wealthbox = new Wealthbox();
        // While calling Wealthbox API ensure each field is passed as shown below never directly spread the body
        const result = await wealthbox.createContact({
            userId: user.wealthboxIntegrationUserId, // REQUIRED
            first_name: body.firstName,
            last_name: body.lastName,
            email: body.email,
            phone: body.phone
        });

        return c.json({
            success: true,
            data: result
        });
    })
);
```
