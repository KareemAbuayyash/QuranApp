// screens/SurahList.js
import React, { useLayoutEffect, useState, useMemo, useRef } from 'react';
import { FlatList, TouchableOpacity, Text, StyleSheet, View, SafeAreaView, TextInput, ActivityIndicator, Animated } from 'react-native';
import surahList from '../assets/quran/surah-list.json';

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.pageBackground}>
        <View style={styles.fullWidthBanner}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.fullWidthBackButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.fullWidthSurahNameContainer}>
            <Text style={styles.surahNameHeader}>سور القراَن</Text>
          </View>
        </View>
        <TextInput
          style={styles.searchBar}
          placeholder="بحث عن سورة..."
          placeholderTextColor="#bfa76f"
          value={search}
          onChangeText={setSearch}
        />
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
        
        {showScrollToTop && (
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
});