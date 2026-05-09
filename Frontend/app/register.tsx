import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import SentraScreen from "@/components/SentraScreen";
import SentraLogo from "@/components/SentraLogo";
import SentraInput from "@/components/SentraInput";
import SentraButton from "@/components/SentraButton";
import SentraCheckbox from "@/components/SentraCheckbox";
import SentraInfoButton from "@/components/SentraInfoButton";
import { router } from "expo-router";

export default function Register() {
  const [biometricLogin, setBiometricLogin] = useState(false);
  const [acceptedUserTerms, setAcceptedUserTerms] = useState(false);
  const [locationSharingAccepted, setLocationSharingAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

const handleCreateAccount = () => {
  setErrorMessage("");

  if (!acceptedUserTerms) {
    setErrorMessage(
      "Du behöver godkänna användarvillkor och integritetspolicy för att skapa konto.",
    );
    return;
  }

  if (!locationSharingAccepted) {
    setErrorMessage(
      "Du behöver godkänna att din plats kan delas med dina nödkontakter när ett nödlarm aktiveras.",
    );
    return;
  }

  Alert.alert("Konto skapat", "Ditt konto har skapats. Du kan nu logga in.");

  // Registreringslogiken kopplas in senare
  router.push("/login");
};

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

          <View style={styles.checkboxWrapper}>
            {/* NYTT: Godkänn användarvillkor + integritetspolicy */}
            <View style={styles.checkboxRow}>
              <View style={styles.checkboxContent}>
                <SentraCheckbox
                  label="Jag godkänner användarvillkor och integritetspolicy"
                  checked={acceptedUserTerms}
                  onToggle={() => setAcceptedUserTerms(!acceptedUserTerms)}
                />
              </View>

              <SentraInfoButton onPress={() => router.push("/privacy-info")} />
            </View>
            <View style={styles.checkboxRow}>
              <View style={styles.checkboxContent}>
                <SentraCheckbox
                  label="Aktivera biometrisk inloggning"
                  checked={biometricLogin}
                  onToggle={() => setBiometricLogin(!biometricLogin)}
                />
              </View>
              <SentraInfoButton
                onPress={() => router.push("/biometric-info")}
              />
            </View>
            <View style={styles.checkboxRow}>
              <View style={styles.checkboxContent}>
                <SentraCheckbox
                  label="Jag förstår att min plats kan delas vid nödlarm"
                  checked={locationSharingAccepted}
                  onToggle={() =>
                    setLocationSharingAccepted(!locationSharingAccepted)
                  }
                />
              </View>
              <SentraInfoButton
                onPress={() => router.push("/location-sharing-info")}
              />
            </View>
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <SentraButton title="Skapa konto" onPress={handleCreateAccount} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Har du redan ett konto?</Text>
          <Pressable onPress={() => router.push("/login")}>
            <Text style={styles.loginText}> Logga in</Text>
          </Pressable>
        </View>
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
    width: "100%",
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

  checkboxRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  checkboxContent: {
    flex: 1,
  },

  errorText: {
    color: "#FFB4B4",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 4,
    marginBottom: -10,
  },
});
