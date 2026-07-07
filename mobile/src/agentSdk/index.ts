import type { AgentInterruptEvent } from '@uptiqai/widgets-sdk';
import { createHeadlessAgentInstance } from '@uptiqai/widgets-sdk';
import { useEffect, useRef, useState } from 'react';
import { toJSONSchema, z } from 'zod';
import type { AgentEventType } from './types';

interface UseCallAgentSocketParams {
    agentId: string;
    config: {
        appId: string;
        accountId: string;
        widgetKey: string;
        agentExecutorVersion?: string;
    };
    user: {
        uid: string;
        firstName: string;
        lastName?: string;
        email: string;
    };
}

interface CachedAgentInstance {
    instance: ReturnType<typeof createHeadlessAgentInstance>;
    connected: boolean;
}

const EMIT_DELAY_MS = 300;

const buildStructuredPrompt = (prompt: string, outputSchema?: z.ZodType): string => {
    if (!outputSchema) {
        return prompt;
    }
    const jsonSchema = toJSONSchema(outputSchema);
    return `${prompt} Strictly give output in the following json schema format: ${JSON.stringify(jsonSchema)}`;
};

const cleanMarkdownWrapper = (content: string): string => {
    let cleaned = content.trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned
            .replace(/^```[a-zA-Z]*\n/, '')
            .replace(/```$/, '')
            .trim();
    }
    return cleaned;
};

export function useCallAgentSocket({ agentId, config, user }: UseCallAgentSocketParams) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const instanceCacheRef = useRef<Map<string, CachedAgentInstance>>(new Map());

    useEffect(() => {
        const currentInstance = instanceCacheRef.current;
        return () => {
            currentInstance.forEach(({ instance }: CachedAgentInstance) => instance.cleanup());
            currentInstance.clear();
        };
    }, []);

    const getOrCreateInstance = (id: string): CachedAgentInstance => {
        const cached = instanceCacheRef.current.get(id);
        if (cached) return cached;

        const instance = createHeadlessAgentInstance({
            config: {
                agentId: id,
                serverUrl: process.env.VITE_AGENT_BASE_URL || '',
                widgetKey: config.widgetKey,
                appWidgetKey: config.widgetKey,
                appId: config.appId,
                accountId: config.accountId,
                agentExecutorVersion: config.agentExecutorVersion || ''
            },
            user,
            instanceId: `agent-${id}`
        });

        const entry: CachedAgentInstance = { instance, connected: false };
        instanceCacheRef.current.set(id, entry);
        return entry;
    };

    const callAgentSocket = async <T extends z.ZodType>(params: {
        prompt: string;
        outputSchema?: T;
        timeoutMs?: number | null;
        onStreamingUpdate?: (params: { content: string; event: AgentEventType }) => void;
    }): Promise<z.infer<T> | string> => {
        setLoading(true);
        setError(null);

        const { prompt, outputSchema, timeoutMs = null, onStreamingUpdate } = params;
        const fullPrompt = buildStructuredPrompt(prompt, outputSchema);

        try {
            const cached = getOrCreateInstance(agentId);
            const emitDelay = cached.connected ? 0 : EMIT_DELAY_MS;

            const resultString = await new Promise<string>((resolve, reject) => {
                const timeout =
                    timeoutMs != null
                        ? setTimeout(() => {
                              unsubscribe();
                              reject(new Error('Request timed out waiting for WebSocket response'));
                          }, timeoutMs)
                        : null;

                const unsubscribe = cached.instance.on('agent-interrupt', (event: AgentInterruptEvent) => {
                    if (event.type === 'agent_message') {
                        const agentMsg = event;

                        if (agentMsg.content && agentMsg.subtype) {
                            onStreamingUpdate?.({ content: agentMsg.content, event: agentMsg.subtype });
                            if (agentMsg.subtype === 'final') {
                                if (timeout != null) clearTimeout(timeout);
                                unsubscribe();
                                cached.connected = true;
                                resolve(agentMsg.content);
                            }
                        }
                    } else if (event.type === 'error') {
                        const errorMsg = (event as { error?: string }).error ?? 'An error occurred';
                        if (timeout != null) clearTimeout(timeout);
                        unsubscribe();
                        reject(new Error(errorMsg));
                    }
                });

                setTimeout(() => {
                    cached.instance.emit('query', { content: fullPrompt });
                }, emitDelay);
            });

            const cleanedContent = cleanMarkdownWrapper(resultString);

            if (!outputSchema) {
                return cleanedContent;
            }

            return outputSchema.parse(JSON.parse(cleanedContent));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to call agent over socket';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    return { callAgentSocket, loading, error };
}
