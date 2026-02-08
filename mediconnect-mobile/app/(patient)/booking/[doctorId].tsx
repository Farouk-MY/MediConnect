import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    ActivityIndicator,
    Alert,
    TextInput,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { colors } from '@/lib/constants/colors';
import { doctorsApi, DoctorPublicProfile } from '@/lib/api/doctors';
import { appointmentsApi, ConsultationType } from '@/lib/api/appointments';
import { availabilityApi, ComputedAvailability, ComputedTimeSlot } from '@/lib/api/availability';
import CalendarPicker, { DateStatus } from '@/components/patient/CalendarPicker';
import TimeSlotPicker from '@/components/patient/TimeSlotPicker';
import BookingSuccessModal from '@/components/patient/BookingSuccessModal';

const isIOS = Platform.OS === 'ios';

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

type BookingStep = 'type' | 'date' | 'time' | 'payment' | 'confirm';
type PaymentMethod = 'online' | 'in_person';

const STEP_CONFIG = [
    { key: 'type', label: 'Type', icon: 'medical' },
    { key: 'date', label: 'Date', icon: 'calendar' },
    { key: 'time', label: 'Heure', icon: 'time' },
    { key: 'payment', label: 'Paiement', icon: 'card' },
    { key: 'confirm', label: 'Confirmer', icon: 'checkmark-circle' }
];

