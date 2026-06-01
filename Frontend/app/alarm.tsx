import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Location from "expo-location";
import SentraTopBar from "@/components/SentraTopBar";
import { NotificationBell } from "@/components/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { API } from "@/config/api";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";
import { startRecording, stopRecording } from "@/services/audioService";
import { uploadAudioToBlob } from "@/services/blobUploadService";


const API_BASE = API;

function getPosition(): Promise<{
  lat: number;
  lon: number;
  accuracy?: number;
}> {
  if (Platform.OS === "web") {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ lat: 0, lon: 0 });
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy ?? undefined,
          }),
        (err) => {
          console.error("[GPS] geolocation error:", err.code, err.message);
          resolve({ lat: 0, lon: 0 });
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  }
  return Location.requestForegroundPermissionsAsync().then(({ status }) => {
    if (status !== "granted") return { lat: 0, lon: 0 };
    return Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    }).then((loc) => ({
      lat: loc.coords.latitude,
      lon: loc.coords.longitude,
      accuracy: loc.coords.accuracy ?? undefined,
    }));
  });
}

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// ─── Status item component ─────────────────────────────────────────────────

function StatusItem({
  icon,
  iconColor,
  title,
  desc,
  statusText,
  statusColor,
  showSpinner,
}: {
  icon: IoniconsName;
  iconColor: string;
  title: string;
  desc: string;
  statusText: string;
  statusColor: string;
  showSpinner?: boolean;
}){
  return (
    <View style={styles.statusItem}>
      <View
        style={[styles.statusItemIcon, { backgroundColor: iconColor + "22" }]}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.statusItemText}>
        <Text style={styles.statusItemTitle}>{title}</Text>
        <Text style={styles.statusItemDesc}>{desc}</Text>
      </View>
      <View style={styles.statusItemRight}>
        <Text style={[styles.statusItemStatus, { color: statusColor }]}>
          {statusText}
        </Text>
        {showSpinner ? (
          <Ionicons
            name="reload-circle"
            size={16}
            color={statusColor}
            style={{ marginLeft: 4 }}
          />
        ) : (
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={statusColor}
            style={{ marginLeft: 4 }}
          />
        )}
      </View>
    </View>
  );
}

// ─── Countdown timer ───────────────────────────────────────────────────────────

function Countdown({
  seconds: initial,
  onExpire,
}: {
  seconds: number;
  onExpire: () => void;
}) {
  const [seconds, setSeconds] = useState(initial);
  const expiredRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1 && !expiredRef.current) {
          expiredRef.current = true;
          onExpire();
          return 0;
        }
        return s > 0 ? s - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onExpire]);

  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");

  return (
    <View style={styles.timerCard}>
      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>
          {m}:{s}
        </Text>
      </View>
      <View>
        <Text style={styles.timerLabel}>Larmet fortsätter i</Text>
        <Text style={styles.timerSub}>
          Tryck på Avbryt larm om du är i säkerhet.
        </Text>
      </View>
    </View>
  );
}

// ─── Alarm screen ──────────────────────────────────────────────────────────────

