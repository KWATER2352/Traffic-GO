import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Dimensions, Animated, Image } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import Constants from 'expo-constants';


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
        { name: "North Area", latitude: lat + 0.02, longitude: lon },
        { name: "South Area", latitude: lat - 0.02, longitude: lon },
        { name: "East Area", latitude: lat, longitude: lon + 0.02 },
        { name: "West Area", latitude: lat, longitude: lon - 0.02 },
    ];

    useEffect(() => {
        if (!location) return;

        const fetchTraffic = async () => {
            setLoading(true);
            const apiKey = Constants.manifest.extra.googleMapsApiKey;

            const regions = getRegions(location.latitude, location.longitude);
            const results = [];

            for (const region of regions) {
                try {
                    const originLat = location.latitude;
                    const originLon = location.longitude;
                    const destLat = region.latitude;
                    const destLon = region.longitude;
                    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLon}&destinations=${destLat},${destLon}&key=${apiKey}`;
                    const response = await axios.get(url);
                    const data = response.data.rows[0].elements[0];

                    let status = "No Data";

                    if (data.status === "OK") {
                        const duration = data.duration.value;
                        const trafficDuration = data.duration_in_traffic?.value || duration;

                        const ratio = trafficDuration / duration;

                        if (ratio > 1.5) status = "Heavy Traffic";
                        else if (ratio > 1.2) status = "Moderate Traffic";
                        else status = "Light Traffic";
                    }

                    results.push({ region: region.name, status });
                } catch (e) {
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


    if (loading) return <ActivityIndicator size='large' />;
    if (error) return <Text>{error}</Text>;

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
    const source = statusImages[status];
    console.log(statusImages);
    return source ? <Image source={source} style={{ width: 50, height: 50 }} /> : null;
};

    const renderRegionCard = ({ item }) => (
        <View style={[styles.card, { width: width - 40 }]}>
            <Text style={styles.regionName}>{item.region}</Text>
            <Image
                source={getStatusImage(item.status)}
                style={styles.statusImage}
                resizeMode="contain"
            />
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status || 'Loading...'}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headlineContainer}>
                <Text style={styles.headline}>Real Time Traffic Update</Text>
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
        backgroundColor: '#f5f5f5',
        paddingTop: 20,
    },
    headlineContainer: {
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    headline: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    carouselContainer: {
        paddingHorizontal: 10,
    },
    card: {
        marginHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
    },
    regionName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    statusImage: {
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    statusBadge: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        minWidth: 180,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
    },
    text: {
        fontSize: 18,
        marginVertical: 5,
    },
    textStatus: {
        fontSize: 20,
        marginVertical: 8,
    },
});
