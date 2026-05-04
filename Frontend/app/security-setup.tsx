import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

//  Progress indicator 

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
                <Text
                  style={[
                    styles.stepNum,
                    active && styles.stepNumActive,
                  ]}
                >
                  {step}
                </Text>
              )}
            </View>
            {i < 3 && (
              <View
                style={[styles.stepLine, done && styles.stepLineDone]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

//  Step 1: Aktivera ditt skydd 

function Step1({ onNext }: { onNext: () => void }) {
  const [mic, setMic] = useState(true);
  const [location, setLocation] = useState(true);
  const [audio, setAudio] = useState(true);
  const [accepted, setAccepted] = useState(false);

  const permissions = [
    {
      icon: "mic" as const,
      title: "Mikrofonåtkomst",
      desc: "Krävs för AI-lyssning efter kodord och nödläten lokalt i din enhet.",
      value: mic,
      onToggle: () => setMic((v) => !v),
      toggle: true,
    },
    {
      icon: "location" as const,
      title: "Platsdelning",
      desc: "Din position delas endast vid nödlarm för att hjälpa dina kontakter.",
      value: location,
      onToggle: () => setLocation((v) => !v),
      toggle: true,
    },
    {
      icon: "cellular" as const,
      title: "Ljudinspelning vid larm",
      desc: "Spelas in automatiskt i upp till 30 sek efter larm aktiveras.",
      value: audio,
      onToggle: () => setAudio((v) => !v),
      toggle: true,
    },
    {
      icon: "person-circle" as const,
      title: "Integritet & GDPR",
      desc: "Läs hur vi hanterar dina data på ett säkert sätt.",
      value: false,
      onToggle: () => {},
      toggle: false,
    },
    {
      icon: "document-text" as const,
      title: "Användarvillkor",
      desc: "Läs igenom våra villkor för användning av SentraSense.",
      value: false,
      onToggle: () => {},
      toggle: false,
    },
  ];

  return (
    <ScrollView
      style={styles.scrollFlex}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <StepIndicator current={1} />

      <Text style={styles.title}>Aktivera ditt skydd</Text>
      <Text style={styles.subtitle}>
        För att SentraSense ska kunna skydda dig när du behöver det.
      </Text>

      <View style={styles.cardList}>
        {permissions.map((p) => (
          <View key={p.title} style={styles.permCard}>
            <View style={styles.permIconWrap}>
              <Ionicons name={p.icon} size={20} color="#00D8E6" />
            </View>
            <View style={styles.permText}>
              <Text style={styles.permTitle}>{p.title}</Text>
              <Text style={styles.permDesc}>{p.desc}</Text>
            </View>
            {p.toggle ? (
              <Switch
                value={p.value}
                onValueChange={p.onToggle}
                trackColor={{ false: "#1C3040", true: "#00A8B4" }}
                thumbColor={p.value ? "#00D8E6" : "#4A6070"}
              />
            ) : (
              <Ionicons name="chevron-forward" size={16} color="#4A6070" />
            )}
          </View>
        ))}
      </View>

      <Pressable
        style={styles.checkRow}
        onPress={() => setAccepted((v) => !v)}
      >
        <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
          {accepted && <Ionicons name="checkmark" size={11} color="#8FB8C4" />}
        </View>
        <Text style={styles.checkLabel}>
          Jag godkänner att ovanstående tillstånd aktiveras och samtycker till{" "}
          <Text style={styles.linkText}>integritetspolicy</Text> och{" "}
          <Text style={styles.linkText}>villkor</Text>.
        </Text>
      </Pressable>

      <Pressable
        style={[styles.btn, !accepted && styles.btnDisabled]}
        onPress={accepted ? onNext : undefined}
      >
        <Text style={styles.btnText}>Fortsätt</Text>
        <Ionicons name="chevron-forward" size={14} color="#fff" style={{ marginLeft: 4 }} />
      </Pressable>

      <View style={styles.footerRow}>
        <Ionicons name="lock-closed" size={11} color="#4A6070" />
        <Text style={styles.footerSmall}> Dina inställningar kan ändras när som helst.</Text>
      </View>
    </ScrollView>
  );
}

// Step 2: Välj ditt kodord 

const presets = [
  { icon: "moon", label: "Röd måne" },
  { icon: "chatbubble", label: "Hjälp mig" },
  { icon: "logo-twitter", label: "Blå fågel" },
  { icon: "hand-left", label: "Snälla hjälp" },
  { icon: "close-circle", label: "Inte okej" },
  { icon: "notifications", label: "Larma nu" },
] as const;

function Step2({
  onNext,
  onBack,
  codeword,
  setCodeword,
}: {
  onNext: () => void;
  onBack: () => void;
  codeword: string;
  setCodeword: (v: string) => void;
}) {
  const [custom, setCustom] = useState("");

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

  return (
    <ScrollView
      style={styles.scrollFlex}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#00D8E6" />
        </Pressable>
        <StepIndicator current={2} />
        <View style={styles.logoSmall}>
          <Ionicons name="shield" size={22} color="#00D8E6" />
        </View>
      </View>

      <Text style={styles.stepLabel}>Steg 2 av 4</Text>
      <Text style={styles.title}>Välj ditt kodord</Text>
      <Text style={styles.subtitle}>
        Välj ett ord eller en fras som är lätt för dig att säga i en
        nödsituation, men svårt för andra att gissa.
      </Text>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={16} color="#00D8E6" style={{ marginRight: 8, marginTop: 1 }} />
        <Text style={styles.infoText}>
          Ditt kodord används av AI-lyssningen för att känna igen dig och kunna
          larma vid behov.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Exempel på kodord</Text>
      <View style={styles.presetGrid}>
        {presets.map((p) => (
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

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>eller</Text>
        <View style={styles.dividerLine} />
      </View>

      <Text style={styles.sectionLabel}>Eget kodord</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.codeInput}
          placeholder="Skriv ditt eget kodord här"
          placeholderTextColor="#3A5060"
          value={custom}
          onChangeText={handleCustomChange}
        />
        <Text style={styles.charCount}>{custom.length}/30</Text>
      </View>

      <Text style={styles.sectionLabel}>Tips för ett bra kodord</Text>
      {[
        "Använd något som betyder något för dig.",
        "Undvik vanliga ord eller namn.",
        "Gör det personligt, men lätt att uttala.",
      ].map((tip) => (
        <View key={tip} style={styles.tipRow}>
          <Ionicons name="checkmark-circle" size={14} color="#00D8E6" style={{ marginRight: 6 }} />
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      ))}

      <Pressable
        style={[styles.btn, !codeword && styles.btnDisabled]}
        onPress={codeword ? onNext : undefined}
      >
        <Text style={styles.btnText}>Fortsätt</Text>
        <Ionicons name="chevron-forward" size={14} color="#fff" style={{ marginLeft: 4 }} />
      </Pressable>

      <View style={styles.footerRow}>
        <Ionicons name="lock-closed" size={11} color="#4A6070" />
        <Text style={styles.footerSmall}> Ditt kodord lagras endast lokalt på din enhet.</Text>
      </View>
    </ScrollView>
  );
}

// Step 3: Träna ditt kodord 

function Step3({
  onNext,
  onBack,
  codeword,
  setCodeword,
}: {
  onNext: () => void;
  onBack: () => void;
  codeword: string;
  setCodeword: (v: string) => void;
}) {
  const attempts = [
    { label: "Försök 1", done: true },
    { label: "Försök 2", done: true },
    { label: "Försök 3", done: false, active: true },
    { label: "Försök 4", done: false },
  ];

  return (
    <ScrollView
      style={styles.scrollFlex}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#00D8E6" />
        </Pressable>
        <StepIndicator current={3} />
        <View style={styles.logoSmall}>
          <Ionicons name="shield" size={22} color="#00D8E6" />
        </View>
      </View>

      <Text style={styles.stepLabel}>Steg 3 av 4</Text>
      <Text style={styles.title}>Träna ditt kodord</Text>
      <Text style={styles.subtitle}>
        Uttala ditt kodord 3 gånger så att AI kan känna igen din röst.
      </Text>

      <View style={styles.codewordDisplay}>
        <Ionicons name="chatbubble" size={14} color="#00D8E6" style={{ marginRight: 6 }} />
        <Text style={styles.codewordText}>"{codeword}"</Text>
        <Pressable
          onPress={() => {}}
          style={styles.editBtn}
        >
          <Ionicons name="pencil" size={11} color="#00D8E6" style={{ marginRight: 3 }} />
          <Text style={styles.editText}>Ändra kodord</Text>
        </Pressable>
      </View>

      <View style={styles.micArea}>
        <View style={styles.waveformLeft}>
          {[6, 14, 8, 18, 10, 20, 12].map((h, i) => (
            <View key={i} style={[styles.waveBar, { height: h }]} />
          ))}
        </View>
        <Pressable style={styles.micBtn}>
          <Ionicons name="mic" size={32} color="#fff" />
        </Pressable>
        <View style={styles.waveformRight}>
          {[12, 20, 10, 18, 8, 14, 6].map((h, i) => (
            <View key={i} style={[styles.waveBar, { height: h }]} />
          ))}
        </View>
      </View>

      <Text style={styles.micHint}>
        Uttala ditt kodord tydligt i normal samtalston.
      </Text>

      <View style={styles.cardList}>
        {attempts.map((a) => (
          <View key={a.label} style={[styles.attemptRow, a.active && styles.attemptRowActive]}>
            <View style={[styles.attemptIcon, a.done && styles.attemptIconDone]}>
              {a.done ? (
                <Ionicons name="checkmark" size={12} color="#00D8E6" />
              ) : (
                <View style={styles.attemptDot} />
              )}
            </View>
            <Text style={[styles.attemptLabel, a.done && styles.attemptLabelDone]}>
              {a.label}
            </Text>
            <View style={styles.waveformSmall}>
              {[4, 10, 6, 14, 8, 12, 5].map((h, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveBarSmall,
                    { height: h },
                    a.done && styles.waveBarDone,
                  ]}
                />
              ))}
            </View>
            <Ionicons name="chevron-forward" size={14} color="#4A6070" />
          </View>
        ))}
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={16} color="#00D8E6" style={{ marginRight: 8, marginTop: 1 }} />
        <Text style={styles.infoText}>
          Detta hjälper AI att känna igen just din röst när du behöver hjälp.
        </Text>
      </View>

      <Pressable style={styles.btn} onPress={onNext}>
        <Text style={styles.btnText}>Fortsätt</Text>
        <Ionicons name="chevron-forward" size={14} color="#fff" style={{ marginLeft: 4 }} />
      </Pressable>
    </ScrollView>
  );
}

// Step 4: Nödkontakter 

const contacts = [
  { name: "Farishta Sulaiman", phone: "Mobil • 070 123 45 67", role: "Primär", color: "#1A3A4A" },
  { name: "Nän Ekman", phone: "Mobil • 070 987 65 43", role: "Sekundär", color: "#1A2A3A" },
  { name: "Alexander Larsson", phone: "Mobil • 070 555 12 34", role: "Sekundär", color: "#1A2A3A" },
];

function Step4({ onFinish, onBack }: { onFinish: () => void; onBack: () => void }) {
  return (
    <ScrollView
      style={styles.scrollFlex}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#00D8E6" />
        </Pressable>
        <StepIndicator current={4} />
        <View style={styles.logoSmall}>
          <Ionicons name="shield" size={22} color="#00D8E6" />
        </View>
      </View>

      <Text style={styles.stepLabel}>Steg 4 av 4</Text>
      <Text style={styles.title}>Lägg till nödkontakter</Text>
      <Text style={styles.subtitle}>
        Lägg till personer som larmas automatiskt vid en nödsituation.
      </Text>

      <View style={styles.infoBox}>
        <Ionicons name="people" size={16} color="#00D8E6" style={{ marginRight: 8, marginTop: 1 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoText}>
            Dina kontakter kommer att få din position och en ljudinspelning vid larm.
          </Text>
          <View style={styles.encryptedRow}>
            <Ionicons name="lock-closed" size={10} color="#4A9060" style={{ marginRight: 4 }} />
            <Text style={styles.encryptedText}>Allt skickas krypterat och behandlas säkert.</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Dina nödkontakter</Text>
      <View style={styles.cardList}>
        {contacts.map((c) => (
          <View key={c.name} style={styles.contactRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{c.name[0]}</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{c.name}</Text>
              <Text style={styles.contactPhone}>{c.phone}</Text>
            </View>
            <Text
              style={[
                styles.roleTag,
                c.role === "Primär" ? styles.rolePrimary : styles.roleSecondary,
              ]}
            >
              {c.role}
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#4A6070" />
          </View>
        ))}
      </View>

      <Pressable style={styles.addContactBtn}>
        <Ionicons name="add-circle-outline" size={16} color="#00D8E6" style={{ marginRight: 6 }} />
        <Text style={styles.addContactText}>Lägg till nödkontakt</Text>
      </Pressable>

      <View style={[styles.infoBox, { marginTop: 16 }]}>
        <Ionicons name="shield-checkmark" size={16} color="#00D8E6" style={{ marginRight: 8, marginTop: 1 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoBoldText}>Du är nästan klar!</Text>
          <Text style={styles.infoText}>
            När du är klar kommer SentraSense att vara redo att skydda dig när du behöver det som mest.
          </Text>
        </View>
      </View>

      <Pressable style={styles.btn} onPress={onFinish}>
        <Text style={styles.btnText}>Slutför setup</Text>
        <Ionicons name="chevron-forward" size={14} color="#fff" style={{ marginLeft: 4 }} />
      </Pressable>

      <Pressable onPress={onFinish} style={{ marginTop: 12 }}>
        <Text style={styles.skipText}>Hoppa över för nu</Text>
      </Pressable>
    </ScrollView>
  );
}

//  Main component
export default function SecuritySetup() {
  const [step, setStep] = useState(1);
  const [codeword, setCodeword] = useState("");

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));
  const finish = () => router.replace("/(tabs)");

  return (
    <SafeAreaView style={styles.safe}>
      {step === 1 && <Step1 onNext={next} />}
      {step === 2 && (
        <Step2
          onNext={next}
          onBack={back}
          codeword={codeword}
          setCodeword={setCodeword}
        />
      )}
      {step === 3 && (
        <Step3
          onNext={next}
          onBack={back}
          codeword={codeword}
          setCodeword={setCodeword}
        />
      )}
      {step === 4 && <Step4 onFinish={finish} onBack={back} />}
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#020B14",
  },

  scrollFlex: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
    alignItems: "center",
  },

  // Step indicator
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: "#1C3040",
    backgroundColor: "#0A1A26",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    borderColor: "#00D8E6",
    backgroundColor: "rgba(0,216,230,0.12)",
  },
  stepCircleDone: {
    borderColor: "#00D8E6",
    backgroundColor: "transparent",
  },
  stepNum: {
    color: "#4A6070",
    fontSize: 11,
    fontWeight: "700",
  },
  stepNumActive: {
    color: "#00D8E6",
  },
  stepLine: {
    width: 28,
    height: 1.5,
    backgroundColor: "#1C3040",
    marginHorizontal: 3,
  },
  stepLineDone: {
    backgroundColor: "#00D8E6",
  },

  // Top bar (steps 2–4)
  topBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backBtn: {
    padding: 4,
  },
  logoSmall: {
    padding: 4,
  },

  stepLabel: {
    color: "#4A6070",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },

  // Typography
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    color: "#8FB8C4",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  sectionLabel: {
    color: "#8FB8C4",
    fontSize: 12,
    fontWeight: "600",
    alignSelf: "flex-start",
    marginBottom: 8,
    marginTop: 8,
  },

  // Cards / permission items
  cardList: {
    width: "100%",
    gap: 8,
  },
  permCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10, 30, 44, 0.85)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#122030",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  permIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(0,216,230,0.10)",
    justifyContent: "center",
    alignItems: "center",
  },
  permText: {
    flex: 1,
  },
  permTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  permDesc: {
    color: "#6A8898",
    fontSize: 11,
    lineHeight: 16,
  },

  // Checkbox
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 16,
    marginBottom: 4,
    width: "100%",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: "#5EAFC0",
    backgroundColor: "rgba(8,22,30,0.45)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 2,
    borderRadius: 3,
  },
  checkboxChecked: {
    backgroundColor: "rgba(0,216,230,0.12)",
    borderColor: "#00D8E6",
  },
  checkLabel: {
    flex: 1,
    color: "#8FB8C4",
    fontSize: 12,
    lineHeight: 18,
  },
  linkText: {
    color: "#00D8E6",
    fontWeight: "600",
  },

  // Button
  btn: {
    width: "100%",
    maxWidth: 260,
    height: 46,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#00D8E6",
    backgroundColor: "rgba(0,216,230,0.12)",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 24,
    shadowColor: "#00D8E6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  btnDisabled: {
    borderColor: "#1C3040",
    backgroundColor: "rgba(28,48,64,0.4)",
    shadowOpacity: 0,
    elevation: 0,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  // Footer hint
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  footerSmall: {
    color: "#4A6070",
    fontSize: 11,
  },

  // Info box
  infoBox: {
    flexDirection: "row",
    backgroundColor: "rgba(0,216,230,0.07)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,216,230,0.18)",
    padding: 12,
    width: "100%",
    marginBottom: 16,
  },
  infoText: {
    color: "#8FB8C4",
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  infoBoldText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },

  // Preset codewords
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    width: "100%",
    marginBottom: 8,
  },
  presetChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1C3040",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "rgba(10,26,38,0.8)",
  },
  presetChipActive: {
    borderColor: "#00D8E6",
    backgroundColor: "rgba(0,216,230,0.12)",
  },
  presetText: {
    color: "#4A6070",
    fontSize: 12,
    fontWeight: "600",
  },
  presetTextActive: {
    color: "#00D8E6",
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1C3040",
  },
  dividerText: {
    color: "#4A6070",
    fontSize: 12,
    marginHorizontal: 12,
  },

  // Custom codeword input
  inputWrap: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#1C3040",
    borderRadius: 12,
    backgroundColor: "rgba(10,26,38,0.8)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  codeInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
  },
  charCount: {
    color: "#4A6070",
    fontSize: 11,
  },

  // Tips
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 6,
  },
  tipText: {
    color: "#8FB8C4",
    fontSize: 12,
  },

  // Mic area
  micArea: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    gap: 16,
  },
  waveformLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  waveformRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: "rgba(0,216,230,0.5)",
  },
  micBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(0,216,230,0.15)",
    borderWidth: 2,
    borderColor: "#00D8E6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00D8E6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  micHint: {
    color: "#4A6070",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
  },

  // Attempt rows
  attemptRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10,26,38,0.8)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#122030",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  attemptRowActive: {
    borderColor: "rgba(0,216,230,0.3)",
  },
  attemptIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#1C3040",
    justifyContent: "center",
    alignItems: "center",
  },
  attemptIconDone: {
    borderColor: "#00D8E6",
  },
  attemptDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1C3040",
  },
  attemptLabel: {
    color: "#4A6070",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  attemptLabelDone: {
    color: "#FFFFFF",
  },
  waveformSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginRight: 4,
  },
  waveBarSmall: {
    width: 2,
    borderRadius: 1,
    backgroundColor: "#1C3040",
  },
  waveBarDone: {
    backgroundColor: "rgba(0,216,230,0.5)",
  },
  codewordDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,216,230,0.07)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,216,230,0.18)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: "100%",
    marginBottom: 4,
  },
  codewordText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  editText: {
    color: "#00D8E6",
    fontSize: 11,
    fontWeight: "600",
  },

  // Contacts
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10,26,38,0.8)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#122030",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,216,230,0.15)",
    borderWidth: 1,
    borderColor: "rgba(0,216,230,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#00D8E6",
    fontSize: 15,
    fontWeight: "700",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  contactPhone: {
    color: "#6A8898",
    fontSize: 11,
  },
  roleTag: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rolePrimary: {
    color: "#00D8E6",
    backgroundColor: "rgba(0,216,230,0.12)",
  },
  roleSecondary: {
    color: "#4A8898",
    backgroundColor: "rgba(74,136,152,0.12)",
  },

  addContactBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#1C3040",
    borderRadius: 12,
    borderStyle: "dashed",
    paddingVertical: 13,
    width: "100%",
    marginTop: 8,
  },
  addContactText: {
    color: "#00D8E6",
    fontSize: 13,
    fontWeight: "600",
  },

  encryptedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  encryptedText: {
    color: "#4A9060",
    fontSize: 11,
  },

  skipText: {
    color: "#4A6070",
    fontSize: 12,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
