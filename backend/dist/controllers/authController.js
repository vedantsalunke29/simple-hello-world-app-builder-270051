import * as tokenService from "../services/tokenService.js";
import * as userService from "../services/userService.js";
import * as otpService from "../services/otpService.js";
import ApiError from "../utils/ApiError.js";
import { validateEmailPassword } from "../utils/emailPassword.js";
import { GoogleOAuth } from '@uptiqai/integrations-sdk';
/**
 * Auth Controller - Functional approach for handling auth-related HTTP requests
 *
 * OAuth login flow:
 * 1. Use IntegrationHub SDK to get the Google authorization URL.
 * 2. IntegrationHub handles Google callback, token exchange, and ID token verification.
 * 3. Backend callback receives IntegrationHub userId after OAuth completes.
 * 4. Backend fetches trusted profile via GoogleOAuth.getUserProfile().
 * 5. Backend finds/creates local app user and generates JWT tokens.
 */
/**
 * GET /auth/google
 * Start Google OAuth login.
 *
 * The generated app does not exchange Google OAuth codes directly. It asks
 * IntegrationHub for the Google authorization URL, then redirects the browser.
 */
export async function googleLogin(c) {
    const googleOAuth = new GoogleOAuth();
    // IntegrationHub creates OAuth state and owns the Google callback/code exchange.
    // Use the backend callback because this app needs to create local JWT tokens.
    const { url } = await googleOAuth.getAuthorizationUrl({
        scope: ['openid', 'email', 'profile'],
        originalRedirectUrl: `${process.env.BACKEND_DOMAIN}/auth/google/callback`
    });
    // Redirect user to Google OAuth consent screen.
    return c.redirect(url);
}
/**
 * GET /auth/google/callback
 * Complete Google OAuth login after IntegrationHub redirects back.
 *
 * IntegrationHub has already handled:
 * - OAuth state validation
 * - Google authorization code exchange
 * - ID token verification
 * - Google userinfo fetching
 * - Credential storage
 *
 * This callback receives the IntegrationHub userId, fetches the trusted profile,
 * creates/fetches the local app user, and issues this app's JWT tokens.
 */
export async function googleCallback(c) {
    try {
        const connected = c.req.query('connected');
        const integrationUserId = c.req.query('userId');
        if (connected !== 'true' || !integrationUserId) {
            throw new ApiError(400, 'Google OAuth connection failed');
        }
        const googleOAuth = new GoogleOAuth();
        // Fetch trusted profile data from IntegrationHub using the stored
        // IntegrationHub credential userId. Do not trust profile fields from URL params.
        const userProfile = await googleOAuth.getUserProfile({
            userId: integrationUserId
        });
        // Store IntegrationHub userId in identity metadata so future operations
        // can reference the connected Google OAuth credential if needed.
        const metadata = {
            picture: userProfile.picture,
            integrationUserId,
            lastLoginAt: new Date().toISOString()
        };
        // Find or create the local app user from the trusted Google profile.
        // App JWTs must be generated from this local user id, not IntegrationHub userId.
        const user = await userService.findOrCreateUser(userProfile, metadata);
        // Generate this app's tokens using the local database user.
        const tokens = tokenService.generateTokens(user.id, user.email);
        const frontendUrl = process.env.FRONTEND_DOMAIN;
        const redirectUrl = new URL('/auth/callback', frontendUrl);
        redirectUrl.searchParams.set('accessToken', tokens.accessToken);
        redirectUrl.searchParams.set('refreshToken', tokens.refreshToken);
        return c.redirect(redirectUrl.toString());
    }
    catch (error) {
        console.error('Google callback error:', error);
        const frontendUrl = process.env.FRONTEND_DOMAIN;
        return c.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
    }
}
/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 * Body: { refreshToken: string }
 */
export async function refreshToken(c) {
    const body = await c.req.json();
    const { refreshToken } = body;
    if (!refreshToken) {
        throw new ApiError(400, 'Refresh token is required');
    }
    try {
        // Verify refresh token and generate new access token
        const newAccessToken = tokenService.refreshAccessToken(refreshToken);
        return c.json({
            accessToken: newAccessToken
        });
    }
    catch (error) {
        throw new ApiError(401, 'Invalid or expired refresh token');
    }
}
/**
 * GET /auth/me
 * Get current user info (requires auth middleware)
 */
