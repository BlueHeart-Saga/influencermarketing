import React from "react";
import { View, StyleSheet } from "react-native";
import AdminPaymentsTabs from "@/components/admin/AdminPaymentsTabs";

export default function AdminPaymentsScreen() {
    return (
        <View style={styles.container}>
            <AdminPaymentsTabs />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
});
