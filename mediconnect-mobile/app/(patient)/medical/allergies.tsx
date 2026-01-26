import { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/constants/colors';
import { patientsApi, AllergyItem } from '@/lib/api/patients';
import { useToast } from '@/lib/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function AllergiesScreen() {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [allergies, setAllergies] = useState<AllergyItem[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState<AllergyItem>({
        allergen: '',
        severity: 'mild',
        reaction: '',
    });

    useEffect(() => {
        loadAllergies();
    }, []);

    const loadAllergies = async () => {
        try {
            const profile = await patientsApi.getMyProfile();
            setAllergies(profile.allergies || []);
        } catch (error: any) {
            showToast('Failed to load allergies', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setFormData({ allergen: '', severity: 'mild', reaction: '' });
        setEditingIndex(null);
        setShowAddModal(true);
    };

    const handleEdit = (index: number) => {
        setFormData(allergies[index]);
        setEditingIndex(index);
        setShowAddModal(true);
    };

    const handleSave = async () => {
        if (!formData.allergen.trim()) {
            showToast('Please enter an allergen', 'error');
            return;
        }

        setSaving(true);
        try {
            const updatedAllergies = [...allergies];
            if (editingIndex !== null) {
                updatedAllergies[editingIndex] = formData;
            } else {
                updatedAllergies.push(formData);
            }

            await patientsApi.updateMyProfile({ allergies: updatedAllergies });
            setAllergies(updatedAllergies);
            setShowAddModal(false);
            showToast(
                editingIndex !== null ? 'Allergy updated' : 'Allergy added',
                'success'
            );
        } catch (error: any) {
            showToast('Failed to save', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (index: number) => {
        try {
            const updatedAllergies = allergies.filter((_, i) => i !== index);
            await patientsApi.updateMyProfile({ allergies: updatedAllergies });
            setAllergies(updatedAllergies);
            showToast('Allergy deleted', 'success');
        } catch (error: any) {
            showToast('Failed to delete', 'error');
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'severe':
                return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' };
            case 'moderate':
                return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
            default:
                return { bg: '#DBEAFE', text: '#2563EB', border: '#BFDBFE' };
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color={colors.primary[600]} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />

            {/* Header */}
            <LinearGradient
                colors={['#DC2626', '#EF4444']}
                className="pt-12 pb-6 px-5"
            >
                <View className="flex-row items-center justify-between mb-2">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleAdd}
                        className="bg-white/20 px-4 py-2 rounded-full flex-row items-center gap-2"
                    >
                        <Ionicons name="add-circle" size={20} color="white" />
                        <Text className="text-white font-bold">Add New</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center gap-3 mb-2">
                    <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
                        <Ionicons name="warning" size={28} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-white mb-1">
                            Allergies
                        </Text>
                        <Text className="text-white/90 text-sm">
                            {allergies.length} allergen{allergies.length !== 1 ? 's' : ''} recorded
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
                {allergies.length === 0 ? (
                    <Animatable.View animation="fadeIn" className="items-center py-20">
                        <View
                            className="w-24 h-24 rounded-full items-center justify-center mb-4"
                            style={{ backgroundColor: '#FEE2E2' }}
                        >
                            <Ionicons name="warning" size={48} color="#DC2626" />
                        </View>
                        <Text className="text-xl font-bold text-gray-800 mb-2">
                            No Allergies Recorded
                        </Text>
                        <Text className="text-gray-500 text-center px-8 mb-6">
                            Keep track of your known allergies for safer medical care
                        </Text>
                        <TouchableOpacity
                            onPress={handleAdd}
                            className="bg-red-600 px-6 py-3 rounded-xl"
                        >
                            <Text className="text-white font-bold">Add First Allergy</Text>
                        </TouchableOpacity>
                    </Animatable.View>
                ) : (
                    allergies.map((item, index) => {
                        const severityColors = getSeverityColor(item.severity);
                        return (
                            <Animatable.View
                                key={index}
                                animation="fadeInUp"
                                delay={index * 100}
                                className="bg-white rounded-2xl p-4 mb-3"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.08,
                                    shadowRadius: 8,
                                    elevation: 3,
                                }}
                            >
                                <View className="flex-row justify-between items-start mb-3">
                                    <View className="flex-1 mr-3">
                                        <View className="flex-row items-center gap-2 mb-2">
                                            <Ionicons name="warning" size={20} color="#DC2626" />
                                            <Text className="text-lg font-bold text-gray-900">
                                                {item.allergen}
                                            </Text>
                                        </View>

                                        <View
                                            className="px-3 py-1.5 rounded-full self-start"
                                            style={{
                                                backgroundColor: severityColors.bg,
                                                borderWidth: 1,
                                                borderColor: severityColors.border,
                                            }}
                                        >
                                            <Text
                                                className="text-xs font-bold uppercase"
                                                style={{ color: severityColors.text }}
                                            >
                                                {item.severity}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row gap-2">
                                        <TouchableOpacity
                                            onPress={() => handleEdit(index)}
                                            className="w-8 h-8 rounded-full items-center justify-center"
                                            style={{ backgroundColor: colors.primary[100] }}
                                        >
                                            <Ionicons name="create" size={16} color={colors.primary[600]} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDelete(index)}
                                            className="w-8 h-8 rounded-full bg-red-100 items-center justify-center"
                                        >
                                            <Ionicons name="trash" size={16} color="#DC2626" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {item.reaction && (
                                    <View className="bg-red-50 rounded-xl p-3 border border-red-100">
                                        <Text className="text-xs font-semibold text-red-900 mb-1">
                                            REACTION:
                                        </Text>
                                        <Text className="text-sm text-red-800 leading-5">
                                            {item.reaction}
                                        </Text>
                                    </View>
                                )}
                            </Animatable.View>
                        );
                    })
                )}

                <View className="h-32" />
            </ScrollView>

            {/* Add/Edit Modal */}
            <Modal
                visible={showAddModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAddModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6 max-h-[85%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900">
                                {editingIndex !== null ? 'Edit' : 'Add'} Allergy
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowAddModal(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                            >
                                <Ionicons name="close" size={20} color={colors.gray[600]} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Input
                                label="Allergen"
                                value={formData.allergen}
                                onChangeText={(text) =>
                                    setFormData({ ...formData, allergen: text })
                                }
                                placeholder="e.g., Penicillin, Peanuts, Latex"
                                icon="warning-outline"
                            />

                            <Select
                                label="Severity Level"
                                value={formData.severity}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, severity: value as any })
                                }
                                options={[
                                    { label: 'Mild', value: 'mild' },
                                    { label: 'Moderate', value: 'moderate' },
                                    { label: 'Severe', value: 'severe' },
                                ]}
                                icon="alert-circle-outline"
                            />

                            <View className="mb-4">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">
                                    Reaction (Optional)
                                </Text>
                                <View className="bg-white border-2 border-gray-200 rounded-xl p-3">
                                    <TextInput
                                        value={formData.reaction || ''}
                                        onChangeText={(text) =>
                                            setFormData({ ...formData, reaction: text })
                                        }
                                        placeholder="Describe the reaction..."
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

                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={saving}
                                className="py-4 rounded-xl items-center mt-4"
                                style={{
                                    backgroundColor: saving ? colors.gray[400] : '#DC2626',
                                }}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text className="text-white font-bold text-base">
                                        {editingIndex !== null ? 'Update' : 'Add'} Allergy
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}