import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { API } from "@/config/api";
import SentraTopBar from "@/components/SentraTopBar";

type AlarmEvent = {
  alarmEventId: string;
  triggerType: string;
  status: "Active" | "Confirmed" | "Cancelled";
  startedAt: string;
  endedAt: string | null;
  notes: string | null;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  const time = d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `Idag ${time}`;
  return (
    d.toLocaleDateString("sv-SE", { day: "numeric", month: "short" }) + ` ${time}`
  );
}

function formatDuration(startedAt: string, endedAt: string | null): string | null {
  if (!endedAt) return null;
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}min ${s % 60}s`;
}

const STATUS_META: Record<string, { color: string; label: string; icon: React.ComponentProps<typeof Ionicons>["name"] }> = {
  Active:    { color: "#E63946", label: "Aktivt",     icon: "warning" },
  Confirmed: { color: "#F39C12", label: "Bekräftat",  icon: "checkmark-circle" },
  Cancelled: { color: "#2ECC71", label: "Avbrutet",   icon: "close-circle" },
};

const TRIGGER_LABELS: Record<string, string> = {
  Manual:    "Manuellt larm",
  WakeWord:  "Röstkommando",
};

function EventCard({ event }: { event: AlarmEvent }) {
  const meta = STATUS_META[event.status] ?? STATUS_META.Active;
  const triggerLabel = TRIGGER_LABELS[event.triggerType] ?? event.triggerType;
  const duration = formatDuration(event.startedAt, event.endedAt);

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={[styles.iconWrap, { backgroundColor: meta.color + "22" }]}>
          <Ionicons name={meta.icon} size={20} color={meta.color} />
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.triggerLabel}>{triggerLabel}</Text>
          <View style={[styles.badge, { backgroundColor: meta.color + "22" }]}>
            <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>
        <Text style={styles.timeText}>{formatDate(event.startedAt)}</Text>
        {duration && (
          <Text style={styles.durationText}>Varaktighet: {duration}</Text>
        )}
        {event.notes ? <Text style={styles.notesText}>{event.notes}</Text> : null}
      </View>
    </View>
  );
}

export default function History() {
  const { user } = useAuth();
  const [events, setEvents] = useState<AlarmEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/alarm/history/${user.userId}`);
      if (!res.ok) throw new Error("Kunde inte hämta historik.");
      const data = await res.json();
      setEvents(data);
    } catch {
      setError("Kunde inte ladda historik. Kontrollera anslutningen.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory(true);
  }, [fetchHistory]);

  return (
    <SafeAreaView style={styles.safe}>
      <SentraTopBar />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00D8E6"
            colors={["#00D8E6"]}
          />
        }
      >
        <Text style={styles.pageTitle}>Historik</Text>
        <Text style={styles.pageSub}>Dina senaste larmhändelser</Text>

        {loading && (
          <ActivityIndicator color="#00D8E6" style={{ marginTop: 40 }} />
        )}

        {!loading && error && (
          <View style={styles.emptyWrap}>
            <Ionicons name="cloud-offline-outline" size={36} color="#4A6070" />
            <Text style={styles.emptyText}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={() => fetchHistory()}>
              <Text style={styles.retryText}>Försök igen</Text>
            </Pressable>
          </View>
        )}

        {!loading && !error && events.length === 0 && (
          <View style={styles.emptyWrap}>
            <Ionicons name="shield-checkmark-outline" size={36} color="#4A6070" />
            <Text style={styles.emptyText}>Inga larmhändelser än.</Text>
            <Text style={styles.emptySubText}>Händelser visas här när du aktiverar ett larm.</Text>
          </View>
        )}

        {!loading && !error && events.map((e) => (
          <EventCard key={e.alarmEventId} event={e} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: "#08141D" },
  scroll:        { flex: 1 },
  content:       { padding: 20, paddingBottom: 40 },
  pageTitle:     { color: "#FFFFFF", fontSize: 22, fontWeight: "800", marginBottom: 4 },
  pageSub:       { color: "#4A6070", fontSize: 13, marginBottom: 24 },

  card:          { flexDirection: "row", backgroundColor: "#0D1F2D", borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#1A3040" },
  cardLeft:      { marginRight: 12, justifyContent: "flex-start" },
  iconWrap:      { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cardBody:      { flex: 1 },
  cardTop:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  triggerLabel:  { color: "#FFFFFF", fontSize: 14, fontWeight: "700", flex: 1, marginRight: 8 },
  badge:         { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:     { fontSize: 11, fontWeight: "700" },
  timeText:      { color: "#4A6070", fontSize: 12, marginTop: 2 },
  durationText:  { color: "#4A6070", fontSize: 12, marginTop: 2 },
  notesText:     { color: "#8FB8C4", fontSize: 12, marginTop: 4 },

  emptyWrap:     { alignItems: "center", marginTop: 60, paddingHorizontal: 20 },
  emptyText:     { color: "#4A6070", fontSize: 14, marginTop: 12, textAlign: "center" },
  emptySubText:  { color: "#2A4050", fontSize: 12, marginTop: 6, textAlign: "center" },
  retryBtn:      { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#0D1F2D", borderRadius: 10, borderWidth: 1, borderColor: "#1A3040" },
  retryText:     { color: "#00D8E6", fontSize: 13, fontWeight: "700" },
});

