import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors } from '@/lib/constants/colors';
import { DoctorPublicProfile } from '@/lib/api/doctors';
import DoctorCard from './DoctorCard';

interface DoctorMapViewProps {
    doctors: DoctorPublicProfile[];
    onDoctorSelect?: (doctor: DoctorPublicProfile) => void;
}

const { width, height } = Dimensions.get('window');

export default function DoctorMapView({ doctors, onDoctorSelect }: DoctorMapViewProps) {
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorPublicProfile | null>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const webViewRef = React.useRef<WebView>(null);

    // Default to Tunisia if no location
    const defaultLocation = { latitude: 36.8065, longitude: 10.1815 };

    useEffect(() => {
        getUserLocation();
    }, []);

    const getUserLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});
                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            }
        } catch (error) {
            console.log('Error getting location:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter doctors with valid coordinates
    const mappableDoctors = useMemo(() => 
        doctors.filter(d => d.latitude && d.longitude), 
        [doctors]
    );

    const centerLat = userLocation?.latitude || defaultLocation.latitude;
    const centerLng = userLocation?.longitude || defaultLocation.longitude;

    // Generate the Leaflet HTML
    const mapHtml = useMemo(() => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #map { height: 100%; width: 100%; }
        
        /* Custom marker styles */
        .doctor-marker {
            width: 40px;
            height: 48px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .marker-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]});
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            transition: transform 0.2s ease;
        }
        .marker-icon.selected {
            transform: scale(1.2);
            background: linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[700]});
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
        }
        .marker-icon svg {
            width: 20px;
            height: 20px;
            fill: white;
        }
        .marker-pointer {
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid ${colors.primary[600]};
            margin-top: -2px;
        }
        
        /* User location marker */
        .user-marker {
            width: 20px;
            height: 20px;
            background: ${colors.primary[500]};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .user-pulse {
            position: absolute;
            width: 40px;
            height: 40px;
            background: rgba(59, 130, 246, 0.3);
            border-radius: 50%;
            animation: pulse 2s ease-out infinite;
            margin-left: -10px;
            margin-top: -10px;
        }
        @keyframes pulse {
            0% { transform: scale(0.5); opacity: 1; }
            100% { transform: scale(2); opacity: 0; }
        }
        
        /* Hide default Leaflet attribution for cleaner look */
        .leaflet-control-attribution { display: none !important; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        // Initialize map with custom style tiles (CartoDB Voyager - clean, modern look)
        const map = L.map('map', {
            zoomControl: false,
            attributionControl: false
        }).setView([${centerLat}, ${centerLng}], 12);
        
        // Use CartoDB Voyager tiles (free, no API key, modern design)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        }).addTo(map);
        
        // Add zoom control to bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        
        // Create custom icon HTML
        function createDoctorIcon(isSelected) {
            return L.divIcon({
                className: 'doctor-marker',
                html: \`
                    <div class="marker-icon \${isSelected ? 'selected' : ''}">
                        <svg viewBox="0 0 24 24">
                            <path d="M19 8h-1V6c0-2.76-2.24-5-5-5S8 3.24 8 6v2H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9h-2v-2h2v2zm0-4h-2v-5h2v5zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/>
                        </svg>
                    </div>
                    <div class="marker-pointer"></div>
                \`,
                iconSize: [40, 48],
                iconAnchor: [20, 48]
            });
        }
        
        // Store markers for selection
        const markers = {};
        let selectedId = null;
        
        // Add doctor markers
        const doctors = ${JSON.stringify(mappableDoctors.map(d => ({
            id: d.id,
            lat: d.latitude,
            lng: d.longitude,
            name: d.first_name + ' ' + d.last_name,
            specialty: d.specialty
        })))};
        
        doctors.forEach(doc => {
            const marker = L.marker([doc.lat, doc.lng], {
                icon: createDoctorIcon(false)
            }).addTo(map);
            
            marker.on('click', () => {
                // Deselect previous
                if (selectedId && markers[selectedId]) {
                    markers[selectedId].setIcon(createDoctorIcon(false));
                }
                // Select new
                selectedId = doc.id;
                marker.setIcon(createDoctorIcon(true));
                
                // Center map on marker with smooth animation
                map.flyTo([doc.lat, doc.lng], 14, { duration: 0.5 });
                
                // Send message to React Native
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'markerClick',
                    doctorId: doc.id
                }));
            });
            
            markers[doc.id] = marker;
        });
        
        // Add user location marker if available
        ${userLocation ? `
            const userMarker = L.divIcon({
                className: '',
                html: '<div class="user-pulse"></div><div class="user-marker"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            L.marker([${userLocation.latitude}, ${userLocation.longitude}], { icon: userMarker }).addTo(map);
        ` : ''}
        
        // Fit bounds to show all markers
        if (doctors.length > 0) {
            const bounds = L.latLngBounds(doctors.map(d => [d.lat, d.lng]));
            ${userLocation ? `bounds.extend([${userLocation.latitude}, ${userLocation.longitude}]);` : ''}
            map.fitBounds(bounds, { padding: [50, 50] });
        }
        
        // Handle messages from React Native
        window.centerOnUser = function() {
            ${userLocation ? `map.flyTo([${userLocation.latitude}, ${userLocation.longitude}], 14, { duration: 0.5 });` : ''}
        };
        
        window.fitAllMarkers = function() {
            if (doctors.length > 0) {
                const bounds = L.latLngBounds(doctors.map(d => [d.lat, d.lng]));
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        };
        
        window.deselectMarker = function() {
            if (selectedId && markers[selectedId]) {
                markers[selectedId].setIcon(createDoctorIcon(false));
                selectedId = null;
            }
        };
    </script>
</body>
</html>
    `, [mappableDoctors, centerLat, centerLng, userLocation]);

    const handleWebViewMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'markerClick') {
                const doctor = doctors.find(d => d.id === data.doctorId);
                if (doctor) {
                    setSelectedDoctor(doctor);
                }
            }
        } catch (error) {
            console.log('WebView message error:', error);
        }
    };

    const handleMapPress = () => {
        setSelectedDoctor(null);
        webViewRef.current?.injectJavaScript('window.deselectMarker(); true;');
    };

    const centerOnUser = () => {
        webViewRef.current?.injectJavaScript('window.centerOnUser(); true;');
    };

    const fitAllMarkers = () => {
        webViewRef.current?.injectJavaScript('window.fitAllMarkers(); true;');
    };

    const handleDoctorCardPress = () => {
        if (selectedDoctor && onDoctorSelect) {
            onDoctorSelect(selectedDoctor);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text className="text-gray-500 mt-4">Loading map...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            <WebView
                ref={webViewRef}
                source={{ html: mapHtml }}
                style={{ flex: 1, width, height: height * 0.7 }}
                onMessage={handleWebViewMessage}
                scrollEnabled={false}
                bounces={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                    <View className="absolute inset-0 items-center justify-center bg-gray-50">
                        <ActivityIndicator size="large" color={colors.primary[600]} />
                    </View>
                )}
            />

            {/* Map Controls */}
            <View className="absolute top-4 right-4 gap-2">
                {/* Center on user */}
                {userLocation && (
                    <TouchableOpacity
                        onPress={centerOnUser}
                        className="bg-white rounded-2xl p-3"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 4,
                        }}
                    >
                        <Ionicons name="locate" size={22} color={colors.primary[600]} />
                    </TouchableOpacity>
                )}

                {/* Fit all markers */}
                <TouchableOpacity
                    onPress={fitAllMarkers}
                    className="bg-white rounded-2xl p-3"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 4,
                    }}
                >
                    <Ionicons name="expand" size={22} color={colors.gray[600]} />
                </TouchableOpacity>
            </View>

            {/* Doctor count badge */}
            <View className="absolute top-4 left-4">
                <View 
                    className="bg-white rounded-2xl px-4 py-2 flex-row items-center gap-2"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 4,
                    }}
                >
                    <Ionicons name="medical" size={18} color={colors.primary[600]} />
                    <Text className="text-gray-800 font-semibold">
                        {mappableDoctors.length} Doctors
                    </Text>
                </View>
            </View>

            {/* Selected Doctor Card */}
            {selectedDoctor && (
                <View 
                    className="absolute bottom-6 left-4 right-4"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 12,
                        elevation: 10,
                    }}
                >
                    <DoctorCard 
                        doctor={selectedDoctor} 
                        onPress={handleDoctorCardPress}
                    />
                </View>
            )}
        </View>
    );
}
