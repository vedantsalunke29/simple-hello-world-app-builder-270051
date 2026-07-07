## Folder Structure

- `mobile/` - Contains the frontend code for the mobile app (React Native with Expo)
- `backend/` - Contains the backend API code (Hono.js)

## General Instructions

- Build 3-4 fully functional features in one go.
- **All components must be fully functional** - even when using mocked data, all UI interactions, buttons, forms, and navigation must work completely.
- Before starting, read attached images and files if provided.
- **Image references = design inspiration, not layout blueprint.** When an image reference is provided, treat it as a design language guide. Extract design attributes (color palette, typography style, spacing density, component shape language, visual hierarchy) and use them to inspire the generated UI. Maintain originality in layout and component structure; adapt intelligently to the app's functional requirements.
- **Do not replicate the reference exactly.** Use it only for design inspiration (colors, typography, spacing, etc.); keep layout and structure original and suited to the app.
- Keep implementations simple.
- Add complex libraries only when explicitly requested.
- Create authentication layer only when explicitly requested.

## Application Plan & Progress Tracking

- **Check for `APPLICATION_PLAN.md`** in the root directory:
    - **IF PRESENT**: Read it first to understand the overall plan, features, and implementation roadmap.
    - **STRICTLY FOLLOW**: Align all development with the requirements and constraints defined in this plan.

- **Create or Update `IMPLEMENTATION_SUMMARY.md`** in the root directory:
    - Strictly create or update `IMPLEMENTATION_SUMMARY.md` file for implementation summary or change history after every edit you are making in the code at the end only.
    - make sure Implementation Summary is short.
    - Make sure to include the details from `APPLICATION_PLAN.md` file (if present) like what features are implemented or pending etc.
    - Do not include any technical details such as tech stack, architecture, setup instructions, technologies used, or prerequisites, only provide feature-related information

## Development Workflow

- Don't run dev server.
- Use only pnpm.
- **Important** Always read the attached files/images/references if exist first before proceeding with next steps.
- Always install dependencies if not installed before checking typescript errors or running build.
- Run `pnpm build` or `pnpm expo export` after completion of task at the end only. Don't run build command in between. Fix any errors and run build again.
- While editing existing code do very minimal targeted changes related to any feature or bug requested only. Don't make unnecessary changes.
- Don't run any git related commands.
- Don't change anything inside eslint config, `app.json`, `metro.config.js`, or `babel.config.js` files strictly.
- IF attachments are provided - After doing all the required changes please verify styles of the application is in accordance with the attached images if provided any and check and fix if you are following prompt correctly to use the attached files, images as intended by user.

## Response Language

- Strictly respond only in English language even if user explicitly mentions another language in prompts.

## Tech Stack & Implementation

- **Framework:** React Native with Expo
- **Routing:** Expo Router (file-based routing in `src/app/`)
- **Styling:** React Native StyleSheet API (NO Tailwind CSS)
- **Icons:** Strictly use `lucide-react-native` for icons. It is **Prohibited to use @expo/vector-icons** as it has runtime flaws. Only use `lucide-react-native` icons. Don't even install `@expo/vector-icons`
- **Storage:** `expo-secure-store` for sensitive data, `@react-native-async-storage/async-storage` for general data
- **HTTP Client:** axios
- **Navigation:** expo-router
- **CRITICAL:** NEVER create `.js` or `.jsx` files in `src/` directory - ONLY use `.ts` and `.tsx` files. JavaScript files cause route conflicts with Expo Router.
- Mock the backend with AsyncStorage if backend is not generated.
- If backend is not generated Always simulate backend with AsyncStorage and mock data - don't add any workers or external api calls for that.
- After service layer generation replace all the data fetches, data mutations from components, screens with service layer function calls which will have api calls with `process.env.EXPO_PUBLIC_USE_MOCK_DATA` env fallback check.
- If user tells to use attached images as logo or some static image in app copy those attached image files to `src/assets/images/` directory first and then use them in code. Only copy into `src/assets/images` when exact image is to be used in application like logo or static asset image else just read the attached file for reference in code generation.
- Don't delete files from .references directory.
- Always add optional chaining `?.` after the data variables which can be undefined or null while accessing values with functions like `.map()`, `.slice()`, `.trim()` and much more. to handle undefined values and avoid runtime UI crashes.

### Required Package Versions

**CRITICAL:** Always use these specific versions when installing or updating packages:

- `@react-native-async-storage/async-storage`: `2.2.0`
- `expo-auth-session`: `~7.0.10`
- `expo-camera`: `~17.0.10`
- `expo-media-library`: `~18.2.1`
- `expo-secure-store`: `~15.0.8`
- `react-native-svg`: `15.12.1`

