// forgot-password.tsx

import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import SentraScreen from "@/components/SentraScreen";
import SentraLogo from "@/components/SentraLogo";
import SentraInput from "@/components/SentraInput";
import SentraButton from "@/components/SentraButton";
import { router } from "expo-router";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleResetPassword = () => {
    if (!email.trim()) {
      Alert.alert("E-post saknas", "Ange din e-postadress för att fortsätta.");
      return;
    }

    // Auth kopplas in senare
    Alert.alert(
      "Återställningslänk skickad",
      "Om e-postadressen finns registrerad skickas en återställningslänk.",
    );
  };

  return (
    <SentraScreen>
      <View style={styles.content}>
        <SentraLogo size="large" />

        <View style={styles.subtitleWrapper}>
          <Text style={styles.title}>Glömt lösenord?</Text>
          <Text style={styles.subtitle}>
            Ange din e-postadress så skickar vi en länk för att återställa ditt
            lösenord.
          </Text>
        </View>

        <View style={styles.form}>
          <SentraInput
            icon="mail"
            placeholder="E-post"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <SentraButton
          title="Skicka återställningslänk"
          onPress={handleResetPassword}
          style={styles.button}
        />

        <Pressable
          style={styles.backToLoginWrapper}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.backToLoginText}>Tillbaka till inloggning</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Har du inget konto?</Text>

        <Pressable onPress={() => router.push("/register")}>
          <Text style={styles.createAccountText}> Skapa konto</Text>
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
    marginBottom: 6,
  },

  subtitle: {
    color: "#DDEAF0",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },

  subtitleWrapper: {
    width: "78%",
    alignItems: "center",
    marginBottom: 22,
  },

  form: {
    width: "78%",
    marginBottom: 14,
  },

  button: {
    marginTop: 4,
  },

  backToLoginWrapper: {
    marginTop: 14,
    marginBottom: 18,
  },

  backToLoginText: {
    color: "#8FB8C4",
    fontSize: 12,
    fontWeight: "600",
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

  createAccountText: {
    color: "#00D8E6",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    alignSelf: "center",
  },
});
