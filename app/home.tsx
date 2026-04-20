import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Modal, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const GOAL = 2200;
const CONSUMED = 980;

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  // Circular Progress Logic
  const size = 240;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = CONSUMED / GOAL;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.userName}>Let's crush it today!</Text>
        </View>

        {/* Circular Progress Section */}
        <View style={styles.circleContainer}>
          <Svg width={size} height={size}>
            {/* Background Circle */}
            <Circle
              stroke="rgba(255, 255, 255, 0.05)"
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
            />
            {/* Progress Circle (Coral Pink) */}
            <Circle
              stroke="#FF7F50"
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>

          {/* Inner Content: Pixel Cat & Calories */}
          <View style={styles.innerCircleContent}>
            <Image
              source={{ uri: 'https://i.imgur.com/your-pixel-cat-link.png' }} // REPLACE WITH LOCAL PATH OR URL
              style={styles.pixelCat}
            />
            <Text style={styles.calBigNumber}>{CONSUMED}</Text>
            <Text style={styles.calSubText}>of {GOAL} kcal</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Protein', val: '87g', color: '#FF7F50' },
            { label: 'Carbs', val: '122g', color: '#F08080' },
            { label: 'Fats', val: '42g', color: '#FFA07A' },
          ].map((item) => (
            <View key={item.label} style={styles.statBox}>
              <Text style={[styles.statVal, { color: item.color }]}>{item.val}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Bottom Nav with Plus Button */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}><Text style={styles.navLabelActive}>Home</Text></TouchableOpacity>

        <TouchableOpacity
          style={styles.plusButtonContainer}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.9}
        >
          <LinearGradient colors={['#FF7F50', '#F08080']} style={styles.plusButton}>
            <Text style={styles.plusIcon}>+</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}><Text style={styles.navLabel}>Profile</Text></TouchableOpacity>
      </View>

      {/* ADD MEAL POPUP */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ADD MEAL</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtnArea}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Three Squares Row */}
            <View style={styles.squareRow}>
              <TouchableOpacity style={styles.squareOption}>
                <View style={styles.squareInner}>
                  <Text style={styles.squareText}>SEARCH</Text>
                  <Text style={styles.squareSubText}>FOOD</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.squareOption}>
                <View style={styles.squareInner}>
                  <Text style={styles.squareText}>MEAL</Text>
                  <Text style={styles.squareSubText}>SCAN</Text>
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
                <Text style={styles.logBtnText}>LOG MEAL</Text>
              </LinearGradient>
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
  header: { paddingTop: 60, paddingHorizontal: 25, marginBottom: 10 },
  greeting: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  userName: { color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 2 },

  // Circle Progress
  circleContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 30 },
  innerCircleContent: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  pixelCat: { width: 90, height: 90, marginBottom: 5, resizeMode: 'contain' },
  calBigNumber: { color: '#fff', fontSize: 48, fontWeight: '900' },
  calSubText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '700' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  statBox: { alignItems: 'center', backgroundColor: '#1E1E1E', paddingVertical: 20, borderRadius: 24, width: (width - 60) / 3 },
  statVal: { fontSize: 18, fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '800', marginTop: 4, letterSpacing: 1 },

  // Bottom Nav
  bottomNav: { flexDirection: 'row', backgroundColor: '#1E1E1E', height: 85, alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  navItem: { flex: 1, alignItems: 'center' },
  navLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '800' },
  navLabelActive: { color: '#FF7F50', fontSize: 12, fontWeight: '800' },
  plusButtonContainer: { bottom: 35 },
  plusButton: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#FF7F50', shadowOpacity: 0.4, shadowRadius: 12 },
  plusIcon: { color: '#fff', fontSize: 40, fontWeight: '200' },

  // Modal (Popup)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E1E1E', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  closeBtnArea: { padding: 5 },
  closeBtn: { color: 'rgba(255,255,255,0.3)', fontSize: 18 },

  // Square Grid
  squareRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 30 },
  squareOption: { flex: 1, aspectRatio: 1, backgroundColor: '#262626', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,127,80,0.1)' },
  squareInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  squareText: { color: '#FF7F50', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  squareSubText: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '800', marginTop: 4 },

  logBtn: { borderRadius: 20, paddingVertical: 20, alignItems: 'center' },
  logBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 2, fontSize: 15 }
});