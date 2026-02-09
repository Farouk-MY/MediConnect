import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    ScrollView, 
    RefreshControl,
    Image,
    Dimensions,
    Platform,
    StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/lib/stores/authStore';
import { colors } from '@/lib/constants/colors';
import { appointmentsApi, Appointment } from '@/lib/api/appointments';
import { doctorsApi, DoctorPublicProfile } from '@/lib/api/doctors';
import { InlineLoader } from '@/components/ui/AnimatedLoader';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

// Specialty data with icons and colors
const SPECIALTIES = [
    { name: 'Cardiologie', icon: 'heart', gradient: ['#FF6B6B', '#EE5A5A'] as const },
    { name: 'Dermatologie', icon: 'sunny', gradient: ['#FFB347', '#FFA726'] as const },
    { name: 'Pédiatrie', icon: 'body', gradient: ['#4ECDC4', '#26A69A'] as const },
    { name: 'Neurologie', icon: 'pulse', gradient: ['#A78BFA', '#8B5CF6'] as const },
    { name: 'Dentisterie', icon: 'happy', gradient: ['#67E8F9', '#22D3EE'] as const },
    { name: 'Généraliste', icon: 'medkit', gradient: ['#86EFAC', '#4ADE80'] as const },
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
        if (hour < 12) return 'Bonjour';
        if (hour < 18) return 'Bon après-midi';
        return 'Bonsoir';
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

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" />
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
                {/* Premium Header with Glassmorphism */}
                <LinearGradient
                    colors={[colors.primary[600], colors.primary[700], colors.primary[800]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        paddingTop: Platform.OS === 'ios' ? 60 : 50,
                        paddingBottom: 100,
                        borderBottomLeftRadius: 32,
                        borderBottomRightRadius: 32,
                    }}
                >
                    {/* Decorative Elements */}
                    <View className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
                        style={{ backgroundColor: 'white', transform: [{ translateX: 80 }, { translateY: -80 }] }}
                    />
                    <View className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
                        style={{ backgroundColor: 'white', transform: [{ translateX: -60 }, { translateY: 60 }] }}
                    />

                    <Animatable.View animation="fadeIn" duration={600} className="px-6">
                        {/* Top Bar */}
                        <View className="flex-row justify-between items-center mb-6">
                            <View className="flex-row items-center gap-4">
                                {/* Avatar with gradient ring */}
                                <View className="relative">
                                    <LinearGradient
                                        colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)']}
                                        className="w-14 h-14 rounded-full p-0.5"
                                    >
                                        <View className="flex-1 rounded-full bg-white/20 items-center justify-center">
                                            <Ionicons name="person" size={24} color="white" />
                                        </View>
                                    </LinearGradient>
                                    {/* Online indicator */}
                                    <View className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-400 border-2 border-white" />
                                </View>
                                <View>
                                    <Text className="text-white/70 text-sm font-medium">{getGreeting()} 👋</Text>
                                    <Text className="text-white text-xl font-bold capitalize">{firstName}</Text>
                                </View>
                            </View>

                            <View className="flex-row gap-3">
                                <TouchableOpacity 
                                    className="bg-white/15 p-3 rounded-2xl"
                                    style={{
                                        borderWidth: 1,
                                        borderColor: 'rgba(255,255,255,0.1)',
                                    }}
                                >
                                    <Ionicons name="notifications-outline" size={22} color="white" />
                                    {/* Notification badge */}
                                    <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 items-center justify-center">
                                        <Text className="text-white text-xs font-bold">3</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    className="bg-white/15 p-3 rounded-2xl"
                                    style={{
                                        borderWidth: 1,
                                        borderColor: 'rgba(255,255,255,0.1)',
                                    }}
                                    onPress={handleLogout}
                                >
                                    <Ionicons name="log-out-outline" size={22} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Welcome Message */}
                        <View className="mb-4">
                            <Text className="text-white/80 text-base">
                                Comment allez-vous aujourd'hui?
                            </Text>
                        </View>
                    </Animatable.View>
                </LinearGradient>

                {/* Search Card - Overlapping Header */}
                <View className="px-5 -mt-20">
                    <Animatable.View animation="fadeInUp" delay={100} duration={500}>
                        <TouchableOpacity 
                            onPress={() => router.push('/(patient)/doctors')}
                            activeOpacity={0.95}
                        >
                            <View
                                className="bg-white rounded-3xl p-5"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 10 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 20,
                                    elevation: 10,
                                }}
                            >
                                {/* Search Bar */}
                                <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3.5 mb-4">
                                    <View className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                                        style={{ backgroundColor: colors.primary[100] }}
                                    >
                                        <Ionicons name="search" size={20} color={colors.primary[600]} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-sm">Rechercher un médecin...</Text>
                                        <Text className="text-gray-300 text-xs">Spécialité, nom, ville...</Text>
                                    </View>
                                    <View className="w-10 h-10 rounded-xl items-center justify-center"
                                        style={{ backgroundColor: colors.primary[600] }}
                                    >
                                        <Ionicons name="options" size={18} color="white" />
                                    </View>
                                </View>

                                {/* Quick Access Buttons */}
                                <View className="flex-row gap-3">
                                    <TouchableOpacity 
                                        className="flex-1 bg-gradient-to-r rounded-2xl overflow-hidden"
                                        onPress={() => router.push('/(patient)/doctors')}
                                    >
                                        <LinearGradient
                                            colors={[colors.primary[500], colors.primary[600]]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            className="flex-row items-center justify-center py-3.5 px-4 gap-2"
                                        >
                                            <Ionicons name="calendar" size={18} color="white" />
                                            <Text className="text-white font-semibold text-sm">Prendre RDV</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        className="flex-1 bg-purple-50 rounded-2xl flex-row items-center justify-center py-3.5 px-4 gap-2"
                                        onPress={() => router.push('/(patient)/doctors')}
                                    >
                                        <Ionicons name="videocam" size={18} color="#8B5CF6" />
                                        <Text className="text-purple-600 font-semibold text-sm">Consultation</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animatable.View>
                </View>

                {/* Main Content */}
                <View className="px-5 mt-6">
                    {/* Quick Actions Grid */}
                    <Animatable.View animation="fadeInUp" delay={150} duration={500} className="mb-8">
                        <View className="flex-row flex-wrap justify-between">
                            {[
                                { icon: 'calendar', label: 'Rendez-vous', color: colors.primary[600], bgColor: colors.primary[50], route: '/(patient)/doctors' },
                                { icon: 'map', label: 'Proximité', color: '#10B981', bgColor: '#ECFDF5', route: '/(patient)/doctors' },
                                { icon: 'time', label: 'Historique', color: '#8B5CF6', bgColor: '#F5F3FF', route: '/(patient)/(tabs)/appointments' },
                                { icon: 'call', label: 'Urgence', color: '#EF4444', bgColor: '#FEF2F2', route: null },
                            ].map((action, index) => (
                                <TouchableOpacity 
                                    key={action.label}
                                    className="items-center mb-4"
                                    style={{ width: '23%' }}
                                    onPress={() => action.route && router.push(action.route as any)}
                                >
                                    <View 
                                        className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
                                        style={{ 
                                            backgroundColor: action.bgColor,
                                            shadowColor: action.color,
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 8,
                                            elevation: 3,
                                        }}
                                    >
                                        <Ionicons name={action.icon as any} size={24} color={action.color} />
                                    </View>
                                    <Text className="text-gray-600 text-xs font-medium text-center">{action.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animatable.View>

                    {/* Upcoming Appointments Section */}
                    <Animatable.View animation="fadeInUp" delay={200} duration={500} className="mb-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center gap-2">
                                <View className="w-8 h-8 rounded-xl items-center justify-center"
                                    style={{ backgroundColor: colors.primary[100] }}
                                >
                                    <Ionicons name="calendar" size={16} color={colors.primary[600]} />
                                </View>
                                <Text className="text-gray-900 text-lg font-bold">Prochains Rendez-vous</Text>
                            </View>
                            <TouchableOpacity 
                                className="flex-row items-center gap-1 px-3 py-1.5 rounded-full"
                                style={{ backgroundColor: colors.primary[50] }}
                                onPress={() => router.push('/(patient)/(tabs)/appointments')}
                            >
                                <Text className="text-primary-600 text-sm font-semibold" style={{ color: colors.primary[600] }}>Voir tout</Text>
                                <Ionicons name="chevron-forward" size={14} color={colors.primary[600]} />
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <View className="bg-white rounded-3xl p-4 items-center"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.08,
                                    shadowRadius: 12,
                                    elevation: 4,
                                }}
                            >
                                <InlineLoader size="small" />
                            </View>
                        ) : upcomingAppointments.length === 0 ? (
                            <TouchableOpacity 
                                onPress={() => router.push('/(patient)/doctors')}
                                activeOpacity={0.9}
                            >
                                <View
                                    className="bg-white rounded-3xl p-6 flex-row items-center"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.08,
                                        shadowRadius: 12,
                                        elevation: 4,
                                    }}
                                >
                                    <View className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                                        style={{ backgroundColor: colors.primary[50] }}
                                    >
                                        <Ionicons name="calendar-outline" size={32} color={colors.primary[600]} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-800 font-bold mb-1">Pas de rendez-vous</Text>
                                        <Text className="text-gray-500 text-sm">Prenez votre premier rendez-vous</Text>
                                    </View>
                                    <LinearGradient
                                        colors={[colors.primary[500], colors.primary[600]]}
                                        className="w-12 h-12 rounded-2xl items-center justify-center"
                                    >
                                        <Ionicons name="add" size={24} color="white" />
                                    </LinearGradient>
                                </View>
                            </TouchableOpacity>
                        ) : (
                            <View className="gap-3">
                                {upcomingAppointments.slice(0, 2).map((apt, index) => (
                                    <TouchableOpacity
                                        key={apt.id}
                                        onPress={() => router.push('/(patient)/(tabs)/appointments')}
                                        activeOpacity={0.9}
                                    >
                                        <View
                                            className="bg-white rounded-3xl p-4"
                                            style={{
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.08,
                                                shadowRadius: 12,
                                                elevation: 4,
                                            }}
                                        >
                                            <View className="flex-row items-center">
                                                {/* Date Box with Gradient */}
                                                <LinearGradient
                                                    colors={[colors.primary[500], colors.primary[600]]}
                                                    className="rounded-2xl p-3 items-center mr-4"
                                                    style={{ minWidth: 65 }}
                                                >
                                                    <Text className="text-white/80 text-xs font-medium">
                                                        {new Date(apt.appointment_date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                                                    </Text>
                                                    <Text className="text-white text-2xl font-bold">
                                                        {new Date(apt.appointment_date).getDate()}
                                                    </Text>
                                                    <Text className="text-white/80 text-xs">
                                                        {new Date(apt.appointment_date).toLocaleDateString('fr-FR', { month: 'short' })}
                                                    </Text>
                                                </LinearGradient>

                                                {/* Doctor Info */}
                                                <View className="flex-1">
                                                    <View className="flex-row items-center justify-between mb-1">
                                                        <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>
                                                            Dr. {apt.doctor?.first_name} {apt.doctor?.last_name}
                                                        </Text>
                                                    </View>
                                                    <Text className="text-gray-500 text-sm mb-2">{apt.doctor?.specialty}</Text>
                                                    <View className="flex-row items-center gap-3">
                                                        <View className="flex-row items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-lg">
                                                            <Ionicons name="time-outline" size={14} color={colors.gray[500]} />
                                                            <Text className="text-gray-600 text-sm font-medium">{formatTime(apt.appointment_date)}</Text>
                                                        </View>
                                                        <View className={`flex-row items-center gap-1 px-2.5 py-1 rounded-lg ${
                                                            apt.consultation_type === 'online' ? 'bg-purple-50' : 'bg-blue-50'
                                                        }`}>
                                                            <Ionicons 
                                                                name={apt.consultation_type === 'online' ? 'videocam' : 'location'} 
                                                                size={14} 
                                                                color={apt.consultation_type === 'online' ? '#8B5CF6' : colors.primary[600]} 
                                                            />
                                                            <Text className={`text-sm font-medium ${
                                                                apt.consultation_type === 'online' ? 'text-purple-600' : 'text-primary-600'
                                                            }`}>
                                                                {apt.consultation_type === 'online' ? 'Vidéo' : 'Cabinet'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>

                                                {/* Status Badge */}
                                                <View className={`px-3 py-1.5 rounded-xl ${
                                                    apt.status === 'confirmed' ? 'bg-green-100' : 'bg-amber-100'
                                                }`}>
                                                    <Ionicons 
                                                        name={apt.status === 'confirmed' ? 'checkmark-circle' : 'time'} 
                                                        size={18} 
                                                        color={apt.status === 'confirmed' ? '#10B981' : '#F59E0B'} 
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </Animatable.View>

                    {/* Specialties Section */}
                    <Animatable.View animation="fadeInUp" delay={250} duration={500} className="mb-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center gap-2">
                                <View className="w-8 h-8 rounded-xl items-center justify-center"
                                    style={{ backgroundColor: '#FEF3C7' }}
                                >
                                    <Ionicons name="medical" size={16} color="#F59E0B" />
                                </View>
                                <Text className="text-gray-900 text-lg font-bold">Spécialités</Text>
                            </View>
                            <TouchableOpacity 
                                className="flex-row items-center gap-1 px-3 py-1.5 rounded-full"
                                style={{ backgroundColor: '#FEF3C7' }}
                                onPress={() => router.push('/(patient)/doctors')}
                            >
                                <Text className="text-amber-600 text-sm font-semibold">Voir tout</Text>
                                <Ionicons name="chevron-forward" size={14} color="#F59E0B" />
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
                                        <View
                                            className="rounded-2xl overflow-hidden"
                                            style={{
                                                width: isSmallDevice ? 100 : 110,
                                                shadowColor: specialty.gradient[0],
                                                shadowOffset: { width: 0, height: 6 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 10,
                                                elevation: 6,
                                            }}
                                        >
                                            <LinearGradient
                                                colors={specialty.gradient}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                className="p-4 items-center"
                                                style={{ height: isSmallDevice ? 110 : 120 }}
                                            >
                                                <View className="bg-white/25 w-12 h-12 rounded-xl items-center justify-center mb-3">
                                                    <Ionicons name={specialty.icon as any} size={24} color="white" />
                                                </View>
                                                <Text className="text-white text-xs font-semibold text-center" numberOfLines={2}>
                                                    {specialty.name}
                                                </Text>
                                            </LinearGradient>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </Animatable.View>

                    {/* Top Doctors Section */}
                    <Animatable.View animation="fadeInUp" delay={300} duration={500} className="mb-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center gap-2">
                                <View className="w-8 h-8 rounded-xl items-center justify-center"
                                    style={{ backgroundColor: '#E0E7FF' }}
                                >
                                    <Ionicons name="star" size={16} color="#6366F1" />
                                </View>
                                <Text className="text-gray-900 text-lg font-bold">Médecins Populaires</Text>
                            </View>
                            <TouchableOpacity 
                                className="flex-row items-center gap-1 px-3 py-1.5 rounded-full"
                                style={{ backgroundColor: '#E0E7FF' }}
                                onPress={() => router.push('/(patient)/doctors')}
                            >
                                <Text className="text-indigo-600 text-sm font-semibold">Voir tout</Text>
                                <Ionicons name="chevron-forward" size={14} color="#6366F1" />
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <InlineLoader size="small" />
                        ) : topDoctors.length === 0 ? (
                            <View className="bg-white rounded-3xl p-6 items-center"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.08,
                                    shadowRadius: 12,
                                    elevation: 4,
                                }}
                            >
                                <Ionicons name="people-outline" size={40} color={colors.gray[300]} />
                                <Text className="text-gray-500 mt-2">Aucun médecin disponible</Text>
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
                                        >
                                            <View
                                                className="bg-white rounded-3xl overflow-hidden"
                                                style={{
                                                    width: isSmallDevice ? 150 : 160,
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 6 },
                                                    shadowOpacity: 0.1,
                                                    shadowRadius: 15,
                                                    elevation: 6,
                                                }}
                                            >
                                                {/* Doctor Image */}
                                                <LinearGradient
                                                    colors={[colors.primary[100], colors.primary[50]]}
                                                    className="h-28 items-center justify-center relative"
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
                                                    {/* Verified Badge */}
                                                    <View className="absolute top-2 right-2 bg-white rounded-full p-1"
                                                        style={{
                                                            shadowColor: '#000',
                                                            shadowOffset: { width: 0, height: 2 },
                                                            shadowOpacity: 0.1,
                                                            shadowRadius: 4,
                                                            elevation: 2,
                                                        }}
                                                    >
                                                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                                    </View>
                                                    {/* Online indicator */}
                                                    {doctor.is_accepting_patients && (
                                                        <View className="absolute bottom-2 right-2 flex-row items-center gap-1 bg-green-500 px-2 py-0.5 rounded-full">
                                                            <View className="w-1.5 h-1.5 rounded-full bg-white" />
                                                            <Text className="text-white text-xs font-medium">En ligne</Text>
                                                        </View>
                                                    )}
                                                </LinearGradient>

                                                {/* Doctor Info */}
                                                <View className="p-4">
                                                    <Text className="text-gray-900 font-bold text-sm mb-0.5" numberOfLines={1}>
                                                        Dr. {doctor.first_name}
                                                    </Text>
                                                    <Text className="text-gray-500 text-xs mb-2" numberOfLines={1}>
                                                        {doctor.specialty}
                                                    </Text>
                                                    <View className="flex-row items-center justify-between">
                                                        <View className="flex-row items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                                                            <Ionicons name="star" size={12} color="#F59E0B" />
                                                            <Text className="text-amber-600 text-xs font-semibold">
                                                                {doctor.average_rating.toFixed(1)}
                                                            </Text>
                                                        </View>
                                                        <Text className="text-gray-400 text-xs">
                                                            {doctor.years_experience} ans
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        )}
                    </Animatable.View>

                    {/* Promo Banner */}
                    <Animatable.View animation="fadeInUp" delay={350} duration={500} className="mb-4">
                        <TouchableOpacity activeOpacity={0.95}>
                            <View
                                className="rounded-3xl overflow-hidden"
                                style={{
                                    shadowColor: '#0EA5E9',
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 16,
                                    elevation: 8,
                                }}
                            >
                                <LinearGradient
                                    colors={['#0EA5E9', '#0284C7', '#0369A1']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    className="p-6 flex-row items-center"
                                >
                                    {/* Decorative circles */}
                                    <View 
                                        className="absolute -right-8 -top-8 w-32 h-32 rounded-full"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                                    />
                                    <View 
                                        className="absolute -right-4 -bottom-8 w-24 h-24 rounded-full"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                                    />

                                    <View className="flex-1">
                                        <View className="bg-white/20 px-3 py-1 rounded-full self-start mb-3">
                                            <Text className="text-white text-xs font-bold">NOUVEAU</Text>
                                        </View>
                                        <Text className="text-white text-xl font-bold mb-1">
                                            Téléconsultation
                                        </Text>
                                        <Text className="text-white/80 text-sm">
                                            Consultez depuis chez vous en vidéo
                                        </Text>
                                    </View>
                                    <View className="bg-white/20 p-4 rounded-2xl">
                                        <Ionicons name="videocam" size={36} color="white" />
                                    </View>
                                </LinearGradient>
                            </View>
                        </TouchableOpacity>
                    </Animatable.View>
                </View>
            </ScrollView>
        </View>
    );
}
