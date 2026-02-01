import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    ScrollView, 
    RefreshControl,
    ActivityIndicator,
    Image,
    Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/lib/stores/authStore';
import { colors } from '@/lib/constants/colors';
import { appointmentsApi, Appointment } from '@/lib/api/appointments';
import { doctorsApi, DoctorPublicProfile } from '@/lib/api/doctors';

const { width } = Dimensions.get('window');

// Specialty data with icons and colors
const SPECIALTIES = [
    { name: 'Cardiology', icon: 'heart', gradient: ['#FF6B6B', '#EE5A5A'] as const },
    { name: 'Dermatology', icon: 'sunny', gradient: ['#FFB347', '#FFA726'] as const },
    { name: 'Pediatrics', icon: 'body', gradient: ['#4ECDC4', '#26A69A'] as const },
    { name: 'Neurology', icon: 'pulse', gradient: ['#A78BFA', '#8B5CF6'] as const },
    { name: 'Dentistry', icon: 'happy', gradient: ['#67E8F9', '#22D3EE'] as const },
    { name: 'General', icon: 'medkit', gradient: ['#86EFAC', '#4ADE80'] as const },
];

export default function PatientHome() {
    const router = useRouter();
    const { user, clearAuth } = useAuthStore();
    
    // State
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [topDoctors, setTopDoctors] = useState<DoctorPublicProfile[]>([]);
    
    // Get greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const firstName = user?.email?.split('@')[0] || 'Patient';

    // Fetch data
    const fetchData = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            // Fetch upcoming appointments
            try {
                const appointmentsResult = await appointmentsApi.getMyAppointments({
                    upcoming_only: true,
                    page_size: 3
                });
                setUpcomingAppointments(appointmentsResult.appointments);
            } catch (e) {
                console.log('No appointments yet');
            }

            // Fetch top rated doctors
            try {
                const doctorsResult = await doctorsApi.searchDoctors({
                    sort_by: 'rating',
                    limit: 6
                });
                setTopDoctors(doctorsResult);
            } catch (e) {
                console.log('No doctors yet');
            }

        } catch (error) {
            console.error('Error fetching home data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLogout = async () => {
        await clearAuth();
        router.replace('/(auth)/login');
    };

    const formatAppointmentDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Render star rating
    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        for (let i = 0; i < 5; i++) {
            stars.push(
                <Ionicons 
                    key={i} 
                    name={i < fullStars ? "star" : "star-outline"} 
                    size={10} 
                    color="#FBBF24" 
                />
            );
        }
        return stars;
    };

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchData(true)}
                        tintColor={colors.primary[600]}
                    />
                }
            >
                {/* Header */}
                <LinearGradient
                    colors={[colors.primary[600], colors.primary[500]]}
                    className="pt-14 pb-6 px-5"
                >
                    <Animatable.View animation="fadeIn" duration={500}>
                        {/* Top Bar */}
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center gap-3">
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                                    className="w-12 h-12 rounded-full items-center justify-center"
                                >
                                    <Ionicons name="person" size={22} color="white" />
                                </LinearGradient>
                                <View>
                                    <Text className="text-white/70 text-sm">{getGreeting()}</Text>
                                    <Text className="text-white text-lg font-bold capitalize">{firstName}</Text>
                                </View>
                            </View>

                            <View className="flex-row gap-2">
                                <TouchableOpacity 
                                    className="bg-white/20 p-2.5 rounded-xl relative"
                                    onPress={() => {}}
                                >
                                    <Ionicons name="notifications-outline" size={20} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    className="bg-white/20 p-2.5 rounded-xl"
                                    onPress={handleLogout}
                                >
                                    <Ionicons name="log-out-outline" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animatable.View>
                </LinearGradient>

                {/* Main Content */}
                <View className="px-5 -mt-1">
                    {/* Search Card */}
                    <Animatable.View animation="fadeInUp" delay={100} duration={500}>
                        <TouchableOpacity 
                            onPress={() => router.push('/(patient)/doctors')}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={['#667EEA', '#764BA2']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="rounded-3xl p-5 mt-4"
                                style={{
                                    shadowColor: '#667EEA',
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.4,
                                    shadowRadius: 16,
                                    elevation: 10,
                                }}
                            >
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-1">
                                        <Text className="text-white/80 text-sm mb-1">Looking for a specialist?</Text>
                                        <Text className="text-white text-xl font-bold mb-3">Find Your Doctor</Text>
                                        <View className="bg-white/20 rounded-xl px-4 py-3 flex-row items-center gap-2">
                                            <Ionicons name="search" size={18} color="white" />
                                            <Text className="text-white/80 text-sm">Search doctors...</Text>
                                        </View>
                                    </View>
                                    <View className="bg-white/20 p-4 rounded-2xl ml-4">
                                        <Ionicons name="medical" size={40} color="white" />
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animatable.View>

                    {/* Quick Actions */}
                    <Animatable.View animation="fadeInUp" delay={150} duration={500} className="mt-6">
                        <View className="flex-row justify-between">
                            {[
                                { icon: 'calendar', label: 'Book', color: colors.primary[600], route: '/(patient)/doctors' },
                                { icon: 'map', label: 'Nearby', color: '#10B981', route: '/(patient)/doctors' },
                                { icon: 'time', label: 'History', color: '#8B5CF6', route: '/(patient)/(tabs)/appointments' },
                                { icon: 'call', label: 'Emergency', color: '#EF4444', route: null },
                            ].map((action, index) => (
                                <TouchableOpacity 
                                    key={action.label}
                                    className="items-center"
                                    onPress={() => action.route && router.push(action.route as any)}
                                >
                                    <View 
                                        className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
                                        style={{ backgroundColor: `${action.color}15` }}
                                    >
                                        <Ionicons name={action.icon as any} size={24} color={action.color} />
                                    </View>
                                    <Text className="text-gray-600 text-xs font-medium">{action.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animatable.View>

                    {/* Upcoming Appointments Section */}
                    <Animatable.View animation="fadeInUp" delay={200} duration={500} className="mt-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-gray-900 text-lg font-bold">Upcoming Appointments</Text>
                            <TouchableOpacity 
                                className="flex-row items-center gap-1"
                                onPress={() => router.push('/(patient)/(tabs)/appointments')}
                            >
                                <Text className="text-primary-600 text-sm font-semibold">See All</Text>
                                <Ionicons name="chevron-forward" size={16} color={colors.primary[600]} />
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <View className="bg-gray-50 rounded-2xl p-8 items-center">
                                <ActivityIndicator size="small" color={colors.primary[600]} />
                            </View>
                        ) : upcomingAppointments.length === 0 ? (
                            <TouchableOpacity 
                                onPress={() => router.push('/(patient)/doctors')}
                                className="bg-gradient-to-r rounded-2xl overflow-hidden"
                                activeOpacity={0.9}
                            >
                                <LinearGradient 
                                    colors={['#F8FAFC', '#F1F5F9']}
                                    className="p-5 flex-row items-center"
                                >
                                    <View className="bg-primary-100 w-14 h-14 rounded-2xl items-center justify-center mr-4">
                                        <Ionicons name="calendar-outline" size={28} color={colors.primary[600]} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-800 font-bold mb-1">No Appointments Yet</Text>
                                        <Text className="text-gray-500 text-sm">Book your first consultation</Text>
                                    </View>
                                    <View className="bg-primary-600 p-2.5 rounded-xl">
                                        <Ionicons name="add" size={20} color="white" />
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        ) : (
                            <View className="gap-3">
                                {upcomingAppointments.slice(0, 2).map((apt, index) => (
                                    <TouchableOpacity
                                        key={apt.id}
                                        onPress={() => router.push('/(patient)/(tabs)/appointments')}
                                        activeOpacity={0.9}
                                        className="bg-white rounded-2xl p-4 border border-gray-100"
                                        style={{
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.05,
                                            shadowRadius: 8,
                                            elevation: 2,
                                        }}
                                    >
                                        <View className="flex-row items-center">
                                            {/* Date Box */}
                                            <View className="bg-primary-50 rounded-2xl p-3 items-center mr-4" style={{ minWidth: 60 }}>
                                                <Text className="text-primary-600 text-xs font-medium">
                                                    {new Date(apt.appointment_date).toLocaleDateString('en-US', { weekday: 'short' })}
                                                </Text>
                                                <Text className="text-primary-700 text-xl font-bold">
                                                    {new Date(apt.appointment_date).getDate()}
                                                </Text>
                                            </View>

                                            {/* Doctor Info */}
                                            <View className="flex-1">
                                                <View className="flex-row items-center justify-between mb-1">
                                                    <Text className="text-gray-900 font-bold" numberOfLines={1}>
                                                        Dr. {apt.doctor?.first_name} {apt.doctor?.last_name}
                                                    </Text>
                                                    <View className={`px-2 py-0.5 rounded-full ${
                                                        apt.status === 'confirmed' ? 'bg-green-100' : 'bg-amber-100'
                                                    }`}>
                                                        <Text className={`text-xs font-semibold ${
                                                            apt.status === 'confirmed' ? 'text-green-700' : 'text-amber-700'
                                                        }`}>
                                                            {apt.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Text className="text-gray-500 text-sm mb-2">{apt.doctor?.specialty}</Text>
                                                <View className="flex-row items-center gap-4">
                                                    <View className="flex-row items-center gap-1">
                                                        <Ionicons name="time-outline" size={14} color={colors.gray[400]} />
                                                        <Text className="text-gray-600 text-sm">{formatTime(apt.appointment_date)}</Text>
                                                    </View>
                                                    <View className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${
                                                        apt.consultation_type === 'online' ? 'bg-purple-50' : 'bg-blue-50'
                                                    }`}>
                                                        <Ionicons 
                                                            name={apt.consultation_type === 'online' ? 'videocam' : 'location'} 
                                                            size={12} 
                                                            color={apt.consultation_type === 'online' ? '#8B5CF6' : colors.primary[600]} 
                                                        />
                                                        <Text className={`text-xs font-medium ${
                                                            apt.consultation_type === 'online' ? 'text-purple-600' : 'text-primary-600'
                                                        }`}>
                                                            {apt.consultation_type === 'online' ? 'Video' : 'In-Person'}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </Animatable.View>

                    {/* Specialties Section */}
                    <Animatable.View animation="fadeInUp" delay={250} duration={500} className="mt-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-gray-900 text-lg font-bold">Specialties</Text>
                            <TouchableOpacity 
                                className="flex-row items-center gap-1"
                                onPress={() => router.push('/(patient)/doctors')}
                            >
                                <Text className="text-primary-600 text-sm font-semibold">View All</Text>
                                <Ionicons name="chevron-forward" size={16} color={colors.primary[600]} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            className="-mx-5 px-5"
                            contentContainerStyle={{ paddingRight: 20 }}
                        >
                            <View className="flex-row gap-3">
                                {SPECIALTIES.map((specialty, index) => (
                                    <TouchableOpacity
                                        key={specialty.name}
                                        onPress={() => router.push(`/(patient)/doctors?specialty=${specialty.name}`)}
                                        activeOpacity={0.9}
                                    >
                                        <LinearGradient
                                            colors={specialty.gradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            className="w-24 h-28 rounded-2xl p-3 items-center justify-center"
                                            style={{
                                                shadowColor: specialty.gradient[0],
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 8,
                                                elevation: 4,
                                            }}
                                        >
                                            <View className="bg-white/25 w-12 h-12 rounded-xl items-center justify-center mb-2">
                                                <Ionicons name={specialty.icon as any} size={24} color="white" />
                                            </View>
                                            <Text className="text-white text-xs font-semibold text-center">
                                                {specialty.name}
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </Animatable.View>

                    {/* Top Doctors Section */}
                    <Animatable.View animation="fadeInUp" delay={300} duration={500} className="mt-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-gray-900 text-lg font-bold">Top Doctors</Text>
                            <TouchableOpacity 
                                className="flex-row items-center gap-1"
                                onPress={() => router.push('/(patient)/doctors')}
                            >
                                <Text className="text-primary-600 text-sm font-semibold">See All</Text>
                                <Ionicons name="chevron-forward" size={16} color={colors.primary[600]} />
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <ActivityIndicator size="small" color={colors.primary[600]} />
                        ) : topDoctors.length === 0 ? (
                            <View className="bg-gray-50 rounded-2xl p-6 items-center">
                                <Ionicons name="people-outline" size={40} color={colors.gray[300]} />
                                <Text className="text-gray-500 mt-2">No doctors available</Text>
                            </View>
                        ) : (
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false}
                                className="-mx-5 px-5"
                                contentContainerStyle={{ paddingRight: 20 }}
                            >
                                <View className="flex-row gap-4">
                                    {topDoctors.slice(0, 6).map((doctor, index) => (
                                        <TouchableOpacity
                                            key={doctor.id}
                                            onPress={() => router.push(`/(patient)/doctors/${doctor.id}`)}
                                            activeOpacity={0.9}
                                            className="bg-white rounded-2xl overflow-hidden"
                                            style={{
                                                width: 150,
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.08,
                                                shadowRadius: 12,
                                                elevation: 4,
                                            }}
                                        >
                                            {/* Doctor Image */}
                                            <View className="bg-gradient-to-b h-28 items-center justify-center">
                                                <LinearGradient
                                                    colors={[colors.primary[100], colors.primary[50]]}
                                                    className="w-full h-full items-center justify-center"
                                                >
                                                    {doctor.avatar_url ? (
                                                        <Image 
                                                            source={{ uri: doctor.avatar_url }} 
                                                            className="w-full h-full"
                                                            resizeMode="cover"
                                                        />
                                                    ) : (
                                                        <View className="w-16 h-16 rounded-full bg-white items-center justify-center">
                                                            <Ionicons name="person" size={32} color={colors.primary[600]} />
                                                        </View>
                                                    )}
                                                </LinearGradient>
                                            </View>

                                            {/* Doctor Info */}
                                            <View className="p-3">
                                                <Text className="text-gray-900 font-bold text-sm" numberOfLines={1}>
                                                    Dr. {doctor.first_name}
                                                </Text>
                                                <Text className="text-gray-500 text-xs mb-2" numberOfLines={1}>
                                                    {doctor.specialty}
                                                </Text>
                                                <View className="flex-row items-center justify-between">
                                                    <View className="flex-row items-center gap-0.5">
                                                        {renderStars(doctor.average_rating)}
                                                    </View>
                                                    <Text className="text-gray-600 text-xs font-medium">
                                                        {doctor.average_rating.toFixed(1)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        )}
                    </Animatable.View>

                    {/* Promo Banner */}
                    <Animatable.View animation="fadeInUp" delay={350} duration={500} className="mt-8">
                        <TouchableOpacity activeOpacity={0.9}>
                            <LinearGradient
                                colors={['#0EA5E9', '#0284C7']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="rounded-2xl p-5 flex-row items-center overflow-hidden"
                                style={{
                                    shadowColor: '#0EA5E9',
                                    shadowOffset: { width: 0, height: 6 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 12,
                                    elevation: 6,
                                }}
                            >
                                {/* Decorative circles */}
                                <View 
                                    className="absolute -right-10 -top-10 w-32 h-32 rounded-full"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                                />
                                <View 
                                    className="absolute -right-5 -bottom-10 w-24 h-24 rounded-full"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                                />

                                <View className="flex-1">
                                    <View className="bg-white/20 px-2.5 py-1 rounded-full self-start mb-2">
                                        <Text className="text-white text-xs font-semibold">NEW</Text>
                                    </View>
                                    <Text className="text-white text-lg font-bold mb-1">
                                        Video Consultations
                                    </Text>
                                    <Text className="text-white/80 text-sm">
                                        Connect with doctors from home
                                    </Text>
                                </View>
                                <View className="bg-white/20 p-3 rounded-2xl">
                                    <Ionicons name="videocam" size={32} color="white" />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animatable.View>
                </View>
            </ScrollView>
        </View>
    );
}
