# Headless Agent JavaScript SDK Documentation

Then import the headless agent function:

```typescript
import { createHeadlessAgentInstance } from '@uptiqai/widgets-sdk';
import type { HeadlessAgentInstance, AgentInterruptEvent } from '@uptiqai/widgets-sdk';
```

---

## Creating an Instance

### Method

```javascript
import { createHeadlessAgentInstance } from '@uptiqai/widgets-sdk';

const instance = createHeadlessAgentInstance({
    config: {
        agentId,
        serverUrl: process.env.EXPO_PUBLIC_AGENT_BASE_URL, // Replace with your agent API base URL
        widgetKey,
        appWidgetKey: widgetKey,
        appId,
        accountId,
        agentExecutorVersion
    },
    user: { uid, firstName, lastName, email },
    instanceId: 'unique-instance-id'
});
```

### Parameters

| Name         | Type           | Required | Description                                                   |
| ------------ | -------------- | -------- | ------------------------------------------------------------- |
| `config`     | `WidgetConfig` | Yes      | Backend and agent configuration. See Config Object below.     |
| `user`       | `WidgetUser`   | Yes      | Current user identity. See User Object below.                 |
| `instanceId` | `string`       | Yes      | Unique identifier for this instance (used for socket scoping) |

### Config Object

The config is built from an agent in the `attachedAgents` context array. The `widgetKey` from `agent.config` is passed as `appWidgetKey`.

| Property               | Type     | Required | Description                                                                                  |
| ---------------------- | -------- | -------- | -------------------------------------------------------------------------------------------- |
| `agentId`              | `string` | Yes      | The agent's object id, accessed as `agent.id` from context `attachedAgents`                  |
| `serverUrl`            | `string` | Yes      | `process.env.EXPO_PUBLIC_AGENT_BASE_URL`                                                     |
| `widgetKey`            | `string` | Yes      | The agent's widget key, accessed as `agent.widgetKey` from context `attachedAgents`          |
| `appWidgetKey`         | `string` | Yes      | Set from `agent.config.widgetKey` (the widget key is mapped to `appWidgetKey` in the config) |
| `appId`                | `string` | Yes      | App id from `agent.config.appId`                                                             |
| `accountId`            | `string` | Yes      | Account id from `agent.config.accountId`                                                     |
| `agentExecutorVersion` | `string` | Yes      | Fetched via API call to `/agent-executor/agents/${agentId}`. See below.                      |

**Fetching `agentExecutorVersion`:**

Before building the config, fetch the `agentExecutorVersion` from the agent executor API:

```javascript
const agentApi = axios.create({
    baseURL: process.env.EXPO_PUBLIC_AGENT_BASE_URL, // Replace with your agent API base URL
    headers: { 'Content-Type': 'application/json' }
});

const agentResponse = await agentApi.get(`/agent-builder/agents/${agentId}`, {
    headers: {
        'app-id': config.appId,
        'account-id': config.accountId,
        'widgetkey': config.widgetKey
    }
});
const agent = agentResponse.data?.data;
const agentExecutorVersion = agent?.config?.agentExecutorVersion;
```

**Mapping from `attachedAgents` context:**

```javascript
// Given an agent from the attachedAgents context array:
const config = {
    agentId: agent.id,
    serverUrl: process.env.EXPO_PUBLIC_AGENT_BASE_URL, // Replace with your agent API base URL
    widgetKey: agent.config.widgetKey,
    appWidgetKey: agent.config.widgetKey,
    appId: agent.config.appId,
    accountId: agent.config.accountId,
    agentExecutorVersion // fetched from the API call above
};
```

### User Object

| Property    | Type     | Required | Description             |
| ----------- | -------- | -------- | ----------------------- |
| `uid`       | `string` | Yes      | Unique user identifier. |
| `firstName` | `string` | Yes      | User's first name.      |
| `lastName`  | `string` | No       | User's last name.       |
| `email`     | `string` | Yes      | User's email address.   |

### Example

```javascript
import { createHeadlessAgentInstance } from '@uptiqai/widgets-sdk';

// `agent` is an entry from the attachedAgents context array
const instance = createHeadlessAgentInstance({
    config: {
        agentId: agent.id,
        serverUrl: process.env.EXPO_PUBLIC_AGENT_BASE_URL, // Replace with your agent API base URL
        widgetKey: agent.config.widgetKey,
        appWidgetKey: agent.config.widgetKey,
        appId: agent.config.appId,
        accountId: agent.config.accountId,
        agentExecutorVersion // fetched from the API call above
    },
    user: {
        uid: 'user-123',
        firstName: 'Jane',
        lastName: 'User',
        email: 'jane@example.com'
    },
    instanceId: 'my-chat-instance'
});
```

