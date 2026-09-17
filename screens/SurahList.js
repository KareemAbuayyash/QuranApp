import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import surahList from '../assets/source/surah.json';
import surahListStyles from '../styles/SurahListStyles';
import styles from '../styles/AudioSurahListStyles';
import revelationTypeMap from '../assets/source/revelationTypeMap';
import normalizeArabic from '../components/normalizeArabic';
import normalizeEnglish from '../components/normalizeEnglish';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SurahList({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for surah list data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // 1.5 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  // Filter surah list by search text using improved normalization logic
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
  }, [searchText]);

  // Show loading screen
  if (loading) {
    return (
      <View style={surahListStyles.loadingContainer}>
        <View style={surahListStyles.loadingContent}>
          <ActivityIndicator size="large" color="#bfa76f" />
          <Text style={surahListStyles.loadingText}>جاري تحميل قائمة السور...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={surahListStyles.safeArea}>
      <View style={surahListStyles.pageBackground}>
        <View style={surahListStyles.fullWidthBanner}>
          <TouchableOpacity
            onPress={() => navigation.goBack?.()}
            style={surahListStyles.fullWidthBackButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#7c5c1e" />
          </TouchableOpacity>
          <View style={surahListStyles.fullWidthSurahNameContainer}>
            <Text style={[surahListStyles.surahNameHeader, { fontFamily: 'UthmaniFull' }]}>سور القرآن</Text>
          </View>
          <TouchableOpacity
            style={{ padding: 8, backgroundColor: '#bfa76f', borderRadius: 8 }}
            onPress={async () => {
              try {
                let surahNum = await AsyncStorage.getItem('lastSavedSurah');
                if (!surahNum) {
                  const keys = await AsyncStorage.getAllKeys();
                  const savedKey = keys.find((key) => key.startsWith('savedPage-surah-'));
                  surahNum = savedKey?.replace('savedPage-surah-', '');
                }
                if (!surahNum) {
                  alert('لا توجد صفحة محفوظة');
                  return;
                }
                const savedPage = await AsyncStorage.getItem(`savedPage-surah-${surahNum}`);
                const pageNumber = Number.parseInt(savedPage, 10);
                if (!Number.isInteger(pageNumber) || pageNumber < 0) {
                  alert('بيانات الصفحة المحفوظة غير صالحة');
                  return;
                }
                navigation.navigate('SurahScreen', {
                  number: surahNum,
                  savedPage: pageNumber,
                });
              } catch (error) {
                alert('تعذر فتح الصفحة المحفوظة');
              }
            }}
          >
            <Ionicons name="bookmark" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={surahListStyles.searchBar}
          placeholder="ابحث باسم السورة أو رقمها أو بالإنجليزي..."
          placeholderTextColor="#bfa76f"
          value={searchText}
          onChangeText={setSearchText}
          clearButtonMode="while-editing"
          textAlign="right"
        />
        <FlatList
          data={filteredSurahList}
          keyExtractor={(item) => `surah-${item.index}`}
          contentContainerStyle={surahListStyles.listContent}
          renderItem={({ item }) => {
            const s = item;
            return (
              <TouchableOpacity
                style={styles.surahItem}
                onPress={() => {
                  navigation.navigate('SurahScreen', { number: parseInt(s.index, 10).toString() });
                }}
              >
                <Text style={[styles.surahName, { fontFamily: 'UthmaniFull' }]}> {parseInt(s.index, 10)}. {s.titleAr} ({s.title}) </Text>
                <Text style={{ fontFamily: 'UthmaniFull', fontSize: 16, color: '#7c5c1e', marginTop: 2 }}>
                  {revelationTypeMap[parseInt(s.index, 10).toString()]
                    ? `(${revelationTypeMap[parseInt(s.index, 10).toString()]})`
                    : ''}
                </Text>
                <Text style={{ fontSize: 14, color: '#bfa76f' }}>عدد الآيات: {s.count}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}
