/**
 * Doctor Schedule Screen
 * 
 * Premium calendar interface for managing doctor availability.
 * Features Day/Week/Month views with appointments and absences.
 * Uses NativeWind for styling to match doctor interface design.
 */

import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/constants/colors';
import { useAuthStore } from '@/lib/stores/authStore';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { availabilityApi, ComputedAvailability, ComputedDayAvailability, ComputedTimeSlot, WeeklySchedule } from '@/lib/api/availability';
import { absencesApi, Absence, ABSENCE_TYPE_COLORS, ABSENCE_TYPE_ICONS, ABSENCE_TYPE_LABELS } from '@/lib/api/absences';
import { appointmentsApi, Appointment } from '@/lib/api/appointments';
import { useScheduleWebSocket, ScheduleEvent } from '@/lib/hooks/useScheduleWebSocket';
import OpeningHoursEditor from '@/components/doctor/OpeningHoursEditor';

type CalendarView = 'day' | 'week' | 'month';

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const FULL_DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

// ==================== Helper Functions ====================

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const getWeekDates = (date: Date): Date[] => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return d;
    });
};

const getMonthDates = (date: Date): (Date | null)[][] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const weeks: (Date | null)[][] = [];
    let week: (Date | null)[] = [];
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < startDay; i++) week.push(null);
    for (let day = 1; day <= lastDay.getDate(); day++) {
        week.push(new Date(year, month, day));
        if (week.length === 7) { weeks.push(week); week = []; }
    }
    if (week.length > 0) {
        while (week.length < 7) week.push(null);
        weeks.push(week);
    }
    return weeks;
};

// ==================== Components ====================

const ViewSwitcher = ({ currentView, onViewChange }: { currentView: CalendarView; onViewChange: (v: CalendarView) => void }) => (
    <View className="flex-row bg-white/15 rounded-2xl p-1 mx-6 mt-4">
        {(['day', 'week', 'month'] as CalendarView[]).map((view) => (
            <TouchableOpacity
                key={view}
                onPress={() => onViewChange(view)}
                className={`flex-1 flex-row items-center justify-center py-3 rounded-xl gap-1.5 ${currentView === view ? 'bg-white' : ''}`}
            >
                <Ionicons
                    name={view === 'day' ? 'today' : view === 'week' ? 'calendar' : 'grid'}
                    size={16}
                    color={currentView === view ? colors.secondary[600] : 'rgba(255,255,255,0.8)'}
                />
                <Text className={`text-xs font-semibold ${currentView === view ? 'text-secondary-600' : 'text-white/80'}`}>
                    {view === 'day' ? 'Jour' : view === 'week' ? 'Semaine' : 'Mois'}
                </Text>
            </TouchableOpacity>
        ))}
    </View>
);

