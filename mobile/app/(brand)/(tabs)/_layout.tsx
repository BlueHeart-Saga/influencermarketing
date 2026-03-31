import { Stack, useRouter, useSegments, Slot } from "expo-router";
import { View, Text, Pressable, StyleSheet, BackHandler, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PagerView from "react-native-pager-view";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { brandNotificationAPI } from "../../../services/brandNotificationAPI";

import Dashboard from "./dashboard";
import Campaigns from "./campaigns/_layout";
import Chat from "./chat";
import AITools from "./ai-tools/index";
import Account from "./account/index";

export default function BrandTabsLayout() {
  const router = useRouter();
  const navigation = useNavigation();
  const segments = useSegments();
  const { unreadCount } = useNotifications();

  const routeToTabIndex: Record<string, number> = {
    "dashboard": 0, "campaigns": 1, "chat": 2, "ai-tools": 3, "account": 4,
  };

  // Derive initial state from current segments to avoid state-flip loops on mount
  const getInitialIndex = () => {
    const tabRoutes = ["dashboard", "campaigns", "chat", "ai-tools", "account"];
    const currentTab = segments.find(s => tabRoutes.includes(s)) || "dashboard";
    return routeToTabIndex[currentTab] ?? 0;
  };

  const initialIdx = getInitialIndex();
  const [activeIndex, setActiveIndex] = useState(initialIdx);
  const [visitedTabs, setVisitedTabs] = useState<number[]>(() => {
    const initial = [0];
    if (initialIdx !== 0 && initialIdx !== undefined) initial.push(initialIdx);
    return initial;
  });
  const [forceUpdate, setForceUpdate] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const tabs = [
    { name: "Home", icon: "grid", component: Dashboard, route: "dashboard", index: 0 },
    { name: "Campaigns", icon: "megaphone", component: Campaigns, route: "campaigns", index: 1 },
    { name: "Chat", icon: "chatbubbles", component: Chat, route: "chat", index: 2 },
    { name: "AI Tools", icon: "sparkles", component: AITools, route: "ai-tools", index: 3 },
    { name: "Account", icon: "person", component: Account, route: "account", index: 4 },
  ];

  const isNestedScreen = segments.length > 3;
  const shouldShowTabBar = !isNestedScreen;

  useEffect(() => {
    const currentRoute = segments.includes("ai-tools")
      ? "ai-tools"
      : (segments.includes("account") ? "account" : (segments[segments.length - 1] as string));

    if (currentRoute && routeToTabIndex[currentRoute] !== undefined) {
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

  useEffect(() => {
    const timer = setTimeout(() => {
      const toLoad = [1, 2, 3, 4].filter(i => !visitedTabs.includes(i));
      if (toLoad.length > 0) {
        setVisitedTabs(prev => [...prev, ...toLoad]);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      if (isNestedScreen) { if (router.canGoBack()) { router.back(); return true; } }
      if (activeIndex !== 0) { handleBackToDashboard(); return true; }
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [activeIndex, isNestedScreen]);

  const handleBackToDashboard = () => {
    if (activeIndex === 0) return;
    setActiveIndex(0);
    pagerRef.current?.setPage(0);
    router.replace("/(brand)/(tabs)/dashboard");
  };

  const handleTabPress = (index: number) => {
    setActiveIndex(index);
    if (!visitedTabs.includes(index)) {
      setVisitedTabs(prev => [...prev, index]);
    }
    pagerRef.current?.setPage(index);

    if (tabs[index].route === "ai-tools" || tabs[index].route === "account") {
      if (!segments.includes(tabs[index].route)) {
        router.push(`/(brand)/(tabs)/${tabs[index].route}`);
      }
    } else {
      router.replace(`/(brand)/(tabs)/${tabs[index].route}`);
    }
  };

  const handlePageSelected = (e: any) => {
    const newIndex = e.nativeEvent.position;
    setActiveIndex(newIndex);
    if (!visitedTabs.includes(newIndex)) {
      setVisitedTabs(prev => [...prev, newIndex]);
    }
  };

  // Memoize headerContent as an element directly
  const headerContent = useMemo(() => {
    if (isNestedScreen) return <Text> </Text>;
    if (tabs[activeIndex]?.route === 'dashboard') {
      return (
        <View style={{ alignItems: 'center', paddingVertical: 5 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={{ color: '#fff', fontSize: 19, fontWeight: '800', letterSpacing: 1.2 }}>BRIO</Text>
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 9, fontWeight: '500', letterSpacing: 0.5, marginTop: -2 }}>PROFESSIONAL DASHBOARD</Text>
        </View>
      );
    }
    return <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>{tabs[activeIndex]?.name || "BRIO"}</Text>;
  }, [activeIndex, isNestedScreen]);

  const { logout } = useAuth();

  const navigationOptions = useMemo(() => ({
    headerShown: !isNestedScreen,
    headerTitle: () => headerContent,
    headerTitleAlign: "center" as const,
    headerStyle: { backgroundColor: "#0f6eea" },
    headerShadowVisible: true,
    headerTintColor: "#fff",
    headerTitleStyle: { fontWeight: "700" as const, fontSize: 18 },
    headerLeft: () => {
      // In nested screens, we don't show the root layout's header items
      if (isNestedScreen) return null;

      // For all top-level tabs, show the menu drawer toggle
      return (
        <TouchableOpacity
          style={{ marginLeft: 15, padding: 5 }}
          onPress={() => (navigation as any).toggleDrawer()}
        >
          <Ionicons name="menu" size={26} color="#fff" />
        </TouchableOpacity>
      );
    },
    headerRight: () => (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {activeIndex === 4 && (
          <TouchableOpacity onPress={logout} style={{ marginRight: 15 }}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        <Pressable style={{ marginRight: 15, position: 'relative', padding: 5 }} onPress={() => router.push("/(brand)/notifications")}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          {unreadCount > 0 ? (
            <View style={{ position: 'absolute', top: 2, right: 2, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0f6eea' }}>
              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{unreadCount > 99 ? '99+' : String(unreadCount)}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    ),
  }), [isNestedScreen, headerContent, activeIndex, unreadCount, logout, router, navigation]);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={navigationOptions} />
      {!isNestedScreen ? (
        <PagerView
          key={shouldShowTabBar ? "tabs-active" : "tabs-inactive"} // Force re-mount transition
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={activeIndex}
          onPageSelected={handlePageSelected}
        >
          {tabs.map((tab, idx) => (
            <View key={tab.route} style={{ flex: 1 }}>
              {visitedTabs.includes(idx) ? <tab.component /> : <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator size="large" color="#0f6eea" /></View>}
            </View>
          ))}
        </PagerView>
      ) : (
        <Slot />
      )}
      {shouldShowTabBar && (
        <View style={styles.tabBar}>
          {tabs.map((tab, idx) => {
            const focused = activeIndex === idx;
            const badge = tab.route === 'chat' ? 3 : (tab.route === 'campaigns' ? 5 : 0);
            return (
              <Pressable key={tab.route} style={styles.tabItem} onPress={() => handleTabPress(idx)}>
                <View>
                  <Ionicons name={(focused ? tab.icon : `${tab.icon}-outline`) as any} size={22} color={focused ? "#0f6eea" : "#9ca3af"} />
                  {badge > 0 ? (
                    <View style={styles.tabBadge}>
                      <Text style={styles.tabBadgeText}>{badge > 9 ? '9+' : String(badge)}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={{ fontSize: 11, color: focused ? "#0f6eea" : "#9ca3af" }}>{tab.name}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: "row", height: 65, borderTopWidth: 0.5, borderTopColor: "#e5e7eb", backgroundColor: "#fff" },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  tabBadge: { position: 'absolute', top: -4, right: -10, backgroundColor: '#FF3B30', borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: '#FFFFFF' },
  tabBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
});