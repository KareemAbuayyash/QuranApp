import React, { useState, useMemo, useRef } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Dimensions, Image } from 'react-native';
import surahJsonFiles from '../assets/source/surahJsonFiles';
import surahScreenStyles from '../styles/SurahScreenStyles';

const { width } = Dimensions.get('window');
const AYAHS_PER_PAGE = 15; // Adjust this number based on your preference

export default function SurahScreen({ route, navigation }) {
  const { number } = route.params;
  const surah = surahJsonFiles[number];
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef(null);

  // Extract ayahs as an array from the 'verse' object
  const ayahs = useMemo(() => {
    if (!surah || !surah.verse) return [];
    // Get keys like 'verse_1', 'verse_2', ... and sort numerically
    return Object.keys(surah.verse)
      .sort((a, b) => {
        const numA = parseInt(a.replace('verse_', ''));
        const numB = parseInt(b.replace('verse_', ''));
        return numA - numB;
      })
      .map((key, idx) => ({
        number: idx + 1,
        text: surah.verse[key],
      }));
  }, [surah]);

  // Split ayahs into pages
  const pages = useMemo(() => {
    if (!ayahs.length) return [];
    const totalPages = Math.ceil(ayahs.length / AYAHS_PER_PAGE);
    const pagesArray = [];
    for (let i = 0; i < totalPages; i++) {
      const startIndex = i * AYAHS_PER_PAGE;
      const endIndex = Math.min(startIndex + AYAHS_PER_PAGE, ayahs.length);
      pagesArray.push(ayahs.slice(startIndex, endIndex));
    }
    return pagesArray;
  }, [ayahs]);

  if (!surah) {
    return <Text style={surahScreenStyles.loading}>لم أجد بيانات السورة #{number}</Text>;
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
    <View style={surahScreenStyles.container}>
      <View style={surahScreenStyles.pageBackground}>
        {/* Full-width Surah Banner with Back Arrow on Left */}
        <View style={surahScreenStyles.fullWidthBanner}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={surahScreenStyles.fullWidthBackButton}>
            <Text style={surahScreenStyles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={surahScreenStyles.fullWidthSurahNameContainer}>
            <Text style={surahScreenStyles.surahNameHeader}>{surah.name}</Text>
          </View>
        </View>
        {/* Ayahs Content */}
        <ScrollView 
          ref={scrollViewRef}
          style={surahScreenStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            surahScreenStyles.scrollContent,
            { paddingBottom: showPagination ? 80 : 20 }
          ]}
        >
          {/* Basmala Image (scrolls with content) */}
          {currentPage === 0 && (
            <View style={surahScreenStyles.basmalaContainer}>
              <Image source={require('../assets/basmala.png')} style={surahScreenStyles.basmalaImage} resizeMode="contain" />
            </View>
          )}
          <View style={surahScreenStyles.ayahFrame}>
            <Text style={surahScreenStyles.paragraphText}>
              {currentAyahs.map((ayah, idx) => (
                <React.Fragment key={ayah.number}>
                  <Text style={surahScreenStyles.ayahText}>
                    {ayah.text}
                  </Text>
                  <Text style={surahScreenStyles.ayahNumber}>
                    {' ﴿'}
                    <Text style={surahScreenStyles.ayahNumberInner}>{ayah.number}</Text>
                    {'﴾ '}
                  </Text>
                  {idx !== currentAyahs.length - 1 && (
                    <Text style={surahScreenStyles.ayahSeparator}> </Text>
                  )}
                </React.Fragment>
              ))}
            </Text>
          </View>
        </ScrollView>

        {/* Pagination Controls */}
        {showPagination && (
          <View style={surahScreenStyles.paginationContainer}>
            <TouchableOpacity
              style={[
                surahScreenStyles.arrowButton,
                currentPage === totalPages - 1 && surahScreenStyles.arrowButtonDisabled
              ]}
              onPress={goToNextPage}
              disabled={currentPage === totalPages - 1}
            >
              <Text style={[
                surahScreenStyles.arrowText,
                currentPage === totalPages - 1 && surahScreenStyles.arrowTextDisabled
              ]}>
                ←
              </Text>
            </TouchableOpacity>

            <View style={surahScreenStyles.pageInfoContainer}>
              <Text style={surahScreenStyles.pageInfoText}>
                {currentPage + 1} من {totalPages}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                surahScreenStyles.arrowButton,
                currentPage === 0 && surahScreenStyles.arrowButtonDisabled
              ]}
              onPress={goToPrevPage}
              disabled={currentPage === 0}
            >
              <Text style={[
                surahScreenStyles.arrowText,
                currentPage === 0 && surahScreenStyles.arrowTextDisabled
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