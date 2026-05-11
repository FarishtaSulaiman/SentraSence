import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { router } from "expo-router";
import SentraScreen from "@/components/SentraScreen";
import SentraLogo from "@/components/SentraLogo";
import SentraButton from "@/components/SentraButton";

const slides = [
  {
    title: "Välkommen till SentraSense",
    description:
      "Din trygghetsapp vid nödsituationer. Snabb, säker och AI-driven hjälp när du behöver det som mest.",
  },
  {
    title: "AI-baserad trygghet",
    description:
      "SentraSense använder AI för att snabbt upptäcka och agera vid nödsituationer.",
  },
  {
    title: "Alltid nära till hjälp",
    description:
      "Med ett tryck kan du larma dina kontakter och få hjälp direkt.",
  },
];

export default function InfoSlides() {
  const [current, setCurrent] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const nextSlide = () => {
    if (current === slides.length - 1) {
      router.push("/register");
      return;
    }

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      setCurrent((prev) => prev + 1);
    }, 160);
  };

  return (
    <SentraScreen>
      <View style={styles.page}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.logoWrapper}>
            <SentraLogo size="large" />
          </View>

          <Text style={styles.title}>{slides[current].title}</Text>

          <Text style={styles.description}>{slides[current].description}</Text>
        </Animated.View>

        <View style={styles.bottomContent}>
          <SentraButton
            title={current < slides.length - 1 ? "Nästa" : "Skapa konto"}
            onPress={nextSlide}
          />

          <View style={styles.dots}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, current === i && styles.activeDot]}
              />
            ))}
          </View>
        </View>
      </View>
    </SentraScreen>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },

  content: {
    width: "100%",
    alignItems: "center",
  },

  logoWrapper: {
    marginBottom: -95,
    alignItems: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 14,
  },

  description: {
    color: "#DDEAF0",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 300,
  },

  bottomContent: {
    marginTop: 20,
    alignItems: "center",
    width: "100%",
  },

  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 24,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },

  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00E6F6",
    shadowColor: "#00E6F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
});