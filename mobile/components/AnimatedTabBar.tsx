// C:\Sagadevan\quickbox\mobile\components\AnimatedTabBar.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,  // 👈 Add Text import here
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

export default function AnimatedTabBar({ state, navigation, scrollY }) {
  const [collapsed, setCollapsed] = useState(false);

  const width = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Auto collapse on scroll
  useEffect(() => {
    if (!scrollY) return;

    const listener = scrollY.addListener(({ value }) => {
      if (value > 80 && !collapsed) {
        collapse();
      } else if (value < 20 && collapsed) {
        expand();
      }
    });

    return () => scrollY.removeListener(listener);
  }, [scrollY, collapsed]);

  const collapse = () => {
    setCollapsed(true);

    Animated.parallel([
      Animated.timing(width, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(translateX, {
        toValue: 145, // Move closer to the right screen edge
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const expand = () => {
    setCollapsed(false);

    Animated.parallel([
      Animated.timing(width, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(translateX, {
        toValue: 0, // Move back to center
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Get the current active icon to show in ball state
  const getActiveIcon = () => {
    const activeRoute = state.routes[state.index];
    return activeRoute?.icon || "apps";
  };





  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: translateX }],
          width: width.interpolate({
            inputRange: [0, 1],
            outputRange: [60, 320], // Ball width (60px) → Full width (320px)
          }),
        },
      ]}
    >
      <BlurView intensity={80} tint="light" style={styles.blur}>
        {collapsed ? (
          /* 🟢 BALL MODE - shows active icon */
          <TouchableOpacity onPress={expand} style={styles.ball} activeOpacity={0.8}>
            <View>
              <Ionicons name={getActiveIcon()} size={26} color="#0f6eea" />
              {/* Check if active route has a badge */}
              {state.routes[state.index].badge > 0 && (
                <View style={styles.ballBadge}>
                  <Text style={styles.badgeText}>
                    {state.routes[state.index].badge > 9 ? '9+' : state.routes[state.index].badge}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ) : (
          /* 📱 FULL TABS MODE */
          <Animated.View style={[styles.row, { opacity }]}>
            {state.routes.map((route, index) => {
              const isFocused = state.index === index;

              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={() => navigation.navigate(route.name)}
                  style={[
                    styles.tabItem,
                    isFocused && styles.activeTab,
                  ]}
                  activeOpacity={0.7}
                >
                  <View>
                    <Ionicons
                      name={
                        state.index === index
                          ? route.icon
                          : `${route.icon}-outline`
                      }
                      size={22}
                      color={state.index === index ? "#0f6eea" : "#888"}
                    />

                    {/* Render Badge if count > 0 */}
                    {route.badge > 0 && (
                      <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>
                          {route.badge > 9 ? '9+' : route.badge}
                        </Text>
                      </View>
                    )}
                  </View>

                  {isFocused && (
                    <Text
                      style={[
                        styles.tabLabel,
                        { color: "#0f6eea" }
                      ]}
                    >
                      {route.label}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        )}
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    // Shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  blur: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 8,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  activeTab: {
    backgroundColor: "rgba(15,110,234,0.1)",
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  ball: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    // Shadow for the ball
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  ballBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});