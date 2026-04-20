import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 7, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#FF4D4D', '#FF8C00', '#FFD700']} style={styles.container}>
      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🔥</Text>
        </View>
        <Text style={styles.appName}>GetFit</Text>
        <Text style={styles.tagline}>FUEL YOUR BEST SELF</Text>
        <Text style={styles.sub}>Track calories. Crush goals. Live bold.</Text>
      </Animated.View>

      <Animated.View style={[styles.buttons, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/register')}>
          <Text style={styles.btnPrimaryText}>GET STARTED</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/login')}>
          <Text style={styles.btnSecondaryText}>I already have an account</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  circle1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255,255,255,0.08)', top: -80, right: -80 },
  circle2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.06)', bottom: 100, left: -60 },
  circle3: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.05)', top: height * 0.3, left: width * 0.6 },
  content: { alignItems: 'center', marginBottom: 60 },
  logoBox: { width: 100, height: 100, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } },
  logoEmoji: { fontSize: 52 },
  appName: { fontSize: 56, fontWeight: '900', color: '#fff', letterSpacing: 4, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 8 },
  tagline: { fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.85)', letterSpacing: 8, marginTop: 4 },
  sub: { fontSize: 15, color: 'rgba(255,255,255,0.75)', marginTop: 14, fontWeight: '500' },
  buttons: { position: 'absolute', bottom: 60, width: width - 48, alignItems: 'center' },
  btnPrimary: { width: '100%', backgroundColor: '#fff', borderRadius: 18, paddingVertical: 18, alignItems: 'center', marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  btnPrimaryText: { color: '#FF4D4D', fontWeight: '900', fontSize: 16, letterSpacing: 2 },
  btnSecondary: { paddingVertical: 10 },
  btnSecondaryText: { color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: 14 },
});
