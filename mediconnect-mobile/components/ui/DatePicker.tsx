import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/constants/colors';

interface DatePickerProps {
    value: string;
    onValueChange: (date: string) => void;
    label?: string;
    placeholder?: string;
    icon?: any;
    disableFutureDates?: boolean;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const { width } = Dimensions.get('window');

export function DatePicker({
                               value,
                               onValueChange,
                               label = 'Date',
                               placeholder = 'Select date',
                               icon = 'calendar-outline',
                               disableFutureDates = false
                           }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const getInitialDate = () => {
        if (value) {
            const parsed = new Date(value);
            return isNaN(parsed.getTime()) ? new Date() : parsed;
        }
        return new Date();
    };

    const [viewDate, setViewDate] = useState(getInitialDate());
    const selectedDate = value ? new Date(value) : null;

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(viewDate);
        const firstDay = getFirstDayOfMonth(viewDate);
        const days: (number | null)[] = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        const totalCells = 42;
        while (days.length < totalCells) {
            days.push(null);
        }

        return days;
    };

    const isFutureDate = (day: number): boolean => {
        if (!disableFutureDates) return false;

        const today = new Date();
        const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);

        today.setHours(0, 0, 0, 0);
        checkDate.setHours(0, 0, 0, 0);

        return checkDate > today;
    };

    const isDateSelectable = (day: number): boolean => {
        return !isFutureDate(day);
    };

    const handleDateSelect = (day: number) => {
        if (disableFutureDates && isFutureDate(day)) {
            return;
        }

        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const selected = new Date(year, month, day);

        const yyyy = selected.getFullYear();
        const mm = String(selected.getMonth() + 1).padStart(2, '0');
        const dd = String(selected.getDate()).padStart(2, '0');
        const formatted = `${yyyy}-${mm}-${dd}`;

        onValueChange(formatted);
        setIsOpen(false);
    };

    const changeMonth = (direction: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + direction);

        if (disableFutureDates) {
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth();

            const newYear = newDate.getFullYear();
            const newMonth = newDate.getMonth();

            if (newYear > currentYear || (newYear === currentYear && newMonth > currentMonth)) {
                return;
            }
        }

        setViewDate(newDate);
    };

    const goToToday = () => {
        const today = new Date();
        setViewDate(today);
        handleDateSelect(today.getDate());
    };

    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return placeholder;
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return placeholder;

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    const isToday = (day: number) => {
        const today = new Date();
        const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        return checkDate.toDateString() === today.toDateString();
    };

    const isSelected = (day: number) => {
        if (!selectedDate || isNaN(selectedDate.getTime())) return false;
        const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        return checkDate.toDateString() === selectedDate.toDateString();
    };

    return (
        <View style={{ marginBottom: 16 }}>
            {label && (
                <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.gray[700],
                    marginBottom: 8,
                }}>
                    {label}
                </Text>
            )}

            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    borderWidth: 2,
                    borderColor: value ? colors.primary[200] : colors.gray[200],
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                }}
                onPress={() => setIsOpen(true)}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={icon}
                    size={20}
                    color={value ? colors.primary[600] : colors.gray[400]}
                    style={{ marginRight: 12 }}
                />
                <Text style={{
                    flex: 1,
                    fontSize: 16,
                    color: value ? colors.gray[700] : colors.gray[400],
                    fontWeight: value ? '500' : '400',
                }}>
                    {formatDisplayDate(value)}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={20}
                    color={colors.gray[400]}
                />
            </TouchableOpacity>

            {/* Calendar Modal */}
            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20,
                }}>
                    <View style={{
                        width: '100%',
                        maxWidth: 380,
                        backgroundColor: 'white',
                        borderRadius: 24,
                        overflow: 'hidden',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 20 },
                        shadowOpacity: 0.25,
                        shadowRadius: 25,
                        elevation: 20,
                    }}>
                        {/* Header */}
                        <LinearGradient
                            colors={[colors.primary[500], colors.primary[600]]}
                            style={{ paddingHorizontal: 20, paddingVertical: 24 }}
                        >
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 20,
                            }}>
                                <Text style={{
                                    color: 'white',
                                    fontSize: 20,
                                    fontWeight: 'bold',
                                }}>
                                    Select Date
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setIsOpen(false)}
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 18,
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Ionicons name="close" size={22} color="white" />
                                </TouchableOpacity>
                            </View>

                            {/* Month Navigation */}
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <TouchableOpacity
                                    onPress={() => changeMonth(-1)}
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Ionicons name="chevron-back" size={24} color="white" />
                                </TouchableOpacity>

                                <Text style={{
                                    color: 'white',
                                    fontSize: 20,
                                    fontWeight: 'bold',
                                }}>
                                    {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                                </Text>

                                <TouchableOpacity
                                    onPress={() => changeMonth(1)}
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Ionicons name="chevron-forward" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>

                        {/* Calendar Body */}
                        <View style={{ padding: 20 }}>
                            {/* Today Button */}
                            <TouchableOpacity
                                onPress={goToToday}
                                style={{
                                    alignSelf: 'flex-start',
                                    backgroundColor: colors.primary[50],
                                    paddingHorizontal: 16,
                                    paddingVertical: 10,
                                    borderRadius: 12,
                                    marginBottom: 20,
                                }}
                            >
                                <Text style={{
                                    color: colors.primary[600],
                                    fontWeight: '600',
                                    fontSize: 14,
                                }}>
                                    Today
                                </Text>
                            </TouchableOpacity>

                            {/* Day Headers */}
                            <View style={{
                                flexDirection: 'row',
                                marginBottom: 12,
                            }}>
                                {DAYS.map((day, index) => (
                                    <View
                                        key={index}
                                        style={{
                                            flex: 1,
                                            alignItems: 'center',
                                            paddingVertical: 10,
                                        }}
                                    >
                                        <Text style={{
                                            color: index === 0 ? colors.error : colors.gray[500], // Changed from colors.red[500] to colors.error
                                            fontWeight: '600',
                                            fontSize: 13,
                                            letterSpacing: 0.5,
                                        }}>
                                            {day}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Calendar Grid */}
                            <View style={{
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                borderTopWidth: 1,
                                borderLeftWidth: 1,
                                borderColor: colors.gray[100],
                            }}>
                                {generateCalendarDays().map((day, index) => (
                                    <View
                                        key={index}
                                        style={{
                                            width: `${100 / 7}%`,
                                            aspectRatio: 1,
                                            borderBottomWidth: 1,
                                            borderRightWidth: 1,
                                            borderColor: colors.gray[100],
                                            backgroundColor: day ? 'white' : colors.gray[50],
                                        }}
                                    >
                                        {day ? (
                                            <TouchableOpacity
                                                onPress={() => handleDateSelect(day)}
                                                disabled={!isDateSelectable(day)}
                                                style={{
                                                    flex: 1,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: isSelected(day)
                                                        ? colors.primary[600]
                                                        : isToday(day)
                                                            ? colors.primary[50]
                                                            : 'transparent',
                                                }}
                                            >
                                                <Text style={{
                                                    fontWeight: isSelected(day) || isToday(day) ? '600' : '400',
                                                    fontSize: 15,
                                                    color: isSelected(day)
                                                        ? 'white'
                                                        : isToday(day)
                                                            ? colors.primary[600]
                                                            : isDateSelectable(day)
                                                                ? colors.gray[700]
                                                                : colors.gray[400],
                                                    opacity: isDateSelectable(day) ? 1 : 0.5,
                                                }}>
                                                    {day}
                                                </Text>
                                                {isToday(day) && !isSelected(day) && (
                                                    <View style={{
                                                        position: 'absolute',
                                                        bottom: 6,
                                                        width: 4,
                                                        height: 4,
                                                        borderRadius: 2,
                                                        backgroundColor: colors.primary[600],
                                                    }} />
                                                )}
                                            </TouchableOpacity>
                                        ) : (
                                            <View style={{ flex: 1 }} />
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Footer */}
                        <View style={{
                            flexDirection: 'row',
                            padding: 20,
                            paddingTop: 16,
                            gap: 12,
                            borderTopWidth: 1,
                            borderTopColor: colors.gray[100],
                            backgroundColor: colors.gray[50],
                        }}>
                            <TouchableOpacity
                                onPress={() => {
                                    onValueChange('');
                                    setIsOpen(false);
                                }}
                                style={{
                                    flex: 1,
                                    backgroundColor: colors.gray[200],
                                    paddingVertical: 14,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{
                                    color: colors.gray[700],
                                    fontWeight: 'bold',
                                    fontSize: 15,
                                }}>
                                    Clear
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setIsOpen(false)}
                                style={{
                                    flex: 1,
                                    backgroundColor: colors.primary[600],
                                    paddingVertical: 14,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: 15,
                                }}>
                                    Done
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}