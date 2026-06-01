import Constants from "expo-constants";

// Manuell override via .env (används i produktion / CI)
const manual = process.env.EXPO_PUBLIC_API_URL;

// Automatisk: plocka host från Expo dev-serverns URI (t.ex. "192.168.1.5:8081" → "192.168.1.5")
const hostUri = Constants.expoConfig?.hostUri ?? "";
const devHost = hostUri.split(":")[0];
const auto = devHost ? `http://${devHost}:5255` : "http://localhost:5255";

export const API = manual ?? auto;