### Package Installation Rules

**Current Expo SDK Version: 54** (Expo Go)

**STRICT RULES:**

- Only install packages compatible with Expo SDK 54
- Before installing ANY package, verify it supports SDK 54 and works in Expo Go
- Do not install packages requiring SDK ≥ 55 or Development Build
- If package requires Development Build, use local/limited alternatives instead

## React Native Styling

- Use React Native StyleSheet API (NO Tailwind CSS, NO web CSS)
- Platform-specific files: `.ios.tsx`, `.android.tsx`, `.web.tsx` (when needed)
- Use Flexbox for all layouts
- Common components: `View`, `Text`, `ScrollView`, `FlatList`, `TouchableOpacity`, `TextInput`, `Image`

### Theme & Color System (MANDATORY)

**CRITICAL: EVERY component MUST call `useColorScheme()` and use theme tokens - NO hardcoded colors.**

- **Import in EVERY component:** `import { useColorScheme } from 'react-native';` and `import { Colors } from '@/constants/theme';`
- **Get colors:** `const colorScheme = useColorScheme();` then `const colors = Colors[colorScheme ?? 'light'];`
- **WHY:** Components won't re-render on theme change unless `useColorScheme()` is called (React memoization)
- **Available tokens:** `colors.background`, `colors.text`, `colors.tint`, `colors.tintText`, `colors.card`, `colors.cardText`, `colors.border`, `colors.icon`
- **FORBIDDEN:** Hardcoded colors (`#fff`, `#000`, `white`, `black`, any hex/rgb values)
- **Pattern:** Backgrounds use `colors.background` or `colors.card`, text uses `colors.text` or `colors.cardText`, buttons use `colors.tint` + `colors.tintText`
- **Exception:** Semantic colors (success green, error red, warning yellow) only when explicitly needed
- **NEVER modify** `src/constants/theme.ts` unless explicitly requested

## UI/UX Guidelines

- Build UI style (Professional / Jazzy / Playful) based on the app's purpose and target users.
- Use attached files/images as design reference when provided.
- Make UI elegant, clean and modern for mobile devices.
- Use `ScrollView` for scrollable content, `FlatList` for long lists (performance).
- Ensure proper safe area handling using `react-native-safe-area-context`.
- Don't change the default theme from `src/constants/theme.ts` unless asked explicitly or unless absolutely required.
- **CRITICAL:** Root layout MUST wrap all content in `SafeAreaProvider` from `react-native-safe-area-context` to prevent content clipping at top/bottom.
- Use `SafeAreaView` from `react-native-safe-area-context` in screens to respect device safe areas (notches, home indicators).
- Use `ActivityIndicator` from `react-native` for loading states.
- Handle keyboard properly with `KeyboardAvoidingView` on forms.
- Use nice, minimal loaders for pending api calls or background actions (if applicable).

### CRITICAL UI Rules

**Functional Components:**

- **ALL UI components MUST be fully functional** - no non-functional placeholders or disabled elements
- Every interactive element (buttons, inputs, search, forms, tabs, etc.) MUST have proper event handlers and working logic
- Use mock data/logic if backend is not ready, but ensure every component actually works when user interacts with it
- Show appropriate states: loading (`ActivityIndicator`), error messages, empty states with helpful text

**Layout & Viewport:**

- All components MUST fit within screen viewport - never create elements outside visible area
- Use `SafeAreaView` from `react-native-safe-area-context` (NOT from `react-native` - deprecated in SDK 54)
- Alternative: Use `useSafeAreaInsets()` hook for custom safe area handling
- Ensure layouts work on different screen sizes - avoid hardcoded dimensions that overflow
- Example: `import { SafeAreaView } from 'react-native-safe-area-context';`

**Color Contrast (MANDATORY):**

- NEVER use same color for text and background
- Theme tokens automatically ensure proper contrast - use them correctly
- Verify readability in both light and dark modes

## Expo Router Navigation

- **File-based routing:** All routes live in `src/app/` directory
- **Navigation methods:**

```typescript
import { router } from 'expo-router';

// Navigate to screen
router.push('/profile'); // Add to stack
router.replace('/login'); // Replace current screen
router.back(); // Go back
router.dismiss(); // Dismiss modal

// With params
router.push({ pathname: '/user/[id]', params: { id: '123' } });
```

- **Links:**

```typescript
import { Link } from 'expo-router';

<Link href="/profile">Go to Profile</Link>
<Link href={{ pathname: '/user/[id]', params: { id: '123' } }}>User</Link>
```

