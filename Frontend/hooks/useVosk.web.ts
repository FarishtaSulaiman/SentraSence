// Vosk är inte tillgängligt på webben – returnerar no-ops
export function useVosk(_modelPath: string, _options = {}) {
  return {
    isReady: false,
    isListening: false,
    start: async () => {},
    stop: async () => {},
  };
}
