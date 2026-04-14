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
} from "react-native";
import { router } from "expo-router";
import { useState, useRef } from "react";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';


const { width, height } = Dimensions.get("window");

const BLUE = "#0f6eea";
const BLUE_LIGHT = "#3d8ef5";
const BLUE_DARK = "#0a4faa";
const WHITE = "#ffffff";
const BLACK = "#1e2937";
const GRAY = "#64748b";

// Image imports
const images = {
  welcome: require('../assets/images/onboarding/welcome.png'),
  brands: require('../assets/images/onboarding/brands.png'),
  influencers: require('../assets/images/onboarding/influencers.png'),
  ai: require('../assets/images/onboarding/ai.png'),
  getStarted: require('../assets/images/onboarding/get-started.png'),
};

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollX, setScrollX] = useState(0);

  const steps = [
    {
      id: 1,
      component: StepWelcome,
      image: images.welcome,
      primaryColor: BLUE,
      secondaryColor: BLUE_LIGHT,
    },
    {
      id: 2,
      component: StepBrands,
      image: images.brands,
      primaryColor: '#8B5CF6',
      secondaryColor: '#7C3AED',
    },
    {
      id: 3,
      component: StepInfluencers,
      image: images.influencers,
      primaryColor: '#EC4899',
      secondaryColor: '#DB2777',
    },
    {
      id: 4,
      component: StepAI,
      image: images.ai,
      primaryColor: '#10B981',
      secondaryColor: '#059669',
    },
    {
      id: 5,
      component: StepGetStarted,
      image: images.getStarted,
      primaryColor: BLUE,
      secondaryColor: BLUE_DARK,
    }
  ];

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    setScrollX(scrollPosition);
    const stepIndex = Math.round(scrollPosition / width);
    setCurrentStep(stepIndex);
  };

  const goToStep = (index: number) => {
    if (!scrollViewRef.current) return;
    scrollViewRef.current.scrollTo({
      x: index * width,
      animated: true,
    });
  };

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1);
    }
  };

  // Calculate progress for organic transitions
  const progress = (scrollX % width) / width;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* Dynamic Organic Shapes Container */}
      <View style={styles.organicContainer}>
        {/* Flowing background shapes */}
        <View style={[
          styles.flowingShape,
          {
            backgroundColor: steps[currentStep]?.primaryColor + '10',
            top: -50 + Math.sin(progress * Math.PI) * 30,
            left: -50 + Math.cos(progress * Math.PI) * 30,
            width: 300 + Math.sin(progress * Math.PI) * 50,
            height: 300 + Math.cos(progress * Math.PI) * 50,
            borderRadius: 150 + Math.sin(progress * Math.PI) * 30,
            transform: [
              { rotate: `${progress * 180}deg` },
              { scale: 1 + Math.sin(progress * Math.PI) * 0.1 }
            ]
          }
        ]} />

        <View style={[
          styles.flowingShape,
          {
            backgroundColor: steps[currentStep]?.secondaryColor + '10',
            bottom: -50 + Math.sin((progress + 0.5) * Math.PI) * 30,
            right: -50 + Math.cos((progress + 0.5) * Math.PI) * 30,
            width: 250 + Math.cos(progress * Math.PI) * 50,
            height: 250 + Math.sin(progress * Math.PI) * 50,
            borderRadius: 125 + Math.cos(progress * Math.PI) * 25,
            transform: [
              { rotate: `${-progress * 180}deg` },
              { scale: 1 + Math.cos(progress * Math.PI) * 0.1 }
            ]
          }
        ]} />

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const distance = 100 + Math.sin(progress * Math.PI * 2 + i) * 30;
          return (
            <View
              key={i}
              style={[
                styles.particle,
                {
                  backgroundColor: i % 2 === 0 ? steps[currentStep]?.primaryColor : steps[currentStep]?.secondaryColor,
                  left: width / 2 + Math.cos(angle + progress * Math.PI) * distance - 10,
                  top: height / 3 + Math.sin(angle + progress * Math.PI) * distance - 10,
                  opacity: 0.1 + Math.sin(progress * Math.PI + i) * 0.05,
                  transform: [
                    { scale: 0.5 + Math.sin(progress * Math.PI * 2 + i) * 0.3 }
                  ]
                }
              ]}
            />
          );
        })}

        {/* Connecting tendrils */}
        <View style={[
          styles.tendril,
          {
            backgroundColor: steps[currentStep]?.primaryColor + '15',
            top: height * 0.2,
            left: -100 + progress * 200,
            width: 200 + Math.sin(progress * Math.PI) * 100,
            height: 3,
            transform: [
              { rotate: `${45 + progress * 90}deg` },
              { scaleX: 1 + Math.sin(progress * Math.PI) * 0.5 }
            ]
          }
        ]} />

        <View style={[
          styles.tendril,
          {
            backgroundColor: steps[currentStep]?.secondaryColor + '15',
            bottom: height * 0.2,
            right: -100 + (1 - progress) * 200,
            width: 200 + Math.cos(progress * Math.PI) * 100,
            height: 3,
            transform: [
              { rotate: `${-45 - progress * 90}deg` },
              { scaleX: 1 + Math.cos(progress * Math.PI) * 0.5 }
            ]
          }
        ]} />
      </View>

      {/* Skip Button */}
      {currentStep < steps.length - 1 && (
        <Pressable
          style={styles.skipButton}
          onPress={() => router.push("/platformdetails")}
        >
          <Text style={styles.skipText}>View Platform</Text>
        </Pressable>
      )}

      {/* Swipeable Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {steps.map((step, index) => {
          const StepComponent = step.component;
          return (
            <View key={step.id} style={styles.stepContainer}>
              <StepComponent
                image={step.image}
                color={step.primaryColor}
                secondaryColor={step.secondaryColor}
                progress={index === currentStep ? progress : 0}
                isActive={index === currentStep}
                nextColor={index < steps.length - 1 ? steps[index + 1].primaryColor : step.primaryColor}
                prevColor={index > 0 ? steps[index - 1].primaryColor : step.primaryColor}
              />
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {/* Continue/Get Started Button */}
        {currentStep === steps.length - 1 ? (
          <View style={styles.finalButtons}>
            <Pressable
              style={styles.loginButton}
              onPress={() => router.push("/(auth)/login")}
            >
              <LinearGradient
                colors={[BLUE_LIGHT, BLUE_DARK]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginGradient}
              >
                <Feather name="log-in" size={20} color={WHITE} />
                <Text style={styles.loginButtonText}>Login</Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              style={styles.registerButton}
              onPress={() => router.push("/(auth)/register")}
            >
              <Feather name="user-plus" size={20} color={steps[currentStep].primaryColor} />
              <Text style={[styles.registerButtonText, { color: steps[currentStep].primaryColor }]}>
                Create Account
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.nextButton}
            onPress={goToNextStep}
          >
            <LinearGradient
              colors={[steps[currentStep].primaryColor, steps[currentStep].secondaryColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
              <Feather name="arrow-right" size={20} color={WHITE} />
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// Step 1: Welcome
function StepWelcome({ image, color, secondaryColor, progress, isActive, nextColor, prevColor }) {
  return (
    <View style={styles.stepContent}>
      {/* Dynamic corner flows */}
      <View style={[
        styles.flowCorner,
        {
          backgroundColor: color + '15',
          top: -30 + Math.sin(progress * Math.PI) * 20,
          left: -30 + Math.cos(progress * Math.PI) * 20,
          width: 150 + Math.sin(progress * Math.PI) * 50,
          height: 150 + Math.cos(progress * Math.PI) * 50,
          borderRadius: 75 + Math.sin(progress * Math.PI) * 25,
          transform: [
            { rotate: `${progress * 90}deg` },
            { scale: 1 + Math.sin(progress * Math.PI) * 0.2 }
          ]
        }
      ]} />

      <View style={[
        styles.flowCorner,
        {
          backgroundColor: secondaryColor + '15',
          bottom: -30 + Math.cos(progress * Math.PI) * 20,
          right: -30 + Math.sin(progress * Math.PI) * 20,
          width: 150 + Math.cos(progress * Math.PI) * 50,
          height: 150 + Math.sin(progress * Math.PI) * 50,
          borderRadius: 75 + Math.cos(progress * Math.PI) * 25,
          transform: [
            { rotate: `${-progress * 90}deg` },
            { scale: 1 + Math.cos(progress * Math.PI) * 0.2 }
          ]
        }
      ]} />

      {/* Floating bubbles */}
      {[...Array(5)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.bubble,
            {
              backgroundColor: i % 2 === 0 ? color + '10' : secondaryColor + '10',
              left: 50 + i * 60 + Math.sin(progress * Math.PI * 2 + i) * 20,
              top: height * 0.4 + Math.cos(progress * Math.PI * 2 + i) * 30,
              width: 40 + Math.sin(progress * Math.PI + i) * 10,
              height: 40 + Math.cos(progress * Math.PI + i) * 10,
              transform: [
                { scale: 0.8 + Math.sin(progress * Math.PI * 2 + i) * 0.2 }
              ]
            }
          ]}
        />
      ))}

      <View style={styles.imageContainer}>
        <Image
          source={image}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textContainer}>
        <View style={[styles.badge, { backgroundColor: color + '15' }]}>
          <MaterialCommunityIcons name="robot" size={16} color={color} />
          <Text style={[styles.badgeText, { color }]}>AI-POWERED</Text>
        </View>

        <Text style={styles.title}>
          Welcome to{' '}
          <Text style={[styles.titleHighlight, { color }]}>Brio</Text>
        </Text>

        <Text style={styles.description}>
          The smartest way to connect brands with creators — powered by AI, built for results.
        </Text>
      </View>
    </View>
  );
}

