import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Audio } from 'expo-av';
import surahList from '../assets/quran/surah-list.json';
import surah1 from '../assets/source/surah/surah_1.json';
import audioSurahListStyles from '../styles/AudioSurahListStyles';

const audioFiles = {
  "001": {
    "001": require("../assets/source/audio/001/001.mp3"),
    "002": require("../assets/source/audio/001/002.mp3"),
    "003": require("../assets/source/audio/001/003.mp3"),
    "004": require("../assets/source/audio/001/004.mp3"),
    "005": require("../assets/source/audio/001/005.mp3"),
    "006": require("../assets/source/audio/001/006.mp3"),
    "007": require("../assets/source/audio/001/007.mp3"),
  },
  // Add more surahs as needed
};

const surahJsonFiles = {
  "1": surah1,
  // Add more surahs as needed
};

// Add a mapping for revelationType for demo
const revelationTypeMap = {
  '1': 'مكية', // الفاتحة
  // Add more surahs as needed
};

export default function AudioSurahList({ navigation }) {
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [playingAyah, setPlayingAyah] = useState(null);
  const [sound, setSound] = useState(null);

  const handleSurahPress = async (surah) => {
    setSelectedSurah(surah);
    setPlayingAyah(null);
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
  };

  const handlePlayAudio = async (ayahNum) => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setPlayingAyah(null);
      // If the same ayah is pressed again, just stop
      if (playingAyah === ayahNum) return;
    }
    const surahIndex = selectedSurah.index;
    const ayahKey = ayahNum.toString().padStart(3, '0');
    const audioSource = audioFiles[surahIndex]?.[ayahKey];
    if (!audioSource) {
      alert('الصوت غير متوفر لهذه الآية');
      return;
    }
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(audioSource);
      setSound(newSound);
      setPlayingAyah(ayahNum);
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingAyah(null);
          setSound(null);
        }
      });
    } catch (e) {
      alert('تعذر تشغيل الصوت');
    }
  };

  const handleStopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setPlayingAyah(null);
    }
  };

  if (!selectedSurah) {
    return (
      <SafeAreaView style={audioSurahListStyles.safeArea}>
        <View style={audioSurahListStyles.pageBackground}>
          <View style={audioSurahListStyles.fullWidthBanner}>
            <TouchableOpacity onPress={() => { if (typeof navigation !== 'undefined') navigation.goBack && navigation.goBack(); }} style={audioSurahListStyles.fullWidthBackButton}>
              <Text style={audioSurahListStyles.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={audioSurahListStyles.fullWidthSurahNameContainer}>
              <Text style={[audioSurahListStyles.surahNameHeader, { fontFamily: 'Uthmani' }]}>سور مع الصوت</Text>
            </View>
          </View>
          <FlatList
            data={surahList}
            keyExtractor={(item) => item.number.toString()}
            contentContainerStyle={audioSurahListStyles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity style={audioSurahListStyles.surahItem} onPress={async () => {
                const surahJson = surahJsonFiles[item.number.toString()];
                if (!surahJson) {
                  alert('هذه السورة غير متوفرة في العرض التجريبي');
                  return;
                }
                handleSurahPress({ ...item, ...surahJson, index: item.number.toString().padStart(3, '0') });
              }}>
                <Text style={audioSurahListStyles.surahName}>{item.number}. {item.name} ({item.englishName})</Text>
                <Text style={{ fontFamily: 'Uthmani', fontSize: 16, color: '#7c5c1e', marginTop: 2 }}>
                  {revelationTypeMap[item.number?.toString()] ? `(${revelationTypeMap[item.number?.toString()]} )` : ''}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={audioSurahListStyles.safeArea}>
      <View style={audioSurahListStyles.pageBackground}>
        <View style={audioSurahListStyles.fullWidthBanner}>
          <TouchableOpacity style={audioSurahListStyles.fullWidthBackButton} onPress={async () => {
            setSelectedSurah(null);
            setPlayingAyah(null);
            if (sound) {
              await sound.unloadAsync();
              setSound(null);
            }
          }}>
            <Text style={audioSurahListStyles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={audioSurahListStyles.fullWidthSurahNameContainer}>
            <Text style={[audioSurahListStyles.surahNameHeader, { fontFamily: 'Uthmani' }]}>سورة {selectedSurah.name}</Text>
            <Text style={{ fontFamily: 'Uthmani', fontSize: 18, color: '#7c5c1e', marginTop: 4 }}>
              {revelationTypeMap[selectedSurah.number?.toString()] ? `(${revelationTypeMap[selectedSurah.number?.toString()]} )` : ''}
            </Text>
          </View>
        </View>
        <ScrollView style={audioSurahListStyles.container}>
          <Text style={audioSurahListStyles.ayahCount}>عدد الآيات: {selectedSurah.count}</Text>
          {Object.entries(selectedSurah.verse).map(([key, value], idx) => (
            <View key={key} style={audioSurahListStyles.ayahBox}>
              <Text style={[audioSurahListStyles.ayahText, { fontFamily: 'Uthmani' }]}>{value}</Text>
              <TouchableOpacity
                style={audioSurahListStyles.audioButton}
                onPress={() =>
                  playingAyah === idx + 1 ? handleStopAudio() : handlePlayAudio(idx + 1)
                }
              >
                <Text style={audioSurahListStyles.audioButtonText}>
                  {playingAyah === idx + 1 ? 'إيقاف الصوت' : 'تشغيل الصوت'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 