---

## Instance API

The object returned by `createHeadlessAgentInstance` provides three methods:

### Methods

| Method                 | Type                                                | Description                                                   |
| ---------------------- | --------------------------------------------------- | ------------------------------------------------------------- |
| `emit(event, payload)` | `(event: 'query', payload: QueryPayload) => void`   | Send a query to the agent with optional document attachments. |
| `on(event, handler)`   | `(event: 'agent-interrupt', handler) => () => void` | Subscribe to agent events. Returns unsubscribe function.      |
| `cleanup()`            | `() => void`                                        | Clean up resources (remove listeners, disconnect socket).     |

---

## Sending Messages: `emit('query', payload)`

### Description

Sends a user message to the agent and optionally attaches documents. The SDK handles socket connection and message delivery automatically.

### Query Payload

| Property      | Type                                                             | Required | Description                                                                                                        |
| ------------- | ---------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `content`     | `string`                                                         | Yes      | The user's message text (use `' '` if sending only documents).                                                     |
| `executionId` | `string`                                                         | No       | Existing conversation/execution ID to continue a conversation.                                                     |
| `documents`   | `{ signedUrl: string; fileName?: string; mimeType?: string; }[]` | No       | Document objects with signed URLs obtained from backend storage service. Strictly no `id` key in documents payload |

### Document Handling

When you pass `documents`:

1. Upload the document to the backend using the storage service.
2. Obtain the document `signedUrl` from the backend response.
3. Pass the resulting document array to the agent.
4. **CRITICAL** Remember don't pass `id` in documents array it will throw error and is **STRICTLY PROHIBITED**

You must handle document uploads manually to your backend before passing the `documents` to the agent.

### Examples

**New conversation:**

```javascript
instance.emit('query', {
    content: 'Hello, can you help me?'
});
```

**With document attachments:**

```javascript
instance.emit('query', {
    content: 'Analyze these documents',
    documents: [
        {
            signedUrl: 'https://...',
            fileName: 'document.pdf',
            mimeType: 'application/pdf'
        }
    ]
});
```

**Continue existing conversation:**

```javascript
instance.emit('query', {
    content: 'Tell me more about the second point',
    executionId: 'existing-execution-uuid'
});
```

**Documents only (no text message):**

```javascript
instance.emit('query', {
    content: ' ',
    documents: [
        {
            signedUrl: 'https://...',
            fileName: 'document.pdf',
            mimeType: 'application/pdf'
        }
    ]
});
```

---

## Receiving Agent Events: `on('agent-interrupt', handler)`

### Description

Subscribe to agent events to receive messages, status updates, errors, and completion signals. The handler receives an `AgentInterruptEvent` that contains information about what the agent is doing.

### Event Handler

```typescript
const unsubscribe = instance.on('agent-interrupt', (event: AgentInterruptEvent) => {
    // Handle event based on event.type
});
```

The handler receives events with different `type` values. Use the `type` field to determine what to display.

### Event Types

| Event Type      | Description                | Key Fields                             |
| --------------- | -------------------------- | -------------------------------------- |
| `agent_message` | Agent text response        | `content` (string), `subtype` (string) |
| `status_update` | Progress indicator         | `status` (string)                      |
| `done`          | Execution completed        | `content` (optional string)            |
| `error`         | Error occurred             | `error` (string)                       |
| `tool_call`     | Agent is calling a tool    | Tool invocation details                |
| `tool_result`   | Tool call completed        | Tool result                            |
| `plan_update`   | Agent created/updated plan | Plan details                           |

### Important: Handling Agent Messages

Agent messages have a `subtype` field that indicates the message type:

- `'intermediate'` - Streaming/partial message (shown during generation)
- `'final'` - Complete message (shown when generation is complete)
- `'question'` - Agent asking a question (requires user response)
- `'final_stream'` - Streaming parts of final message.. final_stream messages when shown in chatbot should replace older final_stream messages of same query and finally should be replaced by final message mentioned above.
- `'output_files'` - Agent generated files
- `'ask_permission'` - Agent requesting permission

**Handle multiple subtypes to avoid missing messages:**

