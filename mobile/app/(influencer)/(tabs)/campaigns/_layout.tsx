import React, { useRef, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useScroll } from "@/contexts/ScrollContext";
import AnimatedTabBar from "@/components/AnimatedTabBar";

// 👉 Brand screens
import Available from "./available";
import Applications from "./applications";
import Bookmarks from "./bookmarks";
import Likes from "./likes";

export default function CampaignTabs() {
  const scrollY = useScroll();
  const [activeTab, setActiveTab] = useState(0);
  const [visitedTabs, setVisitedTabs] = useState<number[]>([0]);

  const pagerRef = useRef<any>(null);

  // ✅ Load Pager only for native
  const PagerView =
    Platform.OS !== "web"
      ? require("react-native-pager-view").default
      : null;

  const tabs = [
    { name: "available", label: "Available", icon: "megaphone" },
    { name: "applications", label: "Applications", icon: "mail" },
    { name: "bookmarks", label: "Bookmarks", icon: "bookmark" },
    { name: "likes", label: "Likes", icon: "heart" },
  ];

  const handleTabChange = (index: number) => {
    if (Platform.OS !== "web") {
      pagerRef.current?.setPage(index);
    }
    setActiveTab(index);
    if (!visitedTabs.includes(index)) {
      setVisitedTabs([...visitedTabs, index]);
    }
  };

  const mockNavigation = {
    navigate: (routeName: string) => {
      const index = tabs.findIndex(tab => tab.name === routeName);
      if (index !== -1) handleTabChange(index);
    },
  };

  const mockState = {
    index: activeTab,
    routes: tabs.map(tab => ({
      key: tab.name,
      name: tab.name,
      icon: tab.icon,
      label: tab.label,
      badge: tab.name === 'applications' ? 2 : 0, // Mock pending updates count
    })),
  };

  // 🌐 Web fallback
  const renderWeb = () => {
    switch (activeTab) {
      case 0:
        return <Available />;
      case 1:
        return <Applications />;
      case 2:
        return <Bookmarks />;
      case 3:
        return <Likes />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS !== "web" && PagerView ? (
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={0}
          onPageSelected={(e: any) =>
            handleTabChange(e.nativeEvent.position)
          }
        >
          <View key="available" style={styles.page}>
            {visitedTabs.includes(0) && <Available />}
          </View>

          <View key="applications" style={styles.page}>
            {visitedTabs.includes(1) && <Applications />}
          </View>

          <View key="bookmarks" style={styles.page}>
            {visitedTabs.includes(2) && <Bookmarks />}
          </View>

          <View key="likes" style={styles.page}>
            {visitedTabs.includes(3) && <Likes />}
          </View>
        </PagerView>
      ) : (
        <View style={styles.page}>{renderWeb()}</View>
      )}

      {/* 🔥 SAME Animated Tab Bar */}
      <AnimatedTabBar
        state={mockState}
        navigation={mockNavigation}
        scrollY={scrollY}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});