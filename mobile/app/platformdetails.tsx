import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  Platform,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp, SlideInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Image as ExpoImage } from 'expo-image';

const { width, height } = Dimensions.get('window');

const BLUE = "#0f6eea";
const BLUE_LIGHT = "#3d8ef5";
const BLUE_DARK = "#0a4faa";
const WHITE = "#ffffff";
const BLACK = "#1e2937";
const GRAY = "#64748b";

const partnersList = [
  { name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
  { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
  { name: 'Stripe', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg' },
  { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg' },
  { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
  { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
  { name: 'Spotify', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg' },
  { name: 'Salesforce', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg' },
  { name: 'Uber', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Uber_logo_2018.svg' },
  { name: 'Airbnb', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg' },
  { name: 'Tesla', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg' },
  { name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
  { name: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg' },
  { name: 'TikTok', logo: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg' },
];

const ITEM_WIDTH = 130;
const TOTAL_WIDTH = partnersList.length * ITEM_WIDTH;
const duplicatedPartners = [...partnersList, ...partnersList];

const PartnershipScroll = () => {
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(-TOTAL_WIDTH, { duration: 25000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  return (
    <View style={styles.partnershipContainer}>
      <View style={styles.partnershipHeader}>
        <Text style={styles.partnershipTitle}>Trusted by Industry Leaders</Text>
        <Text style={styles.partnershipSubtitle}>Join 10,000+ companies worldwide that trust our platform</Text>
      </View>
      <View style={styles.marqueeWrapper}>
        <Animated.View style={[styles.marqueeTrack, animatedStyle]}>
          {duplicatedPartners.map((item, idx) => (
            <View key={`${item.name}-${idx}`} style={styles.partnerItem}>
              <View style={styles.partnerLogoContainer}>
                <ExpoImage source={{ uri: item.logo }} style={styles.partnerLogo} contentFit="contain" />
              </View>
              <Text style={styles.partnerName}>{item.name}</Text>
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
};

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director at TechCorp',
    content: 'Brio transformed how we approach influencer marketing. The AI recommendations are incredibly accurate.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    name: 'Michael Chen',
    role: 'Founder of GrowthLabs',
    content: 'We reduced our campaign setup time by 80%. The automation features are game-changing.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Social Media Manager',
    content: 'The analytics dashboard gives us insights we never had before. Absolutely essential tool.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    name: 'Jason Patel',
    role: 'Head of Digital at BrandWave',
    content: 'Our influencer discovery process is now 10x faster. Brio is a must-have for modern brands.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/14.jpg'
  },
  {
    name: 'Laura Simmons',
    role: 'Content Strategist at NovaMedia',
    content: 'The predictive content tools are incredible. They helped us publish at the most effective times.',
    rating: 4,
    avatar: 'https://randomuser.me/api/portraits/women/21.jpg'
  },
  {
    name: 'David Martinez',
    role: 'CEO at MarketLaunch',
    content: 'Brio enabled our small team to run large-scale influencer campaigns effortlessly.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
  }
];

const duplicatedTestimonials = [...testimonials, ...testimonials];
const TESTIMONIAL_CARD_WIDTH = 300;
const TESTIMONIAL_MARGIN = 16;
const TOTAL_TESTIMONIALS_WIDTH = testimonials.length * (TESTIMONIAL_CARD_WIDTH + TESTIMONIAL_MARGIN);

const TestimonialsSection = () => {
  const scrollX = useSharedValue(0);

  useEffect(() => {
    scrollX.value = withRepeat(
      withTiming(-TOTAL_TESTIMONIALS_WIDTH, { duration: 30000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: scrollX.value }]
  }));

  return (
    <View style={styles.testimonialsSection}>
      <Text style={styles.testimonialsTitle}>What Our Clients Say</Text>
      <Text style={styles.testimonialsSubtitle}>
        Trusted by thousands of brands worldwide to transform their influencer marketing
      </Text>
      <View style={styles.testimonialsScrollWrapper}>
        <Animated.View style={[styles.testimonialsTrack, animatedStyle]}>
          {duplicatedTestimonials.map((item, idx) => (
            <View key={idx} style={styles.testimonialCard}>
              <View style={styles.testimonialHeader}>
                <ExpoImage source={{ uri: item.avatar }} style={styles.testimonialAvatar} contentFit="cover" />
                <View style={styles.testimonialAuthorInfo}>
                  <Text style={styles.testimonialAuthorName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.testimonialAuthorRole} numberOfLines={1}>{item.role}</Text>
                </View>
              </View>
              <View style={styles.testimonialStars}>
                {[...Array(5)].map((_, i) => (
                  <MaterialCommunityIcons key={i} name="star" size={16} color={i < item.rating ? "#fbbf24" : "#e2e8f0"} />
                ))}
              </View>
              <Text style={styles.testimonialContent}>"{item.content}"</Text>
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
};

const images = {
  logo: require('../assets/images/logo.png'),
  welcome: require('../assets/images/onboarding/welcome.png'),
  brands: require('../assets/images/onboarding/brands.png'),
  influencers: require('../assets/images/onboarding/influencers.png'),
  ai: require('../assets/images/onboarding/ai.png'),
};

const heroImages = {
  love: require('../assets/images/hero/love.png'),
  hero1: require('../assets/images/hero/hero1.png'),
  hero2: require('../assets/images/hero/hero2.png'),
  hero3: require('../assets/images/hero/hero3.png'),
  hero4: require('../assets/images/hero/hero4.png'),
};

const featureImages = {
  influencersList: require('../assets/images/features/influencers-list.png'),
  campaignCreation: require('../assets/images/features/campaign-creation.png'),
  campaignDashboard: require('../assets/images/features/campaign-dashboard.png'),
  matchingInterface: require('../assets/images/features/matching-interface.png'),
  analyticsDashboard: require('../assets/images/features/analytics-dashboard.png'),
  ecommerceStats: require('../assets/images/features/ecommerce-stats.png'),
  about1: require('../assets/images/features/about1.png'),
  about2: require('../assets/images/features/about2.jpg'),
  about3: require('../assets/images/features/about3.png'),
};

export default function PlatformDetails() {
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = (event: any) => {
    setScrollY(event.nativeEvent.contentOffset.y);
  };

  const progress = Math.min(Math.max(scrollY / (height * 3), 0), 1);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      
      {/* Dynamic Organic Background */}
      <View style={styles.organicContainer}>
        <View style={[
          styles.flowingShape,
          {
            backgroundColor: BLUE + '10',
            top: -50 + Math.sin(progress * Math.PI * 2) * 50,
            left: -50 + Math.cos(progress * Math.PI * 2) * 50,
            width: 300 + Math.sin(progress * Math.PI * 2) * 80,
            height: 300 + Math.cos(progress * Math.PI * 2) * 80,
            borderRadius: 150 + Math.sin(progress * Math.PI * 2) * 40,
            transform: [
              { rotate: `${progress * 360}deg` },
              { scale: 1 + Math.sin(progress * Math.PI) * 0.2 }
            ]
          }
        ]} />

        <View style={[
          styles.flowingShape,
          {
            backgroundColor: BLUE_LIGHT + '10',
            bottom: -50 + Math.cos(progress * Math.PI * 2) * 50,
            right: -50 + Math.sin(progress * Math.PI * 2) * 50,
            width: 250 + Math.cos(progress * Math.PI * 2) * 50,
            height: 250 + Math.sin(progress * Math.PI * 2) * 50,
            borderRadius: 125 + Math.cos(progress * Math.PI * 2) * 25,
            transform: [
              { rotate: `${-progress * 360}deg` },
              { scale: 1 + Math.cos(progress * Math.PI) * 0.2 }
            ]
          }
        ]} />
      </View>

      {/* Navbar */}
      <View style={styles.navbar}>
        <Pressable onPress={() => router.push("/")} style={styles.logoContainer}>
          <Image source={images.logo} style={styles.logoImage} resizeMode="contain" />
          <Text style={styles.logoText}>Brio</Text>
        </Pressable>

        <View style={styles.navButtons}>
          <Pressable
            style={styles.loginBtn}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.loginText}>Sign In</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(auth)/register")}
            style={styles.registerWrapper}
          >
            <LinearGradient
              colors={[BLUE_LIGHT, BLUE, BLUE_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.registerGradient}
            >
              <Text style={styles.registerText}>Get Started</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* New Hero Section */}
        <Animated.View 
          style={[styles.section, styles.heroSection]}
          entering={FadeInUp.delay(0).duration(800).springify()}
        >
          {/* Floating Icons Layer */}
          <View style={styles.floatingIconsLayer}>
            <Animated.Image source={heroImages.love} style={[styles.floatIcon, styles.posLoveTop]} entering={FadeInUp.delay(400).springify()} />
            <Animated.Image source={heroImages.love} style={[styles.floatIcon, styles.posLoveMid]} entering={FadeInUp.delay(500).springify()} />
          </View>

          {/* Hero Content */}
          <View style={styles.heroTextContent}>
            <Text style={styles.heroMainTitle}>
              Transform Your Brand with <Text style={styles.heartEmoji}>❤️</Text>
            </Text>
            <Text style={styles.heroSubTitle}>AI-Powered Influencer Marketing</Text>
            <Text style={styles.heroDesc}>
              Brio connects you with the perfect influencers, measures campaign performance, and maximizes your ROI all in one platform.
            </Text>
            
            <View style={styles.heroCtaGroup}>
              <Pressable onPress={() => router.push("/(auth)/register")} style={styles.primaryButton}>
                <LinearGradient colors={[BLUE_LIGHT, BLUE]} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.heroBtnGradient}>
                  <Text style={styles.primaryBtnText}>Get Started Free</Text>
                </LinearGradient>
              </Pressable>
              <Pressable onPress={() => router.push("/view-demo")} style={styles.secondaryButton}>
                <Feather name="play-circle" size={18} color={BLACK} style={{ marginRight: 8 }} />
                <Text style={styles.secondaryBtnText}>View Demo</Text>
              </Pressable>
            </View>
          </View>

          {/* Image Collage */}
          <Animated.View style={styles.collageContainer} entering={SlideInDown.delay(300).duration(800)}>
            <View style={styles.collageGrid}>
              <View style={styles.collageRowTop}>
                <Image source={heroImages.hero1} style={[styles.collageImage, styles.img1]} />
                <Image source={heroImages.hero2} style={[styles.collageImage, styles.img2]} />
              </View>
              <View style={styles.collageRowBottom}>
                <Image source={heroImages.hero3} style={[styles.collageImage, styles.img3]} />
                <Image source={heroImages.hero4} style={[styles.collageImage, styles.img4]} />
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Partnership Scroll Section */}
        <Animated.View entering={FadeInUp.delay(200).duration(800).springify()}>
          <PartnershipScroll />
        </Animated.View>

        {/* Features Section Container */}
        <View style={styles.featuresContainer}>
          {/* Influencer Discovery */}
          <Animated.View entering={FadeInUp.delay(300).duration(800).springify()} style={styles.featureBlock}>
            <Image source={featureImages.influencersList} style={styles.featureImageFull} resizeMode="contain" />
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureSectionTitle}>INFLUENCER DISCOVERY</Text>
              <View style={styles.featureList}>
                <View style={styles.featureItem}><Feather name="check-circle" size={20} color={BLUE} /><Text style={styles.featureItemText}>Discover influencers who genuinely fit your brand</Text></View>
                <View style={styles.featureItem}><Feather name="check-circle" size={20} color={BLUE} /><Text style={styles.featureItemText}>Not just more creators. The right creators.</Text></View>
                <View style={styles.featureItem}><Feather name="check-circle" size={20} color={BLUE} /><Text style={styles.featureItemText}>Insight-powered decision-making</Text></View>
                <View style={styles.featureItem}><Feather name="check-circle" size={20} color={BLUE} /><Text style={styles.featureItemText}>Let creators find YOU</Text></View>
              </View>
            </View>
          </Animated.View>

          {/* Campaign Speed */}
          <Animated.View entering={FadeInUp.delay(400).duration(800).springify()} style={styles.featureBlock}>
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureSectionTitle}>CAMPAIGNS THAT MOVE AT YOUR SPEED</Text>
              <Text style={styles.featureDesc}>
                Paste your product link and provide the key details. Our AI instantly analyzes your product and gets to work. Within moments, it generates a complete, ready-to-launch campaign.
              </Text>
              <Text style={[styles.featureDesc, { color: BLUE, fontWeight: '600', marginTop: 10 }]}>
                Just share the basics and receive your campaign in minutes.
              </Text>
            </View>
            <Image source={featureImages.campaignCreation} style={styles.featureImageFull} resizeMode="contain" />
          </Animated.View>

          {/* Main Features Grid */}
          <Animated.View entering={FadeInUp.delay(500).duration(800).springify()} style={styles.featureGrid}>
            <View style={styles.featureCardLarge}>
              <Text style={styles.featureCardTitle}>AI-Powered Campaign Management</Text>
              <Text style={styles.featureCardDesc}>Manage influencer campaigns end-to-end with AI-driven precision.</Text>
              <View style={styles.featureBulletList}>
                <View style={styles.featureBulletItem}><Feather name="check-circle" size={16} color={BLUE}/><Text style={styles.featureBulletText}>One-click campaign creation & automation</Text></View>
                <View style={styles.featureBulletItem}><Feather name="check-circle" size={16} color={BLUE}/><Text style={styles.featureBulletText}>Centralized creator communication & approvals</Text></View>
                <View style={styles.featureBulletItem}><Feather name="check-circle" size={16} color={BLUE}/><Text style={styles.featureBulletText}>Smart timelines, briefs & deliverable tracking</Text></View>
                <View style={styles.featureBulletItem}><Feather name="check-circle" size={16} color={BLUE}/><Text style={styles.featureBulletText}>AI insights to optimize performance in real time</Text></View>
              </View>
              <View style={styles.featureCardImageWrapper}>
                <Image source={featureImages.campaignDashboard} style={styles.featureGridImage} resizeMode="cover" />
              </View>
            </View>

            <View style={styles.featureCardMedium}>
              <Text style={styles.featureCardTitle}>Smart Matching & Outreach</Text>
              <Text style={styles.featureCardDesc}>Connect with ideal creators using AI that identifies authentic, high-performing influencers tailored to your brand.</Text>
              <View style={styles.featureCardImageWrapper}>
                <Image source={featureImages.matchingInterface} style={styles.featureGridImageSmaller} resizeMode="cover" />
              </View>
            </View>

            <View style={styles.featureCardMedium}>
              <Text style={styles.featureCardTitle}>Automated Performance Tracking</Text>
              <Text style={styles.featureCardDesc}>Real-time analytics and ROI measurement for all campaigns. Track engagement, conversions, and creator performance instantly.</Text>
              <View style={styles.featureCardImageWrapper}>
                <Image source={featureImages.analyticsDashboard} style={styles.featureGridImageSmaller} resizeMode="cover" />
              </View>
            </View>
          </Animated.View>

          {/* Affiliate Marketing */}
          <Animated.View entering={FadeInUp.delay(600).duration(800).springify()} style={styles.featureBlock}>
            <Image source={featureImages.ecommerceStats} style={styles.featureImageFull} resizeMode="contain" />
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureSectionTitle}>AFFILIATE MARKETING MADE SMARTER</Text>
              <Text style={styles.featureDesc}>
                Boost ROI with influencer-driven affiliate marketing. Manage campaigns, tracking, and payouts in one place. Drive more traffic to your product pages to increase sales. Reward influencers with performance-based instant payments.
              </Text>
            </View>
          </Animated.View>

          {/* About Section - What We Do */}
          <Animated.View entering={FadeInUp.delay(700).duration(800).springify()} style={styles.featureBlock}>
            <Image source={featureImages.about3} style={styles.featureImageFull} resizeMode="contain" />
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureSectionTitle}>WHAT WE DO</Text>
              <Text style={styles.featureDesc}>
                We empower brands with cutting-edge AI technology that transforms how you discover, engage, and measure influencer partnerships. Our platform eliminates guesswork and delivers measurable results through intelligent automation and comprehensive analytics.
              </Text>
              <View style={[styles.featureList, { marginTop: 16 }]}>
                <View style={styles.featureItem}><Feather name="check-circle" size={20} color={BLUE} /><Text style={styles.featureItemText}>AI-Powered Influencer Discovery & Matching</Text></View>
                <View style={styles.featureItem}><Feather name="check-circle" size={20} color={BLUE} /><Text style={styles.featureItemText}>Intelligent Campaign Management & Automation</Text></View>
                <View style={styles.featureItem}><Feather name="check-circle" size={20} color={BLUE} /><Text style={styles.featureItemText}>Real-Time Performance Tracking & Analytics</Text></View>
                <View style={styles.featureItem}><Feather name="check-circle" size={20} color={BLUE} /><Text style={styles.featureItemText}>End-to-End Workflow Automation & Optimization</Text></View>
              </View>
            </View>
          </Animated.View>

          {/* About Section - AI Features */}
          <Animated.View entering={FadeInUp.delay(800).duration(800).springify()} style={styles.featureBlock}>
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureSectionTitle}>INTELLIGENT TECHNOLOGY FOR MODERN MARKETING</Text>
              <Text style={styles.featureDesc}>
                Leverage sophisticated AI algorithms to identify perfect brand-creator matches, optimize campaign performance, and track meaningful metrics that drive business growth.
              </Text>
              <View style={[styles.featureList, { marginTop: 16 }]}>
                <View style={styles.featureItem}><Feather name="check-circle" size={16} color={BLUE} /><Text style={styles.featureItemText}>Machine Learning-Powered Recommendations</Text></View>
                <View style={styles.featureItem}><Feather name="check-circle" size={16} color={BLUE} /><Text style={styles.featureItemText}>Strategic Partnerships & Industry Collaboration</Text></View>
                <View style={styles.featureItem}><Feather name="check-circle" size={16} color={BLUE} /><Text style={styles.featureItemText}>Extensive Influencer & Brand Ecosystem</Text></View>
                <View style={styles.featureItem}><Feather name="check-circle" size={16} color={BLUE} /><Text style={styles.featureItemText}>Comprehensive Analytics & Actionable Insights</Text></View>
              </View>
            </View>
            <Image source={featureImages.about2} style={[styles.featureImageFull, { marginTop: 24 }]} resizeMode="contain" />
          </Animated.View>

          {/* About Section - Our Mission */}
          <Animated.View entering={FadeInUp.delay(900).duration(800).springify()} style={styles.featureBlock}>
            <Image source={featureImages.about1} style={styles.featureImageFull} resizeMode="contain" />
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureSectionTitle}>OUR MISSION</Text>
              <Text style={styles.featureDesc}>
                We exist to democratize influencer marketing, making sophisticated partnership strategies accessible to organizations of every size. By harnessing the power of artificial intelligence and machine learning, we help marketers navigate the complex creator landscape, forge authentic connections, and achieve exceptional ROI through transparent, data-driven workflows.
              </Text>
              <View style={[styles.featureList, { marginTop: 16 }]}>
                <View style={styles.featureItem}>
                  <Feather name="check-circle" size={20} color={BLUE} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.featureItemText, { fontWeight: '700' }]}>Democratize Access to Premium Partnerships</Text>
                    <Text style={styles.aboutSmallText}>Enabling businesses of all sizes to leverage world-class influencer marketing strategies and tools</Text>
                  </View>
                </View>
                <View style={styles.featureItem}>
                  <Feather name="check-circle" size={20} color={BLUE} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.featureItemText, { fontWeight: '700' }]}>Champion Transparency & Trust</Text>
                    <Text style={styles.aboutSmallText}>Delivering crystal-clear insights into campaign performance, influencer authenticity, and engagement metrics</Text>
                  </View>
                </View>
                <View style={styles.featureItem}>
                  <Feather name="check-circle" size={20} color={BLUE} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.featureItemText, { fontWeight: '700' }]}>Maximize Operational Efficiency</Text>
                    <Text style={styles.aboutSmallText}>Automating repetitive workflows so teams can focus on strategic thinking and creative innovation</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Testimonials Section */}
        <Animated.View entering={FadeInUp.delay(200).duration(800).springify()}>
          <TestimonialsSection />
        </Animated.View>

        {/* CTA Footer */}
        <Animated.View 
          style={styles.ctaSection}
          entering={FadeInUp.delay(800).duration(800).springify()}
        >
          <Text style={styles.ctaTitle}>Ready to Level Up?</Text>
          <Text style={styles.ctaSubtitle}>Join thousands of top creators and innovative brands today.</Text>
          <View style={styles.ctaButtons}>
            <Pressable onPress={() => router.push("/(auth)/register")}>
              <LinearGradient
                colors={[BLUE_LIGHT, BLUE]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.footerRegisterGradient}
              >
                <Text style={styles.footerRegisterText}>Create Free Account</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>

        {/* Real Footer mimicking Brio.devopstrio.co.uk */}
        <View style={styles.siteFooter}>
          <View style={styles.footerTopContent}>
            {/* Brand Column */}
            <View style={styles.footerBrandCol}>
              <Pressable onPress={() => Linking.openURL('https://brio.devopstrio.co.uk/')}>
                <Text style={styles.footerLogo}>Brio.</Text>
              </Pressable>
              <Text style={styles.footerBrandDesc}>
                AI-powered influencer marketing platform connecting brands with creators worldwide.
              </Text>
              <View style={styles.footerSocials}>
                <Pressable style={styles.socialIconBox} onPress={() => Linking.openURL('https://www.facebook.com/profile.php?id=61579126233218')}>
                  <MaterialCommunityIcons name="facebook" size={18} color={GRAY} />
                </Pressable>
                <Pressable style={styles.socialIconBox} onPress={() => Linking.openURL('https://devopstrio.co.uk/')}>
                  <MaterialCommunityIcons name="web" size={18} color={GRAY} />
                </Pressable>
                <Pressable style={styles.socialIconBox} onPress={() => Linking.openURL('https://www.linkedin.com/company/devopstrioglobal/posts/?feedView=all')}>
                  <MaterialCommunityIcons name="linkedin" size={18} color={GRAY} />
                </Pressable>
                <Pressable style={styles.socialIconBox} onPress={() => Linking.openURL('https://www.instagram.com/devopstrio_offcl/')}>
                  <MaterialCommunityIcons name="instagram" size={18} color={GRAY} />
                </Pressable>
              </View>
            </View>


          </View>

          <View style={styles.footerBottomBar}>
            <Text style={styles.footerCopyright}>© {new Date().getFullYear()} Brio. All rights reserved.</Text>
            <View style={styles.footerLegal}>
              <Text style={styles.footerLegalLink}>Privacy Policy</Text>
              <Text style={styles.footerLegalLink}>Terms of Service</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  organicContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 0,
  },
  flowingShape: {
    position: "absolute",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
    paddingBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    zIndex: 10,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: BLACK,
    letterSpacing: -0.5,
  },
  navButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginBtn: {
    marginRight: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  loginText: {
    fontSize: 15,
    fontWeight: '600',
    color: GRAY,
  },
  registerWrapper: {
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  registerGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  registerText: {
    color: WHITE,
    fontWeight: "600",
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  section: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
    minHeight: height * 0.75,
  },
  heroSection: {
    minHeight: height * 0.8,
    marginTop: 10,
    justifyContent: 'flex-start',
    paddingTop: 0,
    paddingBottom: 20,
    position: 'relative',
  },
  floatingIconsLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  floatIcon: {
    position: 'absolute',
    width: 32,
    height: 32,
    opacity: 0.8,
  },
  posLoveTop: { top: '15%', right: '10%', width: 24, height: 24, transform: [{ rotate: '15deg' }] },
  posLoveMid: { top: '40%', left: '2%', width: 28, height: 28 },
  heroTextContent: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
    zIndex: 2,
    paddingHorizontal: 10,
  },
  heroMainTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: BLACK,
    textAlign: 'center',
    lineHeight: 52,
    marginBottom: 8,
    letterSpacing: -1,
  },
  heartEmoji: {
    fontSize: 36,
  },
  heroSubTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BLUE,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  heroDesc: {
    fontSize: 16,
    color: GRAY,
    textAlign: 'center',
    lineHeight: 26,
  },
  heroCtaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 16,
    flexWrap: 'wrap',
  },
  primaryButton: {
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  heroBtnGradient: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
  },
  primaryBtnText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: WHITE,
  },
  secondaryBtnText: {
    color: BLACK,
    fontSize: 16,
    fontWeight: '700',
  },
  collageContainer: {
    width: '100%',
    zIndex: 2,
    marginVertical: 10,
    paddingHorizontal: 0,
  },
  collageGrid: {
    width: '100%',
    gap: 12,
  },
  collageRowTop: {
    flexDirection: 'row',
    gap: 12,
    height: 180,
    justifyContent: 'center',
  },
  collageRowBottom: {
    flexDirection: 'row',
    gap: 12,
    height: 160,
    justifyContent: 'center',
  },
  collageImage: {
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  img1: { flex: 1.5, height: '100%' },
  img2: { flex: 1, height: '100%' },
  img3: { flex: 1, height: '100%' },
  img4: { flex: 1.5, height: '100%' },
  featuresContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  featureBlock: {
    width: '100%',
    marginBottom: 60,
    alignItems: 'flex-start',
  },
  featureTextWrapper: {
    width: '100%',
    marginTop: 24,
  },
  featureImageFull: {
    width: '100%',
    height: 250,
  },
  featureSectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BLUE,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureItemText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
    lineHeight: 24,
  },
  featureDesc: {
    fontSize: 16,
    color: GRAY,
    lineHeight: 24,
  },
  aboutSmallText: {
    fontSize: 14,
    color: GRAY,
    lineHeight: 20,
    marginTop: 2,
  },
  featureGrid: {
    width: '100%',
    gap: 20,
    marginBottom: 60,
  },
  featureCardLarge: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: '100%',
  },
  featureCardMedium: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: '100%',
  },
  featureCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BLACK,
    marginBottom: 12,
  },
  featureCardDesc: {
    fontSize: 15,
    color: GRAY,
    lineHeight: 22,
    marginBottom: 20,
  },
  featureBulletList: {
    gap: 12,
    marginBottom: 24,
  },
  featureBulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureBulletText: {
    fontSize: 14,
    color: BLACK,
    flex: 1,
    lineHeight: 20,
  },
  featureCardImageWrapper: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureGridImage: {
    width: '100%',
    height: '100%',
  },
  featureGridImageSmaller: {
    width: '90%',
    height: '90%',
  },
  ctaSection: {
    padding: 40,
    alignItems: "center",
    backgroundColor: WHITE,
    marginHorizontal: 20,
    borderRadius: 32,
    marginTop: 40,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: BLACK,
    marginBottom: 12,
    textAlign: "center",
  },
  ctaSubtitle: {
    fontSize: 15,
    color: GRAY,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  ctaButtons: {
    width: '100%',
    alignItems: 'center',
  },
  footerRegisterGradient: {
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 30,
    width: '100%',
  },
  footerRegisterText: {
    color: WHITE,
    fontWeight: "700",
    fontSize: 16,
    textAlign: 'center',
  },
  partnershipContainer: {
    marginTop: 10,
    marginBottom: 40,
    width: '100%',
  },
  partnershipHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  partnershipTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: BLACK,
    marginBottom: 12,
    textAlign: 'center',
  },
  partnershipSubtitle: {
    fontSize: 16,
    color: GRAY,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 24,
  },
  marqueeWrapper: {
    overflow: 'hidden',
    width: '100%',
    paddingVertical: 10,
  },
  marqueeTrack: {
    flexDirection: 'row',
    width: TOTAL_WIDTH * 2,
  },
  partnerItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  partnerLogoContainer: {
    height: 45,
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  partnerLogo: {
    width: '100%',
    height: '100%',
  },
  partnerName: {
    fontSize: 13,
    fontWeight: '600',
    color: BLACK,
    textAlign: 'center',
  },
  testimonialsSection: {
    width: '100%',
    paddingVertical: 50,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  testimonialsTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: BLACK,
    marginBottom: 12,
    textAlign: 'center',
  },
  testimonialsSubtitle: {
    fontSize: 16,
    color: GRAY,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  testimonialsScrollWrapper: {
    width: '100%',
    overflow: 'hidden',
  },
  testimonialsTrack: {
    flexDirection: 'row',
    width: TOTAL_TESTIMONIALS_WIDTH * 2,
  },
  testimonialCard: {
    width: TESTIMONIAL_CARD_WIDTH,
    marginRight: TESTIMONIAL_MARGIN,
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  testimonialAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  testimonialAuthorInfo: {
    flex: 1,
  },
  testimonialAuthorName: {
    fontSize: 16,
    fontWeight: '700',
    color: BLACK,
  },
  testimonialAuthorRole: {
    fontSize: 13,
    color: GRAY,
    marginTop: 2,
  },
  testimonialStars: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 2,
  },
  testimonialContent: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  siteFooter: {
    width: '100%',
    backgroundColor: '#f8fafc',
    paddingTop: 60,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 40,
  },
  footerTopContent: {
    paddingHorizontal: 24,
    flexDirection: 'column',
    gap: 40,
  },
  footerBrandCol: {
    width: '100%',
  },
  footerLogo: {
    fontSize: 28,
    fontWeight: '800',
    color: BLUE,
    letterSpacing: -1,
    marginBottom: 12,
  },
  footerBrandDesc: {
    fontSize: 15,
    color: GRAY,
    lineHeight: 22,
    marginBottom: 20,
    maxWidth: '90%',
  },
  footerSocials: {
    flexDirection: 'row',
    gap: 12,
  },
  socialIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLinksWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 30,
    paddingBottom: 40,
  },
  footerLinkCol: {
    flex: 1,
    minWidth: 130,
  },
  footerLinkTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BLACK,
    marginBottom: 16,
  },
  footerLink: {
    fontSize: 14,
    color: GRAY,
    marginBottom: 12,
    
  },
  footerBottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 24,
    paddingTop: 24,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  footerCopyright: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
  footerLegal: {
    flexDirection: 'row',
    gap: 20,
  },
  footerLegalLink: {
    fontSize: 13,
    color: '#94a3b8',
  },
});