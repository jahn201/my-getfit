import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Modal, Image, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { analyzeFoodImage, type ScanResult } from '../services/geminiService';

const { width } = Dimensions.get('window');


export default function HomeScreen() {
  // Calorie goal setup
  const [goalSet, setGoalSet] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [calorieGoal, setCalorieGoal] = useState(0);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);

  // Modal / scanner state
  const [modalVisible, setModalVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Calorie ring
  const size = 240;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = calorieGoal > 0 ? Math.min(caloriesConsumed / calorieGoal, 1) : 0;
  const strokeDashoffset = circumference - progress * circumference;

  const handleSetGoal = () => {
    const parsed = parseInt(goalInput, 10);
    if (!parsed || parsed < 500 || parsed > 10000) {
      Alert.alert('Invalid Goal', 'Please enter a calorie goal between 500 and 10,000 kcal.');
      return;
    }
    setCalorieGoal(parsed);
    setGoalSet(true);
  };

  // ─── Image handler: calls the AI service and updates state ──────────────────
  const analyzeImageWithAI = async (base64Image: string) => {
    setScanning(true);
    setScanResult(null);
    try {
      const result = await analyzeFoodImage(base64Image);
      setScanResult(result);
    } catch (err: any) {
      console.error('Home: analyzeImageWithAI error', err);
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

  // --- CALORIE GOAL SETUP SCREEN ---
  if (!goalSet) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <LinearGradient colors={['#1a1a1a', '#121212']} style={styles.setupScreen}>
          <Text style={styles.setupTitle}>Set Your Daily{'\n'}Calorie Goal</Text>
          <Text style={styles.setupSubtitle}>
            How many calories do you want to consume today?
          </Text>

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
            <Text style={styles.inputUnit}>kcal / day</Text>
          </View>

          <View style={styles.quickGoals}>
            {[1500, 2000, 2500, 3000].map(kcal => (
              <TouchableOpacity
                key={kcal}
                style={[styles.quickGoalChip, goalInput === String(kcal) && styles.quickGoalChipActive]}
                onPress={() => setGoalInput(String(kcal))}
              >
                <Text style={[styles.quickGoalText, goalInput === String(kcal) && styles.quickGoalTextActive]}>
                  {kcal}
                </Text>
              </TouchableOpacity>
            ))}
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

  // --- MAIN HOME SCREEN ---
  return (
    <View style={styles.container}>
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.userName}>Let's crush it today!</Text>
        </View>

        <View style={styles.circleContainer}>
          <Svg width={size} height={size}>
            <Circle stroke="rgba(255,255,255,0.05)" fill="none" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />
            <Circle
              stroke="#FF7F50" fill="none" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth}
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              strokeLinecap="round" rotation="-90" origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>
          <View style={styles.innerCircleContent}>
            <Text style={styles.calBigNumber}>{caloriesConsumed}</Text>
            <Text style={styles.calSubText}>of {calorieGoal} kcal</Text>
            <TouchableOpacity onPress={() => setGoalSet(false)} style={styles.editGoalBtn}>
              <Text style={styles.editGoalText}>edit goal</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: 'Protein', val: '0g', color: '#FF7F50' },
            { label: 'Carbs', val: '0g', color: '#F08080' },
            { label: 'Fats', val: '0g', color: '#FFA07A' },
          ].map((item) => (
            <View key={item.label} style={styles.statBox}>
              <Text style={[styles.statVal, { color: item.color }]}>{item.val}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}><Text style={styles.navLabelActive}>Home</Text></TouchableOpacity>
        <TouchableOpacity style={styles.plusButtonContainer} onPress={() => setModalVisible(true)} activeOpacity={0.9}>
          <LinearGradient colors={['#FF7F50', '#F08080']} style={styles.plusButton}>
            <Text style={styles.plusIcon}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Text style={styles.navLabel}>Profile</Text></TouchableOpacity>
      </View>

      {/* ADD MEAL MODAL */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ADD MEAL</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtnArea}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.squareRow}>
              <TouchableOpacity style={styles.squareOption}>
                <View style={styles.squareInner}>
                  <Text style={styles.squareText}>SEARCH</Text>
                  <Text style={styles.squareSubText}>FOOD</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.squareOption, styles.squareOptionActive]} onPress={openCamera}>
                <View style={styles.squareInner}>
                  <Text style={[styles.squareText, { color: '#fff' }]}>MEAL</Text>
                  <Text style={[styles.squareSubText, { color: 'rgba(255,255,255,0.6)' }]}>SCAN</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.squareOption}>
                <View style={styles.squareInner}>
                  <Text style={styles.squareText}>MANUAL</Text>
                  <Text style={styles.squareSubText}>ENTRY</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <LinearGradient colors={['#FF7F50', '#F08080']} style={styles.logBtn}>
                <Text style={styles.logBtnText}>CLOSE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* AI SCANNER RESULT MODAL */}
      <Modal animationType="slide" transparent={true} visible={scannerVisible} onRequestClose={resetScanner}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>AI MEAL SCAN</Text>
              <TouchableOpacity onPress={resetScanner} style={styles.closeBtnArea}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {capturedImage && (
              <Image source={{ uri: capturedImage }} style={styles.previewImage} resizeMode="cover" />
            )}

            {scanning && (
              <View style={styles.scanningBox}>
                <ActivityIndicator size="large" color="#FF7F50" />
                <Text style={styles.scanningText}>Analyzing your meal with AI...</Text>
              </View>
            )}

            {scanResult && !scanning && (
              <View style={styles.resultBox}>
                <Text style={styles.resultFood}>{scanResult.food}</Text>
                <Text style={styles.resultDescription}>{scanResult.description}</Text>

                <View style={styles.resultMacros}>
                  <View style={styles.resultMacroItem}>
                    <Text style={styles.resultMacroVal}>{scanResult.calories}</Text>
                    <Text style={styles.resultMacroLabel}>kcal</Text>
                  </View>
                  <View style={styles.resultMacroItem}>
                    <Text style={[styles.resultMacroVal, { color: '#FF7F50' }]}>{scanResult.protein}</Text>
                    <Text style={styles.resultMacroLabel}>Protein</Text>
                  </View>
                  <View style={styles.resultMacroItem}>
                    <Text style={[styles.resultMacroVal, { color: '#F08080' }]}>{scanResult.carbs}</Text>
                    <Text style={styles.resultMacroLabel}>Carbs</Text>
                  </View>
                  <View style={styles.resultMacroItem}>
                    <Text style={[styles.resultMacroVal, { color: '#FFA07A' }]}>{scanResult.fats}</Text>
                    <Text style={styles.resultMacroLabel}>Fats</Text>
                  </View>
                </View>

                <View style={styles.healthTipBox}>
                  <Text style={styles.healthTipTitle}>HEALTH TIP</Text>
                  <Text style={styles.healthTipText}>{scanResult.healthTip}</Text>
                </View>

                <View style={styles.resultActions}>
                  <TouchableOpacity style={styles.retryBtn} onPress={openCamera}>
                    <Text style={styles.retryBtnText}>Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1 }} onPress={logMeal}>
                    <LinearGradient colors={['#FF7F50', '#F08080']} style={styles.logBtn}>
                      <Text style={styles.logBtnText}>LOG MEAL</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity onPress={openGallery} style={styles.galleryBtn}>
              <Text style={styles.galleryBtnText}>Choose from Gallery instead</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  body: { flex: 1 },

  // --- Setup Screen ---
  setupScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  setupEmoji: { fontSize: 60, marginBottom: 20 },
  setupTitle: { color: '#fff', fontSize: 32, fontWeight: '900', textAlign: 'center', lineHeight: 40, marginBottom: 12 },
  setupSubtitle: { color: 'rgba(255,255,255,0.45)', fontSize: 15, textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  inputWrapper: { alignItems: 'center', marginBottom: 24 },
  calorieInput: {
    backgroundColor: '#1E1E1E', color: '#fff', fontSize: 42, fontWeight: '900',
    textAlign: 'center', borderRadius: 24, paddingVertical: 18, paddingHorizontal: 30,
    borderWidth: 1.5, borderColor: 'rgba(255,127,80,0.3)', width: width - 80,
  },
  inputUnit: { color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: '700', marginTop: 10, letterSpacing: 1 },
  quickGoals: { flexDirection: 'row', gap: 10, marginBottom: 36 },
  quickGoalChip: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 50,
    backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: 'rgba(255,127,80,0.2)',
  },
  quickGoalChipActive: { backgroundColor: '#FF7F50', borderColor: '#FF7F50' },
  quickGoalText: { color: 'rgba(255,255,255,0.5)', fontWeight: '800', fontSize: 14 },
  quickGoalTextActive: { color: '#fff' },
  setupBtn: { borderRadius: 22, paddingVertical: 20, paddingHorizontal: 60, alignItems: 'center' },
  setupBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 2, fontSize: 16 },

  // --- Home Screen ---
  header: { paddingTop: 60, paddingHorizontal: 25, marginBottom: 10 },
  greeting: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  userName: { color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 2 },

  circleContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 30 },
  innerCircleContent: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  calBigNumber: { color: '#fff', fontSize: 48, fontWeight: '900' },
  calSubText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '700' },
  editGoalBtn: { marginTop: 6 },
  editGoalText: { color: 'rgba(255,127,80,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  statBox: { alignItems: 'center', backgroundColor: '#1E1E1E', paddingVertical: 20, borderRadius: 24, width: (width - 60) / 3 },
  statVal: { fontSize: 18, fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '800', marginTop: 4, letterSpacing: 1 },

  bottomNav: { flexDirection: 'row', backgroundColor: '#1E1E1E', height: 85, alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  navItem: { flex: 1, alignItems: 'center' },
  navLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '800' },
  navLabelActive: { color: '#FF7F50', fontSize: 12, fontWeight: '800' },
  plusButtonContainer: { bottom: 35 },
  plusButton: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#FF7F50', shadowOpacity: 0.4, shadowRadius: 12 },
  plusIcon: { color: '#fff', fontSize: 40, fontWeight: '200' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E1E1E', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  closeBtnArea: { padding: 5 },
  closeBtn: { color: 'rgba(255,255,255,0.3)', fontSize: 18 },

  squareRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 30 },
  squareOption: { flex: 1, aspectRatio: 1, backgroundColor: '#262626', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,127,80,0.1)' },
  squareOptionActive: { backgroundColor: '#FF7F50', borderColor: '#FF7F50' },
  squareInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  squareText: { color: '#FF7F50', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  squareSubText: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '800', marginTop: 4 },

  logBtn: { borderRadius: 20, paddingVertical: 20, alignItems: 'center' },
  logBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 2, fontSize: 15 },

  previewImage: { width: '100%', height: 200, borderRadius: 20, marginBottom: 20 },
  scanningBox: { alignItems: 'center', paddingVertical: 20 },
  scanningText: { color: 'rgba(255,255,255,0.5)', marginTop: 12, fontSize: 14, fontWeight: '600' },

  resultBox: { marginBottom: 16 },
  resultFood: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 6, textAlign: 'center' },
  resultDescription: { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', marginBottom: 20, paddingHorizontal: 10, lineHeight: 18 },
  resultMacros: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  resultMacroItem: { flex: 1, alignItems: 'center', backgroundColor: '#262626', marginHorizontal: 4, paddingVertical: 14, borderRadius: 16 },
  resultMacroVal: { color: '#fff', fontSize: 18, fontWeight: '900' },
  resultMacroLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700', marginTop: 4 },
  healthTipBox: { backgroundColor: 'rgba(255,127,80,0.1)', padding: 16, borderRadius: 18, marginBottom: 25, borderWidth: 1, borderColor: 'rgba(255,127,80,0.2)' },
  healthTipTitle: { color: '#FF7F50', fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  healthTipText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 18, fontWeight: '500' },
  resultActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  retryBtn: { paddingVertical: 20, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(255,127,80,0.4)' },
  retryBtnText: { color: '#FF7F50', fontWeight: '800', fontSize: 14 },

  galleryBtn: { alignItems: 'center', paddingTop: 16 },
  galleryBtnText: { color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: '600' },
});