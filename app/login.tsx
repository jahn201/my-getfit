import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const wave1Anim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;
  const wave3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
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

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, width: '100%' }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Welcome{'\n'}Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your fitness journey</Text>
          </Animated.View>

          <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(180,80,60,0.4)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(180,80,60,0.4)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotWrap}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/home')} activeOpacity={0.85} style={styles.loginBtn}>
              <Text style={styles.loginBtnText}>LOG IN</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', overflow: 'hidden' },
  bg: { ...StyleSheet.absoluteFillObject, backgroundColor: '#FFF0EC' },

  wave: { position: 'absolute', width: width * 2, borderRadius: 999 },
  wave1: { height: 380, bottom: -180, left: -width * 0.5, backgroundColor: '#FF6B6B', opacity: 0.35 },
  wave2: { height: 340, bottom: -200, left: -width * 0.3, backgroundColor: '#FF8C69', opacity: 0.30 },
  wave3: { height: 300, bottom: -220, left: -width * 0.1, backgroundColor: '#FFB347', opacity: 0.20 },

  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 60, width: width },
  header: { paddingTop: 60, marginBottom: 32 },
  backBtn: { marginBottom: 24 },
  backText: { color: '#FF6B6B', fontSize: 15, fontWeight: '600' },
  title: { fontSize: 44, fontWeight: '900', color: '#CC3D3D', lineHeight: 48, letterSpacing: 1 },
  subtitle: { color: '#FF8C69', fontSize: 14, marginTop: 10, fontWeight: '500' },

  form: { flex: 1 },
  inputGroup: { marginBottom: 18 },
  label: { color: '#FF6B6B', fontSize: 11, fontWeight: '800', letterSpacing: 3, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,107,107,0.08)',
    borderRadius: 14, paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: 'rgba(255,107,107,0.25)',
  },
  input: { flex: 1, color: '#CC3D3D', fontSize: 15, paddingVertical: 16, fontWeight: '500' },
  eyeIcon: { fontSize: 18, paddingLeft: 8 },
  forgotWrap: { alignItems: 'flex-end', marginBottom: 24, marginTop: -6 },
  forgotText: { color: '#FF6B6B', fontSize: 13, fontWeight: '600' },

  loginBtn: {
    width: '100%', backgroundColor: '#FF6B6B', borderRadius: 18,
    paddingVertical: 18, alignItems: 'center', marginBottom: 24,
    shadowColor: '#FF6B6B', shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 6 },
  },
  loginBtnText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 2 },

  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,107,107,0.2)' },
  dividerText: { color: '#FF8C69', marginHorizontal: 14, fontSize: 12, fontWeight: '700', letterSpacing: 2 },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, marginBottom: 32,
    gap: 10, borderWidth: 1.5, borderColor: 'rgba(255,107,107,0.2)',
    shadowColor: '#FF6B6B', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  googleIcon: { fontSize: 18, fontWeight: '900', color: '#EA4335' },
  googleText: { color: '#CC3D3D', fontWeight: '700', fontSize: 15 },

  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { color: '#FF8C69', fontSize: 14 },
  registerLink: { color: '#FF6B6B', fontWeight: '800', fontSize: 14 },
});