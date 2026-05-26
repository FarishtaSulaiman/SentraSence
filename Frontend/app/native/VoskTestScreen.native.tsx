import React, { useEffect } from "react";
import { View, Text } from "react-native";
import * as Vosk from "react-native-vosk";

export default function VoskTestScreen() {
  useEffect(() => {
    async function init() {
      try {
        console.log("Vosk object:", Vosk);

        await Vosk.loadModel("model-sv-se");
        console.log("Modellen laddades!");

        await Vosk.start({
          grammar: ["hjälp", "hjälp mig", "[unk]"],
        });

        Vosk.onResult((res) => {
          console.log("Resultat:", res);
        });
      } catch (e) {
        console.error("Vosk error:", e);
      }
    }

    init();
  }, []);

  return (
    <View>
      <Text>Vosk Test</Text>
    </View>
  );
}
