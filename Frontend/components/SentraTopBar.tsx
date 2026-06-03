import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SentraTopBar() {
  const [time, setTime] = useState(getTime());

  function getTime() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, "0");
    const m = now.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  }

  useEffect(() => {
    const interval = setInterval(() => setTime(getTime()), 10000);
    return () => clearInterval(interval);
  }, []);

  // ⛔ Hooks är redan körda — nu får vi returnera villkorligt
  if (Platform.OS === "android" || Platform.OS === "ios") {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{time}</Text>

      <View style={styles.right}>
        {/* Signal */}
        <View style={styles.signalWrap}>
          {[3, 5, 7, 9].map((h, i) => (
            <View key={i} style={[styles.signalBar, { height: h }]} />
          ))}
        </View>

        {/* Wifi */}
        <Ionicons name="wifi" size={13} color="#FFFFFF" style={{ marginLeft: 5 }} />

        {/* Battery */}
        <View style={styles.batteryWrap}>
          <View style={styles.batteryBody}>
            <View style={styles.batteryFill} />
          </View>
          <View style={styles.batteryTip} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 6,
    backgroundColor: "transparent",
  },
  time: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  signalWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  signalBar: {
    width: 3,
    borderRadius: 1,
    backgroundColor: "#FFFFFF",
  },
  batteryWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
  },
  batteryBody: {
    width: 20,
    height: 10,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    borderRadius: 2.5,
    padding: 1.5,
    justifyContent: "center",
  },
  batteryFill: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
  },
  batteryTip: {
    width: 2,
    height: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
    marginLeft: 1,
  },
});
