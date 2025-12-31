import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import TrafficUpdate from '../assets/components/trafficUpdate';
import * as Location from 'expo-location';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('TrafficUpdate Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    Location.requestForegroundPermissionsAsync.mockReturnValue(
      new Promise(() => {}) // Never resolves, keeps loading
    );

    const { getByText } = render(<TrafficUpdate />);
    expect(getByText('Fetching traffic updates...')).toBeTruthy();
  });

  it('displays error when location permission is denied', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'denied',
    });

    const { getByText } = render(<TrafficUpdate />);

    await waitFor(() => {
      expect(getByText('Permission denied')).toBeTruthy();
    });
  });

  it('fetches and displays traffic data when permission is granted', async () => {
    // Mock location permission
    Location.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });

    // Mock current position
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
    });

    // Mock API response
    axios.get.mockResolvedValue({
      data: {
        rows: [
          {
            elements: [
              {
                status: 'OK',
                duration: { value: 600 },
                duration_in_traffic: { value: 900 },
              },
            ],
          },
        ],
      },
    });

    const { getByText } = render(<TrafficUpdate />);

    // Wait for data to load
    await waitFor(
      () => {
        expect(getByText('Real-Time Traffic Update')).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it('calculates traffic status correctly for heavy traffic', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });

    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 37.7749, longitude: -122.4194 },
    });

    // Mock heavy traffic scenario (ratio > 1.3)
    axios.get.mockResolvedValue({
      data: {
        rows: [
          {
            elements: [
              {
                status: 'OK',
                duration: { value: 600 },
                duration_in_traffic: { value: 900 }, // 1.5x ratio
              },
            ],
          },
        ],
      },
    });

    const { findByText } = render(<TrafficUpdate />);

    await waitFor(
      () => {
        expect(findByText('Heavy Traffic')).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });
});
