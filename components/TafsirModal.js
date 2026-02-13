import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getAyahTafsir, TAFSIR_OPTIONS } from '../services/tafsirService';

const { width, height } = Dimensions.get('window');

export default function TafsirModal({ visible, onClose, surahNumber, ayahNumber, ayahText }) {
  const [tafsir, setTafsir] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTafsir, setSelectedTafsir] = useState('ar.muyassar');

  useEffect(() => {
    if (visible && surahNumber && ayahNumber) {
      loadTafsir();
    }
  }, [visible, surahNumber, ayahNumber, selectedTafsir]);

  const loadTafsir = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getAyahTafsir(surahNumber, ayahNumber, selectedTafsir);
      
      if (result.success) {
        setTafsir(result);
      } else {
        setError(result.error || 'فشل في تحميل التفسير');
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع');
      console.error('Error loading tafsir:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTafsirName = (id) => {
    const option = Object.values(TAFSIR_OPTIONS).find(opt => opt.id === id);
    return option ? option.name : 'التفسير الميسر';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              التفسير - الآية {ayahNumber}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Tafsir Selection */}
          <View style={styles.tafsirSelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Object.entries(TAFSIR_OPTIONS).map(([key, option]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.tafsirOption,
                    selectedTafsir === option.id && styles.tafsirOptionActive
                  ]}
                  onPress={() => setSelectedTafsir(option.id)}
                >
                  <Text style={[
                    styles.tafsirOptionText,
                    selectedTafsir === option.id && styles.tafsirOptionTextActive
                  ]}>
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Content */}
          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {/* Ayah Text */}
            {ayahText && (
              <View style={styles.ayahContainer}>
                <Text style={styles.ayahLabel}>نص الآية:</Text>
                <Text style={styles.ayahText}>{ayahText}</Text>
              </View>
            )}

            {/* Loading State */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#bfa76f" />
                <Text style={styles.loadingText}>جاري تحميل التفسير...</Text>
              </View>
            )}

            {/* Error State */}
            {error && !loading && (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={48} color="#d32f2f" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadTafsir}>
                  <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Tafsir Content */}
            {tafsir && !loading && !error && (
              <View style={styles.tafsirContainer}>
                <Text style={styles.tafsirLabel}>
                  {getTafsirName(selectedTafsir)}:
                </Text>
                <Text style={styles.tafsirText}>{tafsir.tafsirText}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#f5f5dc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.85,
    paddingBottom: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#7c5c1e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'right',
    flex: 1
  },
  closeButton: {
    padding: 5
  },
  tafsirSelector: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  tafsirOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  tafsirOptionActive: {
    backgroundColor: '#bfa76f',
    borderColor: '#bfa76f'
  },
  tafsirOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600'
  },
  tafsirOptionTextActive: {
    color: '#fff'
  },
  contentScroll: {
    flex: 1,
    paddingHorizontal: 20
  },
  ayahContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    borderRightWidth: 4,
    borderRightColor: '#bfa76f'
  },
  ayahLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7c5c1e',
    marginBottom: 10,
    textAlign: 'right'
  },
  ayahText: {
    fontSize: 22,
    lineHeight: 40,
    color: '#000',
    textAlign: 'right',
    fontFamily: 'serif'
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    textAlign: 'center'
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center'
  },
  retryButton: {
    backgroundColor: '#7c5c1e',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  tafsirContainer: {
    backgroundColor: '#fefef8',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#bfa76f'
  },
  tafsirLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#bfa76f',
    marginBottom: 15,
    textAlign: 'right'
  },
  tafsirText: {
    fontSize: 18,
    lineHeight: 32,
    color: '#333',
    textAlign: 'right'
  }
});
