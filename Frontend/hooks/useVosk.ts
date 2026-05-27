import { useCallback, useEffect, useRef, useState } from "react";
import * as Vosk from "react-native-vosk";

type VoskOptions = {
  onResult?: (text: string) => void;
  onPartialResult?: (text: string) => void;
  onError?: (err: any) => void;
  onTimeout?: () => void;
};

export function useVosk(modelPath: string, options: VoskOptions = {}) {
  const [isReady, setIsReady] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const modelLoaded = useRef(false);

  // Stabil referens till callbacks
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Ladda modellen en gång
  useEffect(() => {
    async function load() {
      try {
        const normalizedModelPath = modelPath.replace(/^\/?assets\//i, "");
        Vosk.loadModel("model-sv-rhasspy-0.15");
        modelLoaded.current = true;
        setIsReady(true);
        console.log("Vosk: Model loaded", { modelPath, normalizedModelPath });
      } catch (err) {
        console.error("Vosk: Failed to load model", err);
        optionsRef.current.onError?.(err);
      }
    }

    load();

    return () => {
      if (modelLoaded.current) {
        Vosk.unload();
        console.log("Vosk: Model unloaded");
      }
    };
  }, [modelPath]);

  // Event listeners
  useEffect(() => {
    const sub1 = Vosk.onResult((res) => {
      console.log("Vosk result:", res);
      optionsRef.current.onResult?.(res);
    });

        let last = 0;

const sub2 = Vosk.onPartialResult((res) => {
  const now = Date.now();
  if (now - last < 150) return; // throttla event-storm
  last = now;

  optionsRef.current.onPartialResult?.(res);
});

    const sub3 = Vosk.onError((err) => {
      console.error("Vosk error:", err);
      optionsRef.current.onError?.(err);
    });

    const sub4 = Vosk.onTimeout(() => {
      console.log("Vosk timeout");
      optionsRef.current.onTimeout?.();
    });

    return () => {
      sub1.remove();
      sub2.remove();
      sub3.remove();
      sub4.remove();
    };
  }, []);

  // Start listening
const start = useCallback(async () => {
  if (!modelLoaded.current) return;

  try {
    await Vosk.start();
    setIsListening(true);
    console.log("Vosk: Listening started");
  } catch (err) {
    console.error("Vosk: Failed to start", err);
    optionsRef.current.onError?.(err);
  }
}, []);

const stop = useCallback(async () => {
  try {
    await Vosk.stop();
    setIsListening(false);
    console.log("Vosk: Listening stopped");
  } catch (err) {
    console.error("Vosk: Failed to stop", err);
    optionsRef.current.onError?.(err);
  }
}, []);


  return {
    isReady,
    isListening,
    start,
    stop,
  };
}