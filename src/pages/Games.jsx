import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from "react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import {
  searchGames as searchGamesApi,
  getGame as getGameApi,
} from "../services/games";
import {
  createEntry as createEntryApi,
  getEntries,
  updateEntry as updateEntryApi,
  deleteEntry as deleteEntryApi,
} from "../services/entries";

const STATUS_OPTIONS = ["All", "Playing", "Finished", "Wishlist"];
const ENTRY_STATUS = ["Playing", "Finished", "Wishlist"];

const STATUS_BADGES = {
  Playing: {
    backgroundColor: "#0ea5e9",
    borderColor: "#0ea5e9",
    text: "#082f49",
  },
  Finished: {
    backgroundColor: "#4ade80",
    borderColor: "#4ade80",
    text: "#052e16",
  },
  Wishlist: {
    backgroundColor: "#c084fc",
    borderColor: "#c084fc",
    text: "#2e1065",
  },
};

function resolveGame(entry) {
  if (!entry) return null;
  if (entry.gameId && typeof entry.gameId === "object") {
    return entry.gameId;
  }
  if (entry.game && typeof entry.game === "object") {
    return entry.game;
  }
  return null;
}

function formatDisplayDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString();
  } catch (err) {
    return "—";
  }
}

function toInputDate(iso) {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  } catch (err) {
    return "";
  }
}

function parseInputDateString(value) {
  if (!value) return null;
  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }
  const parts = value.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts.map((part) => Number.parseInt(part, 10));
    if (
      Number.isFinite(year) &&
      Number.isFinite(month) &&
      Number.isFinite(day)
    ) {
      const parsed = new Date(year, month - 1, day);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }
  return null;
}

