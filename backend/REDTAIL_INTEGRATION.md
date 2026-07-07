# Always use "@uptiqai/integrations-sdk" for Redtail CRM integration

Do not install or import the direct Redtail packages. Redtail CRM integration must go through `@uptiqai/integrations-sdk`.

> [!IMPORTANT]
> The examples provided below are just sample implementations. While implementing these methods, use whatever logic and fields are required based on the specific application being created. And check integration sdk for supported methods, fields and other details.

## Import

```ts
import { Redtail } from '@uptiqai/integrations-sdk';

// Initialize the client
const redtail = new Redtail();
```

## Config Type: Shared Config

Redtail CRM integration uses **Shared Config** mode:

- The Redtail CRM credentials (partnerApiKey, username, password) are shared and already configured in the integration settings
- Do not ask users for Redtail credentials
- Call `authenticate()` to obtain a userId for the current user using the shared credentials
- **This `userId` must be stored in your database and passed to all API method calls**

## Connection Flow - IMPORTANT

**Always provide a "Connect to Redtail" button in your application UI:**

1. **Frontend**: Add a "Connect to Redtail" button in your settings/integrations page
2. **Backend**: When the button is clicked, call the `/redtail/authenticate` endpoint
3. **Store userId**: The authenticate endpoint will call `redtail.authenticate()` and store the returned `userId` in your database
4. **Use in API calls**: All subsequent Redtail API calls must include this `userId` parameter

**Connection Status**:

- Check if `user.redtailIntegrationUserId` exists in database to determine if user is connected
- If not connected, show the "Connect to Redtail" button
- If connected, allow access to Redtail features and optionally show "Disconnect" button

See the "Complete Authenticate Flow Example" section below for implementation details.

## Error Handling

All Redtail SDK methods may throw errors. Wrap calls in try-catch blocks:

```typescript
try {
    const result = await redtail.getFamilies({
        userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
        page: 1,
        family_members: true
    });
} catch (error) {
    // Common errors:
    // - Invalid credentials: User credentials not set or invalid
    // - Network errors: Redtail API timeout or connection issues
    // - Validation errors: Missing required parameters (e.g., start_date, end_date)
    // - API errors: Redtail API returned an error response
    console.error('Redtail API error:', error.message);
    throw new ApiError(500, 'Failed to fetch families from Redtail CRM');
}
```

## Redtail: Authenticate

Authenticate with Redtail using the shared config credentials (partnerApiKey, username, password) to obtain a userId for the current user. The credentials come from the integration configuration, not from the request.

```ts
const result = await redtail.authenticate();

// Returns: { userId: 'abc123...' }
// REQUIRED: Store this userId in your database for the user
```

## Redtail: Get Families

```ts
const result = await redtail.getFamilies({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    page: 1,
    family_members: true
});
```

## Redtail: Contacts

```ts
const contacts = await redtail.getContacts({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    page: 1 // REQUIRED: Page number for paginated results
});

const contact = await redtail.getContact({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345 // REQUIRED: Redtail contact identifier
});

const created = await redtail.createContact({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    type: 'Individual', // REQUIRED: Individual, Business, Association, Trust, Union
    first_name: 'John',
    last_name: 'Doe'
});

const updated = await redtail.updateContact({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345, // REQUIRED: Redtail contact identifier
    first_name: 'Jane'
});

const deleted = await redtail.deleteContact({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345 // REQUIRED: Redtail contact identifier
});
```

## Redtail: Contact Profile And Accounts

