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
  subtitle: { color: "#8FB8C4", fontSize: 13, lineHeight: 20, textAlign: "center", marginBottom: 16 },
  gdprBadgeRow: { flexDirection: "row", gap: 6, marginBottom: 16, flexWrap: "wrap", justifyContent: "center" },
  gdprBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,168,180,0.12)", borderRadius: 8, borderWidth: 1, borderColor: "rgba(0,168,180,0.25)", paddingHorizontal: 8, paddingVertical: 4 },
  gdprBadgeText: { color: "#00A8B4", fontSize: 10, fontWeight: "600" },
  section: { width: "100%", marginBottom: 6, backgroundColor: "rgba(10,26,38,0.85)", borderRadius: 12, borderWidth: 1, borderColor: "#122030", overflow: "hidden" },
  sectionHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  iconWrap: { width: 30, height: 30, borderRadius: 8, backgroundColor: "rgba(0,216,230,0.1)", justifyContent: "center", alignItems: "center" },
  sectionTitle: { flex: 1, color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  sectionBody: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: "#0D1E2A" },
  p: { color: "#8FB8C4", fontSize: 12, lineHeight: 20, marginTop: 10 },
  b: { color: "#FFFFFF", fontWeight: "700" },
  link: { color: "#00D8E6", fontWeight: "700" },
  dataRow: { borderBottomWidth: 1, borderBottomColor: "#0D1E2A", paddingVertical: 8, marginTop: 4 },
  dataLabel: { color: "#FFFFFF", fontSize: 12, fontWeight: "700", marginBottom: 2 },
  dataDesc: { color: "#8FB8C4", fontSize: 12, lineHeight: 17 },
  retRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#0D1E2A", gap: 8 },
  retLabel: { color: "#8FB8C4", fontSize: 12, flex: 1 },
  retVal: { color: "#00D8E6", fontSize: 12, fontWeight: "600", textAlign: "right", maxWidth: 140 },
  rightsRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#0D1E2A", gap: 10 },
  artTag: { backgroundColor: "rgba(0,216,230,0.12)", borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2, color: "#00D8E6", fontSize: 10, fontWeight: "700", width: 52, textAlign: "center", marginTop: 1 },
  rightsDesc: { color: "#8FB8C4", fontSize: 12, lineHeight: 18, flex: 1 },
  contactBox: { width: "100%", backgroundColor: "rgba(0,216,230,0.07)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(0,216,230,0.18)", padding: 16, alignItems: "center", marginTop: 12, marginBottom: 16 },
  contactTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "700", marginBottom: 8 },
  contactItem: { color: "#8FB8C4", fontSize: 12, marginBottom: 4 },
  doneBtn: { width: "100%", maxWidth: 280, height: 46, borderRadius: 14, borderWidth: 2, borderColor: "#00D8E6", backgroundColor: "rgba(0,216,230,0.12)", justifyContent: "center", alignItems: "center" },
  doneBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});

