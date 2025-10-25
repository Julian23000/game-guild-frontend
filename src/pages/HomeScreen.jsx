// import React from 'react';
// import { View, Text, ScrollView, StyleSheet } from 'react-native';
// import FriendProgress from '../components/friendprogress';

// export default function Home() {
//   const mockData = [
//     { id: 1, name: 'nart', game: 'gta v', progress: 70 },
//     { id: 2, name: 'nikhil', game: 'pubg: battlegrounds', progress: 10 },
//     { id: 3, name: 'liisi', game: 'gang beasts', progress: 100 },
//   ];

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>friend activity</Text>
//       <ScrollView>
//         {mockData.map((item) => (
//           <FriendProgress key={item.id} data={item} />
//         ))}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#121212',
//     paddingTop: 40,
//     paddingHorizontal: 16,
//   },
//   header: {
//     color: 'white',
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 16,
//   },
// });

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import {
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
} from "../services/friends";
import { searchUsers } from "../services/users";

function Avatar({ username, avatarUrl }) {
  const initial = username?.[0]?.toUpperCase() || "?";
  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />;
  }
  return (
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarInitial}>{initial}</Text>
    </View>
  );
}

function FriendRow({ user, actions, subtle }) {
  return (
    <View
      style={[
        styles.friendRow,
        subtle ? styles.friendRowSubtle : styles.friendRowSolid,
      ]}
    >
      <Avatar username={user.username} avatarUrl={user.avatarUrl} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{user.username}</Text>
        <Text style={styles.friendMeta}>{user.email}</Text>
      </View>
      <View style={styles.friendActions}>{actions}</View>
    </View>
  );
}

