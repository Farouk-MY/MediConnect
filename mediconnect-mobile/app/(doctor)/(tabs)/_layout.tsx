import { View, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/lib/constants/colors';
import { BlurView } from 'expo-blur';

// Modern elevated tab bar icon
function TabBarIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
    return (
        <View
            style={{
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
            }}
        >
            {focused ? (
                <View style={{ position: 'relative' }}>
                    {/* Glow effect */}
                    <View
                        style={{
                            position: 'absolute',
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            backgroundColor: colors.secondary[500],
                            opacity: 0.2,
                            top: -2,
                            left: -2,
                        }}
                    />
                    <LinearGradient
                        colors={[colors.secondary[400], colors.secondary[600]]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: 18,
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: colors.secondary[600],
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.4,
                            shadowRadius: 16,
                            elevation: 12,
                            transform: [{ translateY: -8 }],
                        }}
                    >
                        <Ionicons name={name} size={28} color="white" />
                    </LinearGradient>
                </View>
            ) : (
                <View
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        backgroundColor: colors.gray[100],
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Ionicons name={name} size={24} color={color} />
                </View>
            )}
        </View>
    );
}

export default function DoctorTabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.secondary[600],
                tabBarInactiveTintColor: colors.gray[500],
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '700',
                    marginTop: 4,
                    marginBottom: Platform.OS === 'ios' ? 8 : 6,
                    letterSpacing: 0.3,
                },
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 24,
                    left: 20,
                    right: 20,
                    height: 80,
                    backgroundColor: 'white',
                    borderRadius: 28,
                    borderTopWidth: 0,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 12,
                    },
                    shadowOpacity: 0.18,
                    shadowRadius: 24,
                    elevation: 20,
                    paddingTop: 10,
                    paddingBottom: Platform.OS === 'ios' ? 16 : 12,
                    paddingHorizontal: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.04)',
                },
                tabBarItemStyle: {
                    paddingVertical: 4,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? 'grid' : 'grid-outline'}
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="appointments"
                options={{
                    title: 'Appointments',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? 'calendar' : 'calendar-outline'}
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="qr-scanner"
                options={{
                    title: 'QR Scan',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? 'qr-code-outline' : 'qr-code-outline'}
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="schedule"
                options={{
                    title: 'Schedule',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? 'time' : 'time-outline'}
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? 'person' : 'person-outline'}
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}