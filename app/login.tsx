import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.bg}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.titleRow}>
              <Text style={styles.fireEmoji}>🔥</Text>
              <Text style={styles.title}>Welcome{'\n'}Back</Text>
            </View>
            <Text style={styles.subtitle}>Sign in to continue your fitness journey</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(255,255,255,0.3)"
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
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.3)"
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

            {/* Login Button */}
            <TouchableOpacity onPress={() => router.push('/home')} activeOpacity={0.85}>
              <LinearGradient colors={['#FF4D4D', '#FF8C00']} style={styles.loginBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.loginBtnText}>LOG IN 🚀</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In */}
            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Register link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  header: { paddingTop: 60, marginBottom: 32 },
  backBtn: { marginBottom: 24 },
  backText: { color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: '600' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  fireEmoji: { fontSize: 40, marginTop: 4 },
  title: { fontSize: 44, fontWeight: '900', color: '#fff', lineHeight: 48, letterSpacing: 1 },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 10, fontWeight: '500' },
  form: { flex: 1 },
  inputGroup: { marginBottom: 18 },
  label: { color: 'rgba(255,165,0,0.9)', fontSize: 11, fontWeight: '800', letterSpacing: 3, marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 16, fontWeight: '500' },
  eyeIcon: { fontSize: 18, paddingLeft: 8 },
  forgotWrap: { alignItems: 'flex-end', marginBottom: 24, marginTop: -6 },
  forgotText: { color: '#FF8C00', fontSize: 13, fontWeight: '600' },
  loginBtn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 24, shadowColor: '#FF4D4D', shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  loginBtnText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 2 },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  dividerText: { color: 'rgba(255,255,255,0.4)', marginHorizontal: 14, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, marginBottom: 32, gap: 10 },
  googleIcon: { fontSize: 18, fontWeight: '900', color: '#EA4335' },
  googleText: { color: '#333', fontWeight: '700', fontSize: 15 },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  registerLink: { color: '#FF8C00', fontWeight: '800', fontSize: 14 },
});
