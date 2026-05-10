import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type Section = {
  id: string;
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  content: React.ReactNode;
};

// ─── Styles MUST be declared before SECTIONS (used in JSX at module load) ────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020B14" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#0D1E2A" },
  backBtn: { padding: 4, width: 28 },
  headerTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 52, alignItems: "center" },
  topBadge: { width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(0,216,230,0.1)", borderWidth: 1.5, borderColor: "rgba(0,216,230,0.3)", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  title: { color: "#FFFFFF", fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: 6 },
  subtitle: { color: "#8FB8C4", fontSize: 13, lineHeight: 20, textAlign: "center", marginBottom: 10 },
  metaRow: { backgroundColor: "rgba(28,48,64,0.5)", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 16 },
  metaText: { color: "#4A6070", fontSize: 11, fontWeight: "600" },
  section: { width: "100%", marginBottom: 6, backgroundColor: "rgba(10,26,38,0.85)", borderRadius: 12, borderWidth: 1, borderColor: "#122030", overflow: "hidden" },
  sectionHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  iconWrap: { width: 30, height: 30, borderRadius: 8, backgroundColor: "rgba(0,216,230,0.1)", justifyContent: "center", alignItems: "center" },
  sectionTitle: { flex: 1, color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  sectionBody: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: "#0D1E2A" },
  p: { color: "#8FB8C4", fontSize: 12, lineHeight: 20, marginTop: 10 },
  b: { color: "#FFFFFF", fontWeight: "700" },
  link: { color: "#00D8E6", fontWeight: "700" },
  warningBox: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "rgba(230,160,0,0.1)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(230,160,0,0.3)", padding: 12, marginTop: 10 },
  warningText: { color: "#E6A000", fontSize: 12, lineHeight: 18, flex: 1, fontWeight: "600" },
  sectionSub: { color: "#FFFFFF", fontSize: 12, fontWeight: "700", marginTop: 10, marginBottom: 4 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 6 },
  bulletText: { color: "#8FB8C4", fontSize: 12, lineHeight: 18, flex: 1 },
  contactBox: { width: "100%", backgroundColor: "rgba(0,216,230,0.07)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(0,216,230,0.18)", padding: 16, alignItems: "center", marginTop: 12, marginBottom: 16 },
  contactTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "700", marginBottom: 8 },
  contactItem: { color: "#8FB8C4", fontSize: 12, marginBottom: 4 },
  doneBtn: { width: "100%", maxWidth: 300, height: 46, borderRadius: 14, borderWidth: 2, borderColor: "#00D8E6", backgroundColor: "rgba(0,216,230,0.12)", justifyContent: "center", alignItems: "center" },
  doneBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});

