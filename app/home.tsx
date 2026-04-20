import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Modal, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────
// SETTINGS — edit these as needed
// ─────────────────────────────────────────────
const GOAL = 2200;

// ─────────────────────────────────────────────
// CAT IMAGES — replace null with require('./assets/cat_0.png') etc.
// Thresholds:  0% = 0–24%  |  25% = 25–49%
//             50% = 50–74% |  75% = 75–99%  |  100% = 100%+
// ─────────────────────────────────────────────
const CAT_IMAGES: Record<number, any> = {
  0:   require('../assets/cat_0.png'),
  25:  require('../assets/cat_25.png'),
  50:  require('../assets/cat_50.png'),
  75:  require('../assets/cat_75.png'),
  100: require('../assets/cat_100.png'),
};

function getCatStage(pct) {
  if (pct >= 100) return 100;
  if (pct >= 75) return 75;
  if (pct >= 50) return 50;
  if (pct >= 25) return 25;
  return 0;
}

// ─────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function formatDate(date) {
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
// Component
// ─────────────────────────────────────────────
export default function HomeScreen() {
  const [consumed] = useState(980);   // replace with real state/prop
  const [modalVisible, setModalVisible] = useState(false);
  const [activeDate, setActiveDate] = useState(new Date());

  // Ring math
  const SIZE = 150;
  const STROKE = 11;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = RADIUS * 2 * Math.PI;
  const progress = Math.min(consumed / GOAL, 1);
  const dashOffset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

  // Cat
  const pct = Math.round(progress * 100);
  const stage = getCatStage(pct);
  const catSrc = CAT_IMAGES[stage];

  // Date nav
  const prevDay = () => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() - 1);
    setActiveDate(d);
  };
  const nextDay = () => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + 1);
    setActiveDate(d);
  };

  const MEALS = [
    { key: 'breakfast', label: 'Breakfast', rec: '288 – 403 kcal', dot: '#FF7F50' },
    { key: 'lunch', label: 'Lunch', rec: '345 – 460 kcal', dot: '#F08080' },
    { key: 'dinner', label: 'Dinner', rec: '449 – 587 kcal', dot: '#FFB347' },
    { key: 'snacks', label: 'Snacks', rec: '100 – 200 kcal', dot: '#DDA0DD' },
  ];

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── HEADER ───────────────────────────── */}
        <LinearGradient
          colors={['#ffffff', '#ffe8e0', '#ffcbb5']}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={s.header}
        >
          <Text style={s.appTitle}>NutriCat</Text>

          <View style={s.circleRow}>
            {/* Left stat */}
            <View style={s.sideStat}>
              <Text style={s.sideVal}>{consumed}</Text>
              <Text style={s.sideLbl}>EATEN</Text>
            </View>

            {/* Progress ring */}
            <View style={s.ringWrap}>
              <Svg width={SIZE} height={SIZE}>
                {/* Track */}
                <Circle
                  cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
                  fill="none"
                  stroke="rgba(255,127,80,0.12)"
                  strokeWidth={STROKE}
                />
                {/* Fill */}
                <Circle
                  cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
                  fill="none"
                  stroke="#FF7F50"
                  strokeWidth={STROKE}
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${SIZE / 2}, ${SIZE / 2}`}
                />
              </Svg>

              {/* Cat + calories inside ring */}
              <View style={s.ringInner}>
                {catSrc ? (
                  <Image source={catSrc} style={s.catImg} />
                ) : (
                  // Placeholder shown until you supply images
                  <View style={s.catPlaceholder}>
                    <Text style={s.catPlaceholderTxt}>CAT{'\n'}{stage}%</Text>
                  </View>
                )}
                <Text style={s.kcalNum}>{consumed}</Text>
                <Text style={s.kcalSub}>of {GOAL} kcal</Text>
              </View>
            </View>

            {/* Right stat */}
            <View style={s.sideStat}>
              <Text style={s.sideVal}>0</Text>
              <Text style={s.sideLbl}>BURNED</Text>
            </View>
          </View>

          <TouchableOpacity style={s.seeStatsBtn}>
            <Text style={s.seeStatsTxt}>SEE STATS  ▾</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── MACROS ───────────────────────────── */}
        <View style={s.macrosRow}>
          {[
            { name: 'Carbs', val: '0 / 144g' },
            { name: 'Protein', val: '0 / 58g' },
            { name: 'Fat', val: '0 / 38g' },
          ].map((m, i, arr) => (
            <View
              key={m.name}
              style={[s.macroCell, i < arr.length - 1 && s.macroBorder]}
            >
              <Text style={s.macroName}>{m.name}</Text>
              <Text style={s.macroVal}>{m.val}</Text>
            </View>
          ))}
        </View>

        {/* ── DATE SWITCHER ────────────────────── */}
        <View style={s.dateSwitcher}>
          <TouchableOpacity onPress={prevDay} style={s.dateArrow}>
            <Text style={s.dateArrowTxt}>‹</Text>
          </TouchableOpacity>
          <Text style={s.dateLabel}>{formatDate(activeDate)}</Text>
          <TouchableOpacity onPress={nextDay} style={s.dateArrow}>
            <Text style={s.dateArrowTxt}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── MEAL ROWS ────────────────────────── */}
        <View style={s.mealsSection}>
          {MEALS.map((meal) => (
            <View key={meal.key} style={s.mealRow}>
              <View style={[s.mealDot, { backgroundColor: meal.dot }]} />
              <View style={s.mealInfo}>
                <Text style={s.mealName}>{meal.label}</Text>
                <Text style={s.mealRec}>Recommended: {meal.rec}</Text>
              </View>
              <TouchableOpacity style={s.mealAdd}>
                <Text style={s.mealAddTxt}>+</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* ── BOTTOM NAV ───────────────────────── */}
      <View style={s.bottomNav}>
        <TouchableOpacity style={s.navItem}>
          <Text style={s.navActive}>Diary</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.plusWrap}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#FF7F50', '#F08080']} style={s.plusBtn}>
            <Text style={s.plusTxt}>+</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={s.navItem}>
          <Text style={s.navInactive}>Goals</Text>
        </TouchableOpacity>
      </View>

      {/* ── ADD MEAL MODAL ───────────────────── */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>ADD MEAL</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={s.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={s.modalGrid}>
              {['SEARCH\nFOOD', 'MEAL\nSCAN', 'MANUAL\nENTRY'].map((label) => (
                <TouchableOpacity key={label} style={s.modalCard}>
                  <Text style={s.modalCardTxt}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <LinearGradient colors={['#FF7F50', '#F08080']} style={s.logBtn}>
                <Text style={s.logBtnTxt}>LOG MEAL</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  scroll: { flex: 1 },

  // Header
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center' },
  appTitle: { fontSize: 18, fontWeight: '700', color: '#d9522a', letterSpacing: 0.5, marginBottom: 14 },
  circleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  sideStat: { width: 55, alignItems: 'center' },
  sideVal: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  sideLbl: { fontSize: 10, color: '#aaa', fontWeight: '600', letterSpacing: 0.5, marginTop: 2 },

  // Ring
  ringWrap: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  ringInner: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },

  // Cat
  catImg: { width: 72, height: 72, resizeMode: 'contain' },
  catPlaceholder: {
    width: 72, height: 72, borderRadius: 8,
    backgroundColor: 'rgba(255,127,80,0.07)',
    borderWidth: 1.5, borderColor: 'rgba(255,127,80,0.25)',
    borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  catPlaceholderTxt: { fontSize: 9, color: 'rgba(255,127,80,0.5)', fontWeight: '700', textAlign: 'center', lineHeight: 14 },

  kcalNum: { fontSize: 22, fontWeight: '900', color: '#1a1a1a', marginTop: 4 },
  kcalSub: { fontSize: 10, color: '#bbb', fontWeight: '600', letterSpacing: 0.4 },

  seeStatsBtn: { marginTop: 10 },
  seeStatsTxt: { fontSize: 11, fontWeight: '700', color: '#c0441a', letterSpacing: 0.5 },

  // Macros
  macrosRow: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  macroCell: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  macroBorder: { borderRightWidth: 0.5, borderRightColor: '#f0f0f0' },
  macroName: { fontSize: 11, color: '#bbb', fontWeight: '600', letterSpacing: 0.3 },
  macroVal: { fontSize: 13, fontWeight: '800', color: '#1a1a1a', marginTop: 2 },

  // Date
  dateSwitcher: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  dateArrow: { paddingHorizontal: 10, paddingVertical: 4 },
  dateArrowTxt: { fontSize: 22, color: '#ccc', fontWeight: '300' },
  dateLabel: { fontSize: 12, fontWeight: '700', color: '#666', letterSpacing: 0.3 },

  // Meals
  mealsSection: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 100 },
  mealRow: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 9, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: '#f0f0f0' },
  mealDot: { width: 10, height: 10, borderRadius: 5 },
  mealInfo: { flex: 1 },
  mealName: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  mealRec: { fontSize: 11, color: '#ccc', marginTop: 2 },
  mealAdd: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: '#FF7F50', alignItems: 'center', justifyContent: 'center' },
  mealAddTxt: { fontSize: 20, fontWeight: '300', color: '#FF7F50', lineHeight: 24 },

  // Bottom nav
  bottomNav: { flexDirection: 'row', backgroundColor: '#fff', height: 80, alignItems: 'center', borderTopWidth: 0.5, borderTopColor: '#f0f0f0' },
  navItem: { flex: 1, alignItems: 'center' },
  navActive: { fontSize: 11, fontWeight: '700', color: '#FF7F50' },
  navInactive: { fontSize: 11, fontWeight: '700', color: '#ccc' },
  plusWrap: { bottom: 20 },
  plusBtn: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', shadowColor: '#FF7F50', shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  plusTxt: { color: '#fff', fontSize: 32, fontWeight: '200' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 48 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  modalTitle: { fontSize: 16, fontWeight: '900', color: '#1a1a1a', letterSpacing: 1 },
  modalClose: { fontSize: 18, color: '#ccc' },
  modalGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  modalCard: { flex: 1, aspectRatio: 1, backgroundColor: '#fafafa', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,127,80,0.15)', alignItems: 'center', justifyContent: 'center' },
  modalCardTxt: { fontSize: 11, fontWeight: '900', color: '#FF7F50', textAlign: 'center', letterSpacing: 0.8, lineHeight: 16 },
  logBtn: { borderRadius: 18, paddingVertical: 18, alignItems: 'center' },
  logBtnTxt: { color: '#fff', fontWeight: '900', letterSpacing: 2, fontSize: 14 },
});