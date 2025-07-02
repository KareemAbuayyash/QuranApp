import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
} from 'react-native';
import surahList from '../assets/quran/surah-list.json';
import surahListStyles from '../styles/SurahListStyles';
import styles from '../styles/AudioSurahListStyles';
import surahJsonFiles from '../assets/source/surahJsonFiles';
import revelationTypeMap from '../assets/source/revelationTypeMap';
import normalizeArabic from '../components/normalizeArabic';

export default function SurahList({ navigation }) {
  const [searchText, setSearchText] = useState('');

  // Filter surah list by search text
  const filteredSurahList = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    if (!text) return surahList;
    return surahList.filter(item =>
      normalizeArabic(item.name.toLowerCase()).includes(normalizeArabic(text)) ||
      item.englishName.toLowerCase().includes(text) ||
      item.number.toString().includes(text)
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
          keyExtractor={item => item.number.toString()}
          contentContainerStyle={surahListStyles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.surahItem}
              onPress={() => {
                navigation.navigate('SurahScreen', { number: item.number.toString() });
              }}
            >
              <Text style={[styles.surahName, { fontFamily: 'UthmaniFull' }]}> {item.number}. {item.name} ({item.englishName}) </Text>
              <Text style={{ fontFamily: 'UthmaniFull', fontSize: 16, color: '#7c5c1e', marginTop: 2 }}>
                {revelationTypeMap[item.number.toString()] 
                  ? `(${revelationTypeMap[item.number.toString()]})` 
                  : ''}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
