import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Modal, Image, ActivityIndicator, Alert, TextInput, 
  KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { analyzeFoodImage, type ScanResult } from '../services/geminiService';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────
// CAT IMAGES 
// ─────────────────────────────────────────────
const CAT_IMAGES: Record<number, any> = {
  0:   require('../assets/cat_0.png'),
  25:  require('../assets/cat_25.png'),
  50:  require('../assets/cat_50.png'),
  75:  require('../assets/cat_75.png'),
  100: require('../assets/cat_100.png'),
};

function getCatStage(pct: number) {
  if (pct >= 100) return 100;
  if (pct >= 75) return 75;
  if (pct >= 50) return 50;
  if (pct >= 25) return 25;
  return 0;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function formatDate(date: Date) {
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
  const dayLabel = isToday
    ? 'TODAY'
    : date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  return `${dayLabel}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

export default function HomeScreen() {
  // --- State ---
  const [goalSet, setGoalSet] = useState(false);
  const [goalInput, setGoalInput] = useState('2200');
  const [calorieGoal, setCalorieGoal] = useState(2200);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [activeDate, setActiveDate] = useState(new Date());

  // Modal / scanner state
  const [modalVisible, setModalVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Ring math
  const SIZE = 150;
  const STROKE = 11;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = RADIUS * 2 * Math.PI;
  const progress = calorieGoal > 0 ? Math.min(caloriesConsumed / calorieGoal, 1) : 0;
  const dashOffset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

  // Cat
  const pct = Math.round(progress * 100);
  const stage = getCatStage(pct);
  const catSrc = CAT_IMAGES[stage];

  const handleSetGoal = () => {
    const parsed = parseInt(goalInput, 10);
    if (!parsed || parsed < 500 || parsed > 10000) {
      Alert.alert('Invalid Goal', 'Please enter a calorie goal between 500 and 10,000 kcal.');
      return;
    }
    setCalorieGoal(parsed);
    setGoalSet(true);
  };

  const analyzeImageWithAI = async (base64Image: string) => {
    setScanning(true);
    setScanResult(null);
    try {
      const result = await analyzeFoodImage(base64Image);
      setScanResult(result);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not analyze image.');
    } finally {
      setScanning(false);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to scan meals.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled && result.assets[0].base64) {
      setCapturedImage(result.assets[0].uri);
      setModalVisible(false);
      setScannerVisible(true);
      await analyzeImageWithAI(result.assets[0].base64);
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery access is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled && result.assets[0].base64) {
      setCapturedImage(result.assets[0].uri);
      setModalVisible(false);
      setScannerVisible(true);
      await analyzeImageWithAI(result.assets[0].base64);
    }
  };

  const logMeal = () => {
    if (scanResult && scanResult.calories > 0) {
      setCaloriesConsumed(prev => prev + scanResult.calories);
    }
    resetScanner();
  };

  const resetScanner = () => {
    setScannerVisible(false);
    setCapturedImage(null);
    setScanResult(null);
    setScanning(false);
  };

  if (!goalSet) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <LinearGradient colors={['#1a1a1a', '#121212']} style={styles.setupScreen}>
          <Text style={styles.setupTitle}>Set Your Daily{'\n'}Calorie Goal</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.calorieInput}
              placeholder="e.g. 2200"
              placeholderTextColor="rgba(255,255,255,0.2)"
              keyboardType="numeric"
              value={goalInput}
              onChangeText={setGoalInput}
              maxLength={5}
              onSubmitEditing={handleSetGoal}
            />
          </View>
          <TouchableOpacity onPress={handleSetGoal} activeOpacity={0.85}>
            <LinearGradient colors={['#FF7F50', '#F08080']} style={styles.setupBtn}>
              <Text style={styles.setupBtnText}>LET'S GO</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#ffffff', '#ffe8e0', '#ffcbb5']} style={styles.header}>
          <Text style={styles.appTitle}>NutriCat</Text>
          <View style={styles.circleRow}>
            <View style={styles.sideStat}>
              <Text style={styles.sideVal}>{caloriesConsumed}</Text>
              <Text style={styles.sideLbl}>EATEN</Text>
            </View>

            <View style={styles.ringWrap}>
              <Svg width={SIZE} height={SIZE}>
                <Circle cx={SIZE/2} cy={SIZE/2} r={RADIUS} fill="none" stroke="rgba(255,127,80,0.12)" strokeWidth={STROKE} />
                <Circle
                  cx={SIZE/2} cy={SIZE/2} r={RADIUS} fill="none" stroke="#FF7F50" strokeWidth={STROKE}
                  strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset}
                  strokeLinecap="round" rotation="-90" origin={`${SIZE/2}, ${SIZE/2}`}
                />
              </Svg>
              <View style={styles.ringInner}>
                {catSrc ? <Image source={catSrc} style={styles.catImg} /> : <Text style={styles.catPlaceholderTxt}>CAT {stage}%</Text>}
                <Text style={styles.kcalNum}>{caloriesConsumed}</Text>
                <Text style={styles.kcalSub}>of {calorieGoal} kcal</Text>
              </View>
            </View>

            <View style={styles.sideStat}>
              <TouchableOpacity onPress={() => setGoalSet(false)}><Text style={styles.sideVal}>⚙️</Text></TouchableOpacity>
              <Text style={styles.sideLbl}>GOAL</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Date Switcher */}
        <View style={styles.dateSwitcher}>
          <TouchableOpacity onPress={() => {}}><Text style={styles.dateArrowTxt}>‹</Text></TouchableOpacity>
          <Text style={styles.dateLabel}>{formatDate(activeDate)}</Text>
          <TouchableOpacity onPress={() => {}}><Text style={styles.dateArrowTxt}>›</Text></TouchableOpacity>
        </View>

        {/* Macros View */}
        <View style={styles.macrosRow}>
            {/* Logic for protein/carbs/fats labels here */}
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}><Text style={styles.navActive}>Diary</Text></TouchableOpacity>
        <TouchableOpacity style={styles.plusWrap} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#FF7F50', '#F08080']} style={styles.plusBtn}>
            <Text style={styles.plusTxt}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Text style={styles.navInactive}>Goals</Text></TouchableOpacity>
      </View>

      {/* Modals for Scanning (same logic from main) */}
      {/* ... Add Scan result and Select modals here using the combined styles ... */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  scroll: { flex: 1 },
  setupScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  setupTitle: { color: '#fff', fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  calorieInput: { backgroundColor: '#1E1E1E', color: '#fff', fontSize: 42, textAlign: 'center', borderRadius: 24, padding: 20, width: width - 80 },
  setupBtn: { borderRadius: 22, paddingVertical: 15, paddingHorizontal: 40, marginTop: 20 },
  setupBtnText: { color: '#fff', fontWeight: '900' },
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center' },
  appTitle: { fontSize: 18, fontWeight: '700', color: '#d9522a', marginBottom: 14 },
  circleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  sideStat: { width: 55, alignItems: 'center' },
  sideVal: { fontSize: 20, fontWeight: '800' },
  sideLbl: { fontSize: 10, color: '#aaa' },
  ringWrap: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  ringInner: { position: 'absolute', alignItems: 'center' },
  catImg: { width: 72, height: 72, resizeMode: 'contain' },
  kcalNum: { fontSize: 22, fontWeight: '900', marginTop: 4 },
  kcalSub: { fontSize: 10, color: '#bbb' },
  dateSwitcher: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, backgroundColor: '#fff' },
  dateLabel: { fontSize: 12, fontWeight: '700' },
  dateArrowTxt: { fontSize: 22, color: '#ccc' },
  bottomNav: { flexDirection: 'row', backgroundColor: '#fff', height: 80, alignItems: 'center', borderTopWidth: 0.5, borderTopColor: '#f0f0f0' },
  navItem: { flex: 1, alignItems: 'center' },
  navActive: { color: '#FF7F50', fontWeight: '700' },
  navInactive: { color: '#ccc', fontWeight: '700' },
  plusWrap: { bottom: 20 },
  plusBtn: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  plusTxt: { color: '#fff', fontSize: 32 },
  // Add other scan-specific styles here...
});