import { Audio } from "expo-av";

let recording: Audio.Recording | null = null;

export async function startRecording(): Promise<void> {
  try {
    console.log("Starting recording...");

    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Microphone permission not granted");
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    recording = new Audio.Recording();

    await recording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    await recording.startAsync();
    console.log("Recording started");
  } catch (error) {
    console.error("startRecording error:", error);
  }
}

export async function stopRecording(): Promise<string | undefined> {
  try {
    if (!recording) {
      console.warn("No active recording");
      return;
    }

    console.log("Stopping recording...");
    await recording.stopAndUnloadAsync();

    const uri = recording.getURI();
    console.log("Recording saved at:", uri);

    recording = null;

    return uri ?? undefined;
  } catch (error) {
    console.error("stopRecording error:", error);
    recording = null;
  }
}