const DateNavigator = ({ date, view, onPrev, onNext, onToday }: any) => {
    const getTitle = () => {
        if (view === 'day') {
            return `${FULL_DAY_NAMES[date.getDay() === 0 ? 6 : date.getDay() - 1]} ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
        } else if (view === 'week') {
            const weekDates = getWeekDates(date);
            const startMonth = MONTH_NAMES[weekDates[0].getMonth()].slice(0, 3);
            const endMonth = MONTH_NAMES[weekDates[6].getMonth()].slice(0, 3);
            return startMonth === endMonth
                ? `${weekDates[0].getDate()} - ${weekDates[6].getDate()} ${startMonth} ${date.getFullYear()}`
                : `${weekDates[0].getDate()} ${startMonth} - ${weekDates[6].getDate()} ${endMonth}`;
        }
        return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
    };

    return (
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
            <TouchableOpacity
                onPress={onPrev}
                className="w-11 h-11 rounded-xl items-center justify-center"
                style={{ backgroundColor: colors.secondary[50] }}
            >
                <Ionicons name="chevron-back" size={22} color={colors.secondary[600]} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={onToday} className="flex-1 items-center">
                <Text className="text-gray-800 text-base font-bold">{getTitle()}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
                onPress={onNext}
                className="w-11 h-11 rounded-xl items-center justify-center"
                style={{ backgroundColor: colors.secondary[50] }}
            >
                <Ionicons name="chevron-forward" size={22} color={colors.secondary[600]} />
            </TouchableOpacity>
        </View>
    );
};

const TimeSlotCard = ({ slot, appointment, onPress, delay }: any) => {
    if (!slot.is_available && !slot.is_booked) return null;
    
    const getStatusColor = () => {
        if (slot.is_booked) {
            if (appointment?.status === 'confirmed') return colors.secondary[500];
            if (appointment?.status === 'pending') return '#F59E0B';
            if (appointment?.status === 'completed') return '#10B981';
            return colors.gray[400];
        }
        return colors.secondary[200];
    };

    return (
        <Animatable.View animation="fadeInUp" delay={delay} duration={400}>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
                style={{
                    borderLeftWidth: 4,
                    borderLeftColor: getStatusColor(),
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                }}
            >
                <View className="mr-3">
                    <Text className="text-gray-700 font-semibold text-sm">{slot.start_time}</Text>
                    <Text className="text-gray-400 text-xs">- {slot.end_time}</Text>
                </View>
                
                <View className="flex-1">
                    {slot.is_booked && appointment ? (
                        <>
                            <Text className="text-gray-800 font-bold text-base mb-0.5" numberOfLines={1}>
                                {appointment.patient?.first_name} {appointment.patient?.last_name}
                            </Text>
                            <View className="flex-row items-center gap-1">
                                <Ionicons
                                    name={appointment.consultation_type === 'online' ? 'videocam' : 'location'}
                                    size={12}
                                    color={colors.gray[500]}
                                />
                                <Text className="text-gray-500 text-xs">
                                    {appointment.consultation_type === 'online' ? 'En ligne' : 'Présentiel'}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <Text className="text-secondary-600 font-medium text-sm">Créneau disponible</Text>
                    )}
                </View>
                
                <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: getStatusColor() + '20' }}
                >
                    <View
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: getStatusColor() }}
                    />
                </View>
            </TouchableOpacity>
        </Animatable.View>
    );
};

const DayView = ({ date, availability, appointments, loading, onSlotPress }: any) => {
    const isToday = formatDate(date) === formatDate(new Date());

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={colors.secondary[500]} />
            </View>
        );
    }

    if (availability?.is_blocked) {
        return (
            <View className="flex-1 p-5">
                <LinearGradient
                    colors={['#FEE2E2', '#FEF2F2']}
                    className="flex-1 rounded-3xl items-center justify-center"
                >
                    <Ionicons name="close-circle" size={56} color="#EF4444" />
                    <Text className="text-red-500 text-2xl font-bold mt-4">Indisponible</Text>
                    <Text className="text-gray-600 text-sm mt-2">{availability.block_reason}</Text>
                </LinearGradient>
            </View>
        );
    }

    if (!availability?.is_working_day) {
        return (
            <View className="flex-1 items-center justify-center">
                <Ionicons name="moon" size={56} color={colors.gray[400]} />
                <Text className="text-gray-500 text-lg mt-4">Jour non travaillé</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
            {/* Current time indicator for today */}
            {isToday && (
                <Animatable.View animation="fadeIn" className="flex-row items-center mb-3">
                    <View className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <View className="flex-1 h-0.5 bg-red-500 ml-1" />
                </Animatable.View>
            )}

            {/* Time slots */}
            {availability?.slots?.map((slot: ComputedTimeSlot, index: number) => {
                const appt = appointments?.find((a: Appointment) => a.id === slot.appointment_id);
                return (
                    <TimeSlotCard
                        key={`${slot.start_time}-${index}`}
                        slot={slot}
                        appointment={appt}
                        onPress={() => onSlotPress(slot, appt)}
                        delay={index * 50}
                    />
                );
            })}

            {/* Stats Card */}
            <Animatable.View animation="fadeInUp" delay={300} className="mt-4 mb-24">
                <View
                    className="bg-white rounded-3xl p-5 flex-row"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.08,
                        shadowRadius: 12,
                        elevation: 3,
                    }}
                >
                    <View className="flex-1 items-center">
                        <Text className="text-gray-900 text-3xl font-bold">{availability?.booked_slot_count || 0}</Text>
                        <Text className="text-gray-500 text-sm">Réservés</Text>
                    </View>
                    <View className="w-px bg-gray-200" />
                    <View className="flex-1 items-center">
                        <Text className="text-gray-900 text-3xl font-bold">{availability?.available_slot_count || 0}</Text>
                        <Text className="text-gray-500 text-sm">Disponibles</Text>
                    </View>
                </View>
            </Animatable.View>
        </ScrollView>
    );
};

const WeekView = ({ dates, availabilityData, onDayPress }: any) => {
    const today = formatDate(new Date());

    return (
        <View className="flex-1 bg-white">
            {/* Day headers */}
            <View className="flex-row py-3 border-b border-gray-100">
                {dates.map((date: Date, index: number) => {
                    const dateStr = formatDate(date);
                    const isToday = dateStr === today;
                    const dayAvailability = availabilityData?.days?.find((d: any) => d.date === dateStr);

                    return (
                        <TouchableOpacity
                            key={dateStr}
                            className="flex-1 items-center"
                            onPress={() => onDayPress(date)}
                        >
                            <Text className={`text-xs mb-1 ${isToday ? 'text-secondary-600' : 'text-gray-500'}`}>
                                {DAY_NAMES[index]}
                            </Text>
                            <View className={`w-8 h-8 rounded-xl items-center justify-center ${isToday ? 'bg-secondary-500' : ''}`}>
                                <Text className={`text-sm font-bold ${isToday ? 'text-white' : 'text-gray-700'}`}>
                                    {date.getDate()}
                                </Text>
                            </View>
                            {dayAvailability && (
                                <View className="flex-row gap-1 mt-1">
                                    {dayAvailability.booked_slot_count > 0 && (
                                        <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.secondary[500] }} />
                                    )}
                                    {dayAvailability.is_blocked && (
                                        <View className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Week content */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {HOURS.map(hour => (
                    <View key={hour} className="flex-row h-12 border-b border-gray-50">
                        <Text className="w-12 text-xs text-gray-400 text-right pr-2 pt-1">{`${hour}:00`}</Text>
                        <View className="flex-1 flex-row">
                            {dates.map((date: Date) => {
                                const dateStr = formatDate(date);
                                const dayAvailability = availabilityData?.days?.find((d: any) => d.date === dateStr);
                                const hourSlots = dayAvailability?.slots?.filter(
                                    (s: any) => parseInt(s.start_time.split(':')[0]) === hour
                                ) || [];

                                return (
                                    <TouchableOpacity
                                        key={`${dateStr}-${hour}`}
                                        className={`flex-1 border-l border-gray-50 p-0.5 flex-row flex-wrap gap-0.5
                                            ${dayAvailability?.is_blocked ? 'bg-red-50' : ''}
                                            ${!dayAvailability?.is_working_day ? 'bg-gray-50' : ''}`}
                                        onPress={() => onDayPress(date)}
                                    >
                                        {hourSlots.map((slot: any, i: number) => (
                                            <View
                                                key={i}
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: slot.is_booked ? colors.secondary[500] : colors.secondary[200] }}
                                            />
                                        ))}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const MonthView = ({ weeks, selectedDate, availabilityData, onDayPress, absences }: any) => {
    const today = formatDate(new Date());
    const selectedStr = formatDate(selectedDate);

    return (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Calendar Card */}
            <Animatable.View animation="fadeInUp" delay={100} className="mx-4 mt-4">
                <View
                    className="bg-white rounded-3xl p-4"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.08,
                        shadowRadius: 12,
                        elevation: 3,
                    }}
                >
                    {/* Day names */}
                    <View className="flex-row mb-3">
                        {DAY_NAMES.map(name => (
                            <Text key={name} className="flex-1 text-center text-xs font-semibold text-gray-500">{name}</Text>
                        ))}
                    </View>

                    {/* Weeks */}
                    {weeks.map((week: (Date | null)[], weekIndex: number) => (
                        <View key={weekIndex} className="flex-row mb-1">
                            {week.map((date, dayIndex) => {
                                if (!date) return <View key={`empty-${dayIndex}`} className="flex-1 h-12" />;
                                
                                const dateStr = formatDate(date);
                                const isToday = dateStr === today;
                                const isSelected = dateStr === selectedStr;
                                const dayAvailability = availabilityData?.days?.find((d: any) => d.date === dateStr);
                                const bookedCount = dayAvailability?.booked_slot_count || 0;
                                const isBlocked = dayAvailability?.is_blocked;

                                return (
                                    <TouchableOpacity
                                        key={dateStr}
                                        className={`flex-1 h-12 items-center justify-center rounded-xl mx-0.5
                                            ${isToday && !isSelected ? 'bg-secondary-50' : ''}
                                            ${isSelected ? 'bg-secondary-500' : ''}
                                            ${isBlocked ? 'bg-red-50' : ''}`}
                                        onPress={() => onDayPress(date)}
                                    >
                                        <Text className={`text-sm font-medium
                                            ${isToday && !isSelected ? 'text-secondary-600 font-bold' : ''}
                                            ${isSelected ? 'text-white font-bold' : 'text-gray-700'}
                                            ${isBlocked && !isSelected ? 'text-red-500' : ''}`}>
                                            {date.getDate()}
                                        </Text>
                                        
                                        {bookedCount > 0 && (
                                            <View className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-secondary-500 items-center justify-center">
                                                <Text className="text-white text-[9px] font-bold">{bookedCount > 9 ? '9+' : bookedCount}</Text>
                                            </View>
                                        )}
                                        
                                        {dayAvailability && (
                                            <View className="flex-row gap-0.5 absolute bottom-1">
                                                {dayAvailability.available_slot_count > 0 && (
                                                    <View className="w-1 h-1 rounded-full" style={{ backgroundColor: colors.secondary[300] }} />
                                                )}
                                                {bookedCount > 0 && (
                                                    <View className="w-1 h-1 rounded-full" style={{ backgroundColor: colors.secondary[500] }} />
                                                )}
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </Animatable.View>

            {/* Upcoming Absences */}
            {absences && absences.filter((a: Absence) => a.is_future || a.is_current).length > 0 && (
                <Animatable.View animation="fadeInUp" delay={200} className="mx-4 mt-6">
                    <Text className="text-gray-900 text-lg font-bold mb-3">Prochaines absences</Text>
                    {absences
                        .filter((a: Absence) => a.is_future || a.is_current)
                        .slice(0, 3)
                        .map((absence: Absence, index: number) => (
                            <View
                                key={absence.id}
                                className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 8,
                                    elevation: 2,
                                }}
                            >
                                <View
                                    className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                                    style={{ backgroundColor: ABSENCE_TYPE_COLORS[absence.absence_type] + '20' }}
                                >
                                    <Ionicons
                                        name={ABSENCE_TYPE_ICONS[absence.absence_type] as any}
                                        size={22}
                                        color={ABSENCE_TYPE_COLORS[absence.absence_type]}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-800 font-bold text-base capitalize">
                                        {absence.title || ABSENCE_TYPE_LABELS[absence.absence_type]}
                                    </Text>
                                    <Text className="text-gray-500 text-xs mt-0.5">
                                        {new Date(absence.start_date).toLocaleDateString('fr-FR')} - {new Date(absence.end_date).toLocaleDateString('fr-FR')}
                                    </Text>
                                </View>
                                {absence.affected_appointments_count > 0 && (
                                    <View className="bg-amber-100 px-3 py-1.5 rounded-xl">
                                        <Text className="text-amber-600 text-xs font-bold">{absence.affected_appointments_count}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                </Animatable.View>
            )}

            <View className="h-24" />
        </ScrollView>
    );
};

// ==================== Main Screen ====================

export default function ScheduleScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    
    const [currentView, setCurrentView] = useState<CalendarView>('day');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availability, setAvailability] = useState<ComputedAvailability | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showHoursEditor, setShowHoursEditor] = useState(false);
    const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule | null>(null);

    // Real-time updates via WebSocket
    const handleScheduleUpdate = useCallback((event: ScheduleEvent) => {
        console.log('[Schedule] Real-time update:', event.event);
        fetchData();
    }, []);

    const handleAbsenceUpdate = useCallback((event: ScheduleEvent) => {
        console.log('[Schedule] Absence update:', event.event);
        fetchData();
    }, []);

    const handleAppointmentUpdate = useCallback((event: ScheduleEvent) => {
        console.log('[Schedule] Appointment update:', event.event);
        fetchData();
    }, []);

    const { isConnected, reconnect } = useScheduleWebSocket({
        doctorId: user?.id || '',
        onScheduleUpdate: handleScheduleUpdate,
        onAbsenceUpdate: handleAbsenceUpdate,
        onAppointmentUpdate: handleAppointmentUpdate,
        enabled: !!user?.id
    });

    const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
    const monthWeeks = useMemo(() => getMonthDates(selectedDate), [selectedDate]);
    const selectedDayAvailability = useMemo(
        () => availability?.days?.find(d => d.date === formatDate(selectedDate)),
        [availability, selectedDate]
    );

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            let startDate: Date, endDate: Date;
            
            if (currentView === 'day') {
                startDate = selectedDate;
                endDate = selectedDate;
            } else if (currentView === 'week') {
                startDate = weekDates[0];
                endDate = weekDates[6];
            } else {
                startDate = monthWeeks[0].find(d => d !== null) || selectedDate;
                const lastWeek = monthWeeks[monthWeeks.length - 1];
                endDate = [...lastWeek].reverse().find(d => d !== null) || selectedDate;
            }

            const [availabilityData, absenceData, appointmentData, scheduleData] = await Promise.all([
                availabilityApi.getComputedAvailability(formatDate(startDate), formatDate(endDate)),
                absencesApi.getMyAbsences(),
                appointmentsApi.getMyAppointments({ upcoming_only: false, page_size: 100 }),
                availabilityApi.getMySchedule().catch(() => null)
            ]);

            setAvailability(availabilityData);
            setAbsences(absenceData.absences);
            setAppointments(appointmentData.appointments);
            if (scheduleData) setWeeklySchedule(scheduleData);
        } catch (error) {
            console.error('Error fetching schedule data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedDate, currentView, weekDates, monthWeeks]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePrev = () => {
        const newDate = new Date(selectedDate);
        if (currentView === 'day') newDate.setDate(newDate.getDate() - 1);
        else if (currentView === 'week') newDate.setDate(newDate.getDate() - 7);
        else newDate.setMonth(newDate.getMonth() - 1);
        setSelectedDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(selectedDate);
        if (currentView === 'day') newDate.setDate(newDate.getDate() + 1);
        else if (currentView === 'week') newDate.setDate(newDate.getDate() + 7);
        else newDate.setMonth(newDate.getMonth() + 1);
        setSelectedDate(newDate);
    };

    const handleDayPress = (date: Date) => {
        setSelectedDate(date);
        setCurrentView('day');
    };

    const handleSlotPress = (slot: ComputedTimeSlot, appointment?: Appointment) => {
        if (appointment) {
            router.push(`/(doctor)/consultation/${appointment.id}`);
        }
    };

    const handleAddAbsence = () => {
        router.push('/(doctor)/absences/create' as any);
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <LinearGradient
                colors={[colors.secondary[500], colors.secondary[600]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="pb-6 pt-14 rounded-b-[40px]"
                style={{
                    shadowColor: colors.secondary[600],
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.25,
                    shadowRadius: 20,
                    elevation: 10,
                }}
            >
                {/* Top Bar */}
                <Animatable.View animation="fadeInDown" duration={600} className="flex-row justify-between items-center px-6 mb-2">
                    <View>
                        <Text className="text-white/90 text-sm font-medium">Mon Planning</Text>
                        <Text className="text-white text-2xl font-bold">Gestion des RDV</Text>
                    </View>

                    <View className="flex-row gap-2">
                        {/* Connection indicator */}
                        <View className={`w-2.5 h-2.5 rounded-full absolute -top-1 -right-1 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                        
                        <TouchableOpacity
                            onPress={() => setShowHoursEditor(true)}
                            className="w-11 h-11 bg-white/20 rounded-2xl items-center justify-center"
                            style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
                        >
                            <Ionicons name="settings-outline" size={22} color="white" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={handleAddAbsence}
                            className="w-11 h-11 bg-white/20 rounded-2xl items-center justify-center"
                            style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
                        >
                            <Ionicons name="add" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </Animatable.View>

                {/* View Switcher */}
                <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
            </LinearGradient>

            {/* Date Navigator */}
            <DateNavigator
                date={selectedDate}
                view={currentView}
                onPrev={handlePrev}
                onNext={handleNext}
                onToday={() => setSelectedDate(new Date())}
            />

            {/* Content */}
            <View className="flex-1">
                {currentView === 'day' && (
                    <DayView
                        date={selectedDate}
                        availability={selectedDayAvailability}
                        appointments={appointments.filter(a => a.appointment_date?.split('T')[0] === formatDate(selectedDate))}
                        loading={loading}
                        onSlotPress={handleSlotPress}
                    />
                )}

                {currentView === 'week' && (
                    <WeekView
                        dates={weekDates}
                        availabilityData={availability}
                        onDayPress={handleDayPress}
                    />
                )}

                {currentView === 'month' && (
                    <MonthView
                        weeks={monthWeeks}
                        selectedDate={selectedDate}
                        availabilityData={availability}
                        onDayPress={handleDayPress}
                        absences={absences}
                    />
                )}
            </View>

            {/* FAB */}
            <TouchableOpacity
                onPress={handleAddAbsence}
                className="absolute right-5 bottom-8"
                style={{
                    shadowColor: colors.secondary[600],
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                }}
            >
                <LinearGradient
                    colors={[colors.secondary[500], colors.secondary[600]]}
                    className="w-14 h-14 rounded-full items-center justify-center"
                >
                    <Ionicons name="calendar-outline" size={24} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>

            {/* Opening Hours Editor Modal */}
            <OpeningHoursEditor
                visible={showHoursEditor}
                onClose={() => setShowHoursEditor(false)}
                onSave={() => {
                    fetchData();
                    setShowHoursEditor(false);
                }}
                initialSchedule={weeklySchedule || undefined}
            />
        </View>
    );
}