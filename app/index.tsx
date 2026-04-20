import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const wave1Anim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;
  const wave3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 7, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();

    const waveLoop = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 3000, delay, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 3000, useNativeDriver: true }),
        ])
      ).start();

    waveLoop(wave1Anim, 0);
    waveLoop(wave2Anim, 600);
    waveLoop(wave3Anim, 1200);
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { backgroundColor: '#FFF0EC' }]}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  const wave1Y = wave1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const wave2Y = wave2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const wave3Y = wave3Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  return (
    <View style={styles.container}>
      <View style={styles.bg} />

      {/* Coral pink waves */}
      <Animated.View style={[styles.wave, styles.wave3, { transform: [{ translateY: wave3Y }] }]} />
      <Animated.View style={[styles.wave, styles.wave2, { transform: [{ translateY: wave2Y }] }]} />
      <Animated.View style={[styles.wave, styles.wave1, { transform: [{ translateY: wave1Y }] }]} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>

        {/* Tamagotchi device */}
        <View style={styles.deviceOuter}>
          <View style={styles.deviceInner}>
            <View style={styles.screen}>
              {/* PASTE YOUR LOGO IMAGE in assets/images/logo.png then use this: */}
              <Image
                source={require('../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              {/*
                If logo not ready yet, comment out the Image above
                and uncomment this placeholder:

                <View style={styles.logoPlaceholder}>
                  <Text style={styles.placeholderText}>LOGO</Text>
                </View>
              */}
            </View>
            <View style={styles.screenGlare} />
          </View>
          <View style={styles.deviceButtons}>
            <View style={styles.deviceBtn} />
            <View style={[styles.deviceBtn, styles.deviceBtnMid]} />
            <View style={styles.deviceBtn} />
          </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  bg: { ...StyleSheet.absoluteFillObject, backgroundColor: '#FFF0EC' },

  wave: { position: 'absolute', width: width * 2, borderRadius: 999 },
  wave1: { height: 380, bottom: -180, left: -width * 0.5, backgroundColor: '#FF6B6B', opacity: 0.35 },
  wave2: { height: 340, bottom: -200, left: -width * 0.3, backgroundColor: '#FF8C69', opacity: 0.30 },
  wave3: { height: 300, bottom: -220, left: -width * 0.1, backgroundColor: '#FFB347', opacity: 0.20 },

  content: { alignItems: 'center', marginBottom: 60 },

  deviceOuter: {
    width: 140, height: 160, borderRadius: 50,
    backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#FF6B6B', shadowOpacity: 0.45, shadowRadius: 24, shadowOffset: { width: 0, height: 10 },
    borderWidth: 4, borderColor: '#FF8C69', paddingTop: 10,
  },
  deviceInner: {
    width: 100, height: 100, borderRadius: 20,
    backgroundColor: '#FFF0EC', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(0,0,0,0.1)', overflow: 'hidden',
  },
  screen: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFE4DC' },
  screenGlare: { position: 'absolute', top: 4, left: 4, width: 28, height: 14, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.5)' },
  logoImage: { width: 72, height: 72 },
  logoPlaceholder: { width: 72, height: 72, borderRadius: 14, backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 2 },

  deviceButtons: { flexDirection: 'row', gap: 8, marginTop: 10 },
  deviceBtn: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#FF8C69', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  deviceBtnMid: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFD700' },

  appName: { fontSize: 32, fontFamily: 'PressStart2P_400Regular', color: '#CC3D3D', letterSpacing: 2, textShadowColor: 'rgba(255,107,107,0.3)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 6 },
  tagline: { fontSize: 8, fontFamily: 'PressStart2P_400Regular', color: '#FF6B6B', letterSpacing: 2, marginTop: 12 },
  sub: { fontSize: 9, color: '#FF8C69', marginTop: 14, fontFamily: 'PressStart2P_400Regular', lineHeight: 16, textAlign: 'center', paddingHorizontal: 20 },

  buttons: { position: 'absolute', bottom: 60, width: width - 48, alignItems: 'center' },
  btnPrimary: { width: '100%', backgroundColor: '#FF6B6B', borderRadius: 18, paddingVertical: 18, alignItems: 'center', marginBottom: 14, shadowColor: '#FF6B6B', shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  btnPrimaryText: { color: '#fff', fontFamily: 'PressStart2P_400Regular', fontSize: 12, letterSpacing: 1 },
  btnSecondary: { paddingVertical: 10 },
  btnSecondaryText: { color: '#FF6B6B', fontFamily: 'PressStart2P_400Regular', fontSize: 9 },
});
