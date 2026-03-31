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
import { authApi } from '../../services/api';
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
const LIGHT_GRAY = '#f1f5f9';

const calculateStrength = (password: string) => {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[@$!%*?&]/.test(password)) strength++;
  return strength;
};

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedRole, setSelectedRole] = useState<'brand' | 'influencer'>('brand');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Google auth state
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedGoogleRole, setSelectedGoogleRole] = useState<'brand' | 'influencer' | null>(null);

  const { register, googleAuth } = useAuth();
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
    const processGoogleAuth = async () => {
      if (response?.type === 'success' && selectedGoogleRole) {
        const { id_token, access_token } = response.params;
        const token = id_token || access_token;
        if (token) {
          await handleGoogleAuth(token, selectedGoogleRole);
          Alert.alert(
            'Welcome to Brio!',
            'Account created successfully. Let\'s get started!',
            [{
              text: 'Go to Dashboard',
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
    processGoogleAuth();
  }, [response, selectedGoogleRole]);

  const validateEmail = async (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return false;
    } else if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email' }));
      return false;
    }

    const response = await authApi.checkEmail(email);
    if (response.success && response.data?.exists) {
      setEmailExists(true);
      setErrors(prev => ({ ...prev, email: 'Email already registered' }));
      return false;
    }

    setEmailExists(false);
    setErrors(prev => ({ ...prev, email: '' }));
    return true;
  };

  const validateUsername = (username: string) => {
    if (!username) {
      setErrors(prev => ({ ...prev, username: 'Username is required' }));
      return false;
    } else if (username.length < 3) {
      setErrors(prev => ({ ...prev, username: 'Username must be at least 3 characters' }));
      return false;
    }
    setErrors(prev => ({ ...prev, username: '' }));
    return true;
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return false;
    } else if (password.length < 8) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
      return false;
    } else if (!passwordRegex.test(password)) {
      setErrors(prev => ({
        ...prev,
        password: 'Password must contain uppercase, lowercase, number, and special character',
      }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: '' }));
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Please confirm your password' }));
      return false;
    } else if (confirmPassword !== formData.password) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return false;
    }
    setErrors(prev => ({ ...prev, confirmPassword: '' }));
    return true;
  };

  const handleRegister = async () => {
    const isUsernameValid = validateUsername(formData.username);
    const isEmailValid = await validateEmail(formData.email);
    const isPasswordValid = validatePassword(formData.password);
    const isConfirmValid = validateConfirmPassword(formData.confirmPassword);

    if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmValid) return;

    try {
      setIsLoading(true);
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
      });

      Alert.alert(
        'Welcome to Brio!',
        selectedRole === 'brand'
          ? 'Registration successful! Enjoy your 15-day free trial on Brio.'
          : 'Registration successful! Welcome to the Brio community.',
        [{
          text: 'Get Started', onPress: () => {
            if (selectedRole === "brand") {
              router.replace("/(brand)/(tabs)/dashboard");
            } else {
              router.replace("/(influencer)/(tabs)/dashboard");
            }
          }
        }]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Could not complete registration');
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
    if (isLoading) return;
    try {
      setIsLoading(true);
      await googleAuth(token, role);
    } catch (error: any) {
      Alert.alert('Google Registration Failed', error.message || 'Could not authenticate with Google');
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
        <View style={styles.card}>
          {/* Logo */}
          <TouchableOpacity onPress={() => router.push('/')} activeOpacity={0.85}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our community today</Text>

          {/* Role Selector */}
          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[styles.roleButton, selectedRole === 'brand' && styles.roleButtonActive]}
              onPress={() => setSelectedRole('brand')}
            >
              <Ionicons
                name="business-outline"
                size={20}
                color={selectedRole === 'brand' ? WHITE : GRAY}
              />
              <Text style={[styles.roleButtonText, selectedRole === 'brand' && styles.roleButtonTextActive]}>
                Brand
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleButton, selectedRole === 'influencer' && styles.roleButtonActive]}
              onPress={() => setSelectedRole('influencer')}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={selectedRole === 'influencer' ? WHITE : GRAY}
              />
              <Text style={[styles.roleButtonText, selectedRole === 'influencer' && styles.roleButtonTextActive]}>
                Influencer
              </Text>
            </TouchableOpacity>
          </View>

          {/* Username */}
          <View style={[styles.inputBox, errors.username ? styles.inputBoxError : null]}>
            <Ionicons name="person-outline" size={20} color={BLUE} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#aab"
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              onBlur={() => validateUsername(formData.username)}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
          {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}

          {/* Email */}
          <View style={[styles.inputBox, errors.email ? styles.inputBoxError : null]}>
            <Ionicons name="mail-outline" size={20} color={BLUE} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#aab"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              onBlur={() => validateEmail(formData.email)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          {/* Password */}
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>Password</Text>
            {formData.password.length > 0 && (
              <Text style={[
                styles.strengthText,
                {
                  color:
                    calculateStrength(formData.password) === 1 ? '#ff4d4d' :
                      calculateStrength(formData.password) === 2 ? '#ffa500' :
                        calculateStrength(formData.password) === 3 ? '#3d8ef5' :
                          calculateStrength(formData.password) === 4 ? '#00c853' : GRAY
                }
              ]}>
                {calculateStrength(formData.password) === 1 ? 'Weak' :
                  calculateStrength(formData.password) === 2 ? 'Fair' :
                    calculateStrength(formData.password) === 3 ? 'Good' :
                      calculateStrength(formData.password) === 4 ? 'Strong' : ''}
              </Text>
            )}
            <TouchableOpacity
              onPress={() => Alert.alert('Password Requirements', '• At least 8 characters\n• Uppercase & lowercase letters\n• At least one number\n• At least one special character')}
              style={styles.infoIcon}
            >
              <Ionicons name="information-circle-outline" size={18} color={GRAY} />
            </TouchableOpacity>
          </View>
          <View style={[styles.inputBox, errors.password ? styles.inputBoxError : null, { marginBottom: 8 }]}>
            <Ionicons name="lock-closed-outline" size={20} color={BLUE} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Create a strong password"
              placeholderTextColor="#aab"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              onBlur={() => validatePassword(formData.password)}
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

          {/* Password Strength Bar */}
          <View style={styles.strengthContainer}>
            {[1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={[
                  styles.strengthBar,
                  {
                    backgroundColor: i <= calculateStrength(formData.password)
                      ? (calculateStrength(formData.password) <= 2 ? '#ff4d4d' : BLUE)
                      : '#e2e8f0'
                  }
                ]}
              />
            ))}
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          {/* Confirm Password */}
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
          </View>
          <View style={[styles.inputBox, errors.confirmPassword ? styles.inputBoxError : null]}>
            <Ionicons name="lock-closed-outline" size={20} color={BLUE} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#aab"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              onBlur={() => validateConfirmPassword(formData.confirmPassword)}
              secureTextEntry={!showConfirmPassword}
              editable={!isLoading}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={BLUE}
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

          {/* Create Account Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <View style={[styles.primaryGradient, { backgroundColor: 'rgb(15, 110, 234)' }]}>
              {isLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.primaryText}>Create Account</Text>
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

          {/* Sign In link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginLabel}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

        </View>
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

            <TouchableOpacity style={styles.roleModalBtn} onPress={() => handleGoogleRoleSelect('brand')}>
              <View style={[styles.roleModalIcon, { backgroundColor: BLUE + '18' }]}>
                <Ionicons name="business-outline" size={24} color={BLUE} />
              </View>
              <View style={styles.roleModalTextContainer}>
                <Text style={styles.roleModalTitle}>Register as Brand</Text>
                <Text style={styles.roleModalDesc}>Find influencers and run marketing campaigns</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={BLUE} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.roleModalBtn} onPress={() => handleGoogleRoleSelect('influencer')}>
              <View style={[styles.roleModalIcon, { backgroundColor: BLUE + '18' }]}>
                <Ionicons name="person-outline" size={24} color={BLUE} />
              </View>
              <View style={styles.roleModalTextContainer}>
                <Text style={styles.roleModalTitle}>Register as Influencer</Text>
                <Text style={styles.roleModalDesc}>Collaborate with brands and grow your presence</Text>
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
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
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

  /* role selector */
  roleSelector: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 24,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 6,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: 'rgb(15, 110, 234)',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: GRAY,
  },
  roleButtonTextActive: {
    color: WHITE,
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

  /* password requirements */
  requirementsBox: {
    width: '100%',
    backgroundColor: '#f8faff',
    borderRadius: 12,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: BLACK,
    marginBottom: 6,
  },
  requirementItem: {
    fontSize: 12,
    color: GRAY,
    marginBottom: 4,
  },

  /* register button */
  primaryBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 18,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryGradient: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
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

  /* login row */
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginLabel: {
    color: GRAY,
    fontSize: 14,
  },
  loginLink: {
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
  roleModalBtn: {
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
  roleModalIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  roleModalTextContainer: { flex: 1 },
  roleModalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: BLACK,
    marginBottom: 2,
  },
  roleModalDesc: {
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: BLACK,
    flex: 1,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  infoIcon: {
    padding: 2,
  },
  strengthContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
});