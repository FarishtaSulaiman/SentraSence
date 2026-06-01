import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import SentraTopBar from "@/components/SentraTopBar";
import { NotificationBell } from "@/components/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { API } from "@/config/api";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];
type Contact = {
  trustedContactId: string;
  name: string;
  phone: string;
  isPrimary: boolean;
};
type AlarmEvent = {
  alarmEventId: string;
  triggerType: string;
  status: string;
  startedAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  Active: "#E63946",
  Confirmed: "#F39C12",
  Cancelled: "#2ECC71",
};
const TRIGGER_LABELS: Record<string, string> = {
  Manual: "Manuellt larm",
  WakeWord: "Röstkommando",
};
function formatEventTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  const time = d.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return isToday
    ? `Idag ${time}`
    : d.toLocaleDateString("sv-SE", { day: "numeric", month: "short" }) +
        ` ${time}`;
}

function QuickAction({
  icon,
  label,
  sublabel,
  color,
  onPress,
}: {
  icon: IoniconsName;
  label: string;
  sublabel: string;
  color: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + "22" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
      <Text style={styles.quickActionSub}>{sublabel}</Text>
    </Pressable>
  );
}

// Dashboard
export default function Dashboard() {
  const { user } = useAuth();
  const showTrainingBanner = user && !user.codewordTrained;
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [recentEvents, setRecentEvents] = useState<AlarmEvent[]>([]);
  const { unreadCount } = useUnreadNotifications(user?.userId);

  useEffect(() => {
    if (!user) return;
    fetch(`${API}/api/contacts/${user.userId}`)
      .then((r) => r.json())
      .then(setContacts)
      .catch(() => {});
    fetch(`${API}/api/alarm/history/${user.userId}`)
      .then((r) => r.json())
      .then((data: AlarmEvent[]) => setRecentEvents(data.slice(0, 3)))
      .catch(() => {});
  }, [user]);

  const primaryContact =
    contacts.find((c) => c.isPrimary) ?? contacts[0] ?? null;

  const handleCallContact = () => {
    if (!primaryContact) return;
    Linking.openURL(`tel:${primaryContact.phone}`);
  };

  const handleShareLocation = () => {
    if (Platform.OS === "web") {
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          const url = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
          window.open(url, "_blank");
        },
        () => alert("Kunde inte hämta din position."),
      );
    } else {
      Linking.openURL("https://maps.google.com/");
    }
  };

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

        {/* Greeting */}
        <Text style={styles.greeting}>Hej, {user?.name ?? "där"}!</Text>
        <Text style={styles.greetingSub}>
          Du är <Text style={styles.highlight}>skyddad</Text> och allt fungerar
          som det ska.
        </Text>

        {/* Status card */}
        <Pressable style={styles.statusCard}>
          <View style={styles.statusIconWrap}>
            <Ionicons name="shield-checkmark" size={36} color="#00D8E6" />
          </View>
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>Ditt skydd är aktivt</Text>
            <Text style={styles.statusDesc}>
              SentraSense övervakar och är redo att hjälpa dig vid behov.
            </Text>
            <View style={styles.statusOkRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusOk}>Allt fungerar normalt</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#4A6070" />
        </Pressable>

        {/* AI-träning saknas — banner */}
        {showTrainingBanner && (
          <Pressable
            style={styles.trainingBanner}
            onPress={() => router.push("/security-setup" as any)}
          >
            <View style={styles.trainingBannerLeft}>
              <Ionicons name="mic-outline" size={20} color="#F39C12" />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.trainingBannerTitle}>
                  AI-kodordsträning saknas
                </Text>
                <Text style={styles.trainingBannerSub}>
                  Tryck här för att slutföra träningen
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#F39C12" />
          </Pressable>
        )}

        {/* Quick actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Snabbåtgärder</Text>
          <Pressable>
            <Text style={styles.seeAll}>Visa alla &gt;</Text>
          </Pressable>
        </View>

        <View style={styles.quickGrid}>
          <Pressable
            style={styles.quickAction}
            onPress={() => router.push("/alarm" as any)}
          >
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#E6394622" }]}
            >
              <Ionicons name="warning" size={22} color="#E63946" />
            </View>
            <Text style={styles.quickActionLabel}>Aktivera larm</Text>
            <Text style={styles.quickActionSub}>Nödsituation</Text>
          </Pressable>
          <QuickAction
            icon="person-add"
            label="Dela min plats"
            sublabel="Live"
            color="#9B59B6"
            onPress={handleShareLocation}
          />
          <QuickAction
            icon="call"
            label="Ring kontakt"
            sublabel={primaryContact?.name ?? "Snabbval"}
            color="#00D8E6"
            onPress={handleCallContact}
          />
          <QuickAction
            icon="shield-checkmark"
            label="Testa mitt skydd"
            sublabel="Kontrollera"
            color="#2ECC71"
            onPress={() => router.push("/security-setup" as any)}
          />
        </View>

        {/* Status cards row */}
        <View style={styles.infoRow}>
          {/* AI övervakning */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Text style={styles.infoCardTitle}>AI-övervakning</Text>
              <Ionicons name="pulse" size={14} color="#00D8E6" />
            </View>
            <Text style={styles.infoCardActive}>Aktiv</Text>
            <Text style={styles.infoCardDesc}>
              Lyssnar efter ditt kodord och onormala ljud.
            </Text>
            <View style={styles.waveformRow}>
              {[4, 10, 6, 14, 8, 18, 10, 14, 7, 12, 5, 16, 9].map((h, i) => (
                <View key={i} style={[styles.waveBar, { height: h }]} />
              ))}
            </View>
          </View>

          {/* Nödkontakter */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Text style={styles.infoCardTitle}>Nödkontakter</Text>
              <Ionicons name="people" size={14} color="#00D8E6" />
            </View>
            <Text style={styles.infoCardActive}>
              {contacts.length > 0
                ? `${contacts.length} kontakt${contacts.length !== 1 ? "er" : ""}`
                : "Inga kontakter"}
            </Text>
            <Text style={styles.infoCardDesc}>
              {contacts.length > 0
                ? "Dina kontakter är redo att larmas vid behov."
                : "Lägg till nöd­kontakter under Kontakter."}
            </Text>
            <Pressable
              style={styles.cardLink}
              onPress={() => router.push("/(tabs)/contacts" as any)}
            >
              <Text style={styles.cardLinkText}>Visa kontakter</Text>
              <Ionicons name="chevron-forward" size={12} color="#00D8E6" />
            </Pressable>
          </View>
        </View>

        <View style={styles.infoRow}>
          {/* Platsdelning */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Text style={styles.infoCardTitle}>Platsdelning</Text>
              <Ionicons name="location" size={14} color="#00D8E6" />
            </View>
            <Text style={styles.infoCardActive}>Aktiv</Text>
            <Text style={styles.infoCardDesc}>
              Din position delas vid larm med dina kontakter.
            </Text>
            <Pressable style={styles.cardLink} onPress={handleShareLocation}>
              <Text style={styles.cardLinkText}>Visa på karta</Text>
              <Ionicons name="chevron-forward" size={12} color="#00D8E6" />
            </Pressable>
          </View>

          {/* Senaste händelser */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Text style={styles.infoCardTitle}>Senaste händelser</Text>
              <Ionicons name="clipboard" size={14} color="#00D8E6" />
            </View>
            {recentEvents.length === 0 ? (
              <Text style={styles.infoCardDesc}>Inga larmhändelser än.</Text>
            ) : (
              recentEvents.map((e) => (
                <View key={e.alarmEventId} style={styles.eventRow}>
                  <View
                    style={[
                      styles.eventDot,
                      { backgroundColor: STATUS_COLORS[e.status] ?? "#4A6070" },
                    ]}
                  />
                  <Text style={styles.eventText} numberOfLines={1}>
                    {TRIGGER_LABELS[e.triggerType] ?? e.triggerType}
                  </Text>
                  <Text style={styles.eventTime}>
                    {formatEventTime(e.startedAt)}
                  </Text>
                </View>
              ))
            )}
            <Pressable
              style={styles.cardLink}
              onPress={() => router.push("/(tabs)/history" as any)}
            >
              <Text style={styles.cardLinkText}>Visa historik</Text>
              <Ionicons name="chevron-forward" size={12} color="#00D8E6" />
            </Pressable>
          </View>
        </View>

        {/* Nödlarm bottom banner */}
        <View style={styles.alarmBanner}>
          <View style={styles.alarmLeft}>
            <View style={styles.alarmIconWrap}>
              <Ionicons name="shield" size={20} color="#E63946" />
            </View>
            <View>
              <Text style={styles.alarmTitle}>Nödlarm</Text>
              <Text style={styles.alarmDesc}>Tryck här om du är i fara.</Text>
              <Text style={styles.alarmDesc}>
                Larm går direkt till dina kontakter.
              </Text>
            </View>
          </View>
          <Pressable
            style={styles.alarmBtn}
            onPress={() => router.push("/alarm" as any)}
          >
            <Text style={styles.alarmBtnText}>Aktivera larm</Text>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 32,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
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

  // Greeting
  greeting: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  greetingSub: {
    color: "#8FB8C4",
    fontSize: 13,
    marginBottom: 18,
  },
  highlight: {
    color: "#00D8E6",
    fontWeight: "700",
  },

  // Status card
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,216,230,0.07)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,216,230,0.2)",
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  statusIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(0,216,230,0.1)",
    borderWidth: 1,
    borderColor: "rgba(0,216,230,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    color: "#00D8E6",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 3,
  },
  statusDesc: {
    color: "#8FB8C4",
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 6,
  },
  statusOkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#2ECC71",
  },
  statusOk: {
    color: "#2ECC71",
    fontSize: 11,
    fontWeight: "600",
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  seeAll: {
    color: "#00D8E6",
    fontSize: 12,
    fontWeight: "600",
  },

  // Quick actions
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  quickAction: {
    width: "47%",
    backgroundColor: "rgba(10,26,38,0.9)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#122030",
    padding: 14,
    alignItems: "center",
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 2,
  },
  quickActionSub: {
    color: "#4A6070",
    fontSize: 10,
    textAlign: "center",
  },

  // Info row cards
  infoRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "rgba(10,26,38,0.9)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#122030",
    padding: 12,
  },
  infoCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  infoCardTitle: {
    color: "#8FB8C4",
    fontSize: 11,
    fontWeight: "600",
  },
  infoCardActive: {
    color: "#00D8E6",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  infoCardDesc: {
    color: "#4A6070",
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 8,
  },
  waveformRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 4,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: "rgba(0,216,230,0.5)",
  },
  cardLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 4,
  },
  cardLinkText: {
    color: "#00D8E6",
    fontSize: 11,
    fontWeight: "600",
  },

  // Events
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 5,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eventText: {
    color: "#8FB8C4",
    fontSize: 10,
    flex: 1,
  },
  eventTime: {
    color: "#4A6070",
    fontSize: 9,
  },

  // Alarm banner
  alarmBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(230,57,70,0.1)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(230,57,70,0.25)",
    padding: 14,
    marginTop: 10,
  },
  alarmLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  alarmIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(230,57,70,0.15)",
    borderWidth: 1,
    borderColor: "rgba(230,57,70,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  alarmTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 2,
  },
  alarmDesc: {
    color: "#8FB8C4",
    fontSize: 10,
    lineHeight: 14,
  },
  alarmBtn: {
    backgroundColor: "#E63946",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  alarmBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  trainingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2A2410",
    borderWidth: 1,
    borderColor: "#F39C1240",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  trainingBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  trainingBannerTitle: {
    color: "#F39C12",
    fontSize: 13,
    fontWeight: "700",
  },
  trainingBannerSub: {
    color: "#AAAAAA",
    fontSize: 11,
    marginTop: 2,
  },
});
