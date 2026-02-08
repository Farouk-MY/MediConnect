/**
 * Booking Success Modal
 * 
 * Premium success modal shown after booking an appointment.
 * Features animated checkmark and confetti-like effects.
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { colors } from '@/lib/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BookingSuccessProps {
    visible: boolean;
    doctorName: string;
    consultationType: 'presentiel' | 'online';
    date: string;
    time: string;
    confirmationCode: string;
    onClose: () => void;
}

// Custom animations
const pulse = {
    0: { scale: 0, opacity: 0 },
    0.5: { scale: 1.2, opacity: 1 },
    1: { scale: 1, opacity: 1 }
};

const fadeInUp = {
    0: { opacity: 0, translateY: 30 },
    1: { opacity: 1, translateY: 0 }
};

export default function BookingSuccessModal({
    visible,
    doctorName,
    consultationType,
    date,
    time,
    confirmationCode,
    onClose
}: BookingSuccessProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <View className="flex-1 bg-black/60 items-center justify-center p-6">
                <Animatable.View 
                    animation="zoomIn" 
                    duration={400}
                    className="w-full max-w-sm bg-white rounded-3xl overflow-hidden"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 20 },
                        shadowOpacity: 0.25,
                        shadowRadius: 40,
                        elevation: 20,
                    }}
                >
                    {/* Header with animated checkmark */}
                    <LinearGradient
                        colors={[colors.success, '#059669']}
                        className="items-center py-8 px-6"
                    >
                        {/* Success circle */}
                        <Animatable.View 
                            animation={pulse}
                            duration={800}
                            className="w-24 h-24 rounded-full bg-white/20 items-center justify-center mb-4"
                        >
                            <View className="w-20 h-20 rounded-full bg-white items-center justify-center">
                                <Animatable.View 
                                    animation="bounceIn" 
                                    delay={400}
                                    duration={600}
                                >
                                    <Ionicons name="checkmark" size={48} color={colors.success} />
                                </Animatable.View>
                            </View>
                        </Animatable.View>
                        
                        <Animatable.Text 
                            animation={fadeInUp}
                            delay={300}
                            className="text-white text-2xl font-bold text-center"
                        >
                            Rendez-vous confirmé !
                        </Animatable.Text>
                        
                        <Animatable.Text 
                            animation={fadeInUp}
                            delay={400}
                            className="text-white/80 text-center mt-2"
                        >
                            Votre rendez-vous a été réservé avec succès
                        </Animatable.Text>
                    </LinearGradient>

                    {/* Details */}
                    <View className="p-6">
                        {/* Doctor Info */}
                        <Animatable.View 
                            animation={fadeInUp}
                            delay={500}
                            className="flex-row items-center gap-3 mb-4"
                        >
                            <View className="w-12 h-12 rounded-xl bg-primary-50 items-center justify-center">
                                <Ionicons name="person" size={24} color={colors.primary[600]} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-500 text-xs">Médecin</Text>
                                <Text className="text-gray-800 font-bold">{doctorName}</Text>
                            </View>
                        </Animatable.View>

                        {/* Date & Time */}
                        <Animatable.View 
                            animation={fadeInUp}
                            delay={600}
                            className="flex-row gap-3 mb-4"
                        >
                            <View className="flex-1 bg-gray-50 rounded-2xl p-3">
                                <View className="flex-row items-center gap-2 mb-1">
                                    <Ionicons name="calendar" size={16} color={colors.primary[600]} />
                                    <Text className="text-gray-500 text-xs">Date</Text>
                                </View>
                                <Text className="text-gray-800 font-semibold">{date}</Text>
                            </View>
                            <View className="flex-1 bg-gray-50 rounded-2xl p-3">
                                <View className="flex-row items-center gap-2 mb-1">
                                    <Ionicons name="time" size={16} color={colors.success} />
                                    <Text className="text-gray-500 text-xs">Heure</Text>
                                </View>
                                <Text className="text-gray-800 font-semibold">{time}</Text>
                            </View>
                        </Animatable.View>

                        {/* Consultation Type */}
                        <Animatable.View 
                            animation={fadeInUp}
                            delay={700}
                            className="flex-row items-center gap-3 mb-4"
                        >
                            <View className={`w-12 h-12 rounded-xl items-center justify-center ${
                                consultationType === 'online' ? 'bg-purple-50' : 'bg-blue-50'
                            }`}>
                                <Ionicons 
                                    name={consultationType === 'online' ? 'videocam' : 'business'} 
                                    size={24} 
                                    color={consultationType === 'online' ? '#8B5CF6' : colors.info} 
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-500 text-xs">Type</Text>
                                <Text className="text-gray-800 font-bold">
                                    {consultationType === 'online' ? 'Téléconsultation' : 'Au cabinet'}
                                </Text>
                            </View>
                        </Animatable.View>

                        {/* Confirmation Code */}
                        <Animatable.View 
                            animation={fadeInUp}
                            delay={800}
                            className="bg-green-50 rounded-2xl p-4 mb-6"
                        >
                            <Text className="text-green-800 text-xs font-medium text-center mb-1">
                                Code de confirmation
                            </Text>
                            <Text className="text-green-700 text-2xl font-bold text-center tracking-widest">
                                {confirmationCode}
                            </Text>
                        </Animatable.View>

                        {/* Close Button */}
                        <Animatable.View animation={fadeInUp} delay={900}>
                            <TouchableOpacity
                                onPress={onClose}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={[colors.primary[500], colors.primary[600]]}
                                    className="py-4 rounded-2xl items-center"
                                    style={{
                                        shadowColor: colors.primary[500],
                                        shadowOffset: { width: 0, height: 8 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 16,
                                        elevation: 8,
                                    }}
                                >
                                    <Text className="text-white font-bold text-lg">
                                        Voir mes rendez-vous
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animatable.View>

                        {/* Calendar reminder */}
                        <Animatable.View 
                            animation={fadeInUp}
                            delay={1000}
                            className="flex-row items-center justify-center gap-2 mt-4"
                        >
                            <Ionicons name="notifications-outline" size={16} color={colors.gray[400]} />
                            <Text className="text-gray-400 text-xs text-center">
                                Un rappel sera envoyé 24h avant le RDV
                            </Text>
                        </Animatable.View>
                    </View>
                </Animatable.View>
            </View>
        </Modal>
    );
}
