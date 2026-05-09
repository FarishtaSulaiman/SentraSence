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
  const [biometricLogin, setBiometricLogin] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  return (
    <SentraScreen>
      <View style={styles.content}>
        <SentraLogo size="large" />

        <View style={styles.subtitleWrapper}>
          <Text style={styles.title}>Skapa konto</Text>
          <Text style={styles.subtitle}>
            Börja använda trygghetsfunktionerna direkt.
          </Text>
        </View>

        <View style={styles.form}>
          <SentraInput
            icon="person"
            placeholder="Förnamn"
            autoCapitalize="words"
          />

          <SentraInput
            icon="person"
            placeholder="Efternamn"
            autoCapitalize="words"
            style={styles.inputSpacing}
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

        <View style={styles.checkboxWrapper}>
          <SentraCheckbox
            label="Aktivera biometrisk inloggning"
            checked={biometricLogin}
            onToggle={() => setBiometricLogin(!biometricLogin)}
          />

          <SentraCheckbox
            label="Tillåt platsdelning vid nödlarm"
            checked={acceptedTerms}
            onToggle={() => setAcceptedTerms(!acceptedTerms)}
          />
        </View>

        <SentraButton title="Skapa konto" onPress={() => router.push("/")} />
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

  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },

  subtitle: {
    color: "#DDEAF0",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },

  subtitleWrapper: {
    alignItems: "center",
    marginBottom: 18,
  },

  form: {
    width: "78%",
  },

  inputSpacing: {
    marginTop: 10,
  },

  checkboxWrapper: {
    width: "78%",
    marginTop: 10,
    marginBottom: 14,
    gap: 6,
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
