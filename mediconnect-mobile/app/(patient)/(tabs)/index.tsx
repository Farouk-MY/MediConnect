import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/lib/stores/authStore';
import { colors } from '@/lib/constants/colors';

export default function PatientHome() {
    const router = useRouter();
    const { user, clearAuth } = useAuthStore();

    const handleLogout = async () => {
        await clearAuth();
        router.replace('/(auth)/login');
    };

    const firstName = user?.email?.split('@')[0] || 'Patient';

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Header with Gradient */}
                <LinearGradient
                    colors={[colors.primary[600], colors.primary[500]]}
                    className="pt-14 pb-8 px-5 rounded-b-[32px]"
                >
                    <Animatable.View animation="fadeInDown" duration={800}>
                        {/* Top bar with greeting and logout */}
                        <View className="flex-row justify-between items-center mb-6">
                            <View className="flex-1">
                                <Text className="text-white/90 text-base mb-1">Welcome back 👋</Text>
                                <Text className="text-white text-2xl font-bold capitalize">{firstName}</Text>
                            </View>

                            {/* Logout Button */}
                            <TouchableOpacity
                                onPress={handleLogout}
                                className="bg-white/20 px-4 py-2.5 rounded-xl flex-row items-center gap-2"
                            >
                                <Ionicons name="log-out-outline" size={18} color="white" />
                                <Text className="text-white text-sm font-semibold">Logout</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Search Bar */}
                        <TouchableOpacity className="bg-white rounded-2xl px-4 py-4 flex-row items-center gap-3">
                            <Ionicons name="search" size={20} color={colors.gray[400]} />
                            <Text className="flex-1 text-gray-400 text-sm">Search doctors, specialties...</Text>
                            <View className="bg-primary-500 p-2 rounded-lg">
                                <Ionicons name="options" size={16} color="white" />
                            </View>
                        </TouchableOpacity>
                    </Animatable.View>
                </LinearGradient>

                {/* Main Content */}
                <View className="px-5 pt-6">
                    {/* Video Consultation Card */}
                    <Animatable.View animation="fadeInUp" delay={200} duration={800}>
                        <TouchableOpacity
                            className="rounded-3xl overflow-hidden mb-6"
                            style={{
                                shadowColor: '#8B5CF6',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.3,
                                shadowRadius: 16,
                                elevation: 8,
                            }}
                        >
                            <LinearGradient
                                colors={['#8B5CF6', '#7C3AED']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="p-6 flex-row items-center justify-between"
                            >
                                <View className="flex-row items-center gap-4 flex-1">
                                    <View className="bg-white rounded-2xl p-4">
                                        <Ionicons name="videocam" size={32} color="#8B5CF6" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white text-lg font-bold mb-1">Video Consultation</Text>
                                        <Text className="text-white/90 text-sm">Connect with doctors online</Text>
                                    </View>
                                </View>
                                <Ionicons name="arrow-forward-circle" size={32} color="white" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animatable.View>

                    {/* Upcoming Appointment */}
                    <Animatable.View animation="fadeInUp" delay={300} duration={800} className="mb-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-gray-800 text-xl font-bold">Next Appointment</Text>
                            <TouchableOpacity>
                                <Text className="text-primary-600 text-sm font-semibold">See All</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="bg-white rounded-3xl p-5">
                            <View className="flex-row justify-between items-start mb-4">
                                <View className="flex-row items-center gap-3 flex-1">
                                    <View
                                        className="w-14 h-14 rounded-2xl items-center justify-center"
                                        style={{ backgroundColor: colors.primary[100] }}
                                    >
                                        <Ionicons name="person" size={28} color={colors.primary[600]} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-900 text-base font-bold mb-1">Dr. Sarah Johnson</Text>
                                        <Text className="text-gray-500 text-sm">Cardiologist</Text>
                                    </View>
                                </View>
                                <View className="bg-green-100 px-3 py-1.5 rounded-xl flex-row items-center gap-1.5">
                                    <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    <Text className="text-green-700 text-xs font-semibold">Confirmed</Text>
                                </View>
                            </View>

                            <View className="border-t border-gray-100 pt-4 mb-4">
                                <View className="flex-row justify-between">
                                    <View className="flex-row items-center gap-2">
                                        <Ionicons name="calendar-outline" size={16} color={colors.gray[600]} />
                                        <Text className="text-gray-700 text-sm font-medium">Today, Jan 22</Text>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                        <Ionicons name="time-outline" size={16} color={colors.gray[600]} />
                                        <Text className="text-gray-700 text-sm font-medium">2:00 PM</Text>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                        <Ionicons name="videocam-outline" size={16} color={colors.gray[600]} />
                                        <Text className="text-gray-700 text-sm font-medium">Online</Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity className="rounded-xl overflow-hidden">
                                <LinearGradient
                                    colors={[colors.primary[600], colors.primary[700]]}
                                    className="py-3.5 flex-row items-center justify-center gap-2"
                                >
                                    <Ionicons name="videocam" size={20} color="white" />
                                    <Text className="text-white text-base font-semibold">Join Video Call</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </Animatable.View>

                    {/* Specialties */}
                    <Animatable.View animation="fadeInUp" delay={400} duration={800} className="mb-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-gray-800 text-xl font-bold">Find Doctors</Text>
                            <TouchableOpacity>
                                <Text className="text-primary-600 text-sm font-semibold">View All</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row flex-wrap gap-3">
                            {/* Cardiology */}
                            <TouchableOpacity className="bg-white rounded-2xl p-4 items-center" style={{ width: '48%' }}>
                                <View className="w-16 h-16 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: '#FEE2E2' }}>
                                    <Ionicons name="heart" size={32} color="#EF4444" />
                                </View>
                                <Text className="text-gray-800 text-sm font-semibold mb-1">Cardiology</Text>
                                <Text className="text-gray-500 text-xs">12 available</Text>
                            </TouchableOpacity>

                            {/* Pediatrics */}
                            <TouchableOpacity className="bg-white rounded-2xl p-4 items-center" style={{ width: '48%' }}>
                                <View className="w-16 h-16 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: '#FEF3C7' }}>
                                    <Ionicons name="body" size={32} color="#F59E0B" />
                                </View>
                                <Text className="text-gray-800 text-sm font-semibold mb-1">Pediatrics</Text>
                                <Text className="text-gray-500 text-xs">8 available</Text>
                            </TouchableOpacity>

                            {/* Neurology */}
                            <TouchableOpacity className="bg-white rounded-2xl p-4 items-center" style={{ width: '48%' }}>
                                <View className="w-16 h-16 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: '#EDE9FE' }}>
                                    <Ionicons name="fitness" size={32} color="#8B5CF6" />
                                </View>
                                <Text className="text-gray-800 text-sm font-semibold mb-1">Neurology</Text>
                                <Text className="text-gray-500 text-xs">5 available</Text>
                            </TouchableOpacity>

                            {/* Dentistry */}
                            <TouchableOpacity className="bg-white rounded-2xl p-4 items-center" style={{ width: '48%' }}>
                                <View className="w-16 h-16 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: '#D1FAE5' }}>
                                    <Ionicons name="happy" size={32} color="#10B981" />
                                </View>
                                <Text className="text-gray-800 text-sm font-semibold mb-1">Dentistry</Text>
                                <Text className="text-gray-500 text-xs">15 available</Text>
                            </TouchableOpacity>
                        </View>
                    </Animatable.View>

                    {/* Quick Actions */}
                    <Animatable.View animation="fadeInUp" delay={500} duration={800} className="mb-6">
                        <Text className="text-gray-800 text-xl font-bold mb-4">Quick Actions</Text>
                        <View className="flex-row flex-wrap gap-3">
                            <TouchableOpacity className="items-center" style={{ width: '22%' }}>
                                <LinearGradient
                                    colors={[colors.primary[500], colors.primary[600]]}
                                    className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                                >
                                    <Ionicons name="calendar" size={28} color="white" />
                                </LinearGradient>
                                <Text className="text-gray-700 text-xs font-semibold text-center">Book</Text>
                            </TouchableOpacity>

                            <TouchableOpacity className="items-center" style={{ width: '22%' }}>
                                <LinearGradient
                                    colors={['#10B981', '#059669']}
                                    className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                                >
                                    <Ionicons name="location" size={28} color="white" />
                                </LinearGradient>
                                <Text className="text-gray-700 text-xs font-semibold text-center">Nearby</Text>
                            </TouchableOpacity>

                            <TouchableOpacity className="items-center" style={{ width: '22%' }}>
                                <LinearGradient
                                    colors={['#F59E0B', '#D97706']}
                                    className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                                >
                                    <Ionicons name="document-text" size={28} color="white" />
                                </LinearGradient>
                                <Text className="text-gray-700 text-xs font-semibold text-center">Records</Text>
                            </TouchableOpacity>

                            <TouchableOpacity className="items-center" style={{ width: '22%' }}>
                                <LinearGradient
                                    colors={['#EF4444', '#DC2626']}
                                    className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                                >
                                    <Ionicons name="pulse" size={28} color="white" />
                                </LinearGradient>
                                <Text className="text-gray-700 text-xs font-semibold text-center">Emergency</Text>
                            </TouchableOpacity>
                        </View>
                    </Animatable.View>
                </View>
            </ScrollView>
        </View>
    );
}
