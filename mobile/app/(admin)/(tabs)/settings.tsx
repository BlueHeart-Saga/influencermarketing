import React from "react";
import { View, StyleSheet } from "react-native";
import PlatformSettingsTabs from "@/components/admin/PlatformSettingsTabs";

export default function AdminSettingsScreen() {
    return (
        <View style={styles.container}>
            <PlatformSettingsTabs />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
});
