// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import SurahList from './screens/SurahList';
import SurahScreen from './screens/SurahScreen';
import SearchScreen from './screens/SearchScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'الصفحة الرئيسية' }} 
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
          options={{ title: 'بحث عن آية' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
