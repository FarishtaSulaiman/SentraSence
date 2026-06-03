import React, { useCallback, useEffect, useState, useRef } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { Audio } from "expo-av";
import {useAuth} from "@/contexts/AuthContext";
import { API } from "@/config/api";
import { Ionicons } from "@expo/vector-icons";

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
    // Stoppa tidigare ljud om det är ett annat
    if (soundRef.current && playingId !== item.id) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    // Om samma ljud redan är laddat → bara spela
    if (soundRef.current && playingId === item.id) {
      await soundRef.current.playAsync();
      return;
    }

    // Annars ladda nytt ljud
    const { sound } = await Audio.Sound.createAsync(
      { uri: item.url },
      { shouldPlay: true }
    );

    soundRef.current = sound;
    setPlayingId(item.id);

    sound.setOnPlaybackStatusUpdate((status) => {
      if ("didJustFinish" in status && status.didJustFinish) {
  setPlayingId(null);
}
    });
  } catch (err) {
    console.error("Playback error:", err);
  }
}


  function renderItem({ item }: { item: AudioItem }) {
    const isPlaying = item.id === playingId;

    async function togglePlay(item: AudioItem) {
  // Om samma ljud spelas - stoppa
  if (soundRef.current && playingId === item.id) {
    await soundRef.current.stopAsync();
    await soundRef.current.unloadAsync();
    soundRef.current = null;
    setPlayingId(null);
    return;
  }
  play(item);
}

return (
      <View style={styles.audioCard}>
  <View style={styles.audioLeft}>
    <View style={styles.audioIconWrap}>
      <Ionicons name="mic-outline" size={18} color="#00D8E6" />
    </View>

    <View style={{ marginLeft: 12, flex: 1 }}>
      <Text
  style={styles.audioName}
  numberOfLines={1}
  ellipsizeMode="tail"
>
  {item.id}.m4a
</Text>
      <Text style={styles.audioDate}>
        {new Date(item.createdAt).toLocaleString("sv-SE")}
      </Text>
    </View>
  </View>

  <Pressable style={styles.playBtn} onPress={() => togglePlay(item)}>
    <Ionicons
      name={isPlaying ? "stop" : "play"}
      size={18}
      color="#08141D"
    />
  </Pressable>
</View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ljudhistorik</Text>

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
  container: { flex: 1, padding: 20, backgroundColor: "#08141D" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, marginTop: 20, color: "#FFFFFF" },
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

  audioCard: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "#0D1F2D",
  borderRadius: 14,
  padding: 14,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "#1A3040",
},

audioLeft: {
  flexDirection: "row",
  alignItems: "center",
  flex: 1, // ← lägg till detta
},

audioIconWrap: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: "#0D1F2D",
  borderWidth: 1,
  borderColor: "#1A3040",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 2, // ← sänker ringen lite
},

audioName: {
  color: "#FFFFFF",
  fontSize: 14,
  fontWeight: "700",
},

audioDate: {
  color: "#4A6070",
  fontSize: 12,
  marginTop: 2,
},

playBtn: {
  backgroundColor: "#00D8E6",
  width: 40,
  height: 40,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
},

});
