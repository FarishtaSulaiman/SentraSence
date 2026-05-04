import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import SentraTopBar from "@/components/SentraTopBar";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// ─── Status row item ───────────────────────────────────────────────────────────

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
}) {
  return (
    <View style={styles.statusItem}>
      <View style={[styles.statusItemIcon, { backgroundColor: iconColor + "22" }]}>
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
          <Ionicons name="reload-circle" size={16} color={statusColor} style={{ marginLeft: 4 }} />
        ) : (
          <Ionicons name="checkmark-circle" size={16} color={statusColor} style={{ marginLeft: 4 }} />
        )}
      </View>
    </View>
  );
}

// ─── Countdown timer ───────────────────────────────────────────────────────────

function Countdown({ seconds: initial }: { seconds: number }) {
  const [seconds, setSeconds] = useState(initial);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");

  return (
    <View style={styles.timerCard}>
      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>{m}:{s}</Text>
      </View>
      <View>
        <Text style={styles.timerLabel}>Larmet fortsätter i</Text>
        <Text style={styles.timerSub}>Tryck på Avbryt larm om du är i säkerhet.</Text>
      </View>
    </View>
  );
}

// ─── Alarm screen ──────────────────────────────────────────────────────────────

export default function AlarmScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
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
    ).start();
  }, []);

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
          <Pressable style={styles.bellBtn}>
            <Ionicons name="notifications-outline" size={22} color="#8FB8C4" />
          </Pressable>
        </View>

        {/* Alarm title */}
        <Text style={styles.alarmTitle}>NÖDLARM AKTIVERAT</Text>
        <Text style={styles.alarmSub}>(AUTOMATISKT)</Text>

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
            <View style={styles.pulseInner}>
              <Ionicons name="alert" size={42} color="#FFFFFF" />
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
          AI-övervakningen har upptäckt ett nödmönster och aktiverat{" "}
          <Text style={styles.descHighlight}>larmet automatiskt.</Text>
        </Text>

        {/* Status items */}
        <View style={styles.statusList}>
          <StatusItem
            icon="notifications"
            iconColor="#E63946"
            title="Larm skickas"
            desc="Dina kontakter notifieras nu."
            statusText="Skickas..."
            statusColor="#E63946"
            showSpinner
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
            desc="3 nödkontakter har notifierats."
            statusText="3 av 3"
            statusColor="#2ECC71"
          />
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={16} color="#00D8E6" style={{ marginRight: 8, marginTop: 1 }} />
          <Text style={styles.infoText}>
            Dina kontakter får din position och en länk för att följa din resa i realtid.
          </Text>
        </View>

        {/* Countdown */}
        <Countdown seconds={176} />

        {/* Action buttons */}
        <View style={styles.buttonRow}>
          <Pressable
            style={styles.cancelBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="close-circle-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <View>
              <Text style={styles.cancelTitle}>Det är falsklarm</Text>
              <Text style={styles.cancelSub}>Avbryt och stoppa larm</Text>
            </View>
          </Pressable>

          <Pressable style={styles.helpBtn}>
            <Ionicons name="shield-half" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <View>
              <Text style={styles.helpTitle}>Jag behöver hjälp</Text>
              <Text style={styles.helpSub}>Behåll larmet aktivt</Text>
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
  bellBtn: { padding: 4 },

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
