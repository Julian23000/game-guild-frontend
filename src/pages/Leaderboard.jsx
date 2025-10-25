import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import {
  getFriendsLeaderboard,
  getGlobalLeaderboard,
} from "../services/leaderboard";

const FRIENDS_DEFAULT_LIMIT = 50;
const FRIENDS_INCREMENT = 25;
const GLOBAL_DEFAULT_LIMIT = 20;
const GLOBAL_INCREMENT = 20;
const MAX_LIMIT = 100;

const TAB_FRIENDS = "friends";
const TAB_GLOBAL = "global";

function formatRelativeTime(isoString) {
  if (!isoString) return "—";
  const timestamp = Date.parse(isoString);
  if (Number.isNaN(timestamp)) return "—";

  const now = Date.now();
  const diff = Math.max(0, now - timestamp);
  const seconds = Math.floor(diff / 1000);

  if (seconds < 45) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30.4375);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365.25);
  return `${years}y ago`;
}

function getInitials(username = "", email = "") {
  const source = username || email || "";
  if (!source) return "?";
  const segments = source.trim().split(/\s+/);
  const first = segments[0]?.[0] || "";
  const second = segments.length > 1 ? segments[segments.length - 1][0] : "";
  return (first + second).toUpperCase() || source[0].toUpperCase();
}

function SkeletonRow({ index }) {
  return (
    <View style={styles.skeletonRow} key={`skeleton-${index}`}>
      <View style={styles.skeletonRank} />
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonInfo}>
        <View style={styles.skeletonLineShort} />
        <View style={styles.skeletonLine} />
      </View>
      <View style={styles.skeletonMeta} />
    </View>
  );
}

function LeaderboardRow({ item, userId }) {
  const isCurrentUser = item.user?._id === userId;
  const initials = getInitials(item.user?.username, item.user?.email);
  const bioSnippet = item.user?.bio
    ? item.user.bio.length > 60
      ? `${item.user.bio.slice(0, 57)}...`
      : item.user.bio
    : null;

  return (
    <View
      style={[
        styles.card,
        isCurrentUser && styles.currentUserCard,
        item.rank <= 3 && styles.topThree,
      ]}
    >
      <View style={styles.left}>
        <Text
          style={[
            styles.rank,
            item.rank <= 3 && styles.rankHighlight,
            isCurrentUser && styles.rankHighlight,
          ]}
        >
          {item.rank}
        </Text>

        {item.user?.avatarUrl ? (
          <Image
            source={{ uri: item.user.avatarUrl }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>{initials}</Text>
          </View>
        )}

        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.user?.username || "unknown"}</Text>
          {bioSnippet ? <Text style={styles.bio}>{bioSnippet}</Text> : null}
        </View>
      </View>

      <View style={styles.right}>
        <View style={styles.metricBlock}>
          <Ionicons name="trophy-outline" size={16} color="#fbbf24" />
          <Text style={styles.metricValue}>{item.completedCount}</Text>
        </View>
        <Text style={styles.metricLabel}>
          {formatRelativeTime(item.lastFinishedAt)}
        </Text>
      </View>
    </View>
  );
}

