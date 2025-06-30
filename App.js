// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import SurahList from './screens/SurahList';
import SurahScreen from './screens/SurahScreen';
import SearchScreen from './screens/SearchScreen';
import AudioSurahList from './screens/AudioSurahList';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Uthmani: require('./assets/fonts/Uthmani.otf.otf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fdf6ec' }}>
        <ActivityIndicator size="large" color="#bfa76f" />
      </View>
    );
  }

  return (
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
          options={{ title: 'سور القرآن' }}
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
          options={{ headerShown: false  }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
