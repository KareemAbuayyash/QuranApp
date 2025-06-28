// screens/SurahList.js
import React, { useLayoutEffect, useState, useMemo, useRef } from 'react';
import { FlatList, TouchableOpacity, Text, StyleSheet, View, SafeAreaView, TextInput, ActivityIndicator, Animated, Dimensions, ScrollView } from 'react-native';
import surahList from '../assets/quran/surah-list.json';
import surahs from '../assets/quran/surahs';

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.pageBackground}>
        <View style={styles.fullWidthBanner}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.fullWidthBackButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.fullWidthSurahNameContainer}>
            {mode === 'tafsir' && selectedTafsirSurah ? (
              <Text style={styles.surahNameHeader}>
                تفسير {surahs[selectedTafsirSurah]?.name || ''}
              </Text>
            ) : (
              <Text style={styles.surahNameHeader}>سور القراَن</Text>
            )}
          </View>
        </View>
        {/* Mode Switch Buttons (hide when viewing tafsir of a surah) */}
        {!(mode === 'tafsir' && selectedTafsirSurah) && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'surah' && styles.modeButtonActive]}
              onPress={() => { setMode('surah'); setSelectedTafsirSurah(null); setTafsirPage(0); }}
            >
              <Text style={[styles.modeButtonText, mode === 'surah' && styles.modeButtonTextActive]}>سورة</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'tafsir' && styles.modeButtonActive]}
              onPress={() => { setMode('tafsir'); setSelectedTafsirSurah(null); setTafsirPage(0); }}
            >
              <Text style={[styles.modeButtonText, mode === 'tafsir' && styles.modeButtonTextActive]}>تفسير</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Search Bar only in surah mode or tafsir surah list */}
        {(mode === 'surah' || (mode === 'tafsir' && !selectedTafsirSurah)) && (
          <TextInput
            style={styles.searchBar}
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
            contentContainerStyle={styles.listContent}
            keyExtractor={item => item.number.toString()}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.surahCard,
                  selectedSurah === item.number && styles.surahCardLoading
                ]}
                activeOpacity={0.85}
                onPress={() => handleSurahPress(item)}
                disabled={loading}
              >
                <View style={styles.cardRow}>
                  <Text style={styles.englishName}>{item.englishName} — {item.numberOfAyahs} آية</Text>
                  <Text style={styles.arabicName}>{item.number}. {item.name}</Text>
                </View>
                {selectedSurah === item.number && loading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="small" color="#7c5c1e" />
                    <Text style={styles.loadingText}>جاري التحميل...</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        )}
        {mode === 'tafsir' && !selectedTafsirSurah && (
          <FlatList
            data={filteredSurahs}
            contentContainerStyle={styles.listContent}
            keyExtractor={item => item.number.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.surahCard}
                activeOpacity={0.85}
                onPress={() => { setSelectedTafsirSurah(item.number); setTafsirPage(0); }}
              >
                <View style={styles.cardRow}>
                  <Text style={styles.englishName}>{item.englishName} — {item.numberOfAyahs} آية</Text>
                  <Text style={styles.arabicName}>{item.number}. {item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
        {/* Tafsir Ayah List with Pagination and SurahScreen Style */}
        {mode === 'tafsir' && selectedTafsirSurah && (
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={{ alignSelf: 'flex-end', margin: 12, padding: 8 }}
              onPress={() => { setSelectedTafsirSurah(null); setTafsirPage(0); }}
            >
              <Text style={{ color: '#7c5c1e', fontSize: 18 }}>← رجوع</Text>
            </TouchableOpacity>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContent, { paddingBottom: tafsirTotalPages > 1 ? 80 : 20 }]}> 
              <View style={styles.ayahFrame}>
                {tafsirPageAyahs.map((item, idx) => (
                  <View key={item.number} style={{ marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 6 }}>
                      <Text style={[styles.ayahText, { textAlign: 'right', flex: 1 }]}>{item.text}</Text>
                      <Text style={styles.ayahNumber}>{'{'}<Text style={styles.ayahNumberInner}>{item.number}</Text>{'} '}</Text>
                    </View>
                    {item.tafsir ? (
                      <Text style={[styles.tafsirText, { textAlign: 'right', marginLeft: 16 }]}>تفسير: {item.tafsir}</Text>
                    ) : (
                      <Text style={[styles.tafsirTextEmpty, { textAlign: 'right' }]}>  لا يوجد تفسير متاح لهذه الآية.</Text>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
            {/* Pagination Controls */}
            {tafsirTotalPages > 1 && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[styles.arrowButton, tafsirPage === tafsirTotalPages - 1 && styles.arrowButtonDisabled]}
                  onPress={() => setTafsirPage(p => Math.min(p + 1, tafsirTotalPages - 1))}
                  disabled={tafsirPage === tafsirTotalPages - 1}
                >
                  <Text style={[styles.arrowText, tafsirPage === tafsirTotalPages - 1 && styles.arrowTextDisabled]}>←</Text>
                </TouchableOpacity>
                <View style={styles.pageInfoContainer}>
                  <Text style={styles.pageInfoText}>{tafsirPage + 1} من {tafsirTotalPages}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.arrowButton, tafsirPage === 0 && styles.arrowButtonDisabled]}
                  onPress={() => setTafsirPage(p => Math.max(p - 1, 0))}
                  disabled={tafsirPage === 0}
                >
                  <Text style={[styles.arrowText, tafsirPage === 0 && styles.arrowTextDisabled]}>→</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        {showScrollToTop && mode === 'surah' && (
          <TouchableOpacity
            style={styles.scrollToTopButton}
            onPress={scrollToTop}
            activeOpacity={0.8}
          >
            <Text style={styles.scrollToTopArrow}>↑</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fdf6ec',
  },
  pageBackground: {
    flex: 1,
    backgroundColor: '#fdf6ec',
    paddingTop: 24,
    paddingBottom: 12,
  },
  fullWidthBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8ecd4',
    borderColor: '#bfa76f',
    borderWidth: 2,
    borderRadius: 16,
    marginTop: 30,
    marginBottom: 16,
    marginStart: 10,
    marginEnd: 10,
    paddingVertical: 8,
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  fullWidthBackButton: {
    position: 'absolute',
    left: 16,
    zIndex: 2,
    padding: 8,
    marginTop: -9,
  },
  fullWidthSurahNameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahNameHeader: {
    fontSize: 24,
    color: '#7c5c1e',
    fontWeight: 'bold',
    fontFamily: 'Cochin',
    letterSpacing: 1,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  surahCard: {
    backgroundColor: '#fff9ef',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#e0cfa9',
    padding: 20,
    marginHorizontal: 6,
    marginBottom: 14,
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
  },
  surahCardLoading: {
    opacity: 0.7,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  englishName: {
    fontSize: 16,
    color: '#7c5c1e',
    fontWeight: '500',
    opacity: 0.85,
    flex: 1,
    textAlign: 'left',
    fontFamily: 'Cochin',
  },
  arabicName: {
    fontSize: 20,
    color: '#7c5c1e',
    fontWeight: 'bold',
    fontFamily: 'Cochin',
    letterSpacing: 1,
    flex: 1,
    textAlign: 'right',
  },
  backArrow: {
    fontSize: 24,
    color: '#7c5c1e',
    fontWeight: 'bold',
    marginRight: 12,
  },
  searchBar: {
    backgroundColor: '#fff9ef',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e0cfa9',
    paddingVertical: 10,
    paddingHorizontal: 18,
    fontSize: 18,
    color: '#7c5c1e',
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 2,
    fontFamily: 'Cochin',
    textAlign: 'right',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 236, 212, 0.9)',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#7c5c1e',
    fontFamily: 'Cochin',
    fontWeight: 'bold',
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7c5c1e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#bfa76f',
  },
  scrollToTopArrow: {
    fontSize: 24,
    color: '#fdf6ec',
    fontWeight: 'bold',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 8,
    backgroundColor: '#f8ecd4',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#bfa76f',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#bfa76f',
  },
  modeButtonText: {
    fontSize: 18,
    color: '#7c5c1e',
    fontWeight: 'bold',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  tafsirAyahCard: {
    backgroundColor: '#fff9ef',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e0cfa9',
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 6,
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  tafsirText: {
    color: '#7c5c1e',
    fontSize: 16,
    marginTop: 8,
    fontFamily: 'Cochin',
  },
  tafsirTextEmpty: {
    color: '#bfa76f',
    fontSize: 15,
    marginTop: 8,
    fontStyle: 'italic',
    fontFamily: 'Cochin',
  },
  ayahText: {
    color: '#2c2c2c',
    fontSize: 24,
    lineHeight: 40,
    fontFamily: 'Uthmani',
    textAlign: 'right',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  ayahFrame: {
    backgroundColor: '#fff9ef',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#e0cfa9',
    padding: 20,
    marginHorizontal: 16,
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 6,
  },
  ayahNumber: {
    color: '#bfa76f',
    fontSize: 20,
    fontWeight: 'bold',
  },
  ayahNumberInner: {
    fontSize: 18,
  },
  ayahSeparator: {
    fontSize: 24,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fdf6ec',
    borderTopWidth: 1,
    borderTopColor: '#e0cfa9',
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8ecd4',
    borderColor: '#bfa76f',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  arrowButtonDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
  },
  arrowText: {
    color: '#7c5c1e',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: -13,
  },
  arrowTextDisabled: {
    color: '#999',
  },
  pageInfoContainer: {
    alignItems: 'center',
  },
  pageInfoText: {
    color: '#7c5c1e',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Cochin',
  },
});