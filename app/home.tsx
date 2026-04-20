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
  const size = 220;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = CONSUMED / GOAL;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* Top Header Section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.userName}>Let's crush it today!</Text>
        </View>

        {/* Circular Progress Section */}
        <View style={styles.circleContainer}>
          <Svg width={size} height={size}>
            {/* Background Circle */}
            <Circle
              stroke="rgba(255, 255, 255, 0.1)"
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
              source={{ uri: 'https://placeholder.com/pixel-cat.png' }} // Replace with your cat asset
              style={styles.pixelCat}
            />
            <Text style={styles.calBigNumber}>{CONSUMED}</Text>
            <Text style={styles.calSubText}>of {GOAL} kcal</Text>
          </View>
        </View>

        {/* Quick Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>87g</Text>
            <Text style={styles.statLabel}>Protein</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>122g</Text>
            <Text style={styles.statLabel}>Carbs</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>42g</Text>
            <Text style={styles.statLabel}>Fats</Text>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Navigation with Floating Plus Button */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}><Text style={styles.navLabelActive}>Home</Text></TouchableOpacity>

        <TouchableOpacity
          style={styles.plusButtonContainer}
          onPress={() => setModalVisible(true)}
        >
          <LinearGradient colors={['#FF7F50', '#F08080']} style={styles.plusButton}>
            <Text style={styles.plusIcon}>+</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}><Text style={styles.navLabel}>Profile</Text></TouchableOpacity>
      </View>

      {/* ADD MEAL MODAL (The Popup) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Meal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Popup Options */}
            <TouchableOpacity style={styles.popupOption}>
              <Text style={styles.optionText}>Search Food</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.popupOption}>
              <Text style={styles.optionText}>AI Camera Detection</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.popupOption}>
              <Text style={styles.optionText}>Manual Entry</Text>
            </TouchableOpacity>

            <LinearGradient colors={['#FF7F50', '#F08080']} style={styles.logBtn}>
              <Text style={styles.logBtnText}>LOG MEAL</Text>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  body: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 25, marginBottom: 30 },
  greeting: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
  userName: { color: '#fff', fontSize: 26, fontWeight: '900' },

  // Circle Styles
  circleContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
  innerCircleContent: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  pixelCat: { width: 80, height: 80, marginBottom: 10, resizeMode: 'contain' },
  calBigNumber: { color: '#fff', fontSize: 42, fontWeight: '900' },
  calSubText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginTop: 40 },
  statBox: { alignItems: 'center', backgroundColor: '#1E1E1E', padding: 15, borderRadius: 20, width: width * 0.28 },
  statVal: { color: '#FF7F50', fontSize: 18, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600', marginTop: 4 },

  // Bottom Nav & Floating Button
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    height: 80,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)'
  },
  navItem: { flex: 1, alignItems: 'center' },
  navLabel: { color: 'rgba(255,255,255,0.4)', fontWeight: '700' },
  navLabelActive: { color: '#FF7F50', fontWeight: '800' },
  plusButtonContainer: { bottom: 30 },
  plusButton: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', elevation: 10, shadowColor: '#FF7F50', shadowOpacity: 0.5, shadowRadius: 10 },
  plusIcon: { color: '#fff', fontSize: 35, fontWeight: '300' },

  // Modal Styles (Popup)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E1E1E', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  closeBtn: { color: 'rgba(255,255,255,0.5)', fontSize: 20 },
  popupOption: { backgroundColor: '#2A2A2A', padding: 20, borderRadius: 15, marginBottom: 12 },
  optionText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  logBtn: { borderRadius: 15, paddingVertical: 18, alignItems: 'center', marginTop: 10 },
  logBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 1.5 }
});