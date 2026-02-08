/**
 * Premium Calendar Picker Component
 * 
 * A beautiful, scrollable calendar picker for appointment booking.
 * Supports infinite scrolling between months with smooth animations.
 * Uses NativeWind styling for premium look and feel.
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    ScrollView,
    Dimensions,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { colors } from '@/lib/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CALENDAR_PADDING = 20;
const DAY_SIZE = (SCREEN_WIDTH - CALENDAR_PADDING * 2 - 48) / 7; // 48 = card padding

// Weekday labels (starting from Monday for French convention)
const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// Month names in French
const MONTH_NAMES = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export type DateStatus = 'available' | 'blocked' | 'full' | 'past' | 'unavailable' | 'unknown';

interface CalendarPickerProps {
    selectedDate: Date | null;
    onSelectDate: (date: Date) => void;
    getDateStatus: (date: Date) => DateStatus;
    minDate?: Date;
    maxMonthsAhead?: number;
}

interface MonthData {
    year: number;
    month: number;
    days: (Date | null)[];
}

/**
 * Convert JavaScript day (0=Sunday) to ISO day (0=Monday)
 */
const jsToIsoDay = (jsDay: number): number => {
    return jsDay === 0 ? 6 : jsDay - 1;
};

/**
 * Generate calendar data for a specific month
 */
const generateMonthData = (year: number, month: number): MonthData => {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Get the day of week for the first day (convert to Monday-based)
    const firstDayOfWeek = jsToIsoDay(firstDay.getDay());
    
    const days: (Date | null)[] = [];
    
    // Add empty days for alignment (Monday-based)
    for (let i = 0; i < firstDayOfWeek; i++) {
        days.push(null);
    }
    
    // Add actual days
    for (let d = 1; d <= daysInMonth; d++) {
        days.push(new Date(year, month, d));
    }
    
    return { year, month, days };
};