```ts
const personalProfile = await redtail.getContactPersonalProfile({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345 // REQUIRED: Redtail contact identifier
});

const importantInformation = await redtail.getImportantInformation({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345 // REQUIRED: Redtail contact identifier
});

const updatedImportantInformation = await redtail.updateImportantInformation({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345, // REQUIRED: Redtail contact identifier
    content: 'Important client information'
});

const role = await redtail.getContactRole({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345 // REQUIRED: Redtail contact identifier
});

const updatedRole = await redtail.updateContactRole({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345, // REQUIRED: Redtail contact identifier
    advisor_id: 1
});

const sam = await redtail.getContactSam({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345 // REQUIRED: Redtail contact identifier
});

const updatedSam = await redtail.updateContactSam({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345, // REQUIRED: Redtail contact identifier
    objective_id: 1
});

const tax = await redtail.getContactTax({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345 // REQUIRED: Redtail contact identifier
});

const updatedTax = await redtail.updateContactTax({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345, // REQUIRED: Redtail contact identifier
    tax_bracket: 1
});

const contactAccounts = await redtail.getContactAccounts({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345, // REQUIRED: Redtail contact identifier
    page: 1 // REQUIRED: Page number for paginated results
});

const contactAccount = await redtail.getContactAccount({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345, // REQUIRED: Redtail contact identifier
    accountId: 98765 // REQUIRED: Redtail account identifier
});

const createdContactAccount = await redtail.createContactAccount({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345, // REQUIRED: Redtail contact identifier
    account_type_id: 1,
    number: 'ACC-100'
});

const updatedContactAccount = await redtail.updateContactAccount({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345, // REQUIRED: Redtail contact identifier
    accountId: 98765, // REQUIRED: Redtail account identifier
    number: 'ACC-101'
});

const deletedContactAccount = await redtail.deleteContactAccount({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345, // REQUIRED: Redtail contact identifier
    accountId: 98765 // REQUIRED: Redtail account identifier
});

const accountOwners = await redtail.getAccountOwners({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    accountId: 98765, // REQUIRED: Redtail account identifier
    page: 1 // REQUIRED: Page number for paginated results
});

const accountDetails = await redtail.getAccountDetails({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    accountId: 98765 // REQUIRED: Redtail account identifier
});

const updatedAccountDetails = await redtail.updateAccountDetails({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    accountId: 98765, // REQUIRED: Redtail account identifier
    application_date: '2026-01-01'
});
```

## Redtail: Contact Addresses, Emails, Phones, Social Media, And URLs

These contact child resources support the same CRUD pattern. Use the resource-specific ID field for single-record, update, and delete calls.

```ts
const addresses = await redtail.getContactAddresses({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345, // REQUIRED: Redtail contact identifier
    page: 1 // REQUIRED: Page number for paginated results
});

const address = await redtail.getContactAddress({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345, // REQUIRED: Redtail contact identifier
    addressId: 98765 // REQUIRED: Redtail address identifier
});

const createdAddress = await redtail.createContactAddress({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345, // REQUIRED: Redtail contact identifier
    street_address: '123 Main St',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    address_type: 1 // 1: Home, 2: Work, etc.
});

const updatedAddress = await redtail.updateContactAddress({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345, // REQUIRED: Redtail contact identifier
    addressId: 98765, // REQUIRED: Redtail address identifier
    city: 'Dallas'
});

const deletedAddress = await redtail.deleteContactAddress({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345, // REQUIRED: Redtail contact identifier
    addressId: 98765 // REQUIRED: Redtail address identifier
});
```

Implemented contact child methods:

- `getContactAddresses`, `getContactAddress`, `createContactAddress`, `updateContactAddress`, `deleteContactAddress` using `addressId`
- `getContactEmails`, `getContactEmail`, `createContactEmail`, `updateContactEmail`, `deleteContactEmail` using `emailId`
- `getContactPhones`, `getContactPhone`, `createContactPhone`, `updateContactPhone`, `deleteContactPhone` using `phoneId`
- `getContactSocialMediaAccounts`, `getContactSocialMediaAccount`, `createContactSocialMediaAccount`, `updateContactSocialMediaAccount`, `deleteContactSocialMediaAccount` using `socialMediaId`
- `getContactUrls`, `getContactUrl`, `createContactUrl`, `updateContactUrl`, `deleteContactUrl` using `urlId`

> **Pagination:** All `get*` list methods above (e.g., `getContactAddresses`, `getContactEmails`, etc.) require a `page` parameter as responses are paginated.

## Redtail: Activities

