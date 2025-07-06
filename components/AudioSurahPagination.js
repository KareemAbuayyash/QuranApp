import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const AudioSurahPagination = ({ currentPage, totalPages, onNext, onPrev, styles }) => (
  <View style={styles.paginationContainer}>
    <TouchableOpacity
      style={[
        styles.arrowButton,
        currentPage === totalPages - 1 && styles.arrowButtonDisabled,
      ]}
      onPress={onNext}
      disabled={currentPage === totalPages - 1}
    >
      <Text
        style={[
          styles.arrowText,
          currentPage === totalPages - 1 && styles.arrowTextDisabled,
        ]}
      >
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
        currentPage === 0 && styles.arrowButtonDisabled,
      ]}
      onPress={onPrev}
      disabled={currentPage === 0}
    >
      <Text
        style={[
          styles.arrowText,
          currentPage === 0 && styles.arrowTextDisabled,
        ]}
      >
        →
      </Text>
    </TouchableOpacity>
  </View>
);

export default AudioSurahPagination; 