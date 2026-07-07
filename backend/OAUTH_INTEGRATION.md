### Google Login (GET /auth/google)

**Controller implementation:**

```typescript
import { GoogleOAuth } from '@uptiqai/integrations-sdk';
```

1. Get Google OAuth client:
    ```typescript
    const googleOAuth = new GoogleOAuth();
    ```
2. Generate OAuth URL:
    ```typescript
    const { url } = await googleOAuth.getAuthorizationUrl({
        scope: ['openid', 'email', 'profile'],
        // Use backend callback because backend must create local JWT tokens.
        originalRedirectUrl: `${process.env.BACKEND_DOMAIN}/auth/google/callback`
    });
    ```
3. Redirect user: `return c.redirect(url);`
4. Do not implement Google OAuth code exchange in the generated app. IntegrationHub owns OAuth state creation, callback handling, code exchange, ID token verification, user credential storage, and redirect back to `originalRedirectUrl`.
5. **CRITICAL STEP**: You **MUST** mount the auth routes in `src/app.ts` or the integration will fail with a 404 error.
   ```typescript
   // In src/app.ts
   import authRoutes from './routes/auth.routes.ts';
   app.route('/auth', authRoutes);
   ```
---

### Google Callback (GET /auth/google/callback)

**Controller implementation:**

1. Extract `connected` and `userId` from query params. `userId` is the IntegrationHub credential user ID.

    ```typescript
    const connected = c.req.query('connected');
    const integrationUserId = c.req.query('userId');

    if (connected !== 'true' || !integrationUserId) {
        throw new ApiError(400, 'Google OAuth connection failed');
    }
    ```

2. Fetch trusted Google profile from IntegrationHub using the SDK. Do not trust profile fields from URL params.
    ```typescript
    const googleOAuth = new GoogleOAuth();
    const userProfile = await googleOAuth.getUserProfile({
        userId: integrationUserId
    });
    ```
3. Find or create local app user in database:

    ```typescript
    const metadata = {
        picture: userProfile.picture,
        integrationUserId,
        lastLoginAt: new Date().toISOString()
    };

    const user = await userService.findOrCreateUser(userProfile, metadata);
    ```

4. Generate JWT tokens from the local app user, not the IntegrationHub `userId`:
    ```typescript
    const tokens = tokenService.generateTokens(user.id, user.email);
    ```
5. If it is a web app (not mobile), redirect to frontend with tokens:
    ```typescript
    const frontendUrl = process.env.FRONTEND_DOMAIN;
    const redirectUrl = new URL('/auth/callback', frontendUrl);
    redirectUrl.searchParams.set('accessToken', tokens.accessToken);
    redirectUrl.searchParams.set('refreshToken', tokens.refreshToken);
    return c.redirect(redirectUrl.toString());
    ```
6. If it is a mobile app, redirect to mobile with tokens:
   **Strictly follow below pattern only** don't change redirect url pattern at all
    ```typescript
    // Keep this redirect path exactly as-is for mobile deep-link handling.
    const frontendUrl = process.env.FRONTEND_DOMAIN;
     const redirectUrl = new URL('/--/auth/callback', frontendUrl);
     redirectUrl.searchParams.set('accessToken', tokens.accessToken);
     redirectUrl.searchParams.set('refreshToken', tokens.refreshToken);
     return c.redirect(redirectUrl.toString());
    ```
7. On error, redirect based on app type:
    - If it is a mobile app, redirect to `${frontendUrl}/--/auth/error?message=Authentication%20failed`
    - Otherwise, redirect to `${frontendUrl}/auth/error?message=Authentication%20failed`

**IntegrationHub automatically handles:**

- OAuth state creation and validation
- OAuth code exchange
- ID token verification (signature, audience, issuer, expiration)
- User profile fetching
- User credential storage
- Redirect back to `originalRedirectUrl`

---