- **Get params:**

```typescript
import { useLocalSearchParams } from 'expo-router';

const { id } = useLocalSearchParams();
```

- **Tab Navigation:** Use `(tabs)` folder structure
- **Modals:** Use `presentation: 'modal'` in screen options
- **Dynamic routes:** `[id].tsx` for dynamic segments

## Error Logging (Mobile Code Generation – HARD RULE)

### Forbidden

`console.error` must never appear.

- If `console.error` exists anywhere in the output, the code is **invalid**.
- It must be removed or replaced before returning.

### Mandatory Replacement

Any `console.error` must be replaced with:

```ts
logError(error, 'source-name');
Alert.alert('Something went wrong', error?.message ?? 'Unknown error');
```

### Required Pattern

```ts
import { logError } from '@/logging/logger';
import { Alert } from 'react-native';

// try/catch (async)
try {
    const data = await AsyncStorage.getItem('key');
} catch (error) {
    logError(error, 'source-name');
    Alert.alert('Something went wrong', error?.message ?? 'Unknown error');
}

// promise chain
fetch('/api/data')
    .then(res => res.json())
    .catch(error => {
        logError(error, 'source-name');
        Alert.alert('Something went wrong', error?.message ?? 'Unknown error');
    });

// rethrow if unrecoverable
try {
    await criticalOperation();
} catch (error) {
    throw error;
}
```

### Catch Block Rules

Every `catch` must either:

```ts
// recoverable
catch (error) {
    logError(error, 'source-name');
    Alert.alert('Something went wrong', error?.message ?? 'Unknown error');
}
```

OR

```ts
// unrecoverable
catch (error) {
    throw error;
}
```

No other patterns are allowed.

### Async Rule

Allowed:

```ts
await fn();
```

```ts
fn().catch(error => {
    logError(error, 'source-name');
    Alert.alert('Something went wrong', error?.message ?? 'Unknown error');
});
```

Disallowed:

```ts
fn(); // floating promise
```

### Native / External Calls

All external or native async calls must be wrapped:

```ts
try {
    await someAsyncOperation();
} catch (error) {
    logError(error, 'operation-failure');
    Alert.alert('Something went wrong', error?.message ?? 'Unknown error');
}
```

### Disallowed Patterns

```ts
console.error(...)
console.log(error)
catch (e) {}
catch (e) { return; }
```

### Validation (MANDATORY)

Before returning code:

- No `console.error`
- Every `catch` follows rules or rethrows
- No floating promises

## Environment Variables

