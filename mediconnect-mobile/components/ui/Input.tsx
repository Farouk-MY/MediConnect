import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/constants/colors';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    isPassword?: boolean;
}

export function Input({
                          label,
                          error,
                          icon,
                          isPassword,
                          style,
                          ...props
                      }: InputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={{ marginBottom: 16 }}>
            {label && (
                <Text
                    style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: colors.gray[700],
                        marginBottom: 8,
                    }}
                >
                    {label}
                </Text>
            )}

            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.gray[50],
                    borderWidth: 1,
                    borderColor: error ? colors.error : colors.gray[200],
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    height: 56,
                }}
            >
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={colors.gray[400]}
                        style={{ marginRight: 12 }}
                    />
                )}

                <TextInput
                    style={{
                        flex: 1,
                        fontSize: 16,
                        color: colors.gray[900],
                    }}
                    placeholderTextColor={colors.gray[400]}
                    secureTextEntry={isPassword && !showPassword}
                    {...props}
                />

                {isPassword && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={colors.gray[400]}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && (
                <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>
                    {error}
                </Text>
            )}
        </View>
    );
}