// ─── Sections (uses s — defined above) ────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    id: "service",
    title: "1. Beskrivning av tjänsten",
    icon: "shield",
    content: (
      <Text style={s.p}>
        SentraSense är en personlig säkerhetsapp som via AI-baserad
        röstdetektering kan larma dina nödkontakter vid en nödsituation.
        Tjänsten tillhandahålls av <Text style={s.b}>SentraSense AB</Text>.{"\n\n"}
        Appen inkluderar: kodordsdetektering, nödlarm, delning av position och
        ljudinspelning med registrerade nödkontakter.
      </Text>
    ),
  },
  {
    id: "age",
    title: "2. Ålder och behörighet",
    icon: "person",
    content: (
      <Text style={s.p}>
        Du måste vara minst <Text style={s.b}>18 år</Text> för att använda
        SentraSense. Genom att skapa ett konto bekräftar du att du uppfyller
        detta krav.{"\n\n"}
        Du ansvarar för att kontoinformation är korrekt och att kontot inte
        delas med obehöriga.
      </Text>
    ),
  },
  {
    id: "112",
    title: "3. Viktigt – SentraSense ersätter inte 112",
    icon: "warning",
    content: (
      <View>
        <View style={s.warningBox}>
          <Ionicons name="warning" size={18} color="#E6A000" style={{ marginRight: 10, flexShrink: 0 }} />
          <Text style={s.warningText}>
            SentraSense är ett komplement – INTE ett alternativ till att ringa
            112 (eller lokalt nödnummer). Ring alltid 112 i en akut och
            livshotande situation.
          </Text>
        </View>
        <Text style={s.p}>
          SentraSense ansvarar inte för skada eller förlust till följd av att
          tjänsten inte fungerar som förväntat i en nödsituation. Faktorer som
          kan påverka tjänsten inkluderar: saknad internetanslutning, lågt
          batteri, felkonfigurerade nödkontakter, bakgrundsbuller eller
          missidentifiering av kodordet.
        </Text>
      </View>
    ),
  },
  {
    id: "use",
    title: "4. Tillåten användning",
    icon: "checkmark-circle",
    content: (
      <View>
        <Text style={s.sectionSub}>Du får:</Text>
        {[
          "Använda appen för personlig säkerhet.",
          "Lägga till nödkontakter som har informerats om sin roll.",
          "Använda appen på din egen enhet.",
        ].map((t) => (
          <View key={t} style={s.bulletRow}>
            <Ionicons name="checkmark" size={13} color="#00D8E6" style={{ marginRight: 7 }} />
            <Text style={s.bulletText}>{t}</Text>
          </View>
        ))}
        <Text style={[s.sectionSub, { marginTop: 12 }]}>Du får INTE:</Text>
        {[
          "Missbruka larmsystemet eller testa larmet utan att informera dina kontakter.",
          "Försöka extrahera, dekompilera eller manipulera appens kod.",
          "Registrera fiktiva nödkontakter utan deras vetskap och medgivande.",
          "Använda appen för att samla in information om andra utan deras samtycke.",
        ].map((t) => (
          <View key={t} style={s.bulletRow}>
            <Ionicons name="close" size={13} color="#E63946" style={{ marginRight: 7 }} />
            <Text style={s.bulletText}>{t}</Text>
          </View>
        ))}
      </View>
    ),
  },
  {
    id: "responsibility",
    title: "5. Ansvarsbegränsning",
    icon: "information-circle",
    content: (
      <Text style={s.p}>
        SentraSense AB tillhandahåller tjänsten "i befintligt skick" (as-is).
        Vi garanterar inte 100 % drifttid, felfri röstdetektering eller att
        nödkontakter alltid kan nås.{"\n\n"}
        Ansvar för indirekta skador, utebliven vinst eller konsekventiella
        skador är uteslutna i den maximala utsträckning svensk lag tillåter.{"\n\n"}
        Det maximala skadeståndsbeloppet är begränsat till det belopp du
        betalat för tjänsten under de senaste 12 månaderna (om tillämpligt).
      </Text>
    ),
  },
  {
    id: "ip",
    title: "6. Immateriella rättigheter",
    icon: "code-slash",
    content: (
      <Text style={s.p}>
        Allt innehåll, all kod och alla algoritmer i SentraSense ägs av
        SentraSense AB eller dess licensgivare. Du ges en begränsad,
        icke-exklusiv licens att använda appen för personligt bruk.{"\n\n"}
        Inget i dessa villkor ger dig rätt att kopiera, distribuera eller
        skapa avledda verk baserade på SentraSense.
      </Text>
    ),
  },
  {
    id: "data",
    title: "7. Personuppgifter",
    icon: "lock-closed",
    content: (
      <Text style={s.p}>
        Behandlingen av dina personuppgifter regleras av vår{" "}
        <Text
          style={s.link}
          onPress={() => router.push("/privacy-info" as any)}
        >
          Integritetspolicy
        </Text>
        , som är en integrerad del av dessa villkor. Genom att acceptera dessa
        villkor bekräftar du att du har läst och förstått Integritetspolicyn.
      </Text>
    ),
  },
  {
    id: "termination",
    title: "8. Avslutande av konto",
    icon: "exit",
    content: (
      <Text style={s.p}>
        Du kan radera ditt konto och all tillhörande data när som helst via
        Inställningar → Konto → Radera konto.{"\n\n"}
        Vi förbehåller oss rätten att stänga av eller avsluta konton som
        missbrukar tjänsten, utan förvarning.
      </Text>
    ),
  },
  {
    id: "changes",
    title: "9. Ändringar av villkoren",
    icon: "document-text",
    content: (
      <Text style={s.p}>
        Vi kan uppdatera dessa villkor. Vid väsentliga ändringar informeras du
        via appen och uppmanas ge nytt samtycke.{"\n\n"}
        Aktuell version: <Text style={s.b}>1.0</Text>. Senast uppdaterad: 2025-05-01.
      </Text>
    ),
  },
  {
    id: "law",
    title: "10. Tillämplig lag och tvistlösning",
    icon: "hammer",
    content: (
      <Text style={s.p}>
        Dessa villkor regleras av <Text style={s.b}>svensk lag</Text>.{"\n\n"}
        Tvister ska i första hand lösas genom förhandling. Om en lösning inte
        kan nås är Stockholms tingsrätt exklusivt behörig domstol.{"\n\n"}
        Konsumenter kan även vända sig till{" "}
        <Text style={s.b}>Allmänna reklamationsnämnden (ARN)</Text> på
        arn.se eller EU:s tvistlösningsplattform på ec.europa.eu/consumers/odr.
      </Text>
    ),
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Terms() {
  const [expanded, setExpanded] = useState<string | null>("service");

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#00D8E6" />
        </Pressable>
        <Text style={s.headerTitle}>Användarvillkor</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.topBadge}>
          <Ionicons name="document-text" size={28} color="#00D8E6" />
        </View>
        <Text style={s.title}>Användarvillkor</Text>
        <Text style={s.subtitle}>
          Läs dessa villkor noggrant. Genom att använda SentraSense godkänner du dem.
        </Text>

        <View style={s.metaRow}>
          <Text style={s.metaText}>Version 1.0  •  Gäller från 2025-05-01</Text>
        </View>

        {SECTIONS.map((sec) => (
          <View key={sec.id} style={s.section}>
            <Pressable
              style={s.sectionHeader}
              onPress={() =>
                setExpanded((prev) => (prev === sec.id ? null : sec.id))
              }
            >
              <View style={s.iconWrap}>
                <Ionicons name={sec.icon} size={16} color="#00D8E6" />
              </View>
              <Text style={s.sectionTitle}>{sec.title}</Text>
              <Ionicons
                name={expanded === sec.id ? "chevron-up" : "chevron-down"}
                size={14}
                color="#4A6070"
              />
            </Pressable>
            {expanded === sec.id && (
              <View style={s.sectionBody}>{sec.content}</View>
            )}
          </View>
        ))}

        <View style={s.contactBox}>
          <Ionicons name="mail" size={16} color="#00D8E6" style={{ marginBottom: 6 }} />
          <Text style={s.contactTitle}>Frågor om villkoren?</Text>
          <Text style={s.contactItem}>E-post: legal@sentrasense.se</Text>
          <Text style={s.contactItem}>SentraSense AB, Stockholm, Sverige</Text>
        </View>

        <Pressable style={s.doneBtn} onPress={() => router.back()}>
          <Text style={s.doneBtnText}>Jag har läst villkoren – gå tillbaka</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
