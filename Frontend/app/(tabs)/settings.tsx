import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  TextInput,
  Modal,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

const API = "http://localhost:5255";
const CONSENT_VERSION = "1.0";

type ConsentType = "microphone" | "location" | "audio_recording" | "terms_of_service" | "privacy_policy";

const FUNCTIONAL_CONSENTS: ConsentType[] = ["microphone", "location", "audio_recording"];
const LEGAL_CONSENTS: ConsentType[] = ["terms_of_service", "privacy_policy"];

const CONSENT_META: Record<ConsentType, { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; warning: string }> = {
  microphone: {
    icon: "mic-outline",
    label: "Mikrofonåtkomst",
    warning: "Utan mikrofonåtkomst kan appen inte lyssna efter ditt kodord och aktivera larm automatiskt.",
  },
  location: {
    icon: "location-outline",
    label: "Platsdelning",
    warning: "Utan platsdelning kan dina nödkontakter inte lokalisera dig när ett larm utlöses.",
  },
  audio_recording: {
    icon: "cellular",
    label: "Ljudinspelning vid larm",
    warning: "Utan ljudinspelning kan inga bevis sparas vid ett larm, vilket kan försvåra en polisutredning.",
  },
  terms_of_service: {
    icon: "document-text-outline",
    label: "Användarvillkor",
    warning: "Du måste ha godkänt användarvillkoren för att använda SentraSense. Återkallelse innebär att kontot stängs av.",
  },
  privacy_policy: {
    icon: "shield-checkmark-outline",
    label: "Integritetspolicy",
    warning: "Du måste ha godkänt integritetspolicyn (GDPR) för att använda SentraSense. Återkallelse innebär att kontot stängs av.",
  },
};

// ─── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: React.ComponentProps<typeof Ionicons>["name"]; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={14} color="#00D8E6" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

// ─── Setting row ───────────────────────────────────────────────────────────────
function SettingRow({
  icon,
  label,
  sublabel,
  onPress,
  chevron = true,
  destructive = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  sublabel?: string;
  onPress?: () => void;
  chevron?: boolean;
  destructive?: boolean;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.settingRow, pressed && styles.settingRowPressed]} onPress={onPress}>
      <View style={[styles.settingIcon, destructive && styles.settingIconDestructive]}>
        <Ionicons name={icon} size={17} color={destructive ? "#FF4F4F" : "#00D8E6"} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingLabel, destructive && styles.settingLabelDestructive]}>{label}</Text>
        {sublabel ? <Text style={styles.settingSubLabel}>{sublabel}</Text> : null}
      </View>
      {chevron && <Ionicons name="chevron-forward" size={15} color="#4A6070" />}
    </Pressable>
  );
}

// ─── Consent toggle row ────────────────────────────────────────────────────────
function ConsentRow({
  type,
  value,
  onToggle,
  disabled,
}: {
  type: ConsentType;
  value: boolean;
  onToggle: (type: ConsentType, newValue: boolean) => void;
  disabled?: boolean;
}) {
  const meta = CONSENT_META[type];
  return (
    <View style={styles.consentRow}>
      <View style={styles.consentIcon}>
        <Ionicons name={meta.icon} size={17} color="#00D8E6" />
      </View>
      <Text style={styles.consentLabel}>{meta.label}</Text>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={(v) => onToggle(type, v)}
        trackColor={{ false: "#1C3040", true: "#00A8B4" }}
        thumbColor={value ? "#00D8E6" : "#4A6070"}
      />
    </View>
  );
}

// ─── Warning banner ────────────────────────────────────────────────────────────
function WarningBanner({ text }: { text: string }) {
  return (
    <View style={styles.warningBanner}>
      <Ionicons name="warning-outline" size={15} color="#F5A623" style={{ marginRight: 8, marginTop: 1 }} />
      <Text style={styles.warningText}>{text}</Text>
    </View>
  );
}

