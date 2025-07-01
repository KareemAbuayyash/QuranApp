// screens/AudioSurahList.js
import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import surahList       from '../assets/quran/surah-list.json';
import surahListStyles from '../styles/SurahListStyles';
import styles          from '../styles/AudioSurahListStyles';
import audioFiles      from '../assets/source/audioFiles';
import surahJsonFiles  from '../assets/source/surahJsonFiles';
import revelationTypeMap from '../assets/source/revelationTypeMap';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');
const AYAHS_PER_PAGE = 15;

export default function AudioSurahList({ navigation }) {
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [playingAyah, setPlayingAyah]     = useState(null);
  const [sound, setSound]                 = useState(null);
  const [currentPage, setCurrentPage]     = useState(0);
  const scrollViewRef                     = useRef(null);
  const [lastPositions, setLastPositions] = useState({}); // ayahIndex: positionMillis
  const [playbackStatus, setPlaybackStatus] = useState({}); // ayahIndex: { positionMillis, durationMillis }
  const [timer, setTimer] = useState(0);

  // تقسيم الآيات إلى صفحات
  const pages = useMemo(() => {
    if (!selectedSurah || !selectedSurah.verse) return [];
    const ayahs = Object.entries(selectedSurah.verse);
    const totalPages = Math.ceil(ayahs.length / AYAHS_PER_PAGE);
    const pagesArray = [];
    for (let i = 0; i < totalPages; i++) {
      const start = i * AYAHS_PER_PAGE;
      const end   = Math.min(start + AYAHS_PER_PAGE, ayahs.length);
      pagesArray.push(ayahs.slice(start, end));
    }
    return pagesArray;
  }, [selectedSurah]);

  const handleSurahPress = async (surah) => {
    setSelectedSurah(surah);
    setPlayingAyah(null);
    setCurrentPage(0);
    setLastPositions({}); // Reset all saved positions
    setPlaybackStatus({}); // Reset playback status
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
      setTimer(0);
      if (playingAyah === ayahNum) return;
    }
    const surahIndex = selectedSurah.index;
    const key        = ayahNum.toString().padStart(3, '0');
    const source     = audioFiles[surahIndex]?.[key];
    if (!source) {
      alert('الصوت غير متوفر لهذه الآية');
      return;
    }
    try {
      const { sound: newSound, status } = await Audio.Sound.createAsync(source, { shouldPlay: true });
      setSound(newSound);
      setPlayingAyah(ayahNum);
      let startMillis = lastPositions[ayahNum] || 0;
      if (startMillis > 0) {
        await newSound.setPositionAsync(startMillis);
      }
      setTimer(Math.floor((startMillis || 0) / 1000));
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPlaybackStatus((prev) => ({ ...prev, [ayahNum]: { positionMillis: status.positionMillis, durationMillis: status.durationMillis } }));
          setTimer(Math.floor((status.positionMillis || 0) / 1000));
          if (status.didJustFinish) {
            setPlayingAyah(null);
            setSound(null);
            setTimer(0);
            setLastPositions((prev) => ({ ...prev, [ayahNum]: 0 }));
          }
        }
      });
    } catch (e) {
      alert('تعذر تشغيل الصوت');
    }
  };

  const handleStopAudio = async () => {
    if (sound && playingAyah !== null) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setLastPositions((prev) => ({ ...prev, [playingAyah]: status.positionMillis }));
      }
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setPlayingAyah(null);
      setTimer(0);
    }
  };

  const handleRestartAudio = async (ayahNum) => {
    // Stop current audio if playing
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setPlayingAyah(null);
      setTimer(0);
    }
    // Reset saved position for this ayah
    setLastPositions((prev) => ({ ...prev, [ayahNum]: 0 }));
    // Start playback from beginning
    await handlePlayAudio(ayahNum);
  };

  const goToNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 0);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 0);
    }
  };

  // إذا لم يتم اختيار سورة بعد
  if (!selectedSurah) {
    return (
      <SafeAreaView style={surahListStyles.safeArea}>
        <View style={surahListStyles.pageBackground}>
          <View style={surahListStyles.fullWidthBanner}>
            <TouchableOpacity
              onPress={() => navigation.goBack?.()}
              style={surahListStyles.fullWidthBackButton}
            >
              <Text style={surahListStyles.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={surahListStyles.fullWidthSurahNameContainer}>
              <Text style={[surahListStyles.surahNameHeader, { fontFamily: 'UthmaniFull' }]}>
                سور مع الصوت
              </Text>
            </View>
          </View>
          <FlatList
            data={surahList}
            keyExtractor={item => item.number.toString()}
            contentContainerStyle={surahListStyles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.surahItem}
                onPress={() => {
                  const json = surahJsonFiles[item.number.toString()];
                  if (!json) {
                    alert('هذه السورة غير متوفرة في العرض التجريبي');
                    return;
                  }
                  handleSurahPress({ ...item, ...json, index: item.number.toString().padStart(3, '0') });
                }}
              >
                <Text style={[styles.surahName, { fontFamily: 'UthmaniFull' }]}>
                  {item.number}. {item.name} ({item.englishName})
                </Text>
                <Text style={{ fontFamily: 'UthmaniFull', fontSize: 16, color: '#7c5c1e', marginTop: 2 }}>
                  {revelationTypeMap[item.number.toString()] 
                    ? `(${revelationTypeMap[item.number.toString()]})` 
                    : ''}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </SafeAreaView>
    );
  }

  // بعد اختيار سورة
  const totalPages    = pages.length;
  const showPagination = totalPages > 1;
  const currentAyahs  = pages[currentPage] || [];

  return (
    <SafeAreaView style={surahListStyles.safeArea}>
      <View style={surahListStyles.pageBackground}>
        <View style={surahListStyles.fullWidthBanner}>
          <TouchableOpacity
            onPress={async () => {
              setSelectedSurah(null);
              setPlayingAyah(null);
              setCurrentPage(0);
              if (sound) {
                await sound.unloadAsync();
                setSound(null);
              }
            }}
            style={surahListStyles.fullWidthBackButton}
          >
            <Text style={surahListStyles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={surahListStyles.fullWidthSurahNameContainer}>
            <Text style={[surahListStyles.surahNameHeader, { fontFamily: 'UthmaniFull' }]}>
              سورة {selectedSurah.name}
            </Text>
            <Text style={{ fontFamily: 'UthmaniFull', fontSize: 18, color: '#7c5c1e', marginTop: 4 }}>
              {revelationTypeMap[selectedSurah.number.toString()] 
                ? `(${revelationTypeMap[selectedSurah.number.toString()]})` 
                : ''}
            </Text>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: showPagination ? 80 : 20 },
          ]}
        >
          <Text style={[styles.ayahCount, { fontFamily: 'UthmaniFull' }]}>
            عدد الآيات: {selectedSurah.count}
          </Text>

          {currentAyahs.map(([key, value], idx) => {
            const ayahIndex = currentPage * AYAHS_PER_PAGE + idx;
            const elapsed = playingAyah === ayahIndex ? timer : Math.floor((lastPositions[ayahIndex] || 0) / 1000);
            const status = playbackStatus[ayahIndex] || {};
            const durationSec = status.durationMillis ? Math.floor(status.durationMillis / 1000) : 0;
            const positionSec = status.positionMillis ? Math.floor(status.positionMillis / 1000) : elapsed;
            const progress = durationSec > 0 ? positionSec / durationSec : 0;
            const sliderWidth = '100%';
            const handleSeek = async (value) => {
              if (sound && playingAyah === ayahIndex) {
                const millis = Math.floor(value * 1000);
                await sound.setPositionAsync(millis);
                setLastPositions((prev) => ({ ...prev, [ayahIndex]: millis }));
              } else {
                setLastPositions((prev) => ({ ...prev, [ayahIndex]: Math.floor(value * 1000) }));
              }
            };
            return (
              <View key={key} style={[styles.ayahCard, { marginBottom: 18 }]}>
                <Text style={[styles.ayahText, { fontFamily: 'UthmaniFull', marginBottom: 8, textAlign: 'right' }]}>{value}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <TouchableOpacity
                    style={[styles.audioButton, { marginRight: 8 }]}
                    onPress={() =>
                      playingAyah === ayahIndex
                        ? handleStopAudio()
                        : handlePlayAudio(ayahIndex)
                    }
                  >
                    <MaterialIcons
                      name={playingAyah === ayahIndex ? 'stop' : 'play-arrow'}
                      size={22}
                      color="#bfa76f"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.audioButton, { backgroundColor: '#e0cfa9', paddingHorizontal: 8, marginRight: 8 }]}
                    onPress={() => handleRestartAudio(ayahIndex)}
                  >
                    <MaterialIcons name="replay" size={20} color="#7c5c1e" />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 15, color: '#7c5c1e', fontFamily: 'UthmaniFull', minWidth: 60 }}>
                    {positionSec} / {durationSec > 0 ? durationSec : 0}s
                  </Text>
                </View>
                <Slider
                  style={{ width: sliderWidth, height: 32, alignSelf: 'center' }}
                  minimumValue={0}
                  maximumValue={durationSec > 0 ? durationSec : 1}
                  value={positionSec}
                  minimumTrackTintColor="#bfa76f"
                  maximumTrackTintColor="#e0cfa9"
                  thumbTintColor="#bfa76f"
                  thumbStyle={{ height: 22, width: 22, borderRadius: 11, shadowColor: '#bfa76f', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4 }}
                  trackStyle={{ height: 7, borderRadius: 4 }}
                  onSlidingComplete={handleSeek}
                  disabled={durationSec === 0}
                />
              </View>
            );
          })}
        </ScrollView>

        {showPagination && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[
                styles.arrowButton,
                currentPage === totalPages - 1 && styles.arrowButtonDisabled,
              ]}
              onPress={goToNextPage}
              disabled={currentPage === totalPages - 1}
            >
              <Text
                style={[
                  styles.arrowText,
                  currentPage === totalPages - 1 && styles.arrowTextDisabled,
                ]}
              >
                ←
              </Text>
            </TouchableOpacity>

            <View style={styles.pageInfoContainer}>
              <Text style={styles.pageInfoText}>
                {currentPage + 1} من {totalPages}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.arrowButton,
                currentPage === 0 && styles.arrowButtonDisabled,
              ]}
              onPress={goToPrevPage}
              disabled={currentPage === 0}
            >
              <Text
                style={[
                  styles.arrowText,
                  currentPage === 0 && styles.arrowTextDisabled,
                ]}
              >
                →
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
