/**
 * Premium Doctor Card Component
 * 
 * A beautifully designed doctor card with glassmorphism effects,
 * gradient accents, and smooth animations for a premium feel.
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { colors } from '@/lib/constants/colors';
import { DoctorPublicProfile } from '@/lib/api/doctors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DoctorCardProps {
    doctor: DoctorPublicProfile;
    onPress?: () => void;
    compact?: boolean;
}

export default function DoctorCard({ doctor, onPress, compact = false }: DoctorCardProps) {
    const handlePress = () => {
        if (onPress) {
            onPress();
        }
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Ionicons key={i} name="star" size={11} color="#FBBF24" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<Ionicons key={i} name="star-half" size={11} color="#FBBF24" />);
            } else {
                stars.push(<Ionicons key={i} name="star-outline" size={11} color="#E5E7EB" />);
            }
        }
        return stars;
    };

    // Compact card for map popup
    if (compact) {
        return (
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.9}
                className="bg-white rounded-2xl p-3.5 flex-row items-center gap-3"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.15,
                    shadowRadius: 20,
                    elevation: 10,
                    width: 300,
                }}
            >
                {/* Avatar with gradient ring */}
                <View className="relative">
                    <LinearGradient
                        colors={[colors.primary[400], colors.primary[600]]}
                        className="w-16 h-16 rounded-2xl p-0.5"
                    >
                        <View className="w-full h-full rounded-[14px] overflow-hidden bg-white">
                            {doctor.avatar_url ? (
                                <Image
                                    source={{ uri: doctor.avatar_url }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <LinearGradient
                                    colors={[colors.primary[50], colors.primary[100]]}
                                    className="w-full h-full items-center justify-center"
                                >
                                    <Ionicons name="person" size={28} color={colors.primary[500]} />
                                </LinearGradient>
                            )}
                        </View>
                    </LinearGradient>
                    {/* Online indicator */}
                    {doctor.is_accepting_patients && (
                        <View className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                    )}
                </View>

                {/* Info */}
                <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-sm" numberOfLines={1}>
                        Dr. {doctor.first_name} {doctor.last_name}
                    </Text>
                    <View className="flex-row items-center gap-1 mt-0.5">
                        <View className="bg-primary-50 px-1.5 py-0.5 rounded">
                            <Text className="text-primary-600 text-[10px] font-semibold">{doctor.specialty}</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center gap-1 mt-1.5">
                        {renderStars(doctor.average_rating)}
                        <Text className="text-gray-500 text-[10px] font-medium ml-0.5">
                            {doctor.average_rating.toFixed(1)} • {doctor.total_consultations} consultations
                        </Text>
                    </View>
                </View>

                {/* Arrow */}
                <LinearGradient
                    colors={[colors.primary[500], colors.primary[600]]}
                    className="p-2.5 rounded-xl"
                >
                    <Ionicons name="arrow-forward" size={14} color="white" />
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    // Full premium card for list view
    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.95}
            className="bg-white rounded-[28px] overflow-hidden mb-4"
            style={{
                shadowColor: colors.primary[900],
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.08,
                shadowRadius: 30,
                elevation: 12,
            }}
        >
            {/* Subtle gradient accent at top */}
            <LinearGradient
                colors={[colors.primary[50], 'transparent']}
                className="absolute top-0 left-0 right-0 h-24"
            />

            {/* Main Content */}
            <View className="p-5">
                <View className="flex-row">
                    {/* Premium Avatar with gradient ring */}
                    <View className="mr-4">
                        <View className="relative">
                            <LinearGradient
                                colors={[colors.primary[400], colors.secondary[500]]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="w-[88px] h-[88px] rounded-3xl p-[3px]"
                                style={{
                                    shadowColor: colors.primary[500],
                                    shadowOffset: { width: 0, height: 6 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 12,
                                    elevation: 8,
                                }}
                            >
                                <View className="w-full h-full rounded-[22px] overflow-hidden bg-white">
                                    {doctor.avatar_url ? (
                                        <Image
                                            source={{ uri: doctor.avatar_url }}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <LinearGradient
                                            colors={[colors.primary[100], colors.primary[50]]}
                                            className="w-full h-full items-center justify-center"
                                        >
                                            <Ionicons name="person" size={44} color={colors.primary[500]} />
                                        </LinearGradient>
                                    )}
                                </View>
                            </LinearGradient>
                            
                            {/* Verified badge */}
                            <View 
                                className="absolute -bottom-1 -right-1 bg-white rounded-full p-1"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    elevation: 3,
                                }}
                            >
                                <LinearGradient
                                    colors={[colors.success, '#059669']}
                                    className="w-6 h-6 rounded-full items-center justify-center"
                                >
                                    <Ionicons name="checkmark" size={14} color="white" />
                                </LinearGradient>
                            </View>
                        </View>
                    </View>

                    {/* Doctor Info */}
                    <View className="flex-1">
                        <View className="flex-row items-start justify-between">
                            <View className="flex-1 pr-2">
                                <Text className="text-gray-900 font-bold text-[17px] tracking-tight">
                                    Dr. {doctor.first_name} {doctor.last_name}
                                </Text>
                                <View className="flex-row items-center gap-2 mt-1.5">
                                    <LinearGradient
                                        colors={[colors.primary[500], colors.primary[600]]}
                                        className="px-2.5 py-1 rounded-lg"
                                    >
                                        <Text className="text-white text-xs font-semibold">
                                            {doctor.specialty}
                                        </Text>
                                    </LinearGradient>
                                </View>
                            </View>

                            {/* Availability Status */}
                            {doctor.is_accepting_patients && (
                                <View className="bg-green-50 border border-green-100 px-2.5 py-1.5 rounded-xl flex-row items-center gap-1.5">
                                    <View className="w-2 h-2 rounded-full bg-green-500">
                                        <Animatable.View
                                            animation="pulse"
                                            iterationCount="infinite"
                                            className="w-2 h-2 rounded-full bg-green-400"
                                        />
                                    </View>
                                    <Text className="text-green-700 text-[10px] font-bold uppercase tracking-wide">
                                        Disponible
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Stats Row - Redesigned */}
                        <View className="flex-row items-center gap-4 mt-4">
                            {/* Rating */}
                            <View className="flex-row items-center gap-1 bg-yellow-50 px-2.5 py-1.5 rounded-xl">
                                <Ionicons name="star" size={13} color="#F59E0B" />
                                <Text className="text-yellow-700 text-xs font-bold">
                                    {doctor.average_rating.toFixed(1)}
                                </Text>
                            </View>

                            {/* Experience */}
                            <View className="flex-row items-center gap-1.5">
                                <View className="w-7 h-7 rounded-lg bg-blue-50 items-center justify-center">
                                    <Ionicons name="ribbon" size={14} color={colors.info} />
                                </View>
                                <Text className="text-gray-600 text-xs font-medium">
                                    {doctor.years_experience} ans
                                </Text>
                            </View>

                            {/* Consultations */}
                            <View className="flex-row items-center gap-1.5">
                                <View className="w-7 h-7 rounded-lg bg-purple-50 items-center justify-center">
                                    <Ionicons name="people" size={14} color="#8B5CF6" />
                                </View>
                                <Text className="text-gray-600 text-xs font-medium">
                                    {doctor.total_consultations}+
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Divider with gradient */}
            <View className="h-px mx-5 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Bottom Section - Redesigned */}
            <View className="px-5 py-4 flex-row items-center justify-between">
                {/* Location */}
                <View className="flex-row items-center gap-2 flex-1">
                    <View className="w-8 h-8 rounded-xl bg-gray-100 items-center justify-center">
                        <Ionicons name="location" size={16} color={colors.gray[500]} />
                    </View>
                    <Text className="text-gray-500 text-sm font-medium" numberOfLines={1}>
                        {doctor.cabinet_city || 'Non spécifié'}
                    </Text>
                </View>

                {/* Pricing Tags */}
                <View className="flex-row items-center gap-2">
                    {doctor.offers_presentiel && (
                        <View 
                            className="px-3 py-2 rounded-xl flex-row items-center gap-1.5"
                            style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)' }}
                        >
                            <Ionicons name="business" size={13} color={colors.primary[600]} />
                            <Text className="text-primary-600 text-xs font-bold">
                                {doctor.consultation_fee_presentiel}
                            </Text>
                            <Text className="text-primary-400 text-[10px]">{doctor.currency}</Text>
                        </View>
                    )}
                    {doctor.offers_online && (
                        <View 
                            className="px-3 py-2 rounded-xl flex-row items-center gap-1.5"
                            style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)' }}
                        >
                            <Ionicons name="videocam" size={13} color="#8B5CF6" />
                            <Text className="text-purple-600 text-xs font-bold">
                                {doctor.consultation_fee_online}
                            </Text>
                            <Text className="text-purple-400 text-[10px]">{doctor.currency}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Book Now CTA - Subtle */}
            <View className="px-5 pb-5">
                <LinearGradient
                    colors={[colors.primary[500], colors.primary[600]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="py-3.5 rounded-2xl flex-row items-center justify-center gap-2"
                    style={{
                        shadowColor: colors.primary[500],
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.25,
                        shadowRadius: 12,
                        elevation: 6,
                    }}
                >
                    <Text className="text-white font-bold text-sm">Prendre rendez-vous</Text>
                    <Ionicons name="arrow-forward" size={16} color="white" />
                </LinearGradient>
            </View>
        </TouchableOpacity>
    );
}
