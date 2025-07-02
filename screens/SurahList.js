import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
} from 'react-native';
import surahList from '../assets/source/surah.json';
import surahListStyles from '../styles/SurahListStyles';
import styles from '../styles/AudioSurahListStyles';
import revelationTypeMap from '../assets/source/revelationTypeMap';
import normalizeArabic from '../components/normalizeArabic';
import normalizeEnglish from '../components/normalizeEnglish';

export default function SurahList({ navigation }) {
  const [searchText, setSearchText] = useState('');

  // Filter surah list by search text
  const filteredSurahList = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    if (!text) return surahList;
    return surahList.filter(item =>
      normalizeArabic(item.titleAr).includes(normalizeArabic(text)) ||
      normalizeEnglish(item.title).includes(normalizeEnglish(text)) ||
      parseInt(item.index, 10).toString().includes(text)
    );
  }, [searchText]);

  return (
    <SafeAreaView style={surahListStyles.safeArea}>
      <View style={surahListStyles.pageBackground}>
        <View style={surahListStyles.fullWidthBanner}>
          <TouchableOpacity
            onPress={() => navigation.goBack?.()}
            style={surahListStyles.fullWidthBackButton}
          >
            <Text style={surahListStyles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={surahListStyles.fullWidthSurahNameContainer}>
            <Text style={[surahListStyles.surahNameHeader, { fontFamily: 'UthmaniFull' }]}>سور القرآن</Text>
          </View>
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
          keyExtractor={item => parseInt(item.index, 10).toString()}
          contentContainerStyle={surahListStyles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.surahItem}
              onPress={() => {
                navigation.navigate('SurahScreen', { number: parseInt(item.index, 10).toString() });
              }}
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
      </View>
    </SafeAreaView>
  );
}