function formatDateForInput(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function computeProgress(entry, game) {
  if (typeof entry?.progressPct === "number") {
    return Math.max(0, Math.min(100, Math.round(entry.progressPct)));
  }
  const total =
    typeof game?.achievementCount === "number"
      ? game.achievementCount
      : entry?.achievementCount;
  const unlocked = entry?.achievementsUnlocked;
  if (
    typeof total === "number" &&
    total > 0 &&
    typeof unlocked === "number" &&
    unlocked >= 0
  ) {
    return Math.max(0, Math.min(100, Math.round((unlocked / total) * 100)));
  }
  return null;
}

function EntryCard({ entry, onEdit, onDelete }) {
  const game = resolveGame(entry);
  const progress = computeProgress(entry, game);
  const badge = STATUS_BADGES[entry.status] || {
    backgroundColor: "#1f2937",
    borderColor: "#1f2937",
    text: "#e5e7eb",
  };

  const totalAchievements =
    typeof game?.achievementCount === "number"
      ? game.achievementCount
      : entry.achievementCount;

  return (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View>
          <Text style={styles.entryTitle}>
            {game?.gameName || "unknown game"}
          </Text>
          <Text style={styles.entryPlatform}>
            {(game?.platform || "unknown platform").toLowerCase()}
          </Text>
        </View>
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: badge.backgroundColor,
              borderColor: badge.borderColor,
            },
          ]}
        >
          <Text style={[styles.statusText, { color: badge.text }]}>
            {entry.status}
          </Text>
        </View>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress ?? 0}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {progress !== null ? `${progress}% complete` : "progress pending"}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color="#a3a3a3" />
          <Text style={styles.metaLabel}>
            Started {formatDisplayDate(entry.dateStarted)}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="flag-outline" size={14} color="#a3a3a3" />
          <Text style={styles.metaLabel}>
            Finished {formatDisplayDate(entry.dateFinished)}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="trophy-outline" size={14} color="#fbbf24" />
          <Text style={styles.metaLabel}>
            {entry.achievementsUnlocked ?? 0}
            {typeof totalAchievements === "number"
              ? ` / ${totalAchievements} achievements`
              : " unlocked"}
          </Text>
        </View>
      </View>

      {entry.notes ? (
        <Text style={styles.entryNotes}>{entry.notes}</Text>
      ) : null}

      <View style={styles.entryActions}>
        <TouchableOpacity
          style={[styles.entryActionButton, styles.entryActionPrimary]}
          onPress={() => onEdit(entry)}
        >
          <Ionicons name="create-outline" size={16} color="#0f172a" />
          <Text style={styles.entryActionTextPrimary}>edit entry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.entryActionButton, styles.entryActionDanger]}
          onPress={() => onDelete(entry)}
        >
          <Ionicons name="trash-outline" size={16} color="#fff" />
          <Text style={styles.entryActionText}>delete</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  subHeader: {
    color: "#888",
    fontSize: 13,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: "#4ade80",
    borderColor: "#4ade80",
  },
  filterChipInactive: {
    backgroundColor: "transparent",
    borderColor: "#2a2a2a",
  },
  filterChipText: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  filterChipTextActive: {
    color: "#0f172a",
    fontWeight: "600",
  },
  filterChipTextInactive: {
    color: "#aaa",
  },
  searchCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#262626",
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
  },
  searchResultsWrap: {
    marginTop: 12,
    gap: 10,
  },
  searchHint: {
    color: "#9ca3af",
    fontSize: 12,
    textTransform: "lowercase",
    marginBottom: 8,
  },
  searchInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInfoText: {
    color: "#888",
    fontSize: 12,
    textTransform: "lowercase",
  },
  searchResult: {
    backgroundColor: "#141414",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f1f1f",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  resultTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  resultMeta: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    color: "#a3a3a3",
    fontSize: 12,
    textTransform: "lowercase",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  emptyStateCaption: {
    color: "#888",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  filterEmptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  filterEmptyText: {
    color: "#9ca3af",
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: "lowercase",
  },
  entryCard: {
    backgroundColor: "#181818",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#252525",
    padding: 16,
    marginBottom: 16,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  entryTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  entryPlatform: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
    textTransform: "lowercase",
  },
  statusPill: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  progressWrap: {
    marginBottom: 12,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1f1f1f",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4ade80",
  },
  progressText: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaLabel: {
    color: "#999",
    fontSize: 12,
    textTransform: "lowercase",
  },
  entryNotes: {
    color: "#d4d4d4",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  entryActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    gap: 12,
  },
  entryActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 10,
  },
  entryActionPrimary: {
    backgroundColor: "#4ade80",
  },
  entryActionDanger: {
    backgroundColor: "#b91c1c",
  },
  entryActionTextPrimary: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "600",
  },
  entryActionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  errorText: {
    color: "#f87171",
    fontSize: 12,
    marginBottom: 12,
  },
  emptyText: {
    color: "#777",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#161616",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    padding: 20,
    maxHeight: "90%",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textTransform: "capitalize",
  },
  modalLabel: {
    color: "#9ca3af",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: "#111",
    color: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#292929",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalDateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  modalDateText: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
  },
  modalDatePlaceholder: {
    color: "#555",
  },
  inlineDatePicker: {
    backgroundColor: "#111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#292929",
    marginTop: 12,
    padding: 12,
  },
  inlineDatePickerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 8,
  },
  inlineDatePickerActionText: {
    color: "#4ade80",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  datePickerComponent: {
    alignSelf: "stretch",
  },
  modalNotes: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusChipActive: {
    backgroundColor: "#4ade80",
    borderColor: "#4ade80",
  },
  statusChipInactive: {
    backgroundColor: "transparent",
    borderColor: "#333",
  },
  statusChipText: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  statusChipTextActive: {
    color: "#0f172a",
    fontWeight: "600",
  },
  statusChipTextInactive: {
    color: "#9ca3af",
  },
  gameSummary: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#262626",
    padding: 12,
    marginBottom: 8,
  },
  gameSummaryTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  gameSummaryMeta: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },
  modalInfo: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 12,
  },
  modalError: {
    color: "#f87171",
    fontSize: 12,
    marginTop: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
  },
  modalCancel: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modalCancelText: {
    color: "#9ca3af",
    fontSize: 14,
    textTransform: "capitalize",
  },
  modalSave: {
    backgroundColor: "#4ade80",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalSaveText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});

function initialFormState() {
  return {
    status: "Playing",
    achievementsUnlocked: "",
    notes: "",
    dateStarted: "",
    dateFinished: "",
  };
}

