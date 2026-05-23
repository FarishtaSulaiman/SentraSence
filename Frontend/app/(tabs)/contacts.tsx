import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";

const API = "http://localhost:5255";

type Contact = {
  trustedContactId?: string;
  name: string;
  phone: string;
  email?: string;
  relationshipType?: string;
  isPrimary: boolean;
};

// Contact Modal (lägg till / redigera) 

function ContactModal({
  visible,
  userId,
  editing,
  onClose,
  onSaved,
}: {
  visible: boolean;
  userId: string;
  editing: Contact | null;
  onClose: () => void;
  onSaved: (c: Contact, wasEdit: boolean) => void;
}) {
  const isRealEdit =
    !!editing?.trustedContactId && !editing.trustedContactId.startsWith("dev-");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [relation, setRelation] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      setName(editing?.name ?? "");
      setPhone(editing?.phone ?? "");
      setEmail(editing?.email ?? "");
      setRelation(editing?.relationshipType ?? "");
      setIsPrimary(editing?.isPrimary ?? false);
      setError("");
    }
  }, [visible, editing]);

  const handleClose = () => {
    setName(""); setPhone(""); setEmail(""); setRelation("");
    setIsPrimary(false); setError("");
    onClose();
  };

  const handleSave = async () => {
    setError("");
    if (!name.trim()) { setError("Namn krävs."); return; }
    if (!phone.trim()) { setError("Telefonnummer krävs."); return; }

    // Dev mode bypass
    if (userId === "dev") {
      onSaved(
        {
          trustedContactId: editing?.trustedContactId ?? `dev-${Date.now()}`,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          relationshipType: relation.trim() || undefined,
          isPrimary,
        },
        !!editing,
      );
      handleClose();
      return;
    }

    setLoading(true);
    try {
      let res: Response;
      if (isRealEdit && editing?.trustedContactId) {
        res = await fetch(`${API}/api/contacts/${editing.trustedContactId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || null,
            relationshipType: relation.trim() || null,
            isPrimary,
          }),
        });
      } else {
        res = await fetch(`${API}/api/contacts`, {
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
      }
      if (!res.ok) throw new Error(await res.text());
      const saved: Contact = await res.json();
      onSaved(saved, !!editing);
      handleClose();
    } catch {
      setError("Kunde inte spara kontakten. Kontrollera anslutningen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={s.modalOverlay}>
        <View style={s.modalCard}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>
              {editing ? "Redigera kontakt" : "Ny nödkontakt"}
            </Text>
            <Pressable onPress={handleClose}>
              <Ionicons name="close" size={22} color="#4A6070" />
            </Pressable>
          </View>

          {[
            { label: "Namn *", val: name, set: setName, ph: "Anna Svensson", kb: "default" },
            { label: "Telefonnummer *", val: phone, set: setPhone, ph: "+46 70 123 45 67", kb: "phone-pad" },
            { label: "E-post (valfritt)", val: email, set: setEmail, ph: "anna@example.com", kb: "email-address" },
            { label: "Relation (valfritt)", val: relation, set: setRelation, ph: "Mamma, Vän, Partner...", kb: "default" },
          ].map((f) => (
            <View key={f.label} style={s.modalField}>
              <Text style={s.modalLabel}>{f.label}</Text>
              <TextInput
                style={s.modalInput}
                value={f.val}
                onChangeText={f.set as any}
                placeholder={f.ph}
                placeholderTextColor="#3A5060"
                keyboardType={f.kb as any}
              />
            </View>
          ))}

          <Pressable style={s.primaryRow} onPress={() => setIsPrimary((v) => !v)}>
            <View style={[s.checkbox, isPrimary && s.checkboxChecked]}>
              {isPrimary && <Ionicons name="checkmark" size={11} color="#00D8E6" />}
            </View>
            <Text style={s.modalLabel}>Sätt som primär nödkontakt</Text>
          </Pressable>

          {error ? <Text style={s.modalError}>{error}</Text> : null}

          <Pressable
            style={[s.btn, loading && s.btnDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={s.btnText}>
                {editing ? "Spara ändringar" : "Spara kontakt"}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function Contacts() {
  const { user } = useAuth();
  const userId = user?.userId ?? "dev";

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetch(`${API}/api/contacts/${user.userId}`)
      .then((r) => r.json())
      .then(setContacts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const openAdd = () => { setEditing(null); setShowModal(true); };
  const openEdit = (c: Contact) => { setEditing(c); setShowModal(true); };

  const handleSaved = (c: Contact, wasEdit: boolean) => {
    setContacts((prev) => {
      // Demote other primaries if new/edited contact is primary
      const base = c.isPrimary ? prev.map((x) => ({ ...x, isPrimary: false })) : [...prev];
      if (wasEdit) {
        return base.map((x) =>
          x.trustedContactId === c.trustedContactId ? c : x
        );
      }
      return [...base, c];
    });
  };

  const doDelete = async (c: Contact) => {
    const isDevContact =
      userId === "dev" ||
      !c.trustedContactId ||
      c.trustedContactId.startsWith("dev-");
    if (isDevContact) {
      setContacts((prev) => prev.filter((x) => x.trustedContactId !== c.trustedContactId));
      return;
    }
    try {
      const res = await fetch(`${API}/api/contacts/${c.trustedContactId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setContacts((prev) => prev.filter((x) => x.trustedContactId !== c.trustedContactId));
    } catch {
      Alert.alert("Fel", "Kunde inte ta bort kontakten.");
    }
  };

  const handleDelete = (c: Contact) => {
    if (Platform.OS === "web") {
      if (window.confirm(`Ta bort ${c.name}?`)) doDelete(c);
      return;
    }
    Alert.alert(
      "Ta bort kontakt",
      `Är du säker på att du vill ta bort ${c.name}?`,
      [
        { text: "Avbryt", style: "cancel" },
        { text: "Ta bort", style: "destructive", onPress: () => doDelete(c) },
      ]
    );
  };

  const handleSetPrimary = async (c: Contact) => {
    if (c.isPrimary) return;
    const isDevContact =
      userId === "dev" ||
      !c.trustedContactId ||
      c.trustedContactId.startsWith("dev-");
    if (isDevContact) {
      setContacts((prev) =>
        prev.map((x) => ({
          ...x,
          isPrimary: x.trustedContactId === c.trustedContactId,
        }))
      );
      return;
    }
    try {
      await fetch(`${API}/api/contacts/${c.trustedContactId}/set-primary`, {
        method: "PATCH",
      });
      setContacts((prev) =>
        prev.map((x) => ({
          ...x,
          isPrimary: x.trustedContactId === c.trustedContactId,
        }))
      );
    } catch {
      Alert.alert("Fel", "Kunde inte uppdatera primärkontakt.");
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Nödkontakter</Text>
            <Text style={s.headerSub}>
              {contacts.length > 0
                ? `${contacts.length} kontakt${contacts.length !== 1 ? "er" : ""} registrerade`
                : "Inga kontakter ännu"}
            </Text>
          </View>
          <Pressable style={s.addIconBtn} onPress={openAdd}>
            <Ionicons name="add" size={22} color="#00D8E6" />
          </Pressable>
        </View>

        {/* Info-box */}
        <View style={s.infoBox}>
          <Ionicons
            name="shield-checkmark-outline"
            size={15}
            color="#00D8E6"
            style={{ marginRight: 8, marginTop: 1 }}
          />
          <Text style={s.infoText}>
            Vid larm får dina nödkontakter din GPS-position och en
            ljudinspelning. Kontaktuppgifter lagras krypterat (GDPR Art. 6.1.a)
            och delas aldrig med tredje part.{" "}
            <Text style={s.primaryHint}>Tryck på en kontakt för att sätta den som primär.</Text>
          </Text>
        </View>

        {/* Lista */}
        {loading ? (
          <ActivityIndicator color="#00D8E6" style={{ marginTop: 48 }} />
        ) : contacts.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons name="people-outline" size={52} color="#1C3040" />
            <Text style={s.emptyTitle}>Inga nödkontakter</Text>
            <Text style={s.emptyText}>
              Lägg till minst en person som automatiskt larmas om du aktiverar
              nödläget.
            </Text>
            <Pressable style={s.emptyBtn} onPress={openAdd}>
              <Ionicons
                name="add-circle-outline"
                size={16}
                color="#00D8E6"
                style={{ marginRight: 6 }}
              />
              <Text style={s.addContactText}>Lägg till nödkontakt</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={s.sectionLabel}>
              DINA KONTAKTER ({contacts.length})
            </Text>
            <View style={s.cardList}>
              {contacts.map((c) => (
                <View
                  key={c.trustedContactId ?? c.name}
                  style={[s.contactCard, c.isPrimary && s.contactCardPrimary]}
                >
                  {/* Tryck på huvudytan → sätt primär */}
                  <Pressable
                    style={s.contactMain}
                    onPress={() => handleSetPrimary(c)}
                  >
                    <View
                      style={[
                        s.avatarCircle,
                        c.isPrimary && s.avatarCirclePrimary,
                      ]}
                    >
                      <Text style={s.avatarText}>
                        {c.name[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={s.contactInfo}>
                      <View style={s.nameRow}>
                        <Text style={s.contactName}>{c.name}</Text>
                        {c.isPrimary && (
                          <View style={s.primaryBadge}>
                            <Ionicons
                              name="star"
                              size={8}
                              color="#00D8E6"
                              style={{ marginRight: 3 }}
                            />
                            <Text style={s.primaryBadgeText}>Primär</Text>
                          </View>
                        )}
                      </View>
                      <Text style={s.contactPhone}>{c.phone}</Text>
                      {c.email ? (
                        <Text style={s.contactEmail}>{c.email}</Text>
                      ) : null}
                      {c.relationshipType ? (
                        <Text style={s.contactRelation}>
                          {c.relationshipType}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>

                  {/* Åtgärdsknappar */}
                  <View style={s.contactActions}>
                    <Pressable
                      onPress={() => openEdit(c)}
                      style={s.actionBtn}
                      hitSlop={6}
                    >
                      <Ionicons
                        name="pencil-outline"
                        size={17}
                        color="#4A6070"
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(c)}
                      style={s.actionBtn}
                      hitSlop={6}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={17}
                        color="#E63946"
                      />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

            {/* Lägg till fler */}
            <Pressable style={s.addRow} onPress={openAdd}>
              <Ionicons
                name="add-circle-outline"
                size={16}
                color="#00D8E6"
                style={{ marginRight: 6 }}
              />
              <Text style={s.addContactText}>Lägg till fler nödkontakter</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <ContactModal
        visible={showModal}
        userId={userId}
        editing={editing}
        onClose={() => setShowModal(false)}
        onSaved={handleSaved}
      />
    </SafeAreaView>
  );
}

//  Styles

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#08141D" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    marginTop: 4,
  },
  headerTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  headerSub: { color: "#4A6070", fontSize: 12, marginTop: 2 },
  addIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,216,230,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,216,230,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },

  infoBox: {
    flexDirection: "row",
    backgroundColor: "rgba(0,216,230,0.07)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,216,230,0.18)",
    padding: 12,
    marginBottom: 16,
  },
  infoText: { color: "#8FB8C4", fontSize: 12, lineHeight: 18, flex: 1 },
  primaryHint: { color: "#4A6070", fontStyle: "italic" },

  sectionLabel: {
    color: "#4A6070",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  cardList: { gap: 8, marginBottom: 12 },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10,26,38,0.85)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#122030",
    paddingRight: 10,
  },
  contactCardPrimary: {
    borderColor: "rgba(0,216,230,0.35)",
    backgroundColor: "rgba(0,216,230,0.05)",
  },
  contactMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,216,230,0.10)",
    borderWidth: 1,
    borderColor: "#1C3040",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarCirclePrimary: {
    borderColor: "rgba(0,216,230,0.5)",
    backgroundColor: "rgba(0,216,230,0.15)",
  },
  avatarText: { color: "#00D8E6", fontSize: 16, fontWeight: "700" },
  contactInfo: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  contactName: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  primaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,216,230,0.12)",
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  primaryBadgeText: { color: "#00D8E6", fontSize: 10, fontWeight: "700" },
  contactPhone: { color: "#6A8898", fontSize: 12 },
  contactEmail: { color: "#4A6070", fontSize: 11, marginTop: 1 },
  contactRelation: {
    color: "#4A6070",
    fontSize: 10,
    marginTop: 2,
    fontStyle: "italic",
  },
  contactActions: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionBtn: { padding: 8 },

  addRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#1C3040",
    borderRadius: 12,
    borderStyle: "dashed",
    paddingVertical: 14,
    marginBottom: 12,
  },
  addContactText: { color: "#00D8E6", fontSize: 13, fontWeight: "600" },

  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: "#4A6070",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 280,
    marginBottom: 20,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(0,216,230,0.4)",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 11,
    backgroundColor: "rgba(0,216,230,0.07)",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#0A1822",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: "#1C3040",
    padding: 20,
    paddingBottom: 44,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  modalField: { marginBottom: 12 },
  modalLabel: { color: "#8FB8C4", fontSize: 12, marginBottom: 5 },
  modalInput: {
    backgroundColor: "rgba(18,34,45,0.9)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1C3040",
    color: "#FFFFFF",
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: "#5EAFC0",
    backgroundColor: "rgba(8,22,30,0.45)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: "rgba(0,216,230,0.12)",
    borderColor: "#00D8E6",
  },
  modalError: {
    color: "#FFB4B4",
    fontSize: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  btn: {
    width: "100%",
    height: 46,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#00D8E6",
    backgroundColor: "rgba(0,216,230,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  btnDisabled: {
    borderColor: "#1C3040",
    backgroundColor: "rgba(28,48,64,0.4)",
  },
  btnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