// ─── Sections (uses s — defined above) ────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    id: "controller",
    title: "1. Personuppgiftsansvarig",
    icon: "business",
    content: (
      <Text style={s.p}>
        <Text style={s.b}>SentraSense AB</Text> är personuppgiftsansvarig för din data.{"\n\n"}
        E-post: privacy@sentrasense.se{"\n"}
        Dataskyddsombud: dpo@sentrasense.se
      </Text>
    ),
  },
  {
    id: "data",
    title: "2. Vilken data samlar vi in?",
    icon: "list",
    content: (
      <View>
        {[
          { label: "Google-uppgifter", desc: "Namn, e-post och Google-ID vid kontoregistrering via Google OAuth." },
          { label: "Kodord", desc: "Ditt valda kodord, krypterat i databasen. Behandlas enbart lokalt på enheten vid detektering." },
          { label: "Röstsamples", desc: "3 inspelningar (3 sek vardera) för att personanpassa AI-detektionen. Lagras 90 dagar." },
          { label: "GPS-position", desc: "Delas med nödkontakter enbart när ett larm är aktivt. Raderas 72 h efter att larmet avslutats." },
          { label: "Nödkontakter", desc: "Namn, telefon, e-post och relation för dina registrerade nödkontakter. Krypterat." },
          { label: "Larminspelning", desc: "30 sek ljud vid utlöst larm. Raderas 72 h efter larm (förlängningsbart till 30 dagar)." },
          { label: "Samtycken", desc: "Tidsstämplade samtycken med version enligt Art. 7 GDPR." },
        ].map((item) => (
          <View key={item.label} style={s.dataRow}>
            <Text style={s.dataLabel}>{item.label}</Text>
            <Text style={s.dataDesc}>{item.desc}</Text>
          </View>
        ))}
      </View>
    ),
  },
  {
    id: "basis",
    title: "3. Rättslig grund",
    icon: "shield-checkmark",
    content: (
      <Text style={s.p}>
        All behandling av personuppgifter grundar sig på ditt{" "}
        <Text style={s.b}>samtycke (Art. 6.1.a GDPR)</Text>. Du kan återkalla samtycket
        när som helst utan att det påverkar lagligheten av behandling som skett
        dessförinnan (Art. 7.3 GDPR).{"\n\n"}
        Samtycket är specifikt, informerat, frivilligt och entydigt.
      </Text>
    ),
  },
  {
    id: "retention",
    title: "4. Lagringstider",
    icon: "time",
    content: (
      <View>
        {[
          { typ: "Mikrofondata (ambient)", tid: "Lagras aldrig" },
          { typ: "GPS-position", tid: "72 h efter larmet avslutats" },
          { typ: "Larminspelning", tid: "72 h (förlängningsbar t.o.m. 30 dagar)" },
          { typ: "Röstträningssamples", tid: "90 dagar" },
          { typ: "Nödkontakter", tid: "Tills du tar bort dem" },
          { typ: "Kontouppgifter", tid: "Tills kontot raderas" },
          { typ: "Samtycken", tid: "6 år (beviskrav)" },
        ].map((row, i, arr) => (
          <View
            key={row.typ}
            style={[s.retRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}
          >
            <Text style={s.retLabel}>{row.typ}</Text>
            <Text style={s.retVal}>{row.tid}</Text>
          </View>
        ))}
      </View>
    ),
  },
  {
    id: "recipients",
    title: "5. Mottagare av personuppgifter",
    icon: "share-social",
    content: (
      <Text style={s.p}>
        <Text style={s.b}>Nödkontakter:</Text> Dina registrerade nödkontakter tar
        emot larm, position och eventuell larminspelning vid aktivt larm.{"\n\n"}
        <Text style={s.b}>Azure (Microsoft):</Text> Data lagras i datacenter inom
        EU/EES. Microsoft är personuppgiftsbiträde med ett Data Processing Agreement
        (DPA) på plats.{"\n\n"}
        <Text style={s.b}>Ingen annan tredje part</Text> – vi säljer eller delar
        aldrig din data med annonsörer eller externa parter.
      </Text>
    ),
  },
  {
    id: "rights",
    title: "6. Dina rättigheter",
    icon: "person-circle",
    content: (
      <View>
        {[
          { art: "Art. 15", rätt: "Rätt till tillgång – begär en kopia av dina uppgifter." },
          { art: "Art. 16", rätt: "Rätt till rättelse – korrigera felaktiga uppgifter." },
          { art: "Art. 17", rätt: "Rätt till radering ('rätten att bli glömd')." },
          { art: "Art. 18", rätt: "Rätt till begränsning av behandling." },
          { art: "Art. 20", rätt: "Rätt till dataportabilitet." },
          { art: "Art. 21", rätt: "Rätt att invända mot behandlingen." },
          { art: "Art. 7.3", rätt: "Rätt att återkalla samtycke när som helst." },
        ].map((r) => (
          <View key={r.art} style={s.rightsRow}>
            <Text style={s.artTag}>{r.art}</Text>
            <Text style={s.rightsDesc}>{r.rätt}</Text>
          </View>
        ))}
        <Text style={s.p}>
          Kontakta oss på{" "}
          <Text style={s.link}>privacy@sentrasense.se</Text> för att utöva dina
          rättigheter. Vi svarar inom 30 dagar (GDPR-krav).
        </Text>
      </View>
    ),
  },
  {
    id: "imy",
    title: "7. Rätt att lämna klagomål",
    icon: "alert-circle",
    content: (
      <Text style={s.p}>
        Du har rätt att lämna klagomål till tillsynsmyndigheten om du anser att
        behandlingen av dina personuppgifter strider mot GDPR:{"\n\n"}
        <Text style={s.b}>Integritetsskyddsmyndigheten (IMY)</Text>{"\n"}
        Webbplats: imy.se{"\n"}
        Telefon: 08-657 61 00{"\n"}
        E-post: imy@imy.se
      </Text>
    ),
  },
  {
    id: "cookies",
    title: "8. Cookies och lokal lagring",
    icon: "hardware-chip",
    content: (
      <Text style={s.p}>
        SentraSense-appen använder{" "}
        <Text style={s.b}>ingen tredjepartsspårning</Text> eller reklamcookies.
        Lokal lagring (AsyncStorage/SessionStorage) används enbart för att hålla
        dig inloggad under pågående session. Ingen data delas med
        analysplattformar.
      </Text>
    ),
  },
  {
    id: "security",
    title: "9. Teknisk säkerhet",
    icon: "lock-closed",
    content: (
      <Text style={s.p}>
        • Data i transit: TLS 1.3{"\n"}
        • Data i vila: AES-256 (Azure Storage){"\n"}
        • Databas: krypterade anslutningar, parametriserade frågor{"\n"}
        • Kodord: hashade/krypterade i databasen{"\n"}
        • Röstsamples: krypterade blob-objekt, åtkomst via SAS-token
      </Text>
    ),
  },
  {
    id: "changes",
    title: "10. Ändringar i denna policy",
    icon: "document-text",
    content: (
      <Text style={s.p}>
        Vid väsentliga ändringar informeras du via en notis i appen och uppmanas
        att ge nytt samtycke. Aktuell version: <Text style={s.b}>1.0</Text>.
        Senast uppdaterad: 2025-05-01.
      </Text>
    ),
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function PrivacyInfo() {
  const [expanded, setExpanded] = useState<string | null>("controller");

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#00D8E6" />
        </Pressable>
        <Text style={s.headerTitle}>Integritetspolicy</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.topBadge}>
          <Ionicons name="shield-checkmark" size={28} color="#00D8E6" />
        </View>
        <Text style={s.title}>Din integritet skyddas</Text>
        <Text style={s.subtitle}>
          SentraSense är byggt med GDPR som grund – inte som en eftertanke.
          Här är exakt vad vi samlar in, varför och hur länge.
        </Text>

        <View style={s.gdprBadgeRow}>
          <View style={s.gdprBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#00A8B4" />
            <Text style={s.gdprBadgeText}>GDPR-kompatibel</Text>
          </View>
          <View style={s.gdprBadge}>
            <Ionicons name="server" size={12} color="#00A8B4" />
            <Text style={s.gdprBadgeText}>Lagring i EU/EES</Text>
          </View>
          <View style={s.gdprBadge}>
            <Ionicons name="lock-closed" size={12} color="#00A8B4" />
            <Text style={s.gdprBadgeText}>AES-256 kryptering</Text>
          </View>
        </View>

        {SECTIONS.map((sec) => (
          <View key={sec.id} style={s.section}>
            <Pressable
              style={s.sectionHeader}
              onPress={() => setExpanded((prev) => (prev === sec.id ? null : sec.id))}
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
          <Text style={s.contactTitle}>Kontakta oss angående din data</Text>
          <Text style={s.contactItem}>Allmänna frågor: privacy@sentrasense.se</Text>
          <Text style={s.contactItem}>Dataskyddsombud: dpo@sentrasense.se</Text>
          <Text style={s.contactItem}>Tillsynsmyndighet: IMY (imy.se)</Text>
        </View>

        <Pressable style={s.doneBtn} onPress={() => router.back()}>
          <Text style={s.doneBtnText}>Jag förstår – gå tillbaka</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
