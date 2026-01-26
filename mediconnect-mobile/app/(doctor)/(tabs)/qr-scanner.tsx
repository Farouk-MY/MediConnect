import { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { Camera, CameraView, BarcodeScanningResult } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/constants/colors';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/lib/hooks/useToast';
import { Toast } from '@/components/ui/Toast';

interface PatientData {
    patient_id: string;
    first_name: string;
    last_name: string;
    date_of_birth?: string;
    gender?: string;
    blood_type?: string;
    phone?: string;
    allergies: any[];
    medical_history: any[];
    current_medications: any[];
    emergency_contacts: any[];
    generated_at: string;
}

export default function QRScannerScreen() {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [patientData, setPatientData] = useState<PatientData | null>(null);
    const [showResults, setShowResults] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        requestCameraPermission();
    }, []);

    const requestCameraPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
    };

    const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
        if (scanned || scanning) return;

        setScanned(true);
        setScanning(true);

        try {
            // Call backend to decrypt QR code
            const response = await apiClient.post('/qr/scan', {
                qr_data: data,
            });

            setPatientData(response.data);
            setShowResults(true);
            showToast('Patient information loaded successfully', 'success');
        } catch (error: any) {
            showToast(
                error.response?.data?.detail || 'Invalid QR code',
                'error'
            );
            // Reset scanner after error
            setTimeout(() => {
                setScanned(false);
                setScanning(false);
            }, 2000);
        }
    };

    const handleClose = () => {
        setShowResults(false);
        setPatientData(null);
        setScanned(false);
        setScanning(false);
    };

    if (hasPermission === null) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-900">
                <ActivityIndicator size="large" color={colors.secondary[500]} />
                <Text className="text-white mt-4">Requesting camera permission...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-900 px-8">
                <Ionicons name="videocam-off" size={80} color={colors.gray[600]} />
                <Text className="text-white text-xl font-bold mt-6 mb-2 text-center">
                    Camera Permission Required
                </Text>
                <Text className="text-gray-400 text-center mb-6">
                    Please enable camera access in your device settings to scan QR codes.
                </Text>
                <TouchableOpacity
                    onPress={requestCameraPermission}
                    className="bg-cyan-500 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-bold">Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-900">
            <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />

            {/* Scanner View */}
            <View className="flex-1">
                {/* Header */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.8)', 'transparent']}
                    className="absolute top-0 left-0 right-0 z-10 pt-12 pb-6 px-5"
                >
                    <Animatable.View animation="fadeInDown" duration={600}>
                        <Text className="text-white text-2xl font-bold mb-1">
                            Scan Patient QR Code
                        </Text>
                        <Text className="text-white/80 text-sm">
                            Position the QR code within the frame
                        </Text>
                    </Animatable.View>
                </LinearGradient>

                {/* Camera */}
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                    }}
                />

                {/* Scanning Frame */}
                <View className="flex-1 items-center justify-center">
                    <Animatable.View
                        animation="pulse"
                        iterationCount="infinite"
                        duration={2000}
                        className="relative"
                    >
                        {/* Scanning Box */}
                        <View
                            className="w-72 h-72 border-4 border-cyan-400 rounded-3xl"
                            style={{
                                borderStyle: 'dashed',
                            }}
                        />

                        {/* Corner Brackets */}
                        <View className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-cyan-500 rounded-tl-3xl" />
                        <View className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-cyan-500 rounded-tr-3xl" />
                        <View className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-cyan-500 rounded-bl-3xl" />
                        <View className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-cyan-500 rounded-br-3xl" />

                        {/* Scanning Line */}
                        {!scanned && (
                            <Animatable.View
                                animation={{
                                    from: { translateY: -140 },
                                    to: { translateY: 140 },
                                }}
                                iterationCount="infinite"
                                duration={2000}
                                className="absolute left-0 right-0 h-1 bg-cyan-400"
                                style={{
                                    shadowColor: '#06B6D4',
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: 0.8,
                                    shadowRadius: 10,
                                }}
                            />
                        )}
                    </Animatable.View>
                </View>

                {/* Bottom Instructions */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    className="absolute bottom-0 left-0 right-0 pb-28 pt-8 px-8"
                >
                    <View className="bg-white/10 rounded-2xl p-4 backdrop-blur-xl">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="information-circle" size={20} color="#06B6D4" />
                            <Text className="text-white font-bold ml-2">
                                {scanned ? 'Processing...' : 'Ready to Scan'}
                            </Text>
                        </View>
                        <Text className="text-white/80 text-sm">
                            {scanned
                                ? 'Decrypting patient information...'
                                : 'Ask the patient to show their QR code from the app'}
                        </Text>
                    </View>
                </LinearGradient>
            </View>

            {/* Patient Data Modal */}
            <Modal
                visible={showResults}
                animationType="slide"
                onRequestClose={handleClose}
            >
                <View className="flex-1 bg-gray-50">
                    {/* Header */}
                    <LinearGradient
                        colors={[colors.secondary[500], colors.secondary[600]]}
                        className="pt-12 pb-6 px-5"
                    >
                        <View className="flex-row justify-between items-center">
                            <View className="flex-1">
                                <Text className="text-white/80 text-xs font-semibold mb-1">
                                    Patient Information
                                </Text>
                                <Text className="text-white text-2xl font-bold">
                                    {patientData?.first_name} {patientData?.last_name}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={handleClose}
                                className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                            >
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Quick Info Pills */}
                        <View className="flex-row flex-wrap gap-2 mt-4">
                            {patientData?.blood_type && (
                                <View className="bg-white/25 px-3 py-1.5 rounded-lg">
                                    <Text className="text-white text-xs font-bold">
                                        🩸 {patientData.blood_type}
                                    </Text>
                                </View>
                            )}
                            {patientData?.gender && (
                                <View className="bg-white/25 px-3 py-1.5 rounded-lg">
                                    <Text className="text-white text-xs font-bold capitalize">
                                        {patientData.gender}
                                    </Text>
                                </View>
                            )}
                            {patientData?.date_of_birth && (
                                <View className="bg-white/25 px-3 py-1.5 rounded-lg">
                                    <Text className="text-white text-xs font-bold">
                                        {new Date().getFullYear() - new Date(patientData.date_of_birth).getFullYear()} years
                                    </Text>
                                </View>
                            )}
                        </View>
                    </LinearGradient>

                    <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
                        {/* CRITICAL: Allergies - Always First! */}
                        {patientData && patientData.allergies.length > 0 && (
                            <Animatable.View animation="bounceIn" delay={100}>
                                <View className="bg-red-50 rounded-2xl p-4 mb-4 border-2 border-red-300">
                                    <View className="flex-row items-center mb-3">
                                        <View className="w-10 h-10 bg-red-500 rounded-full items-center justify-center mr-3">
                                            <Ionicons name="warning" size={24} color="white" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-red-900 font-bold text-lg">
                                                ⚠️ ALLERGIES
                                            </Text>
                                            <Text className="text-red-700 text-xs">
                                                Critical Information
                                            </Text>
                                        </View>
                                    </View>

                                    {patientData.allergies.map((allergy: any, index: number) => (
                                        <View
                                            key={index}
                                            className="bg-white rounded-xl p-3 mb-2 border border-red-200"
                                        >
                                            <View className="flex-row items-center mb-1">
                                                <Text className="text-red-900 font-bold text-base flex-1">
                                                    {allergy.allergen}
                                                </Text>
                                                <View
                                                    className="px-2 py-1 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            allergy.severity === 'severe'
                                                                ? '#FEE2E2'
                                                                : allergy.severity === 'moderate'
                                                                    ? '#FEF3C7'
                                                                    : '#DBEAFE',
                                                    }}
                                                >
                                                    <Text
                                                        className="text-xs font-bold uppercase"
                                                        style={{
                                                            color:
                                                                allergy.severity === 'severe'
                                                                    ? '#DC2626'
                                                                    : allergy.severity === 'moderate'
                                                                        ? '#D97706'
                                                                        : '#2563EB',
                                                        }}
                                                    >
                                                        {allergy.severity}
                                                    </Text>
                                                </View>
                                            </View>
                                            {allergy.reaction && (
                                                <Text className="text-red-800 text-sm">
                                                    Reaction: {allergy.reaction}
                                                </Text>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </Animatable.View>
                        )}

                        {/* Contact Information */}
                        <Animatable.View animation="fadeInUp" delay={200}>
                            <View className="bg-white rounded-2xl p-4 mb-4">
                                <Text className="text-gray-900 font-bold text-lg mb-3">
                                    Contact Information
                                </Text>
                                {patientData?.phone && (
                                    <View className="flex-row items-center mb-2">
                                        <Ionicons name="call" size={18} color={colors.gray[600]} />
                                        <Text className="text-gray-700 ml-3">{patientData.phone}</Text>
                                    </View>
                                )}
                                {patientData?.date_of_birth && (
                                    <View className="flex-row items-center">
                                        <Ionicons name="calendar" size={18} color={colors.gray[600]} />
                                        <Text className="text-gray-700 ml-3">
                                            DOB: {patientData.date_of_birth}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </Animatable.View>

                        {/* Medical History */}
                        {patientData && patientData.medical_history.length > 0 && (
                            <Animatable.View animation="fadeInUp" delay={300}>
                                <View className="bg-white rounded-2xl p-4 mb-4">
                                    <Text className="text-gray-900 font-bold text-lg mb-3">
                                        Medical History
                                    </Text>
                                    {patientData.medical_history.map((item: any, index: number) => (
                                        <View
                                            key={index}
                                            className="bg-blue-50 rounded-xl p-3 mb-2 border border-blue-200"
                                        >
                                            <Text className="text-blue-900 font-bold">
                                                {item.condition}
                                            </Text>
                                            {item.diagnosed_date && (
                                                <Text className="text-blue-700 text-sm">
                                                    Diagnosed: {item.diagnosed_date}
                                                </Text>
                                            )}
                                            {item.notes && (
                                                <Text className="text-blue-800 text-sm mt-1">
                                                    {item.notes}
                                                </Text>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </Animatable.View>
                        )}

                        {/* Emergency Contacts */}
                        {patientData && patientData.emergency_contacts.length > 0 && (
                            <Animatable.View animation="fadeInUp" delay={400}>
                                <View className="bg-white rounded-2xl p-4 mb-4">
                                    <Text className="text-gray-900 font-bold text-lg mb-3">
                                        Emergency Contacts
                                    </Text>
                                    {patientData.emergency_contacts.map((contact: any, index: number) => (
                                        <View
                                            key={index}
                                            className="bg-amber-50 rounded-xl p-3 mb-2 border border-amber-200"
                                        >
                                            <Text className="text-amber-900 font-bold">
                                                {contact.name}
                                            </Text>
                                            <Text className="text-amber-700 text-sm capitalize">
                                                {contact.relationship}
                                            </Text>
                                            <Text className="text-amber-800 text-sm">
                                                📞 {contact.phone}
                                            </Text>
                                            {contact.email && (
                                                <Text className="text-amber-800 text-sm">
                                                    ✉️ {contact.email}
                                                </Text>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </Animatable.View>
                        )}

                        {/* QR Info */}
                        <View className="bg-gray-100 rounded-2xl p-4 mb-32">
                            <View className="flex-row items-center">
                                <Ionicons name="shield-checkmark" size={20} color={colors.success} />
                                <Text className="text-gray-600 text-xs ml-2">
                                    QR Code scanned on {new Date().toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}