import React, { useState } from "react";
import {
    useWindowDimensions,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Animated
} from "react-native";
import { TabView, SceneMap } from "react-native-tab-view";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

import PaymentFinderTab from "./PaymentFinderTab";
import AccountHandlesTab from "./AccountHandlesTab";
import AdminTransactionsTab from "./AdminTransactionsTab";

const renderScene = SceneMap({
    finder: PaymentFinderTab,
    handles: AccountHandlesTab,
    payments: AdminTransactionsTab,
});


const SUB_TAB_CONFIG = {
    finder: { title: "Finder", icon: "search-outline", color: "#6366F1" },
    handles: { title: "Handles", icon: "at-outline", color: "#EC4899" },
    payments: { title: "Payments", icon: "cash-outline", color: "#10B981" },
};

export default function AdminPaymentsTabs() {
    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: "finder", title: "Finder" },
        { key: "handles", title: "Handles" },
        { key: "payments", title: "Payments" },
    ]);

    const renderTabBar = (props: any) => {
        const { navigationState, position, jumpTo } = props;
        const barWidth = layout.width - 32;
        const tabWidth = barWidth / routes.length;

        const translateX = position.interpolate({
            inputRange: routes.map((_, i) => i),
            outputRange: routes.map((_, i) => i * tabWidth + 4),
        });

        return (
            <View style={styles.tabBarWrapper}>
                <View style={styles.floatingContainer}>
                    <BlurView intensity={80} tint="light" style={styles.blur}>
                        <Animated.View
                            style={[
                                styles.activeIndicator,
                                {
                                    width: tabWidth - 8,
                                    transform: [{ translateX }],
                                    backgroundColor: "rgba(15, 110, 234, 0.1)",
                                },
                            ]}
                        />
                        <View style={styles.tabsContainer}>
                            {navigationState.routes.map((route: any, i: number) => {
                                const isFocused = navigationState.index === i;
                                const config = SUB_TAB_CONFIG[route.key as keyof typeof SUB_TAB_CONFIG];
                                const color = isFocused ? config.color : "#94a3b8";

                                return (
                                    <TouchableOpacity
                                        key={route.key}
                                        onPress={() => jumpTo(route.key)}
                                        style={styles.tabItem}
                                    >
                                        <View style={styles.tabContent}>
                                            <Ionicons name={config.icon as any} size={20} color={color} />
                                            {isFocused && (
                                                <Text style={[styles.tabLabel, { color }]}>{config.title}</Text>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </BlurView>
                </View>
            </View>
        );
    };

    return (
        <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            renderTabBar={renderTabBar}
            tabBarPosition="top"
        />
    );
}

const styles = StyleSheet.create({
    scene: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
    tabBarWrapper: { paddingTop: 12, paddingBottom: 8 },
    floatingContainer: {
        height: 50,
        marginHorizontal: 16,
        borderRadius: 25,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.8)",
    },
    blur: { flex: 1, flexDirection: "row", alignItems: "center" },
    tabsContainer: { flexDirection: "row", width: "100%", height: "100%", paddingHorizontal: 4 },
    tabItem: { flex: 1, height: "100%", justifyContent: "center", alignItems: "center" },
    tabContent: { flexDirection: "row", alignItems: "center", gap: 6 },
    tabLabel: { fontSize: 13, fontWeight: "700" },
    activeIndicator: { position: "absolute", height: 42, borderRadius: 21, top: 4 },
});
