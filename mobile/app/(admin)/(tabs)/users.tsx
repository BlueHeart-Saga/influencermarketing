import React from "react";
import { View, StyleSheet } from "react-native";
import UserTabs from "@/components/admin/UserTabs";

export default function AdminUsersScreen() {
    return (
        <View style={styles.container}>
            <UserTabs />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
});
