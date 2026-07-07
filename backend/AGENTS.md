## General Instructions

- **CRITICAL**: Only work in the backend folder if `custom_request_database_configuration` was called and returned `isConfigured: true`.
- Simple Hono.js supported backend.
- Create authentication layer only when explicitly requested.
- Check service layer based on app type for which API routes are needed:
    - If it is a mobile app, use the mobile service layer.
    - If it is a web app, use the frontend service layer.
- Keep implementations simple.
- Add complex libraries only when explicitly requested.
- **All API endpoints must be fully functional** - no placeholder or mock endpoints.
- Follow API contract based on app type for writing API routes and preparing/updating db schema if needed:
    - If it is a mobile app, use `../mobile/API_SPECIFICATION.md`.
    - If it is a web app, use `../frontend/API_SPECIFICATION.md`.

## Publish fixes

- Whenever user tells that publish is not working or published app is pending for longer time first check whether `src/app.ts` server has below routes with exact implementation.

```typescript
app.get('/', c => {
    return c.text('Server is up and running');
});
// removing this route is strictly prohibited
app.get('/version.json', c => {
    return c.json({ version: parseInt(process.env.VERSION || '0') });
});
```

## Application Plan & Progress Tracking

- **Check for `../APPLICATION_PLAN.md`** in the root directory:
    - **IF PRESENT**: Read it first to understand the overall plan, features, and implementation roadmap.
    - **STRICTLY FOLLOW**: Align all development with the requirements and constraints defined in this plan.

- **Create or Update `../IMPLEMENTATION_SUMMARY.md`** in the root directory:
    - Strictly create or update `../IMPLEMENTATION_SUMMARY.md` file for implementation summary or change history after every edit you are making in the code at the end only.
    - make sure Implementation Summary is short.
    - Make sure to include the details from `../APPLICATION_PLAN.md` file (if present) like what features are implemented or pending etc.
    - Do not include any technical details such as tech stack, architecture, setup instructions, technologies used, or prerequisites, only provide feature-related information

## Development Workflow

- Don't run dev server.
- Use only pnpm.
- Install dependencies before checking typescript errors or running build.
- Run pnpm build after completion of task at the end only. Don't run build commands in between. Fix any errors and run again.
- Make minimal targeted changes related to requested feature or bug only. Don't make unnecessary changes.
- Don't run git commands.
- Don't change eslint config.
- After doing all the required changes check if you are breaking prisma schema backward compatibility rules mentioned below and fix them if anything is breaking. **THIS is very IMPORTANT** as this can break server starting behaviour.

## Response Language

- Strictly respond only in English language even if user explictly mentions another language in prompts.

## Prisma & Database - CRITICAL RULES

### Soft Delete Only (MANDATORY)

**ABSOLUTE PROHIBITION - HARD DELETES ARE STRICTLY FORBIDDEN**

- **NEVER** use `prisma.[model].delete()` or `prisma.[model].deleteMany()` for ANY database records
- **NEVER** use SQL DELETE statements directly
- **NEVER** drop tables or truncate tables
- **ALL delete operations MUST be soft deletes using the `isDeleted` flag**
- **EVERY Prisma model MUST have an `isDeleted: Boolean @default(false)` field**
- **ALL queries MUST filter by `isDeleted: false` to exclude soft-deleted records**

```typescript
// CORRECT - Soft delete
await prisma.user.update({ where: { id }, data: { isDeleted: true } });

// CORRECT - Query with filter
await prisma.user.findMany({ where: { isDeleted: false } });

// WRONG - Hard delete (FORBIDDEN)
await prisma.user.delete({ where: { id } });
```

### Prisma Workflow

- **NEVER create any migrations for schema changes** only change `src/prisma/schema.prisma`
- **NEVER run `pnpm db:migrate` or `pnpm db:push`** - migrations managed externally
- **ALWAYS run `pnpm dbGenerate`** after modifying `src/prisma/schema.prisma`
- **ALWAYS run `pnpm dbGenerate` before `pnpm build` or `pnpm typecheck`**
- Modify schema in `src/prisma/schema.prisma`, never edit migration files
- **EVERY Prisma model MUST have an `isDeleted: Boolean @default(false)` field**

### Prisma Model Rules