- **Prefix:** All public env vars must use `EXPO_PUBLIC_*` prefix
- **Access:** `process.env.EXPO_PUBLIC_API_BASE_URL`
- **Never use:** `import.meta.env` (that's Vite-specific, not available in Expo)
- **Configuration:** Use `expo-constants` for app config

```typescript
import Constants from 'expo-constants';

const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL || Constants.expoConfig?.extra?.apiBaseUrl;
```

- **Common env vars:**

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_USE_MOCK_DATA=true
EXPO_PUBLIC_AGENT_BASE_URL=https://agent-api.example.com
```

## Agent Integration (If Agents Provided)

**Agent is third party it is only called from mobile it does not require any backend**

**CRITICAL: Use WebSocket-based custom hook for ALL agent communication**

- **ALL agent calls MUST use WebSocket** via `useCallAgentSocket` custom hook
- When you use websockets make sure you always show live responses from agent somehow
- Supports chat bots, QA bots, conversational interfaces, long-running tasks, document processing, real-time feedback, and structured output
- **How to implement:** Follow `@AGENT_INTEGRATION_WEB_SOCKET.md` and refer to `agentSdk/agents.ts` for config setup

**AGENT_CONFIGS Structure (Copy ALL fields exactly):**

- Update `src/agentSdk/agents.ts` AGENT_CONFIGS array with provided agents
- Required fields: `id`, `name`, `description`, `config.appId`, `config.accountId`, `config.widgetKey`
- **CRITICAL**: `config.widgetKey` is MANDATORY - never skip/remove it
- Don't change anything else in agents.ts file
- Strictly follow type AgentConfig from `src/agentSdk/types.ts` for agent config object in AGENT_CONFIGS array

**useCallAgentSocket() Custom Hook:**

- **File Location**: `src/agentSdk/index.ts` exports `useCallAgentSocket` hook
- **Import**: `import { useCallAgentSocket } from '@/agentSdk'`
- **Hook Signature**: `useCallAgentSocket({ agentId, config: { appId, accountId, widgetKey, agentExecutorVersion? }, user: { uid, firstName, lastName?, email } })`
- **Returns**: `{ callAgentSocket, loading, error }`
- **Call Method**: `await callAgentSocket({ prompt, outputSchema?, timeoutMs?, onStreamingUpdate? })`
- **Use Cases**:
    - **For Chatbots/Conversational**: Call without `outputSchema`, with `onStreamingUpdate` for live streaming
    - **For Structured Output**: Call with `outputSchema`, no streaming callback
- **Parameters**:
    - `prompt`: Natural language instruction
    - `outputSchema` (optional): Zod schema for structured output - omit for chatbots
    - `timeoutMs` (optional): Timeout in ms, `null` for no timeout (default: `null`)
    - `onStreamingUpdate` (optional): Callback `(params: { content: string; event: AgentEventType }) => void` - receives ALL agent message events
- **Instance Caching**: WebSocket instances are cached and reused for better performance
- **Implementation**: WebSocket via `@uptiqai/widgets-sdk` (same pattern as web, works in React Native), listens for `subtype: 'final'` event
- **Auto-fetches**: `agentExecutorVersion` from `/agent-builder/agents/${agentId}`
- **Agent Can be called regardless of process.env.EXPO_PUBLIC_USE_MOCK_DATA** - agent calls are independent of mock data env variable

**STRICT CHECKLIST TO FOLLOW WHEN HANDLING DOCUMENTS AND AGENTS (ATTACHED AGENTS) TOGETHER**

- Always ensure to upload document to backend document service first which will internally use `@uptiqai/integrations-sdk` storage layer
- After uploading document to the backend get document signed url from storage service on the frontend side
- Pass documents via WebSocket `emit('query', { content, documents: [{ signedUrl, fileName?, mimeType? }] })`
- For structured output with documents, use direct WebSocket integration from `@AGENT_INTEGRATION_WEB_SOCKET.md` or embed document references in prompt

## Guidelines for Backend Integration (only when requested or asked for backend)

- When integrating with backend for first time start by writing the api client instance in `src/lib/api.ts` to connect to the backend
- Use axios api client to make api calls.
- Do not add API calls anywhere outside the `src/services` folder which will have module wise apis.
- If implementing features that reference or depend on other screens/components not yet created in mobile or backend, implement those prerequisite pages/features first to ensure full functionality.
- **_ONLY_** implement authentication (login, signup screens, auth handling, protected routes) when the feature involves user-specific data (user profiles, user settings, personalized content, etc.). Update API_SPECIFICATION.md accordingly with authenticated/unauthenticated endpoint details.
- Ensure all implemented features remain fully functional with proper data flow between dependent components.

### API Client Setup

Create `src/lib/api.ts`:

```typescript
import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// Create axios instance
export const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || Constants.expoConfig?.extra?.apiBaseUrl,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor (add auth token)
api.interceptors.request.use(
    async config => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Response interceptor (handle token refresh on 401)
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await SecureStore.getItemAsync('refreshToken');
                const response = await axios.post(`${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/refresh`, {
                    refreshToken
                });

                const { accessToken } = response.data;
                await SecureStore.setItemAsync('accessToken', accessToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('refreshToken');
                // Redirect to login screen
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
```

### API Service Function Writing Guidelines

- Maintain the pattern of using mock data when env variable `process.env.EXPO_PUBLIC_USE_MOCK_DATA` is equal to `"true"` otherwise directly call live api
- Live API Base url is `process.env.EXPO_PUBLIC_API_BASE_URL` don't defer from that.
- Make sure API endpoint is correct as per the backend.
- Make sure request body schema (if needed) matches the backend routes.

**Example Service (`src/services/user.service.ts`):**

```typescript
import { api } from '@/lib/api';

export const userService = {
    getProfile: async () => {
        if (process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true') {
            const { mockUserProfile } = await import('@/data/user.data');
            return mockUserProfile;
        }

        const response = await api.get('/users/profile');
        return response.data;
    },

    updateProfile: async (data: { name: string; email: string }) => {
        if (process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true') {
            const { mockUpdateResponse } = await import('@/data/user.data');
            return mockUpdateResponse;
        }

        const response = await api.patch('/users/profile', data);
        return response.data;
    }
};
```

**Example Mock Data (`src/data/user.data.ts`):**

```typescript
export const mockUserProfile = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://via.placeholder.com/150'
};

export const mockUpdateResponse = {
    success: true,
    message: 'Profile updated successfully'
};
```

### Authentication (Only When User Explicitly Requests)

- Only create authentication related files when explicitly asked.
- If authentication is required properly use JWT accessToken and refreshToken pattern in apiClient interceptors for making authorized api calls.
- Only make those apis authenticated which are actually authenticated on backend otherwise keep them public.
- Handle accessToken expiry properly and creating new accessToken from refreshToken functionality properly using axios error interceptors on 401 error code.
- **When to implement:** ONLY when user explicitly asks for authentication
- **Default:** Email/Password authentication (login + register screens)
- **Google OAuth:** ONLY if user explicitly requests Google authentication
- **Token Storage:** Use `expo-secure-store` for accessToken and refreshToken
- **Important** After implementing authentication ensure that whenever user logs in you take user directly in home screen or dashboard or any intended screen. User should not see login screen again if he is logged in.
- **Important** When user closes the app and opens it again you should not show login screen again if he logged in before instead show a loader or something until you check for user auth and then based on auth state either take him to login screens or protected internal routes like home or dashboard. He should not see login screen even for split second before checking auth state.
- **Important** After logging out don't show errors like invalid access token or refresh token as user intentionally logged out and its not an error .. after logout internal routes should not be accessible and user should get redirected to login page.

**Example Auth Service (`src/services/auth.service.ts`):**

```typescript
import { api } from '@/lib/api';
import * as SecureStore from 'expo-secure-store';

export const authService = {
    login: async (email: string, password: string) => {
        if (process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true') {
            const { mockLoginResponse } = await import('@/data/auth.data');
            await SecureStore.setItemAsync('accessToken', mockLoginResponse.accessToken);
            await SecureStore.setItemAsync('refreshToken', mockLoginResponse.refreshToken);
            return mockLoginResponse;
        }

        const response = await api.post('/auth/login', { email, password });
        const { accessToken, refreshToken, user } = response.data;

        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);

        return { accessToken, refreshToken, user };
    },

    register: async (email: string, password: string, name: string) => {
        if (process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true') {
            const { mockRegisterResponse } = await import('@/data/auth.data');
            await SecureStore.setItemAsync('accessToken', mockRegisterResponse.accessToken);
            await SecureStore.setItemAsync('refreshToken', mockRegisterResponse.refreshToken);
            return mockRegisterResponse;
        }

        const response = await api.post('/auth/register', { email, password, name });
        const { accessToken, refreshToken, user } = response.data;

        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);

        return { accessToken, refreshToken, user };
    },

    logout: async () => {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
    },

    getStoredTokens: async () => {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        return { accessToken, refreshToken };
    }
};
```

### Mobile OAuth Authentication (Only When User Explicitly Requests)

**Use `expo-auth-session` for OAuth flows:**

1. **Install dependencies:**

```bash
pnpm add expo-auth-session expo-web-browser

