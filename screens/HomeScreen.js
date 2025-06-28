// screens/HomeScreen.js
import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, SafeAreaView, Animated, Easing, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleNavigate = (screen) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate(screen);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#fdf6ec", "#f8ecd4", "#e0cfa9"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={styles.card}>
        <View style={styles.logoGlowContainer}>
          <View style={styles.logoGlow} />
          <Image source={require('../assets/quran.png')} style={styles.logo} />
        </View>
        <Animated.Text style={[styles.headline, { opacity: fadeAnim }]}>مرحبًا بك في تطبيق القرآن</Animated.Text>
        <Text style={styles.subtitle}>استكشف السور وابحث عن الآيات وتفسيرها بسهولة</Text>
        <View style={styles.decorativeDividerContainer}>
          <View style={styles.decorativeDivider} />
          <Text style={styles.dividerIcon}>★</Text>
          <View style={styles.decorativeDivider} />
        </View>
        <TouchableOpacity style={styles.button} onPress={() => handleNavigate('SurahList')} activeOpacity={0.85} disabled={loading}>
          <Text style={styles.buttonIcon}>📖</Text>
          <Text style={styles.buttonText}>الفهرس</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleNavigate('SearchScreen')} activeOpacity={0.85} disabled={loading}>
          <Text style={styles.buttonIcon}>🔍</Text>
          <Text style={styles.buttonText}>البحث عن آية وتفسيرها</Text>
        </TouchableOpacity>
        <Text style={styles.footer}>© {new Date().getFullYear()} MyQuranApp</Text>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#bfa76f" />
            <Text style={styles.loadingText}>جاري التحميل...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  card: {
    backgroundColor: 'rgba(255,249,239,0.98)',
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#bfa76f',
    paddingVertical: 38,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
    marginHorizontal: 18,
    marginTop: 30,
  },
  logoGlowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#e0cfa9',
    opacity: 0.45,
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#bfa76f',
    backgroundColor: '#f8ecd4',
    zIndex: 2,
  },
  headline: {
    fontSize: 30,
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
  decorativeDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 2,
  },
  decorativeDivider: {
    flex: 1,
    height: 2.5,
    backgroundColor: '#bfa76f',
    borderRadius: 2,
    marginHorizontal: 8,
    opacity: 0.8,
  },
  dividerIcon: {
    fontSize: 18,
    color: '#bfa76f',
    marginHorizontal: 2,
    marginTop: -2,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7c5c1e',
    borderColor: '#bfa76f',
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
    marginVertical: 10,
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
    minWidth: 220,
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 22,
    marginRight: 10,
    color: '#e0cfa9',
    marginTop: 1,
  },
  buttonText: {
    color: '#fff9ef',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'Cochin',
  },
  footer: {
    marginTop: 28,
    fontSize: 13,
    color: '#bfa76f',
    opacity: 0.7,
    fontFamily: 'Cochin',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 236, 212, 0.85)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    flexDirection: 'row',
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 18,
    color: '#7c5c1e',
    fontFamily: 'Cochin',
    fontWeight: 'bold',
  },
});
