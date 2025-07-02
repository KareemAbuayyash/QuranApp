import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import surahListStyles from '../styles/SurahListStyles';
import styles from '../styles/AudioSurahListStyles';

const AudioSurahListHeader = ({ onBack, surahName, ayahCount, revelationType }) => (
  <View style={surahListStyles.fullWidthBanner}>
    <TouchableOpacity
      onPress={onBack}
      style={surahListStyles.fullWidthBackButton}
    >
      <Text style={surahListStyles.backArrow}>←</Text>
    </TouchableOpacity>
    <View style={surahListStyles.fullWidthSurahNameContainer}>
      <Text style={[surahListStyles.surahNameHeader, { fontFamily: 'UthmaniFull' }]}>سورة {surahName}</Text>
      <Text style={[styles.ayahCount, { fontFamily: 'UthmaniFull', marginTop: 4, marginBottom: 2 }]}> 
        {surahName === "مع الصوت" ? `عدد السور: ${ayahCount}` : `عدد الآيات: ${ayahCount}`}
      </Text>
      <Text style={{ fontFamily: 'UthmaniFull', fontSize: 18, color: '#7c5c1e', marginTop: 0 }}>{revelationType ? `(${revelationType})` : ''}</Text>
    </View>
  </View>
);

export default AudioSurahListHeader; 