export default function BookingScreen() {
    const { doctorId } = useLocalSearchParams<{ doctorId: string }>();
    const router = useRouter();

    // State
    const [step, setStep] = useState<BookingStep>('type');
    const [doctor, setDoctor] = useState<DoctorPublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    
    // Availability data
    const [availability, setAvailability] = useState<ComputedAvailability | null>(null);

    // Selection state
    const [consultationType, setConsultationType] = useState<ConsultationType | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online');
    const [notes, setNotes] = useState('');

    // Success modal state
    const [showSuccess, setShowSuccess] = useState(false);
    const [bookingResult, setBookingResult] = useState<{
        confirmationCode: string;
    } | null>(null);

    const currentStepIndex = STEP_CONFIG.findIndex(s => s.key === step);
    
    // Get available time slots for selected date
    // Filter by: availability, NOT booked, matching consultation type
    const availableTimeSlots = useMemo((): ComputedTimeSlot[] => {
        if (!availability || !selectedDate) return [];
        
        const dayData = availability.days?.find(d => d.date === formatDate(selectedDate));
        if (!dayData) return [];
        
        return dayData.slots.filter(slot => {
            // Must be available and NOT already booked
            if (!slot.is_available || slot.is_booked) return false;
            
            // Filter by consultation type
            if (consultationType) {
                if (slot.consultation_type === 'both') return true;
                return slot.consultation_type === consultationType;
            }
            return true;
        });
    }, [availability, selectedDate, consultationType]);

    // Get date status for calendar
    const getDateStatus = useCallback((date: Date): DateStatus => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date < today) return 'past';
        if (!availability) return 'unknown';
        
        const dayData = availability.days?.find(d => d.date === formatDate(date));
        if (!dayData) return 'unavailable';
        if (dayData.is_blocked) return 'blocked';
        
        // Check if any slots are actually available (not booked)
        const hasAvailableSlots = dayData.slots.some(slot => 
            slot.is_available && !slot.is_booked
        );
        
        if (!hasAvailableSlots) return 'full';
        return 'available';
    }, [availability]);

    useEffect(() => {
        fetchDoctor();
        fetchAvailability();
    }, [doctorId]);

    const fetchDoctor = async () => {
        try {
            setLoading(true);
            const result = await doctorsApi.getDoctorById(doctorId);
            setDoctor(result);
        } catch (error) {
            console.error('Error fetching doctor:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailability = async () => {
        try {
            setLoadingSlots(true);
            const today = new Date();
            const endDate = new Date(today);
            endDate.setMonth(endDate.getMonth() + 6);
            
            const result = await availabilityApi.getDoctorAvailability(
                doctorId, 
                formatDate(today), 
                formatDate(endDate)
            );
            
            // Debug: Log availability data for Feb 16
            const feb16 = result.days?.find(d => d.date === '2026-02-16');
            if (feb16) {
                console.log('[DEBUG] Feb 16 slots:', feb16.slots.map(s => ({
                    time: s.start_time,
                    is_available: s.is_available,
                    is_booked: s.is_booked
                })));
            }
            
            setAvailability(result);
        } catch (error) {
            console.error('Error fetching availability:', error);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleNextStep = () => {
        if (step === 'type' && consultationType) {
            setStep('date');
        } else if (step === 'date' && selectedDate) {
            setStep('time');
        } else if (step === 'time' && selectedTime) {
            setStep('payment');
        } else if (step === 'payment') {
            setStep('confirm');
        }
    };

    const handlePrevStep = () => {
        if (step === 'date') setStep('type');
        else if (step === 'time') setStep('date');
        else if (step === 'payment') setStep('time');
        else if (step === 'confirm') setStep('payment');
        else router.back();
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime(null); // Reset time when date changes
    };

    const handleBooking = async () => {
        if (!selectedDate || !selectedTime || !consultationType) return;

        try {
            setBooking(true);

            const appointmentDate = new Date(selectedDate);
            const [hours, minutes] = selectedTime.split(':').map(Number);
            appointmentDate.setHours(hours, minutes, 0, 0);

            console.log('[DEBUG] Creating appointment:', {
                doctor_id: doctorId,
                appointment_date: appointmentDate.toISOString(),
                consultation_type: consultationType,
            });

            const result = await appointmentsApi.createAppointment({
                doctor_id: doctorId,
                appointment_date: appointmentDate.toISOString(),
                consultation_type: consultationType,
                notes: notes || undefined,
            });

            console.log('[DEBUG] Appointment created:', result);

            // Show success modal
            setBookingResult({
                confirmationCode: result.confirmation_code
            });
            setShowSuccess(true);

        } catch (error: any) {
            Alert.alert(
                'Échec de la réservation', 
                error.response?.data?.detail || 'Veuillez réessayer.'
            );
        } finally {
            setBooking(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
        router.replace('/(patient)/(tabs)/appointments');
    };

    const getFee = () => {
        if (!doctor || !consultationType) return 0;
        return consultationType === 'presentiel' 
            ? doctor.consultation_fee_presentiel 
            : doctor.consultation_fee_online;
    };

    const canContinue = () => {
        switch (step) {
            case 'type': return !!consultationType;
            case 'date': return !!selectedDate;
            case 'time': return !!selectedTime;
            case 'payment': return true;
            case 'confirm': return true;
            default: return false;
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color={colors.primary[600]} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Success Modal */}
            {showSuccess && bookingResult && selectedDate && selectedTime && (
                <BookingSuccessModal
                    visible={showSuccess}
                    doctorName={`Dr. ${doctor?.first_name} ${doctor?.last_name}`}
                    consultationType={consultationType!}
                    date={selectedDate.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}
                    time={selectedTime}
                    confirmationCode={bookingResult.confirmationCode}
                    onClose={handleSuccessClose}
                />
            )}

            {/* Premium Header */}
            <LinearGradient
                colors={[colors.primary[700], colors.primary[500]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className={`${isIOS ? 'pt-16' : 'pt-12'} pb-8 px-6`}
            >
                <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity 
                        onPress={handlePrevStep}
                        className="w-11 h-11 bg-white/15 backdrop-blur rounded-2xl items-center justify-center"
                        style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}
                    >
                        <Ionicons name="arrow-back" size={22} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white/70 text-xs font-medium">Étape {currentStepIndex + 1} sur 5</Text>
                        <Text className="text-white text-lg font-bold mt-0.5">Prendre rendez-vous</Text>
                    </View>
                    <View className="w-11" />
                </View>

                {/* Premium Step Indicator */}
                <View className="flex-row items-center justify-between px-1">
                    {STEP_CONFIG.map((s, index) => {
                        const isActive = index === currentStepIndex;
                        const isCompleted = index < currentStepIndex;
                        
                        return (
                            <React.Fragment key={s.key}>
                                <View className="items-center">
                                    <Animatable.View 
                                        animation={isActive ? 'pulse' : undefined}
                                        iterationCount="infinite"
                                        duration={2000}
                                        className={`w-10 h-10 rounded-xl items-center justify-center mb-1.5 ${
                                            isActive ? 'bg-white' :
                                            isCompleted ? 'bg-white/90' : 'bg-white/20'
                                        }`}
                                        style={isActive ? {
                                            shadowColor: '#fff',
                                            shadowOffset: { width: 0, height: 0 },
                                            shadowOpacity: 0.5,
                                            shadowRadius: 10,
                                        } : {}}
                                    >
                                        <Ionicons 
                                            name={isCompleted ? 'checkmark' : s.icon as any} 
                                            size={18} 
                                            color={isActive || isCompleted ? colors.primary[600] : 'rgba(255,255,255,0.5)'} 
                                        />
                                    </Animatable.View>
                                    <Text className={`text-[10px] font-medium ${
                                        isActive ? 'text-white' : isCompleted ? 'text-white/90' : 'text-white/50'
                                    }`}>
                                        {s.label}
                                    </Text>
                                </View>
                                {index < STEP_CONFIG.length - 1 && (
                                    <View className={`flex-1 h-0.5 mx-1 rounded-full ${
                                        isCompleted ? 'bg-white/80' : 'bg-white/20'
                                    }`} style={{ marginBottom: 18 }} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </View>
            </LinearGradient>

            <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ padding: 20, paddingBottom: 130 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Step 1: Consultation Type */}
                {step === 'type' && (
                    <Animatable.View animation="fadeInUp" duration={500}>
                        {/* Doctor Card */}
                        <View 
                            className="bg-white rounded-3xl p-5 mb-6"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.08,
                                shadowRadius: 24,
                                elevation: 8,
                            }}
                        >
                            <View className="flex-row items-center gap-4">
                                <LinearGradient
                                    colors={[colors.primary[100], colors.primary[50]]}
                                    className="w-16 h-16 rounded-2xl items-center justify-center"
                                >
                                    <Ionicons name="person" size={32} color={colors.primary[600]} />
                                </LinearGradient>
                                <View className="flex-1">
                                    <Text className="text-gray-800 font-bold text-lg">
                                        Dr. {doctor?.first_name} {doctor?.last_name}
                                    </Text>
                                    <Text className="text-gray-500">{doctor?.specialty}</Text>
                                    <View className="flex-row items-center gap-1 mt-1">
                                        <Ionicons name="star" size={14} color="#F59E0B" />
                                        <Text className="text-gray-600 text-sm font-medium">4.9</Text>
                                        <Text className="text-gray-400 text-sm">• 120+ avis</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <Text className="text-gray-800 font-bold text-xl mb-2">Type de consultation</Text>
                        <Text className="text-gray-500 mb-5">Choisissez comment vous souhaitez consulter</Text>
                        
                        <View className="gap-4">
                            {doctor?.offers_presentiel && (
                                <TouchableOpacity
                                    onPress={() => setConsultationType('presentiel')}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={consultationType === 'presentiel' 
                                            ? [colors.primary[500], colors.primary[600]] 
                                            : ['#fff', '#fff']}
                                        className="p-5 rounded-3xl"
                                        style={{
                                            borderWidth: consultationType === 'presentiel' ? 0 : 2,
                                            borderColor: colors.gray[200],
                                            shadowColor: consultationType === 'presentiel' ? colors.primary[500] : '#000',
                                            shadowOffset: { width: 0, height: 8 },
                                            shadowOpacity: consultationType === 'presentiel' ? 0.3 : 0.06,
                                            shadowRadius: 16,
                                            elevation: consultationType === 'presentiel' ? 10 : 3,
                                        }}
                                    >
                                        <View className="flex-row items-center gap-4">
                                            <View className={`p-4 rounded-2xl ${
                                                consultationType === 'presentiel' ? 'bg-white/20' : 'bg-primary-50'
                                            }`}>
                                                <Ionicons 
                                                    name="business" 
                                                    size={28} 
                                                    color={consultationType === 'presentiel' ? 'white' : colors.primary[600]} 
                                                />
                                            </View>
                                            <View className="flex-1">
                                                <Text className={`text-lg font-bold ${
                                                    consultationType === 'presentiel' ? 'text-white' : 'text-gray-800'
                                                }`}>
                                                    Au cabinet
                                                </Text>
                                                <Text className={`text-sm mt-0.5 ${
                                                    consultationType === 'presentiel' ? 'text-white/70' : 'text-gray-500'
                                                }`}>
                                                    Visite en personne
                                                </Text>
                                            </View>
                                            <View className="items-end">
                                                <Text className={`text-2xl font-bold ${
                                                    consultationType === 'presentiel' ? 'text-white' : 'text-primary-600'
                                                }`}>
                                                    {doctor?.consultation_fee_presentiel}
                                                </Text>
                                                <Text className={`text-xs ${
                                                    consultationType === 'presentiel' ? 'text-white/60' : 'text-gray-400'
                                                }`}>
                                                    {doctor?.currency}
                                                </Text>
                                            </View>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}

                            {doctor?.offers_online && (
                                <TouchableOpacity
                                    onPress={() => setConsultationType('online')}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={consultationType === 'online' 
                                            ? ['#8B5CF6', '#7C3AED'] 
                                            : ['#fff', '#fff']}
                                        className="p-5 rounded-3xl"
                                        style={{
                                            borderWidth: consultationType === 'online' ? 0 : 2,
                                            borderColor: colors.gray[200],
                                            shadowColor: consultationType === 'online' ? '#8B5CF6' : '#000',
                                            shadowOffset: { width: 0, height: 8 },
                                            shadowOpacity: consultationType === 'online' ? 0.3 : 0.06,
                                            shadowRadius: 16,
                                            elevation: consultationType === 'online' ? 10 : 3,
                                        }}
                                    >
                                        <View className="flex-row items-center gap-4">
                                            <View className={`p-4 rounded-2xl ${
                                                consultationType === 'online' ? 'bg-white/20' : 'bg-purple-50'
                                            }`}>
                                                <Ionicons 
                                                    name="videocam" 
                                                    size={28} 
                                                    color={consultationType === 'online' ? 'white' : '#8B5CF6'} 
                                                />
                                            </View>
                                            <View className="flex-1">
                                                <View className="flex-row items-center gap-2">
                                                    <Text className={`text-lg font-bold ${
                                                        consultationType === 'online' ? 'text-white' : 'text-gray-800'
                                                    }`}>
                                                        Téléconsultation
                                                    </Text>
                                                    <View className={`px-2 py-0.5 rounded-full ${
                                                        consultationType === 'online' ? 'bg-white/20' : 'bg-purple-100'
                                                    }`}>
                                                        <Text className={`text-xs font-bold ${
                                                            consultationType === 'online' ? 'text-white' : 'text-purple-600'
                                                        }`}>HD</Text>
                                                    </View>
                                                </View>
                                                <Text className={`text-sm mt-0.5 ${
                                                    consultationType === 'online' ? 'text-white/70' : 'text-gray-500'
                                                }`}>
                                                    Vidéo sécurisée
                                                </Text>
                                            </View>
                                            <View className="items-end">
                                                <Text className={`text-2xl font-bold ${
                                                    consultationType === 'online' ? 'text-white' : 'text-purple-600'
                                                }`}>
                                                    {doctor?.consultation_fee_online}
                                                </Text>
                                                <Text className={`text-xs ${
                                                    consultationType === 'online' ? 'text-white/60' : 'text-gray-400'
                                                }`}>
                                                    {doctor?.currency}
                                                </Text>
                                            </View>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>
                    </Animatable.View>
                )}

                {/* Step 2: Date Selection */}
                {step === 'date' && (
                    <Animatable.View animation="fadeInUp" duration={500}>
                        <Text className="text-gray-800 font-bold text-xl mb-2">Choisir la date</Text>
                        <Text className="text-gray-500 mb-5">Sélectionnez un jour disponible</Text>

                        {loadingSlots ? (
                            <View className="items-center py-12">
                                <ActivityIndicator size="large" color={colors.primary[600]} />
                                <Text className="text-gray-500 mt-4">Chargement des disponibilités...</Text>
                            </View>
                        ) : (
                            <CalendarPicker
                                selectedDate={selectedDate}
                                onSelectDate={handleDateSelect}
                                getDateStatus={getDateStatus}
                                maxMonthsAhead={12}
                            />
                        )}

                        {selectedDate && (
                            <Animatable.View 
                                animation="fadeInUp" 
                                className="mt-4 bg-primary-50 rounded-2xl p-4 flex-row items-center gap-3"
                            >
                                <View className="w-12 h-12 rounded-xl bg-primary-100 items-center justify-center">
                                    <Ionicons name="calendar" size={24} color={colors.primary[600]} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-primary-800 font-bold">Date sélectionnée</Text>
                                    <Text className="text-primary-600 capitalize">
                                        {selectedDate.toLocaleDateString('fr-FR', { 
                                            weekday: 'long', 
                                            day: 'numeric', 
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </Text>
                                </View>
                                <Ionicons name="checkmark-circle" size={24} color={colors.primary[600]} />
                            </Animatable.View>
                        )}
                    </Animatable.View>
                )}

                {/* Step 3: Time Selection */}
                {step === 'time' && selectedDate && (
                    <Animatable.View animation="fadeInUp" duration={500}>
                        <TimeSlotPicker
                            slots={availableTimeSlots}
                            selectedTime={selectedTime}
                            onSelectTime={setSelectedTime}
                            selectedDate={selectedDate}
                        />
                    </Animatable.View>
                )}

                {/* Step 4: Payment (Placeholder - Disabled) */}
                {step === 'payment' && (
                    <Animatable.View animation="fadeInUp" duration={500}>
                        <Text className="text-gray-800 font-bold text-xl mb-2">Mode de paiement</Text>
                        <Text className="text-gray-500 mb-5">
                            {consultationType === 'online' 
                                ? 'Le paiement est requis avant la téléconsultation'
                                : 'Choisissez quand effectuer le paiement'}
                        </Text>

                        <View className="gap-4">
                            {/* Online Payment */}
                            <TouchableOpacity activeOpacity={0.8} disabled={true}>
                                <View 
                                    className={`p-5 rounded-3xl border-2 border-gray-200 bg-white opacity-60`}
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.06,
                                        shadowRadius: 16,
                                        elevation: 4,
                                    }}
                                >
                                    <View className="flex-row items-center gap-4">
                                        <View className="p-4 rounded-2xl bg-gray-100">
                                            <Ionicons name="card" size={28} color={colors.gray[500]} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-800 text-lg font-bold">Payer maintenant</Text>
                                            <Text className="text-gray-500 text-sm mt-0.5">Carte bancaire ou mobile money</Text>
                                        </View>
                                        <View className="w-6 h-6 rounded-full border-2 border-gray-300" />
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* In-Person Payment (only for presentiel) */}
                            {consultationType === 'presentiel' && (
                                <TouchableOpacity activeOpacity={0.8} disabled={true}>
                                    <View 
                                        className={`p-5 rounded-3xl border-2 border-gray-200 bg-white opacity-60`}
                                        style={{
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.06,
                                            shadowRadius: 16,
                                            elevation: 4,
                                        }}
                                    >
                                        <View className="flex-row items-center gap-4">
                                            <View className="p-4 rounded-2xl bg-gray-100">
                                                <Ionicons name="cash" size={28} color={colors.gray[500]} />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-gray-800 text-lg font-bold">Payer au cabinet</Text>
                                                <Text className="text-gray-500 text-sm mt-0.5">Espèces ou carte sur place</Text>
                                            </View>
                                            <View className="w-6 h-6 rounded-full border-2 border-gray-300" />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Coming Soon Notice */}
                        <View className="mt-6 bg-blue-50 rounded-2xl p-4 flex-row items-start gap-3">
                            <Ionicons name="information-circle" size={24} color={colors.info} />
                            <View className="flex-1">
                                <Text className="text-blue-800 font-semibold">Paiement bientôt disponible</Text>
                                <Text className="text-blue-600 text-sm mt-1">
                                    Le paiement en ligne sera disponible prochainement. Pour l'instant, le paiement se fait sur place.
                                </Text>
                            </View>
                        </View>

                        {/* Price Summary */}
                        <View 
                            className="mt-6 bg-white rounded-3xl p-5"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.06,
                                shadowRadius: 16,
                                elevation: 4,
                            }}
                        >
                            <Text className="text-gray-600 font-medium mb-4">Récapitulatif</Text>
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-500">Consultation</Text>
                                <Text className="text-gray-800 font-medium">{getFee()} {doctor?.currency}</Text>
                            </View>
                            <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-100">
                                <Text className="text-gray-500">Frais de service</Text>
                                <Text className="text-gray-400">Inclus</Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-800 font-bold text-lg">Total</Text>
                                <Text className="text-primary-600 font-bold text-2xl">{getFee()} {doctor?.currency}</Text>
                            </View>
                        </View>
                    </Animatable.View>
                )}

                {/* Step 5: Confirmation */}
                {step === 'confirm' && (
                    <Animatable.View animation="fadeInUp" duration={500}>
                        <Text className="text-gray-800 font-bold text-xl mb-2">Confirmer le rendez-vous</Text>
                        <Text className="text-gray-500 mb-5">Vérifiez les détails avant de confirmer</Text>

                        <View 
                            className="bg-white rounded-3xl overflow-hidden"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 12 },
                                shadowOpacity: 0.1,
                                shadowRadius: 32,
                                elevation: 12,
                            }}
                        >
                            {/* Header Gradient */}
                            <LinearGradient
                                colors={consultationType === 'online' ? ['#8B5CF6', '#7C3AED'] : [colors.primary[500], colors.primary[600]]}
                                className="p-6"
                            >
                                <View className="flex-row items-center gap-4">
                                    <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center">
                                        <Ionicons 
                                            name={consultationType === 'online' ? 'videocam' : 'business'} 
                                            size={32} 
                                            color="white" 
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white/70 text-sm">
                                            {consultationType === 'online' ? 'Téléconsultation' : 'Consultation au cabinet'}
                                        </Text>
                                        <Text className="text-white font-bold text-xl">
                                            Dr. {doctor?.first_name} {doctor?.last_name}
                                        </Text>
                                        <Text className="text-white/80">{doctor?.specialty}</Text>
                                    </View>
                                </View>
                            </LinearGradient>

                            {/* Details */}
                            <View className="p-6">
                                <View className="flex-row mb-4">
                                    <View className="flex-1 flex-row items-center gap-3">
                                        <View className="w-10 h-10 rounded-xl bg-primary-50 items-center justify-center">
                                            <Ionicons name="calendar" size={20} color={colors.primary[600]} />
                                        </View>
                                        <View>
                                            <Text className="text-gray-500 text-xs">Date</Text>
                                            <Text className="text-gray-800 font-semibold">
                                                {selectedDate?.toLocaleDateString('fr-FR', { 
                                                    weekday: 'short', 
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-1 flex-row items-center gap-3">
                                        <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center">
                                            <Ionicons name="time" size={20} color={colors.success} />
                                        </View>
                                        <View>
                                            <Text className="text-gray-500 text-xs">Heure</Text>
                                            <Text className="text-gray-800 font-semibold">{selectedTime}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Notes Input */}
                                <View className="mt-4 pt-4 border-t border-gray-100">
                                    <Text className="text-gray-600 font-medium mb-2">Notes pour le médecin</Text>
                                    <TextInput
                                        value={notes}
                                        onChangeText={setNotes}
                                        placeholder="Décrivez vos symptômes ou préoccupations..."
                                        placeholderTextColor={colors.gray[400]}
                                        multiline
                                        numberOfLines={4}
                                        className="bg-gray-50 rounded-2xl p-4 text-gray-800"
                                        style={{ textAlignVertical: 'top', minHeight: 100 }}
                                    />
                                </View>

                                {/* Price */}
                                <View className="mt-4 pt-4 border-t border-gray-100 flex-row items-center justify-between">
                                    <Text className="text-gray-600">Montant total</Text>
                                    <Text className="text-2xl font-bold text-primary-600">
                                        {getFee()} {doctor?.currency}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Cancellation Policy */}
                        <View className="mt-4 bg-yellow-50 rounded-2xl p-4 flex-row items-start gap-3">
                            <Ionicons name="shield-checkmark" size={22} color={colors.warning} />
                            <View className="flex-1">
                                <Text className="text-yellow-800 font-semibold">Politique d'annulation</Text>
                                <Text className="text-yellow-700 text-sm mt-1">
                                    Annulation gratuite jusqu'à 24h avant le rendez-vous.
                                </Text>
                            </View>
                        </View>
                    </Animatable.View>
                )}
            </ScrollView>

            {/* Bottom Button */}
            <View 
                className={`absolute bottom-0 left-0 right-0 p-5 ${isIOS ? 'pb-8' : 'pb-5'} bg-white`}
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -8 },
                    shadowOpacity: 0.1,
                    shadowRadius: 24,
                    elevation: 20,
                }}
            >
                {step === 'confirm' ? (
                    <TouchableOpacity
                        onPress={handleBooking}
                        disabled={booking}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={booking ? [colors.gray[400], colors.gray[500]] : [colors.success, '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="py-4 rounded-2xl flex-row items-center justify-center gap-3"
                            style={{
                                shadowColor: colors.success,
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.4,
                                shadowRadius: 16,
                                elevation: 10,
                            }}
                        >
                            {booking ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={24} color="white" />
                                    <Text className="text-white font-bold text-lg">Confirmer le rendez-vous</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={handleNextStep}
                        disabled={!canContinue()}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={!canContinue()
                                ? [colors.gray[300], colors.gray[400]]
                                : [colors.primary[500], colors.primary[600]]
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="py-4 rounded-2xl flex-row items-center justify-center gap-2"
                            style={canContinue() ? {
                                shadowColor: colors.primary[500],
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.3,
                                shadowRadius: 16,
                                elevation: 8,
                            } : {}}
                        >
                            <Text className="text-white font-bold text-lg">Continuer</Text>
                            <Ionicons name="arrow-forward" size={20} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}