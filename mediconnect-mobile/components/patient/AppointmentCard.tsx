import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/lib/constants/colors';
import { Appointment } from '@/lib/api/appointments';
import StatusBadge from '@/components/ui/StatusBadge';

interface AppointmentCardProps {
    appointment: Appointment;
    onCancel?: () => void;
    onReschedule?: () => void;
}

export default function AppointmentCard({ appointment, onCancel, onReschedule }: AppointmentCardProps) {
    const router = useRouter();
    
    const appointmentDate = new Date(appointment.appointment_date);
    const isUpcoming = appointmentDate > new Date();
    const isPast = appointmentDate < new Date();
    
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const handleJoinCall = () => {
        if (appointment.video_call_link) {
            // Navigate to video call or open link
            router.push(`/(patient)/consultation/${appointment.id}`);
        }
    };

    return (
        <View 
            className="bg-white rounded-3xl overflow-hidden mb-4"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
                elevation: 6,
            }}
        >
            {/* Header with date and status */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <View className="flex-row items-center gap-2">
                    <Ionicons name="calendar-outline" size={16} color={colors.gray[500]} />
                    <Text className="text-gray-600 font-medium">
                        {formatDate(appointmentDate)} • {formatTime(appointmentDate)}
                    </Text>
                </View>
                <StatusBadge status={appointment.status} />
            </View>

            {/* Main content */}
            <View className="p-4">
                {/* Doctor Info */}
                <View className="flex-row items-center gap-3 mb-4">
                    <View className="w-14 h-14 rounded-2xl bg-primary-100 items-center justify-center">
                        {appointment.doctor?.avatar_url ? (
                            <Image 
                                source={{ uri: appointment.doctor.avatar_url }}
                                className="w-full h-full rounded-2xl"
                            />
                        ) : (
                            <Ionicons name="person" size={28} color={colors.primary[600]} />
                        )}
                    </View>
                    <View className="flex-1">
                        <Text className="text-gray-800 font-bold text-lg">
                            Dr. {appointment.doctor?.first_name} {appointment.doctor?.last_name}
                        </Text>
                        <Text className="text-gray-500 text-sm">{appointment.doctor?.specialty}</Text>
                    </View>
                </View>

                {/* Consultation Type & Location */}
                <View className="flex-row items-center gap-4 mb-4">
                    <View className="flex-row items-center gap-2">
                        <View className={`p-2 rounded-lg ${
                            appointment.consultation_type === 'online' ? 'bg-purple-50' : 'bg-blue-50'
                        }`}>
                            <Ionicons 
                                name={appointment.consultation_type === 'online' ? 'videocam' : 'business'} 
                                size={18} 
                                color={appointment.consultation_type === 'online' ? '#8B5CF6' : colors.primary[600]} 
                            />
                        </View>
                        <Text className="text-gray-600 font-medium">
                            {appointment.consultation_type === 'online' ? 'Video Call' : 'In-Person'}
                        </Text>
                    </View>

                    {appointment.consultation_type === 'presentiel' && appointment.doctor?.cabinet_city && (
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="location-outline" size={16} color={colors.gray[500]} />
                            <Text className="text-gray-500 text-sm">{appointment.doctor.cabinet_city}</Text>
                        </View>
                    )}
                </View>

                {/* Confirmation Code */}
                {appointment.confirmation_code && (
                    <View className="bg-gray-50 rounded-xl p-3 mb-4 flex-row items-center gap-2">
                        <Ionicons name="key-outline" size={18} color={colors.gray[500]} />
                        <Text className="text-gray-500 text-sm">Confirmation Code:</Text>
                        <Text className="text-gray-800 font-bold">{appointment.confirmation_code}</Text>
                    </View>
                )}

                {/* Price */}
                <View className="flex-row items-center justify-between">
                    <Text className="text-gray-500">Consultation Fee</Text>
                    <Text className="text-primary-600 font-bold text-lg">
                        {appointment.consultation_fee} {appointment.currency}
                    </Text>
                </View>
            </View>

            {/* Action Buttons */}
            {isUpcoming && appointment.status !== 'cancelled' && (
                <View className="px-4 pb-4 gap-3">
                    {/* Join Video Call (if online and confirmed) */}
                    {appointment.consultation_type === 'online' && 
                     appointment.status === 'confirmed' && 
                     appointment.can_join_video && (
                        <TouchableOpacity
                            onPress={handleJoinCall}
                            className="rounded-xl overflow-hidden"
                        >
                            <LinearGradient
                                colors={['#8B5CF6', '#7C3AED']}
                                className="py-3 flex-row items-center justify-center gap-2"
                            >
                                <Ionicons name="videocam" size={20} color="white" />
                                <Text className="text-white font-bold">Join Video Call</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    {/* Cancel / Reschedule buttons */}
                    <View className="flex-row gap-3">
                        {appointment.is_modifiable && onReschedule && (
                            <TouchableOpacity
                                onPress={onReschedule}
                                className="flex-1 bg-gray-100 py-3 rounded-xl flex-row items-center justify-center gap-2"
                            >
                                <Ionicons name="calendar-outline" size={18} color={colors.gray[700]} />
                                <Text className="text-gray-700 font-semibold">Reschedule</Text>
                            </TouchableOpacity>
                        )}

                        {appointment.is_cancellable && onCancel && (
                            <TouchableOpacity
                                onPress={onCancel}
                                className="flex-1 bg-red-50 py-3 rounded-xl flex-row items-center justify-center gap-2"
                            >
                                <Ionicons name="close-circle-outline" size={18} color={colors.error} />
                                <Text className="text-red-600 font-semibold">Cancel</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
}
