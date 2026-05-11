import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";

const pages = [
  { label: "Landing Page", route: "/landingpage" },
  { label: "Info Slides", route: "/infoslides" },
  { label: "Register", route: "/register" },
  { label: "Login", route: "/login" },
  { label: "Forgot Password", route: "/forgot-password" },
  { label: "Security Setup", route: "/security-setup" },
  { label: "Integritetspolicy", route: "/privacy-info" },
  { label: "Användarvillkor", route: "/terms" },
  { label: "Alarm", route: "/alarm" },
  { label: "Hem (Tab)", route: "/(tabs)/" },
  { label: "Contacts (Tab)", route: "/(tabs)/contacts" },
  { label: "History (Tab)", route: "/(tabs)/history" },
  { label: "Notifications (Tab)", route: "/(tabs)/notifications" },
  { label: "Settings (Tab)", route: "/(tabs)/settings" },
  { label: "Explore (Tab)", route: "/(tabs)/explore" },
];

export default function DevPage() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🛠 Dev — Alla sidor</Text>
      <Text style={styles.subtitle}>Klicka för att navigera</Text>
      {pages.map((page) => (
        <Pressable
          key={page.route}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push(page.route as any)}
        >
          <Text style={styles.cardLabel}>{page.label}</Text>
          <Text style={styles.cardRoute}>{page.route}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f1117",
  },
  content: {
    padding: 24,
    paddingTop: 60,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#1e2130",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2a2d3e",
  },
  cardPressed: {
    backgroundColor: "#2a2d3e",
  },
  cardLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cardRoute: {
    color: "#555",
    fontSize: 12,
    marginTop: 4,
  },
});
