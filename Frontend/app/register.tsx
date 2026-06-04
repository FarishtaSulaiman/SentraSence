import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import SentraScreen from "@/components/SentraScreen";
import SentraLogo from "@/components/SentraLogo";
import SentraInput from "@/components/SentraInput";
import SentraButton from "@/components/SentraButton";
import SentraCheckbox from "@/components/SentraCheckbox";
import SentraInfoButton from "@/components/SentraInfoButton";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { API } from "@/config/api";

import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";

const GOOGLE_WEB_CLIENT_ID =
  "384117481196-i5uctgj3gb8b4ahi85k3opb0e8lm1d6n.apps.googleusercontent.com";

export default function Register() {
  const { setUser } = useAuth();

  const [biometricLogin, setBiometricLogin] = useState(false);
  const [acceptedUserTerms, setAcceptedUserTerms] = useState(false);
  const [locationSharingAccepted, setLocationSharingAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  const handleCreateAccount = () => {
    console.log("REGISTER EMAIL BUTTON PRESSED");

    setErrorMessage(
      "Just nu använder vi Google för att skapa konto. E-post och lösenord kopplas in senare om vi väljer att stödja det.",
    );
  };

  const handleGoogleRegisterPress = async () => {
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

    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const googleResponse = await GoogleSignin.signIn();

      if (!isSuccessResponse(googleResponse)) {
        console.log("Google registration cancelled.");
        return;
      }

      const googleUser = googleResponse.data.user;

      console.log("Google register user:", googleUser);

      const backendResponse = await fetch(`${API}/api/auth/google/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: googleUser.email,
          name: googleUser.name ?? googleUser.email,
          googleId: googleUser.id,
          picture: googleUser.photo,
        }),
      });

      if (backendResponse.status === 409) {
        setErrorMessage(
          "Det finns redan ett konto med den här e-postadressen. Logga in istället.",
        );

        return;
      }

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();

        console.error(
          "Google register failed:",
          backendResponse.status,
          errorText,
        );

        throw new Error("Google register failed");
      }

      const appUser = await backendResponse.json();

      console.log("Registered app user:", appUser);

      setUser({
        userId: appUser.userId,
        email: appUser.email,
        name: appUser.name,
        codeword: appUser.codeword,
        codewordTrained: appUser.codewordTrained ?? false,
      });

      router.replace("/security-setup");
    } catch (error) {
      console.error("Google register error:", error);

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            Alert.alert(
              "Vänta",
              "Google-registrering pågår redan. Försök igen om en stund.",
            );
            return;

          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert(
              "Google Play saknas",
              "Google Play Services saknas eller behöver uppdateras på enheten.",
            );
            return;

          default:
            Alert.alert(
              "Fel",
              `Google-registrering misslyckades. Kod: ${error.code}`,
            );
            return;
        }
      }

      Alert.alert("Fel", "Något gick fel vid registrering med Google.");
    }
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
            <>
              <Text style={styles.errorText}>{errorMessage}</Text>

              {errorMessage.includes("Logga in istället") ? (
                <Pressable onPress={() => router.push("/login")}>
                  <Text style={styles.errorLoginLink}>Gå till login</Text>
                </Pressable>
              ) : null}
            </>
          ) : null}
        </View>

        <SentraButton title="Skapa konto" onPress={handleCreateAccount} />

        <GoogleAuthButton
          title="Registrera med Google"
          onPress={handleGoogleRegisterPress}
        />

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
    marginTop: -85,
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
    lineHeight: 17,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 6,
    paddingHorizontal: 6,
  },

  errorLoginLink: {
    color: "#00D8E6",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 14,
  },
});
