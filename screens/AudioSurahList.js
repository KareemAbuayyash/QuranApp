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
  TextInput,
} from 'react-native';
import { Audio } from 'expo-av';
import surahList from '../assets/source/surah.json';
import surahListStyles from '../styles/SurahListStyles';
import styles from '../styles/AudioSurahListStyles';
import audioFiles from '../assets/source/audioFiles';
import surahJsonFiles from '../assets/source/surahJsonFiles';
import revelationTypeMap from '../assets/source/revelationTypeMap';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import normalizeArabic from '../components/normalizeArabic';
import normalizeEnglish from '../components/normalizeEnglish';
import AudioSurahListHeader from '../components/AudioSurahListHeader';
import AudioSurahListSearchList from '../components/AudioSurahListSearchList';
import SurahAudioList from '../components/SurahAudioList';
import AudioSurahPagination from '../components/AudioSurahPagination';

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
  const [searchText, setSearchText] = useState('');

  // Filter surah list using normalization
  const filteredSurahList = useMemo(() => {
    const text = searchText.trim();
    if (!text) return surahList;
    const normalizedArabicSearch = normalizeArabic(text);
    const normalizedEnglishSearch = normalizeEnglish(text);
    return surahList.filter(item =>
      (normalizedArabicSearch && normalizeArabic(item.titleAr).includes(normalizedArabicSearch)) ||
      (normalizedEnglishSearch && normalizeEnglish(item.title).includes(normalizedEnglishSearch)) ||
      item.index.includes(text) ||
      parseInt(item.index, 10).toString().includes(text)
    );
  }, [searchText, surahList]);

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
          <AudioSurahListHeader
            onBack={() => navigation.goBack?.()}
            surahName="مع الصوت"
            ayahCount={surahList.length}
            revelationType={null}
          />
          <AudioSurahListSearchList
            surahList={filteredSurahList}
            searchText={searchText}
            setSearchText={setSearchText}
            onSurahPress={item => {
              const json = surahJsonFiles[parseInt(item.index, 10).toString()];
              if (!json) {
                alert('هذه السورة غير متوفرة في العرض التجريبي');
                return;
              }
              handleSurahPress({ ...item, ...json, index: item.index });
            }}
            revelationTypeMap={revelationTypeMap}
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
        <AudioSurahListHeader
          onBack={async () => {
            setSelectedSurah(null);
            setPlayingAyah(null);
            setCurrentPage(0);
            if (sound) {
              await sound.unloadAsync();
              setSound(null);
            }
          }}
          surahName={selectedSurah.titleAr}
          ayahCount={selectedSurah.count}
          revelationType={revelationTypeMap[parseInt(selectedSurah.index, 10).toString()]}
        />
        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: showPagination ? 80 : 20 },
          ]}
        >
          <SurahAudioList
            ayahs={currentAyahs}
            currentPage={currentPage}
            playingAyah={playingAyah}
            timer={timer}
            lastPositions={lastPositions}
            playbackStatus={playbackStatus}
            onPlay={handlePlayAudio}
            onStop={handleStopAudio}
            onRestart={handleRestartAudio}
            sound={sound}
            styles={styles}
          />
        </ScrollView>
        {showPagination && (
          <AudioSurahPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onNext={goToNextPage}
            onPrev={goToPrevPage}
            styles={styles}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
