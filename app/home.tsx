import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Modal, Image, ActivityIndicator, Alert, TextInput,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { analyzeFoodImage, searchFoodNutrition, type ScanResult } from '../services/geminiService';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────
// CAT IMAGES
// ─────────────────────────────────────────────
const CAT_IMAGES: Record<number, any> = {
  0: require('../assets/cat_0.png'),
  25: require('../assets/cat_25.png'),
  50: require('../assets/cat_50.png'),
  75: require('../assets/cat_75.png'),
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

// ─────────────────────────────────────────────
// CALORIE CALCULATOR
// ─────────────────────────────────────────────
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

function calculateCalories(
  weight: number,
  height: number,
  age: number,
  sex: 'male' | 'female',
  activity: string,
  goal: 'lose' | 'maintain' | 'gain'
): number {
  const bmr =
    sex === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const multiplier = ACTIVITY_MULTIPLIERS[activity] ?? 1.2;
  let calories = Math.round(bmr * multiplier);

  if (goal === 'lose') calories -= 500;
  if (goal === 'gain') calories += 500;

  return Math.max(calories, 1200);
}

// ─────────────────────────────────────────────
// ONBOARDING STEPS
// ─────────────────────────────────────────────
type OnboardingStep = 'sex' | 'stats' | 'activity' | 'goal' | 'result';

interface UserProfile {
  sex: 'male' | 'female';
  age: string;
  height: string;
  weight: string;
  activity: string;
  goal: 'lose' | 'maintain' | 'gain';
}

function OnboardingScreen({ onComplete }: { onComplete: (calories: number, profile: UserProfile) => void }) {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });
  const [step, setStep] = useState<OnboardingStep>('sex');
  const [profile, setProfile] = useState<UserProfile>({
    sex: 'male',
    age: '',
    height: '',
    weight: '',
    activity: '',
    goal: 'maintain',
  });
  const [calculatedCal, setCalculatedCal] = useState(0);

  if (!fontsLoaded) return null;

  const STEPS: OnboardingStep[] = ['sex', 'stats', 'activity', 'goal', 'result'];
  const stepIndex = STEPS.indexOf(step);

  const goNext = () => {
    if (step === 'stats') {
      const a = parseInt(profile.age, 10);
      const h = parseFloat(profile.height);
      const w = parseFloat(profile.weight);
      if (!a || a < 10 || a > 120) return Alert.alert('Invalid age', 'Please enter a valid age (10–120).');
      if (!h || h < 100 || h > 250) return Alert.alert('Invalid height', 'Please enter height in cm (100–250).');
      if (!w || w < 20 || w > 300) return Alert.alert('Invalid weight', 'Please enter weight in kg (20–300).');
    }
    if (step === 'activity' && !profile.activity) return Alert.alert('Select activity', 'Please choose your activity level.');
    if (step === 'goal') {
      const cal = calculateCalories(
        parseFloat(profile.weight),
        parseFloat(profile.height),
        parseInt(profile.age, 10),
        profile.sex,
        profile.activity,
        profile.goal
      );
      setCalculatedCal(cal);
      setStep('result');
      return;
    }
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next);
  };

  const goBack = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1]);
  };

  const ProgressBar = () => (
    <View style={ob.progressRow}>
      {STEPS.slice(0, 4).map((s, i) => (
        <View
          key={s}
          style={[ob.progressDot, i <= stepIndex ? ob.progressDotActive : ob.progressDotInactive]}
        />
      ))}
    </View>
  );

  if (step === 'sex') {
    return (
      <LinearGradient colors={['#1a1a1a', '#121212']} style={ob.screen}>
        <ProgressBar />
        <Text style={ob.title}>Let's personalize{'\n'}your calorie goal</Text>
        <Text style={ob.subtitle}>What's your biological sex?</Text>
        <View style={ob.optionRow}>
          {(['male', 'female'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[ob.bigOption, profile.sex === s && ob.bigOptionActive]}
              onPress={() => setProfile(p => ({ ...p, sex: s }))}
            >
              <Text style={ob.bigOptionEmoji}>{s === 'male' ? '♂' : '♀'}</Text>
              <Text style={[ob.bigOptionLabel, profile.sex === s && ob.bigOptionLabelActive]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={goNext} activeOpacity={0.85}>
          <LinearGradient colors={['#FF7F50', '#F08080']} style={ob.btn}>
            <Text style={ob.btnText}>NEXT</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  if (step === 'stats') {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <LinearGradient colors={['#1a1a1a', '#121212']} style={ob.screen}>
          <ProgressBar />
          <TouchableOpacity onPress={goBack} style={ob.backBtn}>
            <Text style={ob.backTxt}>← Back</Text>
          </TouchableOpacity>
          <Text style={ob.title}>Tell us about{'\n'}yourself</Text>
          <View style={ob.inputGroup}>
            {[
              { key: 'age', placeholder: 'Age (years)', keyboard: 'numeric' },
              { key: 'height', placeholder: 'Height (cm)', keyboard: 'decimal-pad' },
              { key: 'weight', placeholder: 'Weight (kg)', keyboard: 'decimal-pad' },
            ].map((field) => (
              <TextInput
                key={field.key}
                style={ob.input}
                placeholder={field.placeholder}
                placeholderTextColor="rgba(255,255,255,0.25)"
                keyboardType={field.keyboard as any}
                value={(profile as any)[field.key]}
                onChangeText={(v) => setProfile(p => ({ ...p, [field.key]: v }))}
              />
            ))}
          </View>
          <TouchableOpacity onPress={goNext} activeOpacity={0.85}>
            <LinearGradient colors={['#FF7F50', '#F08080']} style={ob.btn}>
              <Text style={ob.btnText}>NEXT</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  if (step === 'activity') {
    const levels = [
      { key: 'sedentary', label: 'Sedentary', sub: 'Little to no exercise' },
      { key: 'light', label: 'Light', sub: '1–3 days/week' },
      { key: 'moderate', label: 'Moderate', sub: '3–5 days/week' },
      { key: 'active', label: 'Active', sub: '6–7 days/week' },
      { key: 'very_active', label: 'Very Active', sub: 'Physical job or 2x training' },
    ];
    return (
      <LinearGradient colors={['#1a1a1a', '#121212']} style={ob.screen}>
        <ProgressBar />
        <TouchableOpacity onPress={goBack} style={ob.backBtn}>
          <Text style={ob.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={ob.title}>Activity{'\n'}Level</Text>
        <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
          {levels.map((l) => (
            <TouchableOpacity
              key={l.key}
              style={[ob.listOption, profile.activity === l.key && ob.listOptionActive]}
              onPress={() => setProfile(p => ({ ...p, activity: l.key }))}
            >
              <View>
                <Text style={[ob.listLabel, profile.activity === l.key && ob.listLabelActive]}>{l.label}</Text>
                <Text style={ob.listSub}>{l.sub}</Text>
              </View>
              {profile.activity === l.key && <Text style={ob.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
          <View style={{ height: 20 }} />
        </ScrollView>
        <TouchableOpacity onPress={goNext} activeOpacity={0.85}>
          <LinearGradient colors={['#FF7F50', '#F08080']} style={ob.btn}>
            <Text style={ob.btnText}>NEXT</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  if (step === 'goal') {
    const goals = [
      { key: 'lose', label: 'Lose Weight', sub: '-500 kcal/day', img: CAT_IMAGES[0] },
      { key: 'maintain', label: 'Maintain', sub: 'Keep current calories', img: CAT_IMAGES[50] },
      { key: 'gain', label: 'Gain Weight', sub: '+500 kcal/day', img: CAT_IMAGES[100] },
    ];
    return (
      <LinearGradient colors={['#1a1a1a', '#121212']} style={ob.screen}>
        <ProgressBar />
        <TouchableOpacity onPress={goBack} style={ob.backBtn}>
          <Text style={ob.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={ob.title}>What's your{'\n'}goal?</Text>
        <View style={{ width: '100%', gap: 12, marginBottom: 30 }}>
          {goals.map((g) => (
            <TouchableOpacity
              key={g.key}
              style={[ob.listOption, profile.goal === g.key && ob.listOptionActive]}
              onPress={() => setProfile(p => ({ ...p, goal: g.key as any }))}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Image source={g.img} style={{ width: 44, height: 44, resizeMode: 'contain' }} />
                <View>
                  <Text style={[ob.listLabel, profile.goal === g.key && ob.listLabelActive]}>{g.label}</Text>
                  <Text style={ob.listSub}>{g.sub}</Text>
                </View>
              </View>
              {profile.goal === g.key && <Text style={ob.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={goNext} activeOpacity={0.85}>
          <LinearGradient colors={['#FF7F50', '#F08080']} style={ob.btn}>
            <Text style={ob.btnText}>CALCULATE</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  if (step === 'result') {
    return (
      <LinearGradient colors={['#1a1a1a', '#121212']} style={ob.screen}>
        <Text style={ob.title}>Your Daily{'\n'}Calorie Goal</Text>
        <LinearGradient colors={['#FF7F50', '#F08080']} style={ob.resultBadge}>
          <Text style={ob.resultNum}>{calculatedCal}</Text>
          <Text style={ob.resultUnit}>kcal / day</Text>
        </LinearGradient>
        <View style={ob.summaryBox}>
          {[
            { label: 'Sex', val: profile.sex === 'male' ? 'Male' : 'Female' },
            { label: 'Age', val: `${profile.age} yrs` },
            { label: 'Height', val: `${profile.height} cm` },
            { label: 'Weight', val: `${profile.weight} kg` },
            { label: 'Activity', val: profile.activity.replace('_', ' ') },
            { label: 'Goal', val: profile.goal.charAt(0).toUpperCase() + profile.goal.slice(1) },
          ].map(item => (
            <View key={item.label} style={ob.summaryRow}>
              <Text style={ob.summaryLabel}>{item.label}</Text>
              <Text style={ob.summaryVal}>{item.val}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity onPress={() => onComplete(calculatedCal, profile)} activeOpacity={0.85}>
          <LinearGradient colors={['#FF7F50', '#F08080']} style={ob.btn}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={ob.btnText}>LET'S GO</Text>
              <Image source={require('../assets/goals.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={goBack} style={{ marginTop: 14, alignItems: 'center' }}>
          <Text style={ob.backTxt}>← Recalculate</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return null;
}

// ─────────────────────────────────────────────
// MAIN HOME SCREEN
// ─────────────────────────────────────────────
export default function HomeScreen() {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });
  const [goalSet, setGoalSet] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [calorieGoal, setCalorieGoal] = useState(2200);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [proteinConsumed, setProteinConsumed] = useState(0);
  const [carbsConsumed, setCarbsConsumed] = useState(0);
  const [fatsConsumed, setFatsConsumed] = useState(0);
  const [activeDate, setActiveDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  const [meals, setMeals] = useState<Record<MealType, ScanResult[]>>({
    Breakfast: [],
    Lunch: [],
    Dinner: [],
    Snacks: [],
  });
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [mealTypeModalVisible, setMealTypeModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'diary' | 'goals'>('diary');
  const [targetWeight, setTargetWeight] = useState('');
  const [targetDateStr, setTargetDateStr] = useState('');
  const [activeGoal, setActiveGoal] = useState<{ weight: number; date: string } | null>(null);

  const [manualName, setManualName] = useState('');
  const [manualKcal, setManualKcal] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFats, setManualFats] = useState('');

  if (!fontsLoaded) return null;

  // Ring math
  const SIZE = 250;
  const STROKE = 11;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = RADIUS * 2 * Math.PI;
  const progress = calorieGoal > 0 ? Math.min(caloriesConsumed / calorieGoal, 1) : 0;
  const dashOffset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

  // Cat
  const pct = Math.round(progress * 100);
  const stage = getCatStage(pct);
  const catSrc = CAT_IMAGES[stage];

  const handleOnboardingComplete = (calories: number, profile: UserProfile) => {
    setCalorieGoal(calories);
    setUserProfile(profile);
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
      mediaTypes: ImagePicker.MediaType.Images,
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
      mediaTypes: ImagePicker.MediaType.Images,
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
      if (selectedMealType) {
        confirmLogMeal(selectedMealType);
        setSelectedMealType(null);
      } else {
        setMealTypeModalVisible(true);
      }
    }
  };

  const confirmLogMeal = (type: MealType) => {
    if (!scanResult) return;
    setMeals(prev => ({ ...prev, [type]: [...prev[type], scanResult] }));
    setCaloriesConsumed(prev => prev + scanResult.calories);
    const parseG = (str: string | number) => parseInt(str.toString().replace('g', ''), 10) || 0;
    setProteinConsumed(prev => prev + parseG(scanResult.protein));
    setCarbsConsumed(prev => prev + parseG(scanResult.carbs));
    setFatsConsumed(prev => prev + parseG(scanResult.fats));
    setMealTypeModalVisible(false);
    resetScanner();
    Alert.alert('Logged', `${scanResult.food} added to ${type}`);
  };

  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;
    setScanning(true);
    setSearchModalVisible(false);
    setScannerVisible(true);
    try {
      const result = await searchFoodNutrition(searchQuery);
      setScanResult(result);
    } catch (err: any) {
      Alert.alert('Search Error', err.message);
      resetScanner();
    } finally {
      setScanning(false);
      setSearchQuery('');
    }
  };

  const handleManualLog = () => {
    const kcal = parseInt(manualKcal, 10) || 0;
    if (!manualName || kcal <= 0) {
      Alert.alert('Invalid Entry', 'Please enter a name and calorie amount.');
      return;
    }
    setScanResult({
      food: manualName,
      calories: kcal,
      protein: manualProtein || '0g',
      carbs: manualCarbs || '0g',
      fats: manualFats || '0g',
      description: 'Manually entered',
      healthTip: 'Manual entry logged.'
    });
    setManualModalVisible(false);
    setManualName('');
    setManualKcal('');
    setManualProtein('');
    setManualCarbs('');
    setManualFats('');
    setMealTypeModalVisible(true);
  };

  const resetScanner = () => {
    setScannerVisible(false);
    setCapturedImage(null);
    setScanResult(null);
    setScanning(false);
  };

  // ── ONBOARDING ──
  if (!goalSet) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // ── MAIN SCREEN ──
  return (
    <View style={styles.container}>
      {activeTab === 'diary' ? (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <LinearGradient colors={['#ffffff', '#ffe8e0', '#ffcbb5']} style={styles.header}>
            <Image source={require('../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
            <View style={styles.circleRow}>
              <View style={[styles.sideStat, { paddingRight: 10 }]}>
                <Text style={styles.sideVal}>{caloriesConsumed}</Text>
                <Text style={styles.sideLbl}>EATEN</Text>
              </View>

              <View style={styles.ringWrap}>
                <Svg width={SIZE} height={SIZE}>
                  <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="rgba(255,127,80,0.12)" strokeWidth={STROKE} />
                  <Circle
                    cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#FF7F50" strokeWidth={STROKE}
                    strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset}
                    strokeLinecap="round" rotation="-90" origin={`${SIZE / 2}, ${SIZE / 2}`}
                  />
                </Svg>
                <View style={styles.ringInner}>
                  <Text style={styles.kcalNum}>{caloriesConsumed}</Text>
                  <Text style={styles.kcalSub}>of {calorieGoal} kcal</Text>
                  {catSrc
                    ? <Image source={catSrc} style={styles.catImg} />
                    : <Text style={styles.catPlaceholderTxt}>CAT {stage}%</Text>}
                </View>
              </View>

              <View style={[styles.sideStat, { paddingLeft: 10 }]}>
                <TouchableOpacity onPress={() => setGoalSet(false)}>
                  <Ionicons name="settings-outline" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.sideLbl}>GOAL</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Date Switcher */}
          <View style={styles.dateSwitcher}>
            <TouchableOpacity onPress={() => {
              const d = new Date(activeDate);
              d.setDate(d.getDate() - 1);
              setActiveDate(d);
            }}>
              <Text style={styles.dateArrowTxt}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.dateLabel}>{formatDate(activeDate)}</Text>
            <TouchableOpacity onPress={() => {
              const d = new Date(activeDate);
              d.setDate(d.getDate() + 1);
              setActiveDate(d);
            }}>
              <Text style={styles.dateArrowTxt}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Macros */}
          <View style={styles.macrosRow}>
            {[
              { label: 'PROTEIN', val: `${proteinConsumed}g`, color: '#FF7F50' },
              { label: 'CARBS', val: `${carbsConsumed}g`, color: '#F08080' },
              { label: 'FATS', val: `${fatsConsumed}g`, color: '#FFA07A' },
            ].map((item) => (
              <View key={item.label} style={styles.macroBox}>
                <Text style={[styles.macroVal, { color: item.color }]}>{item.val}</Text>
                <Text style={styles.macroLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Meal Categories */}
          <View style={styles.mealList}>
            {(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as MealType[]).map((type) => (
              <View key={type} style={styles.mealSection}>
                <View style={styles.mealHeader}>
                  <View style={styles.mealTitleRow}>
                    <View style={[styles.mealDot, {
                      backgroundColor:
                        type === 'Breakfast' ? '#FF7F50' :
                          type === 'Lunch' ? '#F08080' :
                            type === 'Dinner' ? '#FFA07A' : '#DDA0DD'
                    }]} />
                    <View>
                      <Text style={styles.mealTitle}>{type}</Text>
                      <Text style={styles.mealRec}>
                        {type === 'Breakfast' ? '288-403' :
                          type === 'Lunch' ? '345-460' :
                            type === 'Dinner' ? '449-587' : '100-200'} kcal
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.mealPlus}
                    onPress={() => { setSelectedMealType(type); setModalVisible(true); }}
                  >
                    <Text style={styles.mealPlusTxt}>+</Text>
                  </TouchableOpacity>
                </View>
                {meals[type].map((m, i) => (
                  <View key={i} style={styles.loggedMeal}>
                    <Text style={styles.loggedMealName}>{m.food}</Text>
                    <Text style={styles.loggedMealCal}>{m.calories} kcal</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      ) : (
        <View style={goalsStyles.container}>
          <LinearGradient colors={['#ffffff', '#ffe8e0', '#ffcbb5']} style={goalsStyles.headerRow}>
            <Text style={goalsStyles.header}>Goal Management</Text>
          </LinearGradient>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {!activeGoal ? (
              <View style={goalsStyles.form}>
                <Text style={goalsStyles.emptyStateText}>
                  No active goals. Define your target weight and deadline to begin tracking progress.
                </Text>

                <View style={goalsStyles.inputGroup}>
                  <Text style={goalsStyles.label}>Target Weight (kg)</Text>
                  <TextInput
                    style={goalsStyles.input}
                    placeholder="Set weight target"
                    keyboardType="numeric"
                    placeholderTextColor="rgba(0,0,0,0.2)"
                    value={targetWeight}
                    onChangeText={setTargetWeight}
                  />
                </View>

                <View style={goalsStyles.inputGroup}>
                  <Text style={goalsStyles.label}>Target Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={goalsStyles.input}
                    placeholder="Target Date"
                    placeholderTextColor="rgba(0,0,0,0.2)"
                    value={targetDateStr}
                    onChangeText={setTargetDateStr}
                  />
                </View>

                <TouchableOpacity
                  style={goalsStyles.saveBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    const w = parseFloat(targetWeight);
                    const d = new Date(targetDateStr);
                    const today = new Date();
                    if (isNaN(w) || w <= 0 || w > 500) {
                      Alert.alert('Error', 'Please enter a realistic target weight.');
                      return;
                    }
                    if (isNaN(d.getTime()) || d <= today) {
                      Alert.alert('Error', 'Please enter a valid future date.');
                      return;
                    }
                    setActiveGoal({ weight: w, date: targetDateStr });
                  }}
                >
                  <Text style={goalsStyles.saveBtnText}>START TRACKING</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={goalsStyles.activeGoalBox}>
                <Text style={goalsStyles.activeLabel}>Current Objective</Text>
                <View style={goalsStyles.statsRow}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={goalsStyles.statLabel}>Baseline</Text>
                    <Text style={goalsStyles.statVal}>{userProfile?.weight || '--'} kg</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={goalsStyles.statLabel}>Target</Text>
                    <Text style={goalsStyles.statVal}>{activeGoal.weight} kg</Text>
                  </View>
                </View>
                <View style={goalsStyles.deadlineBox}>
                  <Text style={goalsStyles.deadlineLabel}>Target Date</Text>
                  <Text style={goalsStyles.deadlineVal}>{activeGoal.date}</Text>
                </View>
                <TouchableOpacity
                  style={goalsStyles.clearBtn}
                  onPress={() => setActiveGoal(null)}
                >
                  <Text style={goalsStyles.clearBtnText}>CLEAR GOAL</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
      )}

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('diary')}>
          <Image
            source={require('../assets/diary.png')}
            style={[styles.navIcon, activeTab === 'diary' ? null : { opacity: 0.3 }]}
            resizeMode="contain"
          />
          <Text style={[styles.navActive, activeTab === 'diary' ? null : styles.navInactive]}>DIARY</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.plusWrap} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#FF7F50', '#F08080']} style={styles.plusBtn}>
            <Text style={styles.plusTxt}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('goals')}>
          <Image
            source={require('../assets/goals.png')}
            style={[styles.navIcon, activeTab === 'goals' ? null : { opacity: 0.3 }]}
            resizeMode="contain"
          />
          <Text style={[styles.navActive, activeTab === 'goals' ? null : styles.navInactive]}>GOALS</Text>
        </TouchableOpacity>
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
              <TouchableOpacity style={styles.squareOption} onPress={() => { setModalVisible(false); setSearchModalVisible(true); }}>
                <View style={styles.squareInner}>
                  <Text style={styles.squareText}>SEARCH</Text>
                  <Text style={styles.squareSubText}>FOOD</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.squareOption} onPress={openCamera}>
                <View style={styles.squareInner}>
                  <Text style={styles.squareText}>MEAL</Text>
                  <Text style={styles.squareSubText}>SCAN</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.squareOption} onPress={() => { setModalVisible(false); setManualModalVisible(true); }}>
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

      {/* SEARCH FOOD MODAL */}
      <Modal animationType="fade" transparent={true} visible={searchModalVisible} onRequestClose={() => setSearchModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>AI FOOD SEARCH</Text>
              <TouchableOpacity onPress={() => setSearchModalVisible(false)} style={styles.closeBtnArea}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.searchSub}>Describe your food (e.g. "bowl of granola with milk")</Text>
            <TextInput
              style={styles.searchBox}
              placeholder="What did you eat?"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={handleAISearch}>
              <LinearGradient colors={['#FF7F50', '#F08080']} style={styles.logBtn}>
                <Text style={styles.logBtnText}>SEARCH WITH AI</Text>
              </LinearGradient>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* MANUAL ENTRY MODAL */}
      <Modal animationType="fade" transparent={true} visible={manualModalVisible} onRequestClose={() => setManualModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>MANUAL ENTRY</Text>
              <TouchableOpacity onPress={() => setManualModalVisible(false)} style={styles.closeBtnArea}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.manualForm}>
              <TextInput style={styles.manualInput} placeholder="Food Name" placeholderTextColor="#999" value={manualName} onChangeText={setManualName} />
              <TextInput style={styles.manualInput} placeholder="Calories (kcal)" placeholderTextColor="#999" keyboardType="numeric" value={manualKcal} onChangeText={setManualKcal} />
              <View style={styles.macroInputRow}>
                <TextInput style={[styles.manualInput, { flex: 1, marginRight: 8 }]} placeholder="Protein (g)" placeholderTextColor="#999" keyboardType="numeric" value={manualProtein} onChangeText={setManualProtein} />
                <TextInput style={[styles.manualInput, { flex: 1, marginRight: 8 }]} placeholder="Carbs (g)" placeholderTextColor="#999" keyboardType="numeric" value={manualCarbs} onChangeText={setManualCarbs} />
                <TextInput style={[styles.manualInput, { flex: 1 }]} placeholder="Fats (g)" placeholderTextColor="#999" keyboardType="numeric" value={manualFats} onChangeText={setManualFats} />
              </View>
            </View>
            <TouchableOpacity onPress={handleManualLog}>
              <LinearGradient colors={['#FF7F50', '#F08080']} style={styles.logBtn}>
                <Text style={styles.logBtnText}>SAVE ENTRY</Text>
              </LinearGradient>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* MEAL TYPE SELECTION MODAL */}
      <Modal animationType="fade" transparent={true} visible={mealTypeModalVisible} onRequestClose={() => setMealTypeModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>SELECT MEAL TYPE</Text>
            <View style={styles.typeGrid}>
              {(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as MealType[]).map(t => (
                <TouchableOpacity key={t} style={styles.typeBtn} onPress={() => confirmLogMeal(t)}>
                  <Text style={styles.typeBtnText}>{t.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setMealTypeModalVisible(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────
// ONBOARDING STYLES
// ─────────────────────────────────────────────
const ob = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  progressDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
  },
  progressDotActive: { backgroundColor: '#FF7F50' },
  progressDotInactive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 8 },
  backTxt: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'PressStart2P_400Regular' },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
    fontFamily: 'PressStart2P_400Regular',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'PressStart2P_400Regular',
    lineHeight: 20,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 36,
    width: '100%',
  },
  bigOption: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bigOptionActive: {
    borderColor: '#FF7F50',
    backgroundColor: 'rgba(255,127,80,0.15)',
  },
  bigOptionEmoji: { fontSize: 40 },
  bigOptionLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontFamily: 'PressStart2P_400Regular',
  },
  bigOptionLabelActive: { color: '#FF7F50' },
  inputGroup: { width: '100%', gap: 14, marginBottom: 32 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,127,80,0.25)',
    borderRadius: 18,
    padding: 18,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'PressStart2P_400Regular',
    width: '100%',
  },
  listOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    width: '100%',
  },
  listOptionActive: {
    borderColor: '#FF7F50',
    backgroundColor: 'rgba(255,127,80,0.12)',
  },
  listLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontFamily: 'PressStart2P_400Regular',
    lineHeight: 18,
  },
  listLabelActive: { color: '#FF7F50' },
  listSub: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 9,
    marginTop: 4,
    fontFamily: 'PressStart2P_400Regular',
    lineHeight: 16,
  },
  checkmark: { color: '#FF7F50', fontSize: 18, fontWeight: '900' },
  btn: {
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: width - 56,
    marginTop: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 2,
    fontFamily: 'PressStart2P_400Regular',
  },
  resultBadge: {
    borderRadius: 32,
    paddingVertical: 28,
    paddingHorizontal: 48,
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  resultNum: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 56,
    fontFamily: 'PressStart2P_400Regular',
  },
  resultUnit: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontFamily: 'PressStart2P_400Regular',
    marginTop: 6,
  },
  summaryBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 18,
    width: '100%',
    marginBottom: 24,
    gap: 10,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontFamily: 'PressStart2P_400Regular',
    textTransform: 'capitalize',
  },
  summaryVal: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'PressStart2P_400Regular',
    textTransform: 'capitalize',
  },
});

// ─────────────────────────────────────────────
// MAIN SCREEN STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  scroll: { flex: 1 },
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center' },
  headerLogo: { width: 240, height: 80, marginBottom: 14 },
  catPlaceholderTxt: { color: '#ccc', fontSize: 10 },
  circleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  sideStat: { width: 55, alignItems: 'center' },
  sideVal: { fontSize: 13, fontWeight: '800', color: '#333', fontFamily: 'PressStart2P_400Regular' },
  sideLbl: { fontSize: 7, color: '#333', fontFamily: 'PressStart2P_400Regular', marginTop: 4 },
  ringWrap: { width: 250, height: 250, alignItems: 'center', justifyContent: 'center' },
  ringInner: { position: 'absolute', alignItems: 'center', top: 60 },
  catImg: { width: 190, height: 190, resizeMode: 'contain', top: -50 },
  kcalNum: { fontSize: 24, fontWeight: '900', color: '#222', fontFamily: 'PressStart2P_400Regular' },
  kcalSub: { fontSize: 7, color: '#555', fontFamily: 'PressStart2P_400Regular', marginBottom: 4 },
  dateSwitcher: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, backgroundColor: '#fff' },
  dateLabel: { fontSize: 9, fontWeight: '700', fontFamily: 'PressStart2P_400Regular' },
  dateArrowTxt: { fontSize: 22, color: '#ccc' },
  macrosRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginVertical: 20 },
  macroBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 20,
    width: (width - 60) / 3,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  macroVal: { fontSize: 12, fontWeight: '800', fontFamily: 'PressStart2P_400Regular' },
  macroLabel: { fontSize: 6, color: '#aaa', fontWeight: '700', marginTop: 6, fontFamily: 'PressStart2P_400Regular' },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 100,
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#f0f0f0',
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navActive: { color: '#FF7F50', fontSize: 10, fontFamily: 'PressStart2P_400Regular', marginTop: 6 },
  navInactive: { color: '#ccc', fontSize: 10, fontFamily: 'PressStart2P_400Regular', marginTop: 6 },
  plusWrap: { bottom: 0 },
  plusBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#FF7F50',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  plusTxt: { color: '#fff', fontSize: 32 },
  navIcon: { width: 32, height: 32 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 25,
    paddingBottom: 50,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalTitle: { color: '#333', fontSize: 13, fontWeight: '900', letterSpacing: 1, fontFamily: 'PressStart2P_400Regular' },
  closeBtnArea: { padding: 5 },
  closeBtn: { color: '#ccc', fontSize: 18 },
  squareRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 30 },
  squareOption: { flex: 1, aspectRatio: 1, backgroundColor: '#f9f9f9', borderRadius: 20, borderWidth: 1, borderColor: '#eee' },
  squareInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  squareText: { color: '#FF7F50', fontSize: 10, fontWeight: '900', letterSpacing: 1, fontFamily: 'PressStart2P_400Regular' },
  squareSubText: { color: '#aaa', fontSize: 8, fontWeight: '800', marginTop: 4, fontFamily: 'PressStart2P_400Regular' },
  logBtn: { borderRadius: 20, paddingVertical: 20, alignItems: 'center' },
  logBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 2, fontSize: 11, fontFamily: 'PressStart2P_400Regular' },
  previewImage: { width: '100%', height: 200, borderRadius: 20, marginBottom: 20 },
  scanningBox: { alignItems: 'center', paddingVertical: 20 },
  scanningText: { color: '#aaa', marginTop: 12, fontSize: 11, fontFamily: 'PressStart2P_400Regular', lineHeight: 20 },
  resultBox: { marginBottom: 16 },
  resultFood: { color: '#333', fontSize: 16, fontWeight: '900', marginBottom: 6, textAlign: 'center', fontFamily: 'PressStart2P_400Regular', lineHeight: 26 },
  resultDescription: { color: '#666', fontSize: 11, textAlign: 'center', marginBottom: 20, paddingHorizontal: 10, lineHeight: 20 },
  resultMacros: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  resultMacroItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginHorizontal: 4,
    paddingVertical: 14,
    borderRadius: 16,
  },
  resultMacroVal: { color: '#333', fontSize: 14, fontWeight: '900', fontFamily: 'PressStart2P_400Regular' },
  resultMacroLabel: { color: '#aaa', fontSize: 8, fontWeight: '700', marginTop: 6, fontFamily: 'PressStart2P_400Regular' },
  healthTipBox: {
    backgroundColor: 'rgba(255,127,80,0.05)',
    padding: 16,
    borderRadius: 18,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,127,80,0.1)',
  },
  healthTipTitle: { color: '#FF7F50', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 6, fontFamily: 'PressStart2P_400Regular' },
  healthTipText: { color: '#666', fontSize: 9, lineHeight: 18, fontFamily: 'PressStart2P_400Regular' },
  resultActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  retryBtn: { paddingVertical: 20, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1.5, borderColor: '#eee' },
  retryBtnText: { color: '#aaa', fontWeight: '800', fontSize: 11, fontFamily: 'PressStart2P_400Regular' },
  galleryBtn: { alignItems: 'center', paddingTop: 16 },
  galleryBtnText: { color: '#ccc', fontSize: 11, fontFamily: 'PressStart2P_400Regular' },
  searchSub: { color: '#666', fontSize: 11, marginBottom: 15, fontFamily: 'PressStart2P_400Regular', lineHeight: 20 },
  searchBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 18,
    fontSize: 10,
    color: '#333',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    fontFamily: 'PressStart2P_400Regular',
  },
  manualForm: { marginBottom: 20 },
  manualInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    fontSize: 9,
    color: '#333',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    fontFamily: 'PressStart2P_400Regular',
  },
  macroInputRow: { flexDirection: 'row', justifyContent: 'space-between' },
  mealList: { padding: 16 },
  mealSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealTitleRow: { flexDirection: 'row', alignItems: 'center' },
  mealDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  mealTitle: { fontSize: 11, fontWeight: '900', color: '#333', fontFamily: 'PressStart2P_400Regular' },
  mealRec: { fontSize: 7, color: '#aaa', marginTop: 4, fontFamily: 'PressStart2P_400Regular', lineHeight: 14 },
  mealPlus: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  mealPlusTxt: { fontSize: 18, color: '#FF7F50', fontWeight: '300' },
  loggedMeal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f9f9f9',
  },
  loggedMealName: { fontSize: 11, color: '#666', fontFamily: 'PressStart2P_400Regular', lineHeight: 18 },
  loggedMealCal: { fontSize: 11, color: '#333', fontFamily: 'PressStart2P_400Regular' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 },
  typeBtn: { flexBasis: '48%', backgroundColor: '#f5f5f5', paddingVertical: 20, alignItems: 'center', borderRadius: 15 },
  typeBtnText: { fontWeight: '900', color: '#FF7F50', letterSpacing: 1, fontSize: 10, fontFamily: 'PressStart2P_400Regular' },
  cancelBtn: { marginTop: 20, paddingVertical: 15, alignItems: 'center' },
  cancelBtnText: { color: '#aaa', fontWeight: '800', fontSize: 10, fontFamily: 'PressStart2P_400Regular' },
});

// ─────────────────────────────────────────────
// GOALS TAB STYLES
// ─────────────────────────────────────────────
const goalsStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  headerRow: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center' },
  header: { fontSize: 14, color: '#CC3D3D', fontFamily: 'PressStart2P_400Regular', textAlign: 'center', lineHeight: 24 },
  form: { flex: 1, padding: 20 },
  emptyStateText: { fontSize: 8, color: '#FF8C69', lineHeight: 18, marginBottom: 32, fontFamily: 'PressStart2P_400Regular', textAlign: 'center' },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 7, color: '#FF6B6B', marginBottom: 12, fontFamily: 'PressStart2P_400Regular' },
  input: {
    backgroundColor: 'rgba(255,107,107,0.08)',
    borderRadius: 14,
    padding: 16,
    fontSize: 9,
    color: '#CC3D3D',
    borderWidth: 1.5,
    borderColor: 'rgba(255,107,107,0.25)',
    fontFamily: 'PressStart2P_400Regular',
  },
  saveBtn: { backgroundColor: '#FF6B6B', padding: 20, alignItems: 'center', borderRadius: 18, shadowColor: '#FF6B6B', shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  saveBtnText: { color: '#fff', fontSize: 10, fontFamily: 'PressStart2P_400Regular' },
  activeGoalBox: { flex: 1, padding: 20 },
  activeLabel: { fontSize: 8, color: '#FF8C69', marginBottom: 20, textAlign: 'center', fontFamily: 'PressStart2P_400Regular' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 24, backgroundColor: '#fff', borderRadius: 20, elevation: 2, shadowOpacity: 0.05 },
  statLabel: { fontSize: 6, color: '#aaa', marginBottom: 10, fontFamily: 'PressStart2P_400Regular' },
  statVal: { fontSize: 14, color: '#333', fontFamily: 'PressStart2P_400Regular' },
  deadlineBox: { marginTop: 24, padding: 20, backgroundColor: '#fff', borderRadius: 20, alignItems: 'center', elevation: 2, shadowOpacity: 0.05 },
  deadlineLabel: { fontSize: 6, color: '#aaa', marginBottom: 10, fontFamily: 'PressStart2P_400Regular' },
  deadlineVal: { fontSize: 10, color: '#CC3D3D', fontFamily: 'PressStart2P_400Regular' },
  clearBtn: { marginTop: 40, padding: 15, alignItems: 'center' },
  clearBtnText: { color: '#FF8C69', fontSize: 8, fontFamily: 'PressStart2P_400Regular' },
});