export async function getCurrentUser(c) {
    // User is already attached by auth middleware
    const userId = c.get('userId');
    if (!userId) {
        throw new ApiError(401, 'Unauthorized');
    }
    const user = await userService.getUserById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    return c.json({ user });
}
/**
 * GET /auth/identities
 * Get all linked identities for current user
 */
export async function getUserIdentities(c) {
    const userId = c.get('userId');
    if (!userId) {
        throw new ApiError(401, 'Unauthorized');
    }
    const identities = await userService.getUserIdentities(userId);
    return c.json({ identities });
}
/**
 * DELETE /auth/identities/:provider
 * Unlink an identity provider
 */
export async function unlinkIdentity(c) {
    const userId = c.get('userId');
    const provider = c.req.param('provider');
    if (!userId) {
        throw new ApiError(401, 'Unauthorized');
    }
    try {
        await userService.unlinkIdentity(userId, provider);
        return c.json({ message: 'Identity unlinked successfully' });
    }
    catch (error) {
        if (error instanceof Error) {
            throw new ApiError(400, error.message);
        }
        throw error;
    }
}
/**
 * POST /auth/register
 * Register new user with email and password
 * Body: { email: string, password: string, name?: string }
 */
export async function register(c) {
    try {
        const body = await c.req.json();
        const { email, password, name } = body;
        if (!email || !password) {
            throw new ApiError(400, 'Email and password are required');
        }
        validateEmailPassword(email, password);
        // Register user in database with hashed password
        const user = await userService.registerWithEmailPassword(email, password, name);
        // Generate JWT tokens
        const tokens = tokenService.generateTokens(user.id, user.email);
        return c.json({
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        }, 201);
    }
    catch (error) {
        if (error instanceof Error) {
            throw new ApiError(400, error.message);
        }
        throw error;
    }
}
/**
 * POST /auth/login
 * Login with email and password
 * Body: { email: string, password: string }
 */
export async function login(c) {
    try {
        const body = await c.req.json();
        const { email, password } = body;
        if (!email || !password) {
            throw new ApiError(400, 'Email and password are required');
        }
        validateEmailPassword(email, password);
        // Authenticate user and verify password
        const user = await userService.authenticateWithEmailPassword(email, password);
        // Generate JWT tokens
        const tokens = tokenService.generateTokens(user.id, user.email);
        return c.json({
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    }
    catch (error) {
        if (error instanceof Error) {
            throw new ApiError(401, error.message);
        }
        throw error;
    }
}
/**
 * POST /auth/phone/send-otp
 * Send OTP to phone number via WhatsApp
 * Body: { phone: string }
 */
export async function sendPhoneOTP(c) {
    try {
        const body = await c.req.json();
        const { phone } = body;
        if (!phone) {
            throw new ApiError(400, 'Phone number is required');
        }
        if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
            throw new ApiError(400, 'Invalid phone number format. Use international format: +1234567890');
        }
        await otpService.generateAndSendOTP(phone, 'phone', 'login');
        return c.json({
            message: 'OTP sent successfully to WhatsApp',
            expiresIn: 600 // 10 minutes in seconds
        });
    }
    catch (error) {
        if (error instanceof Error) {
            throw new ApiError(400, error.message);
        }
        throw error;
    }
}
/**
 * POST /auth/phone/verify-otp
 * Verify OTP and login/register user
 * Body: { phone: string, otp: string, name?: string }
 */
export async function verifyPhoneOTP(c) {
    try {
        const body = await c.req.json();
        const { phone, otp, name } = body;
        if (!phone || !otp) {
            throw new ApiError(400, 'Phone number and OTP are required');
        }
        // Verify OTP
        await otpService.verifyOTP(phone, 'phone', otp);
        // Find or create user
        const user = await userService.findOrCreateUserByPhone(phone, name);
        // Generate JWT tokens
        const tokens = tokenService.generateTokens(user.id, user.email);
        return c.json({
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    }
    catch (error) {
        if (error instanceof Error) {
            throw new ApiError(401, error.message);
        }
        throw error;
    }
}
