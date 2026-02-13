import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import surahScreenStyles from '../styles/SurahScreenStyles';

const AyahList = ({ ayahs, showBasmala, playingAyah, isPlayingAll, onPlayAyah, onStopAyah, onShowTafsir }) => (
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
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 2 }}>
              <TouchableOpacity
                onPress={() => playingAyah === ayah.audioIndex ? onStopAyah() : onPlayAyah(ayah.audioIndex)}
                style={{ marginHorizontal: 3 }}
                disabled={isPlayingAll}
              >
                <MaterialIcons
                  name={playingAyah === ayah.audioIndex ? 'stop-circle' : 'play-circle-outline'}
                  size={22}
                  color={playingAyah === ayah.audioIndex ? '#bfa76f' : '#7c5c1e'}
                />
              </TouchableOpacity>
              {onShowTafsir && (
                <TouchableOpacity
                  onPress={() => onShowTafsir(ayah)}
                  style={{ marginHorizontal: 3 }}
                  disabled={ayah.verseKey === 0}
                >
                  <MaterialIcons
                    name="menu-book"
                    size={22}
                    color={ayah.verseKey === 0 ? '#ccc' : '#7c5c1e'}
                  />
                </TouchableOpacity>
              )}
            </View>
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