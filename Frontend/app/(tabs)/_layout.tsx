import { Tabs } from "expo-router";
import React from "react";
import SentraTabBar from "@/components/SentraTabBar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <SentraTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="contacts" />
      <Tabs.Screen name="notifications" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
