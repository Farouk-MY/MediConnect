/**
 * Opening Hours Editor Component
 * 
 * Premium modal for doctors to configure their weekly schedule.
 * Allows setting working hours, breaks, and consultation types per day.
 * Uses NativeWind styling to match doctor interface design.
 */

import { View, Text, TouchableOpacity, ScrollView, Modal, Switch, TextInput, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/constants/colors';
import { useState, useEffect } from 'react';
import { availabilityApi, WeeklySchedule, DayScheduleRequest, CreateSlotRequest } from '@/lib/api/availability';

const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const DAY_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

interface DayConfig {
    enabled: boolean;
    start_time: string;
    end_time: string;
    break_start?: string;
    break_end?: string;
    slot_duration: number;
    consultation_type: 'presentiel' | 'online' | 'both';
}

interface Props {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    initialSchedule?: WeeklySchedule;
}

const DEFAULT_DAY_CONFIG: DayConfig = {
    enabled: true,
    start_time: '09:00',
    end_time: '17:00',
    slot_duration: 30,
    consultation_type: 'both'
};

const TIME_OPTIONS = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30', '21:00'
];

const DURATION_OPTIONS = [15, 20, 30, 45, 60];

export default function OpeningHoursEditor({ visible, onClose, onSave, initialSchedule }: Props) {
    const [selectedDay, setSelectedDay] = useState(0);
    const [weekConfig, setWeekConfig] = useState<DayConfig[]>(
        Array(7).fill(null).map(() => ({ ...DEFAULT_DAY_CONFIG }))
    );
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState<{ field: string; index: number } | null>(null);
    const [showDurationPicker, setShowDurationPicker] = useState(false);

    // Load initial schedule from API or props
    useEffect(() => {
        if (visible) {
            loadSchedule();
        }
    }, [visible, initialSchedule]);

    const loadSchedule = async () => {
        if (initialSchedule) {
            // Convert API schedule to day configurations
            const config: DayConfig[] = Array(7).fill(null).map(() => ({ 
                ...DEFAULT_DAY_CONFIG, 
                enabled: false 
            }));
            
            initialSchedule.schedule.forEach(daySchedule => {
                const dayIndex = daySchedule.day_of_week;
                if (daySchedule.is_working_day && daySchedule.slots.length > 0) {
                    const firstSlot = daySchedule.slots[0];
                    config[dayIndex] = {
                        enabled: true,
                        start_time: firstSlot.start_time,
                        end_time: firstSlot.end_time,
                        break_start: firstSlot.break_start || undefined,
                        break_end: firstSlot.break_end || undefined,
                        slot_duration: firstSlot.slot_duration_minutes,
                        consultation_type: firstSlot.consultation_type as any
                    };
                }
            });
            
            setWeekConfig(config);
        }
    };

    const updateDayConfig = (field: keyof DayConfig, value: any) => {
        setWeekConfig(prev => {
            const newConfig = [...prev];
            newConfig[selectedDay] = { ...newConfig[selectedDay], [field]: value };
            return newConfig;
        });
    };

    const copyToAllDays = () => {
        const currentConfig = weekConfig[selectedDay];
        setWeekConfig(prev => prev.map((_, i) => 
            i === selectedDay ? currentConfig : { ...currentConfig, enabled: prev[i].enabled }
        ));
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Build schedule array for API
            const schedule: DayScheduleRequest[] = weekConfig.map((day, index) => {
                // Base slot configuration
                const baseSlot: any = {
                    day_of_week: index as 0 | 1 | 2 | 3 | 4 | 5 | 6,
                    start_time: day.start_time,
                    end_time: day.end_time,
                    slot_duration_minutes: day.slot_duration,
                    consultation_type: day.consultation_type
                };
                
                // Only add break times if they are set (not undefined or empty)
                if (day.break_start && day.break_start !== '--:--') {
                    baseSlot.break_start = day.break_start;
                }
                if (day.break_end && day.break_end !== '--:--') {
                    baseSlot.break_end = day.break_end;
                }
                
                return {
                    day_of_week: index as 0 | 1 | 2 | 3 | 4 | 5 | 6,
                    is_working_day: day.enabled,
                    slots: day.enabled ? [baseSlot] : []
                };
            });

            console.log('[OpeningHoursEditor] Sending schedule:', JSON.stringify(schedule, null, 2));
            await availabilityApi.setWorkingHours({ schedule });
            
            Alert.alert('Succès', 'Vos horaires ont été mis à jour', [
                { text: 'OK', onPress: () => { onSave(); onClose(); } }
            ]);
        } catch (error: any) {
            console.error('[OpeningHoursEditor] Error:', error.response?.data);
            Alert.alert('Erreur', error.response?.data?.detail || 'Impossible de sauvegarder');
        } finally {
            setSaving(false);
        }
    };

    const currentDay = weekConfig[selectedDay];

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1 bg-gray-50">
                {/* Header */}
                <LinearGradient
                    colors={[colors.secondary[500], colors.secondary[600]]}
                    className="pt-14 pb-6 px-6 rounded-b-[40px]"
                    style={{
                        shadowColor: colors.secondary[600],
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.25,
                        shadowRadius: 20,
                        elevation: 10,
                    }}
                >
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-11 h-11 bg-white/20 rounded-2xl items-center justify-center"
                            style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
                        >
                            <Ionicons name="close" size={22} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white text-lg font-bold">Horaires d'ouverture</Text>
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={saving}
                            className="w-11 h-11 bg-white/20 rounded-2xl items-center justify-center"
                            style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Ionicons name="checkmark" size={22} color="white" />
                            )}
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                    {/* Day Selector */}
                    <Animatable.View animation="fadeInUp" delay={100}>
                        <View
                            className="bg-white rounded-3xl p-4 mb-4"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.08,
                                shadowRadius: 12,
                                elevation: 3,
                            }}
                        >
                            <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
                                Sélectionner un jour
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {DAY_SHORT.map((day, index) => (
                                    <TouchableOpacity
                                        key={day}
                                        onPress={() => setSelectedDay(index)}
                                        className={`flex-1 min-w-[40px] py-3 rounded-xl items-center
                                            ${selectedDay === index ? 'bg-secondary-500' : ''}
                                            ${!weekConfig[index].enabled && selectedDay !== index ? 'bg-gray-100' : 'bg-secondary-50'}`}
                                    >
                                        <Text className={`text-xs font-bold
                                            ${selectedDay === index ? 'text-white' : ''}
                                            ${!weekConfig[index].enabled ? 'text-gray-400' : 'text-secondary-600'}`}>
                                            {day}
                                        </Text>
                                        {weekConfig[index].enabled && selectedDay !== index && (
                                            <View className="w-1.5 h-1.5 rounded-full bg-secondary-500 mt-1" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </Animatable.View>

                    {/* Day Configuration */}
                    <Animatable.View animation="fadeInUp" delay={200}>
                        <View
                            className="bg-white rounded-3xl p-4 mb-4"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.08,
                                shadowRadius: 12,
                                elevation: 3,
                            }}
                        >
                            <View className="flex-row items-center justify-between pb-4 border-b border-gray-100">
                                <View className="flex-row items-center gap-3">
                                    <Ionicons name="calendar" size={22} color={colors.gray[600]} />
                                    <View>
                                        <Text className="text-gray-800 font-bold text-base">{DAY_NAMES[selectedDay]}</Text>
                                        <Text className="text-gray-500 text-xs">Activer ce jour</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={currentDay.enabled}
                                    onValueChange={(v) => updateDayConfig('enabled', v)}
                                    trackColor={{ false: colors.gray[300], true: colors.secondary[400] }}
                                    thumbColor={currentDay.enabled ? colors.secondary[600] : '#fff'}
                                />
                            </View>

                            {currentDay.enabled && (
                                <>
                                    {/* Working Hours */}
                                    <View className="pt-4">
                                        <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
                                            Heures de travail
                                        </Text>
                                        <View className="flex-row gap-3">
                                            <TouchableOpacity
                                                onPress={() => setShowTimePicker({ field: 'start_time', index: selectedDay })}
                                                className="flex-1 bg-gray-50 rounded-xl p-3"
                                            >
                                                <Text className="text-gray-500 text-xs mb-1">Début</Text>
                                                <Text className="text-gray-800 font-bold text-lg">{currentDay.start_time}</Text>
                                            </TouchableOpacity>
                                            <View className="items-center justify-center">
                                                <Ionicons name="arrow-forward" size={16} color={colors.gray[400]} />
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => setShowTimePicker({ field: 'end_time', index: selectedDay })}
                                                className="flex-1 bg-gray-50 rounded-xl p-3"
                                            >
                                                <Text className="text-gray-500 text-xs mb-1">Fin</Text>
                                                <Text className="text-gray-800 font-bold text-lg">{currentDay.end_time}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Break Time */}
                                    <View className="pt-4">
                                        <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
                                            Pause déjeuner (optionnel)
                                        </Text>
                                        <View className="flex-row gap-3">
                                            <TouchableOpacity
                                                onPress={() => setShowTimePicker({ field: 'break_start', index: selectedDay })}
                                                className="flex-1 bg-gray-50 rounded-xl p-3"
                                            >
                                                <Text className="text-gray-500 text-xs mb-1">Début pause</Text>
                                                <Text className="text-gray-800 font-bold">{currentDay.break_start || '--:--'}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => setShowTimePicker({ field: 'break_end', index: selectedDay })}
                                                className="flex-1 bg-gray-50 rounded-xl p-3"
                                            >
                                                <Text className="text-gray-500 text-xs mb-1">Fin pause</Text>
                                                <Text className="text-gray-800 font-bold">{currentDay.break_end || '--:--'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Slot Duration */}
                                    <View className="pt-4">
                                        <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
                                            Durée des créneaux
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => setShowDurationPicker(true)}
                                            className="flex-row items-center justify-between bg-gray-50 rounded-xl p-3.5"
                                        >
                                            <View className="flex-row items-center gap-3">
                                                <Ionicons name="time-outline" size={20} color={colors.gray[600]} />
                                                <Text className="text-gray-800 font-medium">{currentDay.slot_duration} minutes</Text>
                                            </View>
                                            <Ionicons name="chevron-down" size={18} color={colors.gray[400]} />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Consultation Type */}
                                    <View className="pt-4">
                                        <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
                                            Types de consultation
                                        </Text>
                                        <View className="flex-row gap-2">
                                            {[
                                                { value: 'presentiel', label: 'Présentiel', icon: 'location' },
                                                { value: 'online', label: 'En ligne', icon: 'videocam' },
                                                { value: 'both', label: 'Les deux', icon: 'apps' }
                                            ].map(type => (
                                                <TouchableOpacity
                                                    key={type.value}
                                                    onPress={() => updateDayConfig('consultation_type', type.value)}
                                                    className={`flex-1 py-3 rounded-xl items-center gap-1
                                                        ${currentDay.consultation_type === type.value ? 'bg-secondary-500' : 'bg-gray-100'}`}
                                                >
                                                    <Ionicons
                                                        name={type.icon as any}
                                                        size={18}
                                                        color={currentDay.consultation_type === type.value ? 'white' : colors.gray[600]}
                                                    />
                                                    <Text className={`text-xs font-medium
                                                        ${currentDay.consultation_type === type.value ? 'text-white' : 'text-gray-600'}`}>
                                                        {type.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>
                    </Animatable.View>

                    {/* Quick Actions */}
                    {currentDay.enabled && (
                        <Animatable.View animation="fadeInUp" delay={300}>
                            <TouchableOpacity
                                onPress={copyToAllDays}
                                className="bg-secondary-50 rounded-2xl p-4 flex-row items-center justify-center gap-2 mb-24"
                            >
                                <Ionicons name="copy" size={18} color={colors.secondary[600]} />
                                <Text className="text-secondary-600 font-bold">Appliquer à tous les jours actifs</Text>
                            </TouchableOpacity>
                        </Animatable.View>
                    )}
                </ScrollView>

                {/* Time Picker Modal */}
                <Modal visible={!!showTimePicker} transparent animationType="slide">
                    <View className="flex-1 bg-black/50 justify-end">
                        <View className="bg-white rounded-t-3xl p-5 pb-10 max-h-96">
                            <Text className="text-gray-800 text-lg font-bold text-center mb-4">Sélectionner l'heure</Text>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {TIME_OPTIONS.map(time => (
                                    <TouchableOpacity
                                        key={time}
                                        onPress={() => {
                                            if (showTimePicker) {
                                                updateDayConfig(showTimePicker.field as any, time);
                                            }
                                            setShowTimePicker(null);
                                        }}
                                        className={`py-3.5 rounded-xl items-center
                                            ${currentDay[showTimePicker?.field as keyof DayConfig] === time ? 'bg-secondary-50' : ''}`}
                                    >
                                        <Text className={`text-base font-medium
                                            ${currentDay[showTimePicker?.field as keyof DayConfig] === time ? 'text-secondary-600' : 'text-gray-700'}`}>
                                            {time}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <TouchableOpacity onPress={() => setShowTimePicker(null)} className="items-center py-4 mt-2">
                                <Text className="text-gray-500 font-medium">Annuler</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Duration Picker Modal */}
                <Modal visible={showDurationPicker} transparent animationType="slide">
                    <View className="flex-1 bg-black/50 justify-end">
                        <View className="bg-white rounded-t-3xl p-5 pb-10">
                            <Text className="text-gray-800 text-lg font-bold text-center mb-4">Durée du créneau</Text>
                            {DURATION_OPTIONS.map(duration => (
                                <TouchableOpacity
                                    key={duration}
                                    onPress={() => {
                                        updateDayConfig('slot_duration', duration);
                                        setShowDurationPicker(false);
                                    }}
                                    className={`py-3.5 rounded-xl flex-row items-center justify-center gap-2
                                        ${currentDay.slot_duration === duration ? 'bg-secondary-50' : ''}`}
                                >
                                    <Text className={`text-base font-medium
                                        ${currentDay.slot_duration === duration ? 'text-secondary-600' : 'text-gray-700'}`}>
                                        {duration} minutes
                                    </Text>
                                    {currentDay.slot_duration === duration && (
                                        <Ionicons name="checkmark" size={18} color={colors.secondary[600]} />
                                    )}
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity onPress={() => setShowDurationPicker(false)} className="items-center py-4 mt-2">
                                <Text className="text-gray-500 font-medium">Annuler</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </Modal>
    );
}
