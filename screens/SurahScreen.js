import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Dimensions, Image, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import surahJsonFiles from '../assets/source/surahJsonFiles';
import audioFiles from '../assets/source/audioFiles';
import surahScreenStyles from '../styles/SurahScreenStyles';
import { MaterialIcons } from '@expo/vector-icons';
import SurahHeader from '../components/SurahHeader';
import AyahList from '../components/AyahList';
import PaginationControls from '../components/PaginationControls';
import TafsirModal from '../components/TafsirModal';

const { width } = Dimensions.get('window');
const AYAHS_PER_PAGE = 15; // Adjust this number based on your preference

export default function SurahScreen({ route, navigation }) {
  const { number, autoPlay } = route.params;
  const surah = surahJsonFiles[number];
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef(null);
  const [sound, setSound] = useState(null);
  const [playingAyah, setPlayingAyah] = useState(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const playAllRef = useRef(false);
  const [lastPlayedAyahIdx, setLastPlayedAyahIdx] = useState(null);
  const [isRestarting, setIsRestarting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tafsirModalVisible, setTafsirModalVisible] = useState(false);
  const [selectedAyahForTafsir, setSelectedAyahForTafsir] = useState(null);

  useEffect(() => {
    // Simulate loading time for surah data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // 1.5 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  // Extract ayahs as an array from the 'verse' object
  const ayahs = useMemo(() => {
    if (!surah || !surah.verse) return [];
    return Object.keys(surah.verse)
      .sort((a, b) => {
        const numA = parseInt(a.replace('verse_', ''));
        const numB = parseInt(b.replace('verse_', ''));
        return numA - numB;
      })
      .map((key, idx) => {
        const verseNumber = parseInt(key.replace('verse_', ''));
        return {
          number: idx + 1,
          text: surah.verse[key],
          audioIndex: idx, // index for audio file
          verseKey: verseNumber, // الرقم الأصلي من verse_X - للـ API
        };
      });
  }, [surah]);

  // Split ayahs into pages
  const pages = useMemo(() => {
    if (!ayahs.length) return [];
    const totalPages = Math.ceil(ayahs.length / AYAHS_PER_PAGE);
    const pagesArray = [];
    for (let i = 0; i < totalPages; i++) {
      const startIndex = i * AYAHS_PER_PAGE;
      const endIndex = Math.min(startIndex + AYAHS_PER_PAGE, ayahs.length);
      pagesArray.push(ayahs.slice(startIndex, endIndex));
    }
    return pagesArray;
  }, [ayahs]);

  useEffect(() => {
    // Cleanup function to stop audio when leaving the screen
    return () => {
      if (sound) {
        sound.getStatusAsync().then(status => {
          if (status.isLoaded) {
            sound.stopAsync();
            sound.unloadAsync();
          }
        });
      }
    };
  }, [sound]);

  useEffect(() => {
    if (autoPlay && !loading) {
      setCurrentPage(0);
      setLastPlayedAyahIdx(null);
      setTimeout(() => playAllAyahs(true), 100);
    }
  }, [autoPlay, loading]);

  // Show loading screen
  if (loading) {
    return (
      <View style={surahScreenStyles.loadingContainer}>
        <View style={surahScreenStyles.loadingContent}>
          <ActivityIndicator size="large" color="#bfa76f" />
          <Text style={surahScreenStyles.loadingText}>جاري تحميل السورة...</Text>
          {surah && (
            <Text style={surahScreenStyles.loadingSurahName}>{surah.name}</Text>
          )}
        </View>
      </View>
    );
  }

  if (!surah) {
    return <Text style={surahScreenStyles.loading}>لم أجد بيانات السورة #{number}</Text>;
  }

  const totalPages = pages.length;
  const showPagination = totalPages > 1;

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
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

  const handlePlayAudio = async (ayahIdx) => {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        await sound.stopAsync();
      await sound.unloadAsync();
      }
      setSound(null);
      setPlayingAyah(null);
      if (playingAyah === ayahIdx) return;
    }
    const surahKey = number.toString().padStart(3, '0');
    const ayahKey = (ayahIdx).toString().padStart(3, '0');
    const source = audioFiles[surahKey]?.[ayahKey];
    if (!source) {
      alert('الصوت غير متوفر لهذه الآية');
      return;
    }
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(source, { shouldPlay: true });
      setSound(newSound);
      setPlayingAyah(ayahIdx);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingAyah(null);
          setSound(null);
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
      await sound.stopAsync();
      await sound.unloadAsync();
      }
      setSound(null);
      setPlayingAyah(null);
      setLastPlayedAyahIdx(playingAyah);
    }
  };

  const playAllAyahs = async (forceRestart = false) => {
    if (typeof forceRestart !== 'boolean') forceRestart = false;
    if (isPlayingAll) {
      // Stop all
      setIsPlayingAll(false);
      playAllRef.current = false;
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
        await sound.stopAsync();
        await sound.unloadAsync();
        }
        setSound(null);
        setPlayingAyah(null);
      }
      setLastPlayedAyahIdx(playingAyah);
      return;
    }
    setIsPlayingAll(true);
    playAllRef.current = true;
    let idx = forceRestart ? 0 : (lastPlayedAyahIdx !== null ? lastPlayedAyahIdx : currentPage * AYAHS_PER_PAGE);
    console.log('playAllAyahs starting at idx:', idx, 'forceRestart:', forceRestart, 'lastPlayedAyahIdx:', lastPlayedAyahIdx, 'currentPage:', currentPage);
    const surahKey = number.toString().padStart(3, '0');
    while (idx < ayahs.length && playAllRef.current) {
      // If idx is at the start of a new page (not the first page), advance page and scroll
      const pageIdx = Math.floor(idx / AYAHS_PER_PAGE);
      if (pageIdx !== currentPage) {
        setCurrentPage(pageIdx);
        await new Promise((resolve) => setTimeout(resolve, 350)); // Wait for page change and scroll
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
      const ayahKey = idx.toString().padStart(3, '0');
      const source = audioFiles[surahKey]?.[ayahKey];
      if (!source) {
        idx++;
        continue;
      }
      try {
        setPlayingAyah(idx);
        const { sound: newSound } = await Audio.Sound.createAsync(source, { shouldPlay: true });
        setSound(newSound);
        await new Promise((resolve) => {
          newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              resolve();
            }
          });
        });
        await newSound.unloadAsync();
        setSound(null);
        setPlayingAyah(null);
        setLastPlayedAyahIdx(idx);
      } catch (e) {
        // skip on error
      }
      idx++;
    }
    setIsPlayingAll(false);
    playAllRef.current = false;
    setPlayingAyah(null);
    setSound(null);
    setLastPlayedAyahIdx(null);
  };

  const currentAyahs = pages[currentPage] || [];

  const handleRestart = async () => {
    if (isRestarting) return;
    setIsRestarting(true);
    setLastPlayedAyahIdx(null);
    setCurrentPage(0);
                  if (isPlayingAll) {
                    playAllRef.current = false;
                    setIsPlayingAll(false);
                    if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
                      await sound.stopAsync();
                      await sound.unloadAsync();
        }
                      setSound(null);
                      setPlayingAyah(null);
                    }
                  }
    setTimeout(() => {
      playAllAyahs(true);
      setIsRestarting(false);
    }, 100);
  };

  const handleShowTafsir = (ayah) => {
    // لا تفتح التفسير للبسملة (verse_0)
    if (ayah.verseKey === 0) {
      return;
    }
    setSelectedAyahForTafsir(ayah);
    setTafsirModalVisible(true);
  };

  const handleCloseTafsir = () => {
    setTafsirModalVisible(false);
    setSelectedAyahForTafsir(null);
  };

  return (
    <View style={surahScreenStyles.container}>
      <View style={surahScreenStyles.pageBackground}>
        <SurahHeader
          surahName={surah.name}
          onBack={() => navigation.goBack()}
          onPlayAll={() => playAllAyahs(false)}
          isPlayingAll={isPlayingAll}
          onRestart={handleRestart}
          restartDisabled={isRestarting}
        />
        <ScrollView 
          ref={scrollViewRef}
          style={surahScreenStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            surahScreenStyles.scrollContent,
            { paddingBottom: showPagination ? 80 : 20 }
          ]}
        >
          <AyahList
            ayahs={currentAyahs}
            showBasmala={currentPage === 0}
            playingAyah={playingAyah}
            isPlayingAll={isPlayingAll}
            onPlayAyah={handlePlayAudio}
            onStopAyah={handleStopAudio}
            onShowTafsir={handleShowTafsir}
          />
        </ScrollView>
        {showPagination && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onNext={goToNextPage}
            onPrev={goToPrevPage}
          />
        )}
      </View>
      
      <TafsirModal
        visible={tafsirModalVisible}
        onClose={handleCloseTafsir}
        surahNumber={number}
        ayahNumber={selectedAyahForTafsir?.verseKey || selectedAyahForTafsir?.number}
        ayahText={selectedAyahForTafsir?.text}
      />
    </View>
  );
}