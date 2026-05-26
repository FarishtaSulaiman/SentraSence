import { useContext } from "react";
import { VoskContext } from "../contexts/VoskContext";

export function useVoskService() {
  const ctx = useContext(VoskContext);
  if (!ctx) throw new Error("useVoskService must be used inside VoskProvider");
  return ctx;
}