import { api } from '@/lib/api';

export interface GreetingRecord {
    id: string;
    name: string;
    language: string;
    emoji: string;
    createdAt: string;
}

export interface GreetingsResponse {
    greetings: GreetingRecord[];
    totalCount: number;
}

// Memory-based fallback store for mock mode
let mockGreetingsList: GreetingRecord[] = [
    {
        id: '1',
        name: 'World',
        language: 'English',
        emoji: '👋',
        createdAt: new Date().toISOString()
    }
];

export const greetingService = {
    getGreetings: async (): Promise<GreetingsResponse> => {
        if (process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true') {
            return {
                greetings: [...mockGreetingsList].reverse(),
                totalCount: mockGreetingsList.length
            };
        }

        const response = await api.get('/greetings');
        return response.data;
    },

    createGreeting: async (data: { name: string; language: string; emoji: string }): Promise<GreetingRecord> => {
        if (process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true') {
            const newGreeting: GreetingRecord = {
                id: Math.random().toString(36).substring(7),
                name: data.name,
                language: data.language,
                emoji: data.emoji,
                createdAt: new Date().toISOString()
            };
            mockGreetingsList.push(newGreeting);
            return newGreeting;
        }

        const response = await api.post('/greetings', data);
        return response.data;
    },

    clearGreetings: async (): Promise<{ success: boolean }> => {
        if (process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true') {
            mockGreetingsList = [];
            return { success: true };
        }

        const response = await api.delete('/greetings');
        return response.data;
    }
};
