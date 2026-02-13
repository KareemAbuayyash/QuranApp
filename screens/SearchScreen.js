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
  Share,
} from 'react-native';
import surahs from '../assets/quran/surahs';
import surahList from '../assets/quran/surah-list.json';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import searchScreenStyles from '../styles/SearchScreenStyles';
import normalizeArabicFull from '../components/normalizeArabicFull';
import TafsirModal from '../components/TafsirModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SearchScreen({ navigation }) {
  const scrollViewRef = useRef(null);
  const resultsYRef = useRef(0);
  const [shouldScrollToResults, setShouldScrollToResults] = useState(false);
  const [surahQuery, setSurahQuery] = useState('');
  const [ayahNumber, setAyahNumber] = useState('');
  const [ayahTextQuery, setAyahTextQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [showSurahModal, setShowSurahModal] = useState(false);
  const [showAyahModal, setShowAyahModal] = useState(false);
  const [modalSurahSearch, setModalSurahSearch] = useState('');
  const [selectedSurahObj, setSelectedSurahObj] = useState(null);
  const [ayahModalSearch, setAyahModalSearch] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [tafsirModalVisible, setTafsirModalVisible] = useState(false);
  const [selectedAyahForTafsir, setSelectedAyahForTafsir] = useState(null);

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
    const normalizedQuery = normalizeArabicFull(q);
    return ayahObjects.filter(
      a => a.number.toString().includes(q) || 
           (a.text && normalizeArabicFull(a.text).includes(normalizedQuery))
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
    setResults([]);

    const query = ayahTextQuery.trim();
    const hasSurah = selectedSurahObj !== null;
    const hasAyah = ayahNumber && ayahNumber !== '';

    // إذا لم يوجد نص بحث ولم يتم اختيار سورة أو آية، أظهر الخطأ
    if (!query && !hasSurah && !hasAyah) {
      setError('يرجى إدخال نص للبحث أو تحديد السورة/الآية.');
      return;
    }

    // إذا يوجد نص بحث، طبّق شرط الطول
    let normalizedQuery = '';
    if (query) {
      normalizedQuery = normalizeArabicFull(query);
      if (normalizedQuery.length < 2) {
        setError('يرجى إدخال كلمة أطول للبحث (حرفين على الأقل).');
        return;
      }
    }

    const foundResults = [];
    const searchInSurah = selectedSurahObj ? selectedSurahObj.number : null;
    const searchForAyah = ayahNumber ? parseInt(ayahNumber, 10) : null;

    // Search through all or specific surah
    const surahsToSearch = searchInSurah ? [searchInSurah] : Object.keys(surahs);

    surahsToSearch.forEach(surahNum => {
      const surah = surahs[surahNum];
      if (surah && surah.ayahs) {
        surah.ayahs.forEach(ayah => {
          // Filter by ayah number if specified
          if (searchForAyah && ayah.number !== searchForAyah) return;
          if (ayah.text) {
            const normalizedAyahText = normalizeArabicFull(ayah.text);
            if (normalizedAyahText.includes(normalizedQuery)) {
              foundResults.push({
                ...ayah,
                surahName: surah.name,
                surahNumber: surah.number,
                originalText: ayah.text,
                matchedQuery: query
              });
            }
          }
        });
      }
    });

    if (foundResults.length === 0) {
      let errorMsg = `لم يتم العثور على آيات تحتوي على "${query}"`;
      if (searchInSurah) errorMsg += ` في سورة ${selectedSurahObj.name}`;
      if (searchForAyah) errorMsg += ` رقم ${searchForAyah}`;
      errorMsg += '. جرب كلمات أخرى أو تأكد من الإملاء.';
      setError(errorMsg);
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
    setShouldScrollToResults(true);
  };

  const clearSearch = () => {
    setSurahQuery('');
    setAyahNumber('');
    setAyahTextQuery('');
    setSelectedSurahObj(null);
    setResults([]);
    setError('');
    setShowAdvancedOptions(false);
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
    // الزر مفعل إذا كان هناك نص بحث أو تم اختيار السورة أو رقم الآية
    return (
      ayahTextQuery.trim().length > 0 ||
      (selectedSurahObj !== null) ||
      (ayahNumber && ayahNumber !== '')
    );
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
      <View style={searchScreenStyles.actionButtonsContainer}>
        <TouchableOpacity 
          style={searchScreenStyles.actionButton} 
          onPress={() => {
            setSelectedAyahForTafsir({
              number: ayahData.number,
              text: ayahData.text,
              surahNumber: ayahData.surahNumber
            });
            setTafsirModalVisible(true);
          }} 
          activeOpacity={0.8}
        >
          <MaterialIcons name="menu-book" size={18} color="#7c5c1e" style={{ marginLeft: 6 }} />
          <Text style={searchScreenStyles.actionButtonText}>التفسير</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={searchScreenStyles.actionButton} 
          onPress={() => handleShare(ayahData)} 
          activeOpacity={0.8}
        >
          <Ionicons name="share-social-outline" size={18} color="#7c5c1e" style={{ marginLeft: 6 }} />
          <Text style={searchScreenStyles.actionButtonText}>مشاركة</Text>
        </TouchableOpacity>
      </View>
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
          ref={scrollViewRef}
          contentContainerStyle={searchScreenStyles.scrollContainer} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (shouldScrollToResults && scrollViewRef.current) {
              setTimeout(() => {
                scrollViewRef.current.scrollTo({
                  y: Math.max(resultsYRef.current - 10, 0),
                  animated: true,
                });
                setShouldScrollToResults(false);
              }, 50);
            }
          }}
        >
          <View style={searchScreenStyles.container}>
            <View style={searchScreenStyles.card}>
              <View style={searchScreenStyles.header}>
                <TouchableOpacity 
                  style={searchScreenStyles.backButton} 
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={22} color="#7c5c1e" />
                </TouchableOpacity>
                <Text style={searchScreenStyles.title}>بحث عن آية</Text>
                <TouchableOpacity 
                  style={searchScreenStyles.clearButton} 
                  onPress={clearSearch}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh-outline" size={22} color="#bfa76f" />
                </TouchableOpacity>
              </View>

              {/* Main Search Field */}
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

              {/* Advanced Options Toggle */}
              <TouchableOpacity
                style={searchScreenStyles.advancedToggle}
                onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={showAdvancedOptions ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#7c5c1e" 
                  style={{ marginLeft: 6 }}
                />
                <Text style={searchScreenStyles.advancedToggleText}>
                  خيارات متقدمة (اختياري)
                </Text>
              </TouchableOpacity>

              {/* Advanced Options */}
              {showAdvancedOptions && (
                <View style={searchScreenStyles.advancedContainer}>
                  <View style={searchScreenStyles.fieldGroup}>
                    <Text style={searchScreenStyles.label}>تحديد السورة</Text>
                    <TouchableOpacity
                      style={searchScreenStyles.input}
                      onPress={handleOpenSurahModal}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="chevron-down" size={18} color="#bfa76f" style={{ marginLeft: 0, marginRight: 8 }} />
                      <Text style={{ color: surahQuery ? '#2c2c2c' : '#bfa76f', fontSize: 16, textAlign: 'right', fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif', flex: 1 }}>
                        {surahQuery ? surahQuery : 'الكل (جميع السور)'}
                      </Text>
                    </TouchableOpacity>
                    {selectedSurahObj && (
                      <TouchableOpacity 
                        style={searchScreenStyles.clearFilterButton}
                        onPress={() => {
                          setSelectedSurahObj(null);
                          setSurahQuery('');
                          setAyahNumber('');
                        }}
                      >
                        <Ionicons name="close-circle" size={16} color="#bfa76f" />
                        <Text style={searchScreenStyles.clearFilterText}>إلغاء التحديد</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={searchScreenStyles.fieldGroup}>
                    <Text style={searchScreenStyles.label}>تحديد رقم الآية</Text>
                    <TouchableOpacity
                      style={[searchScreenStyles.input, !selectedSurahObj && searchScreenStyles.inputDisabled]}
                      onPress={selectedSurahObj ? handleOpenAyahModal : undefined}
                      activeOpacity={selectedSurahObj ? 0.8 : 1}
                      disabled={!selectedSurahObj}
                    >
                      <Ionicons name="chevron-down" size={18} color="#bfa76f" style={{ marginLeft: 0, marginRight: 8 }} />
                      <Text style={{ color: ayahNumber ? '#2c2c2c' : '#bfa76f', fontSize: 16, textAlign: 'right', fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'serif', flex: 1 }}>
                        {ayahNumber ? ayahNumber : selectedSurahObj ? 'الكل (جميع الآيات)' : 'اختر السورة أولاً'}
                      </Text>
                    </TouchableOpacity>
                    {ayahNumber && (
                      <TouchableOpacity 
                        style={searchScreenStyles.clearFilterButton}
                        onPress={() => setAyahNumber('')}
                      >
                        <Ionicons name="close-circle" size={16} color="#bfa76f" />
                        <Text style={searchScreenStyles.clearFilterText}>إلغاء التحديد</Text>
                      </TouchableOpacity>
                    )}
                  </View>
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

              {/* Search Results */}
              {results.length > 0 && (
                <View
                  style={searchScreenStyles.resultsContainer}
                  onLayout={e => {
                    resultsYRef.current = e.nativeEvent.layout.y;
                  }}
                >
                  <Text style={searchScreenStyles.resultsHeader}>
                    تم العثور على {results.length} آية
                  </Text>
                  {results.map((ayahData, index) => renderAyahResult(ayahData, index))}
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

      <TafsirModal
        visible={tafsirModalVisible}
        onClose={() => setTafsirModalVisible(false)}
        surahNumber={selectedAyahForTafsir?.surahNumber}
        ayahNumber={selectedAyahForTafsir?.number}
        ayahText={selectedAyahForTafsir?.text}
      />
    </SafeAreaView>
  );
}