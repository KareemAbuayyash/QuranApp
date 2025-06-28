// screens/HomeScreen.js
import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, SafeAreaView } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundDecor} />
      <View style={styles.card}>
        <Image source={require('../assets/quran.png')} style={styles.logo} />
        <Text style={styles.headline}>مرحبًا بك في تطبيق القرآن</Text>
        <Text style={styles.subtitle}>استكشف السور وابحث عن الآيات وتفسيرها بسهولة</Text>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SurahList')}>
          <Text style={styles.buttonText}>الفهرس</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SearchScreen')}>
          <Text style={styles.buttonText}>البحث عن آية وتفسيرها</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fdf6ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundDecor: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fdf6ec',
  },
  card: {
    backgroundColor: '#fff9ef',
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: '#bfa76f',
    paddingVertical: 38,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
    marginHorizontal: 18,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 18,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#bfa76f',
    backgroundColor: '#f8ecd4',
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  headline: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7c5c1e',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Cochin',
    letterSpacing: 1,
    textShadowColor: '#e0cfa9',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#bfa76f',
    marginBottom: 18,
    textAlign: 'center',
    fontFamily: 'Cochin',
    opacity: 0.95,
  },
  divider: {
    width: 90,
    height: 3,
    backgroundColor: '#bfa76f',
    borderRadius: 2,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#7c5c1e',
    borderColor: '#bfa76f',
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 44,
    borderRadius: 30,
    marginVertical: 10,
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff9ef',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'Cochin',
  },
});
