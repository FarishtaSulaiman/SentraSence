import React, { useCallback, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl, 
  Alert, 
  Pressable 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";
import { API } from "@/config/api";

type UserNotification = {
  userNotificationId: string;
  userId: string;
  alarmEventId?: string | null;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    console.log("Notifications screen user:", user);
    console.log("Notifications API:", API);
    console.log(
      "Fetching notifications from:",
      user?.userId
        ? `${API}/api/notifications/user/${user.userId}`
        : "No userId",
    );
    if (!user?.userId) {
      setNotifications([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const response = await fetch(
        `${API}/api/notifications/user/${user.userId}`,
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Failed to fetch notifications:",
          response.status,
          errorText,
        );
        return;
      }

      const data = await response.json();
      console.log("Fetched notifications:", data);
      
      setNotifications(data);
    } catch (error) {
      console.error("Error while fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchNotifications();
    }, [user?.userId]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
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
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Notiser</Text>
        <Text style={styles.sub}>Dina senaste notifikationer visas här.</Text>

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Inga notiser än</Text>
            <Text style={styles.emptyText}>
              När ett larm aktiveras eller uppdateras visas det här.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {notifications.map((notification) => {
              const canCancel = notification.type === "alarm_triggered";

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
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{notification.title}</Text>
                    <Text style={styles.time}>
                      {formatDate(notification.createdAt)}
                    </Text>
                  </View>

                  <Text style={styles.message}>{notification.message}</Text>

                  {canCancel ? (
                    <Text style={styles.actionText}>
                      Tryck för att avbryta larmet
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
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
  safe: {
    flex: 1,
    backgroundColor: "#08141D",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 28,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
  },
  sub: {
    color: "#8FA6B5",
    fontSize: 13,
    marginBottom: 22,
  },
  loader: {
    marginTop: 32,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: "#102533",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#15394A",
  },
  unreadCard: {
    borderColor: "#00D8E6",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
  },
  time: {
    color: "#00D8E6",
    fontSize: 11,
    fontWeight: "700",
  },
  message: {
    color: "#B7C8D4",
    fontSize: 13,
    lineHeight: 18,
  },
  emptyBox: {
    backgroundColor: "#102533",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#15394A",
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
  },
  emptyText: {
    color: "#8FA6B5",
    fontSize: 13,
    lineHeight: 18,
  },
  clickableCard: {
    borderColor: "#00D8E6",
  },
  actionText: {
    color: "#00D8E6",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 10,
  },
});
