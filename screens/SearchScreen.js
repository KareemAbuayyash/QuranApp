// screens/SearchScreen.js
import React, { useState, useMemo, useRef } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Platform, 
  I18nManager,
  Dimensions,
  KeyboardAvoidingView,
  SafeAreaView,
  Modal,
  FlatList,
  Share
} from 'react-native';
import surahs from '../assets/quran/surahs';
import surahList from '../assets/quran/surah-list.json';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SearchScreen() {
  const [surahQuery, setSurahQuery] = useState('');
  const [ayahNumber, setAyahNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showSurahModal, setShowSurahModal] = useState(false);
  const [showAyahModal, setShowAyahModal] = useState(false);
  const [modalSurahSearch, setModalSurahSearch] = useState('');
  const [selectedSurahObj, setSelectedSurahObj] = useState(null);

  // Filter surahs for modal search
  const filteredSurahs = useMemo(() => {
    const q = modalSurahSearch.trim();
    if (!q) return surahList;
    return surahList.filter(
      s => s.name.includes(q) || s.englishName.toLowerCase().includes(q.toLowerCase()) || s.number.toString() === q
    );
  }, [modalSurahSearch]);

  // Generate ayah numbers for selected surah
  const ayahNumbers = useMemo(() => {
    if (selectedSurahObj && selectedSurahObj.numberOfAyahs) {
      return Array.from({ length: selectedSurahObj.numberOfAyahs }, (_, i) => (i + 1).toString());
    }
    return [];
  }, [selectedSurahObj]);

  const handleOpenSurahModal = () => {
    setShowSurahModal(true);
    setModalSurahSearch('');
  };

  const handleOpenAyahModal = () => {
    if (selectedSurahObj) setShowAyahModal(true);
  };

  const handleSurahSelect = (surah) => {
    setSelectedSurahObj(surah);
    setSurahQuery(`${surah.number} - ${surah.name}`);
    setAyahNumber('');
    setShowSurahModal(false);
  };

  const handleAyahSelect = (ayahNum) => {
    setAyahNumber(ayahNum);
    setShowAyahModal(false);
  };

  const handleSearch = () => {
    setError('');
    setResult(null);
    let sNum = surahQuery.split(' - ')[0];
    if (!sNum) sNum = surahQuery;
    const aNum = parseInt(ayahNumber, 10);
    if (!sNum || !aNum) {
      setError('رجاءً أدخل اسم أو رقم السورة ورقم آية صحيحين.');
      return;
    }
    const surah = surahs[sNum];
    if (!surah) {
      setError(`السورة غير موجودة.`);
      return;
    }
    const ayah = surah.ayahs.find(a => a.number === aNum);
    if (!ayah) {
      setError(`الآية رقم ${aNum} في السورة رقم ${sNum} غير موجودة.`);
      return;
    }
    setResult({ ...ayah, surahName: surah.name, surahNumber: surah.number });
  };

  const clearSearch = () => {
    setSurahQuery('');
    setAyahNumber('');
    setSelectedSurahObj(null);
    setResult(null);
    setError('');
  };

  const handleShare = async () => {
    if (!result) return;
    try {
      await Share.share({
        message: `سورة ${result.surahName} - الآية ${result.number}:\n${result.text}`
      });
    } catch (e) {}
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#fdf6ec", "#f8ecd4", "#e0cfa9"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.title}>بحث عن آية</Text>
                <TouchableOpacity 
                  style={styles.clearButton} 
                  onPress={clearSearch}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh-outline" size={20} color="#bfa76f" />
                </TouchableOpacity>
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>اسم السورة</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={handleOpenSurahModal}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: surahQuery ? '#2c2c2c' : '#bfa76f', fontSize: 16, textAlign: 'right', fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif' }}>
                    {surahQuery ? surahQuery : 'اختر السورة...'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#bfa76f" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>رقم الآية</Text>
                <TouchableOpacity
                  style={[styles.input, !selectedSurahObj && styles.inputDisabled]}
                  onPress={selectedSurahObj ? handleOpenAyahModal : undefined}
                  activeOpacity={selectedSurahObj ? 0.8 : 1}
                  disabled={!selectedSurahObj}
                >
                  <Text style={{ color: ayahNumber ? '#2c2c2c' : '#bfa76f', fontSize: 16, textAlign: 'right', fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif' }}>
                    {ayahNumber ? ayahNumber : selectedSurahObj ? 'اختر رقم الآية...' : 'اختر السورة أولاً'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#bfa76f" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={[styles.button, (!surahQuery || !ayahNumber) && styles.buttonDisabled]} 
                onPress={handleSearch} 
                activeOpacity={0.8}
                disabled={!surahQuery || !ayahNumber}
              >
                <Ionicons name="search" size={20} color="#fff9ef" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>بحث</Text>
              </TouchableOpacity>
              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="warning-outline" size={20} color="#b53a3a" />
                  <Text style={styles.error}>{error}</Text>
                </View>
              ) : null}
              {result && (
                <View style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultSurah}>
                      سورة {result.surahName} - الآية {result.number}
                    </Text>
                    <View style={styles.resultNumber}>
                      <Text style={styles.resultNumberText}>{result.surahNumber}</Text>
                    </View>
                  </View>
                  <View style={styles.ayahContainer}>
                    <Text style={styles.resultAyah} selectable>
                      {result.text}
                    </Text>
                  </View>
                  {result.tafsir && (
                    <View style={styles.tafsirContainer}>
                      <Text style={styles.tafsirLabel}>التفسير:</Text>
                      <Text style={styles.resultTafsir}>{result.tafsir}</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.8}>
                    <Ionicons name="share-social-outline" size={18} color="#7c5c1e" style={{ marginLeft: 6 }} />
                    <Text style={styles.shareButtonText}>مشاركة الآية</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* Surah Selection Modal */}
      <Modal
        visible={showSurahModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSurahModal(false)}
      >
        <View style={styles.modalOverlay} />
        <View style={styles.selectionModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>اختر السورة</Text>
            <TouchableOpacity onPress={() => setShowSurahModal(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={22} color="#bfa76f" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.modalSearchInput}
            placeholder="بحث باسم أو رقم السورة..."
            placeholderTextColor="#bfa76f"
            value={modalSurahSearch}
            onChangeText={setModalSurahSearch}
            textAlign="right"
            autoFocus
          />
          <FlatList
            data={filteredSurahs}
            keyExtractor={item => item.number.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalSurahItem}
                onPress={() => handleSurahSelect(item)}
              >
                <Text style={styles.modalSurahNum}>{item.number}</Text>
                <View style={styles.modalSurahTextContainer}>
                  <Text style={styles.modalSurahName}>{item.name}</Text>
                  <Text style={styles.modalSurahEnglish}>{item.englishName}</Text>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={true}
            style={styles.modalSurahList}
          />
        </View>
      </Modal>
      {/* Ayah Selection Modal */}
      <Modal
        visible={showAyahModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAyahModal(false)}
      >
        <View style={styles.modalOverlay} />
        <View style={styles.selectionModal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAyahModal(false)} style={styles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#bfa76f" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>اختر رقم الآية {selectedSurahObj ? `(${selectedSurahObj.name})` : ''}</Text>
            <TouchableOpacity onPress={() => setShowAyahModal(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={22} color="#bfa76f" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={ayahNumbers}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalAyahItem}
                onPress={() => handleAyahSelect(item)}
              >
                <Text style={styles.modalAyahNum}>{item}</Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={true}
            style={styles.modalAyahList}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fdf6ec',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: screenHeight - 100,
  },
  card: {
    backgroundColor: 'rgba(255,249,239,0.98)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e0cfa9',
    paddingVertical: 24,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7c5c1e',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif',
    letterSpacing: 0.5,
    flex: 1,
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(191, 167, 111, 0.1)',
  },
  fieldGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#7c5c1e',
    alignSelf: 'flex-end',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e0cfa9',
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2c2c2c',
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif',
    textAlign: 'right',
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputDisabled: {
    backgroundColor: '#f8ecd4',
    color: '#bfa76f',
    borderColor: '#e0cfa9',
    opacity: 0.7,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c5c1e',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginVertical: 16,
    shadowColor: '#7c5c1e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 140,
  },
  buttonDisabled: {
    backgroundColor: '#bfa76f',
    opacity: 0.6,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0f0',
    borderColor: '#ffcccb',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  error: {
    color: '#b53a3a',
    fontSize: 14,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif',
    marginLeft: 8,
    flex: 1,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e0cfa9',
    padding: 20,
    marginTop: 20,
    width: '100%',
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8ecd4',
  },
  resultSurah: {
    fontSize: 16,
    color: '#7c5c1e',
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  resultNumber: {
    backgroundColor: '#7c5c1e',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 12,
  },
  resultNumberText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  ayahContainer: {
    backgroundColor: '#fdf6ec',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  resultAyah: {
    fontSize: 20,
    color: '#2c2c2c',
    fontFamily: Platform.OS === 'ios' ? 'Damascus' : 'serif',
    textAlign: 'right',
    lineHeight: 32,
    letterSpacing: 0.5,
  },
  tafsirContainer: {
    backgroundColor: '#f8ecd4',
    borderRadius: 12,
    padding: 12,
  },
  tafsirLabel: {
    fontSize: 14,
    color: '#7c5c1e',
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif',
  },
  resultTafsir: {
    fontSize: 14,
    color: '#5d4a1a',
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif',
    textAlign: 'right',
    lineHeight: 22,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 18,
    backgroundColor: '#f8ecd4',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: '#bfa76f',
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  shareButtonText: {
    color: '#7c5c1e',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  selectionModal: {
    position: 'absolute',
    top: 60,
    left: 18,
    right: 18,
    bottom: 40,
    backgroundColor: '#fff9ef',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e0cfa9',
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 20,
    padding: 0,
    zIndex: 2000,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8ecd4',
    backgroundColor: 'transparent',
  },
  modalTitle: {
    fontSize: 20,
    color: '#7c5c1e',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif',
    flex: 1,
    textAlign: 'center',
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(191, 167, 111, 0.08)',
  },
  modalBackBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(191, 167, 111, 0.08)',
    marginRight: 8,
  },
  modalSearchInput: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e0cfa9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2c2c2c',
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif',
    textAlign: 'right',
    margin: 18,
    marginBottom: 0,
  },
  modalSurahList: {
    flex: 1,
    marginTop: 8,
  },
  modalSurahItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f8ecd4',
  },
  modalSurahNum: {
    fontSize: 15,
    color: '#fff',
    backgroundColor: '#bfa76f',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 32,
    textAlign: 'center',
    marginLeft: 12,
    fontWeight: 'bold',
  },
  modalSurahTextContainer: {
    flex: 1,
  },
  modalSurahName: {
    fontSize: 16,
    color: '#2c2c2c',
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif',
    fontWeight: '600',
  },
  modalSurahEnglish: {
    fontSize: 13,
    color: '#7c5c1e',
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif',
    opacity: 0.8,
    marginTop: 2,
  },
  modalAyahList: {
    flex: 1,
    marginTop: 8,
  },
  modalAyahItem: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f8ecd4',
    alignItems: 'flex-end',
  },
  modalAyahNum: {
    fontSize: 18,
    color: '#7c5c1e',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif',
  },
});