```ts
const activities = await redtail.getActivities({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    start_date: '2026-01-01', // REQUIRED: Start date for activities
    end_date: '2026-01-31', // REQUIRED: End date for activities
    page: 1 // REQUIRED: Page number for paginated results
});

const activity = await redtail.getActivity({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    activityId: 45678 // REQUIRED: Redtail activity identifier
});

const createdActivity = await redtail.createActivity({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    subject: 'Follow-up call',
    priority: 2, // REQUIRED: 1=High, 2=Normal, 3=Low
    start_date: '2026-01-15T10:00:00Z',
    end_date: '2026-01-15T11:00:00Z',
    repeats: 'never',
    activity_code_id: 3, // 3: Phone Call
    description: 'Discussed investment strategy'
});

const updatedActivity = await redtail.updateActivity({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    activityId: 45678, // REQUIRED: Redtail activity identifier
    subject: 'Updated follow-up call'
});

const deletedActivity = await redtail.deleteActivity({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    activityId: 45678 // REQUIRED: Redtail activity identifier
});
```

## Redtail: Activity Notes

```ts
const activityNotes = await redtail.getActivityNotes({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    activityId: 45678, // REQUIRED: Redtail activity identifier
    page: 1 // REQUIRED: Page number for paginated results
});

const createdActivityNote = await redtail.createActivityNote({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    activityId: 45678, // REQUIRED: Redtail activity identifier
    body: 'Call completed'
});

const deletedActivityNote = await redtail.deleteActivityNote({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    activityId: 45678, // REQUIRED: Redtail activity identifier
    noteId: 999 // REQUIRED: Redtail activity note identifier
});
```

## Redtail: Contact Notes

```ts
const contactNotes = await redtail.getContactNotes({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345, // REQUIRED: Redtail contact identifier
    page: 1 // REQUIRED: Page number for paginated results
});

const contactNote = await redtail.getContactNote({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345, // REQUIRED: Redtail contact identifier
    noteId: 98765 // REQUIRED: Redtail note identifier
});

const createdContactNote = await redtail.createContactNote({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345, // REQUIRED: Redtail contact identifier
    body: 'Client prefers email follow-up',
    category_id: 1, // 1: Personal, etc.
    note_type: 1 // 1: Note, etc.
});

const deletedContactNote = await redtail.deleteContactNote({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    id: 12345, // REQUIRED: Redtail contact identifier
    noteId: 98765 // REQUIRED: Redtail note identifier
});
```

## Redtail: Notes, Templates, And Comments

```ts
const notes = await redtail.getNotes({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    page: 1 // REQUIRED: Page number for paginated results
});

const activityTemplates = await redtail.getActivityTemplates({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    page: 1 // REQUIRED: Page number for paginated results
});

const activityTemplate = await redtail.getActivityTemplate({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    activityTemplateId: 1 // REQUIRED: Redtail activity template identifier
});

const noteTemplates = await redtail.getNoteTemplates({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    page: 1 // REQUIRED: Page number for paginated results
});

const noteTemplate = await redtail.getNoteTemplate({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    noteTemplateId: 1 // REQUIRED: Redtail note template identifier
});

const noteComment = await redtail.createNoteComment({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    noteId: 98765, // REQUIRED: Redtail note identifier
    content: 'Comment text'
});
```

## Redtail: Lists And Lookups

```ts
const databaseUsers = await redtail.getDatabaseUsers({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    page: 1 // REQUIRED: Page number for paginated results
});

const databaseTeams = await redtail.getDatabaseTeams({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    page: 1, // REQUIRED: Page number for paginated results
    show_deleted: true
});

const categories = await redtail.getCategories({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    page: 1 // REQUIRED: Page number for paginated results
});

const activityCodes = await redtail.getActivityCodes({
    userId: user.redtailIntegrationUserId, // REQUIRED: Integration user ID from authenticate()
    page: 1 // REQUIRED: Page number for paginated results
});
```

Implemented lookup methods:

- `getAccountTypes`
- `getAccountTaxQualifiedTypes`
- `getContactCategories`
- `getContactStatuses`
- `getSources`
- `getContactSalutations`
- `getServicingAdvisors`
- `getWritingAdvisors`

> **Pagination:** All lookup methods require a `page` parameter as responses are paginated (e.g., `{ userId, page: 1 }`).

## Complete Authenticate Flow Example

