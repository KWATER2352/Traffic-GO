import * as React from 'react';
import { View, StyleSheet, ImageBackground, ActivityIndicator, Animated } from 'react-native';
import { ScrollView } from 'react-native';
import { Provider as PaperProvider, Appbar, Text, BottomNavigation, Button, Dialog, Portal} from 'react-native-paper';
import { useFonts } from 'expo-font';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
// My Components
import MySearch from './assets/components/searchy';
import Maps from './assets/components/maps';
import TrafficUpdate from './assets/components/trafficUpdate';

// Route components
const HomeRoute = ({ showTraffic, setShowTraffic, trafficFadeAnim }) => {
  if (showTraffic) {
    return (
      <Animated.View style={[styles.routeContainer, { opacity: trafficFadeAnim }]}>
        <TrafficUpdate />
      </Animated.View>
    );
  }

  return (
    <View style={styles.routeContainer}>
      <MySearch style={styles.searchbar} inputStyle={styles.searchbarInput} />
      <View style={styles.buttonsContainer}>
        <Button mode="contained" style={styles.updateButton} onPress={() => setShowTraffic(true)}>
          <Text style={styles.buttonText}>Real Time Traffic Updates</Text>
        </Button>
        <Button mode="contained" style={styles.updateButton}><Text style={styles.buttonText}>Recommended Routes</Text></Button>
        <Button mode="contained" style={styles.updateButton}><Text style={styles.buttonText}>Current Traffic Level</Text></Button>
        <Button mode="contained" style={styles.updateButton}><Text style={styles.buttonText}>Incident Reports</Text></Button>
      </View>
    </View>
  );
};

const MapsRoute = () => (
  <View style={styles.container}>
    {/* <ImageBackground
      source={require('./assets/icon.png')}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      <Text style={[styles.text, styles.textOnImage]}>Welcome to Traffic GO</Text>
    </ImageBackground> */}
    <Maps />
  </View>
);

const SettingsRoute = () => (
  <View style={styles.routeContainer}>
    <Text style={styles.text}>Settings View</Text>
  </View>
);

const RoutesRoute = () => (
  <View style={styles.routeContainer}>
    <Text style={styles.text}>Routes View</Text>
  </View>
);

export default function App() {
  const [fontsLoaded] = useFonts({
    'StackSansNotch-Bold': require('./assets/Stack_Sans_Notch/static/StackSansNotch-Bold.ttf'),
    'StackSansHeadline-Bold': require('./assets/Stack_Sans_Headline/static/StackSansHeadline-Bold.ttf'),
    'StackSansHeadline-Regular': require('./assets/Stack_Sans_Headline/static/StackSansHeadline-Regular.ttf'),
  });

  // Bottom navigation state
  const [index, setIndex] = React.useState(0);
  const [showTraffic, setShowTraffic] = React.useState(false);
  const [trafficFadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(trafficFadeAnim, {
      toValue: showTraffic ? 1 : 0,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [showTraffic]);

  const [routes] = React.useState([
    { key: 'home', title: 'Home', icon: 'home' },
    { key: 'maps', title: 'Maps', icon: 'map' },
  { key: 'routes', title: 'Routes', icon: 'map' },
    { key: 'settings', title: 'Settings', icon: 'cog' },
  ]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'home':
        return <HomeRoute showTraffic={showTraffic} setShowTraffic={setShowTraffic} trafficFadeAnim={trafficFadeAnim} />;
      case 'maps':
        return <MapsRoute />;
      case 'routes':
        return <RoutesRoute />;
      case 'settings':
        return <SettingsRoute />;
      default:
        return null;
    }
  };

  return (
    <PaperProvider>
      <View style={{ flex: 1 }}>

        <Appbar.Header style={styles.menubar}>
          <Appbar.Action icon="menu" onPress={() => console.log('Menu pressed')} />
          <Appbar.Content title="Traffic GO" titleStyle={styles.menuTitle} />
        </Appbar.Header>

        {/* Screen body from BottomNavigation */}
        <BottomNavigation
          navigationState={{ index, routes }}
          onIndexChange={setIndex}
          renderScene={renderScene}
          barStyle={styles.bottomNav}
          activeColor="#b5c729ff"
          inactiveColor="rgba(255,255,255,0.6)"
          renderIcon={({ route, color }) => (
            <MaterialCommunityIcons name={route.icon} size={24} color={color} />
          )}
        />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  routeContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#f6f6f6',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImageStyle: {
    resizeMode: 'cover',
    opacity: 0.9,
  },
  text: {
    fontSize: 18,
  },
  textOnImage: {
    color: '#ffffff',
    fontFamily: 'StackSansNotch-Bold',
    fontSize: 20,
  },
  menuTitle: {
    fontSize: 20,
    fontFamily: 'StackSansNotch-Bold',
    fontStyle: 'normal',
    color: 'rgba(213, 231, 71, 1)',
  },
  menubar: {
    backgroundColor: '#1279106f',
  },
  bottomNav: {
    backgroundColor: '#1279106f',
  },
  updateButton: {
    width: '90%',
    borderRadius: 8,
    height: 100,
    alignSelf: 'center',
    marginVertical: 8,
    textAlign: 'center',
    backgroundColor: '#b5c729ff',
  },
  updateButtonContent: {
    height: 48,
    fontWeight: 'bold',

  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontFamily: 'StackSansHeadline-Regular',
    fontSize: 16,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  searchbar: {
    marginTop: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#9b6666ff',
  },
  searchbarInput: {
    fontSize: 16,
    color: '#ffffff',
  },
});
