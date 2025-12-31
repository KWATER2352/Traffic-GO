import * as React from 'react';
import { View, StyleSheet, ImageBackground, ActivityIndicator, Animated, Modal, TouchableOpacity, Image } from 'react-native';
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
import IncidentReport from './assets/components/incidentReport';
import RouteRecommendation from './assets/components/rec';
import SavedRoutes from './assets/components/savedRoutes';

// Route components
const HomeRoute = ({ showTraffic, setShowTraffic, trafficFadeAnim, showIncidentReport, setShowIncidentReport, navigateToRoutes }) => {
  if (showIncidentReport) {
    return <IncidentReport />;
  }
  
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
        <Button mode="contained" style={styles.updateButton} onPress={() => navigateToRoutes()}><Text style={styles.buttonText}>Recommended Routes</Text></Button>
        <Button mode="contained" style={styles.updateButton} onPress={() => {}}><Text style={styles.buttonText}>Current Traffic Level</Text></Button>
        <Button mode="contained" style={styles.updateButton} onPress={() => setShowIncidentReport(true)}><Text style={styles.buttonText}>Report Incident</Text></Button>
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
  <View style={styles.container}>
    <SavedRoutes />
  </View>
);

const RoutesRoute = () => (
  <RouteRecommendation />
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
  const [showIncidentReport, setShowIncidentReport] = React.useState(false);
  const [trafficFadeAnim] = React.useState(new Animated.Value(0));
  const [showMenuModal, setShowMenuModal] = React.useState(false);

  React.useEffect(() => {
    Animated.timing(trafficFadeAnim, {
      toValue: showTraffic ? 1 : 0,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [showTraffic]);

  React.useEffect(() => {
    if (index !== 0) {
      setShowIncidentReport(false);
    }
  }, [index]);

  const [routes] = React.useState([
    { key: 'home', title: 'Home', icon: 'home' },
    { key: 'maps', title: 'Maps', icon: 'map' },
  { key: 'routes', title: 'Routes', icon: 'map' },
    { key: 'settings', title: 'Saved', icon: 'bookmark' },
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
        return <HomeRoute 
          showTraffic={showTraffic} 
          setShowTraffic={setShowTraffic} 
          trafficFadeAnim={trafficFadeAnim} 
          showIncidentReport={showIncidentReport} 
          setShowIncidentReport={setShowIncidentReport}
          navigateToRoutes={() => setIndex(2)}
        />;
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
          <Appbar.Action icon="menu" onPress={() => setShowMenuModal(true)} />
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={styles.brandText}>Traffic </Text>
            <Text style={[styles.brandText, { color: '#E6EE77', fontWeight: '800' }]}>GO</Text>
          </View>
        </Appbar.Header>

        {/* Hamburger Menu Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showMenuModal}
          onRequestClose={() => setShowMenuModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowMenuModal(false)}
          >
            <View style={styles.menuModal}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowMenuModal(false)}
              >
                <MaterialCommunityIcons name="close" size={28} color="#333" />
              </TouchableOpacity>

              <View style={styles.menuHeader}>
                <MaterialCommunityIcons name="account-circle" size={60} color="#2196F3" />
                <Text style={styles.menuHeaderText}>Traffic GO</Text>
                <Text style={styles.menuSubtext}>Navigate Smarter</Text>
              </View>

              <View style={styles.menuItems}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenuModal(false);
                    // Navigate to account view or show account modal
                  }}
                >
                  <MaterialCommunityIcons name="account" size={24} color="#333" />
                  <Text style={styles.menuItemText}>Account</Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenuModal(false);
                    // Navigate to settings
                  }}
                >
                  <MaterialCommunityIcons name="cog" size={24} color="#333" />
                  <Text style={styles.menuItemText}>Settings</Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenuModal(false);
                    setIndex(3); // Navigate to Saved Routes
                  }}
                >
                  <MaterialCommunityIcons name="bookmark" size={24} color="#333" />
                  <Text style={styles.menuItemText}>Saved Routes</Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenuModal(false);
                    // Show about/help
                  }}
                >
                  <MaterialCommunityIcons name="information" size={24} color="#333" />
                  <Text style={styles.menuItemText}>About</Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                </TouchableOpacity>
              </View>

              <View style={styles.menuFooter}>
                <Text style={styles.versionText}>Version 1.0.0</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Screen body from BottomNavigation */}
        <BottomNavigation
          navigationState={{ index, routes }}
          onIndexChange={setIndex}
          renderScene={renderScene}
          barStyle={styles.bottomNav}
          activeColor="#1f2312d2"
          inactiveColor="rgba(255, 255, 255, 0.6)"
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
    marginTop: 30,
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
  brandText: {
    fontSize: 24,
    fontFamily: 'StackSansNotch-Bold',
    fontWeight: 'bold',
    color: '#1f2312d2',
  },
  menuTitle: {
    fontSize: 20,
    fontFamily: 'StackSansNotch-Bold',
    fontStyle: 'normal',
    color: '#1f2312d2',
  },
  menubar: {
    backgroundColor: '#5aab5dff',
  },
  bottomNav: {
    backgroundColor: '#5aab5de6',
  },
  updateButton: {
    width: '90%',
    borderRadius: 8,
    height: 100,
    alignSelf: 'center',
    marginVertical: 8,
    textAlign: 'center',
    backgroundColor: '#5aab5dff',
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
    marginTop: 30,
    paddingVertical: 8,
  },
  searchbar: {
    marginTop: 30,
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#9b6666ff',
  },
  searchbarInput: {
    fontSize: 16,
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuModal: {
    backgroundColor: '#fff',
    width: '80%',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 5,
  },
  menuHeader: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  menuHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    fontFamily: 'StackSansNotch-Bold',
  },
  menuSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  menuItems: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    fontFamily: 'StackSansHeadline-Regular',
  },
  menuFooter: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
});
