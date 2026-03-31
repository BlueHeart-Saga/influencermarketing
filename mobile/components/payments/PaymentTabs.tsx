import React, { useState } from "react";
import {
  useWindowDimensions,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image
} from "react-native";
import { TabView, SceneMap } from "react-native-tab-view";
import { BlurView } from "expo-blur";

// ✅ Professional Brand Configuration
import stripeLogo from "../../assets/images/payments/stripe.png";
import paypalLogo from "../../assets/images/payments/paypal.png";
import inpayLogo from "../../assets/images/payments/razorpay.png";
import quickpayLogo from "../../assets/images/payments/payment.png";

// ✅ Import your real screens
import StripeScreen from "./StripeScreen";
import PaypalScreen from "./PaypalScreen";
import InPayScreen from "./InPayScreen";
import QuickPayScreen from "./QuickPayScreen";

// ✅ Map routes
const renderScene = SceneMap({
  stripe: StripeScreen,
  paypal: PaypalScreen,
  inpay: InPayScreen,
  quickpay: QuickPayScreen,
});

const BRAND_CONFIG = {
  stripe: {
    title: "Stripe",
    logo: stripeLogo,
    color: "#635BFF",
    bg: "rgba(99, 91, 255, 0.12)"
  },
  paypal: {
    title: "PayPal",
    logo: paypalLogo,
    color: "#003087",
    bg: "rgba(0, 48, 135, 0.12)"
  },
  inpay: {
    title: "InPay",
    logo: inpayLogo,
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.12)"
  },
  quickpay: {
    title: "QuickPay",
    logo: quickpayLogo,
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.12)"
  },
};

export default function PaymentTabs() {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "stripe", title: "Stripe" },
    { key: "paypal", title: "PayPal" },
    { key: "inpay", title: "InPay" },
    { key: "quickpay", title: "QuickPay" },
  ]);

  const renderTabBar = (props: any) => {
    const { navigationState, position, jumpTo } = props;

    const HORIZONTAL_MARGIN = 16;
    const barWidth = layout.width - (HORIZONTAL_MARGIN * 2);
    const tabWidth = barWidth / routes.length;

    const translateX = position.interpolate({
      inputRange: routes.map((_, i) => i),
      outputRange: routes.map((_, i) => i * tabWidth + 4),
    });

    const activeColor = BRAND_CONFIG[routes[index].key as keyof typeof BRAND_CONFIG].color;

    return (
      <View style={styles.tabBarWrapper}>
        <View style={styles.floatingContainer}>
          <BlurView intensity={90} tint="light" style={styles.blur}>
            <Animated.View
              style={[
                styles.activeIndicator,
                {
                  width: tabWidth - 8,
                  transform: [{ translateX }],
                  backgroundColor: BRAND_CONFIG[routes[index].key as keyof typeof BRAND_CONFIG].bg,
                  borderColor: activeColor + "30",
                },
              ]}
            />

            <View style={styles.tabsContainer}>
              {navigationState.routes.map((route: any, i: number) => {
                const isFocused = navigationState.index === i;
                const config = BRAND_CONFIG[route.key as keyof typeof BRAND_CONFIG];
                const color = isFocused ? config.color : "#94a3b8";

                return (
                  <TouchableOpacity
                    key={route.key}
                    onPress={() => jumpTo(route.key)}
                    style={styles.tabItem}
                    activeOpacity={0.7}
                  >
                    <View style={styles.tabContent}>
                      <Image
                        source={config.logo}
                        style={[
                          styles.brandLogo,
                          { opacity: isFocused ? 1 : 0.5, tintColor: isFocused ? undefined : "#94a3b8" }
                        ]}
                        resizeMode="contain"
                      />
                      {isFocused && (
                        <Text style={[styles.tabLabel, { color }]}>
                          {config.title}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </BlurView>
        </View>
      </View>
    );
  };


  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        tabBarPosition="top"
        swipeEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  tabBarWrapper: {
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: "transparent",
    zIndex: 10,
  },
  floatingContainer: {
    height: 54,
    marginHorizontal: 16,
    borderRadius: 27,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  blur: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.75)",
  },
  tabsContainer: {
    flexDirection: "row",
    width: "100%",
    height: "100%",
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  activeIndicator: {
    position: "absolute",
    height: 40,
    borderRadius: 20,
    top: 7,
    borderWidth: 1,
  },
  brandLogo: {
    width: 22,
    height: 22,
  },
});
