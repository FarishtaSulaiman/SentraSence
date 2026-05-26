import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Web stub – Vosk (kodordslyssning) är ej tillgänglig i webbläsare
export default function VoskTestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Kodordslyssning är inte tillgänglig i webbläsaren.{"\n"}
        Använd appen på mobil för att träna och aktivera kodordet.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1A25",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  text: {
    color: "#8AAABB",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
  },
});
