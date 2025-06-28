// screens/SearchScreen.js
import React, { useState, useMemo, useRef } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
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
import searchScreenStyles from '../styles/SearchScreenStyles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced Arabic text normalization function
const normalizeArabicText = (text) => {
  if (!text) return '';
  
  let normalized = text;
  
  // Remove all Arabic diacritics and marks
  normalized = normalized.replace(/[\u064B-\u065F]/g, ''); // Standard diacritics
  normalized = normalized.replace(/[\u0670]/g, ''); // Superscript Alef
  normalized = normalized.replace(/[\u06D6-\u06ED]/g, ''); // Quranic marks
  normalized = normalized.replace(/[\u06DC-\u06E4]/g, ''); // Additional marks
  normalized = normalized.replace(/[\u06E7-\u06E8]/g, ''); // More marks
  normalized = normalized.replace(/[\u06EA-\u06ED]/g, ''); // Extended marks
  normalized = normalized.replace(/[\u08F0-\u08FF]/g, ''); // Extended Arabic marks
  
  // Normalize letter forms
  const letterMappings = {
    // Alef variations
    'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا',
    // Ya variations  
    'ى': 'ي', 'ئ': 'ي',
    // Ta Marbuta
    'ة': 'ه',
    // Hamza variations
    'ؤ': 'و',
    'ء': '', // Remove standalone hamza for better matching
    // Remove Tatweel (kashida)
    'ـ': ''
  };
  
  // Apply letter mappings
  for (const [original, replacement] of Object.entries(letterMappings)) {
    normalized = normalized.replace(new RegExp(original, 'g'), replacement);
  }
  
  // Clean up and normalize
  return normalized
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .toLowerCase();
};

