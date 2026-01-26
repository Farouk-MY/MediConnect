import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/constants/colors';

interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps {
    label: string;
    value: string;
    placeholder?: string;
    options: SelectOption[];
    onValueChange: (value: string) => void;
    error?: string;
    icon?: any;
}

export function Select({
                           label,
                           value,
                           placeholder = 'Select an option',
                           options,
                           onValueChange,
                           error,
                           icon,
                       }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find((opt) => opt.value === value);
    const displayValue = selectedOption ? selectedOption.label : placeholder;

    const handleSelect = (optionValue: string) => {
        onValueChange(optionValue);
        setIsOpen(false);
    };

    return (
        <View className="mb-4">
            {label && (
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                    {label}
                </Text>
            )}

            <TouchableOpacity
                className={`flex-row items-center bg-white border-2 rounded-xl px-4 py-3.5 ${
                    error ? 'border-red-500' : 'border-gray-200'
                }`}
                onPress={() => setIsOpen(true)}
                activeOpacity={0.7}
            >
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={value ? colors.gray[700] : colors.gray[400]}
                        style={{ marginRight: 12 }}
                    />
                )}
                <Text
                    className={`flex-1 text-base ${
                        value ? 'text-gray-700' : 'text-gray-400'
                    }`}
                >
                    {displayValue}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={20}
                    color={colors.gray[400]}
                />
            </TouchableOpacity>

            {error && (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                    {error}
                </Text>
            )}

            {/* Options Modal */}
            <Modal
                visible={isOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setIsOpen(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <TouchableOpacity
                        className="flex-1"
                        activeOpacity={1}
                        onPress={() => setIsOpen(false)}
                    />
                    <View
                        className="bg-white rounded-t-3xl max-h-[70%] overflow-hidden"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: -4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 12,
                            elevation: 10,
                        }}
                    >
                        {/* Modal Header */}
                        <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
                            <Text className="text-lg font-bold text-gray-800">
                                {label}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setIsOpen(false)}
                                className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
                                activeOpacity={0.7}
                            >
                                <Ionicons name="close" size={20} color={colors.gray[600]} />
                            </TouchableOpacity>
                        </View>

                        {/* Options List */}
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className={`flex-row justify-between items-center px-5 py-4 border-b border-gray-50 ${
                                        item.value === value ? 'bg-blue-50' : 'bg-white'
                                    }`}
                                    onPress={() => handleSelect(item.value)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        className={`text-base ${
                                            item.value === value
                                                ? 'text-blue-600 font-semibold'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        {item.label}
                                    </Text>
                                    {item.value === value && (
                                        <View className="bg-blue-500 w-6 h-6 rounded-full items-center justify-center">
                                            <Ionicons
                                                name="checkmark"
                                                size={16}
                                                color="white"
                                            />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}