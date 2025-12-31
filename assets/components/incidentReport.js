import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import Dropy from "./dropdown";
import { GOOGLE_MAPS_KEY } from '../local.js';


export default function IncidentReport() {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [locationText, setLocationText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!locationText || locationText.trim() === '') {
      Alert.alert('Missing Information', 'Please enter or select a location for the incident.');
      return;
    }
    
    // Simulate submission (you can add actual API call here)
    console.log('Report submitted:', {
      location: locationText,
      coordinates: location,
      details: additionalDetails,
      timestamp: new Date().toISOString()
    });
    
    setIsSubmitted(true);
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setLocationText('');
    setAdditionalDetails('');
    setLocation(null);
    setSuggestions([]);
    setShowSuggestions(false);
  };

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
      {isSubmitted ? (
        // Success Screen
        <View style={styles.successContainer}>
          <View style={styles.successContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Report Submitted!</Text>
            <Text style={styles.successMessage}>
              Thank you for reporting this incident. Your report helps keep other drivers informed and safe.
            </Text>
            <View style={styles.successDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="location" size={20} color="#666" />
                <Text style={styles.detailText}>{locationText}</Text>
              </View>
              {additionalDetails && (
                <View style={styles.detailRow}>
                  <Ionicons name="document-text" size={20} color="#666" />
                  <Text style={styles.detailText} numberOfLines={3}>{additionalDetails}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={resetForm}
            >
              <Text style={styles.buttonText}>Report Another Incident</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Original Form
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
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Submit Report</Text>
            </TouchableOpacity>
          </View>
        
      </ScrollView>
      )}
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
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  successContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  successDetails: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
});