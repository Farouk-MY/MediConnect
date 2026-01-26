import { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useAuthStore } from '@/lib/stores/authStore';
import { colors } from '@/lib/constants/colors';

const { width, height } = Dimensions.get('window');

// Medical pulse animation
const pulseAnimation = {
    0: { transform: [{ scale: 1 }], opacity: 0.7 },
    0.5: { transform: [{ scale: 1.15 }], opacity: 1 },
    1: { transform: [{ scale: 1 }], opacity: 0.7 },
};

// Heartbeat-like animation
const heartbeatAnimation = {
    0: { transform: [{ scale: 1 }] },
    0.1: { transform: [{ scale: 1.1 }] },
    0.2: { transform: [{ scale: 1 }] },
    0.3: { transform: [{ scale: 1.15 }] },
    0.4: { transform: [{ scale: 1 }] },
    1: { transform: [{ scale: 1 }] },
};

// Floating animation
const floatAnimation = {
    0: { transform: [{ translateY: 0 }] },
    0.5: { transform: [{ translateY: -15 }] },
    1: { transform: [{ translateY: 0 }] },
};

export default function SplashScreen() {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useAuthStore();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Complex entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 40,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            setTimeout(() => {
                if (isAuthenticated && user) {
                    if (user.role === 'patient') {
                        router.replace('/(patient)/(tabs)');
                    } else {
                        router.replace('/(doctor)/(tabs)');
                    }
                } else {
                    router.replace('/(auth)/login');
                }
            }, 2500);
        }
    }, [isLoading, isAuthenticated, user]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <LinearGradient
            colors={[colors.primary[600], colors.primary[500], colors.secondary[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            {/* Animated medical cross background pattern */}
            <View style={styles.backgroundPattern}>
                {[...Array(20)].map((_, i) => (
                    <Animatable.View
                        key={i}
                        animation={pulseAnimation}
                        iterationCount="infinite"
                        duration={3000 + i * 100}
                        delay={i * 100}
                        style={[
                            styles.crossIcon,
                            {
                                left: (i % 5) * (width / 5),
                                top: Math.floor(i / 5) * (height / 5),
                            },
                        ]}
                    >
                        <Text style={styles.crossText}>+</Text>
                    </Animatable.View>
                ))}
            </View>

            {/* Floating medical icons */}
            <Animatable.View
                animation={floatAnimation}
                iterationCount="infinite"
                duration={3000}
                style={[styles.floatingIcon, styles.icon1]}
            >
                <View style={styles.iconCircle}>
                    <Text style={styles.iconText}>🏥</Text>
                </View>
            </Animatable.View>

            <Animatable.View
                animation={floatAnimation}
                iterationCount="infinite"
                duration={3500}
                delay={500}
                style={[styles.floatingIcon, styles.icon2]}
            >
                <View style={styles.iconCircle}>
                    <Text style={styles.iconText}>⚕️</Text>
                </View>
            </Animatable.View>

            {/* Main content */}
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                    alignItems: 'center',
                }}
            >
                {/* Logo with medical cross */}
                <Animatable.View
                    animation={heartbeatAnimation}
                    iterationCount="infinite"
                    duration={2000}
                    style={styles.logoContainer}
                >
                    <Animated.View
                        style={[
                            styles.logoOuter,
                            { transform: [{ rotate: spin }] },
                        ]}
                    >
                        <LinearGradient
                            colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
                            style={styles.logoInner}
                        >
                            <View style={styles.medicalCross}>
                                <View style={styles.crossHorizontal} />
                                <View style={styles.crossVertical} />
                            </View>
                        </LinearGradient>
                    </Animated.View>
                </Animatable.View>

                {/* App branding */}
                <Animatable.View
                    animation="fadeInUp"
                    delay={400}
                    duration={800}
                    style={styles.brandContainer}
                >
                    <Text style={styles.title}>MediConnect</Text>
                    <View style={styles.titleUnderline} />
                </Animatable.View>

                <Animatable.Text
                    animation="fadeInUp"
                    delay={600}
                    duration={800}
                    style={styles.subtitle}
                >
                    Professional Healthcare Platform
                </Animatable.Text>

                {/* Medical stats/features */}
                <Animatable.View
                    animation="fadeIn"
                    delay={800}
                    duration={800}
                    style={styles.featuresContainer}
                >
                    <View style={styles.featureItem}>
                        <View style={styles.featureDot} />
                        <Text style={styles.featureText}>Secure</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <View style={styles.featureDot} />
                        <Text style={styles.featureText}>Fast</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <View style={styles.featureDot} />
                        <Text style={styles.featureText}>Reliable</Text>
                    </View>
                </Animatable.View>

                {/* Loading indicator - medical pulse style */}
                <Animatable.View
                    animation="fadeIn"
                    delay={1000}
                    duration={600}
                    style={styles.loadingContainer}
                >
                    <View style={styles.pulseLineContainer}>
                        {[0, 1, 2, 3, 4].map((i) => (
                            <Animatable.View
                                key={i}
                                animation={pulseAnimation}
                                iterationCount="infinite"
                                duration={1500}
                                delay={i * 100}
                                style={[
                                    styles.pulseLine,
                                    { height: i === 2 ? 24 : i === 1 || i === 3 ? 16 : 8 },
                                ]}
                            />
                        ))}
                    </View>
                </Animatable.View>
            </Animated.View>

            {/* Bottom medical wave */}
            <Animatable.View
                animation="slideInUp"
                duration={1200}
                delay={200}
                style={styles.bottomWave}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(255, 255, 255, 0.1)']}
                    style={styles.waveGradient}
                />
            </Animatable.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backgroundPattern: {
        position: 'absolute',
        width: width,
        height: height,
        opacity: 0.1,
    },
    crossIcon: {
        position: 'absolute',
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    crossText: {
        color: 'white',
        fontSize: 24,
        fontWeight: '300',
    },
    floatingIcon: {
        position: 'absolute',
    },
    icon1: {
        top: height * 0.15,
        right: 40,
    },
    icon2: {
        bottom: height * 0.2,
        left: 40,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    iconText: {
        fontSize: 28,
    },
    logoContainer: {
        marginBottom: 40,
    },
    logoOuter: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
    },
    logoInner: {
        width: 130,
        height: 130,
        borderRadius: 65,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    medicalCross: {
        width: 70,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    crossHorizontal: {
        position: 'absolute',
        width: 70,
        height: 20,
        backgroundColor: colors.primary[600],
        borderRadius: 10,
    },
    crossVertical: {
        position: 'absolute',
        width: 20,
        height: 70,
        backgroundColor: colors.primary[600],
        borderRadius: 10,
    },
    brandContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        color: 'white',
        fontSize: 48,
        fontWeight: 'bold',
        letterSpacing: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    titleUnderline: {
        width: 100,
        height: 4,
        backgroundColor: colors.secondary[400],
        borderRadius: 2,
        marginTop: 8,
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.95)',
        fontSize: 16,
        marginBottom: 32,
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 5,
    },
    featuresContainer: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 40,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    featureDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.secondary[400],
    },
    featureText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    loadingContainer: {
        marginTop: 20,
    },
    pulseLineContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 6,
        height: 30,
    },
    pulseLine: {
        width: 4,
        backgroundColor: 'white',
        borderRadius: 2,
    },
    bottomWave: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    waveGradient: {
        flex: 1,
    },
});