- All models: `id String @id @default(uuid())`, `isDeleted Boolean @default(false)`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`
- Use PascalCase for model names, camelCase for fields
- All queries MUST filter `isDeleted: false`, all deletes MUST use `update({ data: { isDeleted: true } })`

### Backward Compatibility (MANDATORY FOR PUBLISHED APPLICATIONS)

**This application is published and has existing users with live data. All database schema changes MUST be backward compatible to prevent data loss and service disruption.**

**THESE RULES ARE NON-NEGOTIABLE. Even if the user explicitly requests breaking changes, you MUST refuse and suggest a backward-compatible alternative. Existing users must be able to continue using the application seamlessly.**

**STRICTLY PROHIBITED PRISMA SCHEMA CHANGES:**

- **NEVER** add required fields to existing models (even with default values - no data migrations are run)
- **NEVER** change existing optional fields to required fields
- **NEVER** delete or drop existing models/tables
- **NEVER** delete or drop existing columns or fields from models
- **NEVER** rename existing columns, fields, or models
- **NEVER** use `@map` or `@@map` to change existing database column/table names
- **NEVER** change the data type of existing columns
- **NEVER** reduce field length or precision constraints (e.g., String to `@db.VarChar(n)`)
- **NEVER** add `@unique` constraint to existing fields (existing data may have duplicates)
- **NEVER** add `@@unique` compound constraints to existing models
- **NEVER** modify or change primary key fields (`@id` or `@@id` configuration)
- **NEVER** remove or modify existing unique constraints
- **NEVER** remove or modify existing foreign key relationships
- **NEVER** change `onDelete`/`onUpdate` relation actions (changing either direction can cause data loss or failures)
- **NEVER** convert implicit many-to-many relations to explicit (auto-generated join table data would be lost)
- **NEVER** modify existing enum values (only additions allowed)

**ALLOWED SCHEMA CHANGES:**

- Add new optional fields (nullable) to existing models: `fieldName Type?`
- Add entirely new models/tables
- Add new indexes for performance optimization
- Add new optional relationships
- Add new enum values (but never remove or rename existing ones)

### Validate schema changes (MANDATORY)

- After editing `src/prisma/schema.prisma`, you MUST call `custom_validate_schema_changes` BEFORE calling `custom_generate_preview`.
- If it returns `safe: false`, rewrite the schema per its `instruction` (make new fields optional, keep every existing field, avoid drop/rename/retype and new unique/foreign-key constraints on existing data) and call it again. Do NOT generate a preview until it returns `safe: true`.
- The database physically blocks dropping tables/columns, so a destructive change would otherwise fail the build — this tool catches it early so you can fix it cleanly.

## Zod Validation Rules

- Use `.optional()` for optional fields, omit for required
- String: `.min()`, `.max()`, `.email()`, `.url()`, `.uuid()`
- Number: `.int()`, `.positive()`, `.min()`, `.max()`
- Use `z.enum([...])` for enum validation
- Query params: use `z.coerce.number()` or `z.coerce.boolean()` to convert from strings
- All request validation should use Zod schemas

## Strictly Prohibited Actions

### Command Execution Restrictions

- **NEVER** execute `pnpm db:migrate`, `pnpm db:push`, or any database migration commands
- **NEVER** execute `pnpm db:seed` or any database seeding commands
- **NEVER** execute `pnpm dev` or any server start commands
- **NEVER** execute `kill` or any process termination commands
- **NEVER** execute deployment or production-related commands (except `pnpm build` at the very end)

### Database Migration Restrictions

- **NEVER** manually create migration files in `prisma/migrations/` directory
- **NEVER** write SQL migration files directly
- **NEVER** modify existing migration files
- **NEVER** bypass Prisma's migration system
- **ALL database schema changes MUST be made through Prisma schema models only**
- Database migrations are managed externally by the system - do not interfere

### Package Configuration Restrictions

- **NEVER** manually edit `package.json` directly
- **NEVER** add new scripts to `package.json`
- **NEVER** modify existing scripts in `package.json`
- **NEVER** create new command shortcuts or aliases
- You MAY add or update dependencies ONLY using `pnpm add`, `pnpm remove`, or `pnpm install` commands
- All package management must be done through pnpm commands, not manual file edits

### DEFAULT ROUTES RESTRICTIONS

- **NEVER** remove or update `/` and `/version.json` routes from `src/app.ts` hono server in any case or even explicitly told as removing this routes can cause server failure.

### Allowed Operations Only

You are permitted to:

- Run `pnpm dbGenerate` to generate Prisma client for type safety
- Run `pnpm typecheck` to verify TypeScript compilation (ALWAYS run `pnpm dbGenerate` first)
- Run `pnpm add`, `pnpm remove`, or `pnpm install` to manage dependencies
- Modify Prisma schema models in `prisma/schema.prisma` for database changes
- Modify application source code (controllers, services, routes, etc.)

**Important**: Always run `pnpm dbGenerate` before running `pnpm typecheck` to ensure Prisma client is up-to-date.

### Allowed Shell Commands

You have access to these shell commands:

- `curl` - Make HTTP requests
- `cp` - Copy files
- `cd` - Change directory (required for navigating between mobile/backend for mobile apps and frontend/backend for web apps)
- `pnpm build` - Build the project (run at the end only, after all changes)
- `pnpm dbGenerate` - Generate Prisma client
- `pnpm typecheck` - Check TypeScript types
- `pnpm eslint` - Run ESLint
- `pnpm prettier` - Format code
- `pnpm install` - Install all dependencies
- `pnpm add` - Add new dependencies
- `pnpm remove` - Remove dependencies
- `cat`, `printf`, `ls`, `echo`, `grep` - Basic shell utilities

## Tech Stack

- **Framework**: Hono v4 - Lightweight web framework
- **Database**: Prisma ORM with PostgreSQL
- **Storage**: Via `@uptiqai/integrations-sdk` (S3, Azure, GCS)
- **Validation**: Zod for schema validation
- **TypeScript**: Strict type checking

## Default API Behavior

- **All APIs are unauthenticated by default** - No login/signup required unless specifically requested
- Don't add login/signup (authentication, JWT, password hashing, and user management) unless user explicitly asks
- Focus on core feature/business logic first
- Keep endpoints open and simple
- Use proper http status codes for responses like 200, 201, 400 and so on for api responses directly don't use any package for this.

## Core Files

- `src/app.ts` - Main Hono application
- `src/index.ts` - Server initialization
- `src/client.ts` - Prisma client singleton
- `src/middlewares/error.ts` - Global error handler
- `src/utils/ApiError.ts` - Custom error class with status codes
- `src/utils/catchAsync.ts` - Async error wrapper
- `src/prisma/schema.prisma` - Database schema

## Error Handling

Throw `ApiError` for operational errors: `throw new ApiError(404, 'User not found')`

Wrap async handlers: `const handler = catchAsync(async (c) => { ... })`

Global handler supports: Zod validation (400), ApiError (custom), Prisma errors (400), Unknown (500 in production)

## Feature Implementation Examples

### Creating API Endpoints

`Create /<resource> endpoint with GET (list), POST (create), GET/:id, PATCH/:id, DELETE/:id using Prisma`

### Adding Validation

`Add Zod validation if required for /<resource> - name (string, required), price (number, positive), description (optional)`

### Authentication (Only When User Explicitly Requests)

**When to implement:** ONLY when user explicitly asks for authentication
**Default:** Email/Password authentication
**Google OAuth:** ONLY if user explicitly requests Google authentication

---

## Auth Routes Reference

**File:** `src/routes/auth.routes.ts`

**CRITICAL: These routes are FIXED - use exact same paths. Internal logic can be changed.**

**Public routes:**

```typescript
authRoutes.post('/register', catchAsync(authController.register));
authRoutes.post('/login', catchAsync(authController.login));
authRoutes.post('/refresh', catchAsync(authController.refreshToken));
authRoutes.get('/google', catchAsync(authController.googleLogin));
authRoutes.get('/google/callback', catchAsync(authController.googleCallback));
```

**Protected routes (require authMiddleware):**

```typescript
authRoutes.get('/me', authMiddleware, catchAsync(authController.getCurrentUser));
authRoutes.get('/identities', authMiddleware, catchAsync(authController.getUserIdentities));
authRoutes.delete('/identities/:provider', authMiddleware, catchAsync(authController.unlinkIdentity));
```

---

## Environment Variables

```env
# Required for all auth:
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30
FRONTEND_DOMAIN=http://localhost:5173

