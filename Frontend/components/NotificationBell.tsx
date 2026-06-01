import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export function NotificationBell({ unreadCount }: { unreadCount: number }) {
  return (
    <Pressable
      style={styles.bellBtn}
      onPress={() => router.push("/(tabs)/notifications" as any)}
    >
      <Ionicons name="notifications-outline" size={22} color="#8FB8C4" />
      {unreadCount > 0 ? (
        <View style={styles.bellBadge}>
          <Text style={styles.bellBadgeText}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bellBtn: {
    padding: 4,
    position: "relative",
  },
  bellBadge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: "#E63946",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#08141D",
  },
  bellBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
});
