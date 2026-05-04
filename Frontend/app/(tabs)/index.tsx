import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import SentraTopBar from "@/components/SentraTopBar";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// Quick action button 

function QuickAction({
  icon,
  label,
  sublabel,
  color,
}: {
  icon: IoniconsName;
  label: string;
  sublabel: string;
  color: string;
}) {
  return (
    <Pressable style={styles.quickAction}>
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

        {/* Greeting */}
        <Text style={styles.greeting}>Hej, Farishta!</Text>
        <Text style={styles.greetingSub}>
          Du är <Text style={styles.highlight}>skyddad</Text> och allt fungerar som det ska.
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

        {/* Quick actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Snabbåtgärder</Text>
          <Pressable>
            <Text style={styles.seeAll}>Visa alla &gt;</Text>
          </Pressable>
        </View>

        <View style={styles.quickGrid}>
          <QuickAction icon="warning" label="Aktivera larm" sublabel="Nödsituation" color="#E63946" />
          <QuickAction icon="person-add" label="Dela min plats" sublabel="Live" color="#9B59B6" />
          <QuickAction icon="call" label="Ring kontakt" sublabel="Snabbval" color="#00D8E6" />
          <QuickAction icon="shield-checkmark" label="Testa mitt skydd" sublabel="Kontrollera" color="#2ECC71" />
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
            <Text style={styles.infoCardActive}>3 kontakter</Text>
            <Text style={styles.infoCardDesc}>
              Dina kontakter är redo att larmas vid behov.
            </Text>
            <Pressable style={styles.cardLink}>
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
            <Pressable style={styles.cardLink}>
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
            {[
              { dot: "#2ECC71", text: "Systemet startades", time: "Idag 10:25" },
              { dot: "#00D8E6", text: "Skydd aktiverat", time: "Idag 10:25" },
              { dot: "#9B59B6", text: "Kodord tränat", time: "Idag 10:20" },
            ].map((e) => (
              <View key={e.text} style={styles.eventRow}>
                <View style={[styles.eventDot, { backgroundColor: e.dot }]} />
                <Text style={styles.eventText} numberOfLines={1}>{e.text}</Text>
                <Text style={styles.eventTime}>{e.time}</Text>
              </View>
            ))}
            <Pressable style={styles.cardLink}>
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
              <Text style={styles.alarmDesc}>Larm går direkt till dina kontakter.</Text>
            </View>
          </View>
          <Pressable style={styles.alarmBtn}>
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
  bellBtn: {
    padding: 4,
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
});
