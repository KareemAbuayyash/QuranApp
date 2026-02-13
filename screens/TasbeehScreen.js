// screens/TasbeehScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, Animated, ScrollView, Image, ImageBackground, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tasbeehScreenStyles from '../styles/TasbeehScreenStyles';
import { Ionicons } from '@expo/vector-icons';

export default function TasbeehScreen({ navigation }) {
  const [count, setCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState('اضغط على أحد الأذكار');
  const [showDhikrList, setShowDhikrList] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const dhikrList = [
    'سُبْحَانَ اللَّهِ',
    'الْحَمْدُ لِلَّهِ',
    'اللَّهُ أَكْبَرُ',
    'أَسْتَغْفِرُ اللَّهَ',
    'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    'لَا إِلَٰهَ إِلَّا اللَّهُ',
    'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    'لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ',
    'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
    'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
    'لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
    'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ',
    'اللَّهُمَّ أَجِرْنِي مِنَ النَّارِ',
  ];

  const handlePress = () => {
    setCount(count + 1);
    
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleReset = () => {
    Alert.alert(
      'تصفير العداد',
      'هل أنت متأكد من التصفير؟',
      [
        {
          text: 'إلغاء',
          style: 'cancel',
        },
        {
          text: 'تصفير',
          onPress: () => setCount(0),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleDhikrSelect = (dhikr) => {
    setSelectedDhikr(dhikr);
    setShowDhikrList(false);
  };

  return (
    <SafeAreaView style={tasbeehScreenStyles.safeArea}>
      <LinearGradient
        colors={["#fdf6ec", "#f8ecd4", "#e0cfa9"]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      
      {/* Header */}
      <View style={tasbeehScreenStyles.header}>
        <TouchableOpacity 
          style={tasbeehScreenStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-forward" size={24} color="#7c5c1e" />
        </TouchableOpacity>
        <Text style={tasbeehScreenStyles.headerTitle}>التسبيح الرقمي</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={tasbeehScreenStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dhikr Display Section */}
        <View style={tasbeehScreenStyles.dhikrContainer}>
          <TouchableOpacity 
            style={tasbeehScreenStyles.dhikrButton}
            onPress={() => setShowDhikrList(!showDhikrList)}
          >
            <Text style={tasbeehScreenStyles.dhikrText}>{selectedDhikr}</Text>
            <Ionicons name="create-outline" size={24} color="#bfa76f" />
          </TouchableOpacity>
        </View>

        {/* Dhikr List */}
        {showDhikrList && (
          <View style={tasbeehScreenStyles.dhikrListContainer}>
            <Text style={tasbeehScreenStyles.dhikrListTitle}>حدد ذكر</Text>
            <ScrollView 
              style={tasbeehScreenStyles.dhikrList}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {dhikrList.map((dhikr, index) => (
                <TouchableOpacity
                  key={index}
                  style={tasbeehScreenStyles.dhikrListItem}
                  onPress={() => handleDhikrSelect(dhikr)}
                >
                  <Text style={tasbeehScreenStyles.dhikrListItemText}>{dhikr}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Digital Tasbeeh with Image */}
        <View style={tasbeehScreenStyles.tasbeehImageContainer}>
          <Image 
            source={require('../assets/tasbeeh.png')} 
            style={tasbeehScreenStyles.tasbeehImage}
            resizeMode="contain"
          />
          
          {/* Display Number Overlay */}
          <View style={tasbeehScreenStyles.displayOverlay}>
            <Text style={tasbeehScreenStyles.displayNumber}>{count}</Text>
          </View>
          
          {/* Count Button Overlay */}
          <Animated.View style={[tasbeehScreenStyles.countButtonOverlay, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity 
              style={tasbeehScreenStyles.countButton}
              onPress={handlePress}
              activeOpacity={0.7}
            />
          </Animated.View>
          
          {/* Reset Button Overlay */}
          <TouchableOpacity 
            style={tasbeehScreenStyles.resetButtonOverlay}
            onPress={handleReset}
            activeOpacity={0.7}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
