import React, { useState, useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, Keyboard, FlatList, TouchableOpacity, Animated, Dimensions } from 'react-native';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
const GOOGLE_MAPS_KEY = "AIzaSyB9PCPpvm73q68YlckMHVZVanR-oMf8WpA";


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
  const keyboardHeightRef = useRef(0);

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
        <MapView style={styles.map} region={region}>
          {origin && <Marker coordinate={origin} title="You are Here" />}
          {destination && <Marker coordinate={destination} title="Destination" />}

          {origin && destination && (
            <MapViewDirections
              origin={origin}
              destination={destination}
              apikey={GOOGLE_MAPS_KEY}
              strokeWidth={5}
              strokeColor="hotpink"
            />
          )}
        </MapView>
      ) : (
        <View style={styles.container} />
      )}
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
            <FlatList
              data={originSuggestions}
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
            <FlatList
              data={destSuggestions}
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
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  search_container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 12,
    zIndex: 100,
    maxHeight: '40%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
});
