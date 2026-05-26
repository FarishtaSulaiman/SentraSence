import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useVoskService } from "@/hooks/useVoskService";

//const API = "http://localhost:5255";
const API = "http://192.168.50.202:5255";
const CONSENT_VERSION = "1.0";

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <View style={styles.stepRow}>
      {[1, 2, 3, 4].map((step, i) => {
        const done = step < current;
        const active = step === current;
        return (
          <React.Fragment key={step}>
            <View
              style={[
                styles.stepCircle,
                active && styles.stepCircleActive,
                done && styles.stepCircleDone,
              ]}
            >
              {done ? (
                <Ionicons name="checkmark" size={12} color="#00D8E6" />
              ) : (
                <Text style={[styles.stepNum, active && styles.stepNumActive]}>
                  {step}
                </Text>
              )}
            </View>
            {i < 3 && (
              <View style={[styles.stepLine, done && styles.stepLineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ─── Expandable info card ──────────────────────────────────────────────────────

function InfoCard({
  icon,
  title,
  desc,
  expanded,
  expandedContent,
  value,
  onToggle,
  hasToggle,
  onExpand,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  desc: string;
  expanded: boolean;
  expandedContent: React.ReactNode;
  value?: boolean;
  onToggle?: () => void;
  hasToggle: boolean;
  onExpand: () => void;
}) {
  return (
    <View style={styles.permCard}>
      <Pressable style={styles.permCardHeader} onPress={onExpand}>
        <View style={styles.permIconWrap}>
          <Ionicons name={icon} size={20} color="#00D8E6" />
        </View>
        <View style={styles.permText}>
          <Text style={styles.permTitle}>{title}</Text>
          <Text style={styles.permDesc}>{desc}</Text>
        </View>
        {hasToggle ? (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: "#1C3040", true: "#00A8B4" }}
            thumbColor={value ? "#00D8E6" : "#4A6070"}
          />
        ) : (
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#4A6070"
          />
        )}
      </Pressable>
      {expanded && (
        <View style={styles.permExpanded}>{expandedContent}</View>
      )}
    </View>
  );
}

// ─── STEP 1: Samtycken (GDPR-fullständig) ─────────────────────────────────────

function Step1({ onNext }: { onNext: () => void }) {
  const { user } = useAuth();
  const [mic, setMic] = useState(true);
  const [location, setLocation] = useState(true);
  const [audioRec, setAudioRec] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = (key: string) =>
    setExpanded((prev) => (prev === key ? null : key));

  const canContinue = acceptedTerms && acceptedPrivacy;

  const handleNext = async () => {
    if (!canContinue) return;
    // Under byggtid (user är null) – hoppar över API-anrop
    if (!user) { onNext(); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users/${user.userId}/consents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consentVersion: CONSENT_VERSION,
          consents: [
            { consentType: "microphone", granted: mic },
            { consentType: "location", granted: location },
            { consentType: "audio_recording", granted: audioRec },
            { consentType: "terms_of_service", granted: true },
            { consentType: "privacy_policy", granted: true },
          ],
        }),
      });
      if (!res.ok) throw new Error();
      onNext();
    } catch {
      Alert.alert("Fel", "Kunde inte spara samtycken. Kontrollera anslutningen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.scrollFlex}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <StepIndicator current={1} />
      <Text style={styles.title}>Aktivera ditt skydd</Text>
      <Text style={styles.subtitle}>
        SentraSense behöver ditt samtycke för att fungera. All behandling sker
        enligt GDPR och EU:s dataskyddslagstiftning.
      </Text>

      <View style={styles.cardList}>
        <InfoCard
          icon="mic"
          title="Mikrofonåtkomst"
          desc="Lokal AI-lyssning efter kodord på din enhet."
          expanded={expanded === "mic"}
          onExpand={() => toggle("mic")}
          value={mic}
          onToggle={() => setMic((v) => !v)}
          hasToggle
          expandedContent={
            <Text style={styles.expandText}>
              <Text style={styles.expandBold}>Vad:</Text> Mikrofonen lyssnar ENBART lokalt
              på din enhet. Inget ljud skickas till våra servrar under normal drift.{"\n\n"}
              <Text style={styles.expandBold}>Varför:</Text> För att detektera ditt kodord
              och aktivera larm utan att du behöver trycka på en knapp.{"\n\n"}
              <Text style={styles.expandBold}>Lagringstid:</Text> Ingen – all bearbetning
              sker i realtid och lagras inte.{"\n\n"}
              <Text style={styles.expandBold}>Rättslig grund:</Text> Samtycke (Art. 6.1.a GDPR).
              Du kan återkalla detta när som helst i Inställningar.
            </Text>
          }
        />

        <InfoCard
          icon="location"
          title="Platsdelning"
          desc="Din GPS-position delas med nödkontakter vid aktivt larm."
          expanded={expanded === "location"}
          onExpand={() => toggle("location")}
          value={location}
          onToggle={() => setLocation((v) => !v)}
          hasToggle
          expandedContent={
            <Text style={styles.expandText}>
              <Text style={styles.expandBold}>Vad:</Text> Dina GPS-koordinater när ett nödlarm är aktivt.{"\n\n"}
              <Text style={styles.expandBold}>Varför:</Text> För att dina nödkontakter ska kunna lokalisera dig.{"\n\n"}
              <Text style={styles.expandBold}>Mottagare:</Text> Enbart dina registrerade nödkontakter.{"\n\n"}
              <Text style={styles.expandBold}>Lagringstid: </Text>
              <Text style={styles.highlightText}>72 timmar efter att larmet avslutats</Text>
              , sedan raderas data automatiskt.{"\n\n"}
              <Text style={styles.expandBold}>Rättslig grund:</Text> Samtycke (Art. 6.1.a GDPR).
            </Text>
          }
        />

        <InfoCard
          icon="cellular"
          title="Ljudinspelning vid larm"
          desc="30 sek inspelning aktiveras automatiskt när larm utlöses."
          expanded={expanded === "audio"}
          onExpand={() => toggle("audio")}
          value={audioRec}
          onToggle={() => setAudioRec((v) => !v)}
          hasToggle
          expandedContent={
            <Text style={styles.expandText}>
              <Text style={styles.expandBold}>Vad:</Text> En inspelning på upp till 30 sekunder görs vid larm.{"\n\n"}
              <Text style={styles.expandBold}>Varför:</Text> Som bevismaterial och för att hjälpa nödkontakter förstå situationen.{"\n\n"}
              <Text style={styles.expandBold}>Lagring:</Text> Krypterat i Azure-datacenter inom EU/EES.{"\n\n"}
              <Text style={styles.expandBold}>Mottagare:</Text> Enbart dina registrerade nödkontakter.{"\n\n"}
              <Text style={styles.expandBold}>Lagringstid: </Text>
              <Text style={styles.highlightText}>72 timmar som standard</Text>
              . Du kan begära förlängning i upp till 30 dagar (t.ex. för polisutredning) via Inställningar → Mina inspelningar.{"\n\n"}
              <Text style={styles.expandBold}>Rättslig grund:</Text> Samtycke (Art. 6.1.a GDPR). Du kan radera inspelningar direkt i appen.
            </Text>
          }
        />
      </View>

      {/* Datalagring sammanfattning */}
      <View style={styles.retentionBox}>
        <View style={styles.retentionHeader}>
          <Ionicons name="time-outline" size={15} color="#00D8E6" />
          <Text style={styles.retentionTitle}>Automatisk dataradering</Text>
        </View>
        {[
          { label: "Mikrofondata (ambient)", value: "Lagras aldrig" },
          { label: "GPS-position", value: "72 h efter larm" },
          { label: "Ljudinspelning", value: "72 h (förlängningsbar)" },
          { label: "Röstträningssamples", value: "90 dagar" },
          { label: "Nödkontakter", value: "Till du tar bort dem" },
          { label: "Kontouppgifter", value: "Till kontot raderas" },
        ].map((row, i, arr) => (
          <View
            key={row.label}
            style={[styles.retentionRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}
          >
            <Text style={styles.retentionLabel}>{row.label}</Text>
            <Text style={styles.retentionValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      {/* Dina rättigheter */}
      <View style={[styles.infoBox, { marginTop: 8 }]}>
        <Ionicons name="shield-checkmark-outline" size={15} color="#00D8E6" style={{ marginRight: 8, marginTop: 1 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>Dina rättigheter enligt GDPR</Text>
          <Text style={styles.expandText}>
            Du har rätt till tillgång (Art. 15), rättelse (Art. 16), radering
            (Art. 17), begränsning (Art. 18), dataportabilitet (Art. 20) och
            att invända mot behandling (Art. 21).{"\n\n"}
            Samtycke kan återkallas när som helst via Inställningar utan att det
            påverkar behandling som skett dessförinnan (Art. 7.3 GDPR).{"\n\n"}
            <Text style={styles.expandBold}>Kontakt:</Text> sentrasence.alert@gmail.com{"\n"}
            <Text style={styles.expandBold}>Klagomål:</Text> sentrasence.alert@gmail.com
          </Text>
        </View>
      </View>

      {/* Obligatoriska samtycken */}
      <View style={styles.consentSection}>
        <Text style={styles.sectionLabel}>Obligatoriska godkännanden</Text>

        <Pressable style={styles.checkRow} onPress={() => setAcceptedPrivacy((v) => !v)}>
          <View style={[styles.checkbox, acceptedPrivacy && styles.checkboxChecked]}>
            {acceptedPrivacy && <Ionicons name="checkmark" size={11} color="#00D8E6" />}
          </View>
          <Text style={styles.checkLabel}>
            Jag har läst och godkänner{" "}
            <Text style={styles.linkText} onPress={() => router.push("/privacy-info" as any)}>
              Integritetspolicyn
            </Text>{" "}
            (version {CONSENT_VERSION}), inklusive hur mina personuppgifter
            behandlas och mina rättigheter enligt GDPR.
          </Text>
        </Pressable>

        <Pressable style={[styles.checkRow, { marginTop: 10 }]} onPress={() => setAcceptedTerms((v) => !v)}>
          <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
            {acceptedTerms && <Ionicons name="checkmark" size={11} color="#00D8E6" />}
          </View>
          <Text style={styles.checkLabel}>
            Jag har läst och godkänner{" "}
            <Text style={styles.linkText} onPress={() => router.push("/terms" as any)}>
              Användarvillkoren
            </Text>{" "}
            och förstår att SentraSense inte ersätter att ringa 112 i akuta nödsituationer.
          </Text>
        </Pressable>
      </View>

      {!canContinue && (
        <View style={styles.warningBox}>
          <Ionicons name="information-circle-outline" size={14} color="#E6A000" />
          <Text style={styles.warningText}>
            {" "}Du behöver godkänna integritetspolicyn och användarvillkoren för att fortsätta.
          </Text>
        </View>
      )}

      <Pressable
        style={[styles.btn, (!canContinue || loading) && styles.btnDisabled]}
        onPress={handleNext}
        disabled={!canContinue || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Text style={styles.btnText}>Spara och fortsätt</Text>
            <Ionicons name="chevron-forward" size={14} color="#fff" style={{ marginLeft: 4 }} />
          </>
        )}
      </Pressable>

      <View style={styles.footerRow}>
        <Ionicons name="lock-closed" size={11} color="#4A6070" />
        <Text style={styles.footerSmall}>
          {" "}Samtycken sparas med tidsstämpel och version enligt Art. 7 GDPR.
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── STEP 2: Välj kodord ───────────────────────────────────────────────────────
const PRESETS = [
  { icon: "moon" as const, label: "Röd måne" },
  { icon: "chatbubble" as const, label: "Hjälp mig" },
  { icon: "logo-twitter" as const, label: "Blå fågel" },
  { icon: "hand-left" as const, label: "Snälla hjälp" },
  { icon: "close-circle" as const, label: "Inte okej" },
  { icon: "notifications" as const, label: "Larma nu" },
];

type Step2Props = {
  onNext: () => void;
  onBack: () => void;
  codeword: string;
  setCodeword: (value: string) => void;
};

export function Step2({ onNext, onBack, codeword, setCodeword }: Step2Props) {
  const { user } = useAuth();

  // Hämta reset från context
  const { lastResult, reset } = useVoskService();

  const [custom, setCustom] = useState(
    PRESETS.some((p) => p.label === codeword) ? "" : codeword
  );
  const [loading, setLoading] = useState(false);

  // Testläge
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"match" | "fail" | null>(null);

  // Frys kodordet vid teststart
  const [testCodeword, setTestCodeword] = useState("");

  // Vad som sades under testet
  const [testHeard, setTestHeard] = useState("");

  // När användaren trycker "Testa kodordet"
  const startTest = () => {
    reset();                // NOLLSTÄLL ALL GAMMAL TRANSKRIPTION
    setTestCodeword(codeword);
    setTestHeard("");
    setTestResult(null);
    setIsTesting(true);
  };

  // När Vosk ger ett nytt resultat under testläge → jämför
  useEffect(() => {
    if (!isTesting) return;
    if (!lastResult) return;

    setTestHeard(lastResult);

    const normalizedHeard = lastResult.toLowerCase().trim();
    const normalizedCode = testCodeword.toLowerCase().trim();

    if (normalizedHeard === normalizedCode) {
      setTestResult("match");
    } else {
      setTestResult("fail");
    }

    setIsTesting(false);
  }, [isTesting, lastResult, testCodeword]);

  const selectPreset = (label: string) => {
    setCodeword(label);
    setCustom("");
  };

  const handleCustomChange = (text: string) => {
    if (text.length <= 30) {
      setCustom(text);
      setCodeword(text);
    }
  };

  const handleNext = async () => {
    if (!codeword.trim()) return;

    if (!user) {
      onNext();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users/${user.userId}/codeword`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeword: codeword.trim() }),
      });

      if (!res.ok) throw new Error();
      onNext();
    } catch {
      Alert.alert("Fel", "Kunde inte spara kodordet. Försök igen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.scrollFlex}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#00D8E6" />
        </Pressable>
        <StepIndicator current={2} />
        <View style={{ width: 28 }} />
      </View>

      <Text style={styles.stepLabel}>Steg 2 av 4</Text>
      <Text style={styles.title}>Välj ditt kodord</Text>
      <Text style={styles.subtitle}>
        Välj en fras som känns naturlig att säga i en stressad situation. Appen
        lyssnar efter frasen genom att transkribera tal lokalt på enheten.
      </Text>

      {/* Info box */}
      <View style={styles.infoBox}>
        <Ionicons name="mic" size={15} color="#00D8E6" style={{ marginRight: 8 }} />
        <Text style={styles.infoText}>
          All röstbearbetning sker lokalt på din enhet. Ingen ljuddata skickas
          till externa servrar.
        </Text>
      </View>

      {/* Presets */}
      <Text style={styles.sectionLabel}>Föreslagna kodord</Text>
      <View style={styles.presetGrid}>
        {PRESETS.map((p) => (
          <Pressable
            key={p.label}
            style={[
              styles.presetChip,
              codeword === p.label && styles.presetChipActive,
            ]}
            onPress={() => selectPreset(p.label)}
          >
            <Ionicons
              name={p.icon}
              size={13}
              color={codeword === p.label ? "#00D8E6" : "#4A6070"}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.presetText,
                codeword === p.label && styles.presetTextActive,
              ]}
            >
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Custom input */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>eller ange eget</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.inputWrap}>
        <TextInput
          style={styles.codeInput}
          placeholder="Skriv ditt eget kodord här..."
          placeholderTextColor="#3A5060"
          value={custom}
          onChangeText={handleCustomChange}
        />
        <Text style={styles.charCount}>{custom.length}/30</Text>
      </View>

      {/* Test section */}
      <Text style={styles.sectionLabel}>Testa ditt kodord</Text>

      <View style={styles.testBox}>
        <Text style={styles.testLabel}>Testresultat:</Text>

        {/* Före test */}
        {!isTesting && testResult === null && (
          <Text style={styles.heardTextSmall}>
            Tryck på “Testa kodordet” för att börja
          </Text>
        )}

        {/* Under test */}
        {isTesting && (
          <Text style={styles.matchPending}>Lyssnar... säg ditt kodord nu</Text>
        )}

        {/* Efter test */}
        {testResult && (
          <Text style={styles.heardTextSmall}>
            Du sa: {'"'}{testHeard}{'"'}
          </Text>
        )}

        {testResult === "match" && (
          <Text style={styles.matchSuccess}>✔ Kodordet känns igen!</Text>
        )}

        {testResult === "fail" && (
          <Text style={styles.matchFail}>
            ✖ Det du sa matchade inte kodordet
          </Text>
        )}

        {/* Test button */}
        <Pressable style={styles.testButton} onPress={startTest}>
          <Ionicons name="mic-circle" size={20} color="#00D8E6" />
          <Text style={styles.testButtonText}>Testa kodordet</Text>
        </Pressable>
      </View>

      {/* Tips */}
      <Text style={styles.sectionLabel}>Tips för ett bra kodord</Text>
      {[
        "Välj något personligt och lätt att minnas.",
        "Undvik extremt vanliga ord – de kan ge falska larm.",
        "Välj något du kan säga tydligt även i stress.",
        "Du kan alltid byta kodord i Inställningar.",
      ].map((tip) => (
        <View key={tip} style={styles.tipRow}>
          <Ionicons
            name="checkmark-circle"
            size={14}
            color="#00D8E6"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      ))}

      {/* Save button */}
      <Pressable
        style={[styles.btn, (!codeword.trim() || loading) && styles.btnDisabled]}
        onPress={handleNext}
        disabled={!codeword.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Text style={styles.btnText}>Spara kodord</Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color="#fff"
              style={{ marginLeft: 4 }}
            />
          </>
        )}
      </Pressable>

      <View style={styles.footerRow}>
        <Ionicons name="lock-closed" size={11} color="#4A6070" />
        <Text style={styles.footerSmall}>
          Kodordet lagras krypterat och kan ändras i Inställningar.
        </Text>
      </View>
    </ScrollView>
  );
}



// ─── STEP 3: Träna kodord (MediaRecorder, fungerar på webb) ───────────────────

type RecordingState = "idle" | "countdown" | "recording";

function Step3({ onNext, onBack, codeword }: { onNext: () => void; onBack: () => void; codeword: string }) {
  const [attempts, setAttempts] = useState([false, false, false]);
  const [recState, setRecState] = useState<RecordingState>("idle");
  const [countdown, setCountdown] = useState(3);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentIdx = attempts.indexOf(false);
  const allDone = attempts.every(Boolean);

  const startRecording = async () => {
    if (recState !== "idle" || allDone) return;

    if (Platform.OS !== "web") {
      Alert.alert(
        "Inte tillgänglig på mobil ännu",
        "Röstträning via mikrofon är tillgänglig i webbläsaren. På mobil kan du hoppa över detta steg och träna senare i appen."
      );
      return;
    }

    try {
      const stream = await (navigator as any).mediaDevices.getUserMedia({ audio: true });
      setRecState("countdown");
      setCountdown(3);
      let c = 3;
      countdownRef.current = setInterval(() => {
        c -= 1;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(countdownRef.current!);
          beginCapture(stream);
        }
      }, 1000);
    } catch {
      Alert.alert(
        "Mikrofonåtkomst nekad",
        "SentraSense behöver komma åt mikrofonen för röstträning. Kontrollera webbläsarens behörighetsinställningar."
      );
    }
  };

  const beginCapture = (stream: MediaStream) => {
    const chunks: Blob[] = [];
    const mr = new MediaRecorder(stream);
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    mr.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      setAttempts((prev) => {
        const next = [...prev];
        const idx = next.indexOf(false);
        if (idx !== -1) next[idx] = true;
        return next;
      });
      setRecState("idle");
    };
    mr.start();
    setRecState("recording");
    setTimeout(() => { if (mr.state !== "inactive") mr.stop(); }, 3000);
  };

  const label =
    recState === "countdown" ? `Börja tala om ${countdown} sekunder...` :
    recState === "recording" ? "Lyssnar – säg kodordet nu!" :
    allDone ? "Alla 3 försök klara!" :
    `Tryck för försök ${(currentIdx < 0 ? 3 : currentIdx) + 1} av 3`;

  return (
    <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#00D8E6" />
        </Pressable>
        <StepIndicator current={3} />
        <View style={{ width: 28 }} />
      </View>

      <Text style={styles.stepLabel}>Steg 3 av 4</Text>
      <Text style={styles.title}>Träna ditt kodord</Text>
      <Text style={styles.subtitle}>
        Säg kodordet 3 gånger med tydlig röst i normal samtalston. AI-modellen lär
        sig känna igen just din röst för att minska falska larm.
      </Text>

      <View style={styles.codewordDisplay}>
        <Ionicons name="chatbubble" size={14} color="#00D8E6" style={{ marginRight: 6 }} />
        <Text style={styles.codewordText}>{`"${codeword}"`}</Text>
      </View>

      <View style={styles.micArea}>
        <Pressable
          style={[
            styles.micBtn,
            recState === "recording" && styles.micBtnActive,
            (allDone || recState === "countdown") && styles.micBtnDisabled,
          ]}
          onPress={startRecording}
          disabled={allDone || recState !== "idle"}
        >
          {recState === "countdown" ? (
            <Text style={styles.countdownText}>{countdown}</Text>
          ) : recState === "recording" ? (
            <Ionicons name="radio-button-on" size={32} color="#FF4444" />
          ) : (
            <Ionicons name="mic" size={32} color="#fff" />
          )}
        </Pressable>
      </View>

      <Text style={styles.micHint}>{label}</Text>

      <View style={[styles.cardList, { marginTop: 16 }]}>
        {attempts.map((done, i) => (
          <View
            key={i}
            style={[styles.attemptRow, i === currentIdx && !done && styles.attemptRowActive]}
          >
            <View style={[styles.attemptIcon, done && styles.attemptIconDone]}>
              {done ? (
                <Ionicons name="checkmark" size={12} color="#00D8E6" />
              ) : i === currentIdx ? (
                <Ionicons name="mic" size={10} color="#00D8E6" />
              ) : (
                <View style={styles.attemptDot} />
              )}
            </View>
            <Text style={[styles.attemptLabel, done && styles.attemptLabelDone]}>Försök {i + 1}</Text>
            <View style={styles.waveformSmall}>
              {[4, 10, 6, 14, 8, 12, 5].map((h, j) => (
                <View key={j} style={[styles.waveBarSmall, { height: h }, done && styles.waveBarDone]} />
              ))}
            </View>
            {done ? (
              <Ionicons name="checkmark-circle" size={16} color="#00D8E6" />
            ) : (
              <Ionicons name="ellipse-outline" size={16} color="#1C3040" />
            )}
          </View>
        ))}
      </View>

      <View style={[styles.infoBox, { marginTop: 16 }]}>
        <Ionicons name="information-circle" size={15} color="#00D8E6" style={{ marginRight: 8 }} />
        <Text style={styles.infoText}>
          Röstproverna lagras krypterat i 90 dagar och används enbart för att
          personanpassa AI-detektionen av just ditt kodord. De delas aldrig med
          tredje part och kan raderas via Inställningar.
        </Text>
      </View>

      <Pressable style={styles.btn} onPress={onNext}>
        <Text style={styles.btnText}>
          {allDone ? "Fortsätt" : "Hoppa över – träna senare i appen"}
        </Text>
        <Ionicons name="chevron-forward" size={14} color="#fff" style={{ marginLeft: 4 }} />
      </Pressable>
    </ScrollView>
  );
}

// ─── STEP 4: Nödkontakter ─────────────────────────────────────────────────────

type Contact = {
  trustedContactId?: string;
  name: string;
  phone: string;
  email?: string;
  relationshipType?: string;
  isPrimary: boolean;
};

function AddContactModal({
  visible, userId, onClose, onSaved,
}: {
  visible: boolean; userId: string; onClose: () => void; onSaved: (c: Contact) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [relation, setRelation] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setName(""); setPhone(""); setEmail(""); setRelation(""); setIsPrimary(false); setError("");
  };

  const handleSave = async () => {
    setError("");
    if (!name.trim()) { setError("Namn krävs."); return; }
    if (!phone.trim()) { setError("Telefonnummer krävs."); return; }
    // Under byggtid (userId === "dev") – hoppar över API-anrop
    if (userId === "dev") {
      onSaved({
        trustedContactId: `dev-${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        relationshipType: relation.trim() || undefined,
        isPrimary,
      });
      reset();
      onClose();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          relationshipType: relation.trim() || null,
          isPrimary,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved: Contact = await res.json();
      onSaved(saved);
      reset();
      onClose();
    } catch {
      setError("Kunde inte spara kontakten. Kontrollera anslutningen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ny nödkontakt</Text>
            <Pressable onPress={() => { reset(); onClose(); }}>
              <Ionicons name="close" size={22} color="#4A6070" />
            </Pressable>
          </View>

          {[
            { label: "Namn *", val: name, set: setName, ph: "Anna Svensson", kb: "default" },
            { label: "Telefonnummer *", val: phone, set: setPhone, ph: "+46 70 123 45 67", kb: "phone-pad" },
            { label: "E-post (valfritt)", val: email, set: setEmail, ph: "anna@example.com", kb: "email-address" },
            { label: "Relation (valfritt)", val: relation, set: setRelation, ph: "Mamma, Vän, Partner...", kb: "default" },
          ].map((f) => (
            <View key={f.label} style={styles.modalField}>
              <Text style={styles.modalLabel}>{f.label}</Text>
              <TextInput
                style={styles.modalInput}
                value={f.val}
                onChangeText={f.set as any}
                placeholder={f.ph}
                placeholderTextColor="#3A5060"
                keyboardType={f.kb as any}
              />
            </View>
          ))}

          <Pressable style={styles.primaryRow} onPress={() => setIsPrimary((v) => !v)}>
            <View style={[styles.checkbox, isPrimary && styles.checkboxChecked]}>
              {isPrimary && <Ionicons name="checkmark" size={11} color="#00D8E6" />}
            </View>
            <Text style={styles.modalLabel}>Sätt som primär nödkontakt</Text>
          </Pressable>

          {error ? <Text style={styles.modalError}>{error}</Text> : null}

          <Pressable style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnText}>Spara kontakt</Text>}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Step4({ onFinish, onBack }: { onFinish: () => void; onBack: () => void }) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetch(`${API}/api/contacts/${user.userId}`)
      .then((r) => r.json())
      .then(setContacts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const confirmDelete = (c: Contact) => {
    Alert.alert("Ta bort kontakt", `Är du säker på att du vill ta bort ${c.name}?`, [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Ta bort", style: "destructive",
        onPress: async () => {
          try {
            await fetch(`${API}/api/contacts/${c.trustedContactId}`, { method: "DELETE" });
            setContacts((prev) => prev.filter((x) => x.trustedContactId !== c.trustedContactId));
          } catch {
            Alert.alert("Fel", "Kunde inte ta bort kontakten.");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#00D8E6" />
        </Pressable>
        <StepIndicator current={4} />
        <View style={{ width: 28 }} />
      </View>

      <Text style={styles.stepLabel}>Steg 4 av 4</Text>
      <Text style={styles.title}>Nödkontakter</Text>
      <Text style={styles.subtitle}>
        Lägg till personer som automatiskt larmas vid nödsituation. De får din position och en ljudinspelning.
      </Text>

      <View style={styles.infoBox}>
        <Ionicons name="people" size={15} color="#00D8E6" style={{ marginRight: 8 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoText}>
            Vi rekommenderar att du informerar dina kontakter om att de är registrerade,
            så att de vet vad det innebär om de får ett larm.
          </Text>
          <View style={styles.encryptedRow}>
            <Ionicons name="lock-closed" size={10} color="#4A9060" style={{ marginRight: 4 }} />
            <Text style={styles.encryptedText}>
              Kontaktuppgifter lagras krypterat och delas aldrig med tredje part.
              Rättslig grund: Samtycke (Art. 6.1.a GDPR).
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Dina nödkontakter</Text>

      {loading ? (
        <ActivityIndicator color="#00D8E6" style={{ marginVertical: 20 }} />
      ) : contacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={36} color="#1C3040" />
          <Text style={styles.emptyText}>Inga kontakter tillagda ännu.{"\n"}Lägg till minst en nödkontakt.</Text>
        </View>
      ) : (
        <View style={styles.cardList}>
          {contacts.map((c) => (
            <View key={c.trustedContactId ?? c.name} style={styles.contactRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{c.name[0].toUpperCase()}</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{c.name}</Text>
                <Text style={styles.contactPhone}>{c.phone}</Text>
                {c.relationshipType ? <Text style={styles.contactRelation}>{c.relationshipType}</Text> : null}
              </View>
              {c.isPrimary && <Text style={styles.rolePrimary}>Primär</Text>}
              <Pressable onPress={() => confirmDelete(c)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={16} color="#E63946" />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Pressable style={styles.addContactBtn} onPress={() => setShowModal(true)}>
        <Ionicons name="add-circle-outline" size={16} color="#00D8E6" style={{ marginRight: 6 }} />
        <Text style={styles.addContactText}>Lägg till nödkontakt</Text>
      </Pressable>

      <View style={[styles.infoBox, { marginTop: 16 }]}>
        <Ionicons name="shield-checkmark" size={15} color="#00D8E6" style={{ marginRight: 8 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoBoldText}>Du är nästan klar!</Text>
          <Text style={styles.infoText}>
            Kontakter kan läggas till och ändras när som helst under Inställningar → Nödkontakter.
          </Text>
        </View>
      </View>

      <Pressable style={styles.btn} onPress={onFinish}>
        <Text style={styles.btnText}>Slutför inställningar</Text>
        <Ionicons name="checkmark" size={14} color="#fff" style={{ marginLeft: 4 }} />
      </Pressable>

      <Pressable onPress={onFinish} style={{ marginTop: 12 }}>
        <Text style={styles.skipText}>Hoppa över – lägg till kontakter senare</Text>
      </Pressable>

      <AddContactModal
        visible={showModal}
        userId={user?.userId ?? "dev"}
        onClose={() => setShowModal(false)}
        onSaved={(c) => setContacts((prev) => {
          if (c.isPrimary) return [...prev.map((x) => ({ ...x, isPrimary: false })), c];
          return [...prev, c];
        })}
      />
    </ScrollView>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function SecuritySetup() {
  const { user, setUser } = useAuth();
  const [step, setStep] = useState(1);
  const [codeword, setCodeword] = useState("");

  // TODO: återaktivera inför release — kommenterat ut under byggtid
  // useEffect(() => {
  //   if (!user) router.replace("/login");
  // }, [user]);

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));
  const finish = () => {
    // Uppdatera context så att hem-sidan reflekterar rätt status direkt
    if (user) {
      setUser({ ...user, codewordTrained: user.codewordTrained ?? false });
    }
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safe}>
      {step === 1 && <Step1 onNext={next} />}
      {step === 2 && <Step2 onNext={next} onBack={back} codeword={codeword} setCodeword={setCodeword} />}
      {step === 3 && <Step3 onNext={next} onBack={back} codeword={codeword} />}
      {step === 4 && <Step4 onFinish={finish} onBack={back} />}
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020B14" },
  scrollFlex: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 52, alignItems: "center" },

  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  stepCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: "#1C3040", backgroundColor: "#0A1A26", justifyContent: "center", alignItems: "center" },
  stepCircleActive: { borderColor: "#00D8E6", backgroundColor: "rgba(0,216,230,0.12)" },
  stepCircleDone: { borderColor: "#00D8E6", backgroundColor: "transparent" },
  stepNum: { color: "#4A6070", fontSize: 11, fontWeight: "700" },
  stepNumActive: { color: "#00D8E6" },
  stepLine: { width: 28, height: 1.5, backgroundColor: "#1C3040", marginHorizontal: 3 },
  stepLineDone: { backgroundColor: "#00D8E6" },

  topBar: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  backBtn: { padding: 4, width: 28 },
  stepLabel: { color: "#4A6070", fontSize: 12, fontWeight: "600", marginBottom: 6 },
  title: { color: "#FFFFFF", fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: 8 },
  subtitle: { color: "#8FB8C4", fontSize: 13, lineHeight: 20, textAlign: "center", marginBottom: 16 },
  sectionLabel: { color: "#8FB8C4", fontSize: 12, fontWeight: "600", alignSelf: "flex-start", marginBottom: 8, marginTop: 10 },

  cardList: { width: "100%", gap: 8 },
  permCard: { backgroundColor: "rgba(10,30,44,0.85)", borderRadius: 12, borderWidth: 1, borderColor: "#122030", overflow: "hidden" },
  permCardHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  permExpanded: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: "#122030" },
  permIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(0,216,230,0.10)", justifyContent: "center", alignItems: "center" },
  permText: { flex: 1 },
  permTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "700", marginBottom: 2 },
  permDesc: { color: "#6A8898", fontSize: 11, lineHeight: 16 },
  expandText: { color: "#8FB8C4", fontSize: 12, lineHeight: 19, marginTop: 10 },
  expandBold: { color: "#FFFFFF", fontWeight: "700" },
  highlightText: { color: "#00D8E6", fontWeight: "700" },

  retentionBox: { width: "100%", backgroundColor: "rgba(0,20,30,0.7)", borderRadius: 12, borderWidth: 1, borderColor: "#1C3040", padding: 14, marginTop: 12 },
  retentionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 6 },
  retentionTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  retentionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#0D2030" },
  retentionLabel: { color: "#8FB8C4", fontSize: 12 },
  retentionValue: { color: "#00D8E6", fontSize: 12, fontWeight: "600" },

  infoBox: { flexDirection: "row", backgroundColor: "rgba(0,216,230,0.07)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(0,216,230,0.18)", padding: 12, width: "100%", marginBottom: 12 },
  infoTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "700", marginBottom: 4 },
  infoText: { color: "#8FB8C4", fontSize: 12, lineHeight: 18, flex: 1 },
  infoBoldText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700", marginBottom: 4 },

  consentSection: { width: "100%", marginTop: 12, marginBottom: 4 },
  checkRow: { flexDirection: "row", alignItems: "flex-start", width: "100%" },
  checkbox: { width: 16, height: 16, borderWidth: 1.5, borderColor: "#5EAFC0", backgroundColor: "rgba(8,22,30,0.45)", justifyContent: "center", alignItems: "center", marginRight: 10, marginTop: 2, borderRadius: 3, flexShrink: 0 },
  checkboxChecked: { backgroundColor: "rgba(0,216,230,0.12)", borderColor: "#00D8E6" },
  checkLabel: { flex: 1, color: "#8FB8C4", fontSize: 12, lineHeight: 18 },
  linkText: { color: "#00D8E6", fontWeight: "700" },

  warningBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(230,160,0,0.1)", borderRadius: 8, borderWidth: 1, borderColor: "rgba(230,160,0,0.25)", padding: 10, width: "100%", marginTop: 8, marginBottom: 4 },
  warningText: { color: "#E6A000", fontSize: 12, lineHeight: 17, flex: 1 },

  btn: { width: "100%", maxWidth: 280, height: 46, borderRadius: 14, borderWidth: 2, borderColor: "#00D8E6", backgroundColor: "rgba(0,216,230,0.12)", justifyContent: "center", alignItems: "center", flexDirection: "row", marginTop: 20, shadowColor: "#00D8E6", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  btnDisabled: { borderColor: "#1C3040", backgroundColor: "rgba(28,48,64,0.4)", shadowOpacity: 0, elevation: 0 },
  btnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  footerRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  footerSmall: { color: "#4A6070", fontSize: 11, flexShrink: 1 },

  presetGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, width: "100%", marginBottom: 8 },
  presetChip: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#1C3040", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: "rgba(10,26,38,0.8)" },
  presetChipActive: { borderColor: "#00D8E6", backgroundColor: "rgba(0,216,230,0.12)" },
  presetText: { color: "#4A6070", fontSize: 12, fontWeight: "600" },
  presetTextActive: { color: "#00D8E6" },
  dividerRow: { flexDirection: "row", alignItems: "center", width: "100%", marginVertical: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#1C3040" },
  dividerText: { color: "#4A6070", fontSize: 11, marginHorizontal: 10 },
  inputWrap: { width: "100%", borderWidth: 1.5, borderColor: "#1C3040", borderRadius: 12, backgroundColor: "rgba(10,26,38,0.8)", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 },
  codeInput: { flex: 1, color: "#FFFFFF", fontSize: 13 },
  charCount: { color: "#4A6070", fontSize: 11 },
  tipRow: { flexDirection: "row", alignItems: "flex-start", width: "100%", marginBottom: 6 },
  tipText: { color: "#8FB8C4", fontSize: 12, lineHeight: 18, flex: 1 },

  codewordDisplay: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,216,230,0.07)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(0,216,230,0.18)", paddingHorizontal: 14, paddingVertical: 10, width: "100%", marginBottom: 12 },
  codewordText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700", flex: 1 },
  micArea: { alignItems: "center", marginVertical: 20 },
  micBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(0,216,230,0.15)", borderWidth: 2, borderColor: "#00D8E6", justifyContent: "center", alignItems: "center", shadowColor: "#00D8E6", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 10 },
  micBtnActive: { backgroundColor: "rgba(230,57,70,0.2)", borderColor: "#E63946" },
  micBtnDisabled: { opacity: 0.4 },
  countdownText: { color: "#00D8E6", fontSize: 28, fontWeight: "800" },
  micHint: { color: "#4A6070", fontSize: 12, textAlign: "center", marginBottom: 4 },

  attemptRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(10,26,38,0.8)", borderRadius: 12, borderWidth: 1, borderColor: "#122030", paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  attemptRowActive: { borderColor: "rgba(0,216,230,0.3)" },
  attemptIcon: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: "#1C3040", justifyContent: "center", alignItems: "center" },
  attemptIconDone: { borderColor: "#00D8E6" },
  attemptDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#1C3040" },
  attemptLabel: { color: "#4A6070", fontSize: 13, fontWeight: "600", flex: 1 },
  attemptLabelDone: { color: "#FFFFFF" },
  waveformSmall: { flexDirection: "row", alignItems: "center", gap: 2, marginRight: 4 },
  waveBarSmall: { width: 2, borderRadius: 1, backgroundColor: "#1C3040" },
  waveBarDone: { backgroundColor: "rgba(0,216,230,0.5)" },

  emptyState: { alignItems: "center", paddingVertical: 28, width: "100%" },
  emptyText: { color: "#4A6070", fontSize: 13, textAlign: "center", marginTop: 10, lineHeight: 19 },
  contactRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(10,26,38,0.8)", borderRadius: 12, borderWidth: 1, borderColor: "#122030", paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,216,230,0.15)", borderWidth: 1, borderColor: "rgba(0,216,230,0.3)", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#00D8E6", fontSize: 15, fontWeight: "700" },
  contactInfo: { flex: 1 },
  contactName: { color: "#FFFFFF", fontSize: 13, fontWeight: "700", marginBottom: 2 },
  contactPhone: { color: "#6A8898", fontSize: 11 },
  contactRelation: { color: "#4A6070", fontSize: 10, marginTop: 2 },
  rolePrimary: { color: "#00D8E6", backgroundColor: "rgba(0,216,230,0.12)", fontSize: 10, fontWeight: "700", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  deleteBtn: { padding: 6 },
  addContactBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#1C3040", borderRadius: 12, borderStyle: "dashed", paddingVertical: 13, width: "100%", marginTop: 8 },
  addContactText: { color: "#00D8E6", fontSize: 13, fontWeight: "600" },
  encryptedRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 6 },
  encryptedText: { color: "#4A9060", fontSize: 11, flex: 1 },
  skipText: { color: "#4A6070", fontSize: 12, fontWeight: "600", textDecorationLine: "underline" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#0A1822", borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 1, borderColor: "#1C3040", padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  modalField: { marginBottom: 12 },
  modalLabel: { color: "#8FB8C4", fontSize: 12, marginBottom: 5 },
  modalInput: { backgroundColor: "rgba(18,34,45,0.9)", borderRadius: 10, borderWidth: 1, borderColor: "#1C3040", color: "#FFFFFF", fontSize: 13, paddingHorizontal: 12, paddingVertical: 10 },
  primaryRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 10 },
  modalError: { color: "#FFB4B4", fontSize: 12, marginBottom: 8, textAlign: "center" },

  testBox: {
  width: "100%",
  backgroundColor: "rgba(0,216,230,0.07)",
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "rgba(0,216,230,0.18)",
  padding: 14,
  marginTop: 12,
},

testLabel: {
  color: "#00D8E6",
  fontSize: 13,
  fontWeight: "700",
  marginBottom: 6,
},

heardLabel: {
  color: "#4A6070",
  fontSize: 11,
  marginBottom: 4,
},

heardText: {
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: "600",
  marginBottom: 10,
},

heardTextSmall: {
  marginTop: 6,
  color: "#9BB3C8",
  fontSize: 13,
  fontStyle: "italic",
},

matchSuccess: {
  marginTop: 10,
  color: "#06D6A0",
  fontSize: 15,
  fontWeight: "700",
},

matchFail: {
  marginTop: 10,
  color: "#EF476F",
  fontSize: 15,
  fontWeight: "700",
},

testButton: {
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-start",
  backgroundColor: "#0A1A24",
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 8,
  marginTop: 10,
  borderWidth: 1,
  borderColor: "#00D8E6",
},

testButtonText: {
  color: "#00D8E6",
  fontSize: 14,
  fontWeight: "600",
  marginLeft: 6,
},

matchPending: {
  marginTop: 10,
  color: "#FFD166",
  fontSize: 14,
  fontWeight: "500",
},

});
