import React from "react";
import { Pressable, Text, StyleSheet, View, Image } from "react-native";

type GoogleAuthButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function GoogleAuthButton({
  title,
  onPress,
  disabled = false,
}: GoogleAuthButtonProps) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.content}>
        <Image
          source={require("@/assets/images/google-logo.png")}
          style={styles.icon}
        />

        <Text style={styles.text}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "78%",
    height: 42,
    borderRadius: 21,

    borderWidth: 1.5,
    borderColor: "#00D8E6",

    backgroundColor: "rgba(2, 12, 20, 0.55)",

    justifyContent: "center",
    alignItems: "center",

    marginTop: 10,
    marginBottom: 14,

    shadowColor: "#00D8E6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    marginRight: 8, 
  },

  text: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  disabled: {
    opacity: 0.5,
  },
});
