import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput } from 'react-native';
import surahListStyles from '../styles/SurahListStyles';
import styles from '../styles/AudioSurahListStyles';
import normalizeArabic from '../components/normalizeArabic';
import normalizeEnglish from '../components/normalizeEnglish';

const AudioSurahListSearchList = ({ surahList, searchText, setSearchText, onSurahPress, revelationTypeMap }) => {
  const filteredSurahList = useMemo(() => {
    const text = searchText.trim();
    if (!text) return surahList;

    const filtered = surahList.filter(item => {
      // Normalize search text
      const normalizedSearchText = text.toLowerCase();

      // Arabic
      const normalizedArabicTitle = normalizeArabic(item.titleAr);
      const normalizedArabicSearch = normalizeArabic(text);
      const arabicMatch = normalizedArabicSearch
        ? normalizedArabicTitle.includes(normalizedArabicSearch) || item.titleAr.toLowerCase().includes(normalizedSearchText)
        : false;

      // English
      const normalizedEnglishTitle = normalizeEnglish(item.title);
      const normalizedEnglishSearch = normalizeEnglish(text);
      const englishMatch = normalizedEnglishSearch
        ? normalizedEnglishTitle.includes(normalizedEnglishSearch) || item.title.toLowerCase().includes(normalizedSearchText)
        : false;

      // Index
      const indexMatch = item.index.includes(text) || parseInt(item.index, 10).toString().includes(text);

      return arabicMatch || englishMatch || indexMatch;
    });

    return filtered;
  }, [searchText, surahList]);

  return (
    <>
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
        keyExtractor={item => parseInt(item.index, 10).toString()}
        contentContainerStyle={surahListStyles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.surahItem}
            onPress={() => onSurahPress(item)}
          >
            <Text style={[styles.surahName, { fontFamily: 'UthmaniFull' }]}> {parseInt(item.index, 10)}. {item.titleAr} ({item.title}) </Text>
            <Text style={{ fontFamily: 'UthmaniFull', fontSize: 16, color: '#7c5c1e', marginTop: 2 }}>
              {revelationTypeMap[parseInt(item.index, 10).toString()]
                ? `(${revelationTypeMap[parseInt(item.index, 10).toString()]})`
                : ''}
            </Text>
            <Text style={{ fontSize: 14, color: '#bfa76f' }}>عدد الآيات: {item.count}</Text>
          </TouchableOpacity>
        )}
      />
    </>
  );
};

export default AudioSurahListSearchList; 