import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import surahScreenStyles from '../styles/SurahScreenStyles';

const SurahHeader = ({ surahName, onBack, onPlayAll, isPlayingAll, onRestart, restartDisabled, onSave }) => (
  <View style={surahScreenStyles.surahBanner}>
    <TouchableOpacity 
      onPress={onBack} 
      style={surahScreenStyles.headerButton}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={24} color="#7c5c1e" />
    </TouchableOpacity>
    <View style={surahScreenStyles.headerTitleContainer}>
      <Text style={surahScreenStyles.surahName}>{surahName}</Text>
    </View>
    <View style={surahScreenStyles.headerActions}>
      <TouchableOpacity 
        onPress={onPlayAll} 
        style={surahScreenStyles.headerActionButton}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name={isPlayingAll ? 'stop-circle' : 'play-circle-outline'}
          size={28}
          color={isPlayingAll ? '#bfa76f' : '#7c5c1e'}
        />
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={onRestart} 
        style={surahScreenStyles.headerActionButton}
        disabled={restartDisabled}
        activeOpacity={0.7}
      >
        <MaterialIcons 
          name="replay" 
          size={28} 
          color={restartDisabled ? '#ccc' : '#7c5c1e'} 
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onSave}
        style={surahScreenStyles.headerActionButton}
        activeOpacity={0.7}
      >
        <MaterialIcons name="bookmark" size={28} color="#bfa76f" />
      </TouchableOpacity>
    </View>
  </View>
);

export default SurahHeader;