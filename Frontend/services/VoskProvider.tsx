import React, { useEffect, useState } from "react";
import { VoskContext } from "../contexts/VoskContext";
import { useVosk } from "../hooks/useVosk";

type Props = {
  children: React.ReactNode;
};

export function VoskProvider({ children }: Props) {
  // ­ƒöÑ Global transkribering
  const [lastResult, setLastResult] = useState("");
  const [lastPartial, setLastPartial] = useState("");

  // ­ƒöÑ Reset-funktion som Step2 beh├Âver
  const reset = () => {
    setLastResult("");
    setLastPartial("");
  };

  const {
    isReady,
    isListening,
    start,
    stop,
  } = useVosk("model-sv-rhasspy-0.15", {
    onResult: (text) => {
      console.log("Vosk FINAL:", text);
      setLastResult(text);
      setLastPartial("");
    },
    onPartialResult: (text) => {
      console.log("Vosk PARTIAL:", text);
      setLastPartial(text);
    },
    onError: (err) => {
      console.log("Vosk ERROR:", err);
    },
  });

  // Starta Vosk automatiskt n├ñr modellen ├ñr redo
  useEffect(() => {
    if (isReady && !isListening) {
      start();
    }
  }, [isReady, isListening, start]);

  return (
    <VoskContext.Provider
      value={{
        isReady,
        isListening,
        start,
        stop,
        lastResult,
        lastPartial,
        setLastResult,
        setLastPartial,
        reset, 
      }}
    >
      {children}
    </VoskContext.Provider>
  );
}
