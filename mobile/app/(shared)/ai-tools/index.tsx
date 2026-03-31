import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function AiTools() {

  const tools = [
    { title: "Find Influencer", icon: "search", route: "./find-influencer", color: "#2563eb" },
    { title: "Content Analyzer", icon: "analytics", route: "./content-analyzer", color: "#10b981" },
    { title: "ImageCraft AI", icon: "image", route: "./imagecraft-ai", color: "#8b5cf6" },
    { title: "Content Intelligence", icon: "bulb", route: "./content-intelligence", color: "#f59e0b" },
    { title: "Hashtag AI", icon: "pricetags", route: "./hashtag-ai", color: "#ec4899" },
    { title: "AI Calculator", icon: "calculator", route: "./ai-calculator", color: "#14b8a6" },
    { title: "Voice to Text", icon: "mic", route: "./voice-to-text", color: "#ef4444" },
  ];

  return (
    <View style={styles.container}>

      {/* HEADER */}
      {/* <Text style={styles.header}>AI Tools</Text> */}

      {/* TOOL LIST */}
      {tools.map((tool, index) => (
        <Pressable
          key={index}
          style={({ pressed }) => [
            styles.card,
            pressed && { opacity: 0.85 }
          ]}
          onPress={() => router.push(tool.route)}
        >
          {/* ICON */}
          <View style={[styles.iconBox, { backgroundColor: tool.color }]}>
            <Ionicons name={tool.icon as any} size={22} color="#fff" />
          </View>

          {/* TEXT */}
          <View style={styles.textBox}>
            <Text style={styles.title}>{tool.title}</Text>
            <Text style={styles.subtitle}>Open tool</Text>
          </View>

          {/* ARROW */}
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />

        </Pressable>
      ))}

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f6f7fb",
    padding: 16,
  },

  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,

    elevation: 2,
    borderWidth: 1,
    borderColor: "#eef2f7",
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  textBox: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },

  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

});