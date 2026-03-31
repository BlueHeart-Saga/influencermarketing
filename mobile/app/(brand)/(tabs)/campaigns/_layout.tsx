// import React, { useState } from "react";
// import {
//   View,
//   StyleSheet,
//   useWindowDimensions,
// } from "react-native";
// import { TabView } from "react-native-tab-view";

// import { useScroll } from "@/contexts/ScrollContext";
// import AnimatedTabBar from "@/components/AnimatedTabBar";

// import CampaignsScreen from "./index";
// import CreateScreen from "./create";
// import RequestsScreen from "./requests";

// // ✅ Wrap screens to pass scroll sync if needed
// const CampaignsRoute = () => <CampaignsScreen />;
// const CreateRoute = () => <CreateScreen />;
// const RequestsRoute = () => <RequestsScreen />;

// export default function CampaignTabs() {
//   const layout = useWindowDimensions();
//   const scrollY = useScroll();

//   const [index, setIndex] = useState(0);

//   const routes = [
//     { key: "campaigns", name: "index", label: "Campaigns", icon: "megaphone" },
//     { key: "create", name: "create", label: "Create", icon: "add-circle" },
//     { key: "requests", name: "requests", label: "Requests", icon: "mail" },
//   ];

//   // ✅ Scene renderer (no SceneMap → allows re-render + animations)
//   const renderScene = ({ route }: any) => {
//     switch (route.key) {
//       case "campaigns":
//         return <CampaignsRoute />;
//       case "create":
//         return <CreateRoute />;
//       case "requests":
//         return <RequestsRoute />;
//       default:
//         return null;
//     }
//   };

//   // ✅ Tab change handler
//   const handleTabChange = (newIndex: number) => {
//     setIndex(newIndex);
//   };

//   // ✅ Adapter for your AnimatedTabBar
//   const navigationAdapter = {
//     navigate: (routeName: string) => {
//       const i = routes.findIndex(r => r.name === routeName);
//       if (i !== -1) setIndex(i);
//     },
//   };

//   const stateAdapter = {
//     index,
//     routes: routes.map(r => ({
//       key: r.key,
//       name: r.name,
//       label: r.label,
//       icon: r.icon,
//     })),
//   };

//   return (
//     <View style={styles.container}>
//       {/* 🔥 TabView (Swipe Engine) */}
//       <TabView
//         navigationState={{ index, routes }}
//         renderScene={renderScene}
//         onIndexChange={handleTabChange}
//         initialLayout={{ width: layout.width }}
//         swipeEnabled={true}
//         lazy
//       />

//       {/* 🔥 Your Custom Animated Tab Bar */}
//       <AnimatedTabBar
//         state={stateAdapter}
//         navigation={navigationAdapter}
//         scrollY={scrollY}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F5F7FA",
//   },
// });


import React, { useRef, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useScroll } from "@/contexts/ScrollContext";
import AnimatedTabBar from "@/components/AnimatedTabBar";

import CampaignsScreen from "./index";
import CreateScreen from "./create";
import RequestsScreen from "./requests";

export default function CampaignTabs() {
  const scrollY = useScroll();
  const [activeTab, setActiveTab] = useState(0);

  const pagerRef = useRef<any>(null);

  // ✅ Load PagerView only on native
  const PagerView =
    Platform.OS !== "web"
      ? require("react-native-pager-view").default
      : null;

  const tabs = [
    { name: "index", label: "Campaigns", icon: "megaphone" },
    { name: "create", label: "Create", icon: "add-circle" },
    { name: "requests", label: "Requests", icon: "mail" },
  ];

  const handleTabChange = (index: number) => {
    if (Platform.OS !== "web") {
      pagerRef.current?.setPage(index);
    }
    setActiveTab(index);
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
      badge: tab.name === 'requests' ? 5 : 0, // Mock pending requests count
    })),
  };

  // ✅ Web fallback (NO PagerView)
  const renderWeb = () => {
    switch (activeTab) {
      case 0:
        return <CampaignsScreen />;
      case 1:
        return <CreateScreen />;
      case 2:
        return <RequestsScreen />;
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
            setActiveTab(e.nativeEvent.position)
          }
        >
          <View key="campaigns" style={styles.page}>
            <CampaignsScreen />
          </View>
          <View key="create" style={styles.page}>
            <CreateScreen />
          </View>
          <View key="requests" style={styles.page}>
            <RequestsScreen />
          </View>
        </PagerView>
      ) : (
        <View style={styles.page}>{renderWeb()}</View>
      )}

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
    backgroundColor: '#F5F7FA',
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});