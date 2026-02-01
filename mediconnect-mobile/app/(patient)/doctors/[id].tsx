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
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors } from '@/lib/constants/colors';
import { doctorsApi, DoctorPublicProfile } from '@/lib/api/doctors';
import RatingStars from '@/components/ui/RatingStars';

const { width } = Dimensions.get('window');

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

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text className="text-gray-500 mt-4">Loading doctor profile...</Text>
            </View>
        );
    }

    if (!doctor) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <Ionicons name="alert-circle-outline" size={64} color={colors.gray[400]} />
                <Text className="text-gray-500 mt-4">Doctor not found</Text>
                <TouchableOpacity 
                    onPress={() => router.back()}
                    className="mt-6 bg-primary-600 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-semibold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <LinearGradient
                    colors={[colors.primary[600], colors.primary[500]]}
                    className="pt-14 pb-24 px-5"
                >
                    {/* Back Button */}
                    <Animatable.View animation="fadeInLeft" duration={400}>
                        <TouchableOpacity 
                            onPress={() => router.back()}
                            className="bg-white/20 p-2 rounded-xl self-start mb-6"
                        >
                            <Ionicons name="arrow-back" size={22} color="white" />
                        </TouchableOpacity>
                    </Animatable.View>

                    {/* Doctor Header */}
                    <Animatable.View 
                        animation="fadeInUp" 
                        duration={600}
                        className="items-center"
                    >
                        {/* Avatar */}
                        <View 
                            className="w-28 h-28 rounded-3xl bg-white p-1 mb-4"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.2,
                                shadowRadius: 16,
                                elevation: 10,
                            }}
                        >
                            {doctor.avatar_url ? (
                                <Image 
                                    source={{ uri: doctor.avatar_url }}
                                    className="w-full h-full rounded-2xl"
                                    resizeMode="cover"
                                />
                            ) : (
                                <LinearGradient
                                    colors={[colors.primary[100], colors.primary[50]]}
                                    className="w-full h-full rounded-2xl items-center justify-center"
                                >
                                    <Ionicons name="person" size={48} color={colors.primary[600]} />
                                </LinearGradient>
                            )}
                        </View>

                        {/* Name & Specialty */}
                        <Text className="text-white text-2xl font-bold text-center">
                            Dr. {doctor.first_name} {doctor.last_name}
                        </Text>
                        <Text className="text-white/90 text-base mt-1">
                            {doctor.specialty}
                        </Text>

                        {/* Rating */}
                        <View className="flex-row items-center gap-2 mt-3 bg-white/20 px-4 py-2 rounded-full">
                            <RatingStars rating={doctor.average_rating} size={16} />
                            <Text className="text-white font-semibold">
                                {doctor.average_rating.toFixed(1)}
                            </Text>
                            <Text className="text-white/80 text-sm">
                                ({doctor.total_consultations} consultations)
                            </Text>
                        </View>
                    </Animatable.View>
                </LinearGradient>

                {/* Stats Cards */}
                <Animatable.View 
                    animation="fadeInUp" 
                    delay={200}
                    className="flex-row px-5 -mt-12 mb-6"
                >
                    <View 
                        className="flex-1 bg-white rounded-2xl p-4 mr-2 items-center"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.08,
                            shadowRadius: 12,
                            elevation: 4,
                        }}
                    >
                        <View className="bg-blue-50 w-12 h-12 rounded-xl items-center justify-center mb-2">
                            <Ionicons name="briefcase" size={24} color={colors.primary[600]} />
                        </View>
                        <Text className="text-gray-800 font-bold text-lg">{doctor.years_experience}+</Text>
                        <Text className="text-gray-500 text-xs">Years Exp.</Text>
                    </View>

                    <View 
                        className="flex-1 bg-white rounded-2xl p-4 mx-1 items-center"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.08,
                            shadowRadius: 12,
                            elevation: 4,
                        }}
                    >
                        <View className="bg-green-50 w-12 h-12 rounded-xl items-center justify-center mb-2">
                            <Ionicons name="people" size={24} color={colors.success} />
                        </View>
                        <Text className="text-gray-800 font-bold text-lg">{doctor.total_consultations}</Text>
                        <Text className="text-gray-500 text-xs">Patients</Text>
                    </View>

                    <View 
                        className="flex-1 bg-white rounded-2xl p-4 ml-2 items-center"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.08,
                            shadowRadius: 12,
                            elevation: 4,
                        }}
                    >
                        <View className="bg-yellow-50 w-12 h-12 rounded-xl items-center justify-center mb-2">
                            <Ionicons name="star" size={24} color="#FBBF24" />
                        </View>
                        <Text className="text-gray-800 font-bold text-lg">{doctor.average_rating.toFixed(1)}</Text>
                        <Text className="text-gray-500 text-xs">Rating</Text>
                    </View>
                </Animatable.View>

                {/* Main Content */}
                <View className="px-5 pb-32">
                    {/* About Section */}
                    {doctor.bio && (
                        <Animatable.View animation="fadeInUp" delay={300} className="mb-6">
                            <Text className="text-gray-800 font-bold text-lg mb-3">About</Text>
                            <View className="bg-white rounded-2xl p-4" style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 8,
                                elevation: 2,
                            }}>
                                <Text className="text-gray-600 leading-6">{doctor.bio}</Text>
                            </View>
                        </Animatable.View>
                    )}

                    {/* Consultation Types */}
                    <Animatable.View animation="fadeInUp" delay={400} className="mb-6">
                        <Text className="text-gray-800 font-bold text-lg mb-3">Consultation Types</Text>
                        <View className="gap-3">
                            {doctor.offers_presentiel && (
                                <View 
                                    className="bg-white rounded-2xl p-4 flex-row items-center justify-between"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.05,
                                        shadowRadius: 8,
                                        elevation: 2,
                                    }}
                                >
                                    <View className="flex-row items-center gap-3">
                                        <View className="bg-blue-50 p-3 rounded-xl">
                                            <Ionicons name="business" size={24} color={colors.primary[600]} />
                                        </View>
                                        <View>
                                            <Text className="text-gray-800 font-semibold">In-Person</Text>
                                            <Text className="text-gray-500 text-sm">Visit at cabinet</Text>
                                        </View>
                                    </View>
                                    <View className="bg-primary-50 px-4 py-2 rounded-xl">
                                        <Text className="text-primary-600 font-bold">
                                            {doctor.consultation_fee_presentiel} {doctor.currency}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {doctor.offers_online && (
                                <View 
                                    className="bg-white rounded-2xl p-4 flex-row items-center justify-between"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.05,
                                        shadowRadius: 8,
                                        elevation: 2,
                                    }}
                                >
                                    <View className="flex-row items-center gap-3">
                                        <View className="bg-purple-50 p-3 rounded-xl">
                                            <Ionicons name="videocam" size={24} color="#8B5CF6" />
                                        </View>
                                        <View>
                                            <Text className="text-gray-800 font-semibold">Video Call</Text>
                                            <Text className="text-gray-500 text-sm">Online consultation</Text>
                                        </View>
                                    </View>
                                    <View className="bg-purple-50 px-4 py-2 rounded-xl">
                                        <Text className="text-purple-600 font-bold">
                                            {doctor.consultation_fee_online} {doctor.currency}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </Animatable.View>

                    {/* Location */}
                    {(doctor.cabinet_city || (doctor.latitude && doctor.longitude)) && (
                        <Animatable.View animation="fadeInUp" delay={500} className="mb-6">
                            <View className="flex-row items-center justify-between mb-3">
                                <Text className="text-gray-800 font-bold text-lg">Location</Text>
                                {doctor.latitude && doctor.longitude && (
                                    <TouchableOpacity 
                                        onPress={handleGetDirections}
                                        className="flex-row items-center gap-1"
                                    >
                                        <Ionicons name="navigate" size={16} color={colors.primary[600]} />
                                        <Text className="text-primary-600 font-semibold">Get Directions</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            
                            <View 
                                className="bg-white rounded-2xl overflow-hidden"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 8,
                                    elevation: 2,
                                }}
                            >
                                {doctor.latitude && doctor.longitude && (
                                    <MapView
                                        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                                        style={{ width: width - 40, height: 180 }}
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
                                            <View className="bg-primary-600 p-2 rounded-full">
                                                <Ionicons name="medical" size={16} color="white" />
                                            </View>
                                        </Marker>
                                    </MapView>
                                )}
                                
                                <View className="p-4 flex-row items-center gap-3">
                                    <Ionicons name="location" size={20} color={colors.primary[600]} />
                                    <Text className="text-gray-700 flex-1">
                                        {doctor.cabinet_city}{doctor.cabinet_country ? `, ${doctor.cabinet_country}` : ''}
                                    </Text>
                                </View>
                            </View>
                        </Animatable.View>
                    )}

                    {/* Availability Status */}
                    <Animatable.View animation="fadeInUp" delay={600}>
                        <View 
                            className={`rounded-2xl p-4 flex-row items-center gap-3 ${
                                doctor.is_accepting_patients ? 'bg-green-50' : 'bg-red-50'
                            }`}
                        >
                            <Ionicons 
                                name={doctor.is_accepting_patients ? 'checkmark-circle' : 'close-circle'} 
                                size={24} 
                                color={doctor.is_accepting_patients ? colors.success : colors.error} 
                            />
                            <View>
                                <Text className={`font-semibold ${
                                    doctor.is_accepting_patients ? 'text-green-800' : 'text-red-800'
                                }`}>
                                    {doctor.is_accepting_patients ? 'Accepting New Patients' : 'Not Accepting Patients'}
                                </Text>
                                <Text className={`text-sm ${
                                    doctor.is_accepting_patients ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {doctor.is_accepting_patients 
                                        ? 'Book your appointment now' 
                                        : 'Check back later for availability'}
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
                    className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 10,
                    }}
                >
                    <TouchableOpacity
                        onPress={handleBookAppointment}
                        className="rounded-2xl overflow-hidden"
                    >
                        <LinearGradient
                            colors={[colors.primary[600], colors.primary[700]]}
                            className="py-4 flex-row items-center justify-center gap-3"
                        >
                            <Ionicons name="calendar" size={22} color="white" />
                            <Text className="text-white font-bold text-lg">Book Appointment</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animatable.View>
            )}
        </View>
    );
}