import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Tab = {
  name: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconActive: React.ComponentProps<typeof Ionicons>["name"];
};

const TABS: Tab[] = [
  { name: "index", label: "Hem", icon: "home-outline", iconActive: "home" },
  { name: "contacts", label: "Kontakter", icon: "people-outline", iconActive: "people" },
  { name: "notifications", label: "Notiser", icon: "notifications-outline", iconActive: "notifications" },
  { name: "history", label: "Historik", icon: "time-outline", iconActive: "time" },
  { name: "settings", label: "Inställningar", icon: "settings-outline", iconActive: "settings" },
];

export default function SentraTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: state.routes[index]?.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(tab.name);
          }
        };

        return (
          <Pressable key={tab.name} style={styles.tab} onPress={onPress}>
            <Ionicons
              name={isFocused ? tab.iconActive : tab.icon}
              size={22}
              color={isFocused ? "#00D8E6" : "#3A5060"}
            />
            <Text style={[styles.label, isFocused && styles.labelActive]}>
              {tab.label}
            </Text>
            {isFocused && <View style={styles.activeDot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#08141D",
    borderTopWidth: 1,
    borderTopColor: "#122030",
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    position: "relative",
  },
  label: {
    color: "#3A5060",
    fontSize: 9,
    fontWeight: "600",
  },
  labelActive: {
    color: "#00D8E6",
  },
  activeDot: {
    position: "absolute",
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#00D8E6",
  },
});
