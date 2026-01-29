import { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Pressable,
    TextInput,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { colors } from '@/lib/constants/colors';
import { patientsApi, PatientProfile, PatientUpdateRequest } from '@/lib/api/patients';
import { useToast } from '@/lib/hooks/useToast';
import { useProfileWebSocket } from '@/lib/hooks/useProfileWebSocket';
import { Toast } from '@/components/ui/Toast';
import { router } from "expo-router";

const { width } = Dimensions.get('window');
const isSmallScreen = width < 380;

export default function PatientProfileScreen() {
    const [profile, setProfile] = useState<PatientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    // Form state
    const [formData, setFormData] = useState<PatientUpdateRequest>({});

    // Real-time profile updates via WebSocket
    useProfileWebSocket({
        onProfileUpdate: (data) => {
            const updatedProfile = data as PatientProfile;
            setProfile(updatedProfile);
            // Only update form if not currently editing
            if (!isEditing) {
                setFormData({
                    first_name: updatedProfile.first_name,
                    last_name: updatedProfile.last_name,
                    date_of_birth: updatedProfile.date_of_birth || '',
                    gender: updatedProfile.gender,
                    blood_type: updatedProfile.blood_type,
                    phone: updatedProfile.phone || '',
                    address: updatedProfile.address || '',
                    city: updatedProfile.city || '',
                    country: updatedProfile.country || '',
                    postal_code: updatedProfile.postal_code || '',
                    bio: updatedProfile.bio || '',
                });
            }
        },
        enabled: !isEditing, // Disable while editing to prevent conflicts
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await patientsApi.getMyProfile();
            setProfile(data);
            setFormData({
                first_name: data.first_name,
                last_name: data.last_name,
                date_of_birth: data.date_of_birth || '',
                gender: data.gender,
                blood_type: data.blood_type,
                phone: data.phone || '',
                address: data.address || '',
                city: data.city || '',
                country: data.country || '',
                postal_code: data.postal_code || '',
                bio: data.bio || '',
            });
        } catch (error: any) {
            showToast(error.response?.data?.detail || 'Failed to load profile', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadProfile();
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await patientsApi.updateMyProfile(formData);
            setProfile(updated);
            setIsEditing(false);
            showToast('Profile updated successfully!', 'success');
        } catch (error: any) {
            showToast(error.response?.data?.detail || 'Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setFormData({
                first_name: profile.first_name,
                last_name: profile.last_name,
                date_of_birth: profile.date_of_birth || '',
                gender: profile.gender,
                blood_type: profile.blood_type,
                phone: profile.phone || '',
                address: profile.address || '',
                city: profile.city || '',
                country: profile.country || '',
                postal_code: profile.postal_code || '',
                bio: profile.bio || '',
            });
        }
        setIsEditing(false);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <View className="items-center">
                    <View
                        className="w-20 h-20 rounded-full items-center justify-center mb-4"
                        style={{
                            backgroundColor: colors.primary[100],
                        }}
                    >
                        <ActivityIndicator size="large" color={colors.primary[600]} />
                    </View>
                    <Text className="text-base font-semibold text-gray-700">Loading your profile</Text>
                    <Text className="text-sm text-gray-500 mt-1">Please wait...</Text>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />

            {/* Compact Modern Header */}
            <LinearGradient
                colors={[colors.primary[600], colors.primary[500]]}
                className="pt-12 pb-4 px-5"
                style={{
                    borderBottomLeftRadius: 32,
                    borderBottomRightRadius: 32,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 8,
                }}
            >
                <Animatable.View animation="fadeInDown" duration={600}>
                    <View className="flex-row justify-between items-center mb-3">
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-white mb-0.5">
                                My Profile
                            </Text>
                            <Text className="text-xs text-white/80">
                                {isEditing ? '✏️ Editing mode' : '👤 View mode'}
                            </Text>
                        </View>

                        {!isEditing ? (
                            <TouchableOpacity
                                onPress={() => setIsEditing(true)}
                                className="bg-white/25 px-4 py-2 rounded-full flex-row items-center gap-2"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                }}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="create-outline" size={16} color="white" />
                                <Text className="text-white text-sm font-bold">Edit</Text>
                            </TouchableOpacity>
                        ) : (
                            <View className="flex-row gap-2">
                                <TouchableOpacity
                                    onPress={handleCancel}
                                    disabled={saving}
                                    className="bg-white/25 px-3 py-2 rounded-full"
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="close" size={18} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSave}
                                    disabled={saving}
                                    className="bg-green-500 px-4 py-2 rounded-full flex-row items-center gap-1.5"
                                    activeOpacity={0.8}
                                    style={{
                                        backgroundColor: saving ? colors.gray[400] : colors.success
                                    }}
                                >
                                    {saving ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <>
                                            <Ionicons name="checkmark" size={16} color="white" />
                                            <Text className="text-white text-sm font-bold">Save</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </Animatable.View>
            </LinearGradient>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }} // Extra padding for floating tabs
            >
                <View className="px-4 pt-5">
                    {/* Profile Hero Card */}
                    <Animatable.View
                        animation="zoomIn"
                        delay={150}
                        className="bg-white rounded-3xl overflow-hidden mb-4"
                        style={{
                            shadowColor: colors.primary[600],
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.15,
                            shadowRadius: 16,
                            elevation: 8,
                        }}
                    >
                        {/* Decorative Top Bar */}
                        <LinearGradient
                            colors={[colors.primary[500], colors.secondary[500]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="h-2"
                        />

                        <View className="p-6">
                            {/* Avatar Section */}
                            <View className="items-center mb-4">
                                <View className="relative mb-3">
                                    <LinearGradient
                                        colors={[colors.primary[400], colors.secondary[500]]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        className="w-28 h-28 rounded-full items-center justify-center"
                                        style={{
                                            shadowColor: colors.primary[600],
                                            shadowOffset: { width: 0, height: 6 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 12,
                                            elevation: 10,
                                        }}
                                    >
                                        <Text className="text-white text-4xl font-bold">
                                            {profile?.first_name?.charAt(0)?.toUpperCase()}
                                            {profile?.last_name?.charAt(0)?.toUpperCase()}
                                        </Text>
                                    </LinearGradient>
                                    {isEditing && (
                                        <TouchableOpacity
                                            className="absolute -right-1 bottom-0 bg-blue-600 w-9 h-9 rounded-full items-center justify-center border-4 border-white"
                                            activeOpacity={0.8}
                                            style={{
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: 0.25,
                                                shadowRadius: 4,
                                                elevation: 5,
                                            }}
                                        >
                                            <Ionicons name="camera" size={18} color="white" />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <Text className="text-2xl font-bold text-gray-900 mb-1">
                                    {profile?.first_name} {profile?.last_name}
                                </Text>
                                <View className="bg-gradient-to-r from-blue-100 to-teal-100 px-4 py-1.5 rounded-full">
                                    <Text className="text-xs font-bold text-blue-700">
                                        ID: {profile?.id.slice(0, 8).toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            {/* Quick Info Pills */}
                            <View className="flex-row flex-wrap gap-2 justify-center mt-4">
                                <View className="bg-red-50 px-4 py-2 rounded-full flex-row items-center gap-2 border border-red-100">
                                    <Ionicons name="water" size={16} color="#DC2626" />
                                    <Text className="text-sm font-bold text-red-700">
                                        {profile?.blood_type || 'N/A'}
                                    </Text>
                                </View>

                                <View className="bg-purple-50 px-4 py-2 rounded-full flex-row items-center gap-2 border border-purple-100">
                                    <Ionicons name="male-female" size={16} color="#9333EA" />
                                    <Text className="text-sm font-bold text-purple-700 capitalize">
                                        {profile?.gender || 'N/A'}
                                    </Text>
                                </View>

                                <View className="bg-blue-50 px-4 py-2 rounded-full flex-row items-center gap-2 border border-blue-100">
                                    <Ionicons name="calendar" size={16} color={colors.primary[600]} />
                                    <Text className="text-sm font-bold text-blue-700">
                                        {profile?.date_of_birth
                                            ? `${new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()} yrs`
                                            : 'N/A'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Animatable.View>

                    {/* Personal Information */}
                    <Animatable.View
                        animation="fadeInUp"
                        delay={250}
                        className="mb-4"
                    >
                        <View className="flex-row items-center mb-3 px-1">
                            <View
                                className="w-8 h-8 rounded-lg items-center justify-center mr-2"
                                style={{ backgroundColor: colors.primary[100] }}
                            >
                                <Ionicons name="person" size={18} color={colors.primary[600]} />
                            </View>
                            <Text className="text-lg font-bold text-gray-800">
                                Personal Details
                            </Text>
                        </View>

                        <View
                            className="bg-white rounded-2xl p-4"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 8,
                                elevation: 2,
                            }}
                        >
                            <View className="flex-row gap-2 mb-3">
                                <View className="flex-1">
                                    <Input
                                        label="First Name"
                                        value={formData.first_name}
                                        onChangeText={(text) =>
                                            setFormData({ ...formData, first_name: text })
                                        }
                                        editable={isEditing}
                                        icon="person-outline"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Input
                                        label="Last Name"
                                        value={formData.last_name}
                                        onChangeText={(text) =>
                                            setFormData({ ...formData, last_name: text })
                                        }
                                        editable={isEditing}
                                        icon="person-outline"
                                    />
                                </View>
                            </View>

                            <Input
                                label="Date of Birth"
                                value={formData.date_of_birth}
                                onChangeText={(text) =>
                                    setFormData({ ...formData, date_of_birth: text })
                                }
                                placeholder="YYYY-MM-DD"
                                editable={isEditing}
                                icon="calendar-outline"
                            />

                            {isEditing ? (
                                <>
                                    <Select
                                        label="Gender"
                                        value={formData.gender || ''}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, gender: value as any })
                                        }
                                        options={[
                                            { label: 'Male', value: 'male' },
                                            { label: 'Female', value: 'female' },
                                            { label: 'Other', value: 'other' },
                                        ]}
                                        placeholder="Select gender"
                                        icon="male-female-outline"
                                    />

                                    <Select
                                        label="Blood Type"
                                        value={formData.blood_type || ''}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, blood_type: value })
                                        }
                                        options={[
                                            { label: 'A+', value: 'A+' },
                                            { label: 'A-', value: 'A-' },
                                            { label: 'B+', value: 'B+' },
                                            { label: 'B-', value: 'B-' },
                                            { label: 'AB+', value: 'AB+' },
                                            { label: 'AB-', value: 'AB-' },
                                            { label: 'O+', value: 'O+' },
                                            { label: 'O-', value: 'O-' },
                                        ]}
                                        placeholder="Select blood type"
                                        icon="water-outline"
                                    />
                                </>
                            ) : (
                                <>
                                    <View className="mb-4">
                                        <Text className="text-sm font-semibold text-gray-700 mb-2">
                                            Gender
                                        </Text>
                                        <View className="flex-row items-center bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5">
                                            <Ionicons name="male-female-outline" size={20} color={colors.gray[700]} style={{ marginRight: 12 }} />
                                            <Text className="flex-1 text-base text-gray-700 capitalize">
                                                {formData.gender || 'Not specified'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="mb-4">
                                        <Text className="text-sm font-semibold text-gray-700 mb-2">
                                            Blood Type
                                        </Text>
                                        <View className="flex-row items-center bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5">
                                            <Ionicons name="water-outline" size={20} color={colors.gray[700]} style={{ marginRight: 12 }} />
                                            <Text className="flex-1 text-base text-gray-700">
                                                {formData.blood_type || 'Not specified'}
                                            </Text>
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>
                    </Animatable.View>

                    {/* Contact Information */}
                    <Animatable.View
                        animation="fadeInUp"
                        delay={300}
                        className="mb-4"
                    >
                        <View className="flex-row items-center mb-3 px-1">
                            <View
                                className="w-8 h-8 rounded-lg items-center justify-center mr-2"
                                style={{ backgroundColor: colors.secondary[100] }}
                            >
                                <Ionicons name="call" size={18} color={colors.secondary[600]} />
                            </View>
                            <Text className="text-lg font-bold text-gray-800">
                                Contact Info
                            </Text>
                        </View>

                        <View
                            className="bg-white rounded-2xl p-4"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 8,
                                elevation: 2,
                            }}
                        >
                            <Input
                                label="Phone Number"
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                placeholder="+216 XX XXX XXX"
                                editable={isEditing}
                                keyboardType="phone-pad"
                                icon="call-outline"
                            />
                        </View>
                    </Animatable.View>

                    {/* Address */}
                    <Animatable.View
                        animation="fadeInUp"
                        delay={350}
                        className="mb-4"
                    >
                        <View className="flex-row items-center mb-3 px-1">
                            <View
                                className="w-8 h-8 rounded-lg items-center justify-center mr-2"
                                style={{ backgroundColor: '#F3E8FF' }}
                            >
                                <Ionicons name="location" size={18} color="#9333EA" />
                            </View>
                            <Text className="text-lg font-bold text-gray-800">
                                Address
                            </Text>
                        </View>

                        <View
                            className="bg-white rounded-2xl p-4"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 8,
                                elevation: 2,
                            }}
                        >
                            <Input
                                label="Street Address"
                                value={formData.address}
                                onChangeText={(text) =>
                                    setFormData({ ...formData, address: text })
                                }
                                placeholder="123 Main Street"
                                editable={isEditing}
                                icon="location-outline"
                            />

                            <View className="flex-row gap-2">
                                <View className="flex-1">
                                    <Input
                                        label="City"
                                        value={formData.city}
                                        onChangeText={(text) =>
                                            setFormData({ ...formData, city: text })
                                        }
                                        placeholder="Tunis"
                                        editable={isEditing}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Input
                                        label="Postal Code"
                                        value={formData.postal_code}
                                        onChangeText={(text) =>
                                            setFormData({ ...formData, postal_code: text })
                                        }
                                        placeholder="1000"
                                        editable={isEditing}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <Input
                                label="Country"
                                value={formData.country}
                                onChangeText={(text) => setFormData({ ...formData, country: text })}
                                placeholder="Tunisia"
                                editable={isEditing}
                                icon="flag-outline"
                            />
                        </View>
                    </Animatable.View>

                    {/* About Me */}
                    <Animatable.View
                        animation="fadeInUp"
                        delay={400}
                        className="mb-4"
                    >
                        <View className="flex-row items-center mb-3 px-1">
                            <View
                                className="w-8 h-8 rounded-lg items-center justify-center mr-2"
                                style={{ backgroundColor: '#FED7AA' }}
                            >
                                <Ionicons name="document-text" size={18} color="#EA580C" />
                            </View>
                            <Text className="text-lg font-bold text-gray-800">
                                About Me
                            </Text>
                        </View>

                        <View
                            className="bg-white rounded-2xl p-4"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 8,
                                elevation: 2,
                            }}
                        >
                            {isEditing ? (
                                <View className="mb-4">
                                    <Text className="text-sm font-semibold text-gray-700 mb-2">Bio</Text>
                                    <View className="bg-white border-2 border-gray-200 rounded-xl p-3">
                                        <TextInput
                                            value={formData.bio}
                                            onChangeText={(text) => setFormData({ ...formData, bio: text })}
                                            placeholder="Tell us a bit about yourself..."
                                            placeholderTextColor={colors.gray[400]}
                                            multiline
                                            numberOfLines={4}
                                            style={{
                                                fontSize: 16,
                                                color: colors.gray[700],
                                                minHeight: 100,
                                                textAlignVertical: 'top',
                                            }}
                                        />
                                    </View>
                                </View>
                            ) : (
                                <View>
                                    <Text className="text-sm font-semibold text-gray-700 mb-2">Bio</Text>
                                    <View className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 min-h-[100px]">
                                        <Text className="text-base text-gray-700 leading-6">
                                            {formData.bio || 'No bio added yet.'}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </Animatable.View>

                    {/* Medical Information - Improved Design */}
                    <Animatable.View animation="fadeInUp" delay={450}>
                        <View className="flex-row items-center mb-4 px-1">
                            <LinearGradient
                                colors={[colors.primary[500], colors.secondary[500]]}
                                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                                style={{
                                    shadowColor: colors.primary[600],
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 4,
                                }}
                            >
                                <Ionicons name="medical" size={20} color="white" />
                            </LinearGradient>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-gray-800">
                                    Medical Information
                                </Text>
                                <Text className="text-xs text-gray-500">
                                    Health overview & contacts
                                </Text>
                            </View>
                        </View>

                        {/* Medical History Card */}
                        <TouchableOpacity
                            className="bg-white rounded-2xl p-4 mb-3 overflow-hidden"
                            activeOpacity={0.7}
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.08,
                                shadowRadius: 8,
                                elevation: 3,
                            }}
                            onPress={() => router.push('/(patient)/medical/history')}
                        >
                            <LinearGradient
                                colors={[colors.primary[500], colors.secondary[500]]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="absolute top-0 left-0 right-0 h-1"
                            />

                            <View className="flex-row items-center justify-between mb-3 mt-1">
                                <View className="flex-row items-center flex-1">
                                    <View
                                        className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                                        style={{ backgroundColor: colors.primary[50] }}
                                    >
                                        <Ionicons name="document-text" size={24} color={colors.primary[600]} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm text-gray-500 font-medium mb-0.5">
                                            Medical History
                                        </Text>
                                        <Text className="text-2xl font-bold text-gray-900">
                                            {profile?.medical_history?.length || 0}
                                        </Text>
                                    </View>
                                </View>
                                <View
                                    className="w-8 h-8 rounded-full items-center justify-center"
                                    style={{ backgroundColor: colors.primary[100] }}
                                >
                                    <Ionicons name="chevron-forward" size={18} color={colors.primary[600]} />
                                </View>
                            </View>
                            <Text className="text-xs text-gray-500">
                                Tap to view all conditions
                            </Text>
                        </TouchableOpacity>


                        {/* Allergies */}
                        <TouchableOpacity
                            className="bg-white rounded-2xl p-4 mb-3 overflow-hidden"
                            activeOpacity={0.7}
                            style={{
                                shadowColor: '#DC2626',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.08,
                                shadowRadius: 8,
                                elevation: 3,
                            }}
                            onPress={() => router.push('/(patient)/medical/allergies' as any)}
                        >
                            <LinearGradient
                                colors={["#DC2626", "#ff5454"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="absolute top-0 left-0 right-0 h-1"
                            />

                            <View className="flex-row items-center justify-between mb-3 mt-1">
                                <View className="flex-row items-center flex-1">
                                    <View
                                        className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                                        style={{ backgroundColor: '#ffb9b9' }}
                                    >
                                        <Ionicons name="warning" size={28} color="#DC2626" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm text-gray-500 font-medium mb-0.5">
                                            Allergies History
                                        </Text>
                                        <Text className="text-2xl font-bold text-gray-900">
                                            {profile?.allergies?.length || 0}
                                        </Text>
                                    </View>
                                </View>
                                <View
                                    className="w-8 h-8 rounded-full items-center justify-center"
                                    style={{ backgroundColor: "#ffb9b9" }}
                                >
                                    <Ionicons name="chevron-forward" size={18} color={"#DC2626"} />
                                </View>
                            </View>
                            <Text className="text-xs text-gray-500">
                                Know allergies
                            </Text>
                        </TouchableOpacity>


                        {/* Emergency Contacts Card */}
                        <TouchableOpacity
                            className="bg-white rounded-2xl p-4 overflow-hidden"
                            onPress={() => router.push('/(patient)/medical/emergency-contacts' as any)}
                            activeOpacity={0.7}
                            style={{
                                shadowColor: '#D97706',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.08,
                                shadowRadius: 8,
                                elevation: 3,
                            }}
                        >
                            <LinearGradient
                                colors={['#F59E0B', '#D97706']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="absolute top-0 left-0 right-0 h-1"
                            />

                            <View className="flex-row items-center justify-between mt-1">
                                <View className="flex-row items-center flex-1">
                                    <View
                                        className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                                        style={{ backgroundColor: '#FEF3C7' }}
                                    >
                                        <Ionicons name="call" size={28} color="#D97706" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm text-gray-500 font-medium mb-1">
                                            Emergency Contacts
                                        </Text>
                                        <Text className="text-2xl font-bold text-gray-900">
                                            {profile?.emergency_contacts?.length || 0}
                                        </Text>
                                        <Text className="text-xs text-gray-500 mt-0.5">
                                            {profile?.emergency_contacts?.length === 1 ? 'Contact' : 'Contacts'} saved
                                        </Text>
                                    </View>
                                </View>
                                <View
                                    className="w-10 h-10 rounded-full items-center justify-center"
                                    style={{ backgroundColor: '#FEF3C7' }}
                                >
                                    <Ionicons name="chevron-forward" size={20} color="#D97706" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animatable.View>
                </View>
            </ScrollView>
        </View>
    );
}