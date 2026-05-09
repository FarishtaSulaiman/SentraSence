// register.tsx

import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import SentraScreen from "@/components/SentraScreen";
import SentraLogo from "@/components/SentraLogo";
import SentraInput from "@/components/SentraInput";
import SentraButton from "@/components/SentraButton";
import SentraCheckbox from "@/components/SentraCheckbox";
import { router } from "expo-router";

export default function Register() {
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  return (
    <SentraScreen>
      <View style={styles.content}>
        <SentraLogo size="large" />

        <View style={styles.subtitleWrapper}>
          <Text style={styles.subtitle}>Skapa ditt konto</Text>
          <Text style={styles.subtitle}>
            Registrera dig för att komma igång.
          </Text>
        </View>

        <View style={styles.form}>
          <SentraInput
            icon="person"
            placeholder="Namn"
            autoCapitalize="words"
          />

          <SentraInput
            icon="mail"
            placeholder="E-post"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.inputSpacing}
          />

          <SentraInput
            icon="lock-closed"
            placeholder="Lösenord"
            secureTextEntry
            style={styles.inputSpacing}
          />

          <SentraInput
            icon="lock-closed"
            placeholder="Bekräfta lösenord"
            secureTextEntry
            style={styles.inputSpacing}
          />
        </View>

        <SentraCheckbox
          label="Jag godkänner villkoren"
          checked={acceptedTerms}
          onToggle={() => setAcceptedTerms(!acceptedTerms)}
        />

        <SentraButton title="Skapa konto" onPress={() => router.push("/")} />

        <Pressable style={styles.googleButton}>
          <Text style={styles.googleButtonText}>Registrera med Google</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Har du redan ett konto?</Text>

        <Pressable onPress={() => router.push("/login")}>
          <Text style={styles.loginText}> Logga in</Text>
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

  subtitle: {
    color: "#DDEAF0",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },

  subtitleWrapper: {
    alignItems: "center",
    marginBottom: 22,
  },

  form: {
    width: "78%",
  },

  inputSpacing: {
    marginTop: 10,
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

  googleButton: {
    width: "78%",
    height: 46,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    marginBottom: 18,
  },

  googleButtonText: {
    color: "#1F2A33",
    fontSize: 14,
    fontWeight: "700",
  },
});
