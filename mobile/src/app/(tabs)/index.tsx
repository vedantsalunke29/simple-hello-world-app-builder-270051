import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { Colors } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { 
    Sparkles, 
    Smile, 
    Languages, 
    User, 
    RefreshCw, 
    Heart, 
    Check, 
    Activity, 
    Info 
} from 'lucide-react-native';
import { logError } from '@/logging/logger';

// Friendly predefined languages for the greeting
const LANGUAGES = [
    { code: 'en', label: 'English', greeting: 'Hello' },
    { code: 'es', label: 'Español', greeting: '¡Hola' },
    { code: 'fr', label: 'Français', greeting: 'Bonjour' },
    { code: 'it', label: 'Italiano', greeting: 'Ciao' },
    { code: 'hi', label: 'हिन्दी', greeting: 'नमस्ते' },
    { code: 'ja', label: '日本語', greeting: 'こんにちは' }
];

// Fun inspirational "hello/positive" quotes
const VIBES = [
    "Every day is a fresh start to say hello to new opportunities!",
    "A simple 'Hello' can change someone's entire day. Spread the light!",
    "Kindness is a language that everyone can understand and speak.",
    "Your potential is endless. Hello to a brand new version of you!",
    "Today is a beautiful day to learn something new and wave hello to the world!",
    "The secret of getting ahead is getting started. Welcome to your journey!"
];

// Interactive emoji reactions
const EMOJIS = ['👋', '✨', '🌟', '❤️', '🎉', '🚀'];

export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    // App states
    const [name, setName] = useState('');
    const [savedName, setSavedName] = useState('World');
    const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
    const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
    const [vibeIndex, setVibeIndex] = useState(0);
    const [greetCount, setVibeCount] = useState(1);

    // Trigger haptic feedback safely
    const triggerHaptic = async (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
        try {
            await Haptics.impactAsync(style);
        } catch (error) {
            logError(error, 'haptic-trigger-failure');
        }
    };

    // Handle greet button press
    const handleGreet = () => {
        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
        const trimmedName = name.trim();
        setSavedName(trimmedName || 'World');
        setVibeCount(prev => prev + 1);
    };

    // Cycle through quotes/vibes
    const handleNextVibe = () => {
        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
        setVibeIndex(prev => (prev + 1) % VIBES.length);
    };

    // Quick chip select
    const handleSelectLang = (lang: typeof LANGUAGES[0]) => {
        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
        setSelectedLang(lang);
    };

    // Quick emoji select
    const handleSelectEmoji = (emoji: string) => {
        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
        setSelectedEmoji(emoji);
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Banner */}
                    <View style={styles.header}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                            <Sparkles size={32} color={colors.primary} />
                        </View>
                        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                            Hello App
                        </Text>
                        <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
                            A simple, premium one-page greeting app
                        </Text>
                    </View>

                    {/* Central Greeting Presentation Card */}
                    <View style={[styles.greetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={styles.emojiDisplay}>{selectedEmoji}</Text>
                        
                        <Text style={[styles.greetMessage, { color: colors.foreground }]}>
                            {selectedLang.greeting}, {savedName}!
                        </Text>
                        
                        <Text style={[styles.greetSub, { color: colors.mutedForeground }]}>
                            You are looking wonderful today! Hope you have a magical day ahead.
                        </Text>

                        {/* Interactive Counter Badges */}
                        <View style={styles.badgeRow}>
                            <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
                                <Activity size={14} color={colors.primary} style={styles.badgeIcon} />
                                <Text style={[styles.badgeText, { color: colors.foreground }]}>
                                    Greetings: {greetCount}
                                </Text>
                            </View>
                            <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
                                <Languages size={14} color={colors.primary} style={styles.badgeIcon} />
                                <Text style={[styles.badgeText, { color: colors.foreground }]}>
                                    {selectedLang.label}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Personalization Section */}
                    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                            Customize Greeting
                        </Text>

                        {/* Name Input */}
                        <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>
                            Enter Your Name
                        </Text>
                        <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.background }]}>
                            <User size={18} color={colors.mutedForeground} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.textInput, { color: colors.foreground }]}
                                placeholder="Type your name here..."
                                placeholderTextColor={colors.mutedForeground}
                                value={name}
                                onChangeText={setName}
                                maxLength={25}
                                autoCapitalize="words"
                            />
                        </View>

                        {/* Apply Button */}
                        <TouchableOpacity 
                            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                            onPress={handleGreet}
                            activeOpacity={0.8}
                        >
                            <Smile size={18} color={colors.primaryForeground} style={styles.buttonIcon} />
                            <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
                                Greet Me!
                            </Text>
                        </TouchableOpacity>

                        {/* Language Selector chips */}
                        <Text style={[styles.inputLabel, { color: colors.mutedForeground, marginTop: 16 }]}>
                            Select Greeting Language
                        </Text>
                        <View style={styles.chipRow}>
                            {LANGUAGES.map((lang) => {
                                const isSelected = selectedLang.code === lang.code;
                                return (
                                    <TouchableOpacity
                                        key={lang.code}
                                        style={[
                                            styles.chip,
                                            { 
                                                backgroundColor: isSelected ? colors.primary : colors.background,
                                                borderColor: colors.border
                                            }
                                        ]}
                                        onPress={() => handleSelectLang(lang)}
                                        activeOpacity={0.7}
                                    >
                                        <Text 
                                            style={[
                                                styles.chipText, 
                                                { color: isSelected ? colors.primaryForeground : colors.foreground }
                                            ]}
                                        >
                                            {lang.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Emoji Reaction chips */}
                        <Text style={[styles.inputLabel, { color: colors.mutedForeground, marginTop: 16 }]}>
                            Choose An Emoji Reaction
                        </Text>
                        <View style={styles.emojiRow}>
                            {EMOJIS.map((emoji) => {
                                const isSelected = selectedEmoji === emoji;
                                return (
                                    <TouchableOpacity
                                        key={emoji}
                                        style={[
                                            styles.emojiChip,
                                            { 
                                                backgroundColor: isSelected ? colors.primary + '20' : colors.background,
                                                borderColor: isSelected ? colors.primary : colors.border
                                            }
                                        ]}
                                        onPress={() => handleSelectEmoji(emoji)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.emojiChipText}>{emoji}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Vibe / Quote Card */}
                    <View style={[styles.vibeCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                        <View style={styles.vibeHeader}>
                            <Heart size={16} color={colors.primary} style={styles.vibeIcon} />
                            <Text style={[styles.vibeTitle, { color: colors.foreground }]}>
                                Daily Vibe Check
                            </Text>
                        </View>
                        <Text style={[styles.vibeText, { color: colors.foreground }]}>
                            "{VIBES[vibeIndex]}"
                        </Text>
                        <TouchableOpacity 
                            style={[styles.vibeButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={handleNextVibe}
                            activeOpacity={0.7}
                        >
                            <RefreshCw size={14} color={colors.primary} style={styles.vibeBtnIcon} />
                            <Text style={[styles.vibeBtnText, { color: colors.primary }]}>
                                New Vibe
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Info/About Section */}
                    <View style={styles.footer}>
                        <Info size={14} color={colors.mutedForeground} style={styles.footerIcon} />
                        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
                            Created with 💖 as a single-page interactive mobile app.
                        </Text>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginVertical: 16,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.8,
    },
    greetCard: {
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 20,
    },
    emojiDisplay: {
        fontSize: 56,
        marginBottom: 12,
    },
    greetMessage: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    greetSub: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 10,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    badgeIcon: {
        marginRight: 4,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        marginBottom: 12,
    },
    inputIcon: {
        marginRight: 8,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonIcon: {
        marginRight: 8,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 4,
    },
    chip: {
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '500',
    },
    emojiRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    emojiChip: {
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emojiChipText: {
        fontSize: 20,
    },
    vibeCard: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: 20,
    },
    vibeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    vibeIcon: {
        marginRight: 6,
    },
    vibeTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 0.3,
    },
    vibeText: {
        fontSize: 15,
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 16,
        paddingHorizontal: 10,
    },
    vibeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 2,
        elevation: 1,
    },
    vibeBtnIcon: {
        marginRight: 6,
    },
    vibeBtnText: {
        fontSize: 12,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        opacity: 0.8,
    },
    footerIcon: {
        marginRight: 6,
    },
    footerText: {
        fontSize: 12,
        textAlign: 'center',
    }
});
