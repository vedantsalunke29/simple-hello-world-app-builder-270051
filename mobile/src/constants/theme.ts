import { Platform } from 'react-native';

export const Colors = {
    light: {
        // Base colors
        background: '#ffffff',
        foreground: '#09090b',

        // Primary
        primary: '#2b7fff',
        primaryForeground: '#eff6ff',

        // Secondary
        secondary: '#f4f4f5',
        secondaryForeground: '#18181b',

        // Muted
        muted: '#f4f4f5',
        mutedForeground: '#454546',

        // Accent
        accent: '#f4f4f5',
        accentForeground: '#18181b',

        // Destructive
        destructive: '#ca3214',
        destructiveForeground: '#fffcfc',

        // Border & Input
        border: '#e5e5e5',
        input: '#e4e4e7',
        ring: '#2b7fff',

        // Card
        card: '#ffffff',
        cardForeground: '#09090b',

        // Popover
        popover: '#ffffff',
        popoverForeground: '#09090b',

        // Chart colors
        chart1: '#e67e50',
        chart2: '#6bb8b8',
        chart3: '#3d4a6b',
        chart4: '#d4d477',
        chart5: '#c9a05e'
    },
    dark: {
        // Base colors
        background: '#09090b',
        foreground: '#fafafa',

        // Primary
        primary: '#2b7fff',
        primaryForeground: '#eff6ff',

        // Secondary
        secondary: '#27272a',
        secondaryForeground: '#fafafa',

        // Muted
        muted: '#27272a',
        mutedForeground: '#9f9fa9',

        // Accent
        accent: '#27272a',
        accentForeground: '#fafafa',

        // Destructive
        destructive: '#541c15',
        destructiveForeground: '#ede9e8',

        // Border & Input
        border: '#444444',
        input: '#212121',
        ring: '#2b7fff',

        // Card
        card: '#09090b',
        cardForeground: '#fafafa',

        // Popover
        popover: '#09090b',
        popoverForeground: '#fafafa',

        // Chart colors
        chart1: '#7b5fb8',
        chart2: '#7bc9a0',
        chart3: '#c9a05e',
        chart4: '#b86bb8',
        chart5: '#c97070'
    }
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999
};

export const Fonts = Platform.select({
    ios: {
        /** iOS `UIFontDescriptorSystemDesignDefault` */
        sans: 'system-ui',
        /** iOS `UIFontDescriptorSystemDesignSerif` */
        serif: 'ui-serif',
        /** iOS `UIFontDescriptorSystemDesignRounded` */
        rounded: 'ui-rounded',
        /** iOS `UIFontDescriptorSystemDesignMonospaced` */
        mono: 'ui-monospace'
    },
    default: {
        sans: 'normal',
        serif: 'serif',
        rounded: 'normal',
        mono: 'monospace'
    },
    web: {
        sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        serif: "Georgia, 'Times New Roman', serif",
        rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
        mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
    }
});
