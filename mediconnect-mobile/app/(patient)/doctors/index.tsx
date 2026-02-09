/**
 * Premium Doctor Search Screen
 * 
 * A beautifully designed doctor search experience with
 * glassmorphism effects, smooth animations, and premium UX.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    ScrollView, 
    TextInput, 
    Modal,
    RefreshControl,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo-blur';
import { colors } from '@/lib/constants/colors';
import { doctorsApi, DoctorPublicProfile, DoctorSearchParams } from '@/lib/api/doctors';
import DoctorCard from '@/components/patient/DoctorCard';
import DoctorMapView from '@/components/patient/DoctorMapView';
import AnimatedLoader from '@/components/ui/AnimatedLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Specialty options with icons
const SPECIALTIES = [
    { name: 'Cardiology', icon: 'heart', color: '#EF4444' },
    { name: 'Dermatology', icon: 'color-palette', color: '#EC4899' },
    { name: 'Pediatrics', icon: 'happy', color: '#F97316' },
    { name: 'Neurology', icon: 'flash', color: '#8B5CF6' },
    { name: 'Orthopedics', icon: 'body', color: '#06B6D4' },
    { name: 'Ophthalmology', icon: 'eye', color: '#3B82F6' },
    { name: 'Psychiatry', icon: 'chatbubbles', color: '#6366F1' },
    { name: 'Dentistry', icon: 'sparkles', color: '#14B8A6' },
    { name: 'General Practice', icon: 'medkit', color: '#10B981' },
    { name: 'Gynecology', icon: 'flower', color: '#F472B6' },
    { name: 'Urology', icon: 'fitness', color: '#0EA5E9' },
    { name: 'ENT', icon: 'ear', color: '#A855F7' },
];

const SORT_OPTIONS = [
    { label: 'Meilleure note', value: 'rating', icon: 'star' },
    { label: 'Prix croissant', value: 'price_asc', icon: 'trending-down' },
    { label: 'Prix décroissant', value: 'price_desc', icon: 'trending-up' },
    { label: 'Plus expérimenté', value: 'experience', icon: 'ribbon' },
];

export default function DoctorSearchScreen() {
    const router = useRouter();
    
    // View mode
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    
    // Search & filters
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<DoctorSearchParams>({});
    const [tempFilters, setTempFilters] = useState<DoctorSearchParams>({});
    
    // Data
    const [doctors, setDoctors] = useState<DoctorPublicProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch doctors
    const fetchDoctors = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const params: DoctorSearchParams = {
                ...filters,
                doctor_name: searchQuery || undefined,
                limit: 50,
            };

            const result = await doctorsApi.searchDoctors(params);
            setDoctors(result);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters, searchQuery]);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    const handleApplyFilters = () => {
        setFilters(tempFilters);
        setShowFilters(false);
    };

    const handleClearFilters = () => {
        setTempFilters({});
        setFilters({});
        setShowFilters(false);
    };

    const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

    const handleDoctorSelect = (doctor: DoctorPublicProfile) => {
        router.push(`/(patient)/doctors/${doctor.id}`);
    };

    const renderListView = () => (
        <FlatList
            data={doctors}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
                <Animatable.View animation="fadeInUp" delay={index * 50} duration={400}>
                    <DoctorCard doctor={item} onPress={() => handleDoctorSelect(item)} />
                </Animatable.View>
            )}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => fetchDoctors(true)}
                    tintColor={colors.primary[600]}
                />
            }
            ListEmptyComponent={
                <Animatable.View animation="fadeIn" className="items-center justify-center py-20">
                    <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
                        <Ionicons name="search-outline" size={48} color={colors.gray[300]} />
                    </View>
                    <Text className="text-gray-900 font-bold text-lg mb-1">Aucun médecin trouvé</Text>
                    <Text className="text-gray-500 text-center max-w-[250px]">
                        Essayez d'ajuster vos filtres ou votre recherche
                    </Text>
                </Animatable.View>
            }
        />
    );

    const renderMapView = () => (
        <DoctorMapView 
            doctors={doctors} 
            onDoctorSelect={handleDoctorSelect}
        />
    );

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" />
            
            {/* Premium Header */}
            <LinearGradient
                colors={[colors.primary[600], colors.primary[700], colors.primary[800]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="pt-14 pb-6 px-5"
            >
                <Animatable.View animation="fadeInDown" duration={500}>
                    {/* Title Row */}
                    <View className="flex-row items-center justify-between mb-5">
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
                        
                        <View className="items-center">
                            <Text className="text-white text-xl font-bold tracking-tight">
                                Trouver un Médecin
                            </Text>
                            <Text className="text-white/60 text-xs mt-0.5">
                                {doctors.length} médecins disponibles
                            </Text>
                        </View>
                        
                        <View className="w-11" />
                    </View>

                    {/* Premium Search Bar */}
                    <View className="flex-row items-center gap-3">
                        <View 
                            className="flex-1 bg-white rounded-2xl px-4 py-3.5 flex-row items-center gap-3"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.1,
                                shadowRadius: 20,
                                elevation: 8,
                            }}
                        >
                            <View className="w-10 h-10 rounded-xl bg-primary-50 items-center justify-center">
                                <Ionicons name="search" size={20} color={colors.primary[600]} />
                            </View>
                            <TextInput
                                placeholder="Rechercher par nom ou spécialité..."
                                placeholderTextColor={colors.gray[400]}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                onSubmitEditing={() => fetchDoctors()}
                                returnKeyType="search"
                                className="flex-1 text-gray-800 text-sm font-medium"
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity 
                                    onPress={() => setSearchQuery('')}
                                    className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                                >
                                    <Ionicons name="close" size={16} color={colors.gray[500]} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Filter Button */}
                        <TouchableOpacity
                            onPress={() => {
                                setTempFilters(filters);
                                setShowFilters(true);
                            }}
                            className="w-14 h-14 rounded-2xl bg-white items-center justify-center relative"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.1,
                                shadowRadius: 20,
                                elevation: 8,
                            }}
                        >
                            <Ionicons name="options" size={24} color={colors.primary[600]} />
                            {activeFiltersCount > 0 && (
                                <Animatable.View 
                                    animation="bounceIn"
                                    className="absolute -top-1.5 -right-1.5"
                                >
                                    <LinearGradient
                                        colors={['#EF4444', '#DC2626']}
                                        className="w-6 h-6 rounded-full items-center justify-center"
                                    >
                                        <Text className="text-white text-[10px] font-bold">
                                            {activeFiltersCount}
                                        </Text>
                                    </LinearGradient>
                                </Animatable.View>
                            )}
                        </TouchableOpacity>
                    </View>
                </Animatable.View>
            </LinearGradient>

            {/* View Toggle - Premium */}
            <View className="px-5 py-4">
                <View 
                    className="flex-row bg-gray-100 rounded-2xl p-1.5"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => setViewMode('list')}
                        className="flex-1 rounded-xl overflow-hidden"
                    >
                        {viewMode === 'list' ? (
                            <LinearGradient
                                colors={[colors.primary[500], colors.primary[600]]}
                                className="py-3 flex-row items-center justify-center gap-2"
                                style={{
                                    shadowColor: colors.primary[500],
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: 4,
                                }}
                            >
                                <Ionicons name="list" size={18} color="white" />
                                <Text className="text-white font-bold">Liste</Text>
                            </LinearGradient>
                        ) : (
                            <View className="py-3 flex-row items-center justify-center gap-2">
                                <Ionicons name="list" size={18} color={colors.gray[500]} />
                                <Text className="text-gray-500 font-semibold">Liste</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setViewMode('map')}
                        className="flex-1 rounded-xl overflow-hidden"
                    >
                        {viewMode === 'map' ? (
                            <LinearGradient
                                colors={[colors.primary[500], colors.primary[600]]}
                                className="py-3 flex-row items-center justify-center gap-2"
                                style={{
                                    shadowColor: colors.primary[500],
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: 4,
                                }}
                            >
                                <Ionicons name="map" size={18} color="white" />
                                <Text className="text-white font-bold">Carte</Text>
                            </LinearGradient>
                        ) : (
                            <View className="py-3 flex-row items-center justify-center gap-2">
                                <Ionicons name="map" size={18} color={colors.gray[500]} />
                                <Text className="text-gray-500 font-semibold">Carte</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <AnimatedLoader size="large" message="Recherche en cours..." />
                </View>
            ) : (
                viewMode === 'list' ? renderListView() : renderMapView()
            )}

            {/* Premium Filters Modal */}
            <Modal
                visible={showFilters}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowFilters(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 bg-gray-50"
                >
                    {/* Modal Header */}
                    <LinearGradient
                        colors={[colors.primary[600], colors.primary[700]]}
                        className="pt-4 pb-5 px-5"
                    >
                        <View className="flex-row items-center justify-between">
                            <TouchableOpacity 
                                onPress={() => setShowFilters(false)}
                                className="w-10 h-10 rounded-xl bg-white/15 items-center justify-center"
                            >
                                <Ionicons name="close" size={22} color="white" />
                            </TouchableOpacity>
                            <View className="items-center">
                                <Text className="text-white text-lg font-bold">Filtres</Text>
                                <Text className="text-white/60 text-xs">
                                    Affinez votre recherche
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={handleClearFilters}
                                className="px-3 py-2 rounded-xl bg-white/15"
                            >
                                <Text className="text-white font-semibold text-sm">Effacer</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>

                    <ScrollView 
                        className="flex-1" 
                        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Specialty */}
                        <View className="mb-8">
                            <View className="flex-row items-center gap-2 mb-4">
                                <View className="w-8 h-8 rounded-lg bg-primary-100 items-center justify-center">
                                    <Ionicons name="medical" size={16} color={colors.primary[600]} />
                                </View>
                                <Text className="text-gray-900 font-bold text-base">Spécialité</Text>
                            </View>
                            <View className="flex-row flex-wrap gap-2">
                                {SPECIALTIES.map((specialty) => (
                                    <TouchableOpacity
                                        key={specialty.name}
                                        onPress={() => setTempFilters(prev => ({
                                            ...prev,
                                            specialty: prev.specialty === specialty.name ? undefined : specialty.name
                                        }))}
                                        className={`px-4 py-2.5 rounded-xl border flex-row items-center gap-2 ${
                                            tempFilters.specialty === specialty.name
                                                ? 'bg-primary-600 border-primary-600'
                                                : 'bg-white border-gray-200'
                                        }`}
                                        style={tempFilters.specialty === specialty.name ? {
                                            shadowColor: colors.primary[500],
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 8,
                                            elevation: 4,
                                        } : {}}
                                    >
                                        <Ionicons 
                                            name={specialty.icon as any} 
                                            size={14} 
                                            color={tempFilters.specialty === specialty.name ? 'white' : specialty.color} 
                                        />
                                        <Text className={`font-semibold text-sm ${
                                            tempFilters.specialty === specialty.name
                                                ? 'text-white'
                                                : 'text-gray-700'
                                        }`}>
                                            {specialty.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Consultation Type */}
                        <View className="mb-8">
                            <View className="flex-row items-center gap-2 mb-4">
                                <View className="w-8 h-8 rounded-lg bg-purple-100 items-center justify-center">
                                    <Ionicons name="videocam" size={16} color="#8B5CF6" />
                                </View>
                                <Text className="text-gray-900 font-bold text-base">Type de consultation</Text>
                            </View>
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => setTempFilters(prev => ({
                                        ...prev,
                                        consultation_type: prev.consultation_type === 'presentiel' ? undefined : 'presentiel'
                                    }))}
                                    className={`flex-1 py-5 rounded-2xl border flex-row items-center justify-center gap-3 ${
                                        tempFilters.consultation_type === 'presentiel'
                                            ? 'bg-primary-50 border-primary-500'
                                            : 'bg-white border-gray-200'
                                    }`}
                                >
                                    <View className={`w-11 h-11 rounded-xl items-center justify-center ${
                                        tempFilters.consultation_type === 'presentiel' ? 'bg-primary-100' : 'bg-gray-100'
                                    }`}>
                                        <Ionicons 
                                            name="business" 
                                            size={22} 
                                            color={tempFilters.consultation_type === 'presentiel' ? colors.primary[600] : colors.gray[500]} 
                                        />
                                    </View>
                                    <Text className={`font-bold ${
                                        tempFilters.consultation_type === 'presentiel' ? 'text-primary-600' : 'text-gray-600'
                                    }`}>
                                        Présentiel
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setTempFilters(prev => ({
                                        ...prev,
                                        consultation_type: prev.consultation_type === 'online' ? undefined : 'online'
                                    }))}
                                    className={`flex-1 py-5 rounded-2xl border flex-row items-center justify-center gap-3 ${
                                        tempFilters.consultation_type === 'online'
                                            ? 'bg-purple-50 border-purple-500'
                                            : 'bg-white border-gray-200'
                                    }`}
                                >
                                    <View className={`w-11 h-11 rounded-xl items-center justify-center ${
                                        tempFilters.consultation_type === 'online' ? 'bg-purple-100' : 'bg-gray-100'
                                    }`}>
                                        <Ionicons 
                                            name="videocam" 
                                            size={22} 
                                            color={tempFilters.consultation_type === 'online' ? '#8B5CF6' : colors.gray[500]} 
                                        />
                                    </View>
                                    <Text className={`font-bold ${
                                        tempFilters.consultation_type === 'online' ? 'text-purple-600' : 'text-gray-600'
                                    }`}>
                                        En ligne
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Max Price */}
                        <View className="mb-8">
                            <View className="flex-row items-center gap-2 mb-4">
                                <View className="w-8 h-8 rounded-lg bg-green-100 items-center justify-center">
                                    <Ionicons name="wallet" size={16} color="#10B981" />
                                </View>
                                <Text className="text-gray-900 font-bold text-base">Prix maximum</Text>
                            </View>
                            <View className="flex-row flex-wrap gap-2">
                                {[50, 100, 150, 200, 300].map((price) => (
                                    <TouchableOpacity
                                        key={price}
                                        onPress={() => setTempFilters(prev => ({
                                            ...prev,
                                            max_fee: prev.max_fee === price ? undefined : price
                                        }))}
                                        className={`px-5 py-3 rounded-xl border ${
                                            tempFilters.max_fee === price
                                                ? 'bg-green-500 border-green-500'
                                                : 'bg-white border-gray-200'
                                        }`}
                                        style={tempFilters.max_fee === price ? {
                                            shadowColor: '#10B981',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 8,
                                            elevation: 4,
                                        } : {}}
                                    >
                                        <Text className={`font-bold ${
                                            tempFilters.max_fee === price ? 'text-white' : 'text-gray-700'
                                        }`}>
                                            ≤ {price} TND
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Minimum Rating */}
                        <View className="mb-8">
                            <View className="flex-row items-center gap-2 mb-4">
                                <View className="w-8 h-8 rounded-lg bg-yellow-100 items-center justify-center">
                                    <Ionicons name="star" size={16} color="#F59E0B" />
                                </View>
                                <Text className="text-gray-900 font-bold text-base">Note minimum</Text>
                            </View>
                            <View className="flex-row gap-2">
                                {[3, 3.5, 4, 4.5].map((rating) => (
                                    <TouchableOpacity
                                        key={rating}
                                        onPress={() => setTempFilters(prev => ({
                                            ...prev,
                                            min_rating: prev.min_rating === rating ? undefined : rating
                                        }))}
                                        className={`flex-1 py-3 rounded-xl border flex-row items-center justify-center gap-1.5 ${
                                            tempFilters.min_rating === rating
                                                ? 'bg-yellow-500 border-yellow-500'
                                                : 'bg-white border-gray-200'
                                        }`}
                                        style={tempFilters.min_rating === rating ? {
                                            shadowColor: '#F59E0B',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 8,
                                            elevation: 4,
                                        } : {}}
                                    >
                                        <Ionicons
                                            name="star"
                                            size={14}
                                            color={tempFilters.min_rating === rating ? 'white' : '#FBBF24'}
                                        />
                                        <Text className={`font-bold ${
                                            tempFilters.min_rating === rating ? 'text-white' : 'text-gray-700'
                                        }`}>
                                            {rating}+
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Sort By */}
                        <View className="mb-6">
                            <View className="flex-row items-center gap-2 mb-4">
                                <View className="w-8 h-8 rounded-lg bg-blue-100 items-center justify-center">
                                    <Ionicons name="swap-vertical" size={16} color={colors.info} />
                                </View>
                                <Text className="text-gray-900 font-bold text-base">Trier par</Text>
                            </View>
                            <View className="gap-2">
                                {SORT_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        onPress={() => setTempFilters(prev => ({
                                            ...prev,
                                            sort_by: prev.sort_by === option.value ? undefined : option.value as any
                                        }))}
                                        className={`px-4 py-4 rounded-2xl border flex-row items-center justify-between ${
                                            tempFilters.sort_by === option.value
                                                ? 'bg-primary-50 border-primary-500'
                                                : 'bg-white border-gray-200'
                                        }`}
                                    >
                                        <View className="flex-row items-center gap-3">
                                            <View className={`w-10 h-10 rounded-xl items-center justify-center ${
                                                tempFilters.sort_by === option.value ? 'bg-primary-100' : 'bg-gray-100'
                                            }`}>
                                                <Ionicons 
                                                    name={option.icon as any} 
                                                    size={18} 
                                                    color={tempFilters.sort_by === option.value ? colors.primary[600] : colors.gray[500]} 
                                                />
                                            </View>
                                            <Text className={`font-semibold ${
                                                tempFilters.sort_by === option.value ? 'text-primary-600' : 'text-gray-700'
                                            }`}>
                                                {option.label}
                                            </Text>
                                        </View>
                                        {tempFilters.sort_by === option.value && (
                                            <View className="w-6 h-6 rounded-full bg-primary-600 items-center justify-center">
                                                <Ionicons name="checkmark" size={14} color="white" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Apply Button */}
                    <View 
                        className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: -4 },
                            shadowOpacity: 0.05,
                            shadowRadius: 12,
                        }}
                    >
                        <TouchableOpacity
                            onPress={handleApplyFilters}
                            className="rounded-2xl overflow-hidden"
                        >
                            <LinearGradient
                                colors={[colors.primary[500], colors.primary[600]]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="py-4.5 flex-row items-center justify-center gap-2"
                                style={{
                                    paddingVertical: 18,
                                    shadowColor: colors.primary[500],
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.35,
                                    shadowRadius: 16,
                                    elevation: 8,
                                }}
                            >
                                <Ionicons name="search" size={20} color="white" />
                                <Text className="text-white font-bold text-base">
                                    Appliquer les filtres
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}