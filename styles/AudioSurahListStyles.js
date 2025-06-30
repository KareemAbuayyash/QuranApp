import { StyleSheet } from 'react-native';

const audioSurahListStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf6ec',
    padding: 16,
  },
  surahItem: {
    padding: 14,
    backgroundColor: '#fffbe6',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0cfa9',
  },
  surahName: {
    fontSize: 18,
    color: '#7c5c1e',
    textAlign: 'right',
  },
  ayahCount: {
    fontSize: 16,
    marginBottom: 10,
    color: '#bfa76f',
    textAlign: 'center',
  },
  ayahBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0cfa9',
  },
  ayahText: {
    fontSize: 20,
    color: '#222',
    marginBottom: 8,
    textAlign: 'right',
  },
  audioButton: {
    backgroundColor: '#bfa76f',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  audioButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default audioSurahListStyles; 