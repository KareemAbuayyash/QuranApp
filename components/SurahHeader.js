import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import surahScreenStyles from '../styles/SurahScreenStyles';

const SurahHeader = ({ surahName, onBack, onPlayAll, isPlayingAll, onRestart, restartDisabled }) => (
  <View style={surahScreenStyles.fullWidthBanner}>
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <TouchableOpacity onPress={onBack} style={{ paddingHorizontal: 6 }}>
        <Text style={surahScreenStyles.backArrow}>←</Text>
      </TouchableOpacity>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={surahScreenStyles.surahNameHeader}>{surahName}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={onPlayAll} style={{ paddingHorizontal: 2 }}>
          <MaterialIcons
            name={isPlayingAll ? 'stop-circle' : 'play-circle-outline'}
            size={28}
            color={isPlayingAll ? '#bfa76f' : '#7c5c1e'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onRestart} style={{ paddingHorizontal: 2 }} disabled={restartDisabled}>
          <MaterialIcons name="replay" size={28} color={restartDisabled ? '#ccc' : '#7c5c1e'} />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default SurahHeader; 