```

2. **Configure login and auth/callback routes**

3. **Google OAuth Example:**

**Strictly follow** below example for redirectUri don't use any other way to form redirect url strictly. So that app will work in expo go.
**Strict Requirement** /auth/callback route must be added to handle auth callback
**Strict Requirement** Always ensure that user correctly redirects to protected home or dashboard route after successfull login implement this steps explicitly also ensure to add logout button somewhere if user is logged in

```typescript
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
    const isPublish = process.env.EXPO_PUBLIC_APP_ENV === 'publish';
    const redirectUri = isPublish
        ? `${process.env.EXPO_PUBLIC_APP_SCHEME}://auth/callback`
        : `${(process.env.EXPO_PACKAGER_PROXY_URL || '').replace('https', 'exp')}/--/auth/callback`;

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
            redirectUri
        },
        {
            authorizationEndpoint: `${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/google`
        }
    );

    React.useEffect(() => {
        if (response?.type === 'success') {
            const { code } = response.params;
            // Exchange code for tokens via your backend
            handleGoogleCallback(code);
        }
    }, [response]);

    const handleGoogleCallback = async (code: string) => {
        try {
            const result = await api.get(`/auth/google/callback?code=${code}`);
            const { accessToken, refreshToken } = result.data;

            await SecureStore.setItemAsync('accessToken', accessToken);
            await SecureStore.setItemAsync('refreshToken', refreshToken);

            // Navigate to home screen
            router.replace('/');
        } catch (error) {
            console.error('Google auth failed:', error);
        }
    };

    return { promptAsync };
};
```

**Important:** No `window.open` popups in React Native - use `expo-web-browser` or `expo-auth-session`

## Storage - AsyncStorage & SecureStore

### AsyncStorage (General Data)

Install: `@react-native-async-storage/async-storage`

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store
await AsyncStorage.setItem('key', 'value');
await AsyncStorage.setItem('user', JSON.stringify(userObject));

// Retrieve
const value = await AsyncStorage.getItem('key');
const user = JSON.parse((await AsyncStorage.getItem('user')) || '{}');

// Remove
await AsyncStorage.removeItem('key');

// Clear all
await AsyncStorage.clear();
```

