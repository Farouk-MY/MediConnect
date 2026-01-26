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
import { patientsApi, MedicalHistoryItem } from '@/lib/api/patients';
import { useToast } from '@/lib/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';

export default function MedicalHistoryScreen() {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [history, setHistory] = useState<MedicalHistoryItem[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState<MedicalHistoryItem>({
        condition: '',
        diagnosed_date: '',
        notes: '',
    });

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const profile = await patientsApi.getMyProfile();
            setHistory(profile.medical_history || []);
        } catch (error: any) {
            showToast('Failed to load medical history', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setFormData({ condition: '', diagnosed_date: '', notes: '' });
        setEditingIndex(null);
        setShowAddModal(true);
    };

    const handleEdit = (index: number) => {
        setFormData(history[index]);
        setEditingIndex(index);
        setShowAddModal(true);
    };

    const handleSave = async () => {
        if (!formData.condition.trim()) {
            showToast('Please enter a condition', 'error');
            return;
        }

        setSaving(true);
        try {
            const updatedHistory = [...history];
            if (editingIndex !== null) {
                updatedHistory[editingIndex] = formData;
            } else {
                updatedHistory.push(formData);
            }

            await patientsApi.updateMyProfile({ medical_history: updatedHistory });
            setHistory(updatedHistory);
            setShowAddModal(false);
            showToast(
                editingIndex !== null ? 'Condition updated' : 'Condition added',
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
            const updatedHistory = history.filter((_, i) => i !== index);
            await patientsApi.updateMyProfile({ medical_history: updatedHistory });
            setHistory(updatedHistory);
            showToast('Condition deleted', 'success');
        } catch (error: any) {
            showToast('Failed to delete', 'error');
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
                colors={[colors.primary[600], colors.primary[500]]}
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

                <Text className="text-2xl font-bold text-white mb-1">
                    Medical History
                </Text>
                <Text className="text-white/90 text-sm">
                    {history.length} condition{history.length !== 1 ? 's' : ''} recorded
                </Text>
            </LinearGradient>

            <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
                {history.length === 0 ? (
                    <Animatable.View animation="fadeIn" className="items-center py-20">
                        <View
                            className="w-24 h-24 rounded-full items-center justify-center mb-4"
                            style={{ backgroundColor: colors.primary[100] }}
                        >
                            <Ionicons name="document-text" size={48} color={colors.primary[600]} />
                        </View>
                        <Text className="text-xl font-bold text-gray-800 mb-2">
                            No Medical History
                        </Text>
                        <Text className="text-gray-500 text-center px-8 mb-6">
                            Start tracking your medical conditions and diagnoses
                        </Text>
                        <TouchableOpacity
                            onPress={handleAdd}
                            className="bg-blue-600 px-6 py-3 rounded-xl"
                        >
                            <Text className="text-white font-bold">Add First Condition</Text>
                        </TouchableOpacity>
                    </Animatable.View>
                ) : (
                    history.map((item, index) => (
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
                                    <Text className="text-lg font-bold text-gray-900 mb-1">
                                        {item.condition}
                                    </Text>
                                    {item.diagnosed_date && (
                                        <View className="flex-row items-center gap-1">
                                            <Ionicons name="calendar-outline" size={14} color={colors.gray[500]} />
                                            <Text className="text-sm text-gray-500">
                                                Diagnosed: {item.diagnosed_date}
                                            </Text>
                                        </View>
                                    )}
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

                            {item.notes && (
                                <View
                                    className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                                >
                                    <Text className="text-sm text-gray-700 leading-5">
                                        {item.notes}
                                    </Text>
                                </View>
                            )}
                        </Animatable.View>
                    ))
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
                                {editingIndex !== null ? 'Edit' : 'Add'} Condition
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
                                label="Condition Name"
                                value={formData.condition}
                                onChangeText={(text) =>
                                    setFormData({ ...formData, condition: text })
                                }
                                placeholder="e.g., Hypertension, Diabetes"
                                icon="medical-outline"
                            />


                            <DatePicker
                                label="Diagnosed Date (Optional)"
                                value={formData.diagnosed_date || ''}
                                onValueChange={(date) =>
                                    setFormData({ ...formData, diagnosed_date: date })
                                }
                                placeholder="Select diagnosis date"
                                icon="calendar-outline"
                                disableFutureDates={true} // Add this line to disable future dates
                            />

                            <View className="mb-4">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">
                                    Notes (Optional)
                                </Text>
                                <View className="bg-white border-2 border-gray-200 rounded-xl p-3">
                                    <TextInput
                                        value={formData.notes || ''}
                                        onChangeText={(text) =>
                                            setFormData({ ...formData, notes: text })
                                        }
                                        placeholder="Additional information..."
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
                                className="bg-blue-600 py-4 rounded-xl items-center mt-4"
                                style={{
                                    backgroundColor: saving ? colors.gray[400] : colors.primary[600],
                                }}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text className="text-white font-bold text-base">
                                        {editingIndex !== null ? 'Update' : 'Add'} Condition
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