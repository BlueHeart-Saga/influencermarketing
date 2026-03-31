import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import Animated, { FadeOut, FadeIn } from "react-native-reanimated";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { ScrollProvider } from "@/contexts/ScrollContext";
import LogoIntro from "./logo-intro";

// ---------------- NAVIGATION LOGIC ----------------
function RootLayoutNav() {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isInitializing) return;

    const segment = segments[0];

    const routeMap: Record<string, string> = {
      admin: "/(admin)/(tabs)/dashboard",
      brand: "/(brand)/(tabs)/dashboard",
      influencer: "/(influencer)/(tabs)/dashboard",
    };


    const inAuthGroup = segment === "(auth)";
    const inProtectedGroup = segment === "(admin)" || segment === "(brand)" || segment === "(influencer)";
    const isSharedRoute = segment === "(shared)";

    // =========================
    // 🚫 NOT AUTHENTICATED
    // =========================
    if (!isAuthenticated) {
      if (inAuthGroup) return;

      if (inProtectedGroup) {
        router.replace("/(auth)/login");
        return;
      }
      return;
    }

    // =========================
    // ✅ AUTHENTICATED
    // =========================
    const targetRoute = routeMap[user.role];
    if (segment === `(${user.role})`) return;
    if (isSharedRoute) return;

    if (targetRoute) {
      router.replace(targetRoute as any);
    }
  }, [isAuthenticated, isInitializing, user, segments]);

  // =========================
  // ⏳ LOADING STATE
  // =========================
  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0f6eea" />
      </View>
    );
  }

  // =========================
  // 📦 ROUTES
  // =========================
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="platformdetails" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(brand)" />
      <Stack.Screen name="(influencer)" />
    </Stack>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ScrollProvider>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </ScrollProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

// ---------------- ROOT ----------------
export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleFinish = () => {
    setIsExiting(true);
    // Small delay to let exit animation complete
    setTimeout(() => {
      setShowSplash(false);
    }, 500);
  };

  return (
    <AppProviders>
      {showSplash ? (
        <Animated.View
          style={{ flex: 1 }}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(500)}
        >
          <LogoIntro onFinish={handleFinish} />
        </Animated.View>
      ) : (
        <RootLayoutNav />
      )}
    </AppProviders>
  );
}