import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import surahListStyles from '../styles/SurahListStyles';
import styles from '../styles/AudioSurahListStyles';

const AudioSurahListHeader = ({ onBack, surahName, ayahCount, revelationType }) => (
  <View style={surahListStyles.fullWidthBanner}>
    <TouchableOpacity
      onPress={onBack}
      style={surahListStyles.fullWidthBackButton}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={24} color="#7c5c1e" />
    </TouchableOpacity>
    <View style={surahListStyles.fullWidthSurahNameContainer}>
      <Text style={[surahListStyles.surahNameHeader, { fontFamily: 'UthmaniFull' }]}>
        {surahName === "مع الصوت" ? "سور القرآن مع الصوت" : `سورة ${surahName}`}
      </Text>
      {ayahCount && (
        <Text style={[styles.ayahCountSubtitle, { fontFamily: 'UthmaniFull' }]}> 
          {surahName === "مع الصوت" ? `عدد السور: ${ayahCount}` : `عدد الآيات: ${ayahCount}`}
        </Text>
      )}
      {revelationType && (
        <Text style={{ fontFamily: 'UthmaniFull', fontSize: 14, color: '#7c5c1e', marginTop: 2 }}>
          ({revelationType})
        </Text>
      )}
    </View>
    <View style={{ width: 40 }} />
  </View>
);

export default AudioSurahListHeader; 