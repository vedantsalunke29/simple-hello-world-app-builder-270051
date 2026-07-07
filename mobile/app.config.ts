import { ExpoConfig } from 'expo/config';

const expoConfig = (): ExpoConfig => {
    const slug = process.env.EXPO_PUBLIC_APP_SLUG || 'expo-mobile-app';
    const scheme = process.env.EXPO_PUBLIC_APP_SCHEME || slug.trim().replace(/-/g, '');

    // App-store identifiers. Injected by the platform on publish (user-provided or slug-derived default);
    // iOS bundle id and Android package can differ, and fall back to a shared default.
    const defaultIdentifier = process.env.EXPO_PUBLIC_APP_BUNDLE_ID || `com.mobile.${scheme}`;
    const iosBundleIdentifier = process.env.EXPO_PUBLIC_IOS_BUNDLE_ID || defaultIdentifier;
    const androidPackage = process.env.EXPO_PUBLIC_ANDROID_PACKAGE || defaultIdentifier;
    // EAS project ownership + link. Injected as CI variables by the platform on publish.
    const easProjectId = process.env.EAS_PROJECT_ID;
    const owner = process.env.EAS_PROJECT_OWNER;

    return {
        name: process.env.EXPO_PUBLIC_APP_NAME || 'Mobile App Template',
        slug,
        scheme,
        version: '1.0.0',
        orientation: 'portrait',
        userInterfaceStyle: 'automatic',
        icon: './src/assets/images/icon.png',
        ...(owner ? { owner } : {}),
        ...(easProjectId ? { extra: { eas: { projectId: easProjectId } } } : {}),
        ios: {
            supportsTablet: true,
            bundleIdentifier: iosBundleIdentifier
        },
        android: {
            package: androidPackage,
            adaptiveIcon: {
                backgroundColor: '#E6F4FE',
                foregroundImage: './src/assets/images/android-icon-foreground.png',
                backgroundImage: './src/assets/images/android-icon-background.png',
                monochromeImage: './src/assets/images/android-icon-monochrome.png'
            },
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false
        },
        web: {
            output: 'static',
            favicon: './src/assets/images/favicon.png'
        },
        plugins: [
            'expo-router',
            [
                'expo-splash-screen',
                {
                    image: './src/assets/images/splash-icon.png',
                    imageWidth: 200,
                    resizeMode: 'contain',
                    backgroundColor: '#ffffff',
                    dark: {
                        backgroundColor: '#000000'
                    }
                }
            ]
        ],
        // Do not modify below config
        newArchEnabled: true,
        experiments: {
            typedRoutes: true,
            reactCompiler: true
        }
    };
};

export default expoConfig;
