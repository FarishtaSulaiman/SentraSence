import React, { useEffect, useState } from "react";
import { VoskContext } from "../contexts/VoskContext";
import { useVosk } from "../hooks/useVosk";
import { codewordManager } from "./codewordManager";

type Props = {
  children: React.ReactNode;
};

export function VoskProvider({ children }: Props) {
  //Global transkribering
  const [lastResult, setLastResult] = useState("");
  const [lastPartial, setLastPartial] = useState("");

  // Reset-funktion som Step2 beh├Âver
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

      codewordManager.onPartial(text);
    },
    onError: (err) => {
      console.log("Vosk ERROR:", err);
    },
  });

  // Starta Vosk automatiskt när modellen är redo
  useEffect(() => {
    if (isReady && !isListening) {
      start();
      codewordManager.setActive(true);
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
