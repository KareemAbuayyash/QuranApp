// screens/HomeScreen.js
import React, { useRef, useEffect, useState } from 'react';
import { View, Image, Text, TouchableOpacity, SafeAreaView, Animated, Easing, ActivityIndicator, Modal, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import homeScreenStyles from '../styles/HomeScreenStyles';
import * as FileSystem from 'expo-file-system';
import * as Asset from 'expo-asset';

export default function HomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [surahData, setSurahData] = useState(null);
  const [audioFiles, setAudioFiles] = useState([]);

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
        <TouchableOpacity style={homeScreenStyles.button} onPress={() => navigation.navigate('AudioSurahList')} activeOpacity={0.85}>
          <Text style={homeScreenStyles.buttonIcon}>🎵</Text>
          <Text style={homeScreenStyles.buttonText}>عرض السور والصوتيات</Text>
        </TouchableOpacity>
        {showSource && surahData && (
          <View style={{ marginTop: 20, backgroundColor: '#fffbe6', borderRadius: 12, padding: 16 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>سورة: {surahData.name}</Text>
            <Text style={{ marginBottom: 8 }}>عدد الآيات: {surahData.count}</Text>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>الآيات:</Text>
            {Object.values(surahData.verse).map((v, i) => (
              <Text key={i} style={{ fontSize: 16, marginBottom: 2 }}>{v}</Text>
            ))}
            <Text style={{ fontWeight: 'bold', marginTop: 10, marginBottom: 4 }}>ملفات الصوت:</Text>
            {audioFiles.map((audio, i) => (
              <Text key={i} style={{ fontSize: 15 }}>ملف {i + 1}</Text>
            ))}
          </View>
        )}
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
