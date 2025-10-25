import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

const PLATFORM_META = [
  { key: "steam", label: "Steam", icon: "logo-steam" },
  { key: "xbox", label: "Xbox", icon: "logo-xbox" },
  { key: "psn", label: "PlayStation", icon: "logo-playstation" },
  { key: "discord", label: "Discord", icon: "logo-discord" },
];

function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString();
  } catch (err) {
    return null;
  }
}

function buildInitialForm(user) {
  return {
    avatarUrl: user?.avatarUrl || "",
    bio: user?.bio || "",
    platformHandles: {
      steam: user?.platformHandles?.steam || "",
      xbox: user?.platformHandles?.xbox || "",
      psn: user?.platformHandles?.psn || "",
      discord: user?.platformHandles?.discord || "",
    },
  };
}

export default function Profile() {
  const { user, updateProfile, refreshUser, logout, deleteAccount, isLoading } =
    useAuth();
  const [editVisible, setEditVisible] = useState(false);
  const [form, setForm] = useState(buildInitialForm(user));
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setForm(buildInitialForm(user));
  }, [user]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(""), 3000);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const joined = formatDate(user?.createdAt);
  const friendsCount = user?.friends?.length ?? 0;

  const initials = useMemo(() => {
    if (user?.username) return user.username[0]?.toUpperCase() || "?";
    if (user?.email) return user.email[0]?.toUpperCase() || "?";
    return "?";
  }, [user?.username, user?.email]);

  const handleSaveProfile = async () => {
    const sanitizedHandles = Object.fromEntries(
      Object.entries(form.platformHandles).map(([key, value]) => [
        key,
        value.trim() || null,
      ])
    );

    const payload = {
      avatarUrl: form.avatarUrl.trim() || null,
      bio: form.bio.trim() || null,
      platformHandles: sanitizedHandles,
    };

    try {
      setSaving(true);
      setErrorMessage("");
      await updateProfile(payload);
      setFeedback("profile updated");
      setEditVisible(false);
    } catch (err) {
      setErrorMessage(
        err?.message ||
          err?.body?.message ||
          "unable to update profile right now"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "delete account",
      "this action will remove your profile and backlog forever.",
      [
        { text: "cancel", style: "cancel" },
        {
          text: "delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
            } catch (err) {
              setErrorMessage(
                err?.message || err?.body?.message || "failed to delete account"
              );
            }
          },
        },
      ]
    );
  };

  const renderAvatar = () => {
    if (form.avatarUrl || user?.avatarUrl) {
      return (
        <Image
          source={{ uri: form.avatarUrl || user?.avatarUrl }}
          style={styles.avatar}
        />
      );
    }
    return (
      <View style={styles.avatarFallback}>
        <Text style={styles.avatarInitial}>{initials}</Text>
      </View>
    );
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshUser();
      setFeedback("profile refreshed");
    } catch (err) {
      setErrorMessage(
        err?.message || err?.body?.message || "unable to refresh profile"
      );
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.headerCard}>
          {renderAvatar()}
          <Text style={styles.name}>{user?.username || "player"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {joined && (
            <Text style={styles.meta}>joined {joined.toLowerCase()}</Text>
          )}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{friendsCount}</Text>
              <Text style={styles.statLabel}>friends</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {user?.platformHandles
                  ? Object.values(user.platformHandles).filter(Boolean)?.length
                  : 0}
              </Text>
              <Text style={styles.statLabel}>linked handles</Text>
            </View>
          </View>
          {user?.bio ? (
            <Text style={styles.bio}>{user.bio}</Text>
          ) : (
            <Text style={styles.bioPlaceholder}>
              add a short bio so friends know what you're playing
            </Text>
          )}
          {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>platform handles</Text>
            <TouchableOpacity
              onPress={() => setEditVisible(true)}
              style={styles.sectionAction}
            >
              <Ionicons name="create-outline" size={16} color="#4ade80" />
              <Text style={styles.sectionActionText}>edit</Text>
            </TouchableOpacity>
          </View>
          {PLATFORM_META.map(({ key, label, icon }) => {
            const value =
              form.platformHandles[key] || user?.platformHandles?.[key];
            return (
              <View style={styles.platformRow} key={key}>
                <Ionicons name={icon} size={20} color="#4ade80" />
                <View style={styles.platformInfo}>
                  <Text style={styles.platformLabel}>{label}</Text>
                  <Text style={styles.platformValue}>
                    {value ? value : "Not linked"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onRefresh}
            disabled={isLoading || refreshing}
          >
            <Ionicons
              name={refreshing ? "time-outline" : "refresh"}
              size={18}
              color="#111"
            />
            <Text style={styles.primaryText}>
              {refreshing ? "refreshing..." : "refresh"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setEditVisible(true)}
          >
            <Ionicons name="settings-outline" size={18} color="#4ade80" />
            <Text style={styles.secondaryText}>edit profile</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          disabled={isLoading}
        >
          <Ionicons name="log-out-outline" size={18} color="white" />
          <Text style={styles.buttonText}>logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
          disabled={isLoading}
        >
          <Ionicons name="trash-outline" size={18} color="white" />
          <Text style={styles.buttonText}>delete account</Text>
        </TouchableOpacity>

        <Modal
          visible={editVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setEditVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>edit profile</Text>
              <Text style={styles.modalLabel}>avatar url</Text>
              <TextInput
                style={styles.modalInput}
                value={form.avatarUrl}
                autoCapitalize="none"
                placeholder="https://"
                placeholderTextColor="#555"
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, avatarUrl: text }))
                }
              />
              <Text style={styles.modalLabel}>bio</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                value={form.bio}
                multiline
                maxLength={1000}
                placeholder="tell friends what you're into"
                placeholderTextColor="#555"
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, bio: text }))
                }
              />
              <Text style={[styles.modalLabel, { marginTop: 12 }]}>
                platform handles
              </Text>
              {PLATFORM_META.map(({ key, label }) => (
                <View key={key} style={styles.modalInputRow}>
                  <Text style={styles.modalHandleLabel}>{label}</Text>
                  <TextInput
                    style={[styles.modalInput, styles.modalHandleInput]}
                    value={form.platformHandles[key]}
                    autoCapitalize="none"
                    placeholder="not linked"
                    placeholderTextColor="#555"
                    onChangeText={(text) =>
                      setForm((prev) => ({
                        ...prev,
                        platformHandles: {
                          ...prev.platformHandles,
                          [key]: text,
                        },
                      }))
                    }
                  />
                </View>
              ))}

              {errorMessage ? (
                <Text style={[styles.errorText, { marginTop: 12 }]}>
                  {errorMessage}
                </Text>
              ) : null}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setEditVisible(false)}
                  disabled={saving}
                >
                  <Text style={styles.modalCancelText}>cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSave}
                  onPress={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <Ionicons name="time-outline" size={16} color="#fff" />
                  ) : (
                    <Ionicons name="save-outline" size={16} color="#fff" />
                  )}
                  <Text style={styles.modalSaveText}>
                    {saving ? "saving..." : "save changes"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 80,
  },
  headerCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#262626",
    alignItems: "center",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  avatarInitial: {
    color: "#4ade80",
    fontSize: 34,
    fontWeight: "700",
  },
  name: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  email: {
    color: "#c4c4c4",
    fontSize: 13,
    marginTop: 4,
  },
  meta: {
    color: "#4ade80",
    fontSize: 12,
    marginTop: 6,
    textTransform: "lowercase",
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 12,
    gap: 20,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  statLabel: {
    color: "#777",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bio: {
    color: "#dcdcdc",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    textAlign: "center",
  },
  bioPlaceholder: {
    color: "#777",
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },
  feedback: {
    color: "#4ade80",
    fontSize: 12,
    marginTop: 12,
    textTransform: "lowercase",
  },
  errorText: {
    color: "#f87171",
    fontSize: 12,
    marginTop: 12,
    textAlign: "center",
  },
  section: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#262626",
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#4ade80",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "lowercase",
  },
  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionActionText: {
    color: "#4ade80",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  platformRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  platformInfo: {
    marginLeft: 12,
  },
  platformLabel: {
    color: "#e5e5e5",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  platformValue: {
    color: "#9b9b9b",
    fontSize: 13,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#4ade80",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryText: {
    color: "#111",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    textTransform: "capitalize",
  },
  secondaryText: {
    color: "#4ade80",
    fontSize: 14,
    textTransform: "capitalize",
  },
  logoutButton: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2f2f2f",
  },
  deleteButton: {
    backgroundColor: "#b91c1c",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 60,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#161616",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  modalLabel: {
    color: "#9ca3af",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#111",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#292929",
    marginBottom: 12,
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalInputRow: {
    marginBottom: 10,
  },
  modalHandleLabel: {
    color: "#777",
    fontSize: 11,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  modalHandleInput: {
    marginBottom: 0,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 6,
    gap: 12,
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  modalCancelText: {
    color: "#a3a3a3",
    fontSize: 14,
    textTransform: "capitalize",
  },
  modalSave: {
    backgroundColor: "#4ade80",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalSaveText: {
    color: "#111",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
