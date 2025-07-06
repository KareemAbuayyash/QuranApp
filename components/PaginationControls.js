import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import surahScreenStyles from '../styles/SurahScreenStyles';

const PaginationControls = ({ currentPage, totalPages, onNext, onPrev }) => (
  <View style={surahScreenStyles.paginationContainer}>
    <TouchableOpacity
      style={[
        surahScreenStyles.arrowButton,
        currentPage === totalPages - 1 && surahScreenStyles.arrowButtonDisabled
      ]}
      onPress={onNext}
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
      onPress={onPrev}
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
);

export default PaginationControls; 