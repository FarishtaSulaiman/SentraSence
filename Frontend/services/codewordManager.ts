import { router } from "expo-router";

type Listener = (text: string) => void;

class CodewordManager {
  private codeword = "";
  private active = true; 
  private triggerEnabled = true; 
  private lastTrigger = 0;
  private cooldownMs = 3000;
  private listeners: Listener[] = [];

  setCodeword(word: string) {
    this.codeword = word?.toLowerCase().trim() || "";
  }

  setActive(active: boolean) {
    this.active = active;
  }

  setTriggerEnabled(enabled: boolean) {
    this.triggerEnabled = enabled;
    console.log("Trigger enabled:", enabled);
  }

  onPartial(text: string) {
  console.log("CODEWORD MANAGER RECEIVED:", text);

  this.listeners.forEach((l) => l(text));

  console.log("PRE-CHECK:", {
    active: this.active,
    codeword: this.codeword,
    triggerEnabled: this.triggerEnabled,
  });

  if (!this.active || !this.codeword) return;

  const t = text.toLowerCase();

  console.log("MATCH CHECK:", {
    text: t,
    codeword: this.codeword,
    includes: t.includes(this.codeword),
    prefix: this.codeword.slice(0, 4),
    prefixMatch: t.includes(this.codeword.slice(0, 4)),
  });

  if (this.matches(t)) {
    this.triggerAlarm();
    console.log("TRIGGER FIRED:", {
      active: this.active,
      triggerEnabled: this.triggerEnabled,
      codeword: this.codeword,
    });
  }
}

  private matches(text: string) {
    if (!this.codeword) return false;

    if (text.includes(this.codeword)) return true;

    if (this.codeword.length >= 4 && text.includes(this.codeword.slice(0, 4))) {
      return true;
    }

    return false;
  }

  private triggerAlarm() {
    if (!this.triggerEnabled) return;

    const now = Date.now();
    if (now - this.lastTrigger < this.cooldownMs) return;
    this.lastTrigger = now;

    router.push("/alarm");
  }

  addListener(fn: Listener) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }
}

export const codewordManager = new CodewordManager();
