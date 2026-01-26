import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/lib/constants/colors';
import { ToastType } from '@/lib/hooks/useToast';

interface ToastProps {
    visible: boolean;
    message: string;
    type: ToastType;
    onHide: () => void;
}

const toastConfig = {
    error: {
        colors: ['#EF4444', '#DC2626'] as const,
        icon: 'close-circle' as const,
        iconColor: '#FEE2E2',
    },
    success: {
        colors: ['#10B981', '#059669'] as const,
        icon: 'checkmark-circle' as const,
        iconColor: '#D1FAE5',
    },
    info: {
        colors: [colors.primary[500], colors.primary[600]] as const,
        icon: 'information-circle' as const,
        iconColor: '#DBEAFE',
    },
    warning: {
        colors: ['#F59E0B', '#D97706'] as const,
        icon: 'warning' as const,
        iconColor: '#FEF3C7',
    },
};

export function Toast({ visible, message, type, onHide }: ToastProps) {
    const config = toastConfig[type];

    useEffect(() => {
        if (visible) {
            // Auto-hide is handled by the hook, but we can add additional logic here if needed
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animatable.View
            animation={visible ? 'slideInDown' : 'slideOutUp'}
            duration={400}
            style={styles.container}
        >
            <TouchableOpacity
                onPress={onHide}
                activeOpacity={0.9}
                style={styles.touchable}
            >
                <LinearGradient
                    colors={config.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name={config.icon} size={24} color={config.iconColor} />
                    </View>
                    <Text style={styles.message} numberOfLines={2}>
                        {message}
                    </Text>
                    <TouchableOpacity onPress={onHide} style={styles.closeButton}>
                        <Ionicons name="close" size={20} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                </LinearGradient>
            </TouchableOpacity>
        </Animatable.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'web' ? 20 : 50,
        left: 20,
        right: 20,
        zIndex: 9999,
        elevation: 999,
    },
    touchable: {
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        minHeight: 64,
    },
    iconContainer: {
        marginRight: 12,
    },
    message: {
        flex: 1,
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
    },
    closeButton: {
        marginLeft: 8,
        padding: 4,
    },
});
