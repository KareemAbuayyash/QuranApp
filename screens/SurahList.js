// screens/SurahList.js
import React, { useLayoutEffect, useState, useMemo, useRef } from 'react';
import { FlatList, TouchableOpacity, Text, View, SafeAreaView, TextInput, ActivityIndicator, Animated, Dimensions, ScrollView } from 'react-native';
import surahList from '../assets/quran/surah-list.json';
import surahs from '../assets/quran/surahs';
import surahListStyles from '../styles/SurahListStyles';

export default function SurahList({ navigation }) {
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const flatListRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [mode, setMode] = useState('surah'); // 'surah' or 'tafsir'
  const [selectedTafsirSurah, setSelectedTafsirSurah] = useState(null);
  const [tafsirPage, setTafsirPage] = useState(0);
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  const tafsirScrollRef = useRef(null);
  const AYAHS_PER_PAGE = 15;
  const { width } = Dimensions.get('window');

  const filteredSurahs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return surahList;
    return surahList.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.englishName.toLowerCase().includes(q)
    );
  }, [search]);

  const handleSurahPress = (item) => {
    setLoading(true);
    setSelectedSurah(item.number);
    
    // 2 second delay before navigation
    setTimeout(() => {
      setLoading(false);
      setSelectedSurah(null);
      navigation.navigate('SurahScreen', {
        number: item.number,
        name: item.name,
      });
    }, 2000);
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowScrollToTop(offsetY > 200);
      },
    }
  );

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // For tafsir pagination
  const tafsirAyahs = selectedTafsirSurah ? surahs[selectedTafsirSurah]?.ayahs || [] : [];
  const tafsirTotalPages = Math.ceil(tafsirAyahs.length / AYAHS_PER_PAGE);
  const tafsirPageAyahs = tafsirAyahs.slice(tafsirPage * AYAHS_PER_PAGE, (tafsirPage + 1) * AYAHS_PER_PAGE);

  // Scroll to top when tafsirPage changes
  React.useEffect(() => {
    if (mode === 'tafsir' && selectedTafsirSurah && tafsirScrollRef.current) {
      tafsirScrollRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [tafsirPage, mode, selectedTafsirSurah]);

  return (
    <SafeAreaView style={surahListStyles.safeArea}>
      <View style={surahListStyles.pageBackground}>
        <View style={surahListStyles.fullWidthBanner}>
          <TouchableOpacity
            onPress={() => {
              if (mode === 'tafsir' && selectedTafsirSurah) {
                setSelectedTafsirSurah(null);
                setTafsirPage(0);
              } else {
                navigation.goBack();
              }
            }}
            style={surahListStyles.fullWidthBackButton}
          >
            <Text style={surahListStyles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={surahListStyles.fullWidthSurahNameContainer}>
            {mode === 'tafsir' && selectedTafsirSurah ? (
              <Text style={surahListStyles.surahNameHeader}>
                تفسير {surahs[selectedTafsirSurah]?.name || ''}
              </Text>
            ) : (
              <Text style={surahListStyles.surahNameHeader}>سور القراَن</Text>
            )}
          </View>
        </View>
        {/* Mode Switch Buttons (hide when viewing tafsir of a surah) */}
        {!(mode === 'tafsir' && selectedTafsirSurah) && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
            <TouchableOpacity
              style={[surahListStyles.modeButton, mode === 'surah' && surahListStyles.modeButtonActive]}
              onPress={() => { setMode('surah'); setSelectedTafsirSurah(null); setTafsirPage(0); }}
            >
              <Text style={[surahListStyles.modeButtonText, mode === 'surah' && surahListStyles.modeButtonTextActive]}>سورة</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[surahListStyles.modeButton, mode === 'tafsir' && surahListStyles.modeButtonActive]}
              onPress={() => { setMode('tafsir'); setSelectedTafsirSurah(null); setTafsirPage(0); }}
            >
              <Text style={[surahListStyles.modeButtonText, mode === 'tafsir' && surahListStyles.modeButtonTextActive]}>تفسير</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Search Bar only in surah mode or tafsir surah list */}
        {(mode === 'surah' || (mode === 'tafsir' && !selectedTafsirSurah)) && (
          <TextInput
            style={surahListStyles.searchBar}
            placeholder="بحث عن سورة..."
            placeholderTextColor="#bfa76f"
            value={search}
            onChangeText={setSearch}
          />
        )}
        {/* Surah List (for both modes, but different onPress) */}
        {mode === 'surah' && (
          <FlatList
            ref={flatListRef}
            data={filteredSurahs}
            contentContainerStyle={surahListStyles.listContent}
            keyExtractor={item => item.number.toString()}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  surahListStyles.surahCard,
                  selectedSurah === item.number && surahListStyles.surahCardLoading
                ]}
                activeOpacity={0.85}
                onPress={() => handleSurahPress(item)}
                disabled={loading}
              >
                <View style={surahListStyles.cardRow}>
                  <Text style={surahListStyles.englishName}>{item.englishName} — {item.numberOfAyahs} آية</Text>
                  <Text style={surahListStyles.arabicName}>{item.number}. {item.name}</Text>
                </View>
                {selectedSurah === item.number && loading && (
                  <View style={surahListStyles.loadingOverlay}>
                    <ActivityIndicator size="small" color="#7c5c1e" />
                    <Text style={surahListStyles.loadingText}>جاري التحميل...</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        )}
        {mode === 'tafsir' && !selectedTafsirSurah && (
          <FlatList
            data={filteredSurahs}
            contentContainerStyle={surahListStyles.listContent}
            keyExtractor={item => item.number.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={surahListStyles.surahCard}
                activeOpacity={0.85}
                onPress={() => {
                  setLoadingTafsir(true);
                  setSelectedSurah(item.number); // reuse selectedSurah for loading overlay
                  setTimeout(() => {
                    setLoadingTafsir(false);
                    setSelectedSurah(null);
                    setSelectedTafsirSurah(item.number);
                    setTafsirPage(0);
                  }, 2000);
                }}
              >
                <View style={surahListStyles.cardRow}>
                  <Text style={surahListStyles.englishName}>{item.englishName} — {item.numberOfAyahs} آية</Text>
                  <Text style={surahListStyles.arabicName}>{item.number}. {item.name}</Text>
                </View>
                {selectedSurah === item.number && loadingTafsir && (
                  <View style={surahListStyles.loadingOverlay}>
                    <ActivityIndicator size="small" color="#7c5c1e" />
                    <Text style={surahListStyles.loadingText}>جاري التحميل...</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        )}
        {/* Tafsir Ayah List with Pagination and SurahScreen Style */}
        {mode === 'tafsir' && selectedTafsirSurah && (
          <View style={{ flex: 1 }}>
            <ScrollView
              ref={tafsirScrollRef}
              style={surahListStyles.scrollContainer}
              contentContainerStyle={[surahListStyles.scrollContent, { paddingBottom: tafsirTotalPages > 1 ? 80 : 20 }]}
            >
              <View style={surahListStyles.ayahFrame}>
                {tafsirPageAyahs.map((item, idx) => (
                  <View key={item.number} style={{ marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 6 }}>
                      <Text style={[surahListStyles.ayahText, { textAlign: 'right', flex: 1 }]}>{item.text}</Text>
                      <Text style={surahListStyles.ayahNumber}>{'{'}<Text style={surahListStyles.ayahNumberInner}>{item.number}</Text>{'} '}</Text>
                    </View>
                    {item.tafsir ? (
                      <Text style={[surahListStyles.tafsirText, { textAlign: 'right', marginLeft: 16 }]}>تفسير: {item.tafsir}</Text>
                    ) : (
                      <Text style={[surahListStyles.tafsirTextEmpty, { textAlign: 'right' }]}>  لا يوجد تفسير متاح لهذه الآية.</Text>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
            {/* Pagination Controls */}
            {tafsirTotalPages > 1 && (
              <View style={surahListStyles.paginationContainer}>
                <TouchableOpacity
                  style={[surahListStyles.arrowButton, tafsirPage === tafsirTotalPages - 1 && surahListStyles.arrowButtonDisabled]}
                  onPress={() => setTafsirPage(p => Math.min(p + 1, tafsirTotalPages - 1))}
                  disabled={tafsirPage === tafsirTotalPages - 1}
                >
                  <Text style={[surahListStyles.arrowText, tafsirPage === tafsirTotalPages - 1 && surahListStyles.arrowTextDisabled]}>←</Text>
                </TouchableOpacity>
                <View style={surahListStyles.pageInfoContainer}>
                  <Text style={surahListStyles.pageInfoText}>{tafsirPage + 1} من {tafsirTotalPages}</Text>
                </View>
                <TouchableOpacity
                  style={[surahListStyles.arrowButton, tafsirPage === 0 && surahListStyles.arrowButtonDisabled]}
                  onPress={() => setTafsirPage(p => Math.max(p - 1, 0))}
                  disabled={tafsirPage === 0}
                >
                  <Text style={[surahListStyles.arrowText, tafsirPage === 0 && surahListStyles.arrowTextDisabled]}>→</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        {showScrollToTop && mode === 'surah' && (
          <TouchableOpacity
            style={surahListStyles.scrollToTopButton}
            onPress={scrollToTop}
            activeOpacity={0.8}
          >
            <Text style={surahListStyles.scrollToTopArrow}>↑</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}