export default function AlarmScreen() {
  const { user } = useAuth();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { unreadCount, refreshUnreadCount } = useUnreadNotifications(
    user?.userId,
  );

  const [alarmEventId, setAlarmEventId] = useState<string | null>(null);
  const [contactCount, setContactCount] = useState(0);
  const [alarmStatus, setAlarmStatus] = useState<
    "triggering" | "active" | "confirmed" | "cancelled"
  >("triggering");
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alarmEventIdRef = useRef<string | null>(null);
  const hasTriggeredEmergencyRef = useRef(false);
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.18,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulseAnim]);

  // Trigger alarm on mount
  useEffect(() => {
    if (!user) return;

    async function triggerAlarm() {
      try {
        const { lat, lon } = await getPosition();

        console.log("Triggering alarm at", API_BASE, "for user", user!.userId);
        const res = await fetch(`${API_BASE}/api/alarm/trigger`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user!.userId,
            lat,
            lon,
            triggerType: "Manual",
          }),
        });

        console.log("Alarm trigger response status:", res.status);

        if (res.ok) {
          const data = await res.json();
          console.log("Alarm trigger response body:", data);
          alarmEventIdRef.current = data.alarmEventId;
          setAlarmEventId(data.alarmEventId);
          setContactCount(data.contactsNotified);
          setAlarmStatus("active");
          await refreshUnreadCount();
          startLocationTracking(data.alarmEventId);

           //Skicka ljudfilens URL till backend
  //       if (audioUrl) {
  //         await fetch(`${API_BASE}/api/alarm/${data.alarmEventId}/audio`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           userId: user!.userId,
  //           audioUrl,
  //         }),
  //       });
  // }
        } else {
          const errorText = await res.text();
          console.error("Alarm trigger failed", res.status, errorText);
          setAlarmStatus("active");
        }
      } catch (err) {
        console.error("Error triggering alarm", err);
        setAlarmStatus("active");
      }
    }

    triggerAlarm();

    return () => {
      if (locationIntervalRef.current)
        clearInterval(locationIntervalRef.current);
    };
  }, [user, refreshUnreadCount]);

  async function triggerEmergencyFlow() {
    if (hasTriggeredEmergencyRef.current) return;

    console.log("Emergency flow started. activeAlarmId:", alarmEventIdRef.current ?? alarmEventId);
    setAlarmStatus("confirmed");

    const activeAlarmId = alarmEventIdRef.current ?? alarmEventId;
    if (!activeAlarmId) {
      console.error("No active alarm ID available for emergency flow");
      hasTriggeredEmergencyRef.current = false;
      return;
    }

    hasTriggeredEmergencyRef.current = true;
    console.log("Emergency flow started. activeAlarmId:", activeAlarmId);
    
    await handleConfirm(activeAlarmId);

    try {
      console.log("Starting recording…");
      await startRecording();

      recordingTimeoutRef.current = setTimeout(async () => {
        try {
          const uri = await stopRecording();
          if (!uri) {
            console.error("No audio URI returned");
            return;
          }

          console.log("Recording stopped, audio URI:", uri);

          const fileName = `alert_${Date.now()}.m4a`;
          const blobUrl = await uploadAudioToBlob(uri, fileName);
          console.log("Blob uploaded to:", blobUrl);

          const attachRes = await fetch(`${API_BASE}/api/alarm/${activeAlarmId}/audio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user?.userId,
              audioUrl: blobUrl,
            }),
          });

          console.log("Attach response status:", attachRes.status);

          if (!attachRes.ok) {
            const errorText = await attachRes.text();
            console.error("Failed to attach audio", attachRes.status, errorText);
            return;
          }

          console.log("Audio attached successfully");
        } catch (err) {
          console.error("Recording/upload flow error", err);
        } finally {
          recordingTimeoutRef.current = null;
        }
      }, 10000);
    } catch (err) {
      console.error("Failed to start recording", err);
      hasTriggeredEmergencyRef.current = false;
    }
  }

  function startLocationTracking(eventId: string) {
    locationIntervalRef.current = setInterval(async () => {
      try {
        const { lat, lon, accuracy } = await getPosition();
        await fetch(`${API}/api/alarm/${eventId}/location`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lon, accuracy }),
        });
      } catch {
        // Silent fail — position update is best-effort
      }
    }, 10000);
  }

  async function handleCancel() {
    if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    if (alarmEventId) {
      try {
        await fetch(`${API}/api/alarm/${alarmEventId}/cancel`, {
          method: "POST",
        });
      } catch {}
    }
    router.replace("/(tabs)" as any);
  }

async function handleConfirm(activeAlarmId: string) {
  try {
    await fetch(`${API_BASE}/api/alarm/${activeAlarmId}/confirm`, {
      method: "POST",
    });

    await refreshUnreadCount();
  } catch (err) {
    console.error("Error confirming alarm", err);
  }

  setAlarmStatus("confirmed");
}

  const isTriggering = alarmStatus === "triggering";
  const isConfirmed = alarmStatus === "confirmed";

  return (
    <SafeAreaView style={styles.safe}>
      <SentraTopBar />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoMark}>
              <Ionicons name="shield" size={18} color="#00D8E6" />
            </View>
            <Text style={styles.logoText}>SentraSense</Text>
          </View>
          <NotificationBell unreadCount={unreadCount} />
        </View>

        {/* Alarm title */}
        <Text style={styles.alarmTitle}>
          {isConfirmed ? "HJÄLP PÅ VÄG" : "NÖDLARM AKTIVERAT"}
        </Text>
        <Text style={styles.alarmSub}>
          {isConfirmed ? "(BEKRÄFTAT)" : "(AUTOMATISKT)"}
        </Text>

        {/* Pulse icon */}
        <View style={styles.pulseContainer}>
          <View style={styles.waveformRow}>
            {[4, 10, 20, 14, 28, 18, 34, 22, 30, 16, 24, 10, 6].map((h, i) => (
              <View key={`l${i}`} style={[styles.waveBar, { height: h }]} />
            ))}
          </View>
          <Animated.View
            style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}
          >
            <View
              style={[
                styles.pulseInner,
                isConfirmed && { backgroundColor: "#2ECC71" },
              ]}
            >
              <Ionicons
                name={isConfirmed ? "shield-checkmark" : "alert"}
                size={42}
                color="#FFFFFF"
              />
            </View>
          </Animated.View>
          <View style={styles.waveformRow}>
            {[6, 10, 24, 16, 30, 22, 34, 18, 28, 14, 20, 10, 4].map((h, i) => (
              <View key={`r${i}`} style={[styles.waveBar, { height: h }]} />
            ))}
          </View>
        </View>

        {/* Description */}
        <Text style={styles.desc}>
          {isConfirmed
            ? "Dina kontakter har fått ett SMS. Din position uppdateras tills larmet stängs."
            : "AI-övervakningen har upptäckt ett nödmönster och aktiverat "}
          {!isConfirmed && (
            <Text style={styles.descHighlight}>larmet automatiskt.</Text>
          )}
        </Text>

        {/* Status items */}
        <View style={styles.statusList}>
          <StatusItem
            icon="notifications"
            iconColor="#E63946"
            title="Larm skickas"
            desc="Dina kontakter notifieras nu."
            statusText={isTriggering ? "Skickas..." : "Skickat"}
            statusColor={isTriggering ? "#E63946" : "#2ECC71"}
            showSpinner={isTriggering}
          />
          <StatusItem
            icon="location"
            iconColor="#00D8E6"
            title="Position delas"
            desc="Din plats uppdateras i realtid."
            statusText="Aktiv"
            statusColor="#2ECC71"
          />
          <StatusItem
            icon="mic"
            iconColor="#9B59B6"
            title="Ljudinspelning aktiv"
            desc="Mikrofonen spelar in omgivningen."
            statusText="Aktiv"
            statusColor="#2ECC71"
          />
          <StatusItem
            icon="shield"
            iconColor="#F39C12"
            title="AI-analys pågår"
            desc="Analyserar ljud för att förstå situationen."
            statusText="Aktiv"
            statusColor="#2ECC71"
          />
          <StatusItem
            icon="people"
            iconColor="#2ECC71"
            title="Kontakter larmade"
            desc={
              isTriggering
                ? "Kontaktar dina nödkontakter..."
                : `${contactCount} nödkontakt${contactCount !== 1 ? "er" : ""} har notifierats.`
            }
            statusText={
              isTriggering ? "..." : `${contactCount} av ${contactCount}`
            }
            statusColor={isTriggering ? "#F39C12" : "#2ECC71"}
            showSpinner={isTriggering}
          />
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle"
            size={16}
            color="#00D8E6"
            style={{ marginRight: 8, marginTop: 1 }}
          />
          <Text style={styles.infoText}>
            Dina kontakter får din position och en länk för att följa din resa i
            realtid.
          </Text>
        </View>

        {/* Countdown */}
        <Countdown seconds={30} onExpire={() => void triggerEmergencyFlow()} />

        {/* Action buttons */}
        <View style={styles.buttonRow}>
          <Pressable style={styles.cancelBtn} onPress={handleCancel}>
            <Ionicons
              name={isConfirmed ? "home-outline" : "close-circle-outline"}
              size={16}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <View>
              <Text style={styles.cancelTitle}>
                {isConfirmed ? "Gå till hem" : "Det är falsklarm"}
              </Text>
              <Text style={styles.cancelSub}>
                {isConfirmed ? "Stäng larm" : "Avbryt och stoppa larm"}
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={[styles.helpBtn, isConfirmed && { backgroundColor: "#2ECC71" }]}
            onPress={() => {
              void triggerEmergencyFlow();
            }}
            disabled={isConfirmed}
          >
            <Ionicons
              name={isConfirmed ? "checkmark-circle" : "shield-half"}
              size={16}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <View>
              <Text style={styles.helpTitle}>
                {isConfirmed ? "Hjälp kontaktad" : "Jag behöver hjälp"}
              </Text>
              <Text style={styles.helpSub}>
                {isConfirmed
                  ? "Kontakter är informerade"
                  : "Behåll larmet aktivt"}
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#08141D",
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 32,
    alignItems: "center",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(0,216,230,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,216,230,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#00D8E6",
    fontSize: 16,
    fontWeight: "800",
  },

  // Alarm title
  alarmTitle: {
    color: "#E63946",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
  },
  alarmSub: {
    color: "#E63946",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.8,
  },

  // Pulse area
  pulseContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 12,
  },
  waveformRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: "rgba(230,57,70,0.6)",
  },
  pulseCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(230,57,70,0.25)",
    borderWidth: 2,
    borderColor: "rgba(230,57,70,0.6)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E63946",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 12,
  },
  pulseInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#E63946",
    justifyContent: "center",
    alignItems: "center",
  },

  // Description
  desc: {
    color: "#8FB8C4",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  descHighlight: {
    color: "#E63946",
    fontWeight: "700",
  },

  // Status list
  statusList: {
    width: "100%",
    gap: 8,
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10,26,38,0.9)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#122030",
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  statusItemIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statusItemText: { flex: 1 },
  statusItemTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  statusItemDesc: {
    color: "#4A6070",
    fontSize: 10,
    lineHeight: 14,
  },
  statusItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusItemStatus: {
    fontSize: 11,
    fontWeight: "700",
  },

  // Info box
  infoBox: {
    flexDirection: "row",
    backgroundColor: "rgba(0,216,230,0.07)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,216,230,0.18)",
    padding: 12,
    width: "100%",
    marginBottom: 14,
  },
  infoText: {
    color: "#8FB8C4",
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },

  // Timer
  timerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10,26,38,0.9)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#122030",
    padding: 14,
    width: "100%",
    gap: 14,
    marginBottom: 20,
  },
  timerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2.5,
    borderColor: "#E63946",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(230,57,70,0.1)",
  },
  timerText: {
    color: "#E63946",
    fontSize: 15,
    fontWeight: "900",
  },
  timerLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 3,
  },
  timerSub: {
    color: "#4A6070",
    fontSize: 11,
    lineHeight: 15,
  },

  // Buttons
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74,96,112,0.25)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3A5060",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  cancelTitle: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  cancelSub: {
    color: "#4A6070",
    fontSize: 9,
    marginTop: 1,
  },
  helpBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E63946",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: "#E63946",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  helpTitle: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  helpSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 9,
    marginTop: 1,
  },
});
