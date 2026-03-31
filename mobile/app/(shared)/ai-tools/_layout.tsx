import { Stack } from "expo-router";

export default function AIToolsLayout() {
  return (
    <Stack
      screenOptions={{
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
      <Stack.Screen
        name="index"
        options={{
          title: "AI Tools",
        }}
      />

      <Stack.Screen name="find-influencer" options={{ title: "Find Influencer" }} />
      <Stack.Screen name="content-analyzer" options={{ title: "Content Analyzer" }} />
      <Stack.Screen name="content-intelligence" options={{ title: "Content Intelligence" }} />

      <Stack.Screen name="content-creator" options={{ title: "AI Content Creator" }} />
      <Stack.Screen name="hashtag-ai" options={{ title: "Hashtag AI" }} />
      <Stack.Screen name="imagecraft-ai" options={{ title: "ImageCraft AI" }} />
      <Stack.Screen name="ai-calculator" options={{ title: "AI Calculator" }} />
      <Stack.Screen name="voice-to-text" options={{ title: "Voice to Text" }} />

    </Stack>
  );
}