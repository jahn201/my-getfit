import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.titleRow}>
              <Text style={styles.fireEmoji}>💪</Text>
              <Text style={styles.title}>Create{'\n'}Account</Text>
            </View>
            <Text style={styles.subtitle}>Start your transformation today</Text>
          </Animated.View>

          <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {[
              { label: 'FULL NAME', icon: '👤', value: name, setter: setName, placeholder: 'John Doe', type: 'default' },
              { label: 'EMAIL', icon: '✉️', value: email, setter: setEmail, placeholder: 'you@example.com', type: 'email-address' },
            ].map((field) => (
              <View key={field.label} style={styles.inputGroup}>
                <Text style={styles.label}>{field.label}</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputIcon}>{field.icon}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={field.placeholder}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={field.value}
                    onChangeText={field.setter}
                    keyboardType={field.type as any}
                    autoCapitalize={field.type === 'email-address' ? 'none' : 'words'}
                  />
                </View>
              </View>
            ))}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Min. 8 characters"
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRM PASSWORD</Text>
              <View style={[styles.inputWrap, confirmPassword && confirmPassword !== password && styles.inputError]}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Repeat password"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
              {confirmPassword && confirmPassword !== password && (
                <Text style={styles.errorText}>Passwords don't match</Text>
              )}
            </View>

            <TouchableOpacity onPress={() => router.push('/home')} activeOpacity={0.85} style={{ marginTop: 8 }}>
              <LinearGradient colors={['#FF4D4D', '#FF8C00']} style={styles.registerBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.registerBtnText}>CREATE ACCOUNT 🔥</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Sign up with Google</Text>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginLink}>Log In</Text>
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
  header: { paddingTop: 60, marginBottom: 28 },
  backBtn: { marginBottom: 24 },
  backText: { color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: '600' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  fireEmoji: { fontSize: 40, marginTop: 4 },
  title: { fontSize: 44, fontWeight: '900', color: '#fff', lineHeight: 48, letterSpacing: 1 },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 10, fontWeight: '500' },
  form: { flex: 1 },
  inputGroup: { marginBottom: 16 },
  label: { color: 'rgba(255,165,0,0.9)', fontSize: 11, fontWeight: '800', letterSpacing: 3, marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  inputError: { borderColor: '#FF4D4D' },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 16, fontWeight: '500' },
  eyeIcon: { fontSize: 18, paddingLeft: 8 },
  errorText: { color: '#FF4D4D', fontSize: 12, marginTop: 4, fontWeight: '600' },
  registerBtn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 24, shadowColor: '#FF4D4D', shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  registerBtnText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 2 },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  dividerText: { color: 'rgba(255,255,255,0.4)', marginHorizontal: 14, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, marginBottom: 32, gap: 10 },
  googleIcon: { fontSize: 18, fontWeight: '900', color: '#EA4335' },
  googleText: { color: '#333', fontWeight: '700', fontSize: 15 },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  loginLink: { color: '#FF8C00', fontWeight: '800', fontSize: 14 },
});
