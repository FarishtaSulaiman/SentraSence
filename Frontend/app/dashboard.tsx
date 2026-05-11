import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import SentraScreen from "@/components/SentraScreen";
import SentraLogo from "@/components/SentraLogo";

export default function Dashboard() {
  return (
    <SentraScreen>
      <View style={styles.container}>
        <SentraLogo size="large" />

        <Text style={styles.title}>Dashboard</Text>

        <Text style={styles.subtitle}>Du är inloggad med Google.</Text>

        <Pressable style={styles.button} onPress={() => router.push("/")}>
          <Text style={styles.buttonText}>Till startsidan</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.secondaryButtonText}>Logga ut test</Text>
        </Pressable>
      </View>
    </SentraScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 24,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    marginTop: -80,
    marginBottom: 10,
  },

  subtitle: {
    color: "#DDEAF0",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 28,
  },

  button: {
    backgroundColor: "#00D8E6",
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 28,
    marginBottom: 12,
  },

  buttonText: {
    color: "#102A33",
    fontSize: 14,
    fontWeight: "800",
  },

  secondaryButton: {
    paddingVertical: 10,
  },

  secondaryButtonText: {
    color: "#8FB8C4",
    fontSize: 13,
    fontWeight: "600",
  },
});
