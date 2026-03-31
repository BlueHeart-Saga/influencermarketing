import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Pressable, Platform, SafeAreaView } from 'react-native';
import { Video } from 'expo-video';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// Theme Colors
const BLUE = "#0f6eea";
const BLUE_LIGHT = "#3b82f6";
const BLACK = "#1e293b";
const GRAY = "#64748b";
const WHITE = "#ffffff";
const GRAY_LIGHT = "#f8fafc";
const BORDER = "#e2e8f0";

const { width } = Dimensions.get('window');

const platformFeatures = [
  {
    icon: "zap",
    title: "AI-Powered Campaign Management",
    description: "Launch campaigns in minutes with intelligent automation, smart workflows, and predictive analytics.",
    features: ["One-click campaign creation", "AI influencer matching", "Automated outreach sequences", "Smart budget optimization"]
  },
  {
    icon: "users",
    title: "Influencer Discovery & Matching",
    description: "Find the perfect creators with our advanced AI algorithms analyzing 200+ data points.",
    features: ["10M+ verified influencers", "Advanced audience insights", "Authenticity verification", "Performance prediction"]
  },
  {
    icon: "target",
    title: "Advanced Analytics & Insights",
    description: "Track performance, measure ROI, and optimize campaigns with real-time data.",
    features: ["Real-time performance tracking", "ROI and conversion analytics", "Custom reporting", "Predictive analytics"]
  },
  {
    icon: "bar-chart-2",
    title: "Workflow Automation",
    description: "Streamline your entire influencer marketing process with intelligent automation.",
    features: ["Automated contract management", "Payment processing", "Content approval workflows", "Team collaboration tools"]
  },
  {
    icon: "shield",
    title: "Enterprise Security",
    description: "Bank-level security and compliance for your sensitive campaign data.",
    features: ["End-to-end encryption", "GDPR & CCPA compliant", "SOC 2 certified", "Regular security audits"]
  },
  {
    icon: "globe",
    title: "Global Platform",
    description: "Run campaigns across 100+ countries with multi-language support.",
    features: ["Multi-currency support", "Local payment methods", "Regional compliance", "24/7 global support"]
  }
];

const platformStats = [
  { value: "10K+", label: "Active Brands" },
  { value: "50K+", label: "Influencers" },
  { value: "$2.5B+", label: "Campaign Value" },
  { value: "98%", label: "Satisfaction Rate" }
];

