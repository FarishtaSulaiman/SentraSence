import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Location from "expo-location";
import { useAuth } from "@/contexts/AuthContext";
import { API } from "@/config/api";

export default function ShareLocationScreen() {
  const { user } = useAuth();
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [sharedCount, setSharedCount] = useState(0);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [statusError, setStatusError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Platstillstånd nekades",
            "Aktivera platstillstånd i inställningarna för att använda den här funktionen."
          );
          setLocationLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCoords({ lat: loc.coords.latitude, lon: loc.coords.longitude });
      } catch {
        Alert.alert("Fel", "Kunde inte hämta din position. Försök igen.");
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  const openInMaps = () => {
    if (!coords) return;
    const url = `https://maps.google.com/?q=${coords.lat},${coords.lon}`;
    Linking.openURL(url);
  };

  const shareWithContacts = async () => {
    setStatusMsg(null);
    setStatusError(false);

    if (!coords) {
      setStatusMsg("Väntar på GPS-position... Försök igen om ett ögonblick.");
      setStatusError(true);
      return;
    }
    if (!user) {
      setStatusMsg("Du är inte inloggad. Logga in och försök igen.");
      setStatusError(true);
      return;
    }

    setSharing(true);
    setStatusMsg("Skickar din plats...");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${API}/api/alarm/share-location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          lat: coords.lat,
          lon: coords.lon,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const rawText = await res.text();
      if (!rawText) {
        setStatusMsg(`Servern returnerade tomt svar (HTTP ${res.status}). Kontrollera att backend körs och att du är inloggad.`);
        setStatusError(true);
        return;
      }

      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        setStatusMsg(`Ogiltigt serversvar (HTTP ${res.status}): ${rawText.substring(0, 120)}`);
        setStatusError(true);
        return;
      }

      if (!res.ok) {
        setStatusMsg(data.message ?? data.title ?? `Fel från servern (${res.status}).`);
        setStatusError(true);
        return;
      }

      if (data.emailSentTo === 0) {
        setStatusMsg(
          "Inga nödkontakter med e-postadress hittades. Lägg till e-post för dina kontakter under Inställningar."
        );
        setStatusError(true);
        return;
      }

      setSharedCount(data.emailSentTo);
      setShared(true);
      setStatusMsg(null);
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setStatusMsg("Servern svarade inte (timeout). Kontrollera att backend körs.");
      } else {
        setStatusMsg(`Nätverksfel: ${err?.message ?? "okänt fel"}. Kontrollera anslutningen.`);
      }
      setStatusError(true);
    } finally {
      setSharing(false);
    }
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)" as any);
    }
  };

  const formatCoord = (n: number, decimals = 5) => n.toFixed(decimals);

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={goBack} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={22} color="#00D8E6" />
        <Text style={styles.backText}>Tillbaka</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="location" size={40} color="#00D8E6" />
          </View>
          <Text style={styles.title}>Dela min plats</Text>
          <Text style={styles.subtitle}>
            Se din nuvarande position och dela den med dina nödkontakter
          </Text>
        </View>

        {/* Location card */}
        <View style={styles.card}>
          {locationLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#00D8E6" />
              <Text style={styles.loadingText}>Hämtar din position…</Text>
            </View>
          ) : coords ? (
            <>
              <View style={styles.coordRow}>
                <Ionicons name="navigate-circle-outline" size={18} color="#00D8E6" />
                <Text style={styles.coordLabel}>Latitud</Text>
                <Text style={styles.coordValue}>{formatCoord(coords.lat)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.coordRow}>
                <Ionicons name="navigate-circle-outline" size={18} color="#00D8E6" />
                <Text style={styles.coordLabel}>Longitud</Text>
                <Text style={styles.coordValue}>{formatCoord(coords.lon)}</Text>
              </View>

              <TouchableOpacity
                style={styles.mapsButton}
                onPress={openInMaps}
                activeOpacity={0.8}
              >
                <Ionicons name="map-outline" size={18} color="#08141D" />
                <Text style={styles.mapsButtonText}>Öppna i Google Maps</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.errorText}>
              Kunde inte hämta position. Kontrollera platstillstånd.
            </Text>
          )}
        </View>

        {/* Share button */}
        {!shared ? (
          <TouchableOpacity
            style={[styles.shareButton, sharing && styles.shareButtonDisabled]}
            onPress={shareWithContacts}
            activeOpacity={0.8}
            disabled={sharing}
          >
            {sharing ? (
              <ActivityIndicator color="#08141D" />
            ) : (
              <>
                <Ionicons name="mail-outline" size={20} color="#08141D" />
                <Text style={styles.shareButtonText}>
                  Dela plats med nödkontakter
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={32} color="#2ECC71" />
            <Text style={styles.successTitle}>Plats delad!</Text>
            <Text style={styles.successSubtitle}>
              {sharedCount === 1
                ? "Mail skickades till 1 kontakt."
                : `Mail skickades till ${sharedCount} kontakter.`}
            </Text>
            <TouchableOpacity style={styles.shareAgainButton} onPress={() => { setShared(false); setStatusMsg(null); }} activeOpacity={0.7}>
              <Text style={styles.shareAgainText}>Dela igen</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Inline status / felmeddelande */}
        {statusMsg !== null && (
          <View style={[styles.statusBanner, statusError ? styles.statusBannerError : styles.statusBannerInfo]}>
            <Ionicons
              name={statusError ? "warning-outline" : "information-circle-outline"}
              size={18}
              color={statusError ? "#E63946" : "#00D8E6"}
            />
            <Text style={[styles.statusText, statusError && styles.statusTextError]}>
              {statusMsg}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#08141D",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 6,
  },
  backText: {
    color: "#00D8E6",
    fontSize: 15,
    fontWeight: "500",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#122030",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#00D8E6",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#8FB8C4",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#122030",
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1A3040",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  loadingText: {
    color: "#8FB8C4",
    fontSize: 14,
  },
  coordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  coordLabel: {
    color: "#8FB8C4",
    fontSize: 14,
    flex: 1,
  },
  coordValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  divider: {
    height: 1,
    backgroundColor: "#1A3040",
    marginVertical: 2,
  },
  mapsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00D8E6",
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 16,
    gap: 8,
  },
  mapsButtonText: {
    color: "#08141D",
    fontWeight: "700",
    fontSize: 14,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00D8E6",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 10,
  },
  shareButtonDisabled: {
    opacity: 0.4,
  },
  shareButtonText: {
    color: "#08141D",
    fontWeight: "700",
    fontSize: 16,
  },
  errorText: {
    color: "#E63946",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 8,
  },
  successCard: {
    backgroundColor: "#122030",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#2ECC71",
  },
  successTitle: {
    color: "#2ECC71",
    fontSize: 20,
    fontWeight: "700",
  },
  successSubtitle: {
    color: "#8FB8C4",
    fontSize: 14,
    textAlign: "center",
  },
  shareAgainButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  shareAgainText: {
    color: "#00D8E6",
    fontSize: 14,
    fontWeight: "600",
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#122030",
    borderRadius: 10,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#00D8E6",
  },
  statusBannerError: {
    borderColor: "#E63946",
  },
  statusBannerInfo: {
    borderColor: "#00D8E6",
  },
  statusText: {
    color: "#00D8E6",
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
  },
  statusTextError: {
    color: "#E63946",
  },
});
