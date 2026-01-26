import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/lib/stores/authStore';
import { colors } from '@/lib/constants/colors';

const { width } = Dimensions.get('window');

// Animated stat card component
const StatCard = ({ icon, value, label, color, delay }: any) => (
    <Animatable.View
        animation="fadeInUp"
        delay={delay}
        duration={600}
        className="flex-1"
    >
        <View className="bg-white rounded-3xl p-5 shadow-sm" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3,
        }}>
            <View
                className="w-14 h-14 rounded-2xl items-center justify-center mb-4"
                style={{ backgroundColor: `${color}15` }}
            >
                <Ionicons name={icon} size={26} color={color} />
            </View>
            <Text className="text-gray-900 text-3xl font-bold mb-1">{value}</Text>
            <Text className="text-gray-500 text-sm font-medium">{label}</Text>
        </View>
    </Animatable.View>
);

// Quick action button component
const QuickAction = ({ icon, title, subtitle, color, onPress, delay }: any) => (
    <Animatable.View
        animation="fadeInRight"
        delay={delay}
        duration={600}
    >
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: `${color}15` }}
            >
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <View className="flex-1">
                <Text className="text-gray-900 font-bold text-base mb-0.5">{title}</Text>
                <Text className="text-gray-500 text-xs">{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
        </TouchableOpacity>
    </Animatable.View>
);

export default function DoctorHome() {
    const router = useRouter();
    const { user, clearAuth } = useAuthStore();

    const handleLogout = async () => {
        await clearAuth();
        router.replace('/(auth)/login');
    };

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Modern Header with Gradient */}
                <LinearGradient
                    colors={[colors.secondary[500], colors.secondary[600]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="pb-8 pt-14 px-6 rounded-b-[40px]"
                    style={{
                        shadowColor: colors.secondary[600],
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.25,
                        shadowRadius: 20,
                        elevation: 10,
                    }}
                >
                    {/* Top Bar */}
                    <Animatable.View
                        animation="fadeInDown"
                        duration={600}
                        className="flex-row justify-between items-center mb-8"
                    >
                        <View>
                            <Text className="text-white/90 text-sm font-medium mb-1.5 tracking-wide">
                                Welcome back,
                            </Text>
                            <Text className="text-white text-2xl font-bold tracking-tight">
                                Dr. {user?.email?.split('@')[0] || 'Doctor'}
                            </Text>
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                className="w-11 h-11 bg-white/20 rounded-2xl items-center justify-center"
                                style={{
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.3)',
                                }}
                            >
                                <Ionicons name="notifications-outline" size={22} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="w-11 h-11 bg-white/20 rounded-2xl items-center justify-center"
                                onPress={handleLogout}
                                style={{
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.3)',
                                }}
                            >
                                <Ionicons name="log-out-outline" size={22} color="white" />
                            </TouchableOpacity>
                        </View>
                    </Animatable.View>

                    {/* Today's Overview Card */}
                    <Animatable.View
                        animation="fadeInUp"
                        delay={200}
                        duration={600}
                    >
                        <View
                            className="bg-white/95 rounded-3xl p-5"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 12,
                                elevation: 4,
                            }}
                        >
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center">
                                    <View
                                        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                                        style={{ backgroundColor: colors.secondary[50] }}
                                    >
                                        <Ionicons name="calendar-outline" size={20} color={colors.secondary[600]} />
                                    </View>
                                    <View>
                                        <Text className="text-gray-900 text-lg font-bold">Todays Schedule</Text>
                                        <Text className="text-gray-500 text-xs">
                                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-xl">
                                    <Text className="text-gray-700 text-xs font-bold">View All</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row items-center">
                                <View className="flex-1 pr-2">
                                    <Text className="text-gray-500 text-xs mb-1">Appointments</Text>
                                    <Text className="text-gray-900 text-2xl font-bold">0</Text>
                                </View>
                                <View className="w-px h-12 bg-gray-200" />
                                <View className="flex-1 pl-2">
                                    <Text className="text-gray-500 text-xs mb-1">Next in</Text>
                                    <Text className="text-gray-900 text-2xl font-bold">--</Text>
                                </View>
                            </View>
                        </View>
                    </Animatable.View>
                </LinearGradient>

                {/* Stats Section */}
                <View className="px-6 mt-6">
                    <Animatable.View
                        animation="fadeIn"
                        delay={300}
                        duration={600}
                    >
                        <Text className="text-gray-900 text-lg font-bold mb-4">Overview</Text>
                    </Animatable.View>

                    <View className="flex-row gap-3 mb-6">
                        <StatCard
                            icon="people"
                            value="0"
                            label="Total Patients"
                            color={colors.secondary[600]}
                            delay={350}
                        />
                        <StatCard
                            icon="checkmark-circle"
                            value="0"
                            label="Completed"
                            color="#10B981"
                            delay={400}
                        />
                    </View>

                    <View className="flex-row gap-3 mb-6">
                        <StatCard
                            icon="time"
                            value="0"
                            label="Pending"
                            color="#F59E0B"
                            delay={450}
                        />
                        <StatCard
                            icon="star"
                            value="0.0"
                            label="Rating"
                            color="#8B5CF6"
                            delay={500}
                        />
                    </View>
                </View>


                {/* Account Info Card */}
                <Animatable.View
                    animation="fadeIn"
                    delay={800}
                    duration={600}
                    className="mx-6 mt-4"
                >
                    <View className="bg-white rounded-3xl p-5 border border-gray-100">
                        <View className="flex-row items-center mb-4">
                            <View
                                className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                                style={{ backgroundColor: colors.secondary[50] }}
                            >
                                <Ionicons name="shield-checkmark" size={24} color={colors.secondary[600]} />
                            </View>
                            <Text className="text-gray-900 font-bold text-lg">Account Details</Text>
                        </View>

                        <View className="space-y-2">
                            <View className="flex-row items-center py-2">
                                <Ionicons name="mail-outline" size={18} color={colors.gray[500]} />
                                <Text className="text-gray-600 text-sm ml-3">{user?.email}</Text>
                            </View>
                            <View className="flex-row items-center py-2">
                                <Ionicons name="person-outline" size={18} color={colors.gray[500]} />
                                <Text className="text-gray-600 text-sm ml-3 capitalize">{user?.role}</Text>
                            </View>
                            <View className="flex-row items-center py-2">
                                <Ionicons name="key-outline" size={18} color={colors.gray[500]} />
                                <Text className="text-gray-600 text-sm ml-3 font-mono">{user?.id}</Text>
                            </View>
                        </View>
                    </View>
                </Animatable.View>
            </ScrollView>
        </View>
    );
}