/**
 * Premium Doctor Card Component
 * 
 * A beautifully designed doctor card with glassmorphism effects,
 * gradient accents, and smooth animations for a premium feel.
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, StyleSheet } from 'react-native';
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

    // Compact card for map popup
    if (compact) {
        return (
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.9}
                style={styles.compactCard}
            >
                {/* Avatar with gradient border */}
                <View style={styles.compactAvatarContainer}>
                    <LinearGradient
                        colors={[colors.primary[400], colors.primary[600]]}
                        style={styles.compactAvatarGradient}
                    >
                        <View style={styles.compactAvatarInner}>
                            {doctor.avatar_url ? (
                                <Image
                                    source={{ uri: doctor.avatar_url }}
                                    style={styles.compactAvatarImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <LinearGradient
                                    colors={[colors.primary[50], colors.primary[100]]}
                                    style={styles.compactAvatarPlaceholder}
                                >
                                    <Ionicons name="person" size={28} color={colors.primary[500]} />
                                </LinearGradient>
                            )}
                        </View>
                    </LinearGradient>
                    {doctor.is_accepting_patients && (
                        <View style={styles.compactOnlineIndicator} />
                    )}
                </View>

                {/* Info */}
                <View style={styles.compactInfo}>
                    <Text style={styles.compactName} numberOfLines={1}>
                        Dr. {doctor.first_name} {doctor.last_name}
                    </Text>
                    <View style={styles.compactSpecialtyRow}>
                        <View style={[styles.compactSpecialtyBadge, { backgroundColor: colors.primary[50] }]}>
                            <Text style={[styles.compactSpecialtyText, { color: colors.primary[600] }]}>
                                {doctor.specialty}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.compactStatsRow}>
                        <Ionicons name="star" size={12} color="#FBBF24" />
                        <Text style={styles.compactRating}>{doctor.average_rating.toFixed(1)}</Text>
                        <Text style={styles.compactDivider}>•</Text>
                        <Text style={styles.compactStats}>{doctor.total_consultations} consultations</Text>
                    </View>
                </View>

                {/* Arrow */}
                <LinearGradient
                    colors={[colors.primary[500], colors.primary[600]]}
                    style={styles.compactArrow}
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
            style={styles.card}
        >
            {/* Top Section with Avatar and Info */}
            <View style={styles.cardHeader}>
                {/* Premium Avatar */}
                <View style={styles.avatarSection}>
                    <LinearGradient
                        colors={[colors.primary[400], colors.secondary[500]]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.avatarGradientRing}
                    >
                        <View style={styles.avatarInner}>
                            {doctor.avatar_url ? (
                                <Image
                                    source={{ uri: doctor.avatar_url }}
                                    style={styles.avatarImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <LinearGradient
                                    colors={[colors.primary[100], colors.primary[50]]}
                                    style={styles.avatarPlaceholder}
                                >
                                    <Ionicons name="person" size={40} color={colors.primary[500]} />
                                </LinearGradient>
                            )}
                        </View>
                    </LinearGradient>
                    
                    {/* Verified badge */}
                    <View style={styles.verifiedBadge}>
                        <LinearGradient
                            colors={[colors.success, '#059669']}
                            style={styles.verifiedBadgeInner}
                        >
                            <Ionicons name="checkmark" size={12} color="white" />
                        </LinearGradient>
                    </View>
                </View>

                {/* Doctor Info */}
                <View style={styles.infoSection}>
                    {/* Name and Status Row */}
                    <View style={styles.nameStatusRow}>
                        <Text style={styles.doctorName} numberOfLines={1}>
                            Dr. {doctor.first_name} {doctor.last_name}
                        </Text>
                        {doctor.is_accepting_patients && (
                            <View style={styles.availabilityBadge}>
                                <View style={styles.availabilityDot}>
                                    <Animatable.View
                                        animation="pulse"
                                        iterationCount="infinite"
                                        style={styles.availabilityPulse}
                                    />
                                </View>
                                <Text style={styles.availabilityText}>DISPONIBLE</Text>
                            </View>
                        )}
                    </View>

                    {/* Specialty Badge */}
                    <View style={styles.specialtyContainer}>
                        <LinearGradient
                            colors={[colors.primary[500], colors.primary[600]]}
                            style={styles.specialtyBadge}
                        >
                            <Text style={styles.specialtyText}>{doctor.specialty}</Text>
                        </LinearGradient>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        {/* Rating */}
                        <View style={styles.statItem}>
                            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                                <Ionicons name="star" size={14} color="#F59E0B" />
                            </View>
                            <Text style={styles.statValue}>{doctor.average_rating.toFixed(1)}</Text>
                        </View>

                        {/* Experience */}
                        <View style={styles.statItem}>
                            <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
                                <Ionicons name="ribbon" size={14} color="#3B82F6" />
                            </View>
                            <Text style={styles.statValue}>{doctor.years_experience} ans</Text>
                        </View>

                        {/* Consultations */}
                        <View style={styles.statItem}>
                            <View style={[styles.statIcon, { backgroundColor: '#EDE9FE' }]}>
                                <Ionicons name="people" size={14} color="#8B5CF6" />
                            </View>
                            <Text style={styles.statValue}>{doctor.total_consultations}+</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Bottom Section - Location and Pricing */}
            <View style={styles.cardFooter}>
                {/* Location */}
                <View style={styles.locationRow}>
                    <View style={styles.locationIcon}>
                        <Ionicons name="location" size={16} color={colors.gray[500]} />
                    </View>
                    <Text style={styles.locationText} numberOfLines={1}>
                        {doctor.cabinet_city || 'Non spécifié'}
                    </Text>
                </View>

                {/* Pricing Tags */}
                <View style={styles.pricingRow}>
                    {doctor.offers_presentiel && (
                        <View style={styles.priceTag}>
                            <View style={[styles.priceTagContent, { backgroundColor: 'rgba(59, 130, 246, 0.08)' }]}>
                                <Ionicons name="business" size={14} color={colors.primary[600]} />
                                <Text style={[styles.priceValue, { color: colors.primary[600] }]}>
                                    {doctor.consultation_fee_presentiel}
                                </Text>
                                <Text style={[styles.priceCurrency, { color: colors.primary[400] }]}>
                                    {doctor.currency}
                                </Text>
                            </View>
                        </View>
                    )}
                    {doctor.offers_online && (
                        <View style={styles.priceTag}>
                            <View style={[styles.priceTagContent, { backgroundColor: 'rgba(139, 92, 246, 0.08)' }]}>
                                <Ionicons name="videocam" size={14} color="#8B5CF6" />
                                <Text style={[styles.priceValue, { color: '#8B5CF6' }]}>
                                    {doctor.consultation_fee_online}
                                </Text>
                                <Text style={[styles.priceCurrency, { color: '#A78BFA' }]}>
                                    {doctor.currency}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>

            {/* Book Now CTA */}
            <View style={styles.ctaContainer}>
                <LinearGradient
                    colors={[colors.primary[500], colors.primary[600]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.ctaButton}
                >
                    <Text style={styles.ctaText}>Prendre rendez-vous</Text>
                    <Ionicons name="arrow-forward" size={16} color="white" />
                </LinearGradient>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    // Compact Card Styles
    compactCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        width: 300,
    },
    compactAvatarContainer: {
        position: 'relative',
    },
    compactAvatarGradient: {
        width: 60,
        height: 60,
        borderRadius: 18,
        padding: 2,
    },
    compactAvatarInner: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'white',
    },
    compactAvatarImage: {
        width: '100%',
        height: '100%',
    },
    compactAvatarPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    compactOnlineIndicator: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#22C55E',
        borderWidth: 3,
        borderColor: 'white',
    },
    compactInfo: {
        flex: 1,
    },
    compactName: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.gray[900],
        marginBottom: 4,
    },
    compactSpecialtyRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    compactSpecialtyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    compactSpecialtyText: {
        fontSize: 11,
        fontWeight: '600',
    },
    compactStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    compactRating: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.gray[700],
    },
    compactDivider: {
        fontSize: 10,
        color: colors.gray[400],
    },
    compactStats: {
        fontSize: 10,
        color: colors.gray[500],
    },
    compactArrow: {
        padding: 10,
        borderRadius: 12,
    },

    // Full Card Styles
    card: {
        backgroundColor: 'white',
        borderRadius: 28,
        marginBottom: 16,
        shadowColor: colors.primary[900],
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 30,
        elevation: 12,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        padding: 20,
    },
    avatarSection: {
        marginRight: 16,
        position: 'relative',
    },
    avatarGradientRing: {
        width: 80,
        height: 80,
        borderRadius: 24,
        padding: 3,
        shadowColor: colors.primary[500],
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    avatarInner: {
        width: '100%',
        height: '100%',
        borderRadius: 21,
        overflow: 'hidden',
        backgroundColor: 'white',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    verifiedBadgeInner: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoSection: {
        flex: 1,
    },
    nameStatusRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    doctorName: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.gray[900],
        flex: 1,
        marginRight: 8,
    },
    availabilityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#D1FAE5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        gap: 5,
    },
    availabilityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#22C55E',
    },
    availabilityPulse: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4ADE80',
    },
    availabilityText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#15803D',
        letterSpacing: 0.5,
    },
    specialtyContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    specialtyBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    specialtyText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statIcon: {
        width: 28,
        height: 28,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.gray[700],
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray[100],
        marginHorizontal: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    locationIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: colors.gray[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.gray[500],
        flex: 1,
    },
    pricingRow: {
        flexDirection: 'row',
        gap: 8,
    },
    priceTag: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    priceTagContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 6,
    },
    priceValue: {
        fontSize: 13,
        fontWeight: '700',
    },
    priceCurrency: {
        fontSize: 10,
        fontWeight: '500',
    },
    ctaContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        gap: 8,
        shadowColor: colors.primary[500],
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    ctaText: {
        fontSize: 15,
        fontWeight: '700',
        color: 'white',
    },
});