export default function CalendarPicker({
    selectedDate,
    onSelectDate,
    getDateStatus,
    minDate = new Date(),
    maxMonthsAhead = 12
}: CalendarPickerProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Current displayed month
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    
    // Animation direction
    const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
    const calendarRef = useRef<Animatable.View>(null);
    
    // Generate month data
    const monthData = useMemo(() => 
        generateMonthData(currentYear, currentMonth),
        [currentYear, currentMonth]
    );
    
    // Calculate min/max bounds
    const minMonth = minDate.getMonth();
    const minYear = minDate.getFullYear();
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + maxMonthsAhead);
    const maxMonth = maxDate.getMonth();
    const maxYear = maxDate.getFullYear();
    
    // Check if we can navigate
    const canGoPrev = currentYear > minYear || (currentYear === minYear && currentMonth > minMonth);
    const canGoNext = currentYear < maxYear || (currentYear === maxYear && currentMonth < maxMonth);
    
    const goToPrevMonth = useCallback(() => {
        if (!canGoPrev) return;
        
        setSlideDirection('right');
        if (calendarRef.current) {
            (calendarRef.current as any).slideInLeft?.(300);
        }
        
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    }, [canGoPrev, currentMonth, currentYear]);
    
    const goToNextMonth = useCallback(() => {
        if (!canGoNext) return;
        
        setSlideDirection('left');
        if (calendarRef.current) {
            (calendarRef.current as any).slideInRight?.(300);
        }
        
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    }, [canGoNext, currentMonth, currentYear]);
    
    const handleDateSelect = useCallback((date: Date) => {
        const status = getDateStatus(date);
        if (status === 'past' || status === 'blocked' || status === 'full') return;
        onSelectDate(date);
    }, [getDateStatus, onSelectDate]);
    
    const isToday = (date: Date): boolean => {
        return date.toDateString() === today.toDateString();
    };
    
    const isSelected = (date: Date): boolean => {
        return selectedDate?.toDateString() === date.toDateString();
    };

    return (
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
            {/* Month/Year Header */}
            <LinearGradient
                colors={[colors.primary[500], colors.primary[600]]}
                className="px-5 py-4"
            >
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={goToPrevMonth}
                        disabled={!canGoPrev}
                        className={`w-10 h-10 rounded-xl items-center justify-center ${
                            canGoPrev ? 'bg-white/20' : 'bg-white/10'
                        }`}
                    >
                        <Ionicons 
                            name="chevron-back" 
                            size={22} 
                            color={canGoPrev ? 'white' : 'rgba(255,255,255,0.3)'} 
                        />
                    </TouchableOpacity>
                    
                    <Animatable.View 
                        animation={slideDirection === 'left' ? 'fadeIn' : slideDirection === 'right' ? 'fadeIn' : undefined}
                        duration={200}
                        className="items-center"
                    >
                        <Text className="text-white font-bold text-xl">
                            {MONTH_NAMES[currentMonth]}
                        </Text>
                        <Text className="text-white/70 text-sm">{currentYear}</Text>
                    </Animatable.View>
                    
                    <TouchableOpacity
                        onPress={goToNextMonth}
                        disabled={!canGoNext}
                        className={`w-10 h-10 rounded-xl items-center justify-center ${
                            canGoNext ? 'bg-white/20' : 'bg-white/10'
                        }`}
                    >
                        <Ionicons 
                            name="chevron-forward" 
                            size={22} 
                            color={canGoNext ? 'white' : 'rgba(255,255,255,0.3)'} 
                        />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
            
            {/* Weekday Headers */}
            <View className="flex-row px-4 pt-4 pb-2">
                {WEEKDAYS.map(day => (
                    <View key={day} style={{ width: DAY_SIZE }} className="items-center">
                        <Text className="text-gray-400 text-xs font-semibold">{day}</Text>
                    </View>
                ))}
            </View>
            
            {/* Calendar Grid */}
            <Animatable.View 
                ref={calendarRef}
                className="flex-row flex-wrap px-4 pb-4"
            >
                {monthData.days.map((date, index) => {
                    if (!date) {
                        return (
                            <View 
                                key={`empty-${index}`} 
                                style={{ width: DAY_SIZE, height: DAY_SIZE + 8 }} 
                            />
                        );
                    }
                    
                    const status = getDateStatus(date);
                    const selected = isSelected(date);
                    const todayDate = isToday(date);
                    const isDisabled = status === 'past' || status === 'blocked' || status === 'full';
                    
                    return (
                        <TouchableOpacity
                            key={date.toISOString()}
                            onPress={() => handleDateSelect(date)}
                            disabled={isDisabled}
                            style={{ width: DAY_SIZE, height: DAY_SIZE + 8 }}
                            className="items-center justify-center py-1"
                        >
                            <View 
                                className={`w-10 h-10 rounded-xl items-center justify-center ${
                                    selected ? 'bg-primary-500' :
                                    todayDate ? 'bg-primary-50 border-2 border-primary-200' :
                                    status === 'available' ? 'bg-gray-50' : ''
                                }`}
                                style={selected ? {
                                    shadowColor: colors.primary[500],
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: 6,
                                } : {}}
                            >
                                <Text className={`text-sm font-semibold ${
                                    selected ? 'text-white' :
                                    isDisabled ? 'text-gray-300' :
                                    todayDate ? 'text-primary-600' :
                                    'text-gray-700'
                                }`}>
                                    {date.getDate()}
                                </Text>
                            </View>
                            
                            {/* Status Indicator */}
                            <View className="h-1.5 mt-0.5">
                                {status === 'available' && !selected && (
                                    <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                )}
                                {status === 'blocked' && (
                                    <View className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                )}
                                {status === 'full' && (
                                    <View className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </Animatable.View>
            
            {/* Legend */}
            <View className="flex-row items-center justify-center gap-6 px-4 pb-4 pt-2 border-t border-gray-100">
                <View className="flex-row items-center gap-1.5">
                    <View className="w-2 h-2 rounded-full bg-green-500" />
                    <Text className="text-gray-500 text-xs">Disponible</Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                    <View className="w-2 h-2 rounded-full bg-red-400" />
                    <Text className="text-gray-500 text-xs">Absent</Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                    <View className="w-2 h-2 rounded-full bg-gray-300" />
                    <Text className="text-gray-500 text-xs">Complet</Text>
                </View>
            </View>
            
            {/* Quick Jump */}
            <View className="px-4 pb-4">
                <View className="bg-gray-50 rounded-2xl p-3 flex-row items-center justify-between">
                    <TouchableOpacity 
                        onPress={() => {
                            setCurrentMonth(today.getMonth());
                            setCurrentYear(today.getFullYear());
                        }}
                        className="flex-row items-center gap-2 px-3 py-1.5 bg-white rounded-xl"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 2,
                        }}
                    >
                        <Ionicons name="today" size={16} color={colors.primary[600]} />
                        <Text className="text-primary-600 font-semibold text-sm">Aujourd'hui</Text>
                    </TouchableOpacity>
                    
                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity 
                            onPress={() => {
                                const nextWeek = new Date(today);
                                nextWeek.setDate(nextWeek.getDate() + 7);
                                setCurrentMonth(nextWeek.getMonth());
                                setCurrentYear(nextWeek.getFullYear());
                            }}
                            className="px-3 py-1.5 bg-white rounded-xl"
                        >
                            <Text className="text-gray-600 font-medium text-sm">+1 sem</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => {
                                const nextMonth = new Date(today);
                                nextMonth.setMonth(nextMonth.getMonth() + 1);
                                setCurrentMonth(nextMonth.getMonth());
                                setCurrentYear(nextMonth.getFullYear());
                            }}
                            className="px-3 py-1.5 bg-white rounded-xl"
                        >
                            <Text className="text-gray-600 font-medium text-sm">+1 mois</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}
