import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState, useCallback } from "react";
import subscriptionAPI, { SubscriptionStatus } from "@/services/subscriptionAPI";

const { width } = Dimensions.get("window");

export default function CustomDrawer(props: any) {
  const { user, logout, subscription: authSubscription } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(authSubscription || null);
  const [loading, setLoading] = useState(false);

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      const status = await subscriptionAPI.getSubscriptionStatus();
      setSubscription(status);
    } catch (error) {
      console.error("Error fetching subscription in Drawer:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // 🔐 LOGOUT FUNCTION
  const handleLogout = async () => {
    try {
      props.navigation.closeDrawer();
      await AsyncStorage.clear();
      logout?.();
      router.replace("/(auth)/login");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  // 🧠 ROLE-BASED MENU
  const getRoleMenu = () => {
    switch (user?.role) {
      case "admin":
        return [
          { title: "Dashboard", icon: "grid", route: "/(admin)/(tabs)/dashboard" },
          { title: "Campaigns", icon: "megaphone", route: "/(admin)/(tabs)/campaigns" },
          { title: "Users", icon: "people", route: "/(admin)/(tabs)/users" },
          { title: "Payments", icon: "card", route: "/(admin)/(tabs)/payments" },
          { title: "Settings", icon: "settings", route: "/(admin)/(tabs)/settings" },
        ];
      case "brand":
        return [
          { title: "Dashboard", icon: "home", route: "/(brand)/(tabs)/dashboard" },
          { title: "Analytics", icon: "stats-chart", route: "/(brand)/(tabs)/account/analytics" },
          { title: "Payments", icon: "card", route: "/(brand)/(tabs)/account/payments" },
          { title: "Notifications", icon: "notifications", route: "/(brand)/notifications" },
          { title: "Subscription", icon: "pricetag", route: "/(brand)/subscription" },
          { title: "Settings", icon: "settings", route: "/(brand)/(tabs)/account/settings" },
        ];
      case "influencer":
      default:
        return [
          { title: "Dashboard", icon: "home", route: "/(influencer)/(tabs)/dashboard" },
          { title: "Campaigns", icon: "megaphone", route: "/(influencer)/(tabs)/campaigns" },
          { title: "Earnings", icon: "cash", route: "/(influencer)/(tabs)/earnings" },
          { title: "Analytics", icon: "stats-chart", route: "/(influencer)/analytics" },
          { title: "Notifications", icon: "notifications", route: "/(influencer)/notifications" },
          { title: "Subscription", icon: "pricetag", route: "/(influencer)/subscription" },
          { title: "Settings", icon: "settings", route: "/(influencer)/settings" },
        ];
    }
  };

  const roleMenu = getRoleMenu();

  const sharedMenu = [
    { title: "Discover", icon: "compass", route: "/discover" },
    { title: "Feed", icon: "newspaper", route: "/(shared)/feed" },
    { title: "Connections", icon: "people", route: "/(shared)/connections/me" },
  ];

  const menuItems = [...roleMenu, ...sharedMenu];

  if (!user) return null;

  // 📊 SUBSCRIPTION DATA
  const planName = subscription?.plan
    ? subscriptionAPI.getPlanDisplayName(subscription.plan, user?.role as any)
    : subscription?.type === 'trial' ? 'Free Trial' : 'Free Plan';

  const progress = subscription ? subscriptionAPI.getPeriodProgress(
    subscription.current_period_start,
    subscription.current_period_end
  ) : 0;

  const daysRemaining = subscription ? subscriptionAPI.getDaysRemaining(subscription.current_period_end) : 0;

  const getPlanConfig = () => {
    const plan = subscription?.plan?.toLowerCase() || "";
    if (plan.includes("pro")) return {
      colors: ["#8B5CF6", "#7C3AED"] as [string, string],
      icon: "diamond-stone"
    };
    if (plan.includes("enterprise")) return {
      colors: ["#F59E0B", "#D97706"] as [string, string],
      icon: "crown"
    };
    if (plan.includes("starter")) return {
      colors: ["#3B82F6", "#1D4ED8"] as [string, string],
      icon: "rocket-launch"
    };
    if (subscription?.type === "trial") return {
      colors: ["#10B981", "#059669"] as [string, string],
      icon: "clock-outline"
    };
    return {
      colors: ["#6B7280", "#4B5563"] as [string, string],
      icon: "star-outline"
    };
  };

  const planConfig = getPlanConfig();

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        {/* 👤 USER HEADER */}
        <LinearGradient
          colors={["#0f6eea", "#0a4eb0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userHeader}
        >
          <View style={styles.userInfoContainer}>
            <View style={styles.avatarWrapper}>
              {user.profile_picture ? (
                <Image source={{ uri: user.profile_picture }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitial}>
                    {(user.name || user.username || "U").charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {subscription?.is_active && (
                <View style={styles.activeBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                </View>
              )}
            </View>
            <View style={styles.userNameContainer}>
              <Text style={styles.userName} numberOfLines={1}>{user.name || user.username}</Text>
              <Text style={styles.userRole}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => { props.navigation.closeDrawer(); router.push(item.route as any); }}
            >
              <View style={styles.menuIconWrapper}>
                <Ionicons name={item.icon as any} size={20} color="#4B5563" />
              </View>
              <Text style={styles.menuText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>

        {/* 💳 SUBSCRIPTION PREMIUM CARD */}
        {user.role !== 'admin' && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => { props.navigation.closeDrawer(); router.push(`/${user.role}/subscription` as any); }}
          >
            <LinearGradient
              colors={planConfig.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.subscriptionCard}
            >
              <View style={styles.subscriptionHeader}>
                <View style={styles.planIconWrapper}>
                  <MaterialCommunityIcons name={planConfig.icon as any} size={20} color="#fff" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.planLabel}>CURRENT PLAN</Text>
                  <Text style={styles.planName}>{planName}</Text>
                </View>
                <View style={styles.goIcon}>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </View>
              </View>

              {subscription?.is_active && (
                <View style={styles.timelineWrapper}>
                  <View style={styles.timelineBar}>
                    <View style={[styles.timelineProgress, { width: `${progress}%` }]} />
                  </View>
                  <View style={styles.timelineLabels}>
                    <Text style={styles.timelineText}>{progress.toFixed(0)}% used</Text>
                    <Text style={styles.timelineText}>{daysRemaining} days left</Text>
                  </View>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </DrawerContentScrollView>

      {/* 🚪 LOGOUT */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarWrapper: {
    position: "relative",
  },

  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },

  avatarPlaceholder: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarInitial: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  activeBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  userNameContainer: {
    marginLeft: 15,
    flex: 1,
  },

  userName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  userRole: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
    marginTop: 2,
  },

  menuContainer: {
    padding: 15,
    marginTop: 10,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 5,
  },

  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  menuText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
    flex: 1,
  },

  subscriptionCard: {
    margin: 15,
    padding: 16,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  subscriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  planIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  planLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  planName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  goIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  timelineWrapper: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },

  timelineBar: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },

  timelineProgress: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 3,
  },

  timelineLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  timelineText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 11,
    fontWeight: "600",
  },

  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 14,
    borderRadius: 12,
    justifyContent: "center",
  },

  logoutText: {
    color: "#EF4444",
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "600",
  },
});
