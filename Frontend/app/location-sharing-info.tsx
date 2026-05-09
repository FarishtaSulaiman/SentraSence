import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import SentraScreen from "@/components/SentraScreen";
import SentraLogo from "@/components/SentraLogo";
import SentraButton from "@/components/SentraButton";

export default function LocationSharingInfo() {
  return (
    <SentraScreen>
      <View style={styles.content}>
        <SentraLogo size="large" />

        <View style={styles.subtitleWrapper}>
          <Text style={styles.title}>Platsdelning vid nödlarm</Text>
          <Text style={styles.subtitle}>
            Dela din position när ett nödlarm aktiveras.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.text}>
            Platsdelning gör det möjligt för appen att dela din position med
            dina valda nödkontakter när ett nödlarm aktiveras.
          </Text>

          <Text style={styles.text}>
            Syftet är att dina kontakter snabbare ska kunna förstå var du
            befinner dig vid en nödsituation.
          </Text>

          <Text style={styles.text}>
            Funktionen används endast i samband med nödlarm. Din plats används
            inte för marknadsföring, statistik eller kontinuerlig spårning.
          </Text>

          <Text style={styles.text}>
            Platsdelning är en viktig del av nödlarmets funktion. Om du inte
            godkänner platsdelning kan vissa trygghetsfunktioner i appen inte
            användas fullt ut.
          </Text>

          <Text style={styles.text}>
            I appens inställningar kan du läsa mer om hur platsdata används och
            se vilka villkor du har godkänt.
          </Text>
        </View>

        <SentraButton
          title="Tillbaka"
          onPress={() => router.back()}
          style={styles.button}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Vill du skapa konto?</Text>

        <Pressable onPress={() => router.push("/register")}>
          <Text style={styles.linkText}> Gå till registrering</Text>
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
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },

  subtitleWrapper: {
    alignItems: "center",
    marginBottom: 22,
  },

  infoBox: {
    width: "78%",
    marginBottom: 8,
  },

  text: {
    color: "#DDEAF0",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 12,
  },

  button: {
    marginTop: 8,
    marginBottom: 18,
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

  linkText: {
    color: "#00D8E6",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    alignSelf: "center",
  },
});
