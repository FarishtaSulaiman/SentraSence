import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import SentraScreen from "@/components/SentraScreen";
import SentraLogo from "@/components/SentraLogo";
import SentraInput from "@/components/SentraInput";
import SentraButton from "@/components/SentraButton";
import { router } from "expo-router";
import SentraCheckbox from "@/components/SentraCheckbox";

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

export default function Login() {
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState("");

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    const handleGoogleLogin = async () => {
      if (response?.type !== "success") return;

      console.log("Google response:", response);

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

        console.log("Google user:", userInfo);

        const backendResponse = await fetch(
          "http://localhost:5255/api/auth/google",
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

        router.push("/"); // byt senare ut mot exempelvis nedan:
        // router.replace("/dashboard");
      } catch (error) {
        console.error("Google login error:", error);
        Alert.alert("Fel", "Något gick fel vid Google-inloggning.");
      }
    };

    handleGoogleLogin();
  }, [response]);
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

        <SentraButton
          title="Logga in med Google"
          onPress={() => {
            if (!request) return;
            promptAsync();
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