### SecureStore (Sensitive Data like Tokens)

Use `expo-secure-store` for tokens, passwords, sensitive data:

```typescript
import * as SecureStore from 'expo-secure-store';

// Store token
await SecureStore.setItemAsync('accessToken', token);

// Retrieve token
const token = await SecureStore.getItemAsync('accessToken');

// Remove token
await SecureStore.deleteItemAsync('accessToken');
```

**Important:** All storage operations are async in React Native (unlike web's localStorage)

## File Handling

### Image Picker

```typescript
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1
    });

    if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        // Upload to backend or use locally
    }
};
```

### Document Picker

```typescript
import * as DocumentPicker from 'expo-document-picker';

const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
    });

    if (result.type === 'success') {
        const { uri, name, mimeType } = result;
        // Upload to backend
    }
};
```

### File Upload to Backend

```typescript
const uploadFile = async (fileUri: string, fileName: string, mimeType: string) => {
    const formData = new FormData();
    formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: mimeType
    } as any);

    const response = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data; // { url, signedUrl, etc. }
};
```

### File Download & Sharing

```typescript
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const downloadAndShare = async (url: string, filename: string) => {
    try {
        const fileUri = FileSystem.documentDirectory + filename;
        const { uri } = await FileSystem.downloadAsync(url, fileUri);

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
        }
    } catch (error) {
        console.error('Download failed:', error);
    }
};
```

## External Links

Use `expo-linking` for opening external URLs:

```typescript
import * as Linking from 'expo-linking';

// Open URL
await Linking.openURL('https://example.com');

// Open email
await Linking.openURL('mailto:support@example.com');

// Open phone
await Linking.openURL('tel:+1234567890');
```

## API Integration

- Create or Update API_SPECIFICATION.md file after changes in service layer for api related changes.

## Payment Integration (Stripe - Only When User Requests)

**Backend:** Payment integration pre-configured with Stripe at `@uptiqai/integrations-sdk`. Only implement payment UI when explicitly requested.

**Prerequisites:**

- Backend must have `/payment/create-checkout-session` endpoint implemented
- Backend has `/payment/stripe/webhook` endpoint for Stripe webhooks
- VERY IMPORTANT: For PerUser Stripe config, show `process.env.EXPO_PUBLIC_STRIPE_WEBHOOK_URL`(dont differ and always use this env variable only) in the Stripe credentials modal so users can copy it into their Stripe dashboard webhook settings
  **Mobile Implementation:**

**1. Create Payment Service** `src/services/payment.service.ts`:

```typescript
import { api } from '@/lib/api';

interface CreateCheckoutSessionPayload {
    amount: number; // in cents (e.g., 2000 for $20.00)
    currency?: string;
    productName: string;
    customerEmail?: string;
    metadata?: Record<string, any>;
}

interface CheckoutSession {
    sessionUrl: string;
    sessionId: string;
}

export const paymentService = {
    createCheckoutSession: async (payload: CreateCheckoutSessionPayload): Promise<CheckoutSession> => {
        // IMPORTANT: Do NOT add mock mode - always use real Stripe APIs
        const response = await api.post('/payment/create-checkout-session', payload);
        return response.data;
    }
};
```

**2. Open Checkout with expo-web-browser:**

```typescript
import { paymentService } from '@/services/payment.service';
import * as WebBrowser from 'expo-web-browser';

const handleCheckout = async () => {
    try {
        setLoading(true);

        // Create checkout session
        const { sessionUrl } = await paymentService.createCheckoutSession({
            amount: 2000, // $20.00 in cents
            productName: 'Premium Plan',
            currency: 'usd'
        });

        // Open Stripe Checkout in browser
        const result = await WebBrowser.openBrowserAsync(sessionUrl);

        // Handle result based on type
        if (result.type === 'cancel' || result.type === 'dismiss') {
            console.log('Payment cancelled');
        }
    } catch (error) {
        console.error('Checkout failed:', error);
    } finally {
        setLoading(false);
    }
};
```

**3. Handle Payment Success (Deep Link):**

Payment success page should be strictly on `/payment/success`
Payment cancel or failure page should be on `/payment/cancel`

Create `src/app/payment/success.tsx`:

```typescript
import { useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { View, Text } from 'react-native';

export default function PaymentSuccess() {
  const { session_id } = useLocalSearchParams();

  useEffect(() => {
    if (session_id) {
      // Verify payment with backend if needed
      console.log('Payment successful:', session_id);

      // Navigate to home after 3 seconds
      setTimeout(() => {
        router.replace('/');
      }, 3000);
    }
  }, [session_id]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, color: 'green' }}>✓ Payment Successful</Text>
      {session_id && <Text>Session: {session_id}</Text>}
    </View>
  );
}
```

**Important Notes:**

- **Never call Stripe API directly from mobile** - Always use backend endpoint
- **Backend Integration**: Backend uses `@uptiqai/integrations-sdk` Payment class
- **Always use real Stripe API** - Payments always go through Stripe test mode, even when mock data is enabled
- **Amount format**: Pass amounts in **cents** (e.g., 2000 for $20.00)
- **Deep linking**: Configure `scheme` in `app.json` for payment callbacks
- **expo-web-browser**: Use for opening Stripe Checkout (replaces window.open)

**Only implement payment features when explicitly requested by the user.**

## OAuth Integration for Third-Party Services (Wealthbox CRM - Only When User Requests)

**Backend:** OAuth integration pre-configured at backend. Only implement OAuth UI when explicitly requested.

**Prerequisites:**

- Backend must have OAuth redirect endpoint (`/integrations/wealthbox/callback`)
- Backend handles token exchange and storage
- Uses `expo-web-browser` and `expo-auth-session` for OAuth flow

**Implementation Steps:**

**1. Create OAuth Hook** (e.g., `src/hooks/useWealthboxAuth.ts`):

```typescript
import { api } from '@/lib/api';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export const useWealthboxAuth = () => {
    const isPublish = process.env.EXPO_PUBLIC_APP_ENV === 'publish';
    const redirectUri = isPublish
        ? `${process.env.EXPO_PUBLIC_APP_SCHEME}://integrations/wealthbox/callback`
        : `${(process.env.EXPO_PACKAGER_PROXY_URL || '').replace('https', 'exp')}/--/integrations/wealthbox/callback`;

    const initiateOAuth = async () => {
        try {
            // Get authorization URL from backend
            const response = await api.post('/integrations/wealthbox/authorize');
            const { authorizationUrl } = response.data;

            // Open OAuth flow in browser
            const result = await WebBrowser.openAuthSessionAsync(authorizationUrl, redirectUri);

            return result;
        } catch (error) {
            console.error('Wealthbox OAuth initiation failed:', error);
            throw error;
        }
    };

    return { initiateOAuth };
};
```

**2. Create OAuth Callback Screen** (e.g., `src/app/integrations/wealthbox/callback.tsx`):

```typescript
import { useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';

export default function WealthboxCallback() {
    const { connected, userId, error } = useLocalSearchParams();

    useEffect(() => {
        if (error) {
            // Handle error - show error and redirect
            console.error('Wealthbox OAuth error:', error);
            setTimeout(() => {
                router.replace('/settings?tab=integrations&wealthbox=error');
            }, 2000);
        } else if (connected === 'true' && userId) {
            // Success - redirect to settings
            console.log('Wealthbox connected successfully');
            setTimeout(() => {
                router.replace('/settings?tab=integrations&wealthbox=connected');
            }, 2000);
        }
    }, [connected, userId, error]);

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, color: 'red' }}>OAuth Failed</Text>
                <Text style={{ marginTop: 10 }}>{error as string}</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 20 }}>Connecting Wealthbox...</Text>
        </View>
    );
}
```

**3. Connect Button Usage:**

```typescript
import { useWealthboxAuth } from '@/hooks/useWealthboxAuth';
import { Button } from 'react-native';

