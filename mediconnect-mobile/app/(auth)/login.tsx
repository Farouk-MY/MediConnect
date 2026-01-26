import { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Dimensions,
    StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/authStore';
import { colors } from '@/lib/constants/colors';
import { useToast } from '@/lib/hooks/useToast';
import { Toast } from '@/components/ui/Toast';

const { width, height } = Dimensions.get('window');

// Custom smooth animations
const fadeInUp = {
    from: { opacity: 0, translateY: 30 },
    to: { opacity: 1, translateY: 0 },
};

const scaleIn = {
    from: { opacity: 0, scale: 0.8 },
    to: { opacity: 1, scale: 1 },
};

export default function LoginScreen() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const { toast, showToast, hideToast } = useToast();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const headerAnim = useRef(new Animated.Value(0)).current;
    const formAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(headerAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(formAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!email) {
            newErrors.email = 'Email is required';
            showToast('Email is required', 'error');
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
            showToast('Please enter a valid email address', 'error');
        }

        if (!password) {
            newErrors.password = 'Password is required';
            showToast('Password is required', 'error');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        console.log('🔵 Login button clicked');

        if (!validateForm()) {
            console.log('❌ Validation failed');
            return;
        }

        console.log('✅ Validation passed');
        setLoading(true);

        try {
            console.log('📤 Calling login API...');
            const response = await authApi.login({ email, password });
            console.log('✅ Login successful, got tokens:', {
                access_token: response.access_token.substring(0, 20) + '...',
                refresh_token: response.refresh_token.substring(0, 20) + '...',
            });

            console.log('📤 Fetching user data with token...');
            const userResponse = await authApi.getCurrentUser(response.access_token);
            console.log('✅ User data received:', userResponse);

            console.log('💾 Storing auth data...');
            await setAuth(userResponse, response.access_token, response.refresh_token);
            console.log('✅ Auth stored successfully');

            console.log('🚀 Navigating to dashboard...');
            if (userResponse.role === 'patient') {
                console.log('👤 Going to patient dashboard');
                router.replace('/(patient)/(tabs)');
            } else {
                console.log('👨‍⚕️ Going to doctor dashboard');
                router.replace('/(doctor)/(tabs)');
            }
            console.log('✅ Navigation complete!');
        } catch (error: any) {
            console.error('❌ Login error:', error);
            console.error('Error response:', error.response?.data);
            setLoading(false);
            const errorMessage = error.response?.data?.detail || 'Invalid email or password';
            showToast(errorMessage, 'error');
        }
    };

    return (
        <View style={styles.container}>
            <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Medical-themed header */}
                    <Animated.View
                        style={[
                            styles.header,
                            {
                                opacity: headerAnim,
                                transform: [
                                    {
                                        translateY: headerAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-50, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={[colors.primary[600], colors.primary[500], colors.secondary[500]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.headerGradient}
                        >
                            {/* Medical grid pattern */}
                            <View style={styles.gridPattern}>
                                {[...Array(6)].map((_, i) => (
                                    <View key={i} style={styles.gridLine} />
                                ))}
                            </View>

                            {/* Logo and branding */}
                            <Animatable.View
                                animation={scaleIn}
                                delay={400}
                                duration={1000}
                                style={styles.logoSection}
                            >
                                <View style={styles.logoWrapper}>
                                    <LinearGradient
                                        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
                                        style={styles.logo}
                                    >
                                        {/* Medical cross icon */}
                                        <View style={styles.medicalCross}>
                                            <View style={styles.crossHorizontal} />
                                            <View style={styles.crossVertical} />
                                        </View>
                                    </LinearGradient>

                                    {/* Pulsing ring around logo */}
                                    <Animatable.View
                                        animation="pulse"
                                        iterationCount="infinite"
                                        duration={2000}
                                        style={styles.logoRing}
                                    />
                                </View>

                                <Text style={styles.appName}>MediConnect</Text>
                                <View style={styles.divider} />
                                <Text style={styles.welcomeText}>Welcome Back</Text>
                                <Text style={styles.subtitleText}>
                                    Sign in to access your healthcare dashboard
                                </Text>
                            </Animatable.View>
                        </LinearGradient>
                    </Animated.View>

                    {/* Login form card */}
                    <Animated.View
                        style={[
                            styles.formCard,
                            {
                                opacity: formAnim,
                                transform: [
                                    {
                                        translateY: formAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [30, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={['#FFFFFF', '#F8FAFC']}
                            style={styles.cardGradient}
                        >
                            {/* Form header */}
                            <View style={styles.formHeader}>
                                <View style={styles.formHeaderLine} />
                                <Text style={styles.formTitle}>Sign In</Text>
                                <View style={styles.formHeaderLine} />
                            </View>

                            {/* Email input */}
                            <Animatable.View animation={fadeInUp} delay={600} duration={600}>
                                <Input
                                    label="Email Address"
                                    placeholder="doctor@example.com"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setErrors((prev) => ({ ...prev, email: undefined }));
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    icon="mail-outline"
                                    error={errors.email}
                                />
                            </Animatable.View>

                            {/* Password input */}
                            <Animatable.View animation={fadeInUp} delay={700} duration={600}>
                                <Input
                                    label="Password"
                                    placeholder="Enter your secure password"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        setErrors((prev) => ({ ...prev, password: undefined }));
                                    }}
                                    isPassword
                                    icon="lock-closed-outline"
                                    error={errors.password}
                                />
                            </Animatable.View>

                            {/* Remember me and Forgot password */}
                            <Animatable.View
                                animation={fadeInUp}
                                delay={800}
                                duration={600}
                                style={styles.optionsRow}
                            >
                                <TouchableOpacity style={styles.rememberContainer}>
                                    <View style={styles.checkbox}>
                                        <Ionicons name="checkmark" size={14} color={colors.primary[600]} />
                                    </View>
                                    <Text style={styles.rememberText}>Remember me</Text>
                                </TouchableOpacity>

                                <TouchableOpacity>
                                    <Text style={styles.forgotText}>Forgot Password?</Text>
                                </TouchableOpacity>
                            </Animatable.View>

                            {/* Login button */}
                            <Animatable.View animation={fadeInUp} delay={900} duration={600}>
                                <TouchableOpacity
                                    onPress={handleLogin}
                                    disabled={loading}
                                    style={styles.loginButton}
                                >
                                    <LinearGradient
                                        colors={[colors.primary[600], colors.primary[700]]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.loginGradient}
                                    >
                                        {loading ? (
                                            <Animatable.View
                                                animation="rotate"
                                                iterationCount="infinite"
                                                duration={1000}
                                            >
                                                <Ionicons name="reload" size={24} color="white" />
                                            </Animatable.View>
                                        ) : (
                                            <>
                                                <Text style={styles.loginButtonText}>Sign In</Text>
                                                <Ionicons name="arrow-forward" size={20} color="white" />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animatable.View>

                            {/* Divider */}
                            <Animatable.View
                                animation={fadeInUp}
                                delay={1000}
                                duration={600}
                                style={styles.dividerContainer}
                            >
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>OR</Text>
                                <View style={styles.dividerLine} />
                            </Animatable.View>


                            {/* Sign up link */}
                            <Animatable.View
                                animation={fadeInUp}
                                delay={1200}
                                duration={600}
                                style={styles.signupContainer}
                            >
                                <Text style={styles.signupText}>Dont have an account? </Text>
                                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                                    <Text style={styles.signupLink}>Create Account</Text>
                                </TouchableOpacity>
                            </Animatable.View>

                            {/* Security badge */}
                            <Animatable.View
                                animation="fadeIn"
                                delay={1400}
                                duration={800}
                                style={styles.securityBadge}
                            >
                                <Ionicons name="shield-checkmark" size={16} color={colors.success} />
                                <Text style={styles.securityText}>
                                    HIPAA Compliant & Secure
                                </Text>
                            </Animatable.View>
                        </LinearGradient>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        overflow: 'hidden',
    },
    headerGradient: {
        paddingTop: 60,
        paddingBottom: 60,
        paddingHorizontal: 24,
        position: 'relative',
    },
    gridPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'white',
    },

    logoSection: {
        alignItems: 'center',
    },
    logoWrapper: {
        position: 'relative',
        marginBottom: 24,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    logoRing: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        top: -10,
        left: -10,
    },
    medicalCross: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    crossHorizontal: {
        position: 'absolute',
        width: 50,
        height: 14,
        backgroundColor: colors.primary[600],
        borderRadius: 7,
    },
    crossVertical: {
        position: 'absolute',
        width: 14,
        height: 50,
        backgroundColor: colors.primary[600],
        borderRadius: 7,
    },
    appName: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 12,
    },
    divider: {
        width: 60,
        height: 3,
        backgroundColor: colors.secondary[400],
        borderRadius: 2,
        marginBottom: 16,
    },
    welcomeText: {
        color: 'white',
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 8,
    },
    subtitleText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    formCard: {
        marginTop: -30,
        marginHorizontal: 20,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 40,
    },
    cardGradient: {
        borderRadius: 24,
        padding: 24,
    },
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 12,
    },
    formHeaderLine: {
        flex: 1,
        height: 2,
        backgroundColor: colors.primary[200],
    },
    formTitle: {
        color: colors.primary[700],
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    rememberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.primary[300],
        backgroundColor: colors.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
    },
    rememberText: {
        color: colors.gray[600],
        fontSize: 14,
    },
    forgotText: {
        color: colors.primary[600],
        fontWeight: '600',
        fontSize: 14,
    },
    loginButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    loginGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.gray[200],
    },
    dividerText: {
        color: colors.gray[400],
        fontSize: 12,
        fontWeight: '600',
    },
    quickAccessContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },
    quickAccessButton: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: colors.primary[50],
        borderWidth: 1,
        borderColor: colors.primary[100],
    },
    quickAccessIcon: {
        marginBottom: 8,
    },
    quickAccessText: {
        color: colors.primary[700],
        fontSize: 12,
        fontWeight: '600',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    signupText: {
        color: colors.gray[600],
        fontSize: 14,
    },
    signupLink: {
        color: colors.primary[600],
        fontWeight: 'bold',
        fontSize: 14,
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: colors.success + '10',
        borderRadius: 8,
        alignSelf: 'center',
    },
    securityText: {
        color: colors.success,
        fontSize: 12,
        fontWeight: '600',
    },
});