import { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { colors } from '@/lib/constants/colors';
import { qrApi, QRCodeResponse } from '@/lib/api/qr';
import { patientsApi } from '@/lib/api/patients';
import { useToast } from '@/lib/hooks/useToast';
import { Toast } from '@/components/ui/Toast';

const { width, height } = Dimensions.get('window');

export default function QRCodeScreen() {
    const { toast, showToast, hideToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [qrData, setQrData] = useState<QRCodeResponse | null>(null);
    const [patientName, setPatientName] = useState('');
    const [showFullScreen, setShowFullScreen] = useState(false);

    useEffect(() => {
        loadQRCode();
        loadPatientInfo();
    }, []);

    const loadPatientInfo = async () => {
        try {
            const profile = await patientsApi.getMyProfile();
            setPatientName(`${profile.first_name} ${profile.last_name}`);
        } catch (error) {
            console.error('Failed to load patient info');
        }
    };

    const loadQRCode = async () => {
        try {
            const data = await qrApi.generateMyQR();
            setQrData(data);
        } catch (error: any) {
            showToast(error.response?.data?.detail || 'Failed to load QR code', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        setGenerating(true);
        try {
            const data = await qrApi.generateMyQR();
            setQrData(data);
            showToast('QR code regenerated successfully', 'success');
        } catch (error: any) {
            showToast('Failed to regenerate QR code', 'error');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <View className="items-center">
                    <View
                        className="w-20 h-20 rounded-full items-center justify-center mb-4"
                        style={{ backgroundColor: colors.primary[100] }}
                    >
                        <ActivityIndicator size="large" color={colors.primary[600]} />
                    </View>
                    <Text className="text-base font-semibold text-gray-700">Generating QR Code</Text>
                    <Text className="text-sm text-gray-500 mt-1">Please wait...</Text>
                </View>
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
                <Animatable.View animation="fadeInDown" duration={600}>
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-white mb-1">
                                My QR Code
                            </Text>
                            <Text className="text-white/90 text-sm">
                                Show this to your doctor
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={handleRegenerate}
                            disabled={generating}
                            className="bg-white/20 px-4 py-2 rounded-full flex-row items-center gap-2"
                        >
                            {generating ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <>
                                    <Ionicons name="refresh" size={18} color="white" />
                                    <Text className="text-white font-bold text-sm">Refresh</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </Animatable.View>
            </LinearGradient>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-5 pt-6">
                    {/* Main QR Card */}
                    <Animatable.View
                        animation="zoomIn"
                        delay={200}
                        className="bg-white rounded-3xl overflow-hidden mb-5"
                        style={{
                            shadowColor: colors.primary[600],
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.2,
                            shadowRadius: 20,
                            elevation: 15,
                        }}
                    >
                        {/* Decorative Header */}
                        <LinearGradient
                            colors={[colors.primary[500], colors.secondary[500]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="py-4 px-5"
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-3">
                                    <View className="w-10 h-10 rounded-full bg-white/30 items-center justify-center">
                                        <Ionicons name="qr-code" size={24} color="white" />
                                    </View>
                                    <View>
                                        <Text className="text-white font-bold text-base">
                                            {patientName}
                                        </Text>
                                        <Text className="text-white/80 text-xs">
                                            Medical QR Code
                                        </Text>
                                    </View>
                                </View>
                                <View className="bg-green-500 px-3 py-1 rounded-full">
                                    <Text className="text-white text-xs font-bold">ACTIVE</Text>
                                </View>
                            </View>
                        </LinearGradient>

                        {/* QR Code Display */}
                        <TouchableOpacity
                            onPress={() => setShowFullScreen(true)}
                            activeOpacity={0.8}
                            className="p-8 items-center"
                        >
                            {qrData && (
                                <>
                                    <View
                                        className="bg-white p-6 rounded-2xl"
                                        style={{
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 8,
                                            elevation: 5,
                                        }}
                                    >
                                        <QRCode
                                            value={qrData.qr_data}
                                            size={width - 140}
                                            backgroundColor="white"
                                            color={colors.primary[700]}
                                        />
                                    </View>

                                    <View className="mt-4 flex-row items-center gap-2">
                                        <Ionicons name="expand" size={16} color={colors.primary[600]} />
                                        <Text className="text-primary-600 font-semibold text-sm">
                                            Tap to view fullscreen
                                        </Text>
                                    </View>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* QR Info */}
                        <View className="px-5 pb-5">
                            <View className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                                <View className="flex-row items-center gap-2 mb-2">
                                    <Ionicons name="information-circle" size={20} color={colors.primary[600]} />
                                    <Text className="text-primary-700 font-bold text-sm">
                                        Last Updated
                                    </Text>
                                </View>
                                <Text className="text-gray-600 text-sm">
                                    {new Date(qrData?.generated_at || '').toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    </Animatable.View>

                    {/* Instructions */}
                    <Animatable.View animation="fadeInUp" delay={400}>
                        <Text className="text-lg font-bold text-gray-800 mb-4 px-1">
                            How to Use
                        </Text>

                        <View className="space-y-3">
                            <View className="bg-white rounded-2xl p-4 flex-row items-start gap-4">
                                <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
                                    <Text className="text-blue-600 font-bold text-base">1</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-semibold mb-1">
                                        Show at Consultation
                                    </Text>
                                    <Text className="text-gray-600 text-sm leading-5">
                                        Present this QR code to your doctor during in-person visits
                                    </Text>
                                </View>
                            </View>

                            <View className="bg-white rounded-2xl p-4 flex-row items-start gap-4">
                                <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center">
                                    <Text className="text-purple-600 font-bold text-base">2</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-semibold mb-1">
                                        Doctor Scans
                                    </Text>
                                    <Text className="text-gray-600 text-sm leading-5">
                                        Your doctor will scan this code to access your medical information
                                    </Text>
                                </View>
                            </View>

                            <View className="bg-white rounded-2xl p-4 flex-row items-start gap-4">
                                <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">
                                    <Text className="text-green-600 font-bold text-base">3</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-semibold mb-1">
                                        Instant Access
                                    </Text>
                                    <Text className="text-gray-600 text-sm leading-5">
                                        Doctor gets instant access to your allergies, conditions, and emergency contacts
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Animatable.View>

                    {/* Security Notice */}
                    <Animatable.View animation="fadeInUp" delay={500} className="mt-6">
                        <View
                            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200"
                        >
                            <View className="flex-row items-start gap-3">
                                <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">
                                    <Ionicons name="shield-checkmark" size={24} color="#16A34A" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-green-900 font-bold text-sm mb-1">
                                        Secure & Encrypted
                                    </Text>
                                    <Text className="text-green-800 text-xs leading-5">
                                        Your medical data is encrypted. Only authorized healthcare providers can decrypt and view your information.
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Animatable.View>

                    {/* What's Included */}
                    <Animatable.View animation="fadeInUp" delay={600} className="mt-6">
                        <Text className="text-lg font-bold text-gray-800 mb-4 px-1">
                            Whats Included
                        </Text>

                        <View className="bg-white rounded-2xl p-4">
                            <View className="flex-row items-center gap-3 mb-3">
                                <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
                                <Text className="text-gray-700 flex-1">Personal Information</Text>
                            </View>
                            <View className="flex-row items-center gap-3 mb-3">
                                <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
                                <Text className="text-gray-700 flex-1">Blood Type & Gender</Text>
                            </View>
                            <View className="flex-row items-center gap-3 mb-3">
                                <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
                                <Text className="text-gray-700 flex-1">Allergies (Critical!)</Text>
                            </View>
                            <View className="flex-row items-center gap-3 mb-3">
                                <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
                                <Text className="text-gray-700 flex-1">Medical History</Text>
                            </View>
                            <View className="flex-row items-center gap-3">
                                <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
                                <Text className="text-gray-700 flex-1">Emergency Contacts</Text>
                            </View>
                        </View>
                    </Animatable.View>
                </View>
            </ScrollView>

            {/* Fullscreen QR Modal */}
            <Modal
                visible={showFullScreen}
                transparent
                animationType="fade"
                onRequestClose={() => setShowFullScreen(false)}
            >
                <View className="flex-1 bg-black">
                    <TouchableOpacity
                        onPress={() => setShowFullScreen(false)}
                        className="absolute top-12 right-5 z-10 w-12 h-12 rounded-full bg-white/20 items-center justify-center"
                    >
                        <Ionicons name="close" size={28} color="white" />
                    </TouchableOpacity>

                    <View className="flex-1 items-center justify-center p-5">
                        <Animatable.View
                            animation="zoomIn"
                            duration={400}
                            className="items-center"
                        >
                            <Text className="text-white text-2xl font-bold mb-6 text-center">
                                {patientName}
                            </Text>

                            {qrData && (
                                <View className="bg-white p-8 rounded-3xl">
                                    <QRCode
                                        value={qrData.qr_data}
                                        size={width - 80}
                                        backgroundColor="white"
                                        color="#000000"
                                    />
                                </View>
                            )}

                            <Text className="text-white/80 text-sm mt-6 text-center">
                                Point camera at this code to scan
                            </Text>
                        </Animatable.View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}