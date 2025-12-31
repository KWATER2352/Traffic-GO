import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entypo } from '@expo/vector-icons';

export default function SavedRoutes() {
    const [savedRoutes, setSavedRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        loadSavedRoutes();
        
        const interval = setInterval(() => {
            loadSavedRoutes();
        }, 2000);
        
        return () => clearInterval(interval);
    }, [refreshKey]);

    const loadSavedRoutes = async () => {
        try {
            const stored = await AsyncStorage.getItem('savedRoutes');
            if (stored) {
                const routes = JSON.parse(stored);
                setSavedRoutes(routes);
            }
        } catch (error) {
            console.error('Error loading saved routes:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteRoute = async (index) => {
        Alert.alert(
            'Delete Route',
            'Are you sure you want to delete this saved route?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const updated = savedRoutes.filter((_, i) => i !== index);
                            await AsyncStorage.setItem('savedRoutes', JSON.stringify(updated));
                            setSavedRoutes(updated);
                        } catch (error) {
                            console.error('Error deleting route:', error);
                        }
                    },
                },
            ]
        );
    };

    const renderRouteCard = ({ item, index }) => (
        <View style={styles.routeCard}>
            <View style={styles.routeHeader}>
                <View style={styles.routeHeaderLeft}>
                    <Text style={styles.routeName}>{item.name}</Text>
                    <Text style={styles.destinationText}>To: {item.destination.name}</Text>
                </View>
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
                    <Text style={styles.statLabel}>Duration</Text>
                    <Text style={styles.statValue}>{item.duration}</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>With Traffic</Text>
                    <Text style={[styles.statValue, { color: item.trafficColor }]}>
                        {item.trafficDuration}
                    </Text>
                </View>
            </View>

            <View style={styles.metaInfo}>
                <Text style={styles.savedDate}>
                    Saved: {new Date(item.savedAt).toLocaleDateString()}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteRoute(index)}
            >
        <Entypo name="trash" size={30} style={styles.actionButtonText} color="#1f2312d2" />

            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading saved routes...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Saved Routes</Text>
                <Text style={styles.subtitle}>{savedRoutes.length} route(s) saved</Text>
            </View>

            {savedRoutes.length === 0 ? (
                <View style={styles.emptyState}>
                    <Entypo name="location-pin" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>No saved routes yet</Text>
                    <Text style={styles.emptySubtext}>
                        Save routes from the Route Recommendations tab
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={savedRoutes}
                    renderItem={renderRouteCard}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
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
    routeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    routeHeaderLeft: {
        flex: 1,
    },
    routeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    destinationText: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
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
    metaInfo: {
        marginBottom: 10,
    },
    savedDate: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    },
    deleteButton: {
        backgroundColor: '#FF4444',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginTop: 5,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});