export default function Games() {
  const { logout } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [initialResults, setInitialResults] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [formMode, setFormMode] = useState("create");
  const [formValues, setFormValues] = useState(initialFormState());
  const [activeDateField, setActiveDateField] = useState(null);
  const [iosPickerValue, setIosPickerValue] = useState(new Date());
  const [editingEntry, setEditingEntry] = useState(null);
  const [modalError, setModalError] = useState("");
  const [savingEntry, setSavingEntry] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const searchTermRef = useRef("");

  const handleUnauthorized = useCallback(
    async (err) => {
      if (err?.isUnauthorized || err?.status === 401) {
        await logout();
        return true;
      }
      return false;
    },
    [logout]
  );

  const loadEntries = useCallback(
    async (signal) => {
      const cancelled = () => signal?.aborted;
      try {
        if (cancelled()) return;
        setLoadingEntries(true);
        setErrorMessage("");
        const data = await getEntries();
        if (cancelled()) return;
        const enriched = await Promise.all(
          (data || []).map(async (entry) => {
            if (entry?.gameId && typeof entry.gameId === "string") {
              try {
                const gameData = await getGameApi(entry.gameId);
                if (cancelled()) return entry;
                return { ...entry, game: gameData };
              } catch (err) {
                return entry;
              }
            }
            return entry;
          })
        );
        if (cancelled()) return;
        setEntries(enriched);
      } catch (err) {
        const handled = await handleUnauthorized(err);
        if (!handled && !cancelled()) {
          setErrorMessage(
            err?.message ||
              err?.body?.message ||
              "unable to load your game entries"
          );
        }
      } finally {
        if (!cancelled()) {
          setLoadingEntries(false);
        }
      }
    },
    [handleUnauthorized]
  );

  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  const refreshInitialGames = useCallback(
    async (signal) => {
      const cancelled = () => signal?.aborted;
      try {
        if (cancelled()) return;
        setInitialLoading(true);
        const data = await searchGamesApi({ limit: 20 });
        if (cancelled()) return;
        const list = Array.isArray(data) ? data : [];
        setInitialResults(list);
        if (!searchTermRef.current.trim()) {
          setSearchResults(list);
        }
      } catch (err) {
        const handled = await handleUnauthorized(err);
        if (!handled && !cancelled()) {
          setErrorMessage(
            (prev) => prev || err?.message || "unable to load games list"
          );
          setInitialResults([]);
          if (!searchTermRef.current.trim()) {
            setSearchResults([]);
          }
        }
      } finally {
        if (!cancelled()) {
          setInitialLoading(false);
        }
      }
    },
    [handleUnauthorized]
  );

  useFocusEffect(
    useCallback(() => {
      const signal = { aborted: false };
      loadEntries(signal);
      refreshInitialGames(signal);
      return () => {
        signal.aborted = true;
      };
    }, [loadEntries, refreshInitialGames])
  );

  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setSearching(false);
      setSearchResults(initialResults);
      return;
    }

    let active = true;

    const debounce = setTimeout(() => {
      (async () => {
        try {
          if (!active) return;
          setSearching(true);
          const results = await searchGamesApi({
            search: trimmed,
            limit: 20,
          });
          if (active) {
            setSearchResults(results || []);
          }
        } catch (err) {
          const handled = await handleUnauthorized(err);
          if (!handled && active) {
            setErrorMessage(err?.message || "unable to search games right now");
          }
        } finally {
          if (active) setSearching(false);
        }
      })();
    }, 350);

    return () => {
      active = false;
      setSearching(false);
      clearTimeout(debounce);
    };
  }, [handleUnauthorized, searchTerm, initialResults]);

  const filteredEntries = useMemo(() => {
    if (statusFilter === "All") return entries;
    const target = statusFilter.toLowerCase();
    return entries.filter(
      (entry) => (entry.status || "").trim().toLowerCase() === target
    );
  }, [entries, statusFilter]);

  const openCreateModal = useCallback((game) => {
    if (!game || !game._id) {
      setModalError("select a game from the list before adding an entry");
      return;
    }
    setFormMode("create");
    setEditingEntry(null);
    setSelectedGame(game);
    setFormValues(initialFormState());
    setModalError("");
    setActiveDateField(null);
    setIosPickerValue(new Date());
    setModalVisible(true);
  }, []);

  const openEditModal = useCallback((entry) => {
    const game = resolveGame(entry);
    setFormMode("edit");
    setEditingEntry(entry);
    setSelectedGame(game);
    setFormValues({
      status: entry.status,
      achievementsUnlocked:
        typeof entry.achievementsUnlocked === "number"
          ? String(entry.achievementsUnlocked)
          : "",
      notes: entry.notes || "",
      dateStarted: toInputDate(entry.dateStarted),
      dateFinished: toInputDate(entry.dateFinished),
    });
    setModalError("");
    setActiveDateField(null);
    setIosPickerValue(new Date());
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    if (savingEntry) return;
    setModalVisible(false);
    setEditingEntry(null);
    setSelectedGame(null);
    setFormValues(initialFormState());
    setModalError("");
    setIosPickerValue(new Date());
    setActiveDateField(null);
  }, [savingEntry]);

  const handleSubmitEntry = useCallback(async () => {
    const achievementsValue = formValues.achievementsUnlocked.trim();
    let achievementsNumber;
    if (achievementsValue !== "") {
      achievementsNumber = Number(achievementsValue);
      if (!Number.isFinite(achievementsNumber) || achievementsNumber < 0) {
        setModalError("achievements unlocked must be zero or higher");
        return;
      }
    }

    const payload = {
      status: formValues.status,
      notes: formValues.notes.trim() || undefined,
      dateStarted: formValues.dateStarted || undefined,
      dateFinished: formValues.dateFinished || undefined,
      achievementsUnlocked:
        achievementsValue === "" ? undefined : achievementsNumber,
    };

    let gameId = selectedGame?._id;
    if (!gameId && editingEntry) {
      if (typeof editingEntry.gameId === "string") {
        gameId = editingEntry.gameId;
      } else if (
        editingEntry.gameId &&
        typeof editingEntry.gameId === "object"
      ) {
        gameId = editingEntry.gameId._id;
      }
    }

    try {
      setSavingEntry(true);
      setModalError("");

      if (!gameId) {
        setModalError("select a game from the list before adding an entry");
        setSavingEntry(false);
        return;
      }

      if (formMode === "edit" && editingEntry) {
        await updateEntryApi(editingEntry._id, payload);
      } else {
        await createEntryApi({
          ...payload,
          gameId,
        });
      }

      await loadEntries();
      closeModal();
    } catch (err) {
      const handled = await handleUnauthorized(err);
      if (!handled) {
        setModalError(
          err?.message ||
            err?.body?.message ||
            "unable to save entry, try again"
        );
      }
    } finally {
      setSavingEntry(false);
    }
  }, [
    closeModal,
    editingEntry,
    formMode,
    formValues,
    handleUnauthorized,
    loadEntries,
    selectedGame,
  ]);

  const confirmDeleteEntry = useCallback(
    (entry) => {
      const game = resolveGame(entry);
      Alert.alert(
        "Delete entry",
        `Remove ${game?.gameName || "this game"} from your backlog?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteEntryApi(entry._id);
                await loadEntries();
              } catch (err) {
                const handled = await handleUnauthorized(err);
                if (!handled) {
                  setErrorMessage(
                    err?.message ||
                      err?.body?.message ||
                      "Unable to delete entry"
                  );
                }
              }
            },
          },
        ]
      );
    },
    [handleUnauthorized, loadEntries]
  );

  const handleClearDate = useCallback((field) => {
    setFormValues((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const applyDateChange = useCallback((field, date) => {
    if (!field || !(date instanceof Date) || Number.isNaN(date.getTime())) {
      return;
    }
    setFormValues((prev) => ({
      ...prev,
      [field]: formatDateForInput(date),
    }));
  }, []);

  const openDatePicker = useCallback(
    (field) => {
      if (!field) return;
      const initialDate = parseInputDateString(formValues[field]) || new Date();
      if (Platform.OS === "android") {
        DateTimePickerAndroid.open({
          mode: "date",
          value: initialDate,
          onChange: (event, selectedDate) => {
            if (event?.type === "set" && selectedDate) {
              applyDateChange(field, selectedDate);
            }
          },
        });
        return;
      }
      setIosPickerValue(initialDate);
      setActiveDateField(field);
    },
    [applyDateChange, formValues]
  );

  const closeInlinePicker = useCallback(() => {
    setActiveDateField(null);
  }, []);

  const handleInlineDateChange = useCallback(
    (_event, selectedDate) => {
      if (!selectedDate || !activeDateField) {
        return;
      }
      setIosPickerValue(selectedDate);
      applyDateChange(activeDateField, selectedDate);
    },
    [activeDateField, applyDateChange]
  );

  const renderStatusFilters = () => (
    <View style={styles.filterRow}>
      {STATUS_OPTIONS.map((option) => {
        const active = option === statusFilter;
        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.filterChip,
              active ? styles.filterChipActive : styles.filterChipInactive,
            ]}
            onPress={() => setStatusFilter(option)}
          >
            <Text
              style={[
                styles.filterChipText,
                active
                  ? styles.filterChipTextActive
                  : styles.filterChipTextInactive,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderSearchResults = () => {
    const trimmed = searchTerm.trim();
    const hasSearchTerm = trimmed.length > 0;
    const results = hasSearchTerm ? searchResults : initialResults;

    if (hasSearchTerm && searching) {
      return (
        <View style={styles.searchInfoRow}>
          <ActivityIndicator size="small" color="#4ade80" />
          <Text style={styles.searchInfoText}>Searching games...</Text>
        </View>
      );
    }

    if (!hasSearchTerm && initialLoading) {
      return (
        <View style={styles.searchInfoRow}>
          <ActivityIndicator size="small" color="#4ade80" />
          <Text style={styles.searchInfoText}>Loading games...</Text>
        </View>
      );
    }

    if (!results || results.length === 0) {
      return (
        <Text style={styles.emptyText}>
          {hasSearchTerm
            ? "No games found - try another search"
            : "No games available yet"}
        </Text>
      );
    }

    const hintText = hasSearchTerm
      ? "Tap a game to add it to your backlog"
      : "Recent games from your library";

    const items = results.map((game) => (
      <Pressable
        key={game._id || game.gameName}
        style={styles.searchResult}
        onPress={() => openCreateModal(game)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.resultTitle}>{game.gameName}</Text>
          <Text style={styles.resultMeta}>
            {(game.platform || "unknown platform").toLowerCase()} -{" "}
            {typeof game.achievementCount === "number"
              ? `${game.achievementCount} achievements`
              : "Achievements unknown"}
          </Text>
        </View>
        <Ionicons name="add-circle-outline" size={20} color="#4ade80" />
      </Pressable>
    ));

    return [
      <Text key="hint" style={styles.searchHint}>
        {hintText}
      </Text>,
      ...items,
    ];
  };

  const showSearch = statusFilter === "All";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.header}>Your backlog</Text>
              {showSearch ? (
                <Text style={styles.subHeader}>
                  Search your library and add games you&apos;re tracking
                </Text>
              ) : null}
            </View>
          </View>

          {renderStatusFilters()}

          {showSearch ? (
            <View style={styles.searchCard}>
              <View style={styles.searchRow}>
                <Ionicons name="search" size={18} color="#666" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="search by game name or platform"
                  placeholderTextColor="#555"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  autoCapitalize="none"
                />
                {searchTerm ? (
                  <TouchableOpacity onPress={() => setSearchTerm("")}>
                    <Ionicons name="close-circle" size={18} color="#555" />
                  </TouchableOpacity>
                ) : null}
              </View>
              <View style={styles.searchResultsWrap}>
                {renderSearchResults()}
              </View>
            </View>
          ) : null}

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <View style={{ marginBottom: 80 }}>
            {loadingEntries ? (
              <View style={styles.loadingState}>
                <ActivityIndicator color="#4ade80" />
                <Text style={styles.loadingText}>Loading entries...</Text>
              </View>
            ) : filteredEntries.length === 0 ? (
              entries.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="layers-outline" size={42} color="#4ade80" />
                  <Text style={styles.emptyStateTitle}>no entries yet</Text>
                  <Text style={styles.emptyStateCaption}>
                    {showSearch
                      ? "Search above to add a game from your library"
                      : "Switch to the All tab to add games to your backlog"}
                  </Text>
                </View>
              ) : (
                <View style={styles.filterEmptyState}>
                  <Ionicons
                    name="information-circle-outline"
                    size={32}
                    color="#4ade80"
                  />
                  <Text style={styles.filterEmptyText}>
                    No entries marked as {statusFilter.toLowerCase()}
                  </Text>
                </View>
              )
            ) : (
              filteredEntries.map((entry) => (
                <EntryCard
                  key={entry._id}
                  entry={entry}
                  onEdit={openEditModal}
                  onDelete={confirmDeleteEntry}
                />
              ))
            )}
          </View>
        </ScrollView>

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeModal}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.modalTitle}>
                  {formMode === "edit" ? "Edit entry" : "Add to backlog"}
                </Text>

                {selectedGame ? (
                  <View style={styles.gameSummary}>
                    <Text style={styles.gameSummaryTitle}>
                      {selectedGame.gameName}
                    </Text>
                    <Text style={styles.gameSummaryMeta}>
                      {(
                        selectedGame.platform || "Unknown platform"
                      ).toLowerCase()}
                    </Text>
                    {typeof selectedGame.achievementCount === "number" ? (
                      <Text style={styles.gameSummaryMeta}>
                        {selectedGame.achievementCount} achievements
                      </Text>
                    ) : null}
                  </View>
                ) : (
                  <Text style={styles.modalInfo}>
                    Select a game from the search results above to continue.
                  </Text>
                )}

                <Text style={styles.modalLabel}>status</Text>
                <View style={styles.statusRow}>
                  {ENTRY_STATUS.map((status) => {
                    const active = formValues.status === status;
                    return (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusChip,
                          active
                            ? styles.statusChipActive
                            : styles.statusChipInactive,
                        ]}
                        onPress={() =>
                          setFormValues((prev) => ({ ...prev, status }))
                        }
                      >
                        <Text
                          style={[
                            styles.statusChipText,
                            active
                              ? styles.statusChipTextActive
                              : styles.statusChipTextInactive,
                          ]}
                        >
                          {status}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.modalLabel}>Achievements unlocked</Text>
                <TextInput
                  style={styles.modalInput}
                  value={formValues.achievementsUnlocked}
                  onChangeText={(text) =>
                    setFormValues((prev) => ({
                      ...prev,
                      achievementsUnlocked: text.replace(/[^0-9]/g, ""),
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#555"
                />

                <Text style={styles.modalLabel}>Date started</Text>
                <Pressable
                  style={[styles.modalInput, styles.modalDateInput]}
                  onPress={() => openDatePicker("dateStarted")}
                >
                  <Text
                    style={[
                      styles.modalDateText,
                      !formValues.dateStarted && styles.modalDatePlaceholder,
                    ]}
                  >
                    {formValues.dateStarted
                      ? formatDisplayDate(formValues.dateStarted)
                      : "Select date"}
                  </Text>
                  <Pressable
                    hitSlop={8}
                    onPress={(event) => {
                      if (formValues.dateStarted) {
                        event.stopPropagation();
                        handleClearDate("dateStarted");
                      }
                    }}
                  >
                    <Ionicons
                      name={
                        formValues.dateStarted
                          ? "close-circle"
                          : "calendar-outline"
                      }
                      size={18}
                      color="#555"
                    />
                  </Pressable>
                </Pressable>

                <Text style={styles.modalLabel}>Date finished</Text>
                <Pressable
                  style={[styles.modalInput, styles.modalDateInput]}
                  onPress={() => openDatePicker("dateFinished")}
                >
                  <Text
                    style={[
                      styles.modalDateText,
                      !formValues.dateFinished && styles.modalDatePlaceholder,
                    ]}
                  >
                    {formValues.dateFinished
                      ? formatDisplayDate(formValues.dateFinished)
                      : "Select date"}
                  </Text>
                  <Pressable
                    hitSlop={8}
                    onPress={(event) => {
                      if (formValues.dateFinished) {
                        event.stopPropagation();
                        handleClearDate("dateFinished");
                      }
                    }}
                  >
                    <Ionicons
                      name={
                        formValues.dateFinished
                          ? "close-circle"
                          : "calendar-outline"
                      }
                      size={18}
                      color="#555"
                    />
                  </Pressable>
                </Pressable>

                {Platform.OS !== "android" && activeDateField ? (
                  <View style={styles.inlineDatePicker}>
                    <DateTimePicker
                      value={iosPickerValue}
                      mode="date"
                      display="spinner"
                      onChange={handleInlineDateChange}
                      style={styles.datePickerComponent}
                    />
                    <View style={styles.inlineDatePickerActions}>
                      <TouchableOpacity
                        onPress={() => {
                          handleClearDate(activeDateField);
                          closeInlinePicker();
                        }}
                      >
                        <Text style={styles.inlineDatePickerActionText}>
                          Clear
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={closeInlinePicker}>
                        <Text style={styles.inlineDatePickerActionText}>
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}

                <Text style={styles.modalLabel}>Notes</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalNotes]}
                  value={formValues.notes}
                  onChangeText={(text) =>
                    setFormValues((prev) => ({ ...prev, notes: text }))
                  }
                  multiline
                  numberOfLines={4}
                  maxLength={1000}
                  placeholder="Thoughts, goals, or reminders"
                  placeholderTextColor="#555"
                />

                {modalError ? (
                  <Text style={styles.modalError}>{modalError}</Text>
                ) : null}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancel}
                    onPress={closeModal}
                    disabled={savingEntry}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalSave}
                    onPress={handleSubmitEntry}
                    disabled={savingEntry}
                  >
                    {savingEntry ? (
                      <ActivityIndicator color="#0f172a" size="small" />
                    ) : (
                      <Ionicons name="save-outline" size={18} color="#0f172a" />
                    )}
                    <Text style={styles.modalSaveText}>
                      {savingEntry
                        ? "Saving..."
                        : formMode === "Edit"
                        ? "Save changes"
                        : "Add entry"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
