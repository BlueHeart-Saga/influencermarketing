import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// ─── Timing constants (ms) ────────────────────────────────────────────────────
const T_HOLD         = 400;   // how long the full blue screen holds
const T_COLLAPSE     = 800;   // blue collapses to a dot
const T_LOGO_DELAY   = T_HOLD + 600;   // logo starts rising
const T_TEXT_DELAY   = T_HOLD + 750;   // brand name starts rising
const T_TAG_DELAY    = T_HOLD + 950;   // tagline fades in
const T_REVEAL_DUR   = 600;   // element reveal duration
const T_TOTAL        = 2800;  // total splash duration

type Props = {
  onFinish?: () => void;
};

export default function LogoIntro({ onFinish }: Props) {

  // ── Blue overlay ──────────────────────────────────────────────────────────
  const blueScale   = useSharedValue(1);
  const blueOpacity = useSharedValue(1);

  // ── Logo ──────────────────────────────────────────────────────────────────
  const logoOpacity    = useSharedValue(0);
  const logoScale      = useSharedValue(0.3);
  const logoTranslateY = useSharedValue(50);

  // ── Brand name ────────────────────────────────────────────────────────────
  const textOpacity    = useSharedValue(0);
  const textScale      = useSharedValue(0.5);
  const textTranslateY = useSharedValue(40);

  // ── Tagline ───────────────────────────────────────────────────────────────
  const tagOpacity    = useSharedValue(0);
  const tagTranslateY = useSharedValue(20);

  useEffect(() => {

    // ── Stage 1 & 2: blue collapses into a dot ─────────────────────────────
    blueScale.value = withSequence(
      withTiming(1, { duration: T_HOLD }),                      // hold full
      withTiming(0, {                                            // collapse
        duration: T_COLLAPSE,
        easing: Easing.out(Easing.exp),
      })
    );

    blueOpacity.value = withSequence(
      withTiming(1, { duration: T_HOLD + T_COLLAPSE * 0.7 }),   // stay opaque
      withTiming(0, {                                            // fade at end
        duration: T_COLLAPSE * 0.3,
        easing: Easing.in(Easing.quad),
      })
    );

    // ── Stage 3: logo scales and rises in (centered) ─────────────────────────
    logoOpacity.value = withDelay(
      T_LOGO_DELAY,
      withTiming(1, { duration: T_REVEAL_DUR, easing: Easing.out(Easing.cubic) })
    );
    logoScale.value = withDelay(
      T_LOGO_DELAY,
      withTiming(1, { duration: T_REVEAL_DUR, easing: Easing.out(Easing.back()) })
    );
    logoTranslateY.value = withDelay(
      T_LOGO_DELAY,
      withTiming(0, { duration: T_REVEAL_DUR, easing: Easing.out(Easing.exp) })
    );

    // ── Stage 4: brand name scales and rises in (centered) ───────────────────
    textOpacity.value = withDelay(
      T_TEXT_DELAY,
      withTiming(1, { duration: T_REVEAL_DUR, easing: Easing.out(Easing.cubic) })
    );
    textScale.value = withDelay(
      T_TEXT_DELAY,
      withTiming(1, { duration: T_REVEAL_DUR, easing: Easing.out(Easing.back()) })
    );
    textTranslateY.value = withDelay(
      T_TEXT_DELAY,
      withTiming(0, { duration: T_REVEAL_DUR, easing: Easing.out(Easing.exp) })
    );

    // ── Stage 5: tagline fades in ─────────────────────────────────────────
    tagOpacity.value = withDelay(
      T_TAG_DELAY,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
    tagTranslateY.value = withDelay(
      T_TAG_DELAY,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.exp) })
    );

    // ── Finish ────────────────────────────────────────────────────────────
    const timer = setTimeout(() => {
      onFinish?.();
    }, T_TOTAL);

    return () => clearTimeout(timer);

  }, []);

  // ── Animated styles ───────────────────────────────────────────────────────

  const blueStyle = useAnimatedStyle(() => ({
    transform: [{ scale: blueScale.value }],
    opacity: blueOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { translateY: logoTranslateY.value },
      { scale: logoScale.value }
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [
      { translateY: textTranslateY.value },
      { scale: textScale.value }
    ],
  }));

  const tagStyle = useAnimatedStyle(() => ({
    opacity: tagOpacity.value,
    transform: [{ translateY: tagTranslateY.value }],
  }));

  return (
    <View style={styles.container}>

      {/* ── Final content (always rendered, revealed as blue collapses) ── */}
      <View style={styles.content}>

        {/* Logo mark - Centered */}
        <Animated.View style={[styles.logoWrapper, logoStyle]}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Brand name - Centered with Titan One font */}
        <Animated.View style={[styles.textWrapper, textStyle]}>
          <Text style={styles.brandText}>BRIO</Text>
        </Animated.View>

        {/* Tagline - Centered with Kavoon font */}
        <Animated.View style={[styles.tagWrapper, tagStyle]}>
          <Text style={styles.tagText}>CONNECT. CREATE. GROW.</Text>
        </Animated.View>

      </View>

      {/* ── Blue full-screen overlay (collapses away) ─────────────────── */}
      <Animated.View
        style={[styles.blueLayer, blueStyle]}
        pointerEvents="none"
      />

    </View>
  );
}

// ─── Brand tokens ──────────────────────────────────────────────────────────────
const BRAND_BLUE   = '#0f6eea';
const BRAND_BLUE_L = '#6c8fbf'; // lighter tint for tagline

// ─── Font families for web and mobile ─────────────────────────────────────────
const getBrandFont = () => {
  if (Platform.OS === 'web') {
    // For web, use Google Fonts
    return 'Titan One, cursive';
  }
  // For native mobile, use available system fonts with fallbacks
  return Platform.select({
    ios: 'Georgia-Bold',  // iOS bold serif
    android: 'serif',
    default: 'sans-serif'
  });
};

const getTaglineFont = () => {
  if (Platform.OS === 'web') {
    // For web, use Google Fonts
    return 'Kavoon, cursive';
  }
  // For native mobile
  return Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'sans-serif'
  });
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // ── Blue overlay (collapsing circle) ────────────────────────────────────
  blueLayer: {
    position: 'absolute',
    width: Math.max(width, height) * 2.2,
    height: Math.max(width, height) * 2.2,
    backgroundColor: BRAND_BLUE,
    borderRadius: Math.max(width, height) * 1.1,
    top: height / 2 - Math.max(width, height) * 1.1,
    left: width / 2 - Math.max(width, height) * 1.1,
    zIndex: 10,
  },

  // ── Logo (centered) ─────────────────────────────────────────────────────
  logoWrapper: {
    width: 100,
    height: 100,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: '100%',
    height: '100%',
  },

  // ── Brand name (centered) ───────────────────────────────────────────────
  textWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },

  brandText: {
    fontSize: 44,
    fontWeight: '800',
    color: BRAND_BLUE,
    letterSpacing: 6,
    textAlign: 'center',
    fontFamily: getBrandFont(),
    // Additional text shadow for web to enhance the bold look
    ...(Platform.OS === 'web' ? {
      textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
    } : {}),
  },

  // ── Tagline (centered) ──────────────────────────────────────────────────
  tagWrapper: {
    alignItems: 'center',
  },

  tagText: {
    fontSize: 11,
    fontWeight: '500',
    color: BRAND_BLUE_L,
    letterSpacing: 2,
    textAlign: 'center',
    fontFamily: getTaglineFont(),
    ...(Platform.OS === 'web' ? {
      textShadow: '1px 1px 2px rgba(0,0,0,0.05)',
    } : {}),
  },

});