import React from 'react';
import SurahAudioListItem from './SurahAudioListItem';

const SurahAudioList = ({ ayahs, currentPage, playingAyah, timer, lastPositions, playbackStatus, onPlay, onStop, onRestart, sound, styles }) => (
  <>
    {ayahs.map(([key, value], idx) => {
      const ayahIndex = currentPage * ayahs.length + idx;
      return (
        <SurahAudioListItem
          key={key}
          ayahText={value}
          ayahIndex={ayahIndex}
          playingAyah={playingAyah}
          timer={timer}
          lastPositions={lastPositions}
          playbackStatus={playbackStatus}
          onPlay={onPlay}
          onStop={onStop}
          onRestart={onRestart}
          sound={sound}
          styles={styles}
        />
      );
    })}
  </>
);

export default SurahAudioList; 