```javascript
if (event.type === 'agent_message' && event.content) {
    // Handle different message subtypes
    if (event.subtype === 'final' || event.subtype === 'question' || event.subtype === 'final_stream') {
        // Display this message (complete responses and questions)
    } else if (event.subtype === 'intermediate') {
        // Update streaming message (optional - for real-time updates)
    }
}
```

**Important**: Don't filter only by `subtype === 'final'` or you'll miss agent questions and other message types!

### Example: Basic Event Handler

```javascript
instance.on('agent-interrupt', event => {
    switch (event.type) {
        case 'agent_message':
            // Handle different message subtypes
            if (['final', 'question', 'final_stream'].includes(event.subtype) && event.content) {
                displayMessage({ role: 'agent', content: event.content });
            }
            break;

        case 'error':
            displayMessage({ role: 'system', content: event.error || 'An error occurred' });
            break;

        case 'status_update':
            event.status;
            break;

        case 'done':
            'Execution completed';
            break;

        case 'tool_call':
            event.toolName;
            break;

        case 'tool_result':
            event.toolName;
            break;

        case 'plan_update':
            'Plan updated';
            break;

        default:
            console.log('Unknown event type:', event.type);
    }
});
```

---

## Cleanup

Always call `cleanup()` when you're done with the instance (e.g., when your component unmounts):

```javascript
instance.cleanup();
```

This removes event listeners and properly manages the socket connection.

---

## React Native Integration Example

Here's how to integrate the SDK into a React Native component:

```typescript
import { createHeadlessAgentInstance } from '@uptiqai/widgets-sdk';
import type { HeadlessAgentInstance, AgentInterruptEvent } from '@uptiqai/widgets-sdk';
import { useEffect, useRef, useState } from 'react';

const agentApi = axios.create({
    baseURL: process.env.EXPO_PUBLIC_AGENT_BASE_URL, // Replace with your agent API base URL
    headers: { 'Content-Type': 'application/json' }
});

// Fetch agentExecutorVersion before building config
const agentResponse = await agentApi.get(`/agent-builder/agents/${agent.id}`, {
    headers: {
        'app-id': agent.config.appId,
        'account-id': agent.config.accountId,
        'widgetkey': agent.config.widgetKey
    }
});
const agentData = agentResponse.data?.data;
const agentExecutorVersion = agentData?.config?.agentExecutorVersion;

// Build the config from an agent in the attachedAgents context array
const config = {
    agentId: agent.id,
    serverUrl: process.env.EXPO_PUBLIC_AGENT_BASE_URL, // Replace with your agent API base URL
    widgetKey: agent.config.widgetKey,
    appWidgetKey: agent.config.widgetKey,
    appId: agent.config.appId,
    accountId: agent.config.accountId,
    agentExecutorVersion,
};

const user = {
    uid: 'user-123',
    firstName: 'Jane',
    lastName: 'User',
    email: 'jane@example.com'
};

export const ChatComponent = () => {
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent'; content: string }>>([]);
    const instanceRef = useRef<HeadlessAgentInstance | null>(null);

    useEffect(() => {
        // 1. Create headless agent instance
        const instance = createHeadlessAgentInstance({
            config,
            user,
            instanceId: 'my-chat-instance'
        });
        instanceRef.current = instance;

        // 2. Subscribe to agent events
        const unsubscribe = instance.on('agent-interrupt', (event: AgentInterruptEvent) => {
            switch (event.type) {
                case 'agent_message': {
                    const agentMsg = event as { content?: string; subtype?: string };
                    // Handle final messages, questions, and final streams
                    if (['final', 'question', 'final_stream'].includes(agentMsg.subtype || '') && agentMsg.content) {
                        setMessages(prev => [...prev, { role: 'agent', content: agentMsg.content! }]);
                    }
                    break;
                }

                case 'error': {
                    const errorMsg = (event as { error?: string }).error ?? 'An error occurred';
                    setMessages(prev => [...prev, { role: 'agent', content: errorMsg }]);
                    break;
                }

                case 'status_update':
                case 'done':
                case 'tool_call':
                case 'tool_result':
                case 'plan_update':
                    // Log these events (optional - add UI handling as needed)
                    console.log(`Event: ${event.type}`);
                    break;

                default:
                    console.log('Unknown event type:', event.type);
            }
        });

        // 3. Cleanup on unmount
        return () => {
            unsubscribe();
            instance.cleanup();
        };
    }, []);

    const sendMessage = (text: string, documents?: { signedUrl: string; fileName?: string; mimeType?: string; }[]) => {
        // Add user message to UI
        setMessages(prev => [...prev, { role: 'user', content: text }]);

        // Send to agent
        instanceRef.current?.emit('query', {
            content: text,
            documents: documents
        });
    };

    return (
        <View>
            {/* Your UI here */}
            {messages.map((msg, i) => (
                <View key={i}>
                    <Text>{msg.role}: {msg.content}</Text>
                </View>
            ))}
        </View>
    );
};
```