export default function SearchScreen() {
  const [surahQuery, setSurahQuery] = useState('');
  const [ayahNumber, setAyahNumber] = useState('');
  const [ayahTextQuery, setAyahTextQuery] = useState(''); // New field for text search
  const [result, setResult] = useState(null);
  const [results, setResults] = useState([]); // For multiple results when searching by text
  const [error, setError] = useState('');
  const [showSurahModal, setShowSurahModal] = useState(false);
  const [showAyahModal, setShowAyahModal] = useState(false);
  const [modalSurahSearch, setModalSurahSearch] = useState('');
  const [selectedSurahObj, setSelectedSurahObj] = useState(null);
  const [ayahModalSearch, setAyahModalSearch] = useState('');
  const [searchMode, setSearchMode] = useState('specific'); // 'specific' or 'text'

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

  // Generate ayah objects for selected surah
  const ayahObjects = useMemo(() => {
    if (selectedSurahObj && surahs[selectedSurahObj.number]) {
      return surahs[selectedSurahObj.number].ayahs;
    }
    return [];
  }, [selectedSurahObj]);

  // Filter ayahs for modal search
  const filteredAyahs = useMemo(() => {
    const q = ayahModalSearch.trim();
    if (!q) return ayahObjects;
    const normalizedQuery = normalizeArabicText(q);
    return ayahObjects.filter(
      a => a.number.toString().includes(q) || 
           (a.text && normalizeArabicText(a.text).includes(normalizedQuery))
    );
  }, [ayahModalSearch, ayahObjects]);

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
    setAyahNumber(ayahNum.toString());
    setShowAyahModal(false);
    setAyahModalSearch('');
  };

  const handleSearch = () => {
    setError('');
    setResult(null);
    setResults([]);

    // If searching by text
    if (searchMode === 'text' && ayahTextQuery.trim()) {
      const query = ayahTextQuery.trim();
      const normalizedQuery = normalizeArabicText(query);
      const foundResults = [];

      // If query is too short, require at least 2 characters
      if (normalizedQuery.length < 2) {
        setError('يرجى إدخال كلمة أطول للبحث (حرفين على الأقل).');
        return;
      }

      // Search through all surahs
      Object.keys(surahs).forEach(surahNum => {
        const surah = surahs[surahNum];
        if (surah && surah.ayahs) {
          surah.ayahs.forEach(ayah => {
            if (ayah.text) {
              const normalizedAyahText = normalizeArabicText(ayah.text);
              
              // Check if the normalized query exists in the normalized ayah text
              if (normalizedAyahText.includes(normalizedQuery)) {
                foundResults.push({
                  ...ayah,
                  surahName: surah.name,
                  surahNumber: surah.number,
                  // Add highlighting info for display
                  originalText: ayah.text,
                  matchedQuery: query
                });
              }
            }
          });
        }
      });

      if (foundResults.length === 0) {
        setError(`لم يتم العثور على آيات تحتوي على "${query}". جرب كلمات أخرى أو تأكد من الإملاء.`);
        return;
      }

      // Sort results by surah number and ayah number
      foundResults.sort((a, b) => {
        if (a.surahNumber !== b.surahNumber) {
          return a.surahNumber - b.surahNumber;
        }
        return a.number - b.number;
      });

      setResults(foundResults);
      return;
    }

    // Original specific search logic
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
    setAyahTextQuery('');
    setSelectedSurahObj(null);
    setResult(null);
    setResults([]);
    setError('');
  };

  const handleShare = async (ayahData) => {
    if (!ayahData) return;
    try {
      await Share.share({
        message: `سورة ${ayahData.surahName} - الآية ${ayahData.number}:\n${ayahData.text}`
      });
    } catch (e) {}
  };

  const isSearchEnabled = () => {
    if (searchMode === 'text') {
      return ayahTextQuery.trim().length > 0;
    }
    return surahQuery && ayahNumber;
  };

  const renderAyahResult = (ayahData, index = 0) => (
    <View key={`${ayahData.surahNumber}-${ayahData.number}`} style={searchScreenStyles.resultCard}>
      <View style={searchScreenStyles.resultHeader}>
        <Text style={searchScreenStyles.resultSurah}>
          سورة {ayahData.surahName} - الآية {ayahData.number}
        </Text>
        <View style={searchScreenStyles.resultNumber}>
          <Text style={searchScreenStyles.resultNumberText}>{ayahData.surahNumber}</Text>
        </View>
      </View>
      <View style={searchScreenStyles.ayahContainer}>
        <Text style={searchScreenStyles.resultAyah} selectable>
          {ayahData.text}
        </Text>
      </View>
      {ayahData.tafsir && (
        <View style={searchScreenStyles.tafsirContainer}>
          <Text style={searchScreenStyles.tafsirLabel}>التفسير:</Text>
          <Text style={searchScreenStyles.resultTafsir}>{ayahData.tafsir}</Text>
        </View>
      )}
      <TouchableOpacity 
        style={searchScreenStyles.shareButton} 
        onPress={() => handleShare(ayahData)} 
        activeOpacity={0.8}
      >
        <Ionicons name="share-social-outline" size={18} color="#7c5c1e" style={{ marginLeft: 6 }} />
        <Text style={searchScreenStyles.shareButtonText}>مشاركة الآية</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={searchScreenStyles.safeArea}>
      <LinearGradient
        colors={["#fdf6ec", "#f8ecd4", "#e0cfa9"]}
        style={searchScreenStyles.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <KeyboardAvoidingView 
        style={searchScreenStyles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={searchScreenStyles.scrollContainer} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={searchScreenStyles.container}>
            <View style={searchScreenStyles.card}>
              <View style={searchScreenStyles.header}>
                <Text style={searchScreenStyles.title}>بحث عن آية</Text>
                <TouchableOpacity 
                  style={searchScreenStyles.clearButton} 
                  onPress={clearSearch}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh-outline" size={20} color="#bfa76f" />
                </TouchableOpacity>
              </View>

              {/* Search Mode Toggle */}
              <View style={searchScreenStyles.toggleContainer}>
                <TouchableOpacity
                  style={[searchScreenStyles.toggleButton, searchMode === 'specific' && searchScreenStyles.toggleButtonActive]}
                  onPress={() => setSearchMode('specific')}
                  activeOpacity={0.8}
                >
                  <Text style={[searchScreenStyles.toggleButtonText, searchMode === 'specific' && searchScreenStyles.toggleButtonTextActive]}>
                    بحث محدد
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[searchScreenStyles.toggleButton, searchMode === 'text' && searchScreenStyles.toggleButtonActive]}
                  onPress={() => setSearchMode('text')}
                  activeOpacity={0.8}
                >
                  <Text style={[searchScreenStyles.toggleButtonText, searchMode === 'text' && searchScreenStyles.toggleButtonTextActive]}>
                    بحث في النص
                  </Text>
                </TouchableOpacity>
              </View>

              {searchMode === 'specific' ? (
                <>
                  <View style={searchScreenStyles.fieldGroup}>
                    <Text style={searchScreenStyles.label}>اسم السورة</Text>
                    <TouchableOpacity
                      style={searchScreenStyles.input}
                      onPress={handleOpenSurahModal}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="chevron-down" size={18} color="#bfa76f" style={{ marginLeft: 0, marginRight: 8 }} />
                      <Text style={{ color: surahQuery ? '#2c2c2c' : '#bfa76f', fontSize: 16, textAlign: 'right', fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif', flex: 1 }}>
                        {surahQuery ? surahQuery : 'اختر السورة...'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={searchScreenStyles.fieldGroup}>
                    <Text style={searchScreenStyles.label}>رقم الآية</Text>
                    <TouchableOpacity
                      style={[searchScreenStyles.input, !selectedSurahObj && searchScreenStyles.inputDisabled]}
                      onPress={selectedSurahObj ? handleOpenAyahModal : undefined}
                      activeOpacity={selectedSurahObj ? 0.8 : 1}
                      disabled={!selectedSurahObj}
                    >
                      <Ionicons name="chevron-down" size={18} color="#bfa76f" style={{ marginLeft: 0, marginRight: 8 }} />
                      <Text style={{ color: ayahNumber ? '#2c2c2c' : '#bfa76f', fontSize: 16, textAlign: 'right', fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif', flex: 1 }}>
                        {ayahNumber ? ayahNumber : selectedSurahObj ? 'اختر رقم الآية...' : 'اختر السورة أولاً'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={searchScreenStyles.fieldGroup}>
                  <Text style={searchScreenStyles.label}>ابحث في نص الآيات</Text>
                  <TextInput
                    style={searchScreenStyles.textInput}
                    placeholder="أدخل كلمة أو جملة للبحث (مثال: اعوذ، الصلاة، الله)"
                    placeholderTextColor="#bfa76f"
                    value={ayahTextQuery}
                    onChangeText={setAyahTextQuery}
                    textAlign="right"
                    multiline={false}
                    returnKeyType="search"
                    onSubmitEditing={handleSearch}
                  />
                  <Text style={searchScreenStyles.searchHint}>
                    💡 البحث يتجاهل الحركات التشكيلية والهمزات المختلفة
                  </Text>
                </View>
              )}

              <TouchableOpacity 
                style={[searchScreenStyles.button, !isSearchEnabled() && searchScreenStyles.buttonDisabled]} 
                onPress={handleSearch} 
                activeOpacity={0.8}
                disabled={!isSearchEnabled()}
              >
                <Ionicons name="search" size={20} color="#fff9ef" style={searchScreenStyles.buttonIcon} />
                <Text style={searchScreenStyles.buttonText}>بحث</Text>
              </TouchableOpacity>

              {error ? (
                <View style={searchScreenStyles.errorContainer}>
                  <Ionicons name="warning-outline" size={20} color="#b53a3a" />
                  <Text style={searchScreenStyles.error}>{error}</Text>
                </View>
              ) : null}

              {/* Results for text search */}
              {results.length > 0 && (
                <View style={searchScreenStyles.resultsContainer}>
                  <Text style={searchScreenStyles.resultsHeader}>
                    تم العثور على {results.length} آية
                  </Text>
                  {results.slice(0, 10).map((ayahData, index) => renderAyahResult(ayahData, index))}
                  {results.length > 10 && (
                    <Text style={searchScreenStyles.moreResultsText}>
                      وعدد {results.length - 10} آية أخرى...
                    </Text>
                  )}
                </View>
              )}

              {/* Single result for specific search */}
              {result && renderAyahResult(result)}
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
        <View style={searchScreenStyles.modalOverlay} />
        <View style={searchScreenStyles.selectionModal}>
          <View style={searchScreenStyles.modalHeader}>
            <Text style={searchScreenStyles.modalTitle}>اختر السورة</Text>
            <TouchableOpacity onPress={() => setShowSurahModal(false)} style={searchScreenStyles.modalCloseBtn}>
              <Ionicons name="close" size={22} color="#bfa76f" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={searchScreenStyles.modalSearchInput}
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
                style={searchScreenStyles.modalSurahItem}
                onPress={() => handleSurahSelect(item)}
              >
                <Text style={searchScreenStyles.modalSurahNum}>{item.number}</Text>
                <View style={searchScreenStyles.modalSurahTextContainer}>
                  <Text style={searchScreenStyles.modalSurahName}>{item.name}</Text>
                  <Text style={searchScreenStyles.modalSurahEnglish}>{item.englishName}</Text>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={true}
            style={searchScreenStyles.modalSurahList}
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
        <View style={searchScreenStyles.modalOverlay} />
        <View style={searchScreenStyles.selectionModal}>
          <View style={searchScreenStyles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAyahModal(false)} style={searchScreenStyles.modalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="#bfa76f" />
            </TouchableOpacity>
            <Text style={searchScreenStyles.modalTitle}>اختر رقم الآية {selectedSurahObj ? `(${selectedSurahObj.name})` : ''}</Text>
            <TouchableOpacity onPress={() => setShowAyahModal(false)} style={searchScreenStyles.modalCloseBtn}>
              <Ionicons name="close" size={22} color="#bfa76f" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={searchScreenStyles.modalSearchInput}
            placeholder="بحث برقم أو نص الآية..."
            placeholderTextColor="#bfa76f"
            value={ayahModalSearch}
            onChangeText={setAyahModalSearch}
            textAlign="right"
            autoFocus
          />
          <FlatList
            data={filteredAyahs}
            keyExtractor={item => item.number.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={searchScreenStyles.modalAyahItem}
                onPress={() => handleAyahSelect(item.number)}
              >
                <View style={searchScreenStyles.modalAyahRow}>
                  <Text style={searchScreenStyles.modalAyahNum}>{item.number}</Text>
                  <Text style={searchScreenStyles.modalAyahText}>{item.text}</Text>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={true}
            style={searchScreenStyles.modalAyahList}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}