export default function Leaderboard() {
  const navigation = useNavigation();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState(TAB_FRIENDS);

  const [friendsState, setFriendsState] = useState({
    items: [],
    loading: true,
    error: "",
    limit: FRIENDS_DEFAULT_LIMIT,
    hasMore: false,
  });

  const [globalState, setGlobalState] = useState({
    items: [],
    loading: true,
    error: "",
    limit: GLOBAL_DEFAULT_LIMIT,
    hasMore: false,
  });

  const fetchFriends = useCallback(
    async (limit = FRIENDS_DEFAULT_LIMIT, signal) => {
      const cancelled = () => signal?.aborted;
      setFriendsState((prev) => ({
        ...prev,
        loading: true,
        error: "",
        limit,
      }));
      try {
        const data = await getFriendsLeaderboard({ limit });
        if (cancelled()) return;
        const items = Array.isArray(data) ? data : [];
        setFriendsState({
          items,
          loading: false,
          error: "",
          limit,
          hasMore: items.length === limit && limit < MAX_LIMIT,
        });
      } catch (err) {
        const handled = await (async () => {
          if (err?.isUnauthorized || err?.status === 401) {
            await logout();
            return true;
          }
          return false;
        })();
        if (!handled && !cancelled()) {
          setFriendsState((prev) => ({
            ...prev,
            loading: false,
            error: err?.message || err?.body?.message || "unable to load friends leaderboard",
          }));
        }
      }
    },
    [logout]
  );

  const fetchGlobal = useCallback(
    async (limit = GLOBAL_DEFAULT_LIMIT, signal) => {
      const cancelled = () => signal?.aborted;
      setGlobalState((prev) => ({
        ...prev,
        loading: true,
        error: "",
        limit,
      }));
      try {
        const data = await getGlobalLeaderboard({ limit });
        if (cancelled()) return;
        const items = Array.isArray(data) ? data : [];
        setGlobalState({
          items,
          loading: false,
          error: "",
          limit,
          hasMore: items.length === limit && limit < MAX_LIMIT,
        });
      } catch (err) {
        const handled = await (async () => {
          if (err?.isUnauthorized || err?.status === 401) {
            await logout();
            return true;
          }
          return false;
        })();
        if (!handled && !cancelled()) {
          setGlobalState((prev) => ({
            ...prev,
            loading: false,
            error: err?.message || err?.body?.message || "unable to load global leaderboard",
          }));
        }
      }
    },
    [logout]
  );

  useFocusEffect(
    useCallback(() => {
      const signal = { aborted: false };
      fetchFriends(friendsState.limit, signal).finally(() => {
        fetchGlobal(globalState.limit, signal);
      });
      return () => {
        signal.aborted = true;
      };
    }, [fetchFriends, fetchGlobal, friendsState.limit, globalState.limit])
  );

  const activeState = activeTab === TAB_FRIENDS ? friendsState : globalState;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleRetry = () => {
    if (activeTab === TAB_FRIENDS) {
      fetchFriends(friendsState.limit);
    } else {
      fetchGlobal(globalState.limit);
    }
  };

  const handleLoadMore = () => {
    if (activeTab === TAB_FRIENDS) {
      const nextLimit = Math.min(
        friendsState.limit + FRIENDS_INCREMENT,
        MAX_LIMIT
      );
      if (nextLimit !== friendsState.limit) {
        fetchFriends(nextLimit);
      }
    } else {
      const nextLimit = Math.min(
        globalState.limit + GLOBAL_INCREMENT,
        MAX_LIMIT
      );
      if (nextLimit !== globalState.limit) {
        fetchGlobal(nextLimit);
      }
    }
  };

  const renderContent = useMemo(() => {
    if (activeState.loading && activeState.items.length === 0) {
      return (
        <View style={styles.listContainer}>
          {[0, 1, 2].map((index) => (
            <SkeletonRow key={index} index={index} />
          ))}
        </View>
      );
    }

    if (activeState.error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{activeState.error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeTab === TAB_FRIENDS && activeState.items.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="people-circle-outline" size={42} color="#4ade80" />
          <Text style={styles.emptyTitle}>
            Add friends to see how you rank
          </Text>
          <Text style={styles.emptySubtitle}>
            Connect with friends and track who finishes more games.
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate("home")}
          >
            <Text style={styles.ctaButtonText}>Add friends</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeState.items.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="podium-outline" size={42} color="#4ade80" />
          <Text style={styles.emptyTitle}>No players yet</Text>
          <Text style={styles.emptySubtitle}>
            Once players finish games, rankings will appear here.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        <FlatList
          data={activeState.items}
          renderItem={({ item }) => (
            <LeaderboardRow item={item} userId={user?._id} />
          )}
          keyExtractor={(item) => `${activeTab}-${item.user?._id ?? item.rank}`}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        {activeState.hasMore ? (
          <TouchableOpacity style={styles.loadMore} onPress={handleLoadMore}>
            {activeState.loading ? (
              <ActivityIndicator color="#4ade80" />
            ) : (
              <>
                <Ionicons name="arrow-down-circle-outline" size={18} color="#4ade80" />
                <Text style={styles.loadMoreText}>Load more</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }, [
    activeState,
    activeTab,
    handleLoadMore,
    handleRetry,
    navigation,
    user?._id,
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Leaderboard</Text>
          <Text style={styles.subHeader}>
            Track finished games and see who is on top
          </Text>
        </View>

        <View style={styles.tabSwitcher}>
          {[TAB_FRIENDS, TAB_GLOBAL].map((tabKey) => {
            const label = tabKey === TAB_FRIENDS ? "Friends" : "Global";
            const isActive = activeTab === tabKey;
            return (
              <TouchableOpacity
                key={tabKey}
                style={[
                  styles.tabButton,
                  isActive ? styles.tabButtonActive : styles.tabButtonInactive,
                ]}
                onPress={() => handleTabChange(tabKey)}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    isActive
                      ? styles.tabButtonTextActive
                      : styles.tabButtonTextInactive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {renderContent}
      </View>
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
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  headerRow: {
    marginBottom: 16,
  },
  header: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
  },
  subHeader: {
    color: "#888",
    fontSize: 12,
    marginTop: 6,
    letterSpacing: 0.4,
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: "#1c1c1c",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#1f2937",
  },
  tabButtonInactive: {
    backgroundColor: "transparent",
  },
  tabButtonText: {
    fontSize: 13,
    letterSpacing: 0.4,
  },
  tabButtonTextActive: {
    color: "#4ade80",
    fontWeight: "600",
  },
  tabButtonTextInactive: {
    color: "#9ca3af",
  },
  listContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: "#1e1e1e",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#262626",
  },
  currentUserCard: {
    borderColor: "#4ade80",
    backgroundColor: "#1f2a24",
  },
  topThree: {
    borderColor: "#4ade80",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#333",
  },
  right: {
    alignItems: "flex-end",
  },
  rank: {
    color: "#bbb",
    fontSize: 18,
    width: 28,
  },
  rankHighlight: {
    color: "#4ade80",
    fontWeight: "700",
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  avatarInitial: {
    color: "#4ade80",
    fontSize: 16,
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
  },
  username: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  bio: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  metricBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricValue: {
    color: "#4ade80",
    fontSize: 16,
    fontWeight: "600",
  },
  metricLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
    textTransform: "lowercase",
  },
  loadMore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2f2f2f",
    marginTop: 8,
  },
  loadMoreText: {
    color: "#4ade80",
    fontSize: 14,
    fontWeight: "600",
  },
  errorContainer: {
    padding: 16,
    backgroundColor: "#1f2937",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ef4444",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    color: "#f87171",
    fontSize: 13,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f87171",
  },
  retryText: {
    color: "#f87171",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtitle: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  ctaButton: {
    marginTop: 8,
    backgroundColor: "#4ade80",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  ctaButtonText: {
    color: "#111",
    fontSize: 14,
    fontWeight: "600",
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1f1f1f",
    gap: 12,
  },
  skeletonRank: {
    width: 24,
    height: 16,
    backgroundColor: "#1f2937",
    borderRadius: 4,
  },
  skeletonAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1f2937",
  },
  skeletonInfo: {
    flex: 1,
    gap: 6,
  },
  skeletonLine: {
    height: 10,
    backgroundColor: "#1f2937",
    borderRadius: 4,
  },
  skeletonLineShort: {
    height: 10,
    width: "60%",
    backgroundColor: "#1f2937",
    borderRadius: 4,
  },
  skeletonMeta: {
    width: 60,
    height: 12,
    backgroundColor: "#1f2937",
    borderRadius: 4,
  },
});