When using Shared config, the integration uses shared Redtail credentials. Call `authenticate()` to get a userId using these shared credentials, then store it per-user:

```typescript
import catchAsync from '../utils/catchAsync';
import { Redtail } from '@uptiqai/integrations-sdk';
import { Hono } from 'hono';

const app = new Hono();

// Step 1: Authenticate and store userId for the current user (Connect Button Handler)
app.post(
    '/redtail/authenticate',
    catchAsync(async c => {
        const currentUserId = c.get('userId'); // From auth middleware

        const user = await prisma.user.findUnique({
            where: { id: currentUserId }
        });

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // Initialize Redtail client
        const redtail = new Redtail();

        // Authenticate using shared config credentials and get userId
        const result = await redtail.authenticate();

        // Save userId to your database for this user
        await prisma.user.update({
            where: { id: currentUserId },
            data: { redtailIntegrationUserId: result.userId }
        });

        return c.json({
            success: true,
            message: 'Successfully connected to Redtail CRM',
            userId: result.userId
        });
    })
);

// Check connection status
app.get(
    '/redtail/connection-status',
    catchAsync(async c => {
        const currentUserId = c.get('userId'); // From auth middleware

        const user = await prisma.user.findUnique({
            where: { id: currentUserId },
            select: { redtailIntegrationUserId: true }
        });

        return c.json({
            success: true,
            connected: !!user?.redtailIntegrationUserId
        });
    })
);

// Disconnect from Redtail (optional)
app.post(
    '/redtail/disconnect',
    catchAsync(async c => {
        const currentUserId = c.get('userId'); // From auth middleware

        await prisma.user.update({
            where: { id: currentUserId },
            data: { redtailIntegrationUserId: null }
        });

        return c.json({
            success: true,
            message: 'Successfully disconnected from Redtail CRM'
        });
    })
);

// Step 2: Use Redtail methods with stored userId
app.get(
    '/redtail/families',
    catchAsync(async c => {
        const page = parseInt(c.req.query('page') || '1');
        const family_members = c.req.query('family_members') === 'true';
        const currentUserId = c.get('userId'); // From auth middleware

        // Get user's integration userId from database
        const user = await prisma.user.findUnique({
            where: { id: currentUserId }
        });

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        if (!user.redtailIntegrationUserId) {
            throw new ApiError(400, 'Please authenticate with Redtail first');
        }

        const redtail = new Redtail();
        const result = await redtail.getFamilies({
            userId: user.redtailIntegrationUserId, // Pass stored integration userId
            page: page,
            family_members: family_members
        });

        return c.json({
            success: true,
            data: result
        });
    })
);

app.get(
    '/redtail/contacts',
    catchAsync(async c => {
        const page = parseInt(c.req.query('page') || '1');
        const currentUserId = c.get('userId'); // From auth middleware

        // Get user's integration userId from database
        const user = await prisma.user.findUnique({
            where: { id: currentUserId }
        });

        if (!user || !user.redtailIntegrationUserId) {
            throw new ApiError(400, 'Please authenticate with Redtail first');
        }

        const redtail = new Redtail();
        const result = await redtail.getContacts({
            userId: user.redtailIntegrationUserId, // REQUIRED
            page: page
        });

        return c.json({
            success: true,
            data: result
        });
    })
);

app.post(
    '/redtail/activities',
    catchAsync(async c => {
        const body = await c.req.json();
        const currentUserId = c.get('userId'); // From auth middleware

        // Get user's integration userId from database
        const user = await prisma.user.findUnique({
            where: { id: currentUserId }
        });

        if (!user || !user.redtailIntegrationUserId) {
            throw new ApiError(400, 'Please authenticate with Redtail first');
        }

        const redtail = new Redtail();
        // While calling Redtail API ensure each field is passed as shown below never directly spread the body
        const result = await redtail.createActivity({
            userId: user.redtailIntegrationUserId, // REQUIRED
            subject: body.subject,
            priority: body.priority,
            start_date: body.startDate,
            end_date: body.endDate,
            repeats: body.repeats,
            activity_code_id: body.activityCodeId,
            description: body.description
        });

        return c.json({
            success: true,
            data: result
        });
    })
);
```
