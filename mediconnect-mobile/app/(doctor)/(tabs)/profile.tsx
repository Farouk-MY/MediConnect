import { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Modal,
    Dimensions,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { colors } from '@/lib/constants/colors';
import { doctorsApi, DoctorProfile, DoctorUpdateRequest, EducationItem } from '@/lib/api/doctors';
import { useToast } from '@/lib/hooks/useToast';
import { Toast } from '@/components/ui/Toast';

const { width } = Dimensions.get('window');

// Clear, Visible Tab Button
const TabButton = ({ active, icon, label, onPress }: any) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="flex-1 py-3 items-center"
    >
        {active ? (
            <LinearGradient
                colors={[colors.secondary[500], colors.secondary[600]]}
                className="px-6 py-3 rounded-2xl flex-row items-center"
                style={{
                    shadowColor: colors.secondary[600],
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                }}
            >
                <Ionicons name={icon} size={18} color="white" />
                <Text className="text-white font-bold text-sm ml-2">{label}</Text>
            </LinearGradient>
        ) : (
            <View className="px-6 py-3 rounded-2xl flex-row items-center bg-gray-100">
                <Ionicons name={icon} size={18} color={colors.gray[500]} />
                <Text className="text-gray-500 font-bold text-sm ml-2">{label}</Text>
            </View>
        )}
    </TouchableOpacity>
);

// Section Header
const SectionHeader = ({ title, icon }: any) => (
    <View className="flex-row items-center mb-4 mt-4">
        <View
            className="w-8 h-8 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: `${colors.secondary[500]}15` }}
        >
            <Ionicons name={icon} size={18} color={colors.secondary[600]} />
        </View>
        <Text className="text-gray-900 font-bold text-base">{title}</Text>
    </View>
);

// Card Wrapper
const Card = ({ children, className = '' }: any) => (
    <View
        className={`bg-white rounded-2xl p-4 mb-3 ${className}`}
        style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
        }}
    >
        {children}
    </View>
);

