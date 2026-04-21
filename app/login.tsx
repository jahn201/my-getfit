import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, Dimensions, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { loginUser, getLastLogin, setLastLogin } from '../utils/auth';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();

    // Auto-fill last used credentials
    const loadLastLogin = async () => {
      const creds = await getLastLogin();
      if (creds) {
        if (creds.email) setEmail(creds.email);
        if (creds.password) setPassword(creds.password);
      }
    };
    loadLastLogin();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { backgroundColor: '#FFF0EC', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  const handleLogin = async () => {
    setFormError('');
    setLoading(true);
    const result = await loginUser(email, password);
    setLoading(false);

    if ('error' in result) {
      setFormError(result.error);
      return;
    }

    // Save successful login credentials
    await setLastLogin(email, password);

    // Success - navigate to home
    router.push('/home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.bg} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, width: '100%' }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your Kittness journey</Text>
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
                  onChangeText={(text) => { setEmail(text); setFormError(''); }}
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
                  onChangeText={(text) => { setPassword(text); setFormError(''); }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons 
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={22} 
                    color="#FF6B6B" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotWrap}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {formError ? <Text style={styles.formErrorText}>{formError}</Text> : null}

            <TouchableOpacity onPress={handleLogin} activeOpacity={0.85} style={[styles.loginBtn, loading && styles.loginBtnDisabled]} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>LOG IN</Text>
              )}
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

  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 60, width: width },
  header: { paddingTop: 60, marginBottom: 32 },
  backBtn: { marginBottom: 24 },
  backText: { color: '#FF6B6B', fontSize: 9, fontFamily: 'PressStart2P_400Regular' },
  title: { fontSize: 18, color: '#CC3D3D', lineHeight: 28, fontFamily: 'PressStart2P_400Regular' },
  subtitle: { color: '#FF8C69', fontSize: 9, marginTop: 14, fontFamily: 'PressStart2P_400Regular', lineHeight: 16 },

  form: { flex: 1 },
  inputGroup: { marginBottom: 18 },
  label: { color: '#FF6B6B', fontSize: 8, letterSpacing: 1, marginBottom: 12, fontFamily: 'PressStart2P_400Regular' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,107,107,0.08)',
    borderRadius: 14, paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: 'rgba(255,107,107,0.25)',
  },
  input: { flex: 1, color: '#CC3D3D', fontSize: 11, paddingVertical: 16, fontFamily: 'PressStart2P_400Regular' },
  eyeBtn: { paddingLeft: 8 },
  forgotWrap: { alignItems: 'flex-end', marginBottom: 24, marginTop: -6 },
  forgotText: { color: '#FF6B6B', fontSize: 8, fontFamily: 'PressStart2P_400Regular' },
  formErrorText: { color: '#FF4D4D', fontSize: 8, textAlign: 'center', marginBottom: 12, fontFamily: 'PressStart2P_400Regular', lineHeight: 14 },

  loginBtn: {
    width: '100%', backgroundColor: '#FF6B6B', borderRadius: 18,
    paddingVertical: 18, alignItems: 'center', marginBottom: 24,
    shadowColor: '#FF6B6B', shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 6 },
  },
  loginBtnText: { color: '#fff', fontSize: 12, letterSpacing: 1, fontFamily: 'PressStart2P_400Regular' },
  loginBtnDisabled: { opacity: 0.6 },

  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,107,107,0.2)' },
  dividerText: { color: '#FF8C69', marginHorizontal: 14, fontSize: 8, letterSpacing: 1, fontFamily: 'PressStart2P_400Regular' },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, marginBottom: 32,
    gap: 10, borderWidth: 1.5, borderColor: 'rgba(255,107,107,0.2)',
    shadowColor: '#FF6B6B', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  googleIcon: { fontSize: 14, fontFamily: 'PressStart2P_400Regular', color: '#EA4335' },
  googleText: { color: '#CC3D3D', fontSize: 9, fontFamily: 'PressStart2P_400Regular' },

  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { color: '#FF8C69', fontSize: 9, fontFamily: 'PressStart2P_400Regular' },
  registerLink: { color: '#FF6B6B', fontSize: 9, fontFamily: 'PressStart2P_400Regular' },
});