// ─── Edit profile modal ────────────────────────────────────────────────────────
function EditProfileModal({
  visible,
  initialName,
  initialPhone,
  onClose,
  onSave,
}: {
  visible: boolean;
  initialName: string;
  initialPhone: string;
  onClose: () => void;
  onSave: (name: string, phone: string) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) { setName(initialName); setPhone(initialPhone); }
  }, [visible, initialName, initialPhone]);

  const handleSave = async () => {
    setLoading(true);
    try { await onSave(name.trim(), phone.trim()); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Redigera personuppgifter</Text>

          <Text style={styles.fieldLabel}>Namn</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={14} color="#9CC6CF" style={styles.inputIcon} />
            <TextInput
              style={styles.inputField}
              value={name}
              onChangeText={setName}
              placeholder="Ditt namn"
              placeholderTextColor="#4A6070"
              selectionColor="#00D8E6"
              autoCorrect={false}
            />
          </View>

          <Text style={styles.fieldLabel}>Telefonnummer</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="call-outline" size={14} color="#9CC6CF" style={styles.inputIcon} />
            <TextInput
              style={styles.inputField}
              value={phone}
              onChangeText={setPhone}
              placeholder="+46 70 000 00 00"
              placeholderTextColor="#4A6070"
              selectionColor="#00D8E6"
              keyboardType="phone-pad"
              autoCorrect={false}
            />
          </View>

          <View style={styles.modalActions}>
            <Pressable style={styles.modalCancel} onPress={onClose}>
              <Text style={styles.modalCancelText}>Avbryt</Text>
            </Pressable>
            <Pressable style={styles.modalSave} onPress={handleSave} disabled={loading}>
              {loading
                ? <ActivityIndicator size="small" color="#00D8E6" />
                : <Text style={styles.modalSaveText}>Spara</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Confirm modal ────────────────────────────────────────────────────────────
type ConfirmConfig = {
  title: string;
  message: string;
  confirmText: string;
  destructive?: boolean;
  onConfirm: () => void;
};

function ConfirmModal({
  config,
  onClose,
}: {
  config: ConfirmConfig | null;
  onClose: () => void;
}) {
  if (!config) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{config.title}</Text>
          <Text style={styles.confirmMessage}>{config.message}</Text>
          <View style={styles.modalActions}>
            <Pressable style={styles.modalCancel} onPress={onClose}>
              <Text style={styles.modalCancelText}>Avbryt</Text>
            </Pressable>
            <Pressable
              style={[styles.modalSave, config.destructive && styles.modalSaveDestructive]}
              onPress={() => { onClose(); config.onConfirm(); }}
            >
              <Text style={[styles.modalSaveText, config.destructive && styles.modalSaveTextDestructive]}>
                {config.confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main settings screen ──────────────────────────────────────────────────────
export default function Settings() {
  const { user, setUser } = useAuth();

  const [profileName, setProfileName] = useState(user?.name ?? "");
  const [profilePhone, setProfilePhone] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [consents, setConsents] = useState<Partial<Record<ConsentType, boolean>>>({});
  const [consentsLoaded, setConsentsLoaded] = useState(false);
  const [savingConsent, setSavingConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  const [showFunctionalWarning, setShowFunctionalWarning] = useState(false);
  const [showLegalWarning, setShowLegalWarning] = useState(false);

  // Load profile + consents on mount
  useEffect(() => {
    if (!user) return;
    // Load user profile (phone)
    fetch(`${API}/api/users/${user.userId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setProfileName(data.name ?? "");
          setProfilePhone(data.phone ?? "");
        }
      })
      .catch(() => {});

    // Load consents
    fetch(`${API}/api/users/${user.userId}/consents`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: { consentType: string; granted: boolean }[]) => {
        const map: Partial<Record<ConsentType, boolean>> = {};
        for (const item of data) {
          map[item.consentType as ConsentType] = item.granted;
        }
        setConsents(map);
        setConsentsLoaded(true);
      })
      .catch(() => setConsentsLoaded(true));
  }, [user]);

  // Derived warning visibility
  useEffect(() => {
    const anyFunctionalOff = FUNCTIONAL_CONSENTS.some((t) => consents[t] === false);
    setShowFunctionalWarning(anyFunctionalOff);
    const anyLegalOff = LEGAL_CONSENTS.some((t) => consents[t] === false);
    setShowLegalWarning(anyLegalOff);
  }, [consents]);

  const handleConsentToggle = useCallback(
    (type: ConsentType, newValue: boolean) => {
      const meta = CONSENT_META[type];
      if (!newValue) {
        setConfirmConfig({
          title: `Återkalla ${meta.label}?`,
          message: `${meta.warning}\n\nÄr du säker på att du vill återkalla detta samtycke?`,
          confirmText: "Återkalla",
          destructive: true,
          onConfirm: () => persistConsent(type, false),
        });
      } else {
        persistConsent(type, true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, consents]
  );

  const persistConsent = async (type: ConsentType, granted: boolean) => {
    setConsents((prev) => ({ ...prev, [type]: granted }));
    if (!user) return;
    setSavingConsent(true);
    setConsentError(false);
    try {
      await fetch(`${API}/api/users/${user.userId}/consents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consentVersion: CONSENT_VERSION,
          consents: [{ consentType: type, granted }],
        }),
      });
    } catch {
      setConsents((prev) => ({ ...prev, [type]: !granted }));
      setConsentError(true);
    } finally {
      setSavingConsent(false);
    }
  };

  const handleSaveProfile = async (name: string, phone: string) => {
    if (!user) return;
    const res = await fetch(`${API}/api/users/${user.userId}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    if (!res.ok) return; // modal stays open on error
    setProfileName(name);
    setProfilePhone(phone);
    setUser({ ...user, name });
    setEditModalVisible(false);
  };

  const handleLogout = () => {
    setConfirmConfig({
      title: "Logga ut",
      message: "Är du säker på att du vill logga ut?",
      confirmText: "Logga ut",
      destructive: true,
      onConfirm: () => {
        setUser(null);
        router.replace("/landingpage");
      },
    });
  };

  const handleDeleteAccount = () => {
    setConfirmConfig({
      title: "Radera konto",
      message: "All din data – inklusive nödkontakter, samtycken och inspelningar – raderas permanent. Detta går inte att ångra.",
      confirmText: "Radera permanent",
      destructive: true,
      onConfirm: async () => {
        if (!user) return;
        const res = await fetch(`${API}/api/users/${user.userId}`, { method: "DELETE" });
        if (res.ok) {
          setUser(null);
          router.replace("/landingpage");
        }
      },
    });
  };

  const allFunctionalOn = FUNCTIONAL_CONSENTS.every((t) => consents[t] !== false);
  const allLegalOn = LEGAL_CONSENTS.every((t) => consents[t] !== false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Inställningar</Text>
          {user && (
            <Text style={styles.pageSubtitle} numberOfLines={1}>{user.email}</Text>
          )}
        </View>

        {/* ── Legal warning ── */}
        {consentsLoaded && !allLegalOn && (
          <WarningBanner text="Du har återkallat obligatoriska juridiska samtycken. SentraSense kan inte användas fullt ut utan dessa." />
        )}
        {consentsLoaded && !allFunctionalOn && (
          <WarningBanner text="Vissa funktioner är avaktiverade. Du kan inte dra full nytta av SentraSense med nuvarande inställningar." />
        )}

        {/* ── Personuppgifter ── */}
        <SectionHeader icon="person-circle-outline" title="Personuppgifter" />
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>
                {profileName ? profileName.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() ?? "?")}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profileName || "Inget namn angivet"}</Text>
              <Text style={styles.profileEmail}>{user?.email ?? ""}</Text>
              {profilePhone ? <Text style={styles.profilePhone}>{profilePhone}</Text> : null}
            </View>
          </View>
          <SettingRow
            icon="pencil-outline"
            label="Redigera uppgifter"
            sublabel="Namn och telefonnummer"
            onPress={() => setEditModalVisible(true)}
          />
        </View>

        {/* ── Behörigheter (funktionella samtycken) ── */}
        <SectionHeader icon="shield-half-outline" title="Behörigheter & Samtycken" />
        <View style={styles.card}>
          <Text style={styles.cardNote}>
            Dessa behörigheter styr SentraSenses kärnfunktioner. Stänger du av dem kan appen inte skydda dig på avsett vis.
          </Text>
          {consentError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={14} color="#FF4F4F" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>Kunde inte spara samtycket. Försök igen.</Text>
            </View>
          )}
          {!consentsLoaded
            ? <ActivityIndicator color="#00D8E6" style={{ marginVertical: 12 }} />
            : FUNCTIONAL_CONSENTS.map((type) => (
                <ConsentRow
                  key={type}
                  type={type}
                  value={consents[type] !== false}
                  onToggle={handleConsentToggle}
                  disabled={savingConsent}
                />
              ))}
        </View>

        {/* ── Juridiska samtycken ── */}
        <SectionHeader icon="document-text-outline" title="Juridiska samtycken" />
        <View style={styles.card}>
          <Text style={styles.cardNote}>
            Dessa samtycken krävs enligt lag och för att använda tjänsten. Återkallelse innebär att ditt konto stängs av.
          </Text>
          {!consentsLoaded
            ? <ActivityIndicator color="#00D8E6" style={{ marginVertical: 12 }} />
            : LEGAL_CONSENTS.map((type) => (
                <ConsentRow
                  key={type}
                  type={type}
                  value={consents[type] !== false}
                  onToggle={handleConsentToggle}
                  disabled={savingConsent}
                />
              ))}
          <View style={styles.legalLinks}>
            <Pressable onPress={() => router.push("/terms" as any)}>
              <Text style={styles.legalLink}>Läs användarvillkor →</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/privacy-info" as any)}>
              <Text style={styles.legalLink}>Läs integritetspolicy →</Text>
            </Pressable>
          </View>
        </View>

        {/* ── Säkerhetsinställningar ── */}
        <SectionHeader icon="lock-closed-outline" title="Säkerhet" />
        <View style={styles.card}>
          <SettingRow
            icon="mic-outline"
            label="Kodord"
            sublabel="Ändra eller träna om ditt larmkodord"
            onPress={() => router.push("/security-setup" as any)}
          />
          <SettingRow
            icon="people-outline"
            label="Nödkontakter"
            sublabel="Hantera dina nödkontakter"
            onPress={() => router.push("/(tabs)/contacts" as any)}
          />
        </View>

        {/* ── Om appen ── */}
        <SectionHeader icon="information-circle-outline" title="Om appen" />
        <View style={styles.card}>
          <SettingRow
            icon="logo-github"
            label="Version"
            sublabel="1.0.0 (beta)"
            chevron={false}
          />
          <SettingRow
            icon="mail-outline"
            label="Support"
            sublabel="sentrasence.alert@gmail.com"
            chevron={false}
          />
          <SettingRow
            icon="shield-checkmark-outline"
            label="Dina GDPR-rättigheter"
            sublabel="Tillgång, rättelse, radering, portabilitet"
            onPress={() => router.push("/privacy-info" as any)}
          />
        </View>

        {/* ── Konto ── */}
        <SectionHeader icon="person-outline" title="Konto" />
        <View style={styles.card}>
          <SettingRow
            icon="log-out-outline"
            label="Logga ut"
            destructive
            chevron={false}
            onPress={handleLogout}
          />
          <SettingRow
            icon="trash-outline"
            label="Radera konto"
            sublabel="Permanent – kan inte ångras"
            destructive
            chevron={false}
            onPress={handleDeleteAccount}
          />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <EditProfileModal
        visible={editModalVisible}
        initialName={profileName}
        initialPhone={profilePhone}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveProfile}
      />

      <ConfirmModal
        config={confirmConfig}
        onClose={() => setConfirmConfig(null)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#08141D" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 40 },

  header: { marginBottom: 20 },
  pageTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "800" },
  pageSubtitle: { color: "#4A6070", fontSize: 12, marginTop: 2 },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: { color: "#00D8E6", fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },

  card: {
    backgroundColor: "rgba(18, 34, 45, 0.75)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(90, 220, 235, 0.12)",
    overflow: "hidden",
  },
  cardNote: {
    color: "#4A6070",
    fontSize: 11,
    lineHeight: 16,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },

  // Profile
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(90, 220, 235, 0.08)",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 216, 230, 0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(0, 216, 230, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: { color: "#00D8E6", fontSize: 18, fontWeight: "800" },
  profileInfo: { flex: 1 },
  profileName: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  profileEmail: { color: "#4A6070", fontSize: 11, marginTop: 2 },
  profilePhone: { color: "#4A6070", fontSize: 11, marginTop: 1 },

  // Setting row
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(90, 220, 235, 0.08)",
  },
  settingRowPressed: { backgroundColor: "rgba(0, 216, 230, 0.06)" },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(0, 216, 230, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  settingIconDestructive: { backgroundColor: "rgba(255, 79, 79, 0.1)" },
  settingText: { flex: 1 },
  settingLabel: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  settingLabelDestructive: { color: "#FF4F4F" },
  settingSubLabel: { color: "#4A6070", fontSize: 11, marginTop: 1 },

  // Consent row
  consentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(90, 220, 235, 0.08)",
  },
  consentIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(0, 216, 230, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  consentLabel: { flex: 1, color: "#FFFFFF", fontSize: 14, fontWeight: "600" },

  // Legal links
  legalLinks: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(90, 220, 235, 0.08)",
    gap: 8,
  },
  legalLink: { color: "#00D8E6", fontSize: 11, fontWeight: "600" },

  // Warning banner
  warningBanner: {
    flexDirection: "row",
    backgroundColor: "rgba(245, 166, 35, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(245, 166, 35, 0.3)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  warningText: { color: "#F5A623", fontSize: 12, lineHeight: 17, flex: 1 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#0D1F2D",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(90, 220, 235, 0.2)",
    padding: 24,
  },
  modalTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "800", marginBottom: 20 },
  fieldLabel: { color: "#9CC6CF", fontSize: 11, fontWeight: "600", marginBottom: 6, marginTop: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(18, 34, 45, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(90, 220, 235, 0.3)",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  inputIcon: {},
  inputField: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 24 },
  modalCancel: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(90, 220, 235, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelText: { color: "#4A6070", fontSize: 14, fontWeight: "600" },
  modalSave: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: "rgba(0, 216, 230, 0.15)",
    borderWidth: 1,
    borderColor: "#00D8E6",
    justifyContent: "center",
    alignItems: "center",
  },
  modalSaveText: { color: "#00D8E6", fontSize: 14, fontWeight: "700" },
  modalSaveDestructive: {
    backgroundColor: "rgba(255, 79, 79, 0.12)",
    borderColor: "#FF4F4F",
  },
  modalSaveTextDestructive: { color: "#FF4F4F" },
  confirmMessage: { color: "#9CC6CF", fontSize: 13, lineHeight: 19, marginBottom: 4 },

  // Error banner
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 79, 79, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 79, 79, 0.25)",
    borderRadius: 8,
    marginHorizontal: 14,
    marginTop: 10,
    padding: 8,
  },
  errorText: { color: "#FF4F4F", fontSize: 12 },
});
