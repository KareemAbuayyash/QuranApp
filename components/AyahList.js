import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import surahScreenStyles from '../styles/SurahScreenStyles';

const AyahList = ({ ayahs, showBasmala, playingAyah, isPlayingAll, onPlayAyah, onStopAyah }) => (
  <>
    {showBasmala && (
      <View style={surahScreenStyles.basmalaContainer}>
        <Image source={require('../assets/basmala.png')} style={surahScreenStyles.basmalaImage} resizeMode="contain" />
      </View>
    )}
    <View style={surahScreenStyles.ayahFrame}>
      <Text style={surahScreenStyles.paragraphText}>
        {ayahs.map((ayah, idx) => (
          <React.Fragment key={ayah.number}>
            <Text style={surahScreenStyles.ayahText}>{ayah.text}</Text>
            <Text style={surahScreenStyles.ayahNumber}>
              {' ﴿'}
              <Text style={surahScreenStyles.ayahNumberInner}>{ayah.number}</Text>
              {'﴾ '}
            </Text>
            <TouchableOpacity
              onPress={() => playingAyah === ayah.audioIndex ? onStopAyah() : onPlayAyah(ayah.audioIndex)}
              style={{ marginHorizontal: 2, alignSelf: 'center' }}
              disabled={isPlayingAll}
            >
              <MaterialIcons
                name={playingAyah === ayah.audioIndex ? 'stop-circle' : 'play-circle-outline'}
                size={22}
                color={playingAyah === ayah.audioIndex ? '#bfa76f' : '#7c5c1e'}
              />
            </TouchableOpacity>
            {idx !== ayahs.length - 1 && (
              <Text style={surahScreenStyles.ayahSeparator}> </Text>
            )}
          </React.Fragment>
        ))}
      </Text>
    </View>
  </>
);

export default AyahList; 