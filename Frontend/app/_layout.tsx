import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/contexts/AuthContext";
import { VoskProvider } from "@/services/VoskProvider";
import { useEffect } from "react";
import { codewordManager } from "@/services/codewordManager";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
  codewordManager.setTriggerEnabled(true);
}, []);

  return (
    <AuthProvider>
      <VoskProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="landingpage" />
          <Stack.Screen name="infoslides" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="security-setup" />
          <Stack.Screen name="alarm" />
          <Stack.Screen name="privacy-info" />
          <Stack.Screen name="terms" />
          <Stack.Screen name="biometric-info" />
          <Stack.Screen name="location-sharing-info" />
          <Stack.Screen name="share-location" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="native/VoskTestScreen" />
        </Stack>

        <StatusBar style="light" />
      </ThemeProvider>
      </VoskProvider>
    </AuthProvider>
  );
}