import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Contacts() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Kontakter</Text>
        <Text style={styles.sub}>Dina nödkontakter visas här.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#08141D" },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { color: "#FFFFFF", fontSize: 20, fontWeight: "800", marginBottom: 8 },
  sub: { color: "#4A6070", fontSize: 13 },
});
