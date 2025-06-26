// screens/SurahList.js
import React from 'react';
import { FlatList, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import surahList from '../assets/quran/surah-list.json';

export default function SurahList({ navigation }) {
  return (
    <View style={styles.container}>
      <FlatList
        data={surahList}
        keyExtractor={item => item.number.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('SurahScreen', {
                number: item.number,
                name: item.name,
              })
            }
          >
            <Text style={styles.title}>{item.number}. {item.name}</Text>
            <Text style={styles.subtitle}>
              {item.englishName} — {item.numberOfAyahs} آية
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#555' }
});
