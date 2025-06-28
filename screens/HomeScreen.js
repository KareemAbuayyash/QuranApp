// screens/HomeScreen.js
import React, { useRef, useEffect, useState } from 'react';
import { View, Image, Text, TouchableOpacity, SafeAreaView, Animated, Easing, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import homeScreenStyles from '../styles/HomeScreenStyles';

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
    <SafeAreaView style={homeScreenStyles.safeArea}>
      <LinearGradient
        colors={["#fdf6ec", "#f8ecd4", "#e0cfa9"]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={homeScreenStyles.card}>
        <View style={homeScreenStyles.logoGlowContainer}>
          <View style={homeScreenStyles.logoGlow} />
          <Image source={require('../assets/quran.png')} style={homeScreenStyles.logo} />
        </View>
        <Animated.Text style={[homeScreenStyles.headline, { opacity: fadeAnim }]}>مرحبًا بك في تطبيق القرآن</Animated.Text>
        <Text style={homeScreenStyles.subtitle}>استكشف السور وابحث عن الآيات وتفسيرها بسهولة</Text>
        <View style={homeScreenStyles.decorativeDividerContainer}>
          <View style={homeScreenStyles.decorativeDivider} />
          <Text style={homeScreenStyles.dividerIcon}>★</Text>
          <View style={homeScreenStyles.decorativeDivider} />
        </View>
        <TouchableOpacity style={homeScreenStyles.button} onPress={() => handleNavigate('SurahList')} activeOpacity={0.85} disabled={loading}>
          <Text style={homeScreenStyles.buttonIcon}>📖</Text>
          <Text style={homeScreenStyles.buttonText}>الفهرس</Text>
        </TouchableOpacity>
        <TouchableOpacity style={homeScreenStyles.button} onPress={() => handleNavigate('SearchScreen')} activeOpacity={0.85} disabled={loading}>
          <Text style={homeScreenStyles.buttonIcon}>🔍</Text>
          <Text style={homeScreenStyles.buttonText}>البحث عن آية وتفسيرها</Text>
        </TouchableOpacity>
        <Text style={homeScreenStyles.footer}>© {new Date().getFullYear()} MyQuranApp</Text>
        {loading && (
          <View style={homeScreenStyles.loadingOverlay}>
            <ActivityIndicator size="large" color="#bfa76f" />
            <Text style={homeScreenStyles.loadingText}>جاري التحميل...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
