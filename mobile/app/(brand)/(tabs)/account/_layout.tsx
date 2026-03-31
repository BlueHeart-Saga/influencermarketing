import { Stack, useRouter } from "expo-router";
import { Pressable, TouchableOpacity } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

function LogoutButton() {
  const { logout } = useAuth();

  return (
    <Pressable onPress={logout} style={{ marginRight: 12 }}>
      <Ionicons name="log-out-outline" size={22} color="#fff" />
    </Pressable>
  );
}

export default function AccountLayout() {
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
          router.replace("/(brand)/(tabs)/account");
        }
      }}
    >
      <Ionicons name="chevron-back" size={22} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerShown: true,
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
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, // Hidden because BrandTabsLayout shows the header for Tab 4
        }}
      />

      <Stack.Screen
        name="profile"
        options={{ title: "Profile" }}
      />

      <Stack.Screen
        name="bank"
        options={{ title: "Bank Account" }}
      />

      <Stack.Screen
        name="payments"
        options={{ title: "Payments" }}
      />

      <Stack.Screen
        name="agreements"
        options={{ title: "Agreements" }}
      />

      <Stack.Screen
        name="analytics"
        options={{ title: "Analytics" }}
      />

      <Stack.Screen
        name="settings"
        options={{ title: "Settings" }}
      />

      <Stack.Screen
        name="connections"
        options={{ title: "Connections" }}
      />

      <Stack.Screen
        name="create-post"
        options={{ title: "Create Post" }}
      />
    </Stack>
  );
}