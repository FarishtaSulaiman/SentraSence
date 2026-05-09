import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import SentraScreen from "@/components/SentraScreen";
import SentraLogo from "@/components/SentraLogo";
import SentraInput from "@/components/SentraInput";
import SentraButton from "@/components/SentraButton";
import SentraCheckbox from "@/components/SentraCheckbox";
import SentraInfoButton from "@/components/SentraInfoButton";
import { router } from "expo-router";

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID =
  "384117481196-i5uctgj3gb8b4ahi85k3opb0e8lm1d6n.apps.googleusercontent.com";

const GOOGLE_ANDROID_CLIENT_ID =
  "384117481196-o7kll23elvggljqc9m958vuk6pudidb1.apps.googleusercontent.com";

const GOOGLE_IOS_CLIENT_ID =
  "384117481196-k3uh01friqqcp6rq0apkpdhinafa2o3d.apps.googleusercontent.com";

export default function Register() {
  const [biometricLogin, setBiometricLogin] = useState(false);
  const [acceptedUserTerms, setAcceptedUserTerms] = useState(false);
  const [locationSharingAccepted, setLocationSharingAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const redirectUri = AuthSession.makeRedirectUri();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri,
    responseType: "token",
    scopes: ["profile", "email"],
  });

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

  const handleGoogleRegisterPress = () => {
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

    if (!request) {
      Alert.alert("Google Auth", "Google-inloggningen är inte redo ännu.");
      return;
    }

    promptAsync();
  };

  useEffect(() => {
    const handleGoogleRegister = async () => {
      if (response?.type !== "success") return;

      const accessToken =
        response.authentication?.accessToken ?? response.params?.access_token;

      if (!accessToken) {
        Alert.alert("Fel", "Kunde inte hämta access token från Google.");
        return;
      }

      try {
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/userinfo/v2/me",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const userInfo = await userInfoResponse.json();

        console.log("Google register user:", userInfo);

        const backendResponse = await fetch(
          "http://localhost:5255/api/auth/google/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: userInfo.email,
              name: userInfo.name,
              googleId: userInfo.id,
              picture: userInfo.picture,
            }),
          },
        );

        if (backendResponse.status === 409) {
          setErrorMessage(
            "Det finns redan ett konto med den här e-postadressen. Logga in istället.",
          );

          return;
        }

        if (!backendResponse.ok) {
          const errorText = await backendResponse.text();
          console.error("Google register failed:", backendResponse.status, errorText);
          throw new Error("Google register failed");
        }

        const appUser = await backendResponse.json();

        console.log("Registered app user:", appUser);

        Alert.alert(
          "Konto skapat",
          "Ditt konto har skapats med Google. Du kan nu logga in.",
          [
            {
              text: "OK",
              onPress: () => router.push("/login"),
            },
          ],
        );
      } catch (error) {
        console.error("Google register error:", error);
        Alert.alert("Fel", "Något gick fel vid registrering med Google.");
      }
    };

    handleGoogleRegister();
  }, [response]);

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
            <>
              <Text style={styles.errorText}>{errorMessage}</Text>

              {errorMessage.includes("Logga in istället") ? (
                <Pressable onPress={() => router.push("/login")}>
                  <Text style={styles.errorLoginLink}>Gå till login</Text>
                </Pressable>
              ) : null}
            </>
          ) : null}

          <SentraButton title="Skapa konto" onPress={handleCreateAccount} />

          <SentraButton
            title="Registrera med Google"
            onPress={handleGoogleRegisterPress}
            style={styles.googleButton}
          />
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
    lineHeight: 17,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 6,
    paddingHorizontal: 6,
  },

  googleButton: {
    marginTop: 10,
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
