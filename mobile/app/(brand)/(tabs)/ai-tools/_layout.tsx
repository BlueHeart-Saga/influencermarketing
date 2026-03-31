import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AIToolsLayout() {
  const router = useRouter();

  const renderBrandedBackButton = () => (
    <TouchableOpacity
      style={{
        marginLeft: 10,
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(brand)/(tabs)/ai-tools");
        }
      }}
    >
      <Ionicons name="chevron-back" size={22} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerShown: true, // default for all screens
        headerStyle: {
          backgroundColor: "#0f6eea",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
        headerTitleAlign: "center",
        headerLeft: renderBrandedBackButton,
      }}
    >
      {/* ❌ Hide header only here */}
      <Stack.Screen
        name="index"
        options={{ title: "AI Tools", headerShown: false }}
      />

      {/* ✅ باقي screens will use descriptive titles */}
      <Stack.Screen name="find-influencer" options={{ title: "Find Influencer" }} />
      <Stack.Screen name="hashtag-ai" options={{ title: "Hashtag AI" }} />
      <Stack.Screen name="content-analyzer" options={{ title: "Content Analyzer" }} />
      <Stack.Screen name="content-intelligence" options={{ title: "Content Intelligence" }} />
      <Stack.Screen name="content-creator" options={{ title: "Content Creator" }} />
      <Stack.Screen name="imagecraft-ai" options={{ title: "ImageCraft AI" }} />
      <Stack.Screen name="ai-calculator" options={{ title: "AI Calculator" }} />
      <Stack.Screen name="voice-to-text" options={{ title: "Voice to Text" }} />
    </Stack>
  );
}