# Required ONLY for Google OAuth:
GOOGLE_OAUTH_CLIENT_ID=<GOOGLE_OAUTH_CLIENT_ID>
GOOGLE_OAUTH_CLIENT_SECRET=<GOOGLE_OAUTH_CLIENT_SECRET>
GOOGLE_OAUTH_REDIRECT_URI=<GOOGLE_OAUTH_REDIRECT_URI>
```

---

## Email/Password Authentication (Default)

### Register (POST /auth/register)

**Controller implementation:**

1. Extract email, password, name from request body
2. Validate using util:
    ```typescript
    validateEmailPassword(email, password);
    ```
3. Create user with hashed password:
    ```typescript
    const user = await userService.registerWithEmailPassword(email, password, name);
    ```
4. Generate JWT tokens:
    ```typescript
    const tokens = tokenService.generateTokens(user.id, user.email);
    ```
5. Return: `{ accessToken, refreshToken, user }`

**Validation (in controller):**

- Email: valid format, max 255 chars
- Password: min 8-128 chars, must have letter + number

---

### Login (POST /auth/login)

**Controller implementation:**

1. Extract email, password from request body
2. Validate format:
    ```typescript
    validateEmail(email);
    ```
3. Verify password hash:
    ```typescript
    const user = await userService.authenticateWithEmailPassword(email, password);
    ```
4. Generate JWT tokens:
    ```typescript
    const tokens = tokenService.generateTokens(user.id, user.email);
    ```
5. Return: `{ accessToken, refreshToken, user }`

---

### Refresh Token (POST /auth/refresh)

**Controller implementation:**

1. Extract refreshToken from request body
2. Generate new access token:
    ```typescript
    const newAccessToken = tokenService.refreshAccessToken(refreshToken);
    ```
3. Return: `{ accessToken }`

---

### Protected Routes

**Get current user (GET /auth/me):**

```typescript
const userId = c.get('userId'); // Set by authMiddleware
const user = await userService.getUserById(userId);
return c.json({ user });
```

**Get identities (GET /auth/identities):**

```typescript
const userId = c.get('userId');
const identities = await userService.getUserIdentities(userId);
return c.json({ identities });
```

**Unlink identity (DELETE /auth/identities/:provider):**

```typescript
const userId = c.get('userId');
const provider = c.req.param('provider');
await userService.unlinkIdentity(userId, provider);
return c.json({ message: 'Identity unlinked successfully' });
```

---

## Files Reference

**Validation:**

- `src/utils/emailPassword.ts` - Email/password validation helpers

**Business Layer:**

- `src/services/userService.ts` - User CRUD, password hashing
- `src/services/tokenService.ts` - JWT generation/verification
- `src/controllers/authController.ts` - Request handlers
- `src/middlewares/authMiddleware.ts` - JWT verification
- `src/routes/auth.routes.ts` - Route definitions (FIXED paths)

---

## Important Notes

**Routes:** Use exact paths from `auth.routes.ts` - DO NOT change route paths
**Internal Logic:** Can be modified/implemented as needed
**Default:** Email/Password when auth requested
**Google OAuth:** ONLY when explicitly requested by user
**Database:** Run `pnpm dbGenerate` after schema changes
**User Fields:** Add as optional only (`field String?`)

**For External Integration layer use this strictly**

- **CRITICAL**: When implementing any Authentication (including Google OAuth), you **MUST** ensure that `authRoutes` are mounted in `src/app.ts` (`app.route('/auth', authRoutes)`). If this is not done, endpoints like `/auth/google/callback` will return 404 errors.

## Strict Instructions

1. Start simple - build core feature first without auth/validation
2. Add features incrementally - validation → auth (if explicitly asked) → advanced features.
3. Use existing patterns - catchAsync, ApiError, service layer
4. Define Prisma schema first, generate client, then build API
5. Use Zod for validation, TypeScript infers types from Prisma
6. Follow API specification based on app type as api contract for writing apis routes:
    - If it is a mobile app, use `../mobile/API_SPECIFICATION.md`.
    - Otherwise, use `../frontend/API_SPECIFICATION.md`.
