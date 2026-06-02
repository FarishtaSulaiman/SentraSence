import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { API } from "@/config/api";
import {
  fetchUserNotifications,
  markAllNotificationsAsRead,
  UserNotification,
} from "@/services/notificationService";
import SentraTopBar from "@/components/SentraTopBar";

type AlarmEvent = {
  alarmEventId: string;
  status: "Active" | "Confirmed" | "Cancelled";
};

const VISIBLE_NOTIFICATION_TYPES = new Set([
  "alarm_triggered",
  "contacts_notified",
  "alarm_cancelled",
]);

const NOTIFICATION_META: Record<
  string,
  {
    color: string;
    label: string;
    icon: React.ComponentProps<typeof Ionicons>["name"];
  }
> = {
  alarm_triggered: {
    color: "#E63946",
    label: "Larm aktiverat",
    icon: "warning",
  },
  contacts_notified: {
    color: "#F39C12",
    label: "Kontakter meddelade",
    icon: "people",
  },
  alarm_cancelled: {
    color: "#2ECC71",
    label: "Larm avbrutet",
    icon: "close-circle",
  },
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [alarmStatuses, setAlarmStatuses] = useState<
    Record<string, AlarmEvent["status"]>
  >({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const fetchNotifications = useCallback(async () => {
    if (!user?.userId) {
      setNotifications([]);
      setAlarmStatuses({});
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const [notificationData, historyData] = await Promise.all([
        fetchUserNotifications(user.userId),
        fetch(`${API}/api/alarm/history/${user.userId}`).then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch alarm history");
          }

          return response.json() as Promise<AlarmEvent[]>;
        }),
      ]);

      setNotifications(
        notificationData.filter((notification) =>
          VISIBLE_NOTIFICATION_TYPES.has(notification.type),
        ),
      );
      setAlarmStatuses(
        Object.fromEntries(
          historyData.map((event) => [event.alarmEventId, event.status]),
        ),
      );
    } catch (error) {
      console.error("Error while fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.userId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchNotifications();
    }, [fetchNotifications]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.userId || unreadCount === 0) {
      return;
    }

    try {
      await markAllNotificationsAsRead(user.userId);
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
    } catch (error) {
      console.error("Error while marking notifications as read:", error);
      Alert.alert("Fel", "Kunde inte markera notiser som lästa.");
    }
  };

  const cancelAlarm = async (alarmEventId?: string | null) => {
    if (!alarmEventId) return;

    Alert.alert("Avbryt larm?", "Vill du avbryta detta larm?", [
      { text: "Nej", style: "cancel" },
      {
        text: "Ja, avbryt",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(
              `${API}/api/alarm/${alarmEventId}/cancel`,
              { method: "POST" },
            );

            if (!response.ok) {
              const errorText = await response.text();
              console.error(
                "Failed to cancel alarm:",
                response.status,
                errorText,
              );
              Alert.alert("Fel", "Kunde inte avbryta larmet.");
              return;
            }

            Alert.alert("Larm avbrutet", "Larmet har avbrutits.");
            await fetchNotifications();
          } catch (error) {
            console.error("Error while cancelling alarm:", error);
            Alert.alert("Fel", "Något gick fel när larmet skulle avbrytas.");
          }
        },
      },
    ]);
  };

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
        <Text style={styles.pageTitle}>Notiser</Text>
        <Text style={styles.pageSub}>Dina senaste larmnotiser</Text>

        {unreadCount > 0 ? (
          <Pressable style={styles.markReadBtn} onPress={handleMarkAllAsRead}>
            <Ionicons name="checkmark-done" size={16} color="#00D8E6" />
            <Text style={styles.markReadText}>Markera alla som lästa</Text>
          </Pressable>
        ) : null}

        {loading ? (
          <ActivityIndicator color="#00D8E6" style={styles.loader} />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons
              name="notifications-off-outline"
              size={36}
              color="#4A6070"
            />
            <Text style={styles.emptyText}>Inga notiser än.</Text>
            <Text style={styles.emptySubText}>
              Larm aktiverat, kontakter meddelade och larm avbrutet visas här.
            </Text>
          </View>
        ) : (
          notifications.map((notification) => {
            const canCancel =
              notification.type === "alarm_triggered" &&
              alarmStatuses[notification.alarmEventId ?? ""] === "Active";
            const meta =
              NOTIFICATION_META[notification.type] ??
              NOTIFICATION_META.alarm_triggered;

            return (
              <Pressable
                key={notification.userNotificationId}
                disabled={!canCancel}
                onPress={() => cancelAlarm(notification.alarmEventId)}
                style={[
                  styles.card,
                  !notification.isRead && styles.unreadCard,
                  canCancel && styles.clickableCard,
                ]}
              >
                <View style={styles.cardLeft}>
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: meta.color + "22" },
                    ]}
                  >
                    <Ionicons name={meta.icon} size={20} color={meta.color} />
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardTitle}>{notification.title}</Text>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: meta.color + "22" },
                      ]}
                    >
                      <Text style={[styles.badgeText, { color: meta.color }]}>
                        {meta.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.timeText}>
                    {formatDate(notification.createdAt)}
                  </Text>
                  <Text style={styles.message}>{notification.message}</Text>

                  {canCancel ? (
                    <Text style={styles.actionText}>
                      Tryck för att avbryta larmet
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleString("sv-SE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#08141D" },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  pageTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  pageSub: { color: "#4A6070", fontSize: 13, marginBottom: 24 },
  markReadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    marginBottom: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#0D1F2D",
    borderWidth: 1,
    borderColor: "#1A3040",
  },
  markReadText: {
    color: "#00D8E6",
    fontSize: 12,
    fontWeight: "700",
  },
  loader: { marginTop: 40 },
  card: {
    flexDirection: "row",
    backgroundColor: "#0D1F2D",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1A3040",
  },
  cardLeft: { marginRight: 12, justifyContent: "flex-start" },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1 },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  unreadCard: {
    borderColor: "#00D8E6",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  timeText: {
    color: "#4A6070",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 4,
  },
  message: {
    color: "#8FB8C4",
    fontSize: 12,
    marginTop: 4,
  },
  emptyWrap: { alignItems: "center", marginTop: 60, paddingHorizontal: 20 },
  emptyText: {
    color: "#4A6070",
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  emptySubText: {
    color: "#2A4050",
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
  clickableCard: {
    borderColor: "#00D8E6",
  },
  actionText: {
    color: "#00D8E6",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },
});
