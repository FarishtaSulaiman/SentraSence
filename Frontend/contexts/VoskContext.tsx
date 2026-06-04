import { createContext } from "react";

export type VoskContextType = {
  isReady: boolean;
  isListening: boolean;
  // start: () => void;
  // stop: () => void;
  start: () => Promise<void>;
  stop: () => Promise<void>;

  lastResult: string;
  lastPartial: string;

  setLastResult: (value: string) => void;
  setLastPartial: (value: string) => void;

  reset: () => void;
};

export const VoskContext = createContext<VoskContextType | null>(null);