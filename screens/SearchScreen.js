// screens/SearchScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import surahs from '../assets/quran/surahs';

export default function SearchScreen() {
  const [surahNumber, setSurahNumber] = useState('');
  const [ayahNumber, setAyahNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = () => {
    const sNum = parseInt(surahNumber, 10);
    const aNum = parseInt(ayahNumber, 10);
    if (!sNum || !aNum) {
      setError('رجاءً أدخل رقم سورة ورقم آية صحيحين.');
      setResult(null);
      return;
    }
    const surah = surahs[sNum];
    if (!surah) {
      setError(`السورة رقم ${sNum} غير موجودة.`);
      setResult(null);
      return;
    }
    const ayah = surah.ayahs.find(a => a.number === aNum);
    if (!ayah) {
      setError(`الآية رقم ${aNum} في السورة رقم ${sNum} غير موجودة.`);
      setResult(null);
      return;
    }
    setError('');
    setResult(ayah);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="رقم السورة"
        keyboardType="number-pad"
        value={surahNumber}
        onChangeText={setSurahNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="رقم الآية"
        keyboardType="number-pad"
        value={ayahNumber}
        onChangeText={setAyahNumber}
      />
      <Button title="بحث" onPress={handleSearch} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {result && (
        <View style={styles.result}>
          <Text style={styles.ayahText}>
            {result.number}. {result.text}
          </Text>
          <Text style={styles.tafsirText}>{result.tafsir}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12
  },
  error: { color: 'red', marginTop: 12 },
  result: { marginTop: 24 },
  ayahText: { fontSize: 18, fontWeight: 'bold' },
  tafsirText: { fontSize: 16, marginTop: 8 }
});