export default function DoctorProfileScreen() {
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const [activeTab, setActiveTab] = useState<'info' | 'cabinet' | 'pricing'>('info');
    const [formData, setFormData] = useState<DoctorUpdateRequest>({});

    const [showEducationModal, setShowEducationModal] = useState(false);
    const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null);
    const [educationForm, setEducationForm] = useState<EducationItem>({
        degree: '',
        institution: '',
        year: new Date().getFullYear(),
        country: '',
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await doctorsApi.getMyProfile();
            setProfile(data);
            setFormData({
                first_name: data.first_name,
                last_name: data.last_name,
                specialty: data.specialty,
                years_experience: data.years_experience,
                bio: data.bio || '',
                languages: data.languages || [],
                education: data.education || [],
                cabinet_address: data.cabinet_address || '',
                cabinet_city: data.cabinet_city || '',
                cabinet_country: data.cabinet_country || '',
                cabinet_postal_code: data.cabinet_postal_code || '',
                cabinet_phone: data.cabinet_phone || '',
                cabinet_email: data.cabinet_email || '',
                latitude: data.latitude,
                longitude: data.longitude,
                consultation_fee_presentiel: data.consultation_fee_presentiel,
                consultation_fee_online: data.consultation_fee_online,
                currency: data.currency,
                payment_methods: data.payment_methods || [],
                offers_presentiel: data.offers_presentiel,
                offers_online: data.offers_online,
                is_accepting_patients: data.is_accepting_patients,
            });
        } catch (error: any) {
            showToast('Failed to load profile', 'error');
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
            const updated = await doctorsApi.updateMyProfile(formData);
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
                specialty: profile.specialty,
                years_experience: profile.years_experience,
                bio: profile.bio || '',
                languages: profile.languages || [],
                education: profile.education || [],
                cabinet_address: profile.cabinet_address || '',
                cabinet_city: profile.cabinet_city || '',
                cabinet_country: profile.cabinet_country || '',
                cabinet_postal_code: profile.cabinet_postal_code || '',
                cabinet_phone: profile.cabinet_phone || '',
                cabinet_email: profile.cabinet_email || '',
                latitude: profile.latitude,
                longitude: profile.longitude,
                consultation_fee_presentiel: profile.consultation_fee_presentiel,
                consultation_fee_online: profile.consultation_fee_online,
                currency: profile.currency,
                payment_methods: profile.payment_methods || [],
                offers_presentiel: profile.offers_presentiel,
                offers_online: profile.offers_online,
                is_accepting_patients: profile.is_accepting_patients,
            });
        }
        setIsEditing(false);
    };

    const handleAddEducation = () => {
        setEducationForm({
            degree: '',
            institution: '',
            year: new Date().getFullYear(),
            country: '',
        });
        setEditingEducationIndex(null);
        setShowEducationModal(true);
    };

    const handleSaveEducation = () => {
        const currentEducation = formData.education || [];
        if (editingEducationIndex !== null) {
            currentEducation[editingEducationIndex] = educationForm;
        } else {
            currentEducation.push(educationForm);
        }
        setFormData({ ...formData, education: currentEducation });
        setShowEducationModal(false);
    };

    const handleDeleteEducation = (index: number) => {
        const currentEducation = formData.education || [];
        currentEducation.splice(index, 1);
        setFormData({ ...formData, education: currentEducation });
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color={colors.secondary[500]} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <Toast {...toast} onHide={hideToast} />

            {/* Clean Header */}
            <LinearGradient
                colors={[colors.secondary[500], colors.secondary[600]]}
                className="pt-12 pb-6 px-5"
                style={{
                    borderBottomLeftRadius: 32,
                    borderBottomRightRadius: 32,
                }}
            >
                <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-1">
                        <Text className="text-white/80 text-xs font-semibold mb-1">
                            Doctor Profile
                        </Text>
                        <Text className="text-white text-2xl font-bold">
                            Dr. {formData.first_name} {formData.last_name}
                        </Text>
                    </View>

                    {!isEditing ? (
                        <TouchableOpacity
                            onPress={() => setIsEditing(true)}
                            className="bg-white/25 px-5 py-2.5 rounded-xl flex-row items-center"
                        >
                            <Ionicons name="create-outline" size={18} color="white" />
                            <Text className="text-white font-bold ml-2 text-sm">Edit</Text>
                        </TouchableOpacity>
                    ) : (
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={handleCancel}
                                className="bg-white/20 px-4 py-2.5 rounded-xl"
                            >
                                <Text className="text-white font-bold text-sm">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSave}
                                className="bg-white px-5 py-2.5 rounded-xl flex-row items-center"
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color={colors.secondary[600]} />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark" size={18} color={colors.secondary[600]} />
                                        <Text className="font-bold ml-1 text-sm" style={{ color: colors.secondary[600] }}>
                                            Save
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Specialty Badge */}
                <View className="flex-row items-center gap-2">
                    <View className="bg-white/25 px-3 py-1.5 rounded-lg">
                        <Text className="text-white text-xs font-bold">
                            {formData.specialty || 'General Practice'}
                        </Text>
                    </View>
                    <View className="bg-white/25 px-3 py-1.5 rounded-lg">
                        <Text className="text-white text-xs font-bold">
                            {formData.years_experience || 0} Years
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Clear Tab Navigation */}
                <View className="px-5 mt-5 mb-4">
                    <View className="bg-white rounded-2xl p-2 flex-row"
                          style={{
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.08,
                              shadowRadius: 8,
                              elevation: 3,
                          }}
                    >
                        <TabButton
                            active={activeTab === 'info'}
                            icon="person-circle"
                            label="Info"
                            onPress={() => setActiveTab('info')}
                        />
                        <TabButton
                            active={activeTab === 'cabinet'}
                            icon="business"
                            label="Cabinet"
                            onPress={() => setActiveTab('cabinet')}
                        />
                        <TabButton
                            active={activeTab === 'pricing'}
                            icon="cash"
                            label="Pricing"
                            onPress={() => setActiveTab('pricing')}
                        />
                    </View>
                </View>

                {/* Content */}
                <View className="px-5">
                    {activeTab === 'info' && (
                        <View>
                            <SectionHeader icon="person" title="Basic Information" />

                            <Card>
                                <Input
                                    label="First Name"
                                    value={formData.first_name}
                                    onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                                    editable={isEditing}
                                    icon="person-outline"
                                />

                                <Input
                                    label="Last Name"
                                    value={formData.last_name}
                                    onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                                    editable={isEditing}
                                    icon="person-outline"
                                />

                                <Input
                                    label="Specialty"
                                    value={formData.specialty}
                                    onChangeText={(text) => setFormData({ ...formData, specialty: text })}
                                    editable={isEditing}
                                    icon="medical-outline"
                                />

                                <Input
                                    label="Years of Experience"
                                    value={formData.years_experience?.toString()}
                                    onChangeText={(text) => setFormData({ ...formData, years_experience: parseInt(text) || 0 })}
                                    editable={isEditing}
                                    keyboardType="numeric"
                                    icon="trophy-outline"
                                />

                                <Input
                                    label="Bio"
                                    value={formData.bio}
                                    onChangeText={(text) => setFormData({ ...formData, bio: text })}
                                    editable={isEditing}
                                    multiline
                                    numberOfLines={4}
                                    icon="document-text-outline"
                                />
                            </Card>

                            {/* Education */}
                            <SectionHeader icon="school" title="Education" />

                            {formData.education && formData.education.length > 0 ? (
                                formData.education.map((edu, index) => (
                                    <Card key={index}>
                                        <View className="flex-row">
                                            <View
                                                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                                                style={{ backgroundColor: `${colors.secondary[500]}15` }}
                                            >
                                                <Ionicons name="school" size={20} color={colors.secondary[600]} />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-gray-900 font-bold mb-1">{edu.degree}</Text>
                                                <Text className="text-gray-600 text-sm mb-1">{edu.institution}</Text>
                                                <Text className="text-gray-500 text-xs">{edu.year} • {edu.country}</Text>
                                            </View>
                                            {isEditing && (
                                                <TouchableOpacity
                                                    onPress={() => handleDeleteEducation(index)}
                                                    className="w-9 h-9 rounded-xl items-center justify-center"
                                                    style={{ backgroundColor: '#FEE2E2' }}
                                                >
                                                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </Card>
                                ))
                            ) : (
                                <Card>
                                    <View className="items-center py-6">
                                        <Ionicons name="school-outline" size={40} color={colors.gray[300]} />
                                        <Text className="text-gray-500 text-sm mt-2">No education added</Text>
                                    </View>
                                </Card>
                            )}

                            {isEditing && (
                                <TouchableOpacity
                                    onPress={handleAddEducation}
                                    className="bg-white rounded-2xl p-4 flex-row items-center justify-center border-2 border-dashed mb-3"
                                    style={{ borderColor: colors.secondary[300] }}
                                >
                                    <Ionicons name="add-circle" size={22} color={colors.secondary[600]} />
                                    <Text className="ml-2 font-bold" style={{ color: colors.secondary[600] }}>
                                        Add Education
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {/* Status */}
                            <SectionHeader icon="pulse" title="Status" />

                            <TouchableOpacity
                                onPress={() => isEditing && setFormData({
                                    ...formData,
                                    is_accepting_patients: !formData.is_accepting_patients
                                })}
                                disabled={!isEditing}
                            >
                                <Card>
                                    <View className="flex-row items-center">
                                        <View
                                            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                                            style={{
                                                backgroundColor: formData.is_accepting_patients
                                                    ? `${colors.secondary[500]}15`
                                                    : '#FEE2E2'
                                            }}
                                        >
                                            <Ionicons
                                                name={formData.is_accepting_patients ? "checkmark-circle" : "close-circle"}
                                                size={22}
                                                color={formData.is_accepting_patients ? colors.secondary[600] : '#EF4444'}
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-900 font-bold">Accepting New Patients</Text>
                                            <Text className="text-gray-500 text-xs">
                                                {formData.is_accepting_patients ? 'Currently accepting' : 'Not accepting'}
                                            </Text>
                                        </View>
                                    </View>
                                </Card>
                            </TouchableOpacity>
                        </View>
                    )}

                    {activeTab === 'cabinet' && (
                        <View>
                            <SectionHeader icon="location" title="Address" />

                            <Card>
                                <Input
                                    label="Address"
                                    value={formData.cabinet_address}
                                    onChangeText={(text) => setFormData({ ...formData, cabinet_address: text })}
                                    editable={isEditing}
                                    icon="location-outline"
                                />

                                <View className="flex-row gap-3">
                                    <View className="flex-1">
                                        <Input
                                            label="City"
                                            value={formData.cabinet_city}
                                            onChangeText={(text) => setFormData({ ...formData, cabinet_city: text })}
                                            editable={isEditing}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Input
                                            label="Postal Code"
                                            value={formData.cabinet_postal_code}
                                            onChangeText={(text) => setFormData({ ...formData, cabinet_postal_code: text })}
                                            editable={isEditing}
                                        />
                                    </View>
                                </View>

                                <Input
                                    label="Country"
                                    value={formData.cabinet_country}
                                    onChangeText={(text) => setFormData({ ...formData, cabinet_country: text })}
                                    editable={isEditing}
                                    icon="flag-outline"
                                />
                            </Card>

                            <SectionHeader icon="call" title="Contact" />

                            <Card>
                                <Input
                                    label="Phone"
                                    value={formData.cabinet_phone}
                                    onChangeText={(text) => setFormData({ ...formData, cabinet_phone: text })}
                                    editable={isEditing}
                                    keyboardType="phone-pad"
                                    icon="call-outline"
                                />

                                <Input
                                    label="Email"
                                    value={formData.cabinet_email}
                                    onChangeText={(text) => setFormData({ ...formData, cabinet_email: text })}
                                    editable={isEditing}
                                    keyboardType="email-address"
                                    icon="mail-outline"
                                />
                            </Card>
                        </View>
                    )}

                    {activeTab === 'pricing' && (
                        <View>
                            <SectionHeader icon="options" title="Consultation Types" />

                            <TouchableOpacity
                                onPress={() => isEditing && setFormData({ ...formData, offers_presentiel: !formData.offers_presentiel })}
                                disabled={!isEditing}
                            >
                                <Card className={formData.offers_presentiel ? 'border-2' : ''}
                                      style={{ borderColor: formData.offers_presentiel ? colors.secondary[500] : 'transparent' }}
                                >
                                    <View className="flex-row items-center">
                                        <Ionicons
                                            name={formData.offers_presentiel ? 'checkmark-circle' : 'ellipse-outline'}
                                            size={28}
                                            color={formData.offers_presentiel ? colors.secondary[600] : colors.gray[400]}
                                        />
                                        <View className="ml-3 flex-1">
                                            <Text className="text-gray-900 font-bold">In-Person Consultations</Text>
                                            <Text className="text-gray-500 text-xs">Face-to-face appointments</Text>
                                        </View>
                                    </View>
                                </Card>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => isEditing && setFormData({ ...formData, offers_online: !formData.offers_online })}
                                disabled={!isEditing}
                            >
                                <Card className={formData.offers_online ? 'border-2' : ''}
                                      style={{ borderColor: formData.offers_online ? colors.secondary[500] : 'transparent' }}
                                >
                                    <View className="flex-row items-center">
                                        <Ionicons
                                            name={formData.offers_online ? 'checkmark-circle' : 'ellipse-outline'}
                                            size={28}
                                            color={formData.offers_online ? colors.secondary[600] : colors.gray[400]}
                                        />
                                        <View className="ml-3 flex-1">
                                            <Text className="text-gray-900 font-bold">Online Consultations</Text>
                                            <Text className="text-gray-500 text-xs">Video call appointments</Text>
                                        </View>
                                    </View>
                                </Card>
                            </TouchableOpacity>

                            <SectionHeader icon="card" title="Fees" />

                            <Card>
                                <Input
                                    label="In-Person Fee"
                                    value={formData.consultation_fee_presentiel?.toString()}
                                    onChangeText={(text) => setFormData({
                                        ...formData,
                                        consultation_fee_presentiel: parseFloat(text) || 0
                                    })}
                                    editable={isEditing}
                                    keyboardType="numeric"
                                    icon="cash-outline"
                                />

                                <Input
                                    label="Online Fee"
                                    value={formData.consultation_fee_online?.toString()}
                                    onChangeText={(text) => setFormData({
                                        ...formData,
                                        consultation_fee_online: parseFloat(text) || 0
                                    })}
                                    editable={isEditing}
                                    keyboardType="numeric"
                                    icon="videocam-outline"
                                />

                                <Input
                                    label="Currency"
                                    value={formData.currency}
                                    onChangeText={(text) => setFormData({ ...formData, currency: text })}
                                    editable={isEditing}
                                    icon="card-outline"
                                />
                            </Card>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Education Modal */}
            <Modal
                visible={showEducationModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowEducationModal(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />

                        <Text className="text-xl font-bold text-gray-900 mb-6">Add Education</Text>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Input
                                label="Degree"
                                value={educationForm.degree}
                                onChangeText={(text) => setEducationForm({ ...educationForm, degree: text })}
                                placeholder="e.g., MD, PhD"
                            />

                            <Input
                                label="Institution"
                                value={educationForm.institution}
                                onChangeText={(text) => setEducationForm({ ...educationForm, institution: text })}
                                placeholder="e.g., Harvard Medical School"
                            />

                            <Input
                                label="Year"
                                value={educationForm.year.toString()}
                                onChangeText={(text) => setEducationForm({
                                    ...educationForm,
                                    year: parseInt(text) || new Date().getFullYear()
                                })}
                                keyboardType="numeric"
                            />

                            <Input
                                label="Country"
                                value={educationForm.country}
                                onChangeText={(text) => setEducationForm({ ...educationForm, country: text })}
                                placeholder="e.g., United States"
                            />
                        </ScrollView>

                        <View className="flex-row gap-3 mt-6">
                            <TouchableOpacity
                                onPress={() => setShowEducationModal(false)}
                                className="flex-1 bg-gray-100 py-3.5 rounded-xl"
                            >
                                <Text className="text-gray-700 font-bold text-center">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSaveEducation}
                                className="flex-1 py-3.5 rounded-xl"
                            >
                                <LinearGradient
                                    colors={[colors.secondary[500], colors.secondary[600]]}
                                    className="absolute inset-0 rounded-xl"
                                />
                                <Text className="text-white font-bold text-center">Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}