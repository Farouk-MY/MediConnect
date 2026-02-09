/**
 * AnimatedLoader Component
 * 
 * A reusable loading animation with animated bars like the splash screen.
 * Can be used as fullscreen overlay or inline loading indicator.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/lib/constants/colors';

const { width, height } = Dimensions.get('window');

interface AnimatedLoaderProps {
    /** Show as fullscreen overlay */
    fullscreen?: boolean;
    /** Loading message */
    message?: string;
    /** Loader size: 'small' | 'medium' | 'large' */
    size?: 'small' | 'medium' | 'large';
    /** Bar color - defaults to primary */
    color?: string;
    /** Show the MediConnect branding */
    showBranding?: boolean;
    /** Background color for fullscreen mode */
    backgroundColor?: string;
}

export default function AnimatedLoader({
    fullscreen = false,
    message,
    size = 'medium',
    color = colors.primary[500],
    showBranding = false,
    backgroundColor = 'white',
}: AnimatedLoaderProps) {
    const bars = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;

    // Size configurations
    const sizeConfig = {
        small: { barWidth: 4, barHeight: 20, gap: 4, borderRadius: 2 },
        medium: { barWidth: 6, barHeight: 32, gap: 6, borderRadius: 3 },
        large: { barWidth: 8, barHeight: 48, gap: 8, borderRadius: 4 },
    };

    const config = sizeConfig[size];

    useEffect(() => {
        const animations = bars.map((bar, index) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(index * 100),
                    Animated.timing(bar, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(bar, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ])
            );
        });

        const parallelAnimation = Animated.parallel(animations);
        parallelAnimation.start();

        return () => {
            parallelAnimation.stop();
        };
    }, []);

    const renderBars = () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: config.gap }}>
            {bars.map((animValue, index) => (
                <Animated.View
                    key={index}
                    style={{
                        width: config.barWidth,
                        height: config.barHeight,
                        borderRadius: config.borderRadius,
                        backgroundColor: color,
                        transform: [
                            {
                                scaleY: animValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.4, 1],
                                }),
                            },
                        ],
                        opacity: animValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.4, 1],
                        }),
                    }}
                />
            ))}
        </View>
    );

    // Fullscreen overlay
    if (fullscreen) {
        return (
            <View 
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 999,
                }}
            >
                {showBranding && (
                    <View style={{ alignItems: 'center', marginBottom: 40 }}>
                        {/* Logo */}
                        <LinearGradient
                            colors={[colors.primary[500], colors.primary[600]]}
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 24,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 20,
                                shadowColor: colors.primary[500],
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.3,
                                shadowRadius: 16,
                                elevation: 10,
                            }}
                        >
                            {/* Medical cross */}
                            <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{ 
                                    position: 'absolute', 
                                    width: 36, 
                                    height: 10, 
                                    backgroundColor: 'white', 
                                    borderRadius: 5 
                                }} />
                                <View style={{ 
                                    position: 'absolute', 
                                    width: 10, 
                                    height: 36, 
                                    backgroundColor: 'white', 
                                    borderRadius: 5 
                                }} />
                            </View>
                        </LinearGradient>
                        <Text style={{ 
                            fontSize: 28, 
                            fontWeight: 'bold', 
                            color: colors.gray[900],
                            letterSpacing: 1,
                        }}>
                            MediConnect
                        </Text>
                    </View>
                )}

                {renderBars()}

                {message && (
                    <Text style={{ 
                        marginTop: 20, 
                        color: colors.gray[500],
                        fontSize: 14,
                        fontWeight: '500',
                    }}>
                        {message}
                    </Text>
                )}
            </View>
        );
    }

    // Inline loader
    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            {renderBars()}
            {message && (
                <Text style={{ 
                    marginTop: 12, 
                    color: colors.gray[500],
                    fontSize: 12,
                    fontWeight: '500',
                }}>
                    {message}
                </Text>
            )}
        </View>
    );
}

/**
 * LoadingOverlay - Full screen loading with blur
 */
export function LoadingOverlay({ 
    visible, 
    message = 'Chargement...',
}: { 
    visible: boolean; 
    message?: string;
}) {
    if (!visible) return null;

    return (
        <View
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255,255,255,0.95)',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 999,
            }}
        >
            <AnimatedLoader size="large" message={message} />
        </View>
    );
}

/**
 * InlineLoader - For use within content areas
 */
export function InlineLoader({ 
    message,
    size = 'medium',
}: { 
    message?: string;
    size?: 'small' | 'medium' | 'large';
}) {
    return <AnimatedLoader size={size} message={message} />;
}

/**
 * CardLoader - Skeleton loader for cards
 */
export function CardLoader({ count = 3 }: { count?: number }) {
    return (
        <View style={{ gap: 16 }}>
            {Array.from({ length: count }).map((_, index) => (
                <View 
                    key={index}
                    style={{
                        backgroundColor: 'white',
                        borderRadius: 24,
                        padding: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.08,
                        shadowRadius: 12,
                        elevation: 4,
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* Avatar skeleton */}
                        <View style={{
                            width: 80,
                            height: 80,
                            borderRadius: 20,
                            backgroundColor: colors.gray[100],
                            marginRight: 16,
                        }} />
                        <View style={{ flex: 1 }}>
                            {/* Name skeleton */}
                            <View style={{
                                width: '70%',
                                height: 18,
                                borderRadius: 9,
                                backgroundColor: colors.gray[100],
                                marginBottom: 8,
                            }} />
                            {/* Specialty skeleton */}
                            <View style={{
                                width: '50%',
                                height: 14,
                                borderRadius: 7,
                                backgroundColor: colors.gray[100],
                                marginBottom: 12,
                            }} />
                            {/* Stats skeleton */}
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <View style={{
                                    width: 60,
                                    height: 24,
                                    borderRadius: 8,
                                    backgroundColor: colors.gray[100],
                                }} />
                                <View style={{
                                    width: 60,
                                    height: 24,
                                    borderRadius: 8,
                                    backgroundColor: colors.gray[100],
                                }} />
                            </View>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}
