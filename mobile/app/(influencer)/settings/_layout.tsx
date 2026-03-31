import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";

export default function SettingsLayout() {
  const router = useRouter();
  const navigation = useNavigation();

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
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Settings",
          headerLeft: () => (
            <TouchableOpacity onPress={() => (navigation as any).toggleDrawer()} style={{ marginLeft: 15 }}>
              <Ionicons name="menu" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />


      <Stack.Screen
        name="profile"
        options={{
          title: "Profile"
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Profile Settings"
        }}
      />

      <Stack.Screen
        name="bank-account"
        options={{
          title: "Bank Account"
        }}
      />

    </Stack>
  );
}