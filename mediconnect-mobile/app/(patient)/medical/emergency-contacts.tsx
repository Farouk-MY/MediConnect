import { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/constants/colors';
import { patientsApi, EmergencyContact } from '@/lib/api/patients';
import { useToast } from '@/lib/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';

export default function EmergencyContactsScreen() {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState<EmergencyContact>({
        name: '',
        relationship: '',
        phone: '',
        email: '',
    });

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            const profile = await patientsApi.getMyProfile();
            setContacts(profile.emergency_contacts || []);
        } catch (error: any) {
            showToast('Failed to load emergency contacts', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setFormData({ name: '', relationship: '', phone: '', email: '' });
        setEditingIndex(null);
        setShowAddModal(true);
    };

    const handleEdit = (index: number) => {
        setFormData(contacts[index]);
        setEditingIndex(index);
        setShowAddModal(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.phone.trim()) {
            showToast('Name and phone are required', 'error');
            return;
        }

        setSaving(true);
        try {
            if (editingIndex !== null) {
                // Update existing contact
                await patientsApi.updateEmergencyContact(editingIndex, formData);
                showToast('Contact updated', 'success');
            } else {
                // Add new contact
                await patientsApi.addEmergencyContact(formData);
                showToast('Contact added', 'success');
            }

            setShowAddModal(false);
            loadContacts(); // Reload to get updated list
        } catch (error: any) {
            showToast('Failed to save', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (index: number) => {
        try {
            await patientsApi.deleteEmergencyContact(index);
            showToast('Contact deleted', 'success');
            loadContacts();
        } catch (error: any) {
            showToast('Failed to delete', 'error');
        }
    };

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    const getRelationshipIcon = (relationship: string) => {
        const rel = relationship.toLowerCase();
        if (rel.includes('spouse') || rel.includes('partner')) return 'heart';
        if (rel.includes('parent') || rel.includes('mother') || rel.includes('father')) return 'people';
        if (rel.includes('sibling') || rel.includes('brother') || rel.includes('sister')) return 'person';
        if (rel.includes('child') || rel.includes('son') || rel.includes('daughter')) return 'person-add';
        if (rel.includes('friend')) return 'happy';
        return 'person-circle';
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
                colors={['#F59E0B', '#D97706']}
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
                        <Ionicons name="call" size={28} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-white mb-1">
                            Emergency Contacts
                        </Text>
                        <Text className="text-white/90 text-sm">
                            {contacts.length} contact{contacts.length !== 1 ? 's' : ''} saved
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
                {contacts.length === 0 ? (
                    <Animatable.View animation="fadeIn" className="items-center py-20">
                        <View
                            className="w-24 h-24 rounded-full items-center justify-center mb-4"
                            style={{ backgroundColor: '#FEF3C7' }}
                        >
                            <Ionicons name="call" size={48} color="#D97706" />
                        </View>
                        <Text className="text-xl font-bold text-gray-800 mb-2">
                            No Emergency Contacts
                        </Text>
                        <Text className="text-gray-500 text-center px-8 mb-6">
                            Add people to contact in case of medical emergencies
                        </Text>
                        <TouchableOpacity
                            onPress={handleAdd}
                            className="bg-amber-600 px-6 py-3 rounded-xl"
                        >
                            <Text className="text-white font-bold">Add First Contact</Text>
                        </TouchableOpacity>
                    </Animatable.View>
                ) : (
                    contacts.map((contact, index) => (
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
                            <View className="flex-row items-start mb-3">
                                <View
                                    className="w-14 h-14 rounded-full items-center justify-center mr-3"
                                    style={{ backgroundColor: '#FEF3C7' }}
                                >
                                    <Ionicons
                                        name={getRelationshipIcon(contact.relationship)}
                                        size={28}
                                        color="#D97706"
                                    />
                                </View>

                                <View className="flex-1 mr-3">
                                    <Text className="text-lg font-bold text-gray-900 mb-1">
                                        {contact.name}
                                    </Text>
                                    <View className="bg-amber-50 px-3 py-1 rounded-full self-start border border-amber-200">
                                        <Text className="text-xs font-bold text-amber-800 uppercase">
                                            {contact.relationship}
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

                            {/* Contact Info */}
                            <View className="space-y-2">
                                <TouchableOpacity
                                    onPress={() => handleCall(contact.phone)}
                                    className="flex-row items-center bg-green-50 p-3 rounded-xl border border-green-200"
                                    activeOpacity={0.7}
                                >
                                    <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
                                        <Ionicons name="call" size={16} color="#16A34A" />
                                    </View>
                                    <Text className="flex-1 text-green-900 font-semibold">
                                        {contact.phone}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={18} color="#16A34A" />
                                </TouchableOpacity>

                                {contact.email && (
                                    <View className="flex-row items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                                        <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                                            <Ionicons name="mail" size={16} color={colors.gray[600]} />
                                        </View>
                                        <Text className="flex-1 text-gray-700">
                                            {contact.email}
                                        </Text>
                                    </View>
                                )}
                            </View>
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
                                {editingIndex !== null ? 'Edit' : 'Add'} Emergency Contact
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
                                label="Full Name"
                                value={formData.name}
                                onChangeText={(text) =>
                                    setFormData({ ...formData, name: text })
                                }
                                placeholder="e.g., John Doe"
                                icon="person-outline"
                            />

                            <Input
                                label="Relationship"
                                value={formData.relationship}
                                onChangeText={(text) =>
                                    setFormData({ ...formData, relationship: text })
                                }
                                placeholder="e.g., Spouse, Parent, Friend"
                                icon="people-outline"
                            />

                            <Input
                                label="Phone Number"
                                value={formData.phone}
                                onChangeText={(text) =>
                                    setFormData({ ...formData, phone: text })
                                }
                                placeholder="+216 XX XXX XXX"
                                keyboardType="phone-pad"
                                icon="call-outline"
                            />

                            <Input
                                label="Email (Optional)"
                                value={formData.email || ''}
                                onChangeText={(text) =>
                                    setFormData({ ...formData, email: text })
                                }
                                placeholder="email@example.com"
                                keyboardType="email-address"
                                icon="mail-outline"
                            />

                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={saving}
                                className="py-4 rounded-xl items-center mt-4"
                                style={{
                                    backgroundColor: saving ? colors.gray[400] : '#D97706',
                                }}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text className="text-white font-bold text-base">
                                        {editingIndex !== null ? 'Update' : 'Add'} Contact
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