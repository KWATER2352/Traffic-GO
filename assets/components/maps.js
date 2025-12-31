import React, { useState, useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, Keyboard, FlatList, TouchableOpacity, Animated, Dimensions, Alert } from 'react-native';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_KEY } from '../local.js';
import { Ionicons, Entypo } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Maps() {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [region, setRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [originText, setOriginText] = useState('');
  const [destinationText, setDestinationText] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [activeField, setActiveField] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const keyboardHeightRef = useRef(0);
  const mapRef = useRef(null);

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

  const handleOriginTextChange = async (text) => {
    setOriginText(text);
    if (text.length > 2) {
      const suggestions = await getPlacePredictions(text);
      setOriginSuggestions(suggestions);
    } else {
      setOriginSuggestions([]);
    }
  };

  const handleDestTextChange = async (text) => {
    setDestinationText(text);
    if (text.length > 2) {
      const suggestions = await getPlacePredictions(text);
      setDestSuggestions(suggestions);
    } else {
      setDestSuggestions([]);
    }
  };

  const selectOriginSuggestion = async (placeId, description) => {
    setOriginText(description);
    setOriginSuggestions([]);
    // Geocode the place
    const coords = await geocodeLocation(description);
    if (coords) {
      setOrigin(coords);
      setRegion({ ...coords, longitudeDelta: 0.01, latitudeDelta: 0.01 });
    }
    Keyboard.dismiss();
  };

  const selectDestSuggestion = async (placeId, description) => {
    setDestinationText(description);
    setDestSuggestions([]);
    // Geocode the place
    const coords = await geocodeLocation(description);
    if (coords) {
      setDestination(coords);
      // Auto-save to recommendations
      try {
        const recentDest = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          name: description,
          timestamp: new Date().toISOString(),
        };
        await AsyncStorage.setItem('recentDestination', JSON.stringify(recentDest));
      } catch (error) {
        console.error('Error auto-saving destination:', error);
      }
    }
    Keyboard.dismiss();
  };

  const geocodeLocation = async (query) => {
    try {
      const result = await Location.geocodeAsync(query);
      if (result.length > 0) {
        return { latitude: result[0].latitude, longitude: result[0].longitude };
      }
    } catch (e) {
      setErrorMsg('Geocoding failed');
    }
    return null;
  };

  const handleOriginSearch = async () => {
    const coords = await geocodeLocation(originText);
    if (coords) {
      setOrigin(coords);
      setRegion({ ...coords, longitudeDelta: 0.01, latitudeDelta: 0.01 });
    }
  };

  const handleDestinationSearch = async () => {
    const coords = await geocodeLocation(destinationText);
    if (coords) {
      setDestination(coords);
    }
  };

  const useCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let pos = await Location.getCurrentPositionAsync({});
        const currentCoords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setOrigin(currentCoords);
        setOriginText('Current Location');
        setRegion({
          ...currentCoords,
          longitudeDelta: 0.01,
          latitudeDelta: 0.01,
        });
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            ...currentCoords,
            longitudeDelta: 0.01,
            latitudeDelta: 0.01,
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const clearRoute = () => {
    setDestination(null);
    setDestinationText('');
    setRouteInfo(null);
  };

  const swapLocations = () => {
    const tempOrigin = origin;
    const tempOriginText = originText;
    setOrigin(destination);
    setOriginText(destinationText);
    setDestination(tempOrigin);
    setDestinationText(tempOriginText);
  };

  const saveToRecommendations = async () => {
    if (!destination) {
      Alert.alert('No Destination', 'Please set a destination first.');
      return;
    }

    try {
      const recentDest = {
        latitude: destination.latitude,
        longitude: destination.longitude,
        name: destinationText,
        timestamp: new Date().toISOString(),
      };
      await AsyncStorage.setItem('recentDestination', JSON.stringify(recentDest));
      Alert.alert('Saved', 'Destination saved! Switch to Routes tab to see recommendations.');
    } catch (error) {
      console.error('Error saving destination:', error);
    }
  };

  const saveRoute = async () => {
    if (!origin || !destination || !routeInfo) {
      Alert.alert('Cannot Save', 'Please set both origin and destination to save a route.');
      return;
    }

    try {
      const newRoute = {
        name: originText,
        destination: {
          name: destinationText,
          coordinates: destination,
        },
        origin: {
          name: originText,
          coordinates: origin,
        },
        via: 'Best Route',
        distance: `${Math.round(routeInfo.distance)} km`,
        duration: `${Math.round(routeInfo.duration)} min`,
        trafficDuration: `${Math.round(routeInfo.duration * 1.2)} min`,
        trafficLevel: 'Moderate',
        trafficColor: '#FFA500',
        savedAt: new Date().toISOString(),
      };

      const stored = await AsyncStorage.getItem('savedRoutes');
      const routes = stored ? JSON.parse(stored) : [];
      routes.unshift(newRoute);
      await AsyncStorage.setItem('savedRoutes', JSON.stringify(routes));
      
      Alert.alert('Success', 'Route saved successfully!');
    } catch (error) {
      console.error('Error saving route:', error);
      Alert.alert('Error', 'Failed to save route.');
    }
  };

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        keyboardHeightRef.current = e.endCoordinates.height;
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        keyboardHeightRef.current = 0;
        setKeyboardHeight(0);
      }
    );
    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location denied');
        return;
      }
      let pos = await Location.getCurrentPositionAsync({});
      setOrigin({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      })
      setRegion({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        longitudeDelta: 0.01,
        latitudeDelta: 0.01,
      })
    })();
  }, []);
  return (
    <View style={styles.container}>
      {region ? (
        <MapView 
          ref={mapRef}
          style={styles.map} 
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsTraffic={true}
        >
          {destination && <Marker coordinate={destination} title="Destination" pinColor="red" />}

          {origin && destination && (
            <MapViewDirections
              origin={origin}
              destination={destination}
              apikey={GOOGLE_MAPS_KEY}
              strokeWidth={4}
              strokeColor="#ffffffd2"
              onReady={(result) => {
                setRouteInfo({
                  distance: result.distance,
                  duration: result.duration
                });
                if (mapRef.current) {
                  mapRef.current.fitToCoordinates(result.coordinates, {
                    edgePadding: {
                      top: 100,
                      right: 50,
                      bottom: 300,
                      left: 50,
                    },
                    animated: true,
                  });
                }
              }}
            />
          )}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      )}
      
      {/* Route Info Display */}
      {routeInfo && (
        <View style={styles.routeInfoContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Ionicons name="car" size={30} style={styles.actionButtonText} color="#1f2312d2" />
            <Text style={styles.routeInfoText}>{Math.round(routeInfo.distance)} km</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Ionicons name="timer" size={30} style={styles.actionButtonText} color="#1f2312d2" />
            <Text style={styles.routeInfoText}>{Math.round(routeInfo.duration)} min</Text>
          </View>
        </View>
      )}

      {/* Quick Action Buttons */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={useCurrentLocation}
        >
           <Entypo name="location-pin" size={30} style={styles.actionButtonText} color="#1f2312d2" />
        </TouchableOpacity>
        {destination && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={clearRoute}
          >
        <Entypo name="trash" size={30} style={styles.actionButtonText} color="#1f2312d2" />
          </TouchableOpacity>
        )}
        {origin && destination && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={swapLocations}
          >
            <Entypo name="swap" size={30} style={styles.actionButtonText} color="#1f2312d2" />
          </TouchableOpacity>
        )}
      </View>
      <View
        style={[
          styles.search_container,
          keyboardHeight > 0 && {
            bottom: keyboardHeight,
            maxHeight: Dimensions.get('window').height * 0.5,
          },
        ]}
      >
        {errorMsg ? <Text style={{ color: 'red', marginBottom: 8 }}>{errorMsg}</Text> : null}
        
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter starting location..."
            placeholderTextColor="#999"
            value={originText}
            onChangeText={handleOriginTextChange}
            onFocus={() => setActiveField('origin')}
            onBlur={() => setTimeout(() => setActiveField(null), 100)}
            onSubmitEditing={handleOriginSearch}
            returnKeyType="search"
          />
          {activeField === 'origin' && originSuggestions.length > 0 && (
            <View style={{ maxHeight: 200 }}>
              <FlatList
                data={originSuggestions.slice(0, 5)}
                keyExtractor={(item) => item.place_id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => selectOriginSuggestion(item.place_id, item.description)}
                  style={styles.suggestionItem}
                >
                  <Text style={styles.suggestionText}>{item.description}</Text>
                </TouchableOpacity>
              )}
            />
            </View>
          )}
        </View>

        <View style={{ marginTop: 10 }}>
          <TextInput
            style={styles.input}
            placeholder="Enter destination..."
            placeholderTextColor="#999"
            value={destinationText}
            onChangeText={handleDestTextChange}
            onFocus={() => setActiveField('destination')}
            onBlur={() => setTimeout(() => setActiveField(null), 100)}
            onSubmitEditing={handleDestinationSearch}
            returnKeyType="search"
          />
          {activeField === 'destination' && destSuggestions.length > 0 && (
            <View style={{ maxHeight: 200 }}>
              <FlatList
                data={destSuggestions.slice(0, 5)}
                keyExtractor={(item) => item.place_id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => selectDestSuggestion(item.place_id, item.description)}
                  style={styles.suggestionItem}
                >
                  <Text style={styles.suggestionText}>{item.description}</Text>
                </TouchableOpacity>
              )}
            />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  search_container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    zIndex: 100,
    maxHeight: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 15,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    borderRadius: 4,
    marginTop: 4,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  routeInfoContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  routeInfoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  quickActions: {
    position: 'absolute',
    top: 80,
    right: 20,
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#5aab5de6',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButtonText: {
    fontSize: 24,
  },
});
