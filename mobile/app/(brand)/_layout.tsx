// app/(brand)/_layout.tsx
import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import CustomDrawer from "../../components/CustomDrawer";

export default function BrandDrawerLayout() {
  return (
    <Drawer drawerContent={(props) => <CustomDrawer {...props} />} screenOptions={{ headerShown: true, drawerActiveTintColor: "#0f6eea", swipeEnabled: true, headerStyle: { backgroundColor: "#0f6eea" }, headerTintColor: "#fff", headerTitleStyle: { fontWeight: "700" }, headerTitleAlign: "center" }}>
      <Drawer.Screen name="(tabs)" options={{ title: "BRIO", headerShown: false, drawerIcon: ({ color, size }) => (<Ionicons name="home" size={size} color={color} />) }} />
      <Drawer.Screen name="notifications" options={{ title: "Notifications", headerShown: true, headerStyle: { backgroundColor: "#0f6eea" }, headerTintColor: "#fff", headerTitleStyle: { fontWeight: "700", fontSize: 18 }, headerTitleAlign: "center" }} />
    </Drawer>
  );
}