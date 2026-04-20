import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type Tab = 'search' | 'barcode' | 'camera' | 'manual';

const searchResults = [
  { name: 'Chicken Breast (100g)', cal: 165, p: 31, c: 0, f: 4 },
  { name: 'Brown Rice (1 cup)', cal: 216, p: 5, c: 45, f: 2 },
  { name: 'Banana (medium)', cal: 105, p: 1, c: 27, f: 0 },
  { name: 'Whole Milk (240ml)', cal: 149, p: 8, c: 12, f: 8 },
  { name: 'Avocado (half)', cal: 120, p: 2, c: 6, f: 11 },
];

export default function LogMealScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [query, setQuery] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualCal, setManualCal] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const filtered = searchResults.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));

  const tabs: { key: Tab; label: string }[] = [
    { key: 'search', label: 'SEARCH' },
    { key: 'barcode', label: 'BARCODE' },
    { key: 'camera', label: 'CAMERA AI' },
    { key: 'manual', label: 'MANUAL' },
  ];

  return (
    <View style={styles.container}>
      {/* Header - Coral Pink Gradient */}
      <LinearGradient colors={['#FF7F50', '#F08080']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Log a Meal</Text>
        <Text style={styles.subtitle}>Track what you eat</Text>
      </LinearGradient>

      {/* Tab Selector */}
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* SEARCH TAB */}
          {activeTab === 'search' && (
            <View>
              <View style={styles.searchWrap}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search food, e.g. 'chicken breast'"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={query}
                  onChangeText={setQuery}
                />
              </View>
              {query.length > 0 && filtered.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.resultCard, selected === i && styles.resultCardSelected]}
                  onPress={() => setSelected(i)}
                >
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{item.name}</Text>
                    <View style={styles.macroTags}>
                      <Text style={styles.tag}>P: {item.p}g</Text>
                      <Text style={styles.tag}>C: {item.c}g</Text>
                      <Text style={styles.tag}>F: {item.f}g</Text>
                    </View>
                  </View>
                  <View style={styles.resultCal}>
                    <Text style={styles.resultCalNum}>{item.cal}</Text>
                    <Text style={styles.resultCalLabel}>KCAL</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* BARCODE TAB */}
          {activeTab === 'barcode' && (
            <View style={styles.scanContainer}>
              <View style={styles.scanFrame}>
                <View style={styles.scanCornerTL} />
                <View style={styles.scanCornerTR} />
                <View style={styles.scanCornerBL} />
                <View style={styles.scanCornerBR} />
                <Text style={styles.scanText}>POINT CAMERA AT BARCODE</Text>
              </View>
              <TouchableOpacity style={styles.scanBtn}>
                <LinearGradient colors={['#FF7F50', '#F08080']} style={styles.scanBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.scanBtnText}>OPEN CAMERA SCANNER</Text>
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.scanHint}>Supports all standard food barcodes (EAN, UPC)</Text>
            </View>
          )}

          {/* CAMERA AI TAB */}
          {activeTab === 'camera' && (
            <View style={styles.scanContainer}>
              <View style={[styles.scanFrame, { borderColor: '#F08080' }]}>
                <View style={[styles.scanCornerTL, { borderColor: '#F08080' }]} />
                <View style={[styles.scanCornerTR, { borderColor: '#F08080' }]} />
                <View style={[styles.scanCornerBL, { borderColor: '#F08080' }]} />
                <View style={[styles.scanCornerBR, { borderColor: '#F08080' }]} />
                <Text style={styles.scanText}>AI FOOD DETECTION</Text>
                <Text style={styles.scanSubText}>Take a photo of your meal</Text>
              </View>
              <TouchableOpacity style={styles.scanBtn}>
                <LinearGradient colors={['#FF7F50', '#F08080']} style={styles.scanBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.scanBtnText}>TAKE PHOTO</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.galleryBtn}>
                <Text style={styles.galleryBtnText}>CHOOSE FROM GALLERY</Text>
              </TouchableOpacity>
              <Text style={styles.scanHint}>AI will automatically identify food and estimate calories</Text>
            </View>
          )}

          {/* MANUAL TAB */}
          {activeTab === 'manual' && (
            <View style={styles.manualForm}>
              <Text style={styles.manualTitle}>ENTER FOOD DETAILS</Text>
              {[
                { label: 'FOOD NAME', value: manualName, setter: setManualName, placeholder: 'e.g. Grilled Salmon', keyboard: 'default' },
                { label: 'CALORIES (KCAL)', value: manualCal, setter: setManualCal, placeholder: '0', keyboard: 'numeric' },
                { label: 'PROTEIN (G)', value: manualProtein, setter: setManualProtein, placeholder: '0', keyboard: 'numeric' },
                { label: 'CARBS (G)', value: manualCarbs, setter: setManualCarbs, placeholder: '0', keyboard: 'numeric' },
                { label: 'FAT (G)', value: manualFat, setter: setManualFat, placeholder: '0', keyboard: 'numeric' },
              ].map((field) => (
                <View key={field.label} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{field.label}</Text>
                  <TextInput
                    style={styles.manualInput}
                    placeholder={field.placeholder}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={field.value}
                    onChangeText={field.setter}
                    keyboardType={field.keyboard as any}
                  />
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Log Button */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <LinearGradient colors={['#FF7F50', '#F08080']} style={styles.logBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.logBtnText}>LOG MEAL</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn: { marginBottom: 12 },
  backText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '800' },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 0.5 },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500', marginTop: 4 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14, backgroundColor: '#1E1E1E' },
  tabActive: { backgroundColor: 'rgba(255,127,80,0.15)', borderWidth: 1, borderColor: '#FF7F50' },
  tabLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  tabLabelActive: { color: '#FF7F50' },
  body: { flex: 1, paddingHorizontal: 16 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', borderRadius: 16, paddingHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  searchInput: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 16 },
  resultCard: { flexDirection: 'row', backgroundColor: '#1E1E1E', borderRadius: 16, padding: 16, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  resultCardSelected: { borderColor: '#FF7F50', backgroundColor: 'rgba(255,127,80,0.05)' },
  resultInfo: { flex: 1 },
  resultName: { color: '#fff', fontWeight: '700', fontSize: 14 },
  macroTags: { flexDirection: 'row', gap: 6, marginTop: 6 },
  tag: { color: '#FF7F50', fontSize: 10, fontWeight: '800', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: 'rgba(255,127,80,0.1)' },
  resultCal: { alignItems: 'center' },
  resultCalNum: { color: '#FF7F50', fontSize: 20, fontWeight: '900' },
  resultCalLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '800' },
  scanContainer: { alignItems: 'center', paddingTop: 20 },
  scanFrame: { width: width - 80, height: 220, borderRadius: 24, borderWidth: 2, borderColor: '#FF7F50', alignItems: 'center', justifyContent: 'center', marginBottom: 28, backgroundColor: 'rgba(255,127,80,0.05)', position: 'relative' },
  scanCornerTL: { position: 'absolute', top: -2, left: -2, width: 24, height: 24, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#FF7F50', borderTopLeftRadius: 12 },
  scanCornerTR: { position: 'absolute', top: -2, right: -2, width: 24, height: 24, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#FF7F50', borderTopRightRadius: 12 },
  scanCornerBL: { position: 'absolute', bottom: -2, left: -2, width: 24, height: 24, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#FF7F50', borderBottomLeftRadius: 12 },
  scanCornerBR: { position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#FF7F50', borderBottomRightRadius: 12 },
  scanText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  scanSubText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 6, fontWeight: '600' },
  scanBtn: { width: width - 80, marginBottom: 12 },
  scanBtnGrad: { borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  scanBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 1.5 },
  galleryBtn: { paddingVertical: 14, width: width - 80, alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 16 },
  galleryBtnText: { color: 'rgba(255,255,255,0.6)', fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  scanHint: { color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center', fontWeight: '600', paddingHorizontal: 20 },
  manualForm: { paddingTop: 8 },
  manualTitle: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 20, letterSpacing: 1 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  manualInput: { backgroundColor: '#1E1E1E', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 40, backgroundColor: '#121212', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  logBtn: { borderRadius: 20, paddingVertical: 20, alignItems: 'center' },
  logBtnText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 3 },
});