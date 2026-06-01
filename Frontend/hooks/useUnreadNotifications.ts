import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { fetchUnreadNotificationsCount } from "@/services/notificationService";

export function useUnreadNotifications(userId?: string) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await fetchUnreadNotificationsCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to refresh unread notifications:", error);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      refreshUnreadCount();
    }, [refreshUnreadCount]),
  );

  return {
    unreadCount,
    refreshUnreadCount,
  };
}
