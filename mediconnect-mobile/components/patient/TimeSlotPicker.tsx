/**
 * Time Slot Picker Component
 * 
 * Premium time slot selector with morning/afternoon/evening grouping.
 * Shows available slots based on doctor's schedule.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { colors } from '@/lib/constants/colors';
import { ComputedTimeSlot } from '@/lib/api/availability';

interface TimeSlotPickerProps {
    slots: ComputedTimeSlot[];
    selectedTime: string | null;
    onSelectTime: (time: string) => void;
    selectedDate: Date;
}

interface TimeGroup {
    label: string;
    icon: string;
    iconColor: string;
    slots: ComputedTimeSlot[];
}

const groupSlots = (slots: ComputedTimeSlot[]): TimeGroup[] => {
    const morning = slots.filter(s => {
        const hour = parseInt(s.start_time.split(':')[0]);
        return hour < 12;
    });
    
    const afternoon = slots.filter(s => {
        const hour = parseInt(s.start_time.split(':')[0]);
        return hour >= 12 && hour < 17;
    });
    
    const evening = slots.filter(s => {
        const hour = parseInt(s.start_time.split(':')[0]);
        return hour >= 17;
    });
    
    const groups: TimeGroup[] = [];
    
    if (morning.length > 0) {
        groups.push({ label: 'Matin', icon: 'sunny', iconColor: '#F59E0B', slots: morning });
    }
    if (afternoon.length > 0) {
        groups.push({ label: 'Après-midi', icon: 'partly-sunny', iconColor: '#F97316', slots: afternoon });
    }
    if (evening.length > 0) {
        groups.push({ label: 'Soir', icon: 'moon', iconColor: '#6366F1', slots: evening });
    }
    
    return groups;
};

export default function TimeSlotPicker({
    slots,
    selectedTime,
    onSelectTime,
    selectedDate
}: TimeSlotPickerProps) {
    const groups = groupSlots(slots);
    
    if (slots.length === 0) {
        return (
            <Animatable.View 
                animation="fadeInUp" 
                className="bg-yellow-50 rounded-3xl p-6 items-center"
                style={{
                    shadowColor: '#F59E0B',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 4,
                }}
            >
                <View className="w-16 h-16 rounded-2xl bg-yellow-100 items-center justify-center mb-4">
                    <Ionicons name="calendar-outline" size={32} color={colors.warning} />
                </View>
                <Text className="text-yellow-800 font-bold text-lg text-center">
                    Aucun créneau disponible
                </Text>
                <Text className="text-yellow-600 text-center text-sm mt-2">
                    Le médecin n'a pas de disponibilité pour cette date.{'\n'}
                    Veuillez choisir une autre date.
                </Text>
            </Animatable.View>
        );
    }

    return (
        <Animatable.View animation="fadeInUp">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <View>
                    <Text className="text-gray-800 font-bold text-lg">Choisir l'heure</Text>
                    <Text className="text-gray-500 text-sm">
                        {selectedDate.toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long' 
                        })}
                    </Text>
                </View>
                <View className="bg-green-50 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                    <View className="w-2 h-2 rounded-full bg-green-500" />
                    <Text className="text-green-700 text-sm font-semibold">
                        {slots.length} créneaux
                    </Text>
                </View>
            </View>

            {/* Time Groups */}
            <View 
                className="bg-white rounded-3xl overflow-hidden"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.08,
                    shadowRadius: 24,
                    elevation: 8,
                }}
            >
                {groups.map((group, groupIndex) => (
                    <View 
                        key={group.label}
                        className={`p-4 ${groupIndex > 0 ? 'border-t border-gray-100' : ''}`}
                    >
                        {/* Group Header */}
                        <View className="flex-row items-center gap-2 mb-3">
                            <View 
                                className="w-8 h-8 rounded-lg items-center justify-center"
                                style={{ backgroundColor: group.iconColor + '15' }}
                            >
                                <Ionicons 
                                    name={group.icon as any} 
                                    size={18} 
                                    color={group.iconColor} 
                                />
                            </View>
                            <Text className="text-gray-700 font-semibold">{group.label}</Text>
                            <Text className="text-gray-400 text-sm">({group.slots.length})</Text>
                        </View>
                        
                        {/* Slots Grid */}
                        <View className="flex-row flex-wrap gap-2">
                            {group.slots.map(slot => {
                                const isSelected = selectedTime === slot.start_time;
                                
                                return (
                                    <TouchableOpacity
                                        key={slot.start_time}
                                        onPress={() => onSelectTime(slot.start_time)}
                                        activeOpacity={0.7}
                                    >
                                        <Animatable.View
                                            animation={isSelected ? 'pulse' : undefined}
                                            duration={1000}
                                            iterationCount={1}
                                            className={`px-4 py-2.5 rounded-xl ${
                                                isSelected ? 'bg-primary-500' : 'bg-gray-100'
                                            }`}
                                            style={isSelected ? {
                                                shadowColor: colors.primary[500],
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 8,
                                                elevation: 6,
                                            } : {}}
                                        >
                                            <Text className={`font-semibold ${
                                                isSelected ? 'text-white' : 'text-gray-700'
                                            }`}>
                                                {slot.start_time}
                                            </Text>
                                        </Animatable.View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ))}
            </View>
            
            {/* Selected Time Display */}
            {selectedTime && (
                <Animatable.View 
                    animation="fadeInUp"
                    className="mt-4 bg-primary-50 rounded-2xl p-4 flex-row items-center gap-3"
                >
                    <View className="w-10 h-10 rounded-xl bg-primary-100 items-center justify-center">
                        <Ionicons name="time" size={22} color={colors.primary[600]} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-primary-800 font-bold">Heure sélectionnée</Text>
                        <Text className="text-primary-600">{selectedTime}</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary[600]} />
                </Animatable.View>
            )}
        </Animatable.View>
    );
}
