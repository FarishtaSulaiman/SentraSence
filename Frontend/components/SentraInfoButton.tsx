// components/SentraInfoButton.tsx

import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type SentraInfoButtonProps = {
  onPress: () => void;
};

export default function SentraInfoButton({ onPress }: SentraInfoButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <Text style={styles.text}>i</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6FBFCC",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  buttonPressed: {
    opacity: 0.6,
  },

  text: {
    color: "#6FBFCC",
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 12,
  },
});
