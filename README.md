# Traffic-GO

A React Native mobile application that helps users navigate traffic with real-time updates, alternate route recommendations, and information about high-volume areas nearby.

## Purpose

Traffic-GO provides:
- **Real-time traffic updates** for your current location
- **Route recommendations** with traffic-aware directions
- **Incident reporting** to alert other users
- **Saved routes** for frequently traveled paths
- **Interactive maps** with traffic visualization
- **Smart navigation** using Google Maps integration

## Features

- 🗺️ Interactive maps with real-time traffic data
- 🚦 Traffic level monitoring (Low, Moderate, Heavy, Very Heavy)
- 📍 Location-based traffic updates
- 🛣️ Alternative route suggestions
- 💾 Save and manage favorite routes
- ⚠️ Report and view traffic incidents
- 📱 Cross-platform support (iOS, Android)

## Tech Stack

- **React Native** with Expo
- **React Navigation** for routing
- **Google Maps API** for maps and directions
- **React Native Maps** for map rendering
- **Axios** for API requests
- **AsyncStorage** for local data persistence
- **Jest** and React Testing Library for testing

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator (for Android development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Traffic-GO.git
cd Traffic-GO
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Google Maps API key:
   ```
   GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

### Running the App

Start the development server:
```bash
npm start
```

Run on specific platforms:
```bash
npm run android    # Run on Android
npm run ios        # Run on iOS
```

## Testing

The project includes comprehensive test coverage with unit, integration, and component tests.

### Run all tests:
```bash
npm test
```

### Run tests in watch mode:
```bash
npm run test:watch
```

### Generate coverage report:
```bash
npm run test:coverage
```

For detailed testing documentation, see [TESTING.md](TESTING.md).

## Project Structure

```
Traffic-GO/
├── assets/
│   ├── components/      # React components
│   │   ├── maps.js
│   │   ├── trafficUpdate.js
│   │   ├── incidentReport.js
│   │   ├── rec.js       # Route recommendations
│   │   ├── savedRoutes.js
│   │   └── searchy.js
│   └── images/          # Image assets
├── __tests__/           # Test files
│   ├── integration/
│   └── utils/
├── App.js               # Main app component
├── index.js             # Entry point
└── package.json         # Dependencies
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.
