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

type UserRole = 'patient' | 'doctor';

// Custom animations
const fadeInUp = {
    from: { opacity: 0, translateY: 30 },
    to: { opacity: 1, translateY: 0 },
};

const scaleIn = {
    from: { opacity: 0, scale: 0.8 },
    to: { opacity: 1, scale: 1 },
};

export default function RegisterScreen() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const { toast, showToast, hideToast } = useToast();

    const [role, setRole] = useState<UserRole>('patient');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        confirmPassword?: string;
        firstName?: string;
        lastName?: string;
        specialty?: string;
        licenseNumber?: string;
    }>({});

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

        // First name validation
        if (!firstName.trim()) {
            newErrors.firstName = 'First name is required';
            showToast('First name is required', 'error');
            return false;
        }

        // Last name validation
        if (!lastName.trim()) {
            newErrors.lastName = 'Last name is required';
            showToast('Last name is required', 'error');
            return false;
        }

        // Email validation
        if (!email.trim()) {
            newErrors.email = 'Email is required';
            showToast('Email is required', 'error');
            return false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email';
            showToast('Please enter a valid email address', 'error');
            return false;
        }

        // Password validation
        if (!password) {
            newErrors.password = 'Password is required';
            showToast('Password is required', 'error');
            return false;
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
            showToast('Password must be at least 8 characters long', 'error');
            return false;
        }

        // Confirm password validation
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
            showToast('Please confirm your password', 'error');
            return false;
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            showToast('Passwords do not match', 'error');
            return false;
        }

        // Doctor-specific validations
        if (role === 'doctor') {
            if (!specialty.trim()) {
                newErrors.specialty = 'Specialty is required for doctors';
                showToast('Specialty is required for doctors', 'error');
                return false;
            }
            if (!licenseNumber.trim()) {
                newErrors.licenseNumber = 'License number is required for doctors';
                showToast('License number is required for doctors', 'error');
                return false;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        console.log('🔵 Register button clicked');

        // Validate form
        if (!validateForm()) {
            console.log('❌ Validation failed:', errors);
            return;
        }

        console.log('✅ Validation passed');
        setLoading(true);

        try {
            // Prepare registration data
            const registerData = {
                email: email.trim().toLowerCase(),
                password: password,
                role: role,
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                ...(role === 'doctor' && {
                    specialty: specialty.trim(),
                    license_number: licenseNumber.trim(),
                }),
            };

            console.log('📤 Sending registration data:', {
                ...registerData,
                password: '***hidden***',
            });

            // Call register API
            const response = await authApi.register(registerData);
            console.log('✅ Registration successful, got tokens');

            // Get current user data
            console.log('📤 Fetching user data...');
            const userResponse = await authApi.getCurrentUser(response.access_token);
            console.log('✅ User data received:', userResponse);

            // Store auth data
            await setAuth(userResponse, response.access_token, response.refresh_token);
            console.log('✅ Auth stored successfully');

            // Navigate based on role
            if (userResponse.role === 'patient') {
                console.log('🏥 Navigating to patient dashboard');
                router.replace('/(patient)/(tabs)');
            } else {
                console.log('👨‍⚕️ Navigating to doctor dashboard');
                router.replace('/(doctor)/(tabs)');
            }
        } catch (error: any) {
            console.error('❌ Registration error:', error);
            console.error('Error response:', error.response?.data);

            let errorMessage = 'Something went wrong. Please try again.';

            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Medical-themed header */}
                    <Animated.View
                        style={{
                            opacity: headerAnim,
                            transform: [
                                {
                                    translateY: headerAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-50, 0],
                                    }),
                                },
                            ],
                        }}
                    >
                        <LinearGradient
                            colors={[colors.primary[600], colors.primary[500], colors.secondary[500]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="pb-12 pt-16 px-6 rounded-b-[40px]"
                        >
                            {/* Medical grid pattern */}
                            <View className="absolute inset-0 opacity-10">
                                {[...Array(6)].map((_, i) => (
                                    <View
                                        key={i}
                                        className="absolute left-0 right-0 h-[1px] bg-white"
                                        style={{ top: (i + 1) * (height * 0.05) }}
                                    />
                                ))}
                            </View>

                            {/* Back button */}
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="mb-6 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                            >
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </TouchableOpacity>

                            {/* Logo and branding */}
                            <Animatable.View
                                animation={scaleIn}
                                delay={400}
                                duration={1000}
                                className="items-center"
                            >
                                <View className="relative mb-6">
                                    <LinearGradient
                                        colors={[
                                            'rgba(255,255,255,0.95)',
                                            'rgba(255,255,255,0.85)',
                                        ]}
                                        className="w-24 h-24 rounded-full items-center justify-center"
                                        style={{
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 8 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 15,
                                            elevation: 10,
                                        }}
                                    >
                                        {/* Medical cross icon */}
                                        <View className="w-12 h-12 items-center justify-center">
                                            <View
                                                className="absolute rounded-lg"
                                                style={{
                                                    width: 50,
                                                    height: 14,
                                                    backgroundColor: colors.primary[600],
                                                }}
                                            />
                                            <View
                                                className="absolute rounded-lg"
                                                style={{
                                                    width: 14,
                                                    height: 50,
                                                    backgroundColor: colors.primary[600],
                                                }}
                                            />
                                        </View>
                                    </LinearGradient>

                                    {/* Pulsing ring around logo */}
                                    <Animatable.View
                                        animation="pulse"
                                        iterationCount="infinite"
                                        duration={2000}
                                        className="absolute w-[112px] h-[112px] rounded-full border-2 border-white/30 -top-2 -left-2"
                                    />
                                </View>

                                <Text className="text-white text-3xl font-bold tracking-wider mb-3">
                                    MediConnect
                                </Text>
                                <View
                                    className="w-16 h-1 rounded-full mb-4"
                                    style={{ backgroundColor: colors.secondary[400] }}
                                />
                                <Text className="text-white text-2xl font-semibold mb-2">
                                    Create Account
                                </Text>
                                <Text className="text-white/90 text-sm text-center px-5">
                                    Join our healthcare community today
                                </Text>
                            </Animatable.View>
                        </LinearGradient>
                    </Animated.View>

                    {/* Registration form card */}
                    <Animated.View
                        style={{
                            opacity: formAnim,
                            transform: [
                                {
                                    translateY: formAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [30, 0],
                                    }),
                                },
                            ],
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.15,
                            shadowRadius: 20,
                            elevation: 10,
                        }}
                        className="-mt-8 mx-5 rounded-3xl mb-10"
                    >
                        <LinearGradient
                            colors={['#FFFFFF', '#F8FAFC']}
                            className="rounded-3xl p-6"
                        >
                            {/* Form header */}
                            <View className="flex-row items-center mb-6 gap-3">
                                <View
                                    className="flex-1 h-[2px]"
                                    style={{ backgroundColor: colors.primary[200] }}
                                />
                                <Text
                                    className="text-xl font-bold tracking-wide"
                                    style={{ color: colors.primary[700] }}
                                >
                                    Sign Up
                                </Text>
                                <View
                                    className="flex-1 h-[2px]"
                                    style={{ backgroundColor: colors.primary[200] }}
                                />
                            </View>

                            {/* Role Selection */}
                            <Animatable.View
                                animation={fadeInUp}
                                delay={500}
                                duration={600}
                                className="mb-6"
                            >
                                <Text className="text-base font-semibold mb-3 text-gray-700">
                                    I am a:
                                </Text>
                                <View className="flex-row gap-3">
                                    {/* Patient Role */}
                                    <TouchableOpacity
                                        onPress={() => setRole('patient')}
                                        className="flex-1 p-4 rounded-xl"
                                        style={{
                                            borderWidth: 2,
                                            borderColor:
                                                role === 'patient'
                                                    ? colors.primary[500]
                                                    : colors.gray[200],
                                            backgroundColor:
                                                role === 'patient'
                                                    ? colors.primary[50]
                                                    : 'white',
                                        }}
                                    >
                                        <View className="items-center">
                                            <View
                                                className="w-16 h-16 rounded-full mb-2 items-center justify-center"
                                                style={{
                                                    backgroundColor:
                                                        role === 'patient'
                                                            ? colors.primary[100]
                                                            : colors.gray[100],
                                                }}
                                            >
                                                <Ionicons
                                                    name="person"
                                                    size={32}
                                                    color={
                                                        role === 'patient'
                                                            ? colors.primary[600]
                                                            : colors.gray[500]
                                                    }
                                                />
                                            </View>
                                            <Text
                                                className="font-semibold"
                                                style={{
                                                    color:
                                                        role === 'patient'
                                                            ? colors.primary[700]
                                                            : colors.gray[600],
                                                }}
                                            >
                                                Patient
                                            </Text>
                                        </View>
                                    </TouchableOpacity>

                                    {/* Doctor Role */}
                                    <TouchableOpacity
                                        onPress={() => setRole('doctor')}
                                        className="flex-1 p-4 rounded-xl"
                                        style={{
                                            borderWidth: 2,
                                            borderColor:
                                                role === 'doctor'
                                                    ? colors.primary[500]
                                                    : colors.gray[200],
                                            backgroundColor:
                                                role === 'doctor'
                                                    ? colors.primary[50]
                                                    : 'white',
                                        }}
                                    >
                                        <View className="items-center">
                                            <View
                                                className="w-16 h-16 rounded-full mb-2 items-center justify-center"
                                                style={{
                                                    backgroundColor:
                                                        role === 'doctor'
                                                            ? colors.primary[100]
                                                            : colors.gray[100],
                                                }}
                                            >
                                                <Ionicons
                                                    name="medical"
                                                    size={32}
                                                    color={
                                                        role === 'doctor'
                                                            ? colors.primary[600]
                                                            : colors.gray[500]
                                                    }
                                                />
                                            </View>
                                            <Text
                                                className="font-semibold"
                                                style={{
                                                    color:
                                                        role === 'doctor'
                                                            ? colors.primary[700]
                                                            : colors.gray[600],
                                                }}
                                            >
                                                Doctor
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </Animatable.View>

                            {/* Name inputs */}
                            <View className="flex-row gap-3 mb-4">
                                <Animatable.View
                                    animation={fadeInUp}
                                    delay={600}
                                    duration={600}
                                    className="flex-1"
                                >
                                    <Input
                                        label="First Name"
                                        placeholder="John"
                                        value={firstName}
                                        onChangeText={(text) => {
                                            setFirstName(text);
                                            setErrors((prev) => ({
                                                ...prev,
                                                firstName: undefined,
                                            }));
                                        }}
                                        icon="person-outline"
                                        error={errors.firstName}
                                    />
                                </Animatable.View>

                                <Animatable.View
                                    animation={fadeInUp}
                                    delay={650}
                                    duration={600}
                                    className="flex-1"
                                >
                                    <Input
                                        label="Last Name"
                                        placeholder="Doe"
                                        value={lastName}
                                        onChangeText={(text) => {
                                            setLastName(text);
                                            setErrors((prev) => ({
                                                ...prev,
                                                lastName: undefined,
                                            }));
                                        }}
                                        icon="person-outline"
                                        error={errors.lastName}
                                    />
                                </Animatable.View>
                            </View>

                            {/* Email input */}
                            <Animatable.View animation={fadeInUp} delay={700} duration={600}>
                                <Input
                                    label="Email Address"
                                    placeholder="your.email@example.com"
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

                            {/* Doctor-specific fields */}
                            {role === 'doctor' && (
                                <>
                                    <Animatable.View
                                        animation={fadeInUp}
                                        delay={750}
                                        duration={600}
                                    >
                                        <Input
                                            label="Specialty"
                                            placeholder="e.g., Cardiology, Pediatrics"
                                            value={specialty}
                                            onChangeText={(text) => {
                                                setSpecialty(text);
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    specialty: undefined,
                                                }));
                                            }}
                                            icon="medical-outline"
                                            error={errors.specialty}
                                        />
                                    </Animatable.View>

                                    <Animatable.View
                                        animation={fadeInUp}
                                        delay={800}
                                        duration={600}
                                    >
                                        <Input
                                            label="License Number"
                                            placeholder="MD123456"
                                            value={licenseNumber}
                                            onChangeText={(text) => {
                                                setLicenseNumber(text);
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    licenseNumber: undefined,
                                                }));
                                            }}
                                            icon="document-text-outline"
                                            error={errors.licenseNumber}
                                        />
                                    </Animatable.View>
                                </>
                            )}

                            {/* Password inputs */}
                            <Animatable.View
                                animation={fadeInUp}
                                delay={role === 'doctor' ? 850 : 750}
                                duration={600}
                            >
                                <Input
                                    label="Password"
                                    placeholder="Min 8 characters"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        setErrors((prev) => ({
                                            ...prev,
                                            password: undefined,
                                        }));
                                    }}
                                    isPassword
                                    icon="lock-closed-outline"
                                    error={errors.password}
                                />
                            </Animatable.View>

                            <Animatable.View
                                animation={fadeInUp}
                                delay={role === 'doctor' ? 900 : 800}
                                duration={600}
                            >
                                <Input
                                    label="Confirm Password"
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChangeText={(text) => {
                                        setConfirmPassword(text);
                                        setErrors((prev) => ({
                                            ...prev,
                                            confirmPassword: undefined,
                                        }));
                                    }}
                                    isPassword
                                    icon="lock-closed-outline"
                                    error={errors.confirmPassword}
                                />
                            </Animatable.View>

                            {/* Terms and conditions */}
                            <Animatable.View
                                animation={fadeInUp}
                                delay={role === 'doctor' ? 950 : 850}
                                duration={600}
                                className="mb-6"
                            >
                                <View className="flex-row items-start">
                                    <Ionicons
                                        name="shield-checkmark"
                                        size={16}
                                        color={colors.primary[500]}
                                        style={{ marginTop: 2, marginRight: 6 }}
                                    />
                                    <Text className="flex-1 text-xs text-gray-600 leading-5">
                                        By creating an account, you agree to our{' '}
                                        <Text style={{ color: colors.primary[600] }}>
                                            Terms of Service
                                        </Text>{' '}
                                        and{' '}
                                        <Text style={{ color: colors.primary[600] }}>
                                            Privacy Policy
                                        </Text>
                                    </Text>
                                </View>
                            </Animatable.View>

                            {/* Register button */}
                            <Animatable.View
                                animation={fadeInUp}
                                delay={role === 'doctor' ? 1000 : 900}
                                duration={600}
                            >
                                <TouchableOpacity
                                    onPress={handleRegister}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                    style={{
                                        shadowColor: colors.primary[600],
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 8,
                                        elevation: 5,
                                    }}
                                    className="rounded-xl overflow-hidden"
                                >
                                    <LinearGradient
                                        colors={[colors.primary[600], colors.primary[500]]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        className="flex-row items-center justify-center py-4 gap-2"
                                    >
                                        {loading ? (
                                            <Animatable.View
                                                animation="rotate"
                                                iterationCount="infinite"
                                                duration={1000}
                                            >
                                                <Ionicons
                                                    name="hourglass-outline"
                                                    size={22}
                                                    color="white"
                                                />
                                            </Animatable.View>
                                        ) : (
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={22}
                                                color="white"
                                            />
                                        )}
                                        <Text className="text-white text-lg font-bold tracking-wide">
                                            {loading ? 'Creating Account...' : 'Create Account'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animatable.View>

                            {/* Divider */}
                            <Animatable.View
                                animation="fadeIn"
                                delay={role === 'doctor' ? 1050 : 950}
                                duration={600}
                                className="flex-row items-center my-6 gap-3"
                            >
                                <View className="flex-1 h-[1px] bg-gray-200" />
                                <Text className="text-gray-400 text-xs font-semibold">
                                    ALREADY REGISTERED?
                                </Text>
                                <View className="flex-1 h-[1px] bg-gray-200" />
                            </Animatable.View>

                            {/* Sign in link */}
                            <Animatable.View
                                animation="fadeIn"
                                delay={role === 'doctor' ? 1100 : 1000}
                                duration={600}
                                className="flex-row justify-center items-center mb-4"
                            >
                                <Text className="text-gray-600 text-sm">
                                    Already have an account?{' '}
                                </Text>
                                <TouchableOpacity onPress={() => router.back()}>
                                    <Text
                                        className="text-sm font-bold"
                                        style={{ color: colors.primary[600] }}
                                    >
                                        Sign In
                                    </Text>
                                </TouchableOpacity>
                            </Animatable.View>

                            {/* Security badge */}
                            <Animatable.View
                                animation="fadeIn"
                                delay={role === 'doctor' ? 1150 : 1050}
                                duration={600}
                                className="flex-row items-center justify-center gap-2 py-2 px-4 rounded-lg self-center"
                                style={{ backgroundColor: colors.success + '10' }}
                            >
                                <Ionicons
                                    name="shield-checkmark"
                                    size={16}
                                    color={colors.success}
                                />
                                <Text
                                    className="text-xs font-semibold"
                                    style={{ color: colors.success }}
                                >
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