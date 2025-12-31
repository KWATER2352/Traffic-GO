import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Dimensions, Animated, Image } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import Constants from 'expo-constants';
import { GOOGLE_MAPS_KEY } from '../local.js';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function TrafficUpdate() {
    const [trafficData, setTrafficData] = useState([]);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError("Permission denied");
                setLoading(false);
                return;
            }

            const position = await Location.getCurrentPositionAsync({});
            setLocation(position.coords);
        })();
    }, []);
    const getRegions = (lat, lon) => [
        { name: "North Area", latitude: lat + 0.08, longitude: lon },
        { name: "South Area", latitude: lat - 0.08, longitude: lon },
        { name: "East Area", latitude: lat, longitude: lon + 0.08 },
        { name: "West Area", latitude: lat, longitude: lon - 0.08 },
    ];

    useEffect(() => {
        if (!location) return;

        const fetchTraffic = async () => {
            setLoading(true);
            const apiKey = GOOGLE_MAPS_KEY;

            const regions = getRegions(location.latitude, location.longitude);
            const results = [];

            for (const region of regions) {
                try {
                    const originLat = location.latitude;
                    const originLon = location.longitude;
                    const destLat = region.latitude;
                    const destLon = region.longitude;
                    const departureTime = Math.floor(Date.now() / 1000);
                    // Add mode=driving and traffic_model for better traffic data
                    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLon}&destinations=${destLat},${destLon}&departure_time=${departureTime}&mode=driving&traffic_model=best_guess&key=${apiKey}`;
                    const response = await axios.get(url);
                    
                    console.log(`API Response for ${region.name}:`, JSON.stringify(response.data, null, 2));
                    
                    if (!response.data || !response.data.rows || !response.data.rows[0] || !response.data.rows[0].elements) {
                        console.error('Invalid API response structure:', response.data);
                        results.push({ region: region.name, status: "No Data" });
                        continue;
                    }
                    
                    const data = response.data.rows[0].elements[0];

                    let status = "No Data";

                    if (data.status === "OK") {
                        const duration = data.duration.value; // in seconds
                        const trafficDuration = data.duration_in_traffic?.value || duration;

                        console.log(`${region.name}: duration=${duration}s, traffic=${trafficDuration}s`);

                        const ratio = trafficDuration / duration;

                        // More sensitive thresholds for better detection
                        if (ratio > 1.3) {
                            status = "Heavy Traffic";
                        } else if (ratio > 1.15) {
                            status = "Moderate Traffic";
                        } else {
                            status = "Light Traffic";
                        }
                        
                        console.log(`${region.name}: ratio=${ratio.toFixed(2)}, status=${status}`);
                    } else {
                        console.log(`${region.name}: API status=${data.status}`);
                    }

                    results.push({ region: region.name, status });
                } catch (e) {
                    console.error(`Error fetching traffic for ${region.name}:`, e.message);
                    results.push({ region: region.name, status: "Error fetching data" });
                }
            }

            setTrafficData(results);
            setLoading(false);
        };

        fetchTraffic();
        const interval = setInterval(fetchTraffic, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [location]);


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Fetching traffic updates...</Text>
            </View>
        );
    }
    if (error) return <Text style={styles.errorText}>{error}</Text>;

    const getStatusColor = (status) => {
        if (status === 'Heavy Traffic') return '#FF4444';
        if (status === 'Moderate Traffic') return '#FFB800';
        if (status === 'Light Traffic') return '#00CC66';
        return '#999';
    };

    const statusImages = {
        'Heavy Traffic': require('../images/heavy.jpeg'),
        'Moderate Traffic': require('../images/moderate.jpeg'),
        'Light Traffic': require('../images/light.jpeg'),
    };

  const getStatusImage = (status) => {
    return statusImages[status] || null;
  };

    const renderRegionCard = ({ item }) => {
        const getStatusIcon = (status) => {
            if (status === 'Heavy Traffic') return 'alert-circle';
            if (status === 'Moderate Traffic') return 'warning';
            if (status === 'Light Traffic') return 'checkmark-circle';
            return 'information-circle';
        };

        return (
            <View style={[styles.card, { width: width - 40 }]}>
                <View style={styles.cardHeader}>
                    <Ionicons name="location" size={24} color="#4CAF50" />
                    <Text style={styles.regionName}>{item.region}</Text>
                </View>
                
                {getStatusImage(item.status) && (
                    <Image
                        source={getStatusImage(item.status)}
                        style={styles.statusImage}
                        resizeMode="cover"
                    />
                )}
                
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Ionicons name={getStatusIcon(item.status)} size={22} color="#fff" style={styles.statusIcon} />
                    <Text style={styles.statusText}>{item.status || 'Loading...'}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headlineContainer}>
                <View style={styles.headerIconWrapper}>
                    <Ionicons name="car" size={32} color="#4CAF50" />
                </View>
                <Text style={styles.headline}>Real-Time Traffic Update</Text>
                <Text style={styles.subtitle}>Live conditions in your area</Text>
            </View>

            <FlatList
                data={trafficData}
                renderItem={renderRegionCard}
                keyExtractor={(item) => item.region}
                horizontal
                pagingEnabled
                scrollEventThrottle={16}
                showsHorizontalScrollIndicator={false}
                snapToInterval={width - 20}
                decelerationRate="fast"
                contentContainerStyle={styles.carouselContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingTop: 30,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    errorText: {
        fontSize: 16,
        color: '#FF4444',
        textAlign: 'center',
        padding: 20,
    },
    headlineContainer: {
        marginBottom: 25,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    headerIconWrapper: {
        backgroundColor: '#e8f5e9',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    headline: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        fontWeight: '400',
    },
    errorText: {
        fontSize: 16,
        color: '#FF4444',
        textAlign: 'center',
        padding: 20,
    },
    headlineContainer: {
        marginBottom: 25,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    headerIconWrapper: {
        backgroundColor: '#e8f5e9',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    headline: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        fontWeight: '400',
    },
    carouselContainer: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    card: {
        marginHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
        justifyContent: 'space-between',
        minHeight: 280,
        borderWidth: 1,
        borderColor: '#e8e8e8',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    regionName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        flex: 1,
    },
    statusImage: {
        width: '100%',
        height: 140,
        borderRadius: 12,
        marginVertical: 15,
    },
    statusBadge: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
        gap: 8,
    },
    statusIcon: {
        marginRight: 5,
    },
    statusText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
});
