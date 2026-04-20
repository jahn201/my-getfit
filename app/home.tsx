import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const GOAL = 2200;

const meals = [
  { id: '1', name: 'Oatmeal with Berries', cal: 320, time: '8:00 AM', emoji: '🥣', macro: { p: 12, c: 58, f: 6 } },
  { id: '2', name: 'Grilled Chicken Salad', cal: 480, time: '12:30 PM', emoji: '🥗', macro: { p: 45, c: 22, f: 14 } },
  { id: '3', name: 'Protein Shake', cal: 180, time: '3:00 PM', emoji: '🥤', macro: { p: 30, c: 8, f: 3 } },
];

export default function HomeScreen() {
  const router = useRouter();
  const consumed = meals.reduce((sum, m) => sum + m.cal, 0);
  const remaining = GOAL - consumed;
  const progress = consumed / GOAL;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(progressAnim, { toValue: progress, duration: 1200, useNativeDriver: false }),
    ]).start();
  }, []);

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#FF4D4D', '#FF8C00']} style={styles.headerGrad}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Good morning 👋</Text>
              <Text style={styles.userName}>Let's crush it today!</Text>
            </View>
            <TouchableOpacity style={styles.avatar}>
              <Text style={styles.avatarText}>J</Text>
            </TouchableOpacity>
          </View>

          {/* Calorie Ring Summary */}
          <View style={styles.calCard}>
            <View style={styles.calMain}>
              <Text style={styles.calNumber}>{consumed}</Text>
              <Text style={styles.calLabel}>kcal eaten</Text>
            </View>
            <View style={styles.calDivider} />
            <View style={styles.calSub}>
              <Text style={styles.calSubNumber}>{GOAL}</Text>
              <Text style={styles.calSubLabel}>Goal</Text>
            </View>
            <View style={styles.calDivider} />
            <View style={styles.calSub}>
              <Text style={[styles.calSubNumber, remaining < 0 && { color: '#FF4D4D' }]}>{Math.abs(remaining)}</Text>
              <Text style={styles.calSubLabel}>{remaining >= 0 ? 'Left' : 'Over'}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBg}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.progressLabel}>{Math.round(progress * 100)}% of daily goal</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Macros */}
        <Animated.View style={[styles.macroRow, { opacity: fadeAnim }]}>
          {[
            { label: 'Protein', val: '87g', color: '#FF4D4D', emoji: '🥩' },
            { label: 'Carbs', val: '88g', color: '#FF8C00', emoji: '🍞' },
            { label: 'Fats', val: '23g', color: '#FFD700', emoji: '🥑' },
            { label: 'Water', val: '1.2L', color: '#00BFFF', emoji: '💧' },
          ].map((m) => (
            <View key={m.label} style={[styles.macroCard, { borderTopColor: m.color }]}>
              <Text style={styles.macroEmoji}>{m.emoji}</Text>
              <Text style={[styles.macroVal, { color: m.color }]}>{m.val}</Text>
              <Text style={styles.macroLabel}>{m.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Today's Meals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            <TouchableOpacity onPress={() => router.push('/log-meal')}>
              <LinearGradient colors={['#FF4D4D', '#FF8C00']} style={styles.addBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.addBtnText}>+ Add Meal</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {meals.map((meal, i) => (
            <Animated.View key={meal.id} style={[styles.mealCard, { opacity: fadeAnim }]}>
              <View style={styles.mealEmoji}>
                <Text style={{ fontSize: 28 }}>{meal.emoji}</Text>
              </View>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealTime}>{meal.time}</Text>
                <View style={styles.mealMacros}>
                  <Text style={styles.mealMacroTag}>P: {meal.macro.p}g</Text>
                  <Text style={styles.mealMacroTag}>C: {meal.macro.c}g</Text>
                  <Text style={styles.mealMacroTag}>F: {meal.macro.f}g</Text>
                </View>
              </View>
              <View style={styles.mealCal}>
                <Text style={styles.mealCalNum}>{meal.cal}</Text>
                <Text style={styles.mealCalLabel}>kcal</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Quick Log Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Log</Text>
          <View style={styles.quickRow}>
            {[
              { label: 'Search Food', emoji: '🔍', route: '/log-meal' },
              { label: 'Scan Barcode', emoji: '📷', route: '/log-meal' },
              { label: 'Camera AI', emoji: '🤖', route: '/log-meal' },
              { label: 'Manual Entry', emoji: '✏️', route: '/log-meal' },
            ].map((q) => (
              <TouchableOpacity key={q.label} style={styles.quickCard} onPress={() => router.push(q.route as any)}>
                <Text style={styles.quickEmoji}>{q.emoji}</Text>
                <Text style={styles.quickLabel}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {[
          { icon: '🏠', label: 'Home', active: true },
          { icon: '📊', label: 'Stats', active: false },
          { icon: '🎯', label: 'Goals', active: false },
          { icon: '👤', label: 'Profile', active: false },
        ].map((tab) => (
          <TouchableOpacity key={tab.label} style={styles.navItem}>
            <Text style={styles.navIcon}>{tab.icon}</Text>
            <Text style={[styles.navLabel, tab.active && styles.navLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  headerGrad: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  userName: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 0.5 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  calCard: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 16, marginBottom: 16, alignItems: 'center' },
  calMain: { flex: 1, alignItems: 'center' },
  calNumber: { color: '#fff', fontSize: 36, fontWeight: '900' },
  calLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  calDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  calSub: { flex: 1, alignItems: 'center' },
  calSubNumber: { color: '#fff', fontSize: 22, fontWeight: '800' },
  calSubLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  progressBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },
  progressLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', textAlign: 'right' },
  body: { flex: 1 },
  macroRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 20, gap: 10 },
  macroCard: { flex: 1, backgroundColor: '#1a1a2e', borderRadius: 16, padding: 12, alignItems: 'center', borderTopWidth: 3 },
  macroEmoji: { fontSize: 20, marginBottom: 4 },
  macroVal: { fontSize: 16, fontWeight: '900' },
  macroLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  addBtn: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  mealCard: { flexDirection: 'row', backgroundColor: '#1a1a2e', borderRadius: 18, padding: 14, marginBottom: 12, alignItems: 'center', gap: 12 },
  mealEmoji: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,140,0,0.15)', alignItems: 'center', justifyContent: 'center' },
  mealInfo: { flex: 1 },
  mealName: { color: '#fff', fontWeight: '700', fontSize: 14 },
  mealTime: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2, fontWeight: '600' },
  mealMacros: { flexDirection: 'row', gap: 6, marginTop: 6 },
  mealMacroTag: { backgroundColor: 'rgba(255,140,0,0.15)', color: '#FF8C00', fontSize: 10, fontWeight: '700', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  mealCal: { alignItems: 'center' },
  mealCalNum: { color: '#FF8C00', fontSize: 20, fontWeight: '900' },
  mealCalLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700' },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickCard: { width: (width - 56) / 2, backgroundColor: '#1a1a2e', borderRadius: 18, padding: 18, alignItems: 'center' },
  quickEmoji: { fontSize: 32, marginBottom: 8 },
  quickLabel: { color: '#fff', fontWeight: '700', fontSize: 13, textAlign: 'center' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#1a1a2e', paddingBottom: 28, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  navItem: { flex: 1, alignItems: 'center' },
  navIcon: { fontSize: 22 },
  navLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700', marginTop: 3 },
  navLabelActive: { color: '#FF8C00' },
});
