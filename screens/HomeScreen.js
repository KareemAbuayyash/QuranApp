// screens/HomeScreen.js
import React, { useRef, useEffect, useState } from 'react';
import { View, Image, Text, TouchableOpacity, Animated, Easing, ActivityIndicator, Modal, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import homeScreenStyles from '../styles/HomeScreenStyles';
import * as FileSystem from 'expo-file-system';
import * as Asset from 'expo-asset';

export default function HomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true);
  const [showSource, setShowSource] = useState(false);
  const [surahData, setSurahData] = useState(null);
  const [audioFiles, setAudioFiles] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initial loading sequence
    const initializeApp = async () => {
      try {
        // Simulate app initialization tasks
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Load any necessary assets or data here
        // For example, preload fonts, check file system, etc.
        
        setIsInitialized(true);
        setLoading(false);
        
        // Start the fade animation after loading is complete
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsInitialized(true);
        setLoading(false);
      }
    };

    initializeApp();
  }, [fadeAnim]);

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const handleShowSource = async () => {
    setShowSource((prev) => !prev);
    if (!surahData) {
      // Load surah JSON
      try {
        const surahJson = require('../assets/source/surah/surah_1.json');
        setSurahData(surahJson);
        // List audio files for surah 001
        const audioDir = FileSystem.bundleDirectory + 'assets/source/audio/001/';
        // For Expo, we can statically list them (since dynamic FS is limited)
        setAudioFiles([
          require('../assets/source/audio/001/001.mp3'),
          require('../assets/source/audio/001/002.mp3'),
          require('../assets/source/audio/001/003.mp3'),
        ]);
      } catch (e) {
        setSurahData({ name: 'Error', verse: {}, count: 0 });
        setAudioFiles([]);
      }
    }
  };

  // Show initial loading screen
  if (!isInitialized) {
    return (
      <SafeAreaView style={homeScreenStyles.safeArea}>
        <LinearGradient
          colors={["#fdf6ec", "#f8ecd4", "#e0cfa9"]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View style={homeScreenStyles.initialLoadingContainer}>
          <View style={homeScreenStyles.logoGlowContainer}>
            <View style={homeScreenStyles.logoGlow} />
            <Image source={require('../assets/quran.jpg')} style={homeScreenStyles.logo} />
          </View>
          <Text style={homeScreenStyles.loadingTitle}>تطبيق القرآن</Text>
          <ActivityIndicator size="large" color="#bfa76f" style={{ marginTop: 30 }} />
          <Text style={homeScreenStyles.loadingSubtitle}>جاري تحميل التطبيق...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={homeScreenStyles.safeArea}>
      <LinearGradient
        colors={["#fdf6ec", "#f8ecd4", "#e0cfa9"]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <ScrollView 
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
      <View style={homeScreenStyles.card}>
        <View style={homeScreenStyles.logoGlowContainer}>
          <View style={homeScreenStyles.logoGlow} />
          <Image source={require('../assets/quran.jpg')} style={homeScreenStyles.logo} />
        </View>
        <Animated.Text style={[homeScreenStyles.headline, { opacity: fadeAnim }]}>مرحبًا بك في تطبيق القرآن</Animated.Text>
        <Text style={homeScreenStyles.subtitle}>استكشف السور وابحث عن الآيات وتفسيرها بسهولة</Text>
        <View style={homeScreenStyles.decorativeDividerContainer}>
          <View style={homeScreenStyles.decorativeDivider} />
          <Text style={homeScreenStyles.dividerIcon}>★</Text>
          <View style={homeScreenStyles.decorativeDivider} />
        </View>
        <TouchableOpacity style={homeScreenStyles.button} onPress={() => handleNavigate('SurahList')} activeOpacity={0.85}>
          <Text style={homeScreenStyles.buttonIcon}>📖</Text>
          <Text style={homeScreenStyles.buttonText}>الفهرس</Text>
        </TouchableOpacity>
        <TouchableOpacity style={homeScreenStyles.button} onPress={() => handleNavigate('SearchScreen')} activeOpacity={0.85}>
          <Text style={homeScreenStyles.buttonIcon}>🔍</Text>
          <Text style={homeScreenStyles.buttonText}>البحث عن آية وتفسيرها</Text>
        </TouchableOpacity>
        <TouchableOpacity style={homeScreenStyles.button} onPress={() => handleNavigate('TasbeehScreen')} activeOpacity={0.85}>
          <Text style={homeScreenStyles.buttonIcon}>📿</Text>
          <Text style={homeScreenStyles.buttonText}>التسبيح الرقمي</Text>
        </TouchableOpacity>
        {/* تم حذف كل ما يتعلق بالصوتيات والسور */}
        <Text style={homeScreenStyles.footer}>© {new Date().getFullYear()} MyQuranApp</Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
