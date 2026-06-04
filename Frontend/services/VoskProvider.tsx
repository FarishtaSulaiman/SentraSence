import React, { useCallback, useEffect, useRef, useState } from "react";
import { VoskContext } from "../contexts/VoskContext";
import { useVosk } from "../hooks/useVosk";
import { codewordManager } from "./codewordManager";

type Props = {
  children: React.ReactNode;
};

export function VoskProvider({ children }: Props) {
  const [lastResult, setLastResult] = useState("");
  const [lastPartial, setLastPartial] = useState("");

  const hasAutoStartedRef = useRef(false);

  const reset = () => {
    setLastResult("");
    setLastPartial("");
  };

  const {
    isReady,
    isListening,
    start: rawStart,
    stop: rawStop,
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

  const start = useCallback(async () => {
    codewordManager.setActive(true);
    await rawStart();
  }, [rawStart]);

  const stop = useCallback(async () => {
    codewordManager.setActive(false);
    await rawStop();
  }, [rawStop]);

  // Starta Vosk automatiskt EN gang nar modellen ar redo
  useEffect(() => {
    if (isReady && !hasAutoStartedRef.current) {
      hasAutoStartedRef.current = true;
      void start();
    }
  }, [isReady, start]);

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
