import { useEffect } from "react";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import LandingPage from "./landingpage";

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/(tabs)" as any);
    }
  }, [loading, user]);

  if (loading) return null;

  return <LandingPage />;
}
