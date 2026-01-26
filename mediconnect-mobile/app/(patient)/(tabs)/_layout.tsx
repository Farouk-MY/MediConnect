import { View, Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/lib/constants/colors';

// Custom animated tab bar icon
function TabBarIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
    return (
        <View
            style={{
                alignItems: 'center',
                justifyContent: 'center',
                top: focused ? -10 : 0,
            }}
        >
            {focused ? (
                <LinearGradient
                    colors={[colors.primary[400], colors.primary[600]]}
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: colors.primary[600],
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                    }}
                >
                    <Ionicons name={name} size={28} color="white" />
                </LinearGradient>
            ) : (
                <View
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: colors.gray[50],
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

export default function PatientTabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary[600],
                tabBarInactiveTintColor: colors.gray[500],
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '700',
                    marginTop: 2,
                    marginBottom: 8,
                    letterSpacing: 0.2,
                },
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    height: 75,
                    backgroundColor: 'white',
                    borderRadius: 24,
                    borderTopWidth: 0,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 10,
                    },
                    shadowOpacity: 0.15,
                    shadowRadius: 20,
                    elevation: 15,
                    paddingTop: 8,
                    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
                    paddingHorizontal: 10,
                },
                tabBarItemStyle: {
                    paddingVertical: 5,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? 'home' : 'home-outline'}
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="appointments"
                options={{
                    title: 'Bookings',
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
                name="qr-code"
                options={{
                    title: 'QR Code',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? 'qr-code' : 'qr-code-outline'}
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="analytics"
                options={{
                    title: 'Stats',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? 'stats-chart' : 'stats-chart-outline'}
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