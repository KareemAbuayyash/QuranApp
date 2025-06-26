// screens/HomeScreen.js
import React from 'react';
import { View, Button, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.logo} />
      <Text style={styles.headline}>مرحبًا بك في تطبيق القرآن</Text>
      <View style={styles.divider} />
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SurahList')}>
        <Text style={styles.buttonText}>عرض جميع السور</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SearchScreen')}>
        <Text style={styles.buttonText}>بحث عن آية</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f6f9f4', // Soft greenish background
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
    borderRadius: 32,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headline: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#388e3c',
    marginBottom: 18,
    textAlign: 'center',
    fontFamily: 'Cochin',
    letterSpacing: 1,
    textShadowColor: '#c9b037',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  divider: {
    width: 80,
    height: 3,
    backgroundColor: '#c9b037',
    borderRadius: 2,
    marginBottom: 28,
  },
  button: {
    backgroundColor: '#388e3c',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginVertical: 10,
    shadowColor: '#c9b037',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
