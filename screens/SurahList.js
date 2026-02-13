import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import surahList from '../assets/source/surah.json';
import juzMap from '../assets/source/juzMap';
import juzMeta from '../assets/source/juzMeta';
import JuzListBanner from '../components/JuzListBanner';
import surahListStyles from '../styles/SurahListStyles';
import styles from '../styles/AudioSurahListStyles';
import revelationTypeMap from '../assets/source/revelationTypeMap';
import normalizeArabic from '../components/normalizeArabic';
import normalizeEnglish from '../components/normalizeEnglish';

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

  // بناء قائمة تعرض بداية كل جزء (juz) في مكانها
  const surahWithJuz = useMemo(() => {
    // خريطة: رقم السورة -> أرقام الأجزاء التي تبدأ عندها
    const surahToJuz = {};
    Object.entries(juzMap).forEach(([juzNum, ranges]) => {
      if (ranges.length > 0) {
        const first = ranges[0];
        if (!surahToJuz[first.surah]) surahToJuz[first.surah] = [];
        surahToJuz[first.surah].push(juzNum);
      }
    });
    // بناء القائمة
    const result = [];
    filteredSurahList.forEach((s) => {
      if (surahToJuz[s.index]) {
        surahToJuz[s.index].forEach(juzNum => {
          result.push({ type: 'juz', juzNum });
        });
      }
      result.push({ type: 'surah', surah: s });
    });
    return result;
  }, [filteredSurahList]);

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
          <View style={{ width: 40 }} />
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
          data={surahWithJuz}
          keyExtractor={(item, idx) => item.type === 'juz' ? `juz-${item.juzNum}-${idx}` : `surah-${item.surah.index}`}
          contentContainerStyle={surahListStyles.listContent}
          renderItem={({ item }) => {
            if (item.type === 'juz') {
              // جلب بيانات بداية الجزء
              const meta = juzMeta.find(j => j.index === item.juzNum);
              if (!meta || !meta.start) return <JuzListBanner currentJuz={item.juzNum} />;
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    navigation.navigate('SurahScreen', {
                      number: String(parseInt(meta.start.surah, 10)),
                      scrollToVerse: meta.start.verse ? Number(meta.start.verse.replace('verse_', '')) : 1
                    });
                  }}
                >
                  <JuzListBanner currentJuz={item.juzNum} />
                </TouchableOpacity>
              );
            }
            const s = item.surah;
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
