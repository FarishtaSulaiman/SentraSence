import React, { useCallback, useEffect, useState, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import {useAuth} from "@/contexts/AuthContext";
import { API } from "@/config/api";

type AudioItem = {
  id: string;
  url: string;
  createdAt: string;
};

export default function AudioHistoryScreen() {
  const { user } = useAuth();
  const userId = user?.userId;

  const [items, setItems] = useState<AudioItem[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const fetchAudioList = useCallback(async () => {
  if (!userId) return;

  const res = await fetch(`${API}/api/audio/history/${userId}`);

  const text = await res.text();
  console.log("RAW RESPONSE:", text);
  console.log("USER ID:", userId);
  console.log("API VALUE:", API);
  console.log("ENV VALUE:", process.env.EXPO_PUBLIC_API_URL);
  console.log("HTTP STATUS:", res.status);

  if (!res.ok) {
    console.error("Audio history request failed:", res.status, text);
    return;
  }

  try {
    const data = JSON.parse(text);
    const normalizedItems = Array.isArray(data)
      ? data.map((item: any) => ({
          id: item.id ?? item.Id,
          url: item.url ?? item.Url,
          createdAt: item.createdAt ?? item.CreatedAt,
        }))
      : [];
    setItems(normalizedItems);
  } catch (err) {
    console.error("JSON parse error:", err);
  }
}, [userId]);

  useEffect(() => {
    if (!userId) return; 
    fetchAudioList();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [fetchAudioList, userId]); 

  async function play(item: AudioItem) {
    try {
      // Stoppa tidigare ljud
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: item.url },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setPlayingId(item.id);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          setPlayingId(null);
        }
      });
    } catch (err) {
      console.error("Playback error:", err);
    }
  }

  function renderItem({ item }: { item: AudioItem }) {
    const isPlaying = item.id === playingId;

    return (
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.filename}>🎤 {item.id}.m4a</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => play(item)}
        >
          <Text style={styles.buttonText}>
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio History</Text>

      <FlatList
        data={items}
        keyExtractor={(x) => x.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  filename: { fontSize: 16, fontWeight: "600" },
  date: { fontSize: 12, color: "#666" },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
