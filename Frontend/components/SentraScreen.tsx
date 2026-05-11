import React from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

type Props = {
  children: React.ReactNode;
};

export default function SentraScreen({ children }: Props) {
  return (
    <View style={styles.root}>
      <ImageBackground
        source={require("@/assets/images/Background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.inner}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            alwaysBounceHorizontal={false}
          >
            {children}
          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020B14",
  },

  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 10, 20, 0.28)",
    alignItems: "center",
  },

  scrollView: {
    flex: 1,
    width: "100%",
  },

  inner: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 400,
    paddingHorizontal: 28,
    paddingTop: 70,
    paddingBottom: 48,
    alignItems: "center",
  },
});
