import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import SentraScreen from "@/components/SentraScreen";
import SentraLogo from "@/components/SentraLogo";
import SentraButton from "@/components/SentraButton";

export default function LandingPage() {
  return (
    <SentraScreen>
      <View style={styles.content}>
        <View style={styles.logoWrapper}>
          <SentraLogo size="large" />
        </View>

        <Text style={styles.title}>Din trygghetsapp vid nödsituationer</Text>

        <Text style={styles.subtitle}>
          Snabb, säker och AI-driven hjälp när du behöver det som mest.
        </Text>

        <SentraButton
          title="Kom igång"
          onPress={() => router.push("/infoslides")}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Har du redan ett konto? </Text>

        <Pressable onPress={() => router.push("/login")}>
          <Text style={styles.loginText}>Logga in</Text>
        </Pressable>
      </View>
    </SentraScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    alignItems: "center",
  },

  logoWrapper: {
    marginBottom: -95,
    alignItems: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
    alignSelf: "stretch",
  },

  subtitle: {
    color: "#DDEAF0",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 12,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  footerText: {
    color: "#AAB8C0",
    fontSize: 12,
    textAlign: "center",
    alignSelf: "center",
  },

  loginText: {
    color: "#00D8E6",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    alignSelf: "center",
  },
});
