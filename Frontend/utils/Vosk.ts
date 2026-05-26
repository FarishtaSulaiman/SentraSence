import { NativeModules, NativeEventEmitter, NativeEventSubscription } from 'react-native';

type VoskCallback = (text: string) => void;

const { VoskModule } = NativeModules;

const emitter = new NativeEventEmitter(VoskModule);

let listeners: NativeEventSubscription[] = [];

export function initializeVosk() {
  return VoskModule.initialize();
}

export function startListening(
  onPartial: VoskCallback,
  onResult: VoskCallback
) {
  stopListening();

  listeners.push(
    emitter.addListener('voskPartial', (event) => {
      if (event?.text) onPartial(event.text);
    })
  );

  listeners.push(
    emitter.addListener('voskResult', (event) => {
      if (event?.text) onResult(event.text);
    })
  );

  VoskModule.startListening();
}

export function stopListening() {
  listeners.forEach((l) => l.remove());
  listeners = [];
  VoskModule.stopListening();
}