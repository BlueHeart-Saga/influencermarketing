import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

const BLUE = '#0f6eea';
const BLUE_LIGHT = '#3d8ef5';
const BLUE_DARK = '#0a4faa';
const WHITE = '#ffffff';
const BLACK = '#1e2937';
const GRAY = '#64748b';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Google auth state
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedGoogleRole, setSelectedGoogleRole] = useState<'brand' | 'influencer' | null>(null);

  const { login, googleAuth } = useAuth();
  const router = useRouter();

  const isExpoGo = Constants.appOwnership === 'expo';

  const GOOGLE_REDIRECT_URI = isExpoGo
    ? 'https://auth.expo.io/@blueheartsaga/mobile'
    : AuthSession.makeRedirectUri({ scheme: 'mobile' });

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '122837474397-huihf8tmb4otd08hkt9k2embao8uv6e3.apps.googleusercontent.com',
    androidClientId: '122837474397-kbkmv8a3lrr1ha90jq906dig296f901g.apps.googleusercontent.com',
    iosClientId: '122837474397-huihf8tmb4otd08hkt9k2embao8uv6e3.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    responseType: 'id_token',
    extraParams: { nonce: 'nonce' },
    redirectUri: GOOGLE_REDIRECT_URI,
  });

  useEffect(() => {
    const processLogin = async () => {
      if (response?.type === 'success' && selectedGoogleRole) {
        const { id_token, access_token } = response.params;
        const token = id_token || access_token;
        if (token) {
          await handleGoogleAuth(token, selectedGoogleRole);
          Alert.alert(
            'Welcome to Brio!',
            'Signin successful. Taking you to your dashboard.',
            [{
              text: 'OK',
              onPress: () => {
                if (selectedGoogleRole === 'brand') router.replace('/(brand)/(tabs)/dashboard');
                else router.replace('/(influencer)/(tabs)/dashboard');
              }
            }]
          );
        } else {
          Alert.alert('Error', 'Could not get authentication token from Google');
          setSelectedGoogleRole(null);
        }
      } else if (response?.type === 'success' && !selectedGoogleRole) {
        Alert.alert('Error', 'Please select a role first');
        setSelectedGoogleRole(null);
      }
    };
    processLogin();
  }, [response, selectedGoogleRole]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) { setEmailError('Email is required'); return false; }
    if (!emailRegex.test(email)) { setEmailError('Please enter a valid email'); return false; }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) { setPasswordError('Password is required'); return false; }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    if (!isEmailValid || !isPasswordValid) return;

    try {
      setIsLoading(true);
      const user = await login(email, password);
      if (!user) { Alert.alert('Login Failed', 'Invalid email or password'); return; }

      Alert.alert(
        'Welcome Back!',
        'Ready to grow with Brio? Taking you to your dashboard.',
        [{
          text: 'Let\'s go',
          onPress: () => {
            if (user.role === 'brand') router.replace('/(brand)/(tabs)/dashboard');
            else if (user.role === 'influencer') router.replace('/(influencer)/(tabs)/dashboard');
            else if (user.role === 'admin') router.replace('/(admin)/dashboard');
          }
        }]
      );
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRoleSelect = (role: 'brand' | 'influencer') => {
    setSelectedGoogleRole(role);
    setShowRoleSelection(false);
    promptAsync(); // Proxy handled by GOOGLE_REDIRECT_URI logic
  };

  const handleGoogleAuth = async (token: string, role: 'brand' | 'influencer') => {
    try {
      setIsLoading(true);
      await googleAuth(token, role);
    } catch (error: any) {
      Alert.alert('Google Login Failed', error.message || 'Could not authenticate with Google');
    } finally {
      setIsLoading(false);
      setSelectedGoogleRole(null);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ─── CARD ─── */}
        <View style={styles.card}>

          {/* Logo */}
          <TouchableOpacity onPress={() => router.push('/')} activeOpacity={0.85}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Headings */}
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>

          {/* Email */}
          <View style={[styles.inputBox, emailError ? styles.inputBoxError : null]}>
            <Ionicons name="mail-outline" size={20} color={BLUE} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#aab"
              value={email}
              onChangeText={setEmail}
              onBlur={() => validateEmail(email)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          {/* Password */}
          <View style={[styles.inputBox, passwordError ? styles.inputBoxError : null]}>
            <Ionicons name="lock-closed-outline" size={20} color={BLUE} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aab"
              value={password}
              onChangeText={setPassword}
              onBlur={() => validatePassword(password)}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={BLUE}
              />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          {/* Forgot password */}
          <TouchableOpacity
            style={styles.forgotRow}
            onPress={() => router.push('/forgot-password')}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign In button */}
          <TouchableOpacity
            style={[styles.signInBtn, isLoading && styles.signInBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.signInGradient,
                { backgroundColor: 'rgb(15, 110, 234)' }
              ]}
            >
              {isLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.signInText}>Sign In</Text>
              }
            </View>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={() => setShowRoleSelection(true)}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Sign Up link */}
          <View style={styles.signupRow}>
            <Text style={styles.signupLabel}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </View>
        {/* ─── END CARD ─── */}
      </ScrollView>

      {/* ─── Role Selection Modal ─── */}
      <Modal
        visible={showRoleSelection}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRoleSelection(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.modalLogo}
              resizeMode="contain"
            />
            <Text style={styles.modalTitle}>Continue with Google</Text>
            <Text style={styles.modalSub}>Select how you want to use Brio</Text>

            <TouchableOpacity style={styles.roleBtn} onPress={() => handleGoogleRoleSelect('brand')}>
              <View style={[styles.roleIcon, { backgroundColor: BLUE + '18' }]}>
                <Ionicons name="business-outline" size={24} color={BLUE} />
              </View>
              <View style={styles.roleText}>
                <Text style={styles.roleTitle}>Continue as Brand</Text>
                <Text style={styles.roleDesc}>Find influencers and run marketing campaigns</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={BLUE} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.roleBtn} onPress={() => handleGoogleRoleSelect('influencer')}>
              <View style={[styles.roleIcon, { backgroundColor: BLUE + '18' }]}>
                <Ionicons name="person-outline" size={24} color={BLUE} />
              </View>
              <View style={styles.roleText}>
                <Text style={styles.roleTitle}>Continue as Influencer</Text>
                <Text style={styles.roleDesc}>Collaborate with brands and grow your presence</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={BLUE} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => { setShowRoleSelection(false); setSelectedGoogleRole(null); }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WHITE,
  },

  /* scroll */
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  /* flat card on white */
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: WHITE,
    borderRadius: 0,
    paddingHorizontal: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },

  logo: {
    width: 90,
    height: 90,
    marginBottom: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: BLACK,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,
    color: GRAY,
    marginBottom: 28,
    textAlign: 'center',
  },

  /* inputs */
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    backgroundColor: '#f8faff',
    height: 54,
  },
  inputBoxError: {
    borderColor: '#FF3B30',
    backgroundColor: '#fff5f5',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: BLACK,
  },
  errorText: {
    alignSelf: 'flex-start',
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 6,
    marginLeft: 4,
  },

  /* forgot */
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 22,
    marginTop: 4,
  },
  forgotText: {
    color: BLUE,
    fontSize: 13,
    fontWeight: '600',
  },

  /* sign in button */
  signInBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  signInBtnDisabled: {
    opacity: 0.6,
  },
  signInGradient: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  /* divider */
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerLabel: {
    marginHorizontal: 14,
    color: GRAY,
    fontSize: 13,
    fontWeight: '600',
  },

  /* google */
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 54,
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    backgroundColor: WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 28,
  },
  googleText: {
    fontSize: 15,
    color: BLACK,
    fontWeight: '600',
  },

  /* signup */
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupLabel: {
    color: GRAY,
    fontSize: 14,
  },
  signupLink: {
    color: BLUE,
    fontSize: 14,
    fontWeight: '700',
  },

  /* ─── Modal ─── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalLogo: {
    width: 60,
    height: 60,
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BLACK,
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 13,
    color: GRAY,
    marginBottom: 20,
    textAlign: 'center',
  },
  roleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: WHITE,
  },
  roleIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  roleText: { flex: 1 },
  roleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: BLACK,
    marginBottom: 2,
  },
  roleDesc: {
    fontSize: 12,
    color: GRAY,
  },
  cancelBtn: {
    marginTop: 10,
    padding: 14,
    alignItems: 'center',
    width: '100%',
  },
  cancelText: {
    fontSize: 15,
    color: GRAY,
    fontWeight: '600',
  },
});