### Key Implementation Details

1. **Instance Creation**: Create once in `useEffect` with empty dependencies
2. **Event Handling**: Handle multiple subtypes (`final`, `question`, `final_stream`) to capture all agent responses
3. **Cleanup**: Always call `unsubscribe()` and `instance.cleanup()` on unmount
4. **Sending Messages**: Use `instance.emit('query', { content, documents? })` to send queries
5. **Document Support**: Pass document objects with `signedUrl`—you must handle backend uploads manually beforehand
6. **Execution ID**: The SDK automatically subscribes to socket events for the execution ID when you send a query

---

## TypeScript Types

The SDK exports the following TypeScript types:

```typescript
import type {
    HeadlessAgentInstance,
    QueryPayload,
    AgentInterruptEvent,
    CreateHeadlessAgentInstanceParams
} from '@uptiqai/widgets-sdk';
```

### Type Definitions

**HeadlessAgentInstance:**

```typescript
type HeadlessAgentInstance = {
    emit: (event: 'query', payload: QueryPayload) => void;
    on: (event: 'agent-interrupt', handler: (event: AgentInterruptEvent) => void) => () => void;
    cleanup: () => void;
};
```

**QueryPayload:**

```typescript
type QueryPayload = {
    content: string;
    executionId?: string;
    documents?: {
        signedUrl: string;
        fileName?: string;
        mimeType?: string;
    }[];
};
```

**CreateHeadlessAgentInstanceParams:**

```typescript
type CreateHeadlessAgentInstanceParams = {
    config: {
        agentId: string;
        serverUrl: string;
        widgetKey: string;
        appWidgetKey: string;
        appId: string;
        accountId: string;
        agentExecutorVersion: string;
    };
    user: {
        uid: string;
        firstName: string;
        lastName?: string;
        email: string;
    };
    instanceId: string;
};
```

---

## Summary Reference

| Task                      | API                                                                 |
| ------------------------- | ------------------------------------------------------------------- |
| Create headless instance  | `createHeadlessAgentInstance({ config, user, instanceId })`         |
| Send user message         | `instance.emit('query', { content, executionId?, documents? })`     |
| Receive agent updates     | `instance.on('agent-interrupt', (event) => { ... })`                |
| Show final agent messages | Check `event.type === 'agent_message' && event.subtype === 'final'` |
| Show errors               | Check `event.type === 'error'` → use `event.error`                  |
| Upload documents          | Pass `documents` array in query payload                             |
| Unsubscribe               | Call the function returned by `on()`                                |
| Clean up resources        | Call `instance.cleanup()`                                           |

---

## Best Practices

1. **Single Instance**: Create one instance per chat context and reuse it for the entire conversation
2. **Handle Multiple Subtypes**: Check for `final`, `question`, and `final_stream` subtypes to capture all agent messages (not just `final`)
3. **Cleanup**: Always call `cleanup()` when unmounting to prevent memory leaks
4. **Document Handling**: You must handle document uploads manually to your backend and pass the `signedUrl`
5. **Error Handling**: Display error events to inform users when something goes wrong
6. **Execution ID**: Store and pass `executionId` to continue conversations across page reloads
7. **Domain Whitelisting**: Ensure exact matches with no trailing spaces (use full URL with protocol or hostname only)

---

## Operational Notes

- The SDK automatically manages socket connections and reconnection
- Document uploads must be handled manually via backend storage service before passing to the agent
- The socket connection is shared across multiple instances if they use the same user and config
- Always subscribe to events before sending queries to ensure you don't miss any responses
- For server-side or backend-only headless execution (no browser), use the REST API instead
- Agent Always return output in markdown format. Ensure the chat interface displays agent output correctly using a Markdown formatter.

This documentation reflects the current implementation of the Headless Agent JavaScript SDK and serves as the authoritative reference for building custom chat interfaces.
