// screens/SurahList.js
import React, { useLayoutEffect, useState, useMemo } from 'react';
import { FlatList, TouchableOpacity, Text, StyleSheet, View, SafeAreaView, TextInput, ActivityIndicator } from 'react-native';
import surahList from '../assets/quran/surah-list.json';

export default function SurahList({ navigation }) {
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState(null);

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
          data={filteredSurahs}
          contentContainerStyle={styles.listContent}
          keyExtractor={item => item.number.toString()}
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
});