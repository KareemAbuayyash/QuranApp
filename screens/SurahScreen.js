import React, { useState, useMemo, useRef } from 'react';
import { ScrollView, Text, View, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import surahs from '../assets/quran/surahs';

const { width } = Dimensions.get('window');
const AYAHS_PER_PAGE = 15; // Adjust this number based on your preference

export default function SurahScreen({ route, navigation }) {
  const { number } = route.params;
  const surah = surahs[number];
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef(null);

  // Split ayahs into pages
  const pages = useMemo(() => {
    if (!surah || !surah.ayahs) return [];
    
    const totalPages = Math.ceil(surah.ayahs.length / AYAHS_PER_PAGE);
    const pagesArray = [];
    
    for (let i = 0; i < totalPages; i++) {
      const startIndex = i * AYAHS_PER_PAGE;
      const endIndex = Math.min(startIndex + AYAHS_PER_PAGE, surah.ayahs.length);
      pagesArray.push(surah.ayahs.slice(startIndex, endIndex));
    }
    
    return pagesArray;
  }, [surah]);

  if (!surah) {
    return <Text style={styles.loading}>لم أجد بيانات السورة #{number}</Text>;
  }

  const totalPages = pages.length;
  const showPagination = totalPages > 1;

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 0);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 0);
    }
  };

  const currentAyahs = pages[currentPage] || [];

  return (
    <View style={styles.container}>
      <View style={styles.pageBackground}>
        {/* Full-width Surah Banner with Back Arrow on Left */}
        <View style={styles.fullWidthBanner}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.fullWidthBackButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.fullWidthSurahNameContainer}>
            <Text style={styles.surahNameHeader}>{surah.name}</Text>
          </View>
        </View>
        {/* Ayahs Content */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: showPagination ? 80 : 20 }
          ]}
        >
          {/* Basmala Image (scrolls with content) */}
          {currentPage === 0 && (
            <View style={styles.basmalaContainer}>
              <Image source={require('../assets/basmala.png')} style={styles.basmalaImage} resizeMode="contain" />
            </View>
          )}
          <View style={styles.ayahFrame}>
            <Text style={styles.paragraphText}>
              {currentAyahs.map((ayah, idx) => (
                <React.Fragment key={ayah.number}>
                  <Text style={styles.ayahText}>
                    {ayah.text}
                  </Text>
                  <Text style={styles.ayahNumber}>
                    {' ﴿'}
                    <Text style={styles.ayahNumberInner}>{ayah.number}</Text>
                    {'﴾ '}
                  </Text>
                  {idx !== currentAyahs.length - 1 && (
                    <Text style={styles.ayahSeparator}> </Text>
                  )}
                </React.Fragment>
              ))}
            </Text>
          </View>
        </ScrollView>

        {/* Pagination Controls */}
        {showPagination && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[
                styles.arrowButton,
                currentPage === totalPages - 1 && styles.arrowButtonDisabled
              ]}
              onPress={goToNextPage}
              disabled={currentPage === totalPages - 1}
            >
              <Text style={[
                styles.arrowText,
                currentPage === totalPages - 1 && styles.arrowTextDisabled
              ]}>
                ←
              </Text>
            </TouchableOpacity>

            <View style={styles.pageInfoContainer}>
              <Text style={styles.pageInfoText}>
                {currentPage + 1} من {totalPages}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.arrowButton,
                currentPage === 0 && styles.arrowButtonDisabled
              ]}
              onPress={goToPrevPage}
              disabled={currentPage === 0}
            >
              <Text style={[
                styles.arrowText,
                currentPage === 0 && styles.arrowTextDisabled
              ]}>
                →
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#666',
  },
  pageBackground: {
    flex: 1,
    backgroundColor: '#fdf6ec',
    paddingTop: 24,
    paddingBottom: 12,
  },
  surahBanner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8ecd4',
    borderColor: '#bfa76f',
    borderWidth: 2,
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 18,
    paddingVertical: 6,
    paddingHorizontal: 24,
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  surahName: {
    fontSize: 24,
    color: '#7c5c1e',
    fontWeight: 'bold',
    fontFamily: 'Cochin',
    letterSpacing: 1,
    textAlign: 'center',
  },
  pageIndicator: {
    fontSize: 14,
    color: '#7c5c1e',
    marginTop: 4,
    opacity: 0.8,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  ayahFrame: {
    backgroundColor: '#fff9ef',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#e0cfa9',
    padding: 20,
    marginHorizontal: 16,
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 6,
  },
  paragraphText: {
    textAlign: 'right',
    lineHeight: 40,
    fontSize: 24,
    fontFamily: 'Cochin',
  },
  ayahText: {
    color: '#2c2c2c',
    fontSize: 24,
    lineHeight: 40,
  },
  ayahNumber: {
    color: '#bfa76f',
    fontSize: 20,
    fontWeight: 'bold',
  },
  ayahNumberInner: {
    fontSize: 18,
  },
  ayahSeparator: {
    fontSize: 24,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fdf6ec',
    borderTopWidth: 1,
    borderTopColor: '#e0cfa9',
    
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8ecd4',
    borderColor: '#bfa76f',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    
  },
  arrowButtonDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
  },
  arrowText: {
    color: '#7c5c1e',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: -13,
  },
  arrowTextDisabled: {
    color: '#999',
    
  },
  pageInfoContainer: {
    alignItems: 'center',
  },
  pageInfoText: {
    color: '#7c5c1e',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Cochin',
  },
  basmalaContainer: {
    alignItems: 'center',
    marginVertical: 18,
  },
  basmalaImage: {
    width: '80%',
    height: 40,
    maxWidth: 400,
  },
  customHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    // Removed - no longer needed
  },
  backArrow: {
    fontSize: 24,
    color: '#7c5c1e',
    fontWeight: 'bold',
    marginRight: 12,
  },
  surahBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8ecd4',
    borderColor: '#bfa76f',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 24,
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  surahNameHeader: {
    fontSize: 24,
    color: '#7c5c1e',
    fontWeight: 'bold',
    fontFamily: 'Cochin',
    letterSpacing: 1,
    textAlign: 'center',
  },
  fullWidthBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8ecd4',
    borderColor: '#bfa76f',
    borderWidth: 2,
    borderRadius: 16,
    marginTop: 30,
    marginBottom: 16,
    marginStart: 10,
    marginEnd: 10,
    paddingVertical: 8,
    shadowColor: '#bfa76f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  fullWidthBackButton: {
    position: 'absolute',
    left: 16,
    zIndex: 2,
    padding: 8,
    marginTop: -9,
  },
  fullWidthSurahNameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});