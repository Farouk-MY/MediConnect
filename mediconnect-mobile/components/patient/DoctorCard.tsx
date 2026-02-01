import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/constants/colors';
import { DoctorPublicProfile } from '@/lib/api/doctors';

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
        // If no onPress provided, do nothing - navigation should be handled by parent
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <Ionicons key={i} name="star" size={12} color="#FBBF24" />
                );
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <Ionicons key={i} name="star-half" size={12} color="#FBBF24" />
                );
            } else {
                stars.push(
                    <Ionicons key={i} name="star-outline" size={12} color="#D1D5DB" />
                );
            }
        }
        return stars;
    };

    if (compact) {
        // Compact card for map popup
        return (
            <TouchableOpacity
                onPress={handlePress}
                className="bg-white rounded-2xl p-3 flex-row items-center gap-3"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 5,
                    width: 280,
                }}
            >
                {/* Avatar */}
                <View className="w-14 h-14 rounded-xl overflow-hidden bg-primary-100">
                    {doctor.avatar_url ? (
                        <Image
                            source={{ uri: doctor.avatar_url }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-full h-full items-center justify-center">
                            <Ionicons name="person" size={28} color={colors.primary[600]} />
                        </View>
                    )}
                </View>

                {/* Info */}
                <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-sm" numberOfLines={1}>
                        Dr. {doctor.first_name} {doctor.last_name}
                    </Text>
                    <Text className="text-gray-500 text-xs" numberOfLines={1}>
                        {doctor.specialty}
                    </Text>
                    <View className="flex-row items-center gap-1 mt-1">
                        {renderStars(doctor.average_rating)}
                        <Text className="text-gray-600 text-xs ml-1">
                            ({doctor.average_rating.toFixed(1)})
                        </Text>
                    </View>
                </View>

                {/* Arrow */}
                <View className="bg-primary-50 p-2 rounded-lg">
                    <Ionicons name="chevron-forward" size={16} color={colors.primary[600]} />
                </View>
            </TouchableOpacity>
        );
    }

    // Full card for list view
    return (
        <TouchableOpacity
            onPress={handlePress}
            className="bg-white rounded-3xl overflow-hidden mb-4"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 24,
                elevation: 8,
            }}
        >
            {/* Top Section */}
            <View className="p-4 flex-row">
                {/* Avatar with gradient border */}
                <View
                    className="w-20 h-20 rounded-2xl p-0.5 mr-4"
                    style={{
                        backgroundColor: colors.primary[100],
                    }}
                >
                    <View className="w-full h-full rounded-xl overflow-hidden bg-white">
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
                                <Ionicons name="person" size={40} color={colors.primary[600]} />
                            </LinearGradient>
                        )}
                    </View>
                </View>

                {/* Doctor Info */}
                <View className="flex-1">
                    <View className="flex-row items-start justify-between">
                        <View className="flex-1">
                            <Text className="text-gray-900 font-bold text-lg">
                                Dr. {doctor.first_name} {doctor.last_name}
                            </Text>
                            <Text className="text-primary-600 font-medium text-sm mt-0.5">
                                {doctor.specialty}
                            </Text>
                        </View>

                        {/* Availability Badge */}
                        {doctor.is_accepting_patients && (
                            <View className="bg-green-50 px-2 py-1 rounded-full flex-row items-center gap-1">
                                <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <Text className="text-green-700 text-xs font-medium">Available</Text>
                            </View>
                        )}
                    </View>

                    {/* Stats Row */}
                    <View className="flex-row items-center gap-4 mt-3">
                        {/* Rating */}
                        <View className="flex-row items-center gap-1">
                            {renderStars(doctor.average_rating)}
                            <Text className="text-gray-600 text-xs font-medium ml-1">
                                {doctor.average_rating.toFixed(1)}
                            </Text>
                        </View>

                        {/* Experience */}
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="briefcase-outline" size={12} color={colors.gray[500]} />
                            <Text className="text-gray-500 text-xs">
                                {doctor.years_experience}+ yrs
                            </Text>
                        </View>

                        {/* Consultations */}
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="people-outline" size={12} color={colors.gray[500]} />
                            <Text className="text-gray-500 text-xs">
                                {doctor.total_consultations}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-gray-100 mx-4" />

            {/* Bottom Section */}
            <View className="p-4 flex-row items-center justify-between">
                {/* Location */}
                <View className="flex-row items-center gap-1.5 flex-1">
                    <Ionicons name="location-outline" size={14} color={colors.gray[500]} />
                    <Text className="text-gray-500 text-sm" numberOfLines={1}>
                        {doctor.cabinet_city || 'Location not set'}
                    </Text>
                </View>

                {/* Consultation Types */}
                <View className="flex-row items-center gap-2">
                    {doctor.offers_presentiel && (
                        <View className="flex-row items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg">
                            <Ionicons name="business-outline" size={12} color={colors.primary[600]} />
                            <Text className="text-primary-600 text-xs font-medium">
                                {doctor.consultation_fee_presentiel} {doctor.currency}
                            </Text>
                        </View>
                    )}
                    {doctor.offers_online && (
                        <View className="flex-row items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg">
                            <Ionicons name="videocam-outline" size={12} color="#8B5CF6" />
                            <Text className="text-purple-600 text-xs font-medium">
                                {doctor.consultation_fee_online} {doctor.currency}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}