export default function ViewDemoScreen() {
  const router = useRouter();
  const videoRef = useRef<Video>(null);

  const handleLoginRedirect = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={BLACK} />
          </Pressable>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Platform Demo & Tour</Text>
          <Text style={styles.heroSubtitle}>
            See our AI-powered influencer marketing platform in action. Watch how brands and creators achieve remarkable results.
          </Text>

          {/* Video Player Box */}
          <View style={styles.videoWrapper}>
            <Video
              ref={videoRef}
              style={styles.videoPlayer}
              source={require('../assets/videos/platform-demo.mp4')}
              useNativeControls
              resizeMode="cover"
              isLooping={false}
              shouldPlay={false}
              posterSource={require('../assets/images/features/video-thumbnail.jpg')}
              usePoster
            />
          </View>

          {/* Chapters below video */}
          <View style={styles.chaptersContainer}>
            <View style={[styles.chapterBtn, styles.chapterBtnActive]}>
              <Text style={styles.chapterMarkerActive}>▶</Text>
              <Text style={styles.chapterLabelActive}>Platform Overview</Text>
              <Text style={styles.chapterTime}>0:00</Text>
            </View>
            <View style={styles.chapterBtn}>
              <Text style={styles.chapterMarker}>02</Text>
              <Text style={styles.chapterLabel}>Campaign Creation</Text>
              <Text style={styles.chapterTime}>2:30</Text>
            </View>
            <View style={styles.chapterBtn}>
              <Text style={styles.chapterMarker}>03</Text>
              <Text style={styles.chapterLabel}>Influencer Discovery</Text>
              <Text style={styles.chapterTime}>5:45</Text>
            </View>
          </View>
        </View>

        {/* What You'll Learn Box */}
        <View style={styles.learningSection}>
          <Text style={styles.learningTitle}>What You'll Learn</Text>
          <View style={styles.learningList}>
            {[
              "How to create and launch campaigns in minutes",
              "AI-powered influencer matching in action",
              "Real-time analytics and performance tracking",
              "Automated workflow and payment processing",
              "Team collaboration and project management"
            ].map((item, idx) => (
              <View key={idx} style={styles.learningItem}>
                <Feather name="check-circle" size={18} color="#10b981" />
                <Text style={styles.learningText}>{item}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.learningActions}>
            <Pressable onPress={handleLoginRedirect} style={styles.requestDemoBtn}>
              <LinearGradient colors={[BLUE_LIGHT, BLUE]} style={styles.requestDemoGradient} start={{x:0,y:0}} end={{x:1,y:0}}>
                <Text style={styles.requestDemoText}>Request Personal Demo</Text>
                <Feather name="chevron-right" size={20} color={WHITE} />
              </LinearGradient>
            </Pressable>
            <Pressable onPress={handleLoginRedirect} style={styles.docsBtn}>
              <Text style={styles.docsBtnText}>View Documentation</Text>
            </Pressable>
          </View>
        </View>

        {/* Platform Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            {platformStats.map((stat, idx) => (
              <View key={idx} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features Comparison Area */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionHeading}>Comprehensive Platform Features</Text>
          <Text style={styles.sectionSubheading}>Everything you need to run successful influencer marketing campaigns at scale</Text>

          {platformFeatures.map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <View style={styles.featureIconBox}>
                <Feather name={f.icon as any} size={24} color={BLUE_LIGHT} />
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.description}</Text>
              <View style={styles.featureSublist}>
                {f.features.map((item, idx) => (
                  <View key={idx} style={styles.featureSubitem}>
                    <Feather name="check" size={16} color={GRAY} />
                    <Text style={styles.featureSubText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.ctaBottomSection}>
          <Text style={styles.ctaTitle}>Ready to See It Live?</Text>
          <Text style={styles.ctaDesc}>
            Schedule a personalized demo with our team and see how our platform can transform your influencer marketing strategy.
          </Text>
          <Pressable onPress={handleLoginRedirect} style={styles.bottomCtaBtn}>
            <Text style={styles.bottomCtaBtnText}>Schedule Live Demo</Text>
          </Pressable>
          <Pressable onPress={handleLoginRedirect} style={styles.bottomCtaAltBtn}>
            <Text style={styles.bottomCtaAltBtnText}>Start Free Trial</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: WHITE },
  container: { flex: 1, backgroundColor: WHITE },
  scrollContent: { paddingBottom: 60 },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f1f5f9'
  },
  heroSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingVertical: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: BLUE,
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: GRAY,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  videoWrapper: {
    width: '100%',
    height: width * 0.6,
    backgroundColor: BLACK,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: BLACK,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
  },
  videoPlayer: { width: '100%', height: '100%' },
  chaptersContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: GRAY_LIGHT,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1, borderColor: BORDER,
    overflow: 'hidden',
  },
  chapterBtn: {
    flex: 1, minWidth: '30%',
    padding: 12,
    alignItems: 'center',
    borderRightWidth: 1, borderRightColor: BORDER,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  chapterBtnActive: { backgroundColor: '#eff6ff', borderLeftWidth: 3, borderLeftColor: BLUE },
  chapterMarker: { fontSize: 12, color: GRAY, fontWeight: '700' },
  chapterMarkerActive: { fontSize: 12, color: BLUE, fontWeight: '700' },
  chapterLabel: { fontSize: 12, fontWeight: '600', color: BLACK, marginTop: 4, textAlign: 'center' },
  chapterLabelActive: { fontSize: 12, fontWeight: '700', color: BLUE, marginTop: 4, textAlign: 'center' },
  chapterTime: { fontSize: 11, color: GRAY, marginTop: 4 },
  
  learningSection: {
    padding: 24, marginHorizontal: 20,
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1, borderColor: BORDER,
    marginTop: 20,
    shadowColor: BLACK, shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2,
  },
  learningTitle: { fontSize: 20, fontWeight: '700', color: BLACK, marginBottom: 20 },
  learningList: { gap: 12, marginBottom: 24 },
  learningItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  learningText: { fontSize: 15, color: '#475569', flex: 1, lineHeight: 22 },
  learningActions: { gap: 12 },
  requestDemoBtn: { width: '100%', borderRadius: 10, overflow: 'hidden' },
  requestDemoGradient: { paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  requestDemoText: { color: WHITE, fontSize: 15, fontWeight: '600' },
  docsBtn: { paddingVertical: 14, borderWidth: 2, borderColor: BORDER, borderRadius: 10, alignItems: 'center' },
  docsBtnText: { color: BLUE, fontSize: 15, fontWeight: '600' },
  
  statsSection: { padding: 40, backgroundColor: WHITE, marginTop: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  statCard: {
    width: (width - 100) / 2,
    backgroundColor: GRAY_LIGHT,
    padding: 20, borderRadius: 12,
    borderWidth: 1, borderColor: BORDER,
    alignItems: 'center',
  },
  statValue: { fontSize: 28, fontWeight: '800', color: BLUE, marginBottom: 8 },
  statLabel: { fontSize: 13, color: GRAY, fontWeight: '600' },
  
  featuresSection: { paddingHorizontal: 20, paddingVertical: 40, backgroundColor: GRAY_LIGHT },
  sectionHeading: { fontSize: 24, fontWeight: '800', color: BLACK, textAlign: 'center', marginBottom: 12 },
  sectionSubheading: { fontSize: 16, color: GRAY, textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  featureCard: {
    backgroundColor: WHITE,
    padding: 24, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER,
    marginBottom: 20,
    shadowColor: BLACK, shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2,
  },
  featureIconBox: { width: 50, height: 50, backgroundColor: '#eff6ff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  featureTitle: { fontSize: 18, fontWeight: '700', color: BLACK, marginBottom: 10 },
  featureDesc: { fontSize: 14, color: GRAY, lineHeight: 22, marginBottom: 20 },
  featureSublist: { gap: 8 },
  featureSubitem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureSubText: { fontSize: 14, color: '#475569', flex: 1 },
  
  ctaBottomSection: { padding: 40, alignItems: 'center', backgroundColor: WHITE },
  ctaTitle: { fontSize: 28, fontWeight: '800', color: BLACK, marginBottom: 16, textAlign: 'center' },
  ctaDesc: { fontSize: 16, color: GRAY, textAlign: 'center', lineHeight: 24, marginBottom: 30 },
  bottomCtaBtn: { backgroundColor: BLUE, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30, width: '100%', alignItems: 'center', marginBottom: 16 },
  bottomCtaBtnText: { color: WHITE, fontSize: 16, fontWeight: '700' },
  bottomCtaAltBtn: { paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30, width: '100%', alignItems: 'center', borderWidth: 2, borderColor: BLUE },
  bottomCtaAltBtnText: { color: BLUE, fontSize: 16, fontWeight: '700' },
});
