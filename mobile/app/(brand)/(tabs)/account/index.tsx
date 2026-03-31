// app/(brand)/(tabs)/account/index.tsx
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Account() {
  const menuItems = [
    { title: "Profile", icon: "person", route: "profile" },
    { title: "Bank Account", icon: "wallet", route: "bank" },
    { title: "Payments", icon: "card", route: "payments" },
    { title: "Agreements", icon: "document-text", route: "agreements" },
    { title: "Analytics", icon: "bar-chart", route: "analytics" },
    { title: "Settings", icon: "settings", route: "settings" },
    { title: "Connections", icon: "people", route: "connections" },
    { title: "Create Post", icon: "create", route: "create-post" },
  ];

  const handleNavigation = (route: string) => {
    // Use push to navigate to nested screens
    router.push(`/(brand)/(tabs)/account/${route}`);
  };

  return (
    <View style={styles.container}>
      {menuItems.map((item, index) => (
        <Pressable
          key={index}
          onPress={() => handleNavigation(item.route)}
          style={({ pressed }) => [
            styles.card,
            pressed && { opacity: 0.7 },
          ]}
        >
          <View style={styles.leftContent}>
            <Ionicons name={item.icon as any} size={22} color="#0f6eea" />
            <Text style={styles.text}>{item.title}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    justifyContent: "space-between",
    elevation: 3,
  },
  text: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "500",
  },
});