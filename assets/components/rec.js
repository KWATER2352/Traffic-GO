import react from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Dimensions, Animated, Image } from 'react-native';
import { Searchbar } from "react-native-paper";

export default function RouteRecommendation() {
    return (
        <View style={styles.container}>
            <View style={styles}></View>
            <Searchbar />
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1, 
    },
    searchContainer: {
        padding: 10,
    },
});
