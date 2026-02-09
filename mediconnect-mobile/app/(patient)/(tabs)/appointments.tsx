import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    ScrollView, 
    FlatList,
    RefreshControl,
    Modal,
    Alert,
    TextInput,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { colors } from '@/lib/constants/colors';
import { appointmentsApi, Appointment, AppointmentStatus } from '@/lib/api/appointments';
import AppointmentCard from '@/components/patient/AppointmentCard';
import AnimatedLoader from '@/components/ui/AnimatedLoader';

type TabFilter = 'upcoming' | 'past' | 'all';

export default function AppointmentsScreen() {
    const router = useRouter();
    
    // State
    const [activeTab, setActiveTab] = useState<TabFilter>('upcoming');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Cancel modal
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    // Fetch appointments
    const fetchAppointments = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const result = await appointmentsApi.getMyAppointments({
                upcoming_only: activeTab === 'upcoming',
                page_size: 50,
            });

            let filtered = result.appointments;
            
            // Additional filtering for 'past' tab
            if (activeTab === 'past') {
                const now = new Date();
                filtered = filtered.filter(a => new Date(a.appointment_date) < now);
            }

            setAppointments(filtered);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleCancelPress = (appointment: Appointment) => {
        if (!appointment.is_cancellable) {
            Alert.alert(
                'Cannot Cancel',
                'This appointment can no longer be cancelled. Appointments must be cancelled at least 24 hours in advance.',
                [{ text: 'OK' }]
            );
            return;
        }
        setCancellingAppointment(appointment);
        setShowCancelModal(true);
    };

    const handleConfirmCancel = async () => {
        if (!cancellingAppointment) return;

        try {
            setCancelling(true);
            await appointmentsApi.cancelAppointment(cancellingAppointment.id, cancelReason || undefined);
            
            setShowCancelModal(false);
            setCancellingAppointment(null);
            setCancelReason('');
            
            // Refresh list
            fetchAppointments();
            
            Alert.alert(
                'Appointment Cancelled',
                'Your appointment has been successfully cancelled.',
                [{ text: 'OK' }]
            );
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.response?.data?.detail || 'Failed to cancel appointment.',
                [{ text: 'OK' }]
            );
        } finally {
            setCancelling(false);
        }
    };

    const handleReschedule = (appointment: Appointment) => {
        // Navigate to booking screen with reschedule mode
        router.push(`/(patient)/booking/${appointment.doctor_id}?reschedule=${appointment.id}`);
    };

    const renderEmptyState = () => (
        <View className="flex-1 items-center justify-center py-20">
            <View className="bg-gray-100 w-24 h-24 rounded-full items-center justify-center mb-6">
                <Ionicons name="calendar-outline" size={48} color={colors.gray[400]} />
            </View>
            <Text className="text-gray-800 text-xl font-bold text-center mb-2">
                No Appointments
            </Text>
            <Text className="text-gray-500 text-center mb-6 px-10">
                {activeTab === 'upcoming' 
                    ? "You don't have any upcoming appointments. Book one now!"
                    : "No past appointments found."}
            </Text>
            {activeTab === 'upcoming' && (
                <TouchableOpacity
                    onPress={() => router.push('/(patient)/doctors')}
                    className="bg-primary-600 px-6 py-3 rounded-xl flex-row items-center gap-2"
                >
                    <Ionicons name="search" size={20} color="white" />
                    <Text className="text-white font-semibold">Find a Doctor</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <LinearGradient
                colors={[colors.primary[600], colors.primary[500]]}
                className="pt-14 pb-6 px-5"
            >
                <Animatable.View animation="fadeInDown" duration={600}>
                    <Text className="text-white text-2xl font-bold mb-1">My Appointments</Text>
                    <Text className="text-white/80">
                        Manage your scheduled consultations
                    </Text>
                </Animatable.View>
            </LinearGradient>

            {/* Tabs */}
            <View className="px-5 py-4">
                <View className="flex-row bg-gray-200 rounded-2xl p-1">
                    {(['upcoming', 'past', 'all'] as TabFilter[]).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className={`flex-1 py-3 rounded-xl items-center ${
                                activeTab === tab ? 'bg-white' : ''
                            }`}
                            style={activeTab === tab ? {
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 2,
                            } : {}}
                        >
                            <Text className={`font-semibold capitalize ${
                                activeTab === tab ? 'text-primary-600' : 'text-gray-500'
                            }`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Content */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <AnimatedLoader size="large" message="Chargement des rendez-vous..." />
                </View>
            ) : (
                <FlatList
                    data={appointments}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <Animatable.View animation="fadeInUp" delay={index * 80} duration={400}>
                            <AppointmentCard 
                                appointment={item}
                                onCancel={() => handleCancelPress(item)}
                                onReschedule={() => handleReschedule(item)}
                            />
                        </Animatable.View>
                    )}
                    contentContainerStyle={{ 
                        padding: 16, 
                        paddingBottom: 100,
                        flexGrow: 1,
                    }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchAppointments(true)}
                            tintColor={colors.primary[600]}
                        />
                    }
                    ListEmptyComponent={renderEmptyState}
                />
            )}

            {/* Cancel Confirmation Modal */}
            <Modal
                visible={showCancelModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowCancelModal(false)}
            >
                <View className="flex-1 bg-white">
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
                        <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                            <Ionicons name="close" size={24} color={colors.gray[600]} />
                        </TouchableOpacity>
                        <Text className="text-lg font-bold text-gray-800">Cancel Appointment</Text>
                        <View className="w-6" />
                    </View>

                    <ScrollView className="flex-1 p-5">
                        {/* Warning */}
                        <View className="bg-red-50 rounded-2xl p-4 flex-row gap-3 mb-6">
                            <Ionicons name="warning" size={24} color={colors.error} />
                            <View className="flex-1">
                                <Text className="text-red-800 font-semibold mb-1">
                                    Are you sure you want to cancel?
                                </Text>
                                <Text className="text-red-600 text-sm">
                                    This action cannot be undone. The doctor will be notified of your cancellation.
                                </Text>
                            </View>
                        </View>

                        {/* Appointment Summary */}
                        {cancellingAppointment && (
                            <View className="bg-gray-50 rounded-2xl p-4 mb-6">
                                <Text className="text-gray-500 text-sm mb-2">Appointment Details</Text>
                                <Text className="text-gray-800 font-bold text-lg">
                                    Dr. {cancellingAppointment.doctor?.first_name} {cancellingAppointment.doctor?.last_name}
                                </Text>
                                <Text className="text-gray-600 mt-1">
                                    {new Date(cancellingAppointment.appointment_date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Text>
                            </View>
                        )}

                        {/* Reason */}
                        <View className="mb-6">
                            <Text className="text-gray-700 font-semibold mb-2">
                                Reason for cancellation (optional)
                            </Text>
                            <TextInput
                                value={cancelReason}
                                onChangeText={setCancelReason}
                                placeholder="Let the doctor know why you're cancelling..."
                                placeholderTextColor={colors.gray[400]}
                                multiline
                                numberOfLines={4}
                                className="bg-gray-50 rounded-xl p-4 text-gray-800 border border-gray-200"
                                style={{ textAlignVertical: 'top', minHeight: 100 }}
                            />
                        </View>
                    </ScrollView>

                    {/* Actions */}
                    <View className="p-5 border-t border-gray-100 gap-3">
                        <TouchableOpacity
                            onPress={handleConfirmCancel}
                            disabled={cancelling}
                            className="rounded-2xl overflow-hidden"
                        >
                            <LinearGradient
                                colors={cancelling ? [colors.gray[400], colors.gray[500]] : [colors.error, '#DC2626']}
                                className="py-4 flex-row items-center justify-center gap-2"
                            >
                                {cancelling ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="close-circle" size={22} color="white" />
                                        <Text className="text-white font-bold text-lg">Confirm Cancellation</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setShowCancelModal(false)}
                            className="bg-gray-100 py-4 rounded-2xl items-center"
                        >
                            <Text className="text-gray-700 font-semibold">Keep Appointment</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}