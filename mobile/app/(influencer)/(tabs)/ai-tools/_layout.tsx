import { Stack } from "expo-router";

export default function AIToolsLayout() {
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
      }}
    >
      {/* ❌ Hide header only here */}
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />

      {/* ✅ باقي pages will use default header */}
      <Stack.Screen name="find-influencer" />
      <Stack.Screen name="content-analyzer" />
      <Stack.Screen name="content-intelligence" />
      <Stack.Screen name="content-creator" />
      <Stack.Screen name="hashtag-ai" />
      <Stack.Screen name="imagecraft-ai" />
      <Stack.Screen name="ai-calculator" />
      <Stack.Screen name="voice-to-text" />
    </Stack>
  );
}