import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import CustomDrawer from "../../components/CustomDrawer";

export default function AdminLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: "#0f6eea",
        swipeEnabled: true,
        headerStyle: { backgroundColor: "#0f6eea" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" }
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: "Admin Panel",
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark" size={size} color={color} />
          )
        }}
      />
    </Drawer>
  );
}

