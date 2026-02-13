// components/JuzListBanner.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import juzMeta from '../assets/source/juzMeta';

export default function JuzListBanner({ currentJuz }) {
  const meta = juzMeta.find(j => j.index === currentJuz);
  if (!meta) return null;
  return (
    <View style={styles.bannerWrap}>
      <View style={styles.bannerBox}>
        <Text style={styles.juzTitleAr}>{meta.titleAr}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerWrap: {
    backgroundColor: '#f6f6f9',
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginBottom: 2,
  },
  bannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#f3f3f3',
    borderRadius: 7,
    marginHorizontal: 0,
    marginVertical: 0,
    paddingVertical: 7,
    paddingLeft: 18,
    paddingRight: 18,
    borderWidth: 0,
    borderColor: 'transparent',
    minHeight: 38,
  },
  juzTitleAr: {
    fontSize: 17,
    color: '#888',
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1,
  },
});
