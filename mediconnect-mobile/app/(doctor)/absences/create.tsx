/**
 * Create Absence Screen
 * 
 * Premium UI for creating doctor absences with date range picker,
 * type selection, recurrence options, and conflict preview.
 * Uses NativeWind for styling to match doctor interface design.
 */

import { View, Text, TouchableOpacity, ScrollView, TextInput, Switch, Alert, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/constants/colors';
import { useState, useCallback } from 'react';
import {
    absencesApi,
    AbsenceType,
    RecurrencePattern,
    ConflictCheckResponse,
    ABSENCE_TYPE_LABELS,
    ABSENCE_TYPE_ICONS,
    ABSENCE_TYPE_COLORS,
    RECURRENCE_LABELS
} from '@/lib/api/absences';

const ABSENCE_TYPES: AbsenceType[] = ['vacation', 'sick', 'training', 'conference', 'personal', 'other'];
const RECURRENCE_PATTERNS: RecurrencePattern[] = ['none', 'daily', 'weekly', 'biweekly', 'monthly'];

export default function CreateAbsenceScreen() {
    const router = useRouter();

    // Form state
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [absenceType, setAbsenceType] = useState<AbsenceType>('vacation');
    const [title, setTitle] = useState('');
    const [reason, setReason] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('none');
    const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(null);
    const [notifyPatients, setNotifyPatients] = useState(true);
    const [isFullDay, setIsFullDay] = useState(true);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');

    // UI state
    const [loading, setLoading] = useState(false);
    const [conflicts, setConflicts] = useState<ConflictCheckResponse | null>(null);
    const [showTypePicker, setShowTypePicker] = useState(false);
    const [showRecurrencePicker, setShowRecurrencePicker] = useState(false);
    const [checkingConflicts, setCheckingConflicts] = useState(false);

    const formatDate = (date: Date): string => date.toISOString().split('T')[0];
    
    const formatDisplayDate = (date: Date): string => {
        return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    const checkConflicts = useCallback(async () => {
        try {
            setCheckingConflicts(true);
            const response = await absencesApi.checkConflicts({
                start_date: formatDate(startDate),
                end_date: formatDate(endDate),
                start_time: isFullDay ? undefined : startTime,
                end_time: isFullDay ? undefined : endTime
            });
            setConflicts(response);
        } catch (error) {
            console.error('Error checking conflicts:', error);
        } finally {
            setCheckingConflicts(false);
        }
    }, [startDate, endDate, isFullDay, startTime, endTime]);

    const handleDateChange = (type: 'start' | 'end', days: number) => {
        if (type === 'start') {
            const newDate = new Date(startDate);
            newDate.setDate(newDate.getDate() + days);
            if (newDate <= endDate) setStartDate(newDate);
        } else {
            const newDate = new Date(endDate);
            newDate.setDate(newDate.getDate() + days);
            if (newDate >= startDate) setEndDate(newDate);
        }
    };

    const handleSubmit = async () => {
        if (!conflicts) await checkConflicts();

        try {
            setLoading(true);
            const response = await absencesApi.createAbsence({
                start_date: formatDate(startDate),
                end_date: formatDate(endDate),
                start_time: isFullDay ? undefined : startTime,
                end_time: isFullDay ? undefined : endTime,
                absence_type: absenceType,
                title: title || undefined,
                reason: reason || undefined,
                is_recurring: isRecurring,
                recurrence_pattern: isRecurring ? recurrencePattern : 'none',
                recurrence_end_date: recurrenceEndDate ? formatDate(recurrenceEndDate) : undefined,
                notify_patients: notifyPatients
            });
            Alert.alert('Absence créée', response.message, [{ text: 'OK', onPress: () => router.back() }]);
        } catch (error: any) {
            Alert.alert('Erreur', error.response?.data?.detail || 'Impossible de créer l\'absence');
        } finally {
            setLoading(false);
        }
    };

    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <LinearGradient
                colors={[colors.secondary[500], colors.secondary[600]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="pb-6 pt-14 px-6 rounded-b-[40px]"
                style={{
                    shadowColor: colors.secondary[600],
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.25,
                    shadowRadius: 20,
                    elevation: 10,
                }}
            >
                <Animatable.View animation="fadeInDown" duration={600} className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-11 h-11 bg-white/20 rounded-2xl items-center justify-center"
                        style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
                    >
                        <Ionicons name="arrow-back" size={22} color="white" />
                    </TouchableOpacity>
                    <Text className="flex-1 text-white text-xl font-bold text-center mr-11">Nouvelle absence</Text>
                </Animatable.View>
            </LinearGradient>

            <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                {/* Type Selection */}
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
                        <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Type d'absence</Text>
                        <TouchableOpacity
                            onPress={() => setShowTypePicker(true)}
                            className="flex-row items-center bg-gray-50 rounded-2xl p-3.5 gap-3"
                        >
                            <View
                                className="w-12 h-12 rounded-xl items-center justify-center"
                                style={{ backgroundColor: ABSENCE_TYPE_COLORS[absenceType] + '20' }}
                            >
                                <Ionicons
                                    name={ABSENCE_TYPE_ICONS[absenceType] as any}
                                    size={24}
                                    color={ABSENCE_TYPE_COLORS[absenceType]}
                                />
                            </View>
                            <Text className="flex-1 text-gray-800 font-bold text-base">{ABSENCE_TYPE_LABELS[absenceType]}</Text>
                            <Ionicons name="chevron-down" size={20} color={colors.gray[400]} />
                        </TouchableOpacity>
                    </View>
                </Animatable.View>

                {/* Date Range */}
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
                        <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Période</Text>
                        
                        <View className="flex-row items-center gap-2">
                            <View className="flex-1 bg-gray-50 rounded-2xl p-3 items-center">
                                <Text className="text-gray-500 text-xs mb-1">Du</Text>
                                <View className="flex-row items-center">
                                    <TouchableOpacity className="p-1" onPress={() => handleDateChange('start', -1)}>
                                        <Ionicons name="chevron-back" size={18} color={colors.secondary[500]} />
                                    </TouchableOpacity>
                                    <Text className="text-gray-800 font-semibold text-sm mx-1">{formatDisplayDate(startDate)}</Text>
                                    <TouchableOpacity className="p-1" onPress={() => handleDateChange('start', 1)}>
                                        <Ionicons name="chevron-forward" size={18} color={colors.secondary[500]} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            
                            <View className="items-center">
                                <Text className="text-secondary-600 text-xs font-bold">{durationDays}j</Text>
                            </View>
                            
                            <View className="flex-1 bg-gray-50 rounded-2xl p-3 items-center">
                                <Text className="text-gray-500 text-xs mb-1">Au</Text>
                                <View className="flex-row items-center">
                                    <TouchableOpacity className="p-1" onPress={() => handleDateChange('end', -1)}>
                                        <Ionicons name="chevron-back" size={18} color={colors.secondary[500]} />
                                    </TouchableOpacity>
                                    <Text className="text-gray-800 font-semibold text-sm mx-1">{formatDisplayDate(endDate)}</Text>
                                    <TouchableOpacity className="p-1" onPress={() => handleDateChange('end', 1)}>
                                        <Ionicons name="chevron-forward" size={18} color={colors.secondary[500]} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Full day toggle */}
                        <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-gray-100">
                            <View className="flex-row items-center gap-3">
                                <Ionicons name="time-outline" size={22} color={colors.gray[600]} />
                                <Text className="text-gray-700 font-medium">Journée complète</Text>
                            </View>
                            <Switch
                                value={isFullDay}
                                onValueChange={setIsFullDay}
                                trackColor={{ false: colors.gray[300], true: colors.secondary[400] }}
                                thumbColor={isFullDay ? colors.secondary[600] : '#fff'}
                            />
                        </View>

                        {!isFullDay && (
                            <View className="flex-row gap-4 mt-4">
                                <View className="flex-1">
                                    <Text className="text-gray-500 text-xs mb-1">De</Text>
                                    <TextInput
                                        className="bg-gray-50 rounded-xl p-3 text-gray-800 font-medium"
                                        value={startTime}
                                        onChangeText={setStartTime}
                                        placeholder="09:00"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-500 text-xs mb-1">À</Text>
                                    <TextInput
                                        className="bg-gray-50 rounded-xl p-3 text-gray-800 font-medium"
                                        value={endTime}
                                        onChangeText={setEndTime}
                                        placeholder="17:00"
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                </Animatable.View>

                {/* Details */}
                <Animatable.View animation="fadeInUp" delay={300}>
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
                        <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Détails (optionnel)</Text>
                        
                        <TextInput
                            className="bg-gray-50 rounded-xl p-3.5 text-gray-800 mb-3"
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Titre (ex: Vacances d'été)"
                            placeholderTextColor={colors.gray[400]}
                        />
                        
                        <TextInput
                            className="bg-gray-50 rounded-xl p-3.5 text-gray-800 h-20"
                            value={reason}
                            onChangeText={setReason}
                            placeholder="Raison ou notes..."
                            placeholderTextColor={colors.gray[400]}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                </Animatable.View>

                {/* Options */}
                <Animatable.View animation="fadeInUp" delay={400}>
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
                        {/* Recurrence */}
                        <View className="flex-row items-center justify-between pb-4 border-b border-gray-100">
                            <View className="flex-row items-center gap-3">
                                <Ionicons name="repeat" size={22} color={colors.gray[600]} />
                                <Text className="text-gray-700 font-medium">Récurrence</Text>
                            </View>
                            <Switch
                                value={isRecurring}
                                onValueChange={setIsRecurring}
                                trackColor={{ false: colors.gray[300], true: colors.secondary[400] }}
                                thumbColor={isRecurring ? colors.secondary[600] : '#fff'}
                            />
                        </View>

                        {isRecurring && (
                            <TouchableOpacity
                                onPress={() => setShowRecurrencePicker(true)}
                                className="flex-row items-center bg-gray-50 rounded-xl p-3 mt-4 gap-3"
                            >
                                <Ionicons name="calendar-outline" size={20} color={colors.gray[600]} />
                                <Text className="flex-1 text-gray-800 font-medium">{RECURRENCE_LABELS[recurrencePattern]}</Text>
                                <Ionicons name="chevron-down" size={20} color={colors.gray[400]} />
                            </TouchableOpacity>
                        )}

                        {/* Notification */}
                        <View className="flex-row items-center justify-between pt-4 mt-4 border-t border-gray-100">
                            <View className="flex-row items-center gap-3 flex-1">
                                <Ionicons name="notifications-outline" size={22} color={colors.gray[600]} />
                                <View className="flex-1">
                                    <Text className="text-gray-700 font-medium">Notifier les patients</Text>
                                    <Text className="text-gray-500 text-xs">Les patients avec RDV seront informés</Text>
                                </View>
                            </View>
                            <Switch
                                value={notifyPatients}
                                onValueChange={setNotifyPatients}
                                trackColor={{ false: colors.gray[300], true: colors.secondary[400] }}
                                thumbColor={notifyPatients ? colors.secondary[600] : '#fff'}
                            />
                        </View>
                    </View>
                </Animatable.View>

                {/* Conflict Check */}
                <Animatable.View animation="fadeInUp" delay={500}>
                    <View
                        className="bg-white rounded-3xl p-4 mb-28"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.08,
                            shadowRadius: 12,
                            elevation: 3,
                        }}
                    >
                        <TouchableOpacity
                            onPress={checkConflicts}
                            disabled={checkingConflicts}
                            className="flex-row items-center justify-center gap-2 bg-secondary-50 rounded-xl p-4"
                        >
                            {checkingConflicts ? (
                                <ActivityIndicator size="small" color={colors.secondary[600]} />
                            ) : (
                                <>
                                    <Ionicons name="search" size={20} color={colors.secondary[600]} />
                                    <Text className="text-secondary-600 font-bold">Vérifier les conflits</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {conflicts && (
                            <View
                                className={`flex-row items-center rounded-xl p-4 mt-3 gap-3 ${
                                    conflicts.has_conflicts ? 'bg-amber-50' : 'bg-green-50'
                                }`}
                            >
                                <Ionicons
                                    name={conflicts.has_conflicts ? 'warning' : 'checkmark-circle'}
                                    size={24}
                                    color={conflicts.has_conflicts ? '#F59E0B' : '#10B981'}
                                />
                                <View className="flex-1">
                                    <Text className={`font-bold ${conflicts.has_conflicts ? 'text-amber-600' : 'text-green-600'}`}>
                                        {conflicts.has_conflicts ? `${conflicts.affected_count} RDV affecté${conflicts.affected_count > 1 ? 's' : ''}` : 'Aucun conflit'}
                                    </Text>
                                    <Text className="text-gray-600 text-xs mt-0.5">{conflicts.recommendation}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </Animatable.View>
            </ScrollView>

            {/* Submit Button */}
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
                <TouchableOpacity onPress={handleSubmit} disabled={loading} className="overflow-hidden rounded-2xl">
                    <LinearGradient
                        colors={loading ? [colors.gray[400], colors.gray[500]] : [colors.secondary[500], colors.secondary[600]]}
                        className="flex-row items-center justify-center gap-2 py-4"
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                                <Text className="text-white font-bold text-lg">Créer l'absence</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Type Picker Modal */}
            <Modal visible={showTypePicker} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-5 pb-10">
                        <Text className="text-gray-800 text-lg font-bold text-center mb-5">Type d'absence</Text>
                        {ABSENCE_TYPES.map(type => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => { setAbsenceType(type); setShowTypePicker(false); }}
                                className={`flex-row items-center p-3.5 rounded-xl gap-3 ${absenceType === type ? 'bg-secondary-50' : ''}`}
                            >
                                <View
                                    className="w-11 h-11 rounded-xl items-center justify-center"
                                    style={{ backgroundColor: ABSENCE_TYPE_COLORS[type] + '20' }}
                                >
                                    <Ionicons name={ABSENCE_TYPE_ICONS[type] as any} size={22} color={ABSENCE_TYPE_COLORS[type]} />
                                </View>
                                <Text className="flex-1 text-gray-700 font-medium text-base">{ABSENCE_TYPE_LABELS[type]}</Text>
                                {absenceType === type && <Ionicons name="checkmark" size={22} color={colors.secondary[500]} />}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity onPress={() => setShowTypePicker(false)} className="items-center py-4 mt-2">
                            <Text className="text-gray-500 font-medium">Annuler</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Recurrence Picker Modal */}
            <Modal visible={showRecurrencePicker} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-5 pb-10">
                        <Text className="text-gray-800 text-lg font-bold text-center mb-5">Récurrence</Text>
                        {RECURRENCE_PATTERNS.map(pattern => (
                            <TouchableOpacity
                                key={pattern}
                                onPress={() => { setRecurrencePattern(pattern); setShowRecurrencePicker(false); }}
                                className={`flex-row items-center p-3.5 rounded-xl ${recurrencePattern === pattern ? 'bg-secondary-50' : ''}`}
                            >
                                <Text className="flex-1 text-gray-700 font-medium text-base">{RECURRENCE_LABELS[pattern]}</Text>
                                {recurrencePattern === pattern && <Ionicons name="checkmark" size={22} color={colors.secondary[500]} />}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity onPress={() => setShowRecurrencePicker(false)} className="items-center py-4 mt-2">
                            <Text className="text-gray-500 font-medium">Annuler</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
