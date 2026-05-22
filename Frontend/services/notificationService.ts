import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { API } from "@/config/api";

/**
 * Bestämmer hur notiser ska visas när appen är öppen.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Begär notisbehörighet och hämtar appens Expo Push Token.
 *
 * Returnerar:
 * - push token som string om allt lyckas
 * - null om behörighet nekas eller token inte kan hämtas
 */
export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  try {
    if (!Device.isDevice) {
      console.warn(
        "Push notifications require a supported physical device or compatible emulator/simulator.",
      );
      return null;
    }

    // Android behöver en notification channel innan token hämtas.
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const existingPermissions = await Notifications.getPermissionsAsync();
    let finalStatus = existingPermissions.status;

    if (finalStatus !== "granted") {
      const requestedPermissions =
        await Notifications.requestPermissionsAsync();
      finalStatus = requestedPermissions.status;
    }

    if (finalStatus !== "granted") {
      console.warn("Notification permission was not granted.");
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      console.warn(
        "Expo projectId is missing. Push token could not be generated.",
      );
      return null;
    }

    const expoPushToken = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return expoPushToken.data;
  } catch (error) {
    console.error("Failed to register for push notifications:", error);
    return null;
  }
}

/**
 * Skickar användarens push token till backend så det kan sparas i databasen.
 */
export async function sendPushTokenToBackend({
  userId,
  token,
}: {
  userId: string;
  token: string;
}): Promise<boolean> {
  try {
    const response = await fetch(
      `${API}/api/notifications/register-token`, 
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          token,
          platform: Platform.OS,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Failed to register push token in backend:",
        response.status,
        errorText,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error while sending push token to backend:", error);
    return false;
  }
}