// Step 2: For Brands
function StepBrands({ image, color, secondaryColor, progress, isActive, nextColor }) {
  const features = [
    { icon: "target", label: "Campaign Management", IconComponent: Feather },
    { icon: "bar-chart-2", label: "Analytics Dashboard", IconComponent: Feather },
    { icon: "users", label: "Influencer Discovery", IconComponent: Feather },
    { icon: "zap", label: "Performance Tracking", IconComponent: Feather },
  ];

  return (
    <View style={styles.stepContent}>
      {/* Dynamic flowing shapes */}
      <View style={[
        styles.flowLine,
        {
          backgroundColor: color + '15',
          top: height * 0.15,
          left: -50 + progress * 100,
          width: 200 + Math.sin(progress * Math.PI) * 100,
          height: 4,
          transform: [
            { rotate: `${30 + progress * 60}deg` },
            { scaleX: 1 + Math.sin(progress * Math.PI) * 0.5 }
          ]
        }
      ]} />

      <View style={[
        styles.flowLine,
        {
          backgroundColor: secondaryColor + '15',
          bottom: height * 0.15,
          right: -50 + (1 - progress) * 100,
          width: 200 + Math.cos(progress * Math.PI) * 100,
          height: 4,
          transform: [
            { rotate: `${-30 - progress * 60}deg` },
            { scaleX: 1 + Math.cos(progress * Math.PI) * 0.5 }
          ]
        }
      ]} />

      {/* Floating squares */}
      {[...Array(4)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.floatSquare,
            {
              backgroundColor: i % 2 === 0 ? color + '10' : secondaryColor + '10',
              left: 30 + i * 80 + Math.cos(progress * Math.PI * 2 + i) * 20,
              top: height * 0.3 + i * 30 + Math.sin(progress * Math.PI * 2 + i) * 20,
              width: 30 + Math.sin(progress * Math.PI + i) * 10,
              height: 30 + Math.cos(progress * Math.PI + i) * 10,
              transform: [
                { rotate: `${progress * 90 + i * 45}deg` },
                { scale: 0.7 + Math.sin(progress * Math.PI * 2 + i) * 0.2 }
              ]
            }
          ]}
        />
      ))}

      <View style={styles.imageContainer}>
        <Image
          source={image}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textContainer}>
        <View style={[styles.badge, { backgroundColor: color + '15' }]}>
          <Feather name="briefcase" size={16} color={color} />
          <Text style={[styles.badgeText, { color }]}>FOR BRANDS</Text>
        </View>

        <Text style={styles.title}>
          Grow Your Brand{' '}
          <Text style={[styles.titleHighlight, { color }]}>Effortlessly</Text>
        </Text>

        <Text style={styles.description}>
          Launch campaigns, discover top creators, and track ROI — all in one place.
        </Text>
      </View>

      <View style={styles.featuresGrid}>
        {features.map((feature, index) => {
          const IconComponent = feature.IconComponent;
          return (
            <View key={index} style={[styles.featureChip, { borderColor: color + '30' }]}>
              <IconComponent name={feature.icon} size={18} color={color} />
              <Text style={styles.featureLabel}>{feature.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// Step 3: For Influencers
function StepInfluencers({ image, color, secondaryColor, progress, isActive, nextColor }) {
  const features = [
    { icon: "star", label: "Campaign Matching", IconComponent: Feather },
    { icon: "trending-up", label: "Growth Analytics", IconComponent: Feather },
    { icon: "user", label: "Profile Management", IconComponent: Feather },
    { icon: "credit-card", label: "Payment Processing", IconComponent: Feather },
  ];

  return (
    <View style={styles.stepContent}>
      {/* Dynamic wave shapes */}
      <View style={[
        styles.flowWave,
        {
          backgroundColor: color + '10',
          top: 20 + Math.sin(progress * Math.PI) * 20,
          left: -30 + Math.cos(progress * Math.PI) * 30,
          width: 200 + Math.sin(progress * Math.PI * 2) * 50,
          height: 100 + Math.cos(progress * Math.PI) * 30,
          borderRadius: 50 + Math.sin(progress * Math.PI) * 20,
          transform: [
            { skewX: `${progress * 20}deg` },
            { scale: 1 + Math.sin(progress * Math.PI) * 0.2 }
          ]
        }
      ]} />

      <View style={[
        styles.flowWave,
        {
          backgroundColor: secondaryColor + '10',
          bottom: 20 + Math.cos(progress * Math.PI) * 20,
          right: -30 + Math.sin(progress * Math.PI) * 30,
          width: 200 + Math.cos(progress * Math.PI * 2) * 50,
          height: 100 + Math.sin(progress * Math.PI) * 30,
          borderRadius: 50 + Math.cos(progress * Math.PI) * 20,
          transform: [
            { skewX: `${-progress * 20}deg` },
            { scale: 1 + Math.cos(progress * Math.PI) * 0.2 }
          ]
        }
      ]} />

      {/* Floating circles */}
      {[...Array(6)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.floatCircle,
            {
              backgroundColor: i % 2 === 0 ? color + '08' : secondaryColor + '08',
              left: 40 + i * 50 + Math.sin(progress * Math.PI * 2 + i) * 30,
              top: height * 0.5 + Math.cos(progress * Math.PI * 2 + i) * 40,
              width: 20 + Math.sin(progress * Math.PI + i) * 15,
              height: 20 + Math.cos(progress * Math.PI + i) * 15,
              transform: [
                { scale: 0.6 + Math.sin(progress * Math.PI * 2 + i) * 0.3 }
              ]
            }
          ]}
        />
      ))}

      <View style={styles.imageContainer}>
        <Image
          source={image}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textContainer}>
        <View style={[styles.badge, { backgroundColor: color + '15' }]}>
          <Feather name="camera" size={16} color={color} />
          <Text style={[styles.badgeText, { color }]}>FOR CREATORS</Text>
        </View>

        <Text style={styles.title}>
          Monetize Your{' '}
          <Text style={[styles.titleHighlight, { color }]}>Influence</Text>
        </Text>

        <Text style={styles.description}>
          Connect with top brands, grow your audience, and earn — your way.
        </Text>
      </View>

      <View style={styles.featuresGrid}>
        {features.map((feature, index) => {
          const IconComponent = feature.IconComponent;
          return (
            <View key={index} style={[styles.featureChip, { borderColor: color + '30' }]}>
              <IconComponent name={feature.icon} size={18} color={color} />
              <Text style={styles.featureLabel}>{feature.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// Step 4: AI Tools
function StepAI({ image, color, secondaryColor, progress, isActive, nextColor }) {
  const tools = [
    { icon: "robot", name: "Smart Matching", IconComponent: MaterialCommunityIcons },
    { icon: "edit", name: "Content Generation", IconComponent: Feather },
    { icon: "trending-up", name: "Predictive Analytics", IconComponent: Feather },
    { icon: "users", name: "Audience Insights", IconComponent: Feather },
  ];

  return (
    <View style={styles.stepContent}>
      {/* Dynamic tech shapes */}
      <View style={[
        styles.flowTech,
        {
          borderColor: color,
          top: 40 + Math.sin(progress * Math.PI) * 20,
          left: 20 + Math.cos(progress * Math.PI) * 20,
          width: 80 + Math.sin(progress * Math.PI * 2) * 30,
          height: 80 + Math.cos(progress * Math.PI) * 30,
          transform: [
            { rotate: `${45 + progress * 90}deg` },
            { scale: 1 + Math.sin(progress * Math.PI) * 0.2 }
          ]
        }
      ]} />

      <View style={[
        styles.flowTech,
        {
          borderColor: secondaryColor,
          bottom: 40 + Math.cos(progress * Math.PI) * 20,
          right: 20 + Math.sin(progress * Math.PI) * 20,
          width: 80 + Math.cos(progress * Math.PI * 2) * 30,
          height: 80 + Math.sin(progress * Math.PI) * 30,
          transform: [
            { rotate: `${-45 - progress * 90}deg` },
            { scale: 1 + Math.cos(progress * Math.PI) * 0.2 }
          ]
        }
      ]} />

      {/* Floating tech dots */}
      {[...Array(8)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.techDot,
            {
              backgroundColor: i % 2 === 0 ? color + '15' : secondaryColor + '15',
              left: 60 + i * 40 + Math.sin(progress * Math.PI * 2 + i) * 25,
              top: height * 0.3 + Math.cos(progress * Math.PI * 2 + i) * 35,
              width: 8 + Math.sin(progress * Math.PI + i) * 6,
              height: 8 + Math.cos(progress * Math.PI + i) * 6,
              transform: [
                { scale: 0.8 + Math.sin(progress * Math.PI * 2 + i) * 0.3 }
              ]
            }
          ]}
        />
      ))}

      <View style={styles.imageContainer}>
        <Image
          source={image}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textContainer}>
        <View style={[styles.badge, { backgroundColor: color + '15' }]}>
          <MaterialCommunityIcons name="brain" size={16} color={color} />
          <Text style={[styles.badgeText, { color }]}>INTELLIGENCE</Text>
        </View>

        <Text style={styles.title}>
          Powered by{' '}
          <Text style={[styles.titleHighlight, { color }]}>AI</Text>
        </Text>

        <Text style={styles.description}>
          Every feature is enhanced by machine learning to give you an unfair advantage.
        </Text>
      </View>

      <View style={styles.toolsGrid}>
        {tools.map((tool, index) => {
          const IconComponent = tool.IconComponent;
          return (
            <View key={index} style={[styles.toolCard, { borderColor: color + '20' }]}>
              <IconComponent name={tool.icon} size={32} color={color} />
              <Text style={styles.toolName}>{tool.name}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// Step 5: Get Started
function StepGetStarted({ image, color, secondaryColor, progress, isActive }) {
  const stats = [
    { value: "50K+", label: "Creators", icon: "users", IconComponent: Feather },
    { value: "2K+", label: "Brands", icon: "briefcase", IconComponent: Feather },
    { value: "$12M+", label: "Earned", icon: "dollar-sign", IconComponent: Feather },
  ];

  return (
    <View style={styles.stepContent}>
      {/* Dynamic celebration shapes */}
      <View style={[
        styles.flowCeleb,
        {
          backgroundColor: color + '08',
          top: -20 + Math.sin(progress * Math.PI) * 30,
          left: -20 + Math.cos(progress * Math.PI) * 30,
          width: 200 + Math.sin(progress * Math.PI * 2) * 80,
          height: 200 + Math.cos(progress * Math.PI) * 80,
          borderRadius: 100 + Math.sin(progress * Math.PI) * 40,
          transform: [
            { rotate: `${progress * 360}deg` },
            { scale: 1 + Math.sin(progress * Math.PI) * 0.2 }
          ]
        }
      ]} />

      <View style={[
        styles.flowCeleb,
        {
          backgroundColor: secondaryColor + '08',
          bottom: -20 + Math.cos(progress * Math.PI) * 30,
          right: -20 + Math.sin(progress * Math.PI) * 30,
          width: 200 + Math.cos(progress * Math.PI * 2) * 80,
          height: 200 + Math.sin(progress * Math.PI) * 80,
          borderRadius: 100 + Math.cos(progress * Math.PI) * 40,
          transform: [
            { rotate: `${-progress * 360}deg` },
            { scale: 1 + Math.cos(progress * Math.PI) * 0.2 }
          ]
        }
      ]} />

      {/* Professional accent dots */}
      {[...Array(20)].map((_, i) => {
        const xPos = (i % 5) * (width / 4);
        const yPos = Math.floor(i / 5) * (height / 10);
        return (
          <View
            key={i}
            style={[
              styles.celebParticle,
              {
                backgroundColor: color,
                left: xPos + Math.sin(progress * Math.PI + i) * 10,
                top: yPos + Math.cos(progress * Math.PI + i) * 10,
                width: 4,
                height: 4,
                opacity: 0.1,
              }
            ]}
          />
        );
      })}

      <View style={styles.imageContainer}>
        <Image
          source={image}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>
          Ready to{' '}
          <Text style={[styles.titleHighlight, { color }]}>Grow?</Text>
        </Text>

        <Text style={styles.description}>
          Join thousands of brands and creators already leveling up with AI.
        </Text>
      </View>

      <View style={[styles.statsContainer, { borderColor: color + '20' }]}>
        {stats.map((stat, index) => {
          const IconComponent = stat.IconComponent;
          return (
            <View key={index} style={styles.statItem}>
              <View style={[styles.statIconCircle, { backgroundColor: color + '10' }]}>
                <IconComponent name={stat.icon} size={20} color={color} />
              </View>
              <Text style={[styles.statValue, { color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          );
        })}
      </View>
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
  },
  flowingShape: {
    position: "absolute",
  },
  particle: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  tendril: {
    position: "absolute",
  },
  skipButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    right: 24,
    zIndex: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  skipText: {
    color: BLUE,
    fontSize: 14,
    fontWeight: "600",
  },
  stepContainer: {
    width: width,
    flex: 1,
  },
  stepContent: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === "ios" ? 100 : 80,
  },
  flowCorner: {
    position: "absolute",
  },
  bubble: {
    position: "absolute",
    borderRadius: 20,
  },
  flowLine: {
    position: "absolute",
  },
  floatSquare: {
    position: "absolute",
  },
  flowWave: {
    position: "absolute",
  },
  floatCircle: {
    position: "absolute",
    borderRadius: 999,
  },
  flowTech: {
    position: "absolute",
    borderWidth: 2,
    borderRadius: 15,
  },
  techDot: {
    position: "absolute",
    borderRadius: 999,
  },
  flowCeleb: {
    position: "absolute",
  },
  celebParticle: {
    position: "absolute",
    borderRadius: 999,
  },
  imageContainer: {
    height: height * 0.3,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    zIndex: 3,
  },
  image: {
    width: width * 0.9,
    height: "100%",
  },
  textContainer: {
    paddingHorizontal: 32,
    marginBottom: 24,
    zIndex: 3,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    gap: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: BLACK,
    lineHeight: 44,
    marginBottom: 12,
  },
  titleHighlight: {
    color: BLUE,
  },
  description: {
    fontSize: 16,
    color: GRAY,
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 32,
    gap: 12,
    marginBottom: 24,
    zIndex: 3,
  },
  featureChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: '#f8fafc',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 18,
    gap: 10,
    borderWidth: 1,
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: BLACK,
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 32,
    gap: 16,
    marginBottom: 24,
    zIndex: 3,
  },
  toolCard: {
    width: (width - 96) / 2,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
  },
  toolName: {
    fontSize: 14,
    fontWeight: "600",
    color: BLACK,
    textAlign: "center",
    marginTop: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 24,
    marginTop: 20,
    marginHorizontal: 32,
    borderRadius: 24,
    paddingVertical: 24,
    borderWidth: 1,
    backgroundColor: WHITE,
    zIndex: 3,
  },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: GRAY,
    fontWeight: "500",
  },
  bottomNav: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    paddingTop: 16,

    backgroundColor: 'transparent',   // ✅ clean
    borderTopWidth: 0,               // ❌ remove border
    elevation: 0,                    // ❌ remove Android shadow
  },
  nextButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  finalButtons: {
    gap: 12,
  },
  loginButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  loginGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  loginButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'transparent',
    gap: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});