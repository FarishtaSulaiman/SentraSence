import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import SentraScreen from "@/components/SentraScreen";
import SentraLogo from "@/components/SentraLogo";
import SentraInput from "@/components/SentraInput";
import SentraButton from "@/components/SentraButton";
import { router } from "expo-router";
import SentraCheckbox from "@/components/SentraCheckbox";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { useAuth } from "@/contexts/AuthContext";

import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { API } from "@/config/api";

const GOOGLE_WEB_CLIENT_ID =
  "384117481196-i5uctgj3gb8b4ahi85k3opb0e8lm1d6n.apps.googleusercontent.com";

// TODO: Ändra till era egna IP-adresser när ni testar på era enheter/emulatorer
// const API_BASE_URL = "http://192.168.50.203:5255";

export default function Login() {
  const { setUser } = useAuth();
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState("");

  // KONFIGURERAR NATIVE GOOGLE SIGN-IN
  // webClientId är Web Client ID från Google Cloud Console
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  const navigateAfterLogin = (isSecuritySetupCompleted: boolean) => {
    if (isSecuritySetupCompleted) {
      router.replace("/(tabs)" as any);
    } else {
      router.replace("/security-setup");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Kontrollerar att Google Play Services finns på Android-enheten
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Öppnar native Google-kontoväljare
      const googleResponse = await GoogleSignin.signIn();

      // Om användaren avbryter händer inget
      if (!isSuccessResponse(googleResponse)) {
        console.log("Google sign-in cancelled.");
        return;
      }

      const googleUser = googleResponse.data.user;

      console.log("Google user:", googleUser);

      console.log("API used for backend login:", API);

      const backendLoginUrl = `${API}/api/auth/google`;
      console.log("Backend login URL:", backendLoginUrl);

      try {
        console.log("Testing backend root:", `${API}/`);

        const testResponse = await fetch(`${API}/`);
        console.log("Backend root test status:", testResponse.status);
      } catch (testError) {
        console.error("Backend root test failed:", testError);
      }

      const backendResponse = await fetch(backendLoginUrl, {
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

      if (backendResponse.status === 404) {
        Alert.alert(
          "Konto saknas",
          "Du behöver registrera dig innan du kan logga in med Google.",
          [
            {
              text: "Gå till registrering",
              onPress: () => router.push("/register"),
            },
            {
              text: "Avbryt",
              style: "cancel",
            },
          ],
        );

        return;
      }

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();

        console.error(
          "Backend login failed:",
          backendResponse.status,
          errorText,
        );

        throw new Error("Backend login failed");
      }

      const appUser = await backendResponse.json();

      console.log("App user:", appUser);
      console.log("Security setup completed:", appUser?.securitySetupCompleted);

      setUser({
        userId: appUser.userId,
        email: appUser.email,
        name: appUser.name,
        codewordTrained: appUser.codewordTrained ?? false,
      });

      const isSecuritySetupCompleted = appUser?.securitySetupCompleted ?? false;

      navigateAfterLogin(isSecuritySetupCompleted);
    } catch (error) {
      console.error("Google login error:", error);

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            Alert.alert(
              "Vänta",
              "Google-inloggning pågår redan. Försök igen om en stund.",
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
              `Google-inloggning misslyckades. Kod: ${error.code}`,
            );
            return;
        }
      }

      Alert.alert("Fel", "Något gick fel vid Google-inloggning.");
    }
  };

  return (
    <SentraScreen>
      <View style={styles.content}>
        <View style={styles.logoWrapper}>
          <SentraLogo size="large" />
        </View>

        <View style={styles.subtitleWrapper}>
          <Text style={styles.subtitle}>Välkommen tillbaka!</Text>
          <Text style={styles.subtitle}>Logga in för att fortsätta.</Text>
        </View>

        <View style={styles.form}>
          <SentraInput
            icon="mail"
            placeholder="E-post"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <SentraInput
            icon="lock-closed"
            placeholder="Lösenord"
            secureTextEntry
            style={styles.inputSpacing}
          />
        </View>

        <SentraCheckbox
          label="Kom ihåg mig"
          checked={rememberMe}
          onToggle={() => setRememberMe(!rememberMe)}
        />

        <Pressable
          style={styles.forgotPasswordWrapper}
          onPress={() => {
            setMessage(
              "Återställning av lösenord kopplas in senare om vi väljer e-postinloggning.",
            );
            console.log("FORGOT PASSWORD EMAIL BUTTON PRESSED");
          }}
        >
          <Text style={styles.forgotPasswordText}>Glömt lösenord?</Text>
        </Pressable>

        {message ? <Text style={styles.messageText}>{message}</Text> : null}

        <SentraButton
          title="Logga in"
          onPress={() => {
            setMessage(
              "Just nu använder vi Google-inloggning. E-post och lösenord kopplas in senare om vi väljer att stödja det.",
            );
            console.log("LOGIN EMAIL BUTTON PRESSED");
          }}
        />

        <GoogleAuthButton
          title="Logga in med Google"
          onPress={handleGoogleLogin}
        />

        <SentraButton
          title="Testa i Expo utan Google"
          onPress={() => {
            console.log("MOCK EXPO LOGIN → security setup");
            router.replace("/security-setup");
          }}
          style={styles.googleButton}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Inte medlem?</Text>

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
    marginTop: 10,
    marginBottom: 10,
  },

  logoWrapper: {
    marginBottom: -95,
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

  createAccountText: {
    color: "#00D8E6",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    alignSelf: "center",
  },

  forgotPasswordWrapper: {
    width: "78%",
    alignItems: "flex-start",
    marginTop: 6,
    marginBottom: 6,
  },

  forgotPasswordText: {
    color: "#8FB8C4",
    fontSize: 12,
    fontWeight: "500",
  },

  googleButton: {
    marginTop: 14,
    marginBottom: 18,
  },

  messageText: {
    color: "#F36B6B",
    textAlign: "center",
    width: "78%",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
    marginBottom: 10,
  },

  googleButtonText: {
    color: "#1F2A33",
    fontSize: 14,
    fontWeight: "700",
  },
});
