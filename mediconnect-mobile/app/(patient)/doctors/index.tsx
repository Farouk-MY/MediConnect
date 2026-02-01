import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    ScrollView, 
    TextInput, 
    Modal,
    ActivityIndicator,
    RefreshControl,
    FlatList,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { colors } from '@/lib/constants/colors';
import { doctorsApi, DoctorPublicProfile, DoctorSearchParams } from '@/lib/api/doctors';
import DoctorCard from '@/components/patient/DoctorCard';
import DoctorMapView from '@/components/patient/DoctorMapView';

// Specialty options
const SPECIALTIES = [
    'Cardiology', 'Dermatology', 'Pediatrics', 'Neurology', 
    'Orthopedics', 'Ophthalmology', 'Psychiatry', 'Dentistry',
    'General Practice', 'Gynecology', 'Urology', 'ENT'
];

const SORT_OPTIONS = [
    { label: 'Best Rating', value: 'rating' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Most Experienced', value: 'experience' },
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
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => fetchDoctors(true)}
                    tintColor={colors.primary[600]}
                />
            }
            ListEmptyComponent={
                <View className="items-center justify-center py-20">
                    <Ionicons name="search-outline" size={64} color={colors.gray[300]} />
                    <Text className="text-gray-500 mt-4 text-center">
                        No doctors found.{'\n'}Try adjusting your filters.
                    </Text>
                </View>
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
            {/* Header */}
            <LinearGradient
                colors={[colors.primary[600], colors.primary[500]]}
                className="pt-14 pb-4 px-5"
            >
                <Animatable.View animation="fadeInDown" duration={600}>
                    {/* Title Row */}
                    <View className="flex-row items-center justify-between mb-4">
                        <TouchableOpacity 
                            onPress={() => router.back()}
                            className="bg-white/20 p-2 rounded-xl"
                        >
                            <Ionicons name="arrow-back" size={22} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white text-xl font-bold">Find Doctors</Text>
                        <View className="w-10" />
                    </View>

                    {/* Search Bar */}
                    <View className="flex-row items-center gap-3">
                        <View className="flex-1 bg-white rounded-2xl px-4 py-3 flex-row items-center gap-3">
                            <Ionicons name="search" size={20} color={colors.gray[400]} />
                            <TextInput
                                placeholder="Search by name or specialty..."
                                placeholderTextColor={colors.gray[400]}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                onSubmitEditing={() => fetchDoctors()}
                                returnKeyType="search"
                                className="flex-1 text-gray-800 text-sm"
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Filter Button */}
                        <TouchableOpacity
                            onPress={() => {
                                setTempFilters(filters);
                                setShowFilters(true);
                            }}
                            className="bg-white rounded-2xl p-3 relative"
                        >
                            <Ionicons name="options" size={22} color={colors.primary[600]} />
                            {activeFiltersCount > 0 && (
                                <View className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full items-center justify-center">
                                    <Text className="text-white text-xs font-bold">{activeFiltersCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </Animatable.View>
            </LinearGradient>

            {/* View Toggle */}
            <View className="px-4 py-3">
                <View className="flex-row bg-gray-200 rounded-2xl p-1">
                    <TouchableOpacity
                        onPress={() => setViewMode('list')}
                        className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-2 ${
                            viewMode === 'list' ? 'bg-white' : ''
                        }`}
                        style={viewMode === 'list' ? {
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 2,
                        } : {}}
                    >
                        <Ionicons 
                            name="list" 
                            size={18} 
                            color={viewMode === 'list' ? colors.primary[600] : colors.gray[500]} 
                        />
                        <Text className={`font-semibold ${
                            viewMode === 'list' ? 'text-primary-600' : 'text-gray-500'
                        }`}>
                            List
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setViewMode('map')}
                        className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-2 ${
                            viewMode === 'map' ? 'bg-white' : ''
                        }`}
                        style={viewMode === 'map' ? {
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 2,
                        } : {}}
                    >
                        <Ionicons 
                            name="map" 
                            size={18} 
                            color={viewMode === 'map' ? colors.primary[600] : colors.gray[500]} 
                        />
                        <Text className={`font-semibold ${
                            viewMode === 'map' ? 'text-primary-600' : 'text-gray-500'
                        }`}>
                            Map
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Results count */}
                <Text className="text-gray-500 text-sm mt-2 px-1">
                    {doctors.length} doctors found
                </Text>
            </View>

            {/* Content */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.primary[600]} />
                    <Text className="text-gray-500 mt-4">Searching doctors...</Text>
                </View>
            ) : (
                viewMode === 'list' ? renderListView() : renderMapView()
            )}

            {/* Filters Modal */}
            <Modal
                visible={showFilters}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowFilters(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 bg-white"
                >
                    {/* Modal Header */}
                    <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
                        <TouchableOpacity onPress={() => setShowFilters(false)}>
                            <Ionicons name="close" size={24} color={colors.gray[600]} />
                        </TouchableOpacity>
                        <Text className="text-lg font-bold text-gray-800">Filters</Text>
                        <TouchableOpacity onPress={handleClearFilters}>
                            <Text className="text-primary-600 font-semibold">Clear</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
                        {/* Specialty */}
                        <View className="mb-6">
                            <Text className="text-gray-800 font-semibold mb-3">Specialty</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {SPECIALTIES.map((specialty) => (
                                    <TouchableOpacity
                                        key={specialty}
                                        onPress={() => setTempFilters(prev => ({
                                            ...prev,
                                            specialty: prev.specialty === specialty ? undefined : specialty
                                        }))}
                                        className={`px-4 py-2 rounded-xl border ${
                                            tempFilters.specialty === specialty
                                                ? 'bg-primary-600 border-primary-600'
                                                : 'bg-white border-gray-200'
                                        }`}
                                    >
                                        <Text className={`font-medium ${
                                            tempFilters.specialty === specialty
                                                ? 'text-white'
                                                : 'text-gray-700'
                                        }`}>
                                            {specialty}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Consultation Type */}
                        <View className="mb-6">
                            <Text className="text-gray-800 font-semibold mb-3">Consultation Type</Text>
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => setTempFilters(prev => ({
                                        ...prev,
                                        consultation_type: prev.consultation_type === 'presentiel' ? undefined : 'presentiel'
                                    }))}
                                    className={`flex-1 py-4 rounded-2xl border flex-row items-center justify-center gap-2 ${
                                        tempFilters.consultation_type === 'presentiel'
                                            ? 'bg-primary-50 border-primary-500'
                                            : 'bg-white border-gray-200'
                                    }`}
                                >
                                    <Ionicons 
                                        name="business" 
                                        size={20} 
                                        color={tempFilters.consultation_type === 'presentiel' ? colors.primary[600] : colors.gray[500]} 
                                    />
                                    <Text className={`font-medium ${
                                        tempFilters.consultation_type === 'presentiel' ? 'text-primary-600' : 'text-gray-600'
                                    }`}>
                                        In-Person
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setTempFilters(prev => ({
                                        ...prev,
                                        consultation_type: prev.consultation_type === 'online' ? undefined : 'online'
                                    }))}
                                    className={`flex-1 py-4 rounded-2xl border flex-row items-center justify-center gap-2 ${
                                        tempFilters.consultation_type === 'online'
                                            ? 'bg-purple-50 border-purple-500'
                                            : 'bg-white border-gray-200'
                                    }`}
                                >
                                    <Ionicons 
                                        name="videocam" 
                                        size={20} 
                                        color={tempFilters.consultation_type === 'online' ? '#8B5CF6' : colors.gray[500]} 
                                    />
                                    <Text className={`font-medium ${
                                        tempFilters.consultation_type === 'online' ? 'text-purple-600' : 'text-gray-600'
                                    }`}>
                                        Online
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Max Price */}
                        <View className="mb-6">
                            <Text className="text-gray-800 font-semibold mb-3">Maximum Price (TND)</Text>
                            <View className="flex-row gap-2">
                                {[50, 100, 150, 200, 300].map((price) => (
                                    <TouchableOpacity
                                        key={price}
                                        onPress={() => setTempFilters(prev => ({
                                            ...prev,
                                            max_fee: prev.max_fee === price ? undefined : price
                                        }))}
                                        className={`px-4 py-2 rounded-xl border ${
                                            tempFilters.max_fee === price
                                                ? 'bg-green-500 border-green-500'
                                                : 'bg-white border-gray-200'
                                        }`}
                                    >
                                        <Text className={`font-medium ${
                                            tempFilters.max_fee === price ? 'text-white' : 'text-gray-700'
                                        }`}>
                                            ≤{price}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Minimum Rating */}
                        <View className="mb-6">
                            <Text className="text-gray-800 font-semibold mb-3">Minimum Rating</Text>
                            <View className="flex-row gap-2">
                                {[3, 3.5, 4, 4.5].map((rating) => (
                                    <TouchableOpacity
                                        key={rating}
                                        onPress={() => setTempFilters(prev => ({
                                            ...prev,
                                            min_rating: prev.min_rating === rating ? undefined : rating
                                        }))}
                                        className={`px-4 py-2 rounded-xl border flex-row items-center gap-1 ${
                                            tempFilters.min_rating === rating
                                                ? 'bg-yellow-500 border-yellow-500'
                                                : 'bg-white border-gray-200'
                                        }`}
                                    >
                                        <Ionicons
                                            name="star"
                                            size={14}
                                            color={tempFilters.min_rating === rating ? 'white' : '#FBBF24'}
                                        />
                                        <Text className={`font-medium ${
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
                            <Text className="text-gray-800 font-semibold mb-3">Sort By</Text>
                            <View className="gap-2">
                                {SORT_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        onPress={() => setTempFilters(prev => ({
                                            ...prev,
                                            sort_by: prev.sort_by === option.value ? undefined : option.value as any
                                        }))}
                                        className={`px-4 py-3 rounded-xl border flex-row items-center justify-between ${
                                            tempFilters.sort_by === option.value
                                                ? 'bg-primary-50 border-primary-500'
                                                : 'bg-white border-gray-200'
                                        }`}
                                    >
                                        <Text className={`font-medium ${
                                            tempFilters.sort_by === option.value ? 'text-primary-600' : 'text-gray-700'
                                        }`}>
                                            {option.label}
                                        </Text>
                                        {tempFilters.sort_by === option.value && (
                                            <Ionicons name="checkmark-circle" size={20} color={colors.primary[600]} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Apply Button */}
                    <View className="p-5 border-t border-gray-100">
                        <TouchableOpacity
                            onPress={handleApplyFilters}
                            className="rounded-2xl overflow-hidden"
                        >
                            <LinearGradient
                                colors={[colors.primary[600], colors.primary[700]]}
                                className="py-4 items-center"
                            >
                                <Text className="text-white font-bold text-lg">Apply Filters</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}