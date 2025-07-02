import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput } from 'react-native';
import surahListStyles from '../styles/SurahListStyles';
import styles from '../styles/AudioSurahListStyles';
import normalizeArabic from '../components/normalizeArabic';
import normalizeEnglish from '../components/normalizeEnglish';

const AudioSurahListSearchList = ({ surahList, searchText, setSearchText, onSurahPress, revelationTypeMap }) => {
  const filteredSurahList = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    if (!text) return surahList;
    return surahList.filter(item =>
      normalizeArabic(item.titleAr).includes(normalizeArabic(text)) ||
      normalizeEnglish(item.title).includes(normalizeEnglish(text)) ||
      parseInt(item.index, 10).toString().includes(text)
    );
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