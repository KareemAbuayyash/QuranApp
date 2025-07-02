import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const SurahAudioListItem = ({ ayahText, ayahIndex, playingAyah, timer, lastPositions, playbackStatus, onPlay, onStop, onRestart, sound, styles }) => {
  const elapsed = playingAyah === ayahIndex ? timer : Math.floor((lastPositions[ayahIndex] || 0) / 1000);
  const status = playbackStatus[ayahIndex] || {};
  const durationSec = status.durationMillis ? Math.floor(status.durationMillis / 1000) : 0;
  const positionSec = status.positionMillis ? Math.floor(status.positionMillis / 1000) : elapsed;
  const progress = durationSec > 0 ? positionSec / durationSec : 0;
  const sliderWidth = '100%';
  const handleSeek = async (value) => {
    if (sound && playingAyah === ayahIndex) {
      const millis = Math.floor(value * 1000);
      await sound.setPositionAsync(millis);
      onStop(); // To update lastPositions
    }
  };
  return (
    <View style={[styles.ayahCard, { marginBottom: 18 }]}> 
      <Text style={[styles.ayahText, { fontFamily: 'UthmaniFull', marginBottom: 8, textAlign: 'right' }]}>{ayahText}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <TouchableOpacity
          style={[styles.audioButton, { marginRight: 8 }]}
          onPress={() =>
            playingAyah === ayahIndex
              ? onStop()
              : onPlay(ayahIndex)
          }
        >
          <MaterialIcons
            name={playingAyah === ayahIndex ? 'stop' : 'play-arrow'}
            size={22}
            color="#bfa76f"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.audioButton, { backgroundColor: '#e0cfa9', paddingHorizontal: 8, marginRight: 8 }]}
          onPress={() => onRestart(ayahIndex)}
        >
          <MaterialIcons name="replay" size={20} color="#7c5c1e" />
        </TouchableOpacity>
        <Text style={{ fontSize: 15, color: '#7c5c1e', fontFamily: 'UthmaniFull', minWidth: 60 }}>
          {positionSec} / {durationSec > 0 ? durationSec : 0}s
        </Text>
      </View>
      <Slider
        style={{ width: sliderWidth, height: 32, alignSelf: 'center' }}
        minimumValue={0}
        maximumValue={durationSec > 0 ? durationSec : 1}
        value={positionSec}
        minimumTrackTintColor="#bfa76f"
        maximumTrackTintColor="#e0cfa9"
        thumbTintColor="#bfa76f"
        thumbStyle={{ height: 22, width: 22, borderRadius: 11, shadowColor: '#bfa76f', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4 }}
        trackStyle={{ height: 7, borderRadius: 4 }}
        onSlidingComplete={handleSeek}
        disabled={durationSec === 0}
      />
    </View>
  );
};

export default SurahAudioListItem; 