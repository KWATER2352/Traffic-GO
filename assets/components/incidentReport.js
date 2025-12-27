import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import * as Location from 'expo-location';
import Dropy from "./dropdown";

const GOOGLE_MAPS_KEY = "AIzaSyB9PCPpvm73q68YlckMHVZVanR-oMf8WpA";

export default function IncidentReport() {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [locationText, setLocationText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [handleSubmit, setHandleSubmit] = useState(() => {
    // Placeholder for submit handler
    return () => {
      console.log("Report submitted");
    };
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let pos = await Location.getCurrentPositionAsync({});
        const currentLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setLocation(currentLocation);
        setRegion({
          ...currentLocation,
          longitudeDelta: 0.01,
          latitudeDelta: 0.01,
        });
      }
    })();
  }, []);

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

  const handleLocationTextChange = async (text) => {
    setLocationText(text);
    if (text.length > 2) {
      const predictions = await getPlacePredictions(text);
      setSuggestions(predictions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = async (placeId, description) => {
    setLocationText(description);
    setSuggestions([]);
    setShowSuggestions(false);
    const coords = await geocodeLocation(description);
    if (coords) {
      setLocation(coords);
      setRegion({ ...coords, longitudeDelta: 0.01, latitudeDelta: 0.01 });
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
      console.error('Geocoding failed', e);
    }
    return null;
  };

  const useCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      let pos = await Location.getCurrentPositionAsync({});
      const currentLocation = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setLocation(currentLocation);
      setRegion({
        ...currentLocation,
        longitudeDelta: 0.01,
        latitudeDelta: 0.01,
      });
      setLocationText('Current Location');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <Text style={styles.title}>Incident Reports</Text>
        
        <View style={styles.section}>
          <Text style={styles.subtitle}>Select incident type(s) to report:</Text>
          <View style={styles.dropdownWrapper}>
            <Dropy />
          </View>
        </View>
          
        <View style={styles.locationSection}>
          <Text style={styles.subtitle}>Where did the incident happen?</Text>
          
          <View style={styles.locationInputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter location or use current location..."
              placeholderTextColor="#999"
              value={locationText}
              onChangeText={handleLocationTextChange}
              onFocus={() => setShowSuggestions(locationText.length > 2 && suggestions.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            <TouchableOpacity 
              style={styles.currentLocationButton} 
              onPress={useCurrentLocation}
            >
              <Text style={styles.buttonText}>Use Current Location</Text>
            </TouchableOpacity>
          </View>

          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <ScrollView 
                style={styles.suggestionsList}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                {suggestions.map((item) => (
                  <TouchableOpacity
                    key={item.place_id}
                    onPress={() => selectSuggestion(item.place_id, item.description)}
                    style={styles.suggestionItem}
                  >
                    <Text style={styles.suggestionText}>{item.description}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Provide additional details about the incident:</Text>
          <TextInput
            style={styles.detailsInput}
            placeholder="Describe what happened, number of vehicles involved, injuries, etc..."
            placeholderTextColor="#999"
            value={additionalDetails}
            onChangeText={setAdditionalDetails}
            multiline={true}
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>
           
          <View style={styles.submitButtonContainer}>
            <TextInput
              style={styles.buttonText}
              value={locationText}
              onChangeText={handleLocationTextChange}
              onFocus={() => setShowSuggestions(locationText.length > 2 && suggestions.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Submit Report</Text>
            </TouchableOpacity>
          </View>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 35,
  },
  dropdownWrapper: {
    zIndex: 3000,
    elevation: 3000,
  },
  locationSection: {
    marginBottom: 35,
    zIndex: 2000,
    elevation: 2000,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  locationInputContainer: {
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  currentLocationButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    zIndex: 2500,
    elevation: 2500,
  },
  suggestionsList: {
    maxHeight: 200,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    marginBottom: 10,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  detailsInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    maxHeight: 200,
  },
    submitButtonContainer: {
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 40,
  },
});