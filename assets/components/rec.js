import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons, Entypo, Fontisto } from '@expo/vector-icons';
import { GOOGLE_MAPS_KEY } from '../local.js';

export default function RouteRecommendation() {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [destinationText, setDestinationText] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [savedRoutes, setSavedRoutes] = useState([]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLoading(false);
                return;
            }
            let pos = await Location.getCurrentPositionAsync({});
            setLocation(pos.coords);
            
            setLoading(false);
        })();
    }, []);

    // Check for destination updates every 2 seconds
    useEffect(() => {
        const checkForDestination = async () => {
            try {
                const recent = await AsyncStorage.getItem('recentDestination');
                if (recent) {
                    const dest = JSON.parse(recent);
                    // Only update if it's different from current
                    if (dest.name !== destinationText || !selectedDestination) {
                        setDestinationText(dest.name);
                        setSelectedDestination(dest);
                        if (location) {
                            fetchRouteRecommendations(dest);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading recent destination:', error);
            }
        };

        checkForDestination();
        const interval = setInterval(checkForDestination, 2000);
        return () => clearInterval(interval);
    }, [location, destinationText]);

    const getPlacePredictions = async (query) => {
        try {
            const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${GOOGLE_MAPS_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            return data.predictions || [];
        } catch (e) {
            console.error('Autocomplete error:', e);
            return [];
        }
    };

    const handleDestinationChange = async (text) => {
        setDestinationText(text);
        if (text.length > 2) {
            const predictions = await getPlacePredictions(text);
            setSuggestions(predictions);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const geocodeLocation = async (query) => {
        try {
            const result = await Location.geocodeAsync(query);
            if (result.length > 0) {
                return { latitude: result[0].latitude, longitude: result[0].longitude };
            }
        } catch (e) {
            console.error('Geocoding failed', e);
        }
        return null;
    };

    const selectDestination = async (placeId, description) => {
        setDestinationText(description);
        setSuggestions([]);
        setShowSuggestions(false);
        
        const coords = await geocodeLocation(description);
        if (coords && location) {
            setSelectedDestination({ ...coords, name: description });
            fetchRouteRecommendations(coords);
        }
    };

    const fetchRouteRecommendations = async (destination) => {
        if (!location) return;
        
        setLoading(true);
        try {
            const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${location.latitude},${location.longitude}&destination=${destination.latitude},${destination.longitude}&alternatives=true&departure_time=now&key=${GOOGLE_MAPS_KEY}`;
            const response = await axios.get(url);
            
            if (response.data.routes && response.data.routes.length > 0) {
                const routes = response.data.routes.map((route, index) => {
                    const leg = route.legs[0];
                    const duration = leg.duration.value / 60;
                    const trafficDuration = leg.duration_in_traffic ? leg.duration_in_traffic.value / 60 : duration;
                    const ratio = trafficDuration / duration;
                    
                    let trafficLevel = "Light Traffic";
                    let trafficColor = "#4CAF50";
                    if (ratio > 1.5) {
                        trafficLevel = "Heavy Traffic";
                        trafficColor = "#FF4444";
                    } else if (ratio > 1.2) {
                        trafficLevel = "Moderate Traffic";
                        trafficColor = "#FFB800";
                    }
                    
                    return {
                        id: index,
                        name: route.summary || `Route ${index + 1}`,
                        distance: leg.distance.text,
                        distanceValue: leg.distance.value / 1000,
                        duration: leg.duration.text,
                        durationValue: duration,
                        trafficDuration: leg.duration_in_traffic ? leg.duration_in_traffic.text : leg.duration.text,
                        trafficValue: trafficDuration,
                        trafficLevel,
                        trafficColor,
                        isFastest: index === 0,
                        via: route.summary || "Direct route",
                        warnings: leg.warnings || [],
                    };
                });
                
                // Sort by traffic duration
                routes.sort((a, b) => a.trafficValue - b.trafficValue);
                setRecommendations(routes);
            }
        } catch (error) {
            console.error('Error fetching routes:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveRoute = async (route) => {
        try {
            const routeToSave = {
                name: selectedDestination?.name || 'Saved Route',
                destination: {
                    name: selectedDestination?.name || destinationText,
                    coordinates: selectedDestination,
                },
                origin: {
                    name: 'Current Location',
                    coordinates: {
                        latitude: location.latitude,
                        longitude: location.longitude,
                    }
                },
                via: route.via,
                distance: route.distance,
                duration: route.duration,
                trafficDuration: route.trafficDuration,
                trafficLevel: route.trafficLevel,
                trafficColor: route.trafficColor,
                savedAt: new Date().toISOString(),
            };

            const existing = await AsyncStorage.getItem('savedRoutes');
            const routes = existing ? JSON.parse(existing) : [];
            
            // Check if route already exists
            const isDuplicate = routes.some(r => 
                r.destination?.name === selectedDestination?.name &&
                r.via === route.via
            );
            
            if (isDuplicate) {
                Alert.alert('Already Saved', 'This route is already in your saved routes.');
                return;
            }
            
            routes.unshift(routeToSave);
            await AsyncStorage.setItem('savedRoutes', JSON.stringify(routes));
            setSavedRoutes(routes);
            Alert.alert('Success', 'Route saved successfully!');
        } catch (error) {
            console.error('Error saving route:', error);
            Alert.alert('Error', 'Failed to save route');
        }
    };

    const renderRouteCard = ({ item, index }) => (
        <View style={[styles.routeCard, index === 0 && styles.recommendedCard]}>
            {index === 0 && (
                <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>⭐ RECOMMENDED</Text>
                </View>
            )}
            
            <View style={styles.routeHeader}>
                <Text style={styles.routeName}>{item.name}</Text>
                <View style={[styles.trafficBadge, { backgroundColor: item.trafficColor }]}>
                    <Text style={styles.trafficBadgeText}>{item.trafficLevel}</Text>
                </View>
            </View>
            
            <Text style={styles.routeVia}>Via: {item.via}</Text>
            
            <View style={styles.routeStats}>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>Distance</Text>
                    <Text style={styles.statValue}>{item.distance}</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>Normal Time</Text>
                    <Text style={styles.statValue}>{item.duration}</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>Current Traffic</Text>
                    <Text style={[styles.statValue, { color: item.trafficColor }]}>
                        {item.trafficDuration}
                    </Text>
                </View>
            </View>
            
            {item.warnings.length > 0 && (
                <View style={styles.warningsContainer}>
                    <Text style={styles.warningText}>⚠️ {item.warnings[0]}</Text>
                </View>
            )}
            
            <View style={styles.reasonContainer}>
                <Text style={styles.reasonTitle}>Why this route?</Text>
                {index === 0 && (
                    <Text style={styles.reasonText}>
                        • Fastest route considering current traffic
                        {'\n'}• Best balance of distance and time
                    </Text>
                )}
                {item.trafficLevel === "Light Traffic" && (
                    <Text style={styles.reasonText}>• Minimal traffic delays expected</Text>
                )}
                {item.trafficLevel === "Moderate Traffic" && (
                    <Text style={styles.reasonText}>• Moderate delays, plan accordingly</Text>
                )}
                {item.trafficLevel === "Heavy Traffic" && (
                    <Text style={styles.reasonText}>• Heavy traffic, consider alternative times</Text>
                )}
            </View>
            
            <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => saveRoute(item)}
            >
                <Text style={styles.saveButtonText}>💾 Save Route</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading && <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />}
            
            {!loading && recommendations.length > 0 && (
                <View style={styles.resultsContainer}>
                    <View style={styles.header}>
                       <Text style={styles.title}>Alternate Routes</Text>
                        <Text style={styles.resultsTitle}>
                            📍 To {selectedDestination?.name}
                        </Text>
                    </View>
                    <FlatList
                        data={recommendations}
                        renderItem={renderRouteCard}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            )}
            
            {!loading && recommendations.length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🗺️</Text>
                    <Text style={styles.emptyText}>No destination set. Go to Maps tab and use the direction button to set a destination.</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#4CAF50',
        padding: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    loader: {
        marginTop: 50,
    },
    resultsContainer: {
        flex: 1,
        padding: 16,
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        opacity: 0.95,
    },
    listContent: {
        paddingBottom: 20,
        paddingTop: 10,
    },
    routeCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    recommendedCard: {
        borderColor: '#4CAF50',
        borderWidth: 3,
    },
    recommendedBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    recommendedText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    routeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    routeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    trafficBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
    },
    trafficBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    routeVia: {
        fontSize: 13,
        color: '#666',
        marginBottom: 15,
    },
    routeStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
    },
    stat: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 11,
        color: '#999',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    warningsContainer: {
        backgroundColor: '#FFF3CD',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    warningText: {
        fontSize: 12,
        color: '#856404',
    },
    reasonContainer: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
    },
    reasonTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    reasonText: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

