import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '@/lib/constants/colors';
import { AppointmentStatus } from '@/lib/api/appointments';

interface StatusBadgeProps {
    status: AppointmentStatus;
    size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; bg: string; text: string; icon: string }> = {
    pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'time' },
    confirmed: { label: 'Confirmed', bg: 'bg-green-100', text: 'text-green-700', icon: 'checkmark-circle' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700', icon: 'close-circle' },
    completed: { label: 'Completed', bg: 'bg-blue-100', text: 'text-blue-700', icon: 'checkmark-done' },
    no_show: { label: 'No Show', bg: 'bg-gray-100', text: 'text-gray-700', icon: 'alert-circle' },
    rescheduled: { label: 'Rescheduled', bg: 'bg-purple-100', text: 'text-purple-700', icon: 'calendar' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    
    return (
        <View className={`${config.bg} rounded-full ${size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1'}`}>
            <Text className={`${config.text} font-semibold ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
                {config.label}
            </Text>
        </View>
    );
}
