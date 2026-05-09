import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import SentraScreen from "@/components/SentraScreen";
import SentraLogo from "@/components/SentraLogo";
import SentraButton from "@/components/SentraButton";

export default function BiometricInfo() {
  return (
    <SentraScreen>
      <View style={styles.content}>
        <SentraLogo size="large" />

        {/* Samma typ av rubriksektion som login.tsx */}
        <View style={styles.subtitleWrapper}>
          <Text style={styles.title}>Biometrisk inloggning</Text>
          <Text style={styles.subtitle}>
            Logga in snabbare med din enhets säkra upplåsning.
          </Text>
        </View>

        {/* Textinnehåll i samma bredd som formuläret på login.tsx */}
        <View style={styles.infoBox}>
          <Text style={styles.text}>
            Biometrisk inloggning innebär att du kan använda exempelvis Face ID,
            fingeravtryck eller annan säker upplåsning på din enhet för att
            logga in snabbare.
          </Text>

          <Text style={styles.text}>
            Funktionen är frivillig. Du kan välja att inte aktivera den vid
            registrering och du kan stänga av den senare i appens inställningar.
          </Text>

          <Text style={styles.text}>
            SentraSense sparar inte ditt fingeravtryck eller ansikte. Den
            biometriska kontrollen hanteras av din enhet.
          </Text>
        </View>

        <SentraButton
          title="Tillbaka"
          onPress={() => router.back()}
          style={styles.button}
        />
      </View>

      {/* Footer som matchar login.tsx */}
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
