import React, { use, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Dimensions, Animated, Image } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

// images 
import light from './light.jpeg'
import moderate from './moderate.jpeg'
import heavy from './heavy.jpeg'

const { width } = Dimensions.get('window');

export default function TrafficUpdate() {
    const trafficRegions = [{
        name: 'Downtown',
        latOffset: 0.02,
        lonOffset: 0.01,
    }, {
        name: 'Uptown',
        latOffset: 0.02,
        lonOffset: 0.01,
    }, {
        name: 'Suburbs',
        latOffset: 0.02,
        lonOffset: 0.01,
    }, {
        name: 'Highway 1',
        latOffset: 0.02,
        lonOffset: 0.01,
    }, {
        name: 'Highway 2',
        latOffset: 0.02,
        lonOffset: -0.04,
    }];

    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [trafficData, setTrafficData] = React.useState([]);
    const [location, setLocation] = React.useState(null);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError('Permission to access location denied');
                setLoading(false);
                return;
            }
            const loc = await Location.getCurrentPositionAsync({});
            setLocation(loc.coords);
        })();
    }, []);
    useEffect(() => {
        if (!location) return;
        const fetchTrafficData = async () => {
            setLoading(true);
            setError(null);
            const apikey = 'AIzaSyB9PCPpvm73q68YlckMHVZVanR-oMf8WpA';
            const results = [];

            for (const region of trafficRegions) {
                const lat = location.latitude + region.latOffset;
                const lon = location.longitude + region.lonOffset;

                try {
                    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat},${lon}&destinations=${lat},${lon}&key=${apikey}`;
                    const {data} = await axios.get(url);
                    const pos = data.rows[0].elements[0];

                    let status = 'No Data';
                    if (pos.status === 'OK') {
                        const delay = pos.duration_in_traffic?.value / pos.duration.value || 1;
                        if (delay > 1.5) status = 'Heavy Traffic';
                        else if (delay > 1.2) status = 'Moderate Traffic';
                        else status = 'Light Traffic';
                    }
                    results.push({ region: region.name, status });
                } catch (error) {
                    console.error(error);
                    results.push({ region: region.name, status: 'Error fetching data' });
                }
            }
            setTrafficData(results);
            setLoading(false);
        };
        fetchTrafficData();

        const interval = setInterval(fetchTrafficData, 5 * 60 * 1000);
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

    const getStatusImage = (status) => {
        if (status === 'Heavy Traffic') return heavy;
        if (status === 'Moderate Traffic') return moderate;
        if (status === 'Light Traffic') return light;
        return null;
    }

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
