/**
 * Premium Doctor Profile Screen
 * 
 * A beautifully designed doctor profile with premium visual elements,
 * gradient effects, and smooth animations.
 */

import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    Image, 
    ActivityIndicator,
    Linking,
    Platform,
    Dimensions,
    StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors } from '@/lib/constants/colors';
import { doctorsApi, DoctorPublicProfile } from '@/lib/api/doctors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DoctorProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    
    const [doctor, setDoctor] = useState<DoctorPublicProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDoctor();
    }, [id]);

    const fetchDoctor = async () => {
        try {
            setLoading(true);
            const result = await doctorsApi.getDoctorById(id);
            setDoctor(result);
        } catch (error) {
            console.error('Error fetching doctor:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookAppointment = () => {
        router.push(`/(patient)/booking/${id}`);
    };

    const handleGetDirections = () => {
        if (doctor?.latitude && doctor?.longitude) {
            const scheme = Platform.select({
                ios: 'maps:0,0?q=',
                android: 'geo:0,0?q=',
            });
            const latLng = `${doctor.latitude},${doctor.longitude}`;
            const label = `Dr. ${doctor.first_name} ${doctor.last_name}`;
            const url = Platform.select({
                ios: `${scheme}${label}@${latLng}`,
                android: `${scheme}${latLng}(${label})`,
            });
            if (url) Linking.openURL(url);
        }
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Ionicons key={i} name="star" size={14} color="#FBBF24" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<Ionicons key={i} name="star-half" size={14} color="#FBBF24" />);
            } else {
                stars.push(<Ionicons key={i} name="star-outline" size={14} color="#E5E7EB" />);
            }
        }
        return stars;
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <Animatable.View animation="pulse" iterationCount="infinite">
                    <LinearGradient
                        colors={[colors.primary[100], colors.primary[50]]}
                        className="w-20 h-20 rounded-3xl items-center justify-center"
                    >
                        <ActivityIndicator size="large" color={colors.primary[600]} />
                    </LinearGradient>
                </Animatable.View>
                <Text className="text-gray-500 mt-4 font-medium">Chargement du profil...</Text>
            </View>
        );
    }

    if (!doctor) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <View className="w-24 h-24 rounded-full bg-red-50 items-center justify-center mb-4">
                    <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
                </View>
                <Text className="text-gray-900 font-bold text-lg mb-1">Médecin non trouvé</Text>
                <Text className="text-gray-500 text-center mb-6">Le profil demandé n'existe pas</Text>
                <TouchableOpacity 
                    onPress={() => router.back()}
                    className="rounded-xl overflow-hidden"
                >
                    <LinearGradient
                        colors={[colors.primary[500], colors.primary[600]]}
                        className="px-8 py-3.5"
                    >
                        <Text className="text-white font-bold">Retour</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" />
            
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Premium Hero Section */}
                <LinearGradient
                    colors={[colors.primary[600], colors.primary[700], colors.primary[800]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="pt-14 pb-28 px-5"
                >
                    {/* Header Row */}
                    <Animatable.View 
                        animation="fadeIn" 
                        duration={400}
                        className="flex-row items-center justify-between mb-8"
                    >
                        <TouchableOpacity 
                            onPress={() => router.back()}
                            className="w-11 h-11 rounded-2xl bg-white/15 items-center justify-center"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.15,
                                shadowRadius: 8,
                            }}
                        >
                            <Ionicons name="arrow-back" size={22} color="white" />
                        </TouchableOpacity>
                        
                        <Text className="text-white/80 text-sm font-medium">Profil Médecin</Text>
                        
                        <TouchableOpacity 
                            className="w-11 h-11 rounded-2xl bg-white/15 items-center justify-center"
                        >
                            <Ionicons name="heart-outline" size={22} color="white" />
                        </TouchableOpacity>
                    </Animatable.View>

                    {/* Doctor Header */}
                    <Animatable.View animation="fadeInUp" duration={600} className="items-center">
                        {/* Premium Avatar with gradient ring */}
                        <View className="relative mb-5">
                            <LinearGradient
                                colors={['#ffffff', colors.primary[100]]}
                                className="w-32 h-32 rounded-[32px] p-[4px]"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 12 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 24,
                                    elevation: 15,
                                }}
                            >
                                {doctor.avatar_url ? (
                                    <Image 
                                        source={{ uri: doctor.avatar_url }}
                                        className="w-full h-full rounded-[28px]"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <LinearGradient
                                        colors={[colors.primary[100], colors.primary[50]]}
                                        className="w-full h-full rounded-[28px] items-center justify-center"
                                    >
                                        <Ionicons name="person" size={56} color={colors.primary[500]} />
                                    </LinearGradient>
                                )}
                            </LinearGradient>
                            
                            {/* Verified Badge */}
                            <View 
                                className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 8,
                                    elevation: 5,
                                }}
                            >
                                <LinearGradient
                                    colors={[colors.success, '#059669']}
                                    className="w-8 h-8 rounded-full items-center justify-center"
                                >
                                    <Ionicons name="checkmark" size={18} color="white" />
                                </LinearGradient>
                            </View>
                        </View>

                        {/* Name & Specialty */}
                        <Text className="text-white text-2xl font-bold text-center tracking-tight">
                            Dr. {doctor.first_name} {doctor.last_name}
                        </Text>
                        
                        <View className="mt-2">
                            <LinearGradient
                                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
                                className="px-4 py-2 rounded-xl"
                            >
                                <Text className="text-white font-semibold text-sm">
                                    {doctor.specialty}
                                </Text>
                            </LinearGradient>
                        </View>

                        {/* Rating Badge */}
                        <View className="flex-row items-center gap-3 mt-4 bg-white/15 backdrop-blur-sm px-5 py-2.5 rounded-2xl">
                            <View className="flex-row items-center gap-1">
                                {renderStars(doctor.average_rating)}
                            </View>
                            <View className="w-px h-4 bg-white/30" />
                            <Text className="text-white font-bold">
                                {doctor.average_rating.toFixed(1)}
                            </Text>
                            <View className="w-px h-4 bg-white/30" />
                            <Text className="text-white/80 text-sm">
                                {doctor.total_consultations} consultations
                            </Text>
                        </View>
                    </Animatable.View>
                </LinearGradient>

                {/* Stats Cards - Overlapping */}
                <Animatable.View 
                    animation="fadeInUp" 
                    delay={200}
                    className="flex-row px-5 -mt-14 mb-6"
                >
                    {/* Experience Card */}
                    <View 
                        className="flex-1 bg-white rounded-3xl p-5 mr-2 items-center"
                        style={{
                            shadowColor: colors.primary[900],
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.08,
                            shadowRadius: 20,
                            elevation: 8,
                        }}
                    >
                        <View className="w-14 h-14 rounded-2xl bg-blue-50 items-center justify-center mb-3">
                            <Ionicons name="ribbon" size={26} color={colors.info} />
                        </View>
                        <Text className="text-gray-900 font-bold text-xl">{doctor.years_experience}+</Text>
                        <Text className="text-gray-500 text-xs font-medium">Années d'exp.</Text>
                    </View>

                    {/* Patients Card */}
                    <View 
                        className="flex-1 bg-white rounded-3xl p-5 mx-1 items-center"
                        style={{
                            shadowColor: colors.primary[900],
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.08,
                            shadowRadius: 20,
                            elevation: 8,
                        }}
                    >
                        <View className="w-14 h-14 rounded-2xl bg-green-50 items-center justify-center mb-3">
                            <Ionicons name="people" size={26} color={colors.success} />
                        </View>
                        <Text className="text-gray-900 font-bold text-xl">{doctor.total_consultations}</Text>
                        <Text className="text-gray-500 text-xs font-medium">Patients</Text>
                    </View>

                    {/* Rating Card */}
                    <View 
                        className="flex-1 bg-white rounded-3xl p-5 ml-2 items-center"
                        style={{
                            shadowColor: colors.primary[900],
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.08,
                            shadowRadius: 20,
                            elevation: 8,
                        }}
                    >
                        <View className="w-14 h-14 rounded-2xl bg-yellow-50 items-center justify-center mb-3">
                            <Ionicons name="star" size={26} color="#F59E0B" />
                        </View>
                        <Text className="text-gray-900 font-bold text-xl">{doctor.average_rating.toFixed(1)}</Text>
                        <Text className="text-gray-500 text-xs font-medium">Note</Text>
                    </View>
                </Animatable.View>

                {/* Main Content */}
                <View className="px-5 pb-36">
                    {/* About Section */}
                    {doctor.bio && (
                        <Animatable.View animation="fadeInUp" delay={300} className="mb-6">
                            <View className="flex-row items-center gap-2 mb-3">
                                <View className="w-8 h-8 rounded-lg bg-primary-100 items-center justify-center">
                                    <Ionicons name="information-circle" size={16} color={colors.primary[600]} />
                                </View>
                                <Text className="text-gray-900 font-bold text-base">À propos</Text>
                            </View>
                            <View 
                                className="bg-white rounded-3xl p-5" 
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.04,
                                    shadowRadius: 12,
                                    elevation: 3,
                                }}
                            >
                                <Text className="text-gray-600 leading-6">{doctor.bio}</Text>
                            </View>
                        </Animatable.View>
                    )}

                    {/* Consultation Types */}
                    <Animatable.View animation="fadeInUp" delay={400} className="mb-6">
                        <View className="flex-row items-center gap-2 mb-3">
                            <View className="w-8 h-8 rounded-lg bg-purple-100 items-center justify-center">
                                <Ionicons name="medical" size={16} color="#8B5CF6" />
                            </View>
                            <Text className="text-gray-900 font-bold text-base">Types de consultation</Text>
                        </View>
                        
                        <View className="gap-3">
                            {doctor.offers_presentiel && (
                                <View 
                                    className="bg-white rounded-3xl p-5 flex-row items-center justify-between"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.04,
                                        shadowRadius: 12,
                                        elevation: 3,
                                    }}
                                >
                                    <View className="flex-row items-center gap-4">
                                        <LinearGradient
                                            colors={[colors.primary[500], colors.primary[600]]}
                                            className="p-3.5 rounded-2xl"
                                            style={{
                                                shadowColor: colors.primary[500],
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 8,
                                                elevation: 4,
                                            }}
                                        >
                                            <Ionicons name="business" size={24} color="white" />
                                        </LinearGradient>
                                        <View>
                                            <Text className="text-gray-900 font-bold text-base">Présentiel</Text>
                                            <Text className="text-gray-500 text-sm">Visite au cabinet</Text>
                                        </View>
                                    </View>
                                    <View className="bg-primary-50 px-4 py-2.5 rounded-xl">
                                        <Text className="text-primary-600 font-bold text-base">
                                            {doctor.consultation_fee_presentiel}
                                        </Text>
                                        <Text className="text-primary-400 text-[10px] text-center">{doctor.currency}</Text>
                                    </View>
                                </View>
                            )}

                            {doctor.offers_online && (
                                <View 
                                    className="bg-white rounded-3xl p-5 flex-row items-center justify-between"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.04,
                                        shadowRadius: 12,
                                        elevation: 3,
                                    }}
                                >
                                    <View className="flex-row items-center gap-4">
                                        <LinearGradient
                                            colors={['#8B5CF6', '#7C3AED']}
                                            className="p-3.5 rounded-2xl"
                                            style={{
                                                shadowColor: '#8B5CF6',
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 8,
                                                elevation: 4,
                                            }}
                                        >
                                            <Ionicons name="videocam" size={24} color="white" />
                                        </LinearGradient>
                                        <View>
                                            <Text className="text-gray-900 font-bold text-base">Vidéo</Text>
                                            <Text className="text-gray-500 text-sm">Consultation en ligne</Text>
                                        </View>
                                    </View>
                                    <View className="bg-purple-50 px-4 py-2.5 rounded-xl">
                                        <Text className="text-purple-600 font-bold text-base">
                                            {doctor.consultation_fee_online}
                                        </Text>
                                        <Text className="text-purple-400 text-[10px] text-center">{doctor.currency}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </Animatable.View>

                    {/* Location */}
                    {(doctor.cabinet_city || (doctor.latitude && doctor.longitude)) && (
                        <Animatable.View animation="fadeInUp" delay={500} className="mb-6">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center gap-2">
                                    <View className="w-8 h-8 rounded-lg bg-red-100 items-center justify-center">
                                        <Ionicons name="location" size={16} color={colors.error} />
                                    </View>
                                    <Text className="text-gray-900 font-bold text-base">Localisation</Text>
                                </View>
                                {doctor.latitude && doctor.longitude && (
                                    <TouchableOpacity 
                                        onPress={handleGetDirections}
                                        className="flex-row items-center gap-1.5 bg-primary-50 px-3 py-2 rounded-xl"
                                    >
                                        <Ionicons name="navigate" size={14} color={colors.primary[600]} />
                                        <Text className="text-primary-600 font-semibold text-sm">Itinéraire</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            
                            <View 
                                className="bg-white rounded-3xl overflow-hidden"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.04,
                                    shadowRadius: 12,
                                    elevation: 3,
                                }}
                            >
                                {doctor.latitude && doctor.longitude && (
                                    <MapView
                                        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                                        style={{ width: SCREEN_WIDTH - 40, height: 160 }}
                                        initialRegion={{
                                            latitude: doctor.latitude,
                                            longitude: doctor.longitude,
                                            latitudeDelta: 0.01,
                                            longitudeDelta: 0.01,
                                        }}
                                        scrollEnabled={false}
                                        zoomEnabled={false}
                                    >
                                        <Marker
                                            coordinate={{
                                                latitude: doctor.latitude,
                                                longitude: doctor.longitude,
                                            }}
                                        >
                                            <LinearGradient
                                                colors={[colors.primary[500], colors.primary[600]]}
                                                className="p-2.5 rounded-full"
                                            >
                                                <Ionicons name="medical" size={18} color="white" />
                                            </LinearGradient>
                                        </Marker>
                                    </MapView>
                                )}
                                
                                <View className="p-4 flex-row items-center gap-3">
                                    <View className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center">
                                        <Ionicons name="location" size={18} color={colors.gray[500]} />
                                    </View>
                                    <Text className="text-gray-700 flex-1 font-medium">
                                        {doctor.cabinet_city}{doctor.cabinet_country ? `, ${doctor.cabinet_country}` : ''}
                                    </Text>
                                </View>
                            </View>
                        </Animatable.View>
                    )}

                    {/* Availability Status */}
                    <Animatable.View animation="fadeInUp" delay={600}>
                        <View 
                            className={`rounded-3xl p-5 flex-row items-center gap-4 ${
                                doctor.is_accepting_patients ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
                            }`}
                        >
                            <View className={`w-14 h-14 rounded-2xl items-center justify-center ${
                                doctor.is_accepting_patients ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                                <Ionicons 
                                    name={doctor.is_accepting_patients ? 'checkmark-circle' : 'close-circle'} 
                                    size={28} 
                                    color={doctor.is_accepting_patients ? colors.success : colors.error} 
                                />
                            </View>
                            <View className="flex-1">
                                <Text className={`font-bold text-base ${
                                    doctor.is_accepting_patients ? 'text-green-800' : 'text-red-800'
                                }`}>
                                    {doctor.is_accepting_patients ? 'Accepte de nouveaux patients' : 'N\'accepte pas de patients'}
                                </Text>
                                <Text className={`text-sm mt-0.5 ${
                                    doctor.is_accepting_patients ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {doctor.is_accepting_patients 
                                        ? 'Prenez rendez-vous maintenant' 
                                        : 'Revenez plus tard pour la disponibilité'}
                                </Text>
                            </View>
                        </View>
                    </Animatable.View>
                </View>
            </ScrollView>

            {/* Floating Book Button */}
            {doctor.is_accepting_patients && (
                <Animatable.View 
                    animation="fadeInUp" 
                    delay={700}
                    className="absolute bottom-0 left-0 right-0 p-5 bg-white/95 backdrop-blur-lg border-t border-gray-100"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -8 },
                        shadowOpacity: 0.1,
                        shadowRadius: 20,
                        elevation: 15,
                    }}
                >
                    <TouchableOpacity
                        onPress={handleBookAppointment}
                        className="rounded-2xl overflow-hidden"
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={[colors.primary[500], colors.primary[600]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="py-5 flex-row items-center justify-center gap-3"
                            style={{
                                shadowColor: colors.primary[500],
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.35,
                                shadowRadius: 16,
                                elevation: 8,
                            }}
                        >
                            <Ionicons name="calendar" size={22} color="white" />
                            <Text className="text-white font-bold text-lg">Prendre Rendez-vous</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animatable.View>
            )}
        </View>
    );
}