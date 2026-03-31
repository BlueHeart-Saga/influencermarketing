import { Stack, useRouter, useSegments, Slot } from "expo-router";
import { View, Text, Pressable, StyleSheet, BackHandler, ActivityIndicator } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import PagerView from "react-native-pager-view";
import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useNotifications } from "@/contexts/NotificationContext";


// 👉 Import your screens
import Dashboard from "./dashboard";
import Campaigns from "./campaigns";
import Chat from "./chat";
import Earnings from "./earnings";
import AITools from "./ai-tools";

export default function InfluencerTabsLayout() {
  const pagerRef = useRef<PagerView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);
  const router = useRouter();
  const navigation = useNavigation();
  const segments = useSegments();
  const { unreadCount } = useNotifications();

  // Define tabs with their routes
  const tabs = [
    { name: "Home", icon: "grid", component: Dashboard, route: "dashboard", index: 0 },
    { name: "Campaigns", icon: "megaphone", component: Campaigns, route: "campaigns", index: 1 },
    { name: "Chat", icon: "chatbubbles", component: Chat, route: "chat", index: 2 },
    { name: "Earnings", icon: "cash", component: Earnings, route: "earnings", index: 3 },
    { name: "AI Tools", icon: "sparkles", component: Slot, route: "ai-tools", index: 4 },
  ];


  const isNestedScreen = segments.length > 3;
  const isAITools = segments.includes("ai-tools");

  // Map routes to tab indices
  const routeToTabIndex: Record<string, number> = {
    "dashboard": 0,
    "campaigns": 1,
    "chat": 2,
    "earnings": 3,
    "ai-tools": 4,
  };

  const [visitedTabs, setVisitedTabs] = useState<number[]>([0]); // Start with Home visited

  // Handle navigation based on the current route
  useEffect(() => {
    const currentRoute = segments.includes("ai-tools")
      ? "ai-tools"
      : segments[segments.length - 1];

    if (routeToTabIndex[currentRoute] !== undefined) {
      const targetIndex = routeToTabIndex[currentRoute];

      if (targetIndex !== activeIndex) {
        setActiveIndex(targetIndex);
        if (!visitedTabs.includes(targetIndex)) {
          setVisitedTabs(prev => [...prev, targetIndex]);
        }
        pagerRef.current?.setPage(targetIndex);
      }
    }
  }, [segments]);

  // 🔄 Handle Hardware Back Button (Android)
  useEffect(() => {
    const onBackPress = () => {
      // 1. If we are in a nested screen, try to go back in the stack
      if (isNestedScreen) {
        if (router.canGoBack()) {
          router.back();
          return true; // Handled
        }
      }

      // 2. If we are on ANY tab except Home, go back to Home first
      if (activeIndex !== 0) {
        handleBackToDashboard();
        return true; // Handled
      }

      // 3. Otherwise, if we are on Home already, let the app close
      return false;
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => backHandlerSubscription.remove();
  }, [activeIndex, isNestedScreen]);


  const handleBackToDashboard = () => {
    setActiveIndex(0);
    if (pagerRef.current) {
      pagerRef.current.setPage(0);
    }
    router.replace("/(influencer)/(tabs)/dashboard");
  };

  const handleTabPress = (index: number) => {
    setActiveIndex(index);
    if (!visitedTabs.includes(index)) {
      setVisitedTabs(prev => [...prev, index]);
    }
    pagerRef.current?.setPage(index);

    if (tabs[index].route === "ai-tools") {
      if (!segments.includes("ai-tools")) {
        router.push("/(influencer)/(tabs)/ai-tools");
      }
    }
  };

  const handlePageSelected = (e: any) => {
    const newIndex = e.nativeEvent.position;
    setActiveIndex(newIndex);
    if (!visitedTabs.includes(newIndex)) {
      setVisitedTabs(prev => [...prev, newIndex]);
    }
  };

  return (
    <>
      {/* 🔥 Stack.Screen for dynamic header */}
      <Stack.Screen
        options={{
          headerShown: !isNestedScreen,
          headerTitle: tabs[activeIndex]?.name || "BRIO",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#0f6eea",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 18,
          },
          headerLeft: () => {
            if (isNestedScreen) {
              // Nested screen - always show back button
              return (
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color="#fff"
                  style={{ marginLeft: 15 }}
                  onPress={() => {
                    if (router.canGoBack()) {
                      router.back();
                    } else {
                      handleBackToDashboard();
                    }
                  }}
                />
              );
            } else if (activeIndex === 0 || activeIndex === 2) {
              // Root of Home or Chat tab - show drawer menu button
              return (
                <Ionicons
                  name="menu"
                  size={24}
                  color="#fff"
                  style={{ marginLeft: 15 }}
                  onPress={() => (navigation as any).toggleDrawer()}
                />
              );
            } else {
              // Root of other tabs - show back-to-home button
              return (
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color="#fff"
                  style={{ marginLeft: 15 }}
                  onPress={handleBackToDashboard}
                />
              );
            }
          },
          headerRight: () => (
            <Pressable
              style={{ marginRight: 15, position: 'relative', padding: 5 }}
              onPress={() => router.push("/(influencer)/notifications")}
            >
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {unreadCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  backgroundColor: '#EF4444',
                  borderRadius: 10,
                  minWidth: 18,
                  height: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: '#0f6eea'
                }}>
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </Pressable>
          ),
        }}
      />

      <View style={{ flex: 1 }}>
        {/* 🔥 SWIPE AREA */}
        <PagerView
          key={forceUpdate}
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={activeIndex}
          onPageSelected={handlePageSelected}
        >
          {tabs.map((tab, index) => {
            const TabComponent = tab.component;
            const isVisible = visitedTabs.includes(index) || activeIndex === index;

            return (
              <View key={index} style={{ flex: 1 }}>
                {isVisible ? (
                  <TabComponent />
                ) : (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                    <ActivityIndicator size="large" color="#0f6eea" />
                  </View>
                )}
              </View>
            );
          })}
        </PagerView>

        {/* 🔻 BOTTOM TAB BAR */}
        <View style={styles.tabBar}>
          {tabs.map((tab, index) => {
            const focused = activeIndex === index;

            // Sample badge counts
            let badgeCount = 0;
            if (tab.route === 'chat') badgeCount = 1;
            if (tab.route === 'campaigns') badgeCount = 2;

            return (
              <Pressable
                key={index}
                style={styles.tabItem}
                onPress={() => handleTabPress(index)}
              >
                <View>
                  <Ionicons
                    name={(focused ? tab.icon : `${tab.icon}-outline`) as any}
                    size={22}
                    color={focused ? "#0f6eea" : "#9ca3af"}
                  />

                  {badgeCount > 0 && (
                    <View style={styles.tabBadge}>
                      <Text style={styles.tabBadgeText}>
                        {badgeCount > 9 ? '9+' : badgeCount}
                      </Text>
                    </View>
                  )}
                </View>

                <Text
                  style={{
                    fontSize: 11,
                    color: focused ? "#0f6eea" : "#9ca3af",
                  }}
                >
                  {tab.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    height: 65,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});