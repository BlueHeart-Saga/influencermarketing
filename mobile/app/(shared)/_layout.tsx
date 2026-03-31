import { Stack } from "expo-router";

export default function SharedLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        swipeEnabled: false,

        headerStyle: {
          backgroundColor: "#0f6eea",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "700",
        },
      }}
    >
      <Stack.Screen name="feed/index" options={{ title: "Feed" }} />
      <Stack.Screen name="discover/index" options={{ title: "Discover" }} />
      <Stack.Screen name="connections/[userId]" options={{ title: "Connections" }} />
      <Stack.Screen name="profile/[userId]" options={{ title: "Profile" }} />
    </Stack>
  );
}