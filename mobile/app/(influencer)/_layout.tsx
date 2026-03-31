import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import CustomDrawer from "../../components/CustomDrawer";

export default function InfluencerLayout() {

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawer {...props} />}

      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: "#0f6eea",
        swipeEnabled: true,

        // 🔵 Header Style
        headerStyle: {
          backgroundColor: "#0f6eea",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
        headerTitleAlign: "center",

        // 🍔 Menu Button
        headerLeft: ({ tintColor }) => {
          const navigation = useNavigation();
          return (
            <Ionicons
              name="menu"
              size={24}
              color={tintColor}
              style={{ marginLeft: 15 }}
              onPress={() => navigation.toggleDrawer()}
            />
          );
        },
      }}
    >

      {/* 🏠 Tabs */}
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: "BRIO",
          headerShown: false, // tabs manage header
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* ⚙️ Settings */}
      <Drawer.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />

      {/* 📢 Campaigns */}
      <Drawer.Screen
        name="campaigns"
        options={{
          title: "Campaigns",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="megaphone" size={size} color={color} />
          ),
        }}
      />

      {/* 📊 Analytics */}
      <Drawer.Screen
        name="analytics"
        options={{
          title: "Analytics",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />

    </Drawer>
  );
}