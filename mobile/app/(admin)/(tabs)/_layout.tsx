import { Stack, useRouter, useSegments, Slot, useNavigation } from "expo-router";

import { View, Text, Pressable, StyleSheet, BackHandler, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PagerView from "react-native-pager-view";
import { useRef, useState, useEffect } from "react";
import { DrawerNavigationProp } from "@react-navigation/drawer";

import Dashboard from "./dashboard";
import Campaigns from "./campaigns";
import Users from "./users";
import Payments from "./payments";
import Settings from "./settings";

export default function AdminTabsLayout() {
    const pagerRef = useRef<PagerView>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const router = useRouter();
    const segments = useSegments();
    const navigation = useNavigation<DrawerNavigationProp<any>>();

    const tabs = [
        { name: "Dashboard", icon: "grid", route: "dashboard", component: Dashboard },
        { name: "Campaigns", icon: "megaphone", route: "campaigns", component: Campaigns },
        { name: "Users", icon: "people", route: "users", component: Users },
        { name: "Payments", icon: "card", route: "payments", component: Payments },
        { name: "Settings", icon: "settings", route: "settings", component: Settings },
    ];

    const [visitedTabs, setVisitedTabs] = useState<number[]>([0]);
    const isNestedScreen = segments.length > 3;

    const routeToTabIndex: Record<string, number> = {
        "dashboard": 0, "campaigns": 1, "users": 2, "payments": 3, "settings": 4,
    };

    useEffect(() => {
        if (isNestedScreen) return;
        const currentRoute = segments[segments.length - 1];
        const targetIndex = routeToTabIndex[currentRoute];
        if (targetIndex !== undefined && targetIndex !== activeIndex) {
            setActiveIndex(targetIndex);
            if (!visitedTabs.includes(targetIndex)) setVisitedTabs(prev => [...prev, targetIndex]);

            const timer = setTimeout(() => {
                pagerRef.current?.setPage(targetIndex);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [segments]);

    const handleBackToDashboard = () => {
        if (activeIndex === 0) return;
        setActiveIndex(0);
        pagerRef.current?.setPage(0);
        router.replace("/(admin)/(tabs)/dashboard");
    };

    useEffect(() => {
        const onBackPress = () => {
            if (isNestedScreen) {
                if (router.canGoBack()) {
                    router.back();
                    return true;
                }
            }
            if (activeIndex !== 0) {
                handleBackToDashboard();
                return true;
            }
            return false;
        };
        const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
        return () => sub.remove();
    }, [activeIndex, isNestedScreen]);

    const handleTabPress = (index: number) => {
        if (index === activeIndex) return;
        setActiveIndex(index);
        if (!visitedTabs.includes(index)) setVisitedTabs(prev => [...prev, index]);
        pagerRef.current?.setPage(index);
        router.replace(`/(admin)/(tabs)/${tabs[index].route}`);
    };

    const handlePageSelected = (e: any) => {
        if (isNestedScreen) return;
        const newIndex = e.nativeEvent.position;
        if (newIndex === activeIndex) return;

        const targetRoute = tabs[newIndex].route;
        const currentRoute = segments[segments.length - 1];

        if (currentRoute !== targetRoute) {
            setActiveIndex(newIndex);
            if (!visitedTabs.includes(newIndex)) setVisitedTabs(prev => [...prev, newIndex]);
            router.replace(`/(admin)/(tabs)/${targetRoute}`);
        }
    };

    const HeaderTitle = () => {
        return (
            <View style={{ marginLeft: 10 }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>
                    {tabs[activeIndex].name.toUpperCase()}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '500', marginTop: -2 }}>
                    ADMIN MANAGEMENT
                </Text>
            </View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen
                options={{
                    headerShown: !isNestedScreen,
                    headerTitle: HeaderTitle,
                    headerStyle: { backgroundColor: "#0f6eea" },
                    headerTintColor: "#fff",
                    headerLeft: () => {
                        if (isNestedScreen) {
                            return (
                                <Ionicons
                                    name="arrow-back"
                                    size={24}
                                    color="#fff"
                                    style={{ marginLeft: 15 }}
                                    onPress={() => router.canGoBack() ? router.back() : handleBackToDashboard()}
                                />
                            );
                        }
                        return (
                            <Ionicons
                                name="menu"
                                size={24}
                                color="#fff"
                                style={{ marginLeft: 15 }}
                                onPress={() => (navigation as any).toggleDrawer()}
                            />
                        );
                    }
                }}
            />

            {!isNestedScreen ? (
                <PagerView
                    ref={pagerRef}
                    style={{ flex: 1 }}
                    initialPage={0}
                    onPageSelected={handlePageSelected}
                >
                    {tabs.map((tab, idx) => (
                        <View key={tab.route} style={{ flex: 1 }}>
                            {visitedTabs.includes(idx) ? <tab.component /> : null}
                        </View>
                    ))}
                </PagerView>
            ) : (
                <Slot />
            )}

            {!isNestedScreen && (
                <View style={styles.tabBar}>
                    {tabs.map((tab, idx) => {
                        const focused = activeIndex === idx;
                        return (
                            <Pressable key={tab.route} style={styles.tabItem} onPress={() => handleTabPress(idx)}>
                                <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                                    <Ionicons
                                        name={(focused ? tab.icon : `${tab.icon}-outline`) as any}
                                        size={22}
                                        color={focused ? "#0f6eea" : "#9ca3af"}
                                    />
                                </View>
                                <Text style={[styles.tabLabel, { color: focused ? "#0f6eea" : "#9ca3af" }]}>
                                    {tab.name}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: "row",
        height: 70,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
        paddingBottom: Platform.OS === 'ios' ? 20 : 0
    },
    tabItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    iconContainer: {
        padding: 4,
        borderRadius: 8,
    },
    activeIconContainer: {
        backgroundColor: "#f0f7ff",
    },
    tabLabel: {
        fontSize: 10,
        marginTop: 2,
        fontWeight: "600"
    },
});

