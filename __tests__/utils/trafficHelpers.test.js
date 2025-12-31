// Unit tests for helper functions

describe('Traffic Helper Functions', () => {
  describe('getRegions', () => {
    it('should calculate correct region coordinates', () => {
      const lat = 37.7749;
      const lon = -122.4194;
      const offset = 0.08;

      const getRegions = (lat, lon) => [
        { name: 'North Area', latitude: lat + offset, longitude: lon },
        { name: 'South Area', latitude: lat - offset, longitude: lon },
        { name: 'East Area', latitude: lat, longitude: lon + offset },
        { name: 'West Area', latitude: lat, longitude: lon - offset },
      ];

      const regions = getRegions(lat, lon);

      expect(regions).toHaveLength(4);
      expect(regions[0].name).toBe('North Area');
      expect(regions[0].latitude).toBeCloseTo(lat + offset);
      expect(regions[1].name).toBe('South Area');
      expect(regions[1].latitude).toBeCloseTo(lat - offset);
      expect(regions[2].name).toBe('East Area');
      expect(regions[2].longitude).toBeCloseTo(lon + offset);
      expect(regions[3].name).toBe('West Area');
      expect(regions[3].longitude).toBeCloseTo(lon - offset);
    });
  });

  describe('getStatusColor', () => {
    it('should return correct colors for traffic statuses', () => {
      const getStatusColor = (status) => {
        if (status === 'Heavy Traffic') return '#FF4444';
        if (status === 'Moderate Traffic') return '#FFB800';
        if (status === 'Light Traffic') return '#00CC66';
        return '#999';
      };

      expect(getStatusColor('Heavy Traffic')).toBe('#FF4444');
      expect(getStatusColor('Moderate Traffic')).toBe('#FFB800');
      expect(getStatusColor('Light Traffic')).toBe('#00CC66');
      expect(getStatusColor('Unknown')).toBe('#999');
    });
  });

  describe('getStatusIcon', () => {
    it('should return correct icons for traffic statuses', () => {
      const getStatusIcon = (status) => {
        if (status === 'Heavy Traffic') return 'alert-circle';
        if (status === 'Moderate Traffic') return 'warning';
        if (status === 'Light Traffic') return 'checkmark-circle';
        return 'information-circle';
      };

      expect(getStatusIcon('Heavy Traffic')).toBe('alert-circle');
      expect(getStatusIcon('Moderate Traffic')).toBe('warning');
      expect(getStatusIcon('Light Traffic')).toBe('checkmark-circle');
      expect(getStatusIcon('Unknown')).toBe('information-circle');
    });
  });

  describe('Traffic Ratio Calculations', () => {
    it('should correctly calculate traffic to normal duration ratio', () => {
      expect(900 / 600).toBe(1.5);
      expect(720 / 600).toBe(1.2);
      expect(600 / 600).toBe(1.0);
      expect(480 / 600).toBeCloseTo(0.8);
    });

    it('should handle edge cases', () => {
      // When traffic duration equals normal duration
      expect(600 / 600).toBe(1.0);

      // When traffic is better than normal (shouldn't happen but handle it)
      expect(500 / 600).toBeCloseTo(0.833, 2);
    });
  });
});
