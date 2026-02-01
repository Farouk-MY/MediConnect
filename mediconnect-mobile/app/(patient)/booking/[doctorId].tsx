import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    ActivityIndicator,
    Alert,
    TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { colors } from '@/lib/constants/colors';
import { doctorsApi, DoctorPublicProfile } from '@/lib/api/doctors';
import { appointmentsApi, ConsultationType } from '@/lib/api/appointments';

// Generate next 14 days
const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date);
    }
    return dates;
};

// Generate time slots (9 AM - 6 PM)
const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type BookingStep = 'type' | 'date' | 'time' | 'confirm';

export default function BookingScreen() {
    const { doctorId } = useLocalSearchParams<{ doctorId: string }>();
    const router = useRouter();

    // State
    const [step, setStep] = useState<BookingStep>('type');
    const [doctor, setDoctor] = useState<DoctorPublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);

    // Selection state
    const [consultationType, setConsultationType] = useState<ConsultationType | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [notes, setNotes] = useState('');

    const dates = generateDates();
    const timeSlots = generateTimeSlots();

    useEffect(() => {
        fetchDoctor();
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

    const handleNextStep = () => {
        if (step === 'type' && consultationType) {
            setStep('date');
        } else if (step === 'date' && selectedDate) {
            setStep('time');
        } else if (step === 'time' && selectedTime) {
            setStep('confirm');
        }
    };

    const handlePrevStep = () => {
        if (step === 'date') setStep('type');
        else if (step === 'time') setStep('date');
        else if (step === 'confirm') setStep('time');
        else router.back();
    };

    const handleBooking = async () => {
        if (!selectedDate || !selectedTime || !consultationType) return;

        try {
            setBooking(true);

            // Combine date and time
            const appointmentDate = new Date(selectedDate);
            const [hours, minutes] = selectedTime.split(':').map(Number);
            appointmentDate.setHours(hours, minutes, 0, 0);

            const result = await appointmentsApi.createAppointment({
                doctor_id: doctorId,
                appointment_date: appointmentDate.toISOString(),
                consultation_type: consultationType,
                notes: notes || undefined,
            });

            // Show success and navigate
            Alert.alert(
                '🎉 Booking Confirmed!',
                `Your appointment with Dr. ${doctor?.first_name} is scheduled.\n\nConfirmation Code: ${result.confirmation_code}`,
                [
                    {
                        text: 'View My Appointments',
                        onPress: () => router.replace('/(patient)/(tabs)/appointments'),
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert(
                'Booking Failed',
                error.response?.data?.detail || 'Unable to book appointment. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setBooking(false);
        }
    };

    const getFee = () => {
        if (!doctor || !consultationType) return 0;
        return consultationType === 'presentiel' 
            ? doctor.consultation_fee_presentiel 
            : doctor.consultation_fee_online;
    };

    const getStepTitle = () => {
        switch (step) {
            case 'type': return 'Choose Consultation Type';
            case 'date': return 'Select Date';
            case 'time': return 'Select Time';
            case 'confirm': return 'Confirm Booking';
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
            {/* Header */}
            <LinearGradient
                colors={[colors.primary[600], colors.primary[500]]}
                className="pt-14 pb-6 px-5"
            >
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity 
                        onPress={handlePrevStep}
                        className="bg-white/20 p-2 rounded-xl"
                    >
                        <Ionicons name="arrow-back" size={22} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold">Book Appointment</Text>
                    <View className="w-10" />
                </View>

                {/* Progress Steps */}
                <View className="flex-row items-center justify-center mt-6 gap-2">
                    {['type', 'date', 'time', 'confirm'].map((s, index) => (
                        <React.Fragment key={s}>
                            <View 
                                className={`w-8 h-8 rounded-full items-center justify-center ${
                                    step === s ? 'bg-white' : 
                                    ['type', 'date', 'time', 'confirm'].indexOf(step) > index 
                                        ? 'bg-white/80' : 'bg-white/30'
                                }`}
                            >
                                <Text className={`font-bold ${
                                    step === s ? 'text-primary-600' : 
                                    ['type', 'date', 'time', 'confirm'].indexOf(step) > index 
                                        ? 'text-primary-600' : 'text-white/70'
                                }`}>
                                    {index + 1}
                                </Text>
                            </View>
                            {index < 3 && (
                                <View className={`w-8 h-1 rounded-full ${
                                    ['type', 'date', 'time', 'confirm'].indexOf(step) > index 
                                        ? 'bg-white/80' : 'bg-white/30'
                                }`} />
                            )}
                        </React.Fragment>
                    ))}
                </View>

                <Text className="text-white/90 text-center mt-4 text-base">
                    {getStepTitle()}
                </Text>
            </LinearGradient>

            <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Step 1: Consultation Type */}
                {step === 'type' && (
                    <Animatable.View animation="fadeInRight" duration={400}>
                        <Text className="text-gray-600 mb-4">
                            How would you like to consult with Dr. {doctor?.first_name}?
                        </Text>
                        
                        <View className="gap-4">
                            {doctor?.offers_presentiel && (
                                <TouchableOpacity
                                    onPress={() => setConsultationType('presentiel')}
                                    className={`p-5 rounded-2xl border-2 ${
                                        consultationType === 'presentiel'
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 bg-white'
                                    }`}
                                    style={{
                                        shadowColor: consultationType === 'presentiel' ? colors.primary[500] : '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: consultationType === 'presentiel' ? 0.2 : 0.05,
                                        shadowRadius: 12,
                                        elevation: consultationType === 'presentiel' ? 8 : 2,
                                    }}
                                >
                                    <View className="flex-row items-center gap-4">
                                        <View className={`p-4 rounded-xl ${
                                            consultationType === 'presentiel' ? 'bg-primary-100' : 'bg-gray-100'
                                        }`}>
                                            <Ionicons 
                                                name="business" 
                                                size={32} 
                                                color={consultationType === 'presentiel' ? colors.primary[600] : colors.gray[500]} 
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text className={`text-lg font-bold ${
                                                consultationType === 'presentiel' ? 'text-primary-700' : 'text-gray-800'
                                            }`}>
                                                In-Person Visit
                                            </Text>
                                            <Text className="text-gray-500 text-sm mt-1">
                                                Visit the doctor at their cabinet
                                            </Text>
                                            <Text className="text-primary-600 font-bold text-lg mt-2">
                                                {doctor?.consultation_fee_presentiel} {doctor?.currency}
                                            </Text>
                                        </View>
                                        {consultationType === 'presentiel' && (
                                            <Ionicons name="checkmark-circle" size={28} color={colors.primary[600]} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            )}

                            {doctor?.offers_online && (
                                <TouchableOpacity
                                    onPress={() => setConsultationType('online')}
                                    className={`p-5 rounded-2xl border-2 ${
                                        consultationType === 'online'
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 bg-white'
                                    }`}
                                    style={{
                                        shadowColor: consultationType === 'online' ? '#8B5CF6' : '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: consultationType === 'online' ? 0.2 : 0.05,
                                        shadowRadius: 12,
                                        elevation: consultationType === 'online' ? 8 : 2,
                                    }}
                                >
                                    <View className="flex-row items-center gap-4">
                                        <View className={`p-4 rounded-xl ${
                                            consultationType === 'online' ? 'bg-purple-100' : 'bg-gray-100'
                                        }`}>
                                            <Ionicons 
                                                name="videocam" 
                                                size={32} 
                                                color={consultationType === 'online' ? '#8B5CF6' : colors.gray[500]} 
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text className={`text-lg font-bold ${
                                                consultationType === 'online' ? 'text-purple-700' : 'text-gray-800'
                                            }`}>
                                                Video Consultation
                                            </Text>
                                            <Text className="text-gray-500 text-sm mt-1">
                                                Connect via secure video call
                                            </Text>
                                            <Text className="text-purple-600 font-bold text-lg mt-2">
                                                {doctor?.consultation_fee_online} {doctor?.currency}
                                            </Text>
                                        </View>
                                        {consultationType === 'online' && (
                                            <Ionicons name="checkmark-circle" size={28} color="#8B5CF6" />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    </Animatable.View>
                )}

                {/* Step 2: Select Date */}
                {step === 'date' && (
                    <Animatable.View animation="fadeInRight" duration={400}>
                        <Text className="text-gray-600 mb-4">
                            Choose a date for your appointment
                        </Text>

                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            className="-mx-5 px-5 mb-6"
                        >
                            <View className="flex-row gap-3">
                                {dates.map((date, index) => {
                                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                                    const isToday = date.toDateString() === new Date().toDateString();
                                    
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => setSelectedDate(date)}
                                            className={`w-20 py-4 rounded-2xl items-center ${
                                                isSelected
                                                    ? 'bg-primary-600'
                                                    : 'bg-white border border-gray-200'
                                            }`}
                                            style={{
                                                shadowColor: isSelected ? colors.primary[600] : '#000',
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: isSelected ? 0.3 : 0.05,
                                                shadowRadius: 8,
                                                elevation: isSelected ? 6 : 2,
                                            }}
                                        >
                                            <Text className={`text-xs font-medium ${
                                                isSelected ? 'text-white/80' : 'text-gray-500'
                                            }`}>
                                                {DAYS[date.getDay()]}
                                            </Text>
                                            <Text className={`text-2xl font-bold ${
                                                isSelected ? 'text-white' : 'text-gray-800'
                                            }`}>
                                                {date.getDate()}
                                            </Text>
                                            <Text className={`text-xs font-medium ${
                                                isSelected ? 'text-white/80' : 'text-gray-500'
                                            }`}>
                                                {MONTHS[date.getMonth()]}
                                            </Text>
                                            {isToday && (
                                                <View className={`mt-2 px-2 py-0.5 rounded-full ${
                                                    isSelected ? 'bg-white/30' : 'bg-primary-100'
                                                }`}>
                                                    <Text className={`text-xs font-medium ${
                                                        isSelected ? 'text-white' : 'text-primary-600'
                                                    }`}>
                                                        Today
                                                    </Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>

                        {selectedDate && (
                            <View className="bg-primary-50 rounded-2xl p-4 flex-row items-center gap-3">
                                <Ionicons name="calendar" size={24} color={colors.primary[600]} />
                                <Text className="text-primary-700 font-semibold flex-1">
                                    {selectedDate.toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        month: 'long', 
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </Text>
                            </View>
                        )}
                    </Animatable.View>
                )}

                {/* Step 3: Select Time */}
                {step === 'time' && (
                    <Animatable.View animation="fadeInRight" duration={400}>
                        <Text className="text-gray-600 mb-4">
                            Pick a time slot
                        </Text>

                        <View className="flex-row flex-wrap gap-3">
                            {timeSlots.map((slot) => {
                                const isSelected = selectedTime === slot;
                                
                                return (
                                    <TouchableOpacity
                                        key={slot}
                                        onPress={() => setSelectedTime(slot)}
                                        className={`px-5 py-3 rounded-xl ${
                                            isSelected
                                                ? 'bg-primary-600'
                                                : 'bg-white border border-gray-200'
                                        }`}
                                        style={{
                                            shadowColor: isSelected ? colors.primary[600] : '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: isSelected ? 0.3 : 0.05,
                                            shadowRadius: 6,
                                            elevation: isSelected ? 4 : 1,
                                        }}
                                    >
                                        <Text className={`font-semibold ${
                                            isSelected ? 'text-white' : 'text-gray-700'
                                        }`}>
                                            {slot}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </Animatable.View>
                )}

                {/* Step 4: Confirmation */}
                {step === 'confirm' && (
                    <Animatable.View animation="fadeInRight" duration={400}>
                        <Text className="text-gray-600 mb-4">
                            Review your appointment details
                        </Text>

                        <View 
                            className="bg-white rounded-3xl p-5"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.1,
                                shadowRadius: 24,
                                elevation: 8,
                            }}
                        >
                            {/* Doctor */}
                            <View className="flex-row items-center gap-4 pb-4 border-b border-gray-100">
                                <View className="w-14 h-14 rounded-xl bg-primary-100 items-center justify-center">
                                    <Ionicons name="person" size={28} color={colors.primary[600]} />
                                </View>
                                <View>
                                    <Text className="text-gray-800 font-bold text-lg">
                                        Dr. {doctor?.first_name} {doctor?.last_name}
                                    </Text>
                                    <Text className="text-gray-500">{doctor?.specialty}</Text>
                                </View>
                            </View>

                            {/* Details */}
                            <View className="py-4 gap-3">
                                <View className="flex-row items-center gap-3">
                                    <View className="w-10 h-10 rounded-lg bg-blue-50 items-center justify-center">
                                        <Ionicons 
                                            name={consultationType === 'online' ? 'videocam' : 'business'} 
                                            size={20} 
                                            color={consultationType === 'online' ? '#8B5CF6' : colors.primary[600]} 
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-gray-500 text-sm">Type</Text>
                                        <Text className="text-gray-800 font-semibold">
                                            {consultationType === 'online' ? 'Video Consultation' : 'In-Person Visit'}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center gap-3">
                                    <View className="w-10 h-10 rounded-lg bg-green-50 items-center justify-center">
                                        <Ionicons name="calendar" size={20} color={colors.success} />
                                    </View>
                                    <View>
                                        <Text className="text-gray-500 text-sm">Date</Text>
                                        <Text className="text-gray-800 font-semibold">
                                            {selectedDate?.toLocaleDateString('en-US', { 
                                                weekday: 'short', 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center gap-3">
                                    <View className="w-10 h-10 rounded-lg bg-yellow-50 items-center justify-center">
                                        <Ionicons name="time" size={20} color={colors.warning} />
                                    </View>
                                    <View>
                                        <Text className="text-gray-500 text-sm">Time</Text>
                                        <Text className="text-gray-800 font-semibold">{selectedTime}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Notes */}
                            <View className="pt-4 border-t border-gray-100">
                                <Text className="text-gray-600 font-medium mb-2">Notes (optional)</Text>
                                <TextInput
                                    value={notes}
                                    onChangeText={setNotes}
                                    placeholder="Any specific concerns or symptoms..."
                                    placeholderTextColor={colors.gray[400]}
                                    multiline
                                    numberOfLines={3}
                                    className="bg-gray-50 rounded-xl p-4 text-gray-800"
                                    style={{ textAlignVertical: 'top' }}
                                />
                            </View>

                            {/* Price */}
                            <View className="mt-4 pt-4 border-t border-gray-100 flex-row items-center justify-between">
                                <Text className="text-gray-600">Consultation Fee</Text>
                                <Text className="text-2xl font-bold text-primary-600">
                                    {getFee()} {doctor?.currency}
                                </Text>
                            </View>
                        </View>

                        {/* Cancellation Policy */}
                        <View className="mt-4 bg-yellow-50 rounded-xl p-4 flex-row gap-3">
                            <Ionicons name="information-circle" size={24} color={colors.warning} />
                            <Text className="text-yellow-700 flex-1 text-sm">
                                Free cancellation up to 24 hours before the appointment. Late cancellations may be subject to a fee.
                            </Text>
                        </View>
                    </Animatable.View>
                )}
            </ScrollView>

            {/* Bottom Button */}
            <View 
                className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 10,
                }}
            >
                {step === 'confirm' ? (
                    <TouchableOpacity
                        onPress={handleBooking}
                        disabled={booking}
                        className="rounded-2xl overflow-hidden"
                    >
                        <LinearGradient
                            colors={booking ? [colors.gray[400], colors.gray[500]] : [colors.success, '#059669']}
                            className="py-4 flex-row items-center justify-center gap-3"
                        >
                            {booking ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={22} color="white" />
                                    <Text className="text-white font-bold text-lg">Confirm Booking</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={handleNextStep}
                        disabled={
                            (step === 'type' && !consultationType) ||
                            (step === 'date' && !selectedDate) ||
                            (step === 'time' && !selectedTime)
                        }
                        className="rounded-2xl overflow-hidden"
                    >
                        <LinearGradient
                            colors={
                                ((step === 'type' && !consultationType) ||
                                (step === 'date' && !selectedDate) ||
                                (step === 'time' && !selectedTime))
                                    ? [colors.gray[300], colors.gray[400]]
                                    : [colors.primary[600], colors.primary[700]]
                            }
                            className="py-4 flex-row items-center justify-center gap-2"
                        >
                            <Text className="text-white font-bold text-lg">Continue</Text>
                            <Ionicons name="arrow-forward" size={20} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}