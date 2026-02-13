// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen     from './screens/HomeScreen';
import SurahList      from './screens/SurahList';
import SurahScreen    from './screens/SurahScreen';
import SearchScreen   from './screens/SearchScreen';
import AudioSurahList from './screens/AudioSurahList';
import TasbeehScreen  from './screens/TasbeehScreen';
import { useFonts }   from 'expo-font';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    // قم بوضع ملف الخط الكامل هنا
    UthmaniFull: require('./assets/fonts/KFGQPC-Uthmanic-Script-HAFS-Regular.ttf.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fdf6ec' }}>
        <ActivityIndicator size="large" color="#bfa76f" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SurahList"
              component={SurahList}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SurahScreen"
              component={SurahScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SearchScreen"
              component={SearchScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AudioSurahList"
              component={AudioSurahList}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TasbeehScreen"
              component={TasbeehScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7ecd7', // or your app background
  },
});
