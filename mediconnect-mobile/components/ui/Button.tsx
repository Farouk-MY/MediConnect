import React from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    TouchableOpacityProps,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors } from '@/lib/constants/colors';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
}

export function Button({
                           title,
                           variant = 'primary',
                           size = 'md',
                           loading = false,
                           disabled,
                           icon,
                           style,
                           ...props
                       }: ButtonProps) {
    const buttonStyles: ViewStyle = {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        ...(size === 'sm' && { paddingVertical: 8, paddingHorizontal: 16 }),
        ...(size === 'md' && { paddingVertical: 14, paddingHorizontal: 24 }),
        ...(size === 'lg' && { paddingVertical: 16, paddingHorizontal: 32 }),
        ...(variant === 'primary' && { backgroundColor: colors.primary[500] }),
        ...(variant === 'secondary' && { backgroundColor: colors.secondary[500] }),
        ...(variant === 'outline' && {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: colors.primary[500],
        }),
        ...(disabled && { opacity: 0.5 }),
    };

    const textStyles: TextStyle = {
        fontWeight: '600',
        ...(size === 'sm' && { fontSize: 14 }),
        ...(size === 'md' && { fontSize: 16 }),
        ...(size === 'lg' && { fontSize: 18 }),
        ...(variant === 'outline'
            ? { color: colors.primary[500] }
            : { color: colors.white }),
    };

    return (
        <TouchableOpacity
            style={[buttonStyles, style]}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' ? colors.primary[500] : colors.white}
                />
            ) : (
                <>
                    {icon && <>{icon}</>}
                    <Text style={textStyles}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}