const SettingsScreen = () => {
    const { initiateOAuth } = useWealthboxAuth();
    const [loading, setLoading] = useState(false);

    const handleConnect = async () => {
        try {
            setLoading(true);
            await initiateOAuth();
        } catch (error) {
            console.error('OAuth failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            title="Connect Wealthbox CRM"
            onPress={handleConnect}
            disabled={loading}
        />
    );
};
```

**4. Deep Link Configuration:**

Ensure your `app.json` has the correct scheme configured:

```json
{
    "expo": {
        "scheme": "your-app-scheme",
        "ios": {
            "bundleIdentifier": "com.yourcompany.yourapp"
        },
        "android": {
            "package": "com.yourcompany.yourapp"
        }
    }
}
```

**Important Notes:**

- **Backend handles OAuth flow**: Frontend only initiates and receives callbacks via deep links
- **Deep link pattern**: Uses `/--/integrations/wealthbox/callback` for Expo Go compatibility
- **expo-web-browser**: Opens OAuth in browser, returns to app via deep link
- **No popup handling**: Mobile uses deep links instead of popups
- **Redirect timing**: Add 2-3 second delay before redirecting to allow user to see success/error message
- **State management**: Backend manages OAuth state/PKCE; frontend receives final result

**Apply this same pattern for any third-party OAuth integrations (Salesforce, HubSpot, etc.):**

- Replace `wealthbox` with the provider name
- Keep the same deep link structure (`/--/integrations/{provider}/callback`)
- Use `expo-web-browser` for all OAuth flows

**Only implement OAuth integrations when explicitly requested by the user.**

## Image Generation Integration

### Strict restrictions in image generation integration.

- Image generation integration calls will always go to backend
- In apps with image generation enabled from ai or prompt don't give or create any ui for model or model provider selection as this is externally handled

## Whatsapp Messaging Integration (If asked only)

- **NO DIRECT WHATSAPP API CALLS FROM FRONTEND**
- Strictly don't call any real whatsapp apis directly from mobile.
- Whatsapp integrations is strictly controlled at backend with `@uptiqai/integrations-sdk`
- Frontend should always call relevant apis for whatsapp from backend only.
- Assume that backend has handled it completely.
- Also if you need to implement any type of phone number/ mobile number input on mobile ensure to add country code before the number by default.

## Expo Go SDK 54 limitations (do not implement)

This app targets **Expo Go (SDK 54)**. These features are **not supported** in Expo Go or **cannot be tested reliably** there, so **do not build anything that depends on them**. If a user asks for any of the below, explain that **Expo Go doesn’t support it**, in non techical terms.

- Any library that needs custom native code (example: `react-native-firebase`)
- Remote push notifications (iOS + Android)
- Google Maps via `react-native-maps` (Expo Go won’t support it; iOS may only show Apple Maps)
- Android Pedometer API
- App Links / Universal Links (Android App Links + iOS Universal Links)
- App icon changes (not testable in Expo Go)
- App name changes (not testable in Expo Go)
- Splash screen changes (not testable in Expo Go)
- `expo-blob` (not included in Expo Go SDK 54)
- JavaScriptCore (JSC) (Expo Go uses Hermes only from SDK 52+)
- Older Expo SDK versions on physical iOS devices

## Strictly Prohibited Actions

- **NEVER** use `window.*` APIs (`window.location`, `window.open`, `window.history`, `window.addEventListener`, etc.) - they don't exist in React Native
- **NEVER** use `document.*` APIs (`document.createElement`, `document.querySelector`, etc.) - they don't exist in React Native
- **NEVER** use `localStorage` or `sessionStorage` - use `AsyncStorage` or `SecureStore` instead
- **NEVER** use `import.meta.env.*` - use `process.env.EXPO_PUBLIC_*` instead
- **NEVER** use web-specific libraries (react-router-dom, tailwindcss, etc.)
- **NEVER** use DOM manipulation or web CSS
- **NEVER** modify `app.json`, `metro.config.js`, or `babel.config.js` unless explicitly asked
- **NEVER** run `expo eject` unless explicitly asked
- **NEVER** use HTML elements (`<div>`, `<span>`, `<button>`, etc.) - use React Native components
- **NEVER** create blob URLs or use `URL.createObjectURL()` - not available in React Native
- **NEVER** use `fetch` for file downloads without proper handling - use `expo-file-system`

## Important React Native Conventions

**Components:**

- Use `View` instead of `div`
- Use `Text` instead of `span`, `p`, `h1`, etc.
- Use `TouchableOpacity` or `Pressable` instead of `button`
- Use `TextInput` instead of `input`
- Use `Image` from `react-native` or `expo-image`
- Use `ScrollView` for scrollable content
- Use `FlatList` for long lists (better performance)

**Styling:**

- All styles must use StyleSheet.create()
- No className or CSS classes
- Use flexbox for layouts (flex, flexDirection, justifyContent, alignItems)
- Colors: hex strings (#000000) or rgba(0,0,0,0.5)
- Dimensions: numbers (no 'px' suffix) - `width: 100` not `width: '100px'`

**Navigation:**

- Use `router.push()`, `router.replace()`, `router.back()` from `expo-router`
- Use `<Link>` component for navigation links
- No `window.location.href` or browser history API

**Storage:**

- Sensitive data (tokens, passwords): `expo-secure-store`
- General data: `@react-native-async-storage/async-storage`
- All operations are async (await required)

**Environment:**

- All public env vars: `EXPO_PUBLIC_*` prefix
- Access via: `process.env.EXPO_PUBLIC_VAR_NAME`

This ensures your code works correctly in the React Native environment.