export default function Home() {
  const { user, logout } = useAuth();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const friendIdSet = useMemo(
    () => new Set(friends.map((item) => item._id)),
    [friends]
  );
  const incomingIdSet = useMemo(
    () => new Set(requests.incoming.map((item) => item._id)),
    [requests.incoming]
  );
  const outgoingIdSet = useMemo(
    () => new Set(requests.outgoing.map((item) => item._id)),
    [requests.outgoing]
  );

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

  const loadFriends = useCallback(async () => {
    try {
      const data = await getFriends();
      setFriends(data || []);
    } catch (err) {
      const handled = await handleUnauthorized(err);
      if (!handled) {
        setErrorMessage(
          err?.message || "unable to load friends, pull to refresh"
        );
      }
    }
  }, [handleUnauthorized]);

  const loadRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const data = await getFriendRequests();
      setRequests({
        incoming: data?.incoming || [],
        outgoing: data?.outgoing || [],
      });
    } catch (err) {
      const handled = await handleUnauthorized(err);
      if (!handled) {
        setErrorMessage(
          err?.message || "unable to load friend requests right now"
        );
      }
    } finally {
      setLoadingRequests(false);
    }
  }, [handleUnauthorized]);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadFriends(), loadRequests()]);
    setRefreshing(false);
  }, [loadFriends, loadRequests]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const performSearch = useCallback(
    async (term) => {
      const trimmed = term.trim();
      if (!trimmed) {
        setSearchResults([]);
        return;
      }
      try {
        setSearching(true);
        setErrorMessage("");
        const results = await searchUsers({ q: trimmed, limit: 12 });
        const filtered = (results || []).filter(
          (item) => item._id !== user?._id
        );
        setSearchResults(filtered);
      } catch (err) {
        const handled = await handleUnauthorized(err);
        if (!handled) {
          setErrorMessage(err?.message || "unable to search players right now");
        }
      } finally {
        setSearching(false);
      }
    },
    [handleUnauthorized, user?._id]
  );

  const onSendRequest = async (targetId) => {
    try {
      setErrorMessage("");
      await sendFriendRequest(targetId);
      await loadRequests();
    } catch (err) {
      const handled = await handleUnauthorized(err);
      if (!handled) {
        setErrorMessage(
          err?.message || err?.body?.message || "unable to send friend request"
        );
      }
    }
  };

  const onAccept = async (targetId) => {
    try {
      setErrorMessage("");
      await acceptFriendRequest(targetId);
      await Promise.all([loadFriends(), loadRequests()]);
    } catch (err) {
      const handled = await handleUnauthorized(err);
      if (!handled) {
        setErrorMessage(
          err?.message || err?.body?.message || "unable to accept request"
        );
      }
    }
  };

  const onDecline = async (targetId) => {
    try {
      setErrorMessage("");
      await declineFriendRequest(targetId);
      await loadRequests();
    } catch (err) {
      const handled = await handleUnauthorized(err);
      if (!handled) {
        setErrorMessage(
          err?.message || err?.body?.message || "unable to decline request"
        );
      }
    }
  };

  const renderSearchAction = (result) => {
    if (friendIdSet.has(result._id)) {
      return (
        <View style={styles.tagPill}>
          <Text style={styles.tagPillText}>friends</Text>
        </View>
      );
    }
    if (incomingIdSet.has(result._id)) {
      return (
        <TouchableOpacity
          style={[styles.smallButton, styles.successButton]}
          onPress={() => onAccept(result._id)}
        >
          <Ionicons name="checkmark" size={16} color="#111" />
          <Text style={[styles.smallButtonText, styles.smallButtonTextDark]}>
            accept
          </Text>
        </TouchableOpacity>
      );
    }
    if (outgoingIdSet.has(result._id)) {
      return (
        <View style={styles.tagPill}>
          <Text style={styles.tagPillText}>requested</Text>
        </View>
      );
    }
    return (
      <TouchableOpacity
        style={[styles.smallButton, styles.primaryOutline]}
        onPress={() => onSendRequest(result._id)}
      >
        <Ionicons name="person-add" size={16} color="#4ade80" />
        <Text style={[styles.smallButtonText, styles.smallButtonTextAlt]}>
          add
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              tintColor="#4ade80"
              refreshing={refreshing}
              onRefresh={refreshAll}
            />
          }
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.header}>Your guild</Text>
              <Text style={styles.subHeader}>
                Track friends, send requests, stay connected
              </Text>
            </View>
          </View>

          <View style={styles.searchCard}>
            <View style={styles.searchRow}>
              <Ionicons name="search" size={18} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="search players by username or handle"
                placeholderTextColor="#555"
                value={searchTerm}
                autoCapitalize="none"
                onChangeText={(text) => {
                  setSearchTerm(text);
                  performSearch(text);
                }}
              />
              {searching ? (
                <Ionicons name="time-outline" size={18} color="#4ade80" />
              ) : null}
            </View>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
            {searchResults.length > 0 && (
              <View style={styles.resultsList}>
                {searchResults.map((result) => (
                  <FriendRow
                    key={result._id}
                    user={result}
                    actions={renderSearchAction(result)}
                    subtle
                  />
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending requests</Text>
              {loadingRequests ? (
                <Text style={styles.sectionHint}>Updating...</Text>
              ) : (
                <Text style={styles.sectionHint}>
                  Incoming {requests.incoming.length} · Outgoing{" "}
                  {requests.outgoing.length}
                </Text>
              )}
            </View>

            {requests.incoming.length === 0 &&
            requests.outgoing.length === 0 ? (
              <Text style={styles.emptyText}>
                No pending requests, invite someone new
              </Text>
            ) : (
              <>
                {requests.incoming.map((req) => (
                  <FriendRow
                    key={`incoming-${req._id}`}
                    user={req}
                    actions={
                      <View style={styles.requestActions}>
                        <TouchableOpacity
                          style={[styles.smallButton, styles.successButton]}
                          onPress={() => onAccept(req._id)}
                        >
                          <Ionicons name="checkmark" size={16} color="#111" />
                          <Text
                            style={[
                              styles.smallButtonText,
                              styles.smallButtonTextDark,
                            ]}
                          >
                            accept
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.smallButton, styles.dangerButton]}
                          onPress={() => onDecline(req._id)}
                        >
                          <Ionicons name="close" size={16} color="#fff" />
                          <Text style={styles.smallButtonText}>decline</Text>
                        </TouchableOpacity>
                      </View>
                    }
                  />
                ))}
                {requests.outgoing.map((req) => (
                  <FriendRow
                    key={`outgoing-${req._id}`}
                    user={req}
                    actions={
                      <View style={styles.tagPill}>
                        <Text style={styles.tagPillText}>awaiting reply</Text>
                      </View>
                    }
                  />
                ))}
              </>
            )}
          </View>

          <View style={[styles.section, { marginBottom: 60 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>friends</Text>
              <Text style={styles.sectionHint}>
                {friends.length} {friends.length === 1 ? "player" : "players"}
              </Text>
            </View>
            {friends.length === 0 ? (
              <Text style={styles.emptyText}>
                add friends to build your gaming circle
              </Text>
            ) : (
              friends.map((friend) => (
                <FriendRow
                  key={friend._id}
                  user={friend}
                  actions={
                    <View style={styles.tagPill}>
                      <Text style={styles.tagPillText}>friend</Text>
                    </View>
                  }
                />
              ))
            )}
          </View>
        </ScrollView>
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
    letterSpacing: 0.2,
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
    backgroundColor: "#111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
  },
  resultsList: {
    marginTop: 12,
    gap: 10,
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
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  sectionHint: {
    color: "#666",
    fontSize: 12,
    textTransform: "lowercase",
  },
  emptyText: {
    color: "#777",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  friendRowSolid: {
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#212121",
  },
  friendRowSubtle: {
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#1f1f1f",
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  friendMeta: {
    color: "#777",
    fontSize: 12,
    marginTop: 2,
  },
  friendActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#2a2a2a",
  },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
  smallButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  smallButtonText: {
    color: "#fff",
    fontSize: 12,
  },
  smallButtonTextDark: {
    color: "#111",
  },
  smallButtonTextAlt: {
    color: "#4ade80",
  },
  successButton: {
    backgroundColor: "#4ade80",
    borderColor: "#4ade80",
  },
  dangerButton: {
    backgroundColor: "#b91c1c",
    borderColor: "#b91c1c",
  },
  primaryOutline: {
    borderColor: "#4ade80",
    backgroundColor: "transparent",
  },
  requestActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tagPill: {
    backgroundColor: "#1f2937",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27303f",
  },
  tagPillText: {
    color: "#9ca3af",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  errorText: {
    color: "#f87171",
    fontSize: 12,
    marginTop: 12,
  },
});
