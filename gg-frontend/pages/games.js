// ...existing code...
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchGames, createEntry } from '../services/gamesApi';

function GameCard({ game }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.gameTitle}>{game.name}</Text>
        <Text style={styles.gamePlatform}>{game.platform}</Text>
      </View>
      <Text style={styles.achCount}>{(game.achievements || []).length} achievements</Text>
      <View style={styles.achList}>
        {(game.achievements || []).map((a, i) => (
          <View key={i} style={styles.achPill}>
            <Text style={styles.achText}>{a}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function Games() {
  const [games, setGames] = useState([]); // displayed games (added by user)
  const [modalVisible, setModalVisible] = useState(false);

  // search state and server results
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  // manual add fields (optional)
  const [manualName, setManualName] = useState('');
  const [manualPlatform, setManualPlatform] = useState('');
  const [manualAchStr, setManualAchStr] = useState('');

  // query backend when searchTerm changes
  useEffect(() => {
    let mounted = true;
    const q = (searchTerm || '').trim();
    searchGames(q)
      .then((res) => {
        if (!mounted) return;
        setResults(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        if (mounted) setResults([]);
      });
    return () => { mounted = false; };
  }, [searchTerm]);

  function openAddModal() {
    setSearchTerm('');
    setManualName('');
    setManualPlatform('');
    setManualAchStr('');
    setModalVisible(true);
  }

  async function addGameFromServer(item) {
    // display the game in frontend list
    const newGame = {
      id: Date.now().toString(),
      name: item.name,
      platform: item.platform || '',
      achievements: Array.isArray(item.achievements) ? [...item.achievements] : [],
    };
    setGames((prev) => [newGame, ...prev]);
    setModalVisible(false);

    // create GameEntry on backend (do NOT send hardcoded userId here)
    try {
      await createEntry({
        gameId: item._id || item.externalId || item.id,
        status: 'Playing',
        achievementsUnlocked: 0,
      });
    } catch (err) {
      console.warn('Failed to create backend entry', err);
    }
  }

  async function addGameManually() {
    const name = manualName.trim();
    if (!name) return;
    const parsed = manualAchStr.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    const newGame = {
      id: Date.now().toString(),
      name,
      platform: manualPlatform.trim(),
      achievements: parsed,
    };
    setGames((prev) => [newGame, ...prev]);
    setModalVisible(false);

    // Optionally create entry on backend (without hardcoded userId)
    try {
      await createEntry({
        gameId: name, // adjust if your backend requires a Game _id/externalId instead
        status: 'Wishlist',
        achievementsUnlocked: 0,
      });
    } catch (err) {
      console.warn('Failed to create backend entry for manual game', err);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Your Games!</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addText}>Add Game</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {games.length === 0 ? (
          <Text style={{ color: '#9b9b9b', padding: 8 }}>No games added. Use "Add Game" to pick one.</Text>
        ) : (
          games.map((g) => <GameCard key={g.id ?? g.name} game={g} />)
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Game</Text>

            <Text style={styles.label}>Search games (server)</Text>
            <TextInput
              placeholder="e.g. rocket league"
              placeholderTextColor="#888"
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={styles.input}
              autoCorrect={false}
              autoCapitalize="none"
            />

            <ScrollView style={{ maxHeight: 180, marginBottom: 8 }}>
              {results.map((r) => (
                <Pressable
                  key={r._id ?? r.id}
                  onPress={() => addGameFromServer(r)}
                  style={({ pressed }) => [
                    styles.resultRow,
                    pressed && { backgroundColor: '#1a1a1a' },
                  ]}
                >
                  <View>
                    <Text style={styles.resultTitle}>{r.name}</Text>
                    <Text style={styles.resultMeta}>{r.platform || ''} — { (r.achievements||[]).length } ach</Text>
                  </View>
                </Pressable>
              ))}
              {results.length === 0 && (
                <Text style={styles.noResults}>No matches. Use manual form below.</Text>
              )}
            </ScrollView>

            <Text style={[styles.label, { marginTop: 4 }]}>Or add manually</Text>
            <TextInput placeholder="Name" placeholderTextColor="#888" value={manualName} onChangeText={setManualName} style={styles.input} />
            <TextInput placeholder="Platform" placeholderTextColor="#888" value={manualPlatform} onChangeText={setManualPlatform} style={styles.input} />
            <TextInput placeholder="Achievements (comma or newline separated)" placeholderTextColor="#888" value={manualAchStr} onChangeText={setManualAchStr} style={[styles.input, { height: 80 }]} multiline />

            <View style={styles.modalButtons}>
              <Pressable style={styles.modalBtnCancel} onPress={() => setModalVisible(false)}><Text style={styles.modalBtnText}>Cancel</Text></Pressable>
              <Pressable style={styles.modalBtnSave} onPress={addGameManually}><Text style={styles.modalBtnText}>Save</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ...styles (keep existing styles from your file)...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 40, paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  header: { color: 'white', fontSize: 22, fontWeight: '600' },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e1e', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  addText: { color: 'white', fontSize: 13, marginLeft: 6 },
  card: { backgroundColor: '#171717', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#262626' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gameTitle: { color: 'white', fontSize: 16, fontWeight: '600' },
  gamePlatform: { color: '#9b9b9b', fontSize: 12 },
  achCount: { color: '#bdbdbd', fontSize: 12, marginTop: 8, marginBottom: 8 },
  achList: { flexDirection: 'row', flexWrap: 'wrap' },
  achPill: { backgroundColor: '#232323', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#2f2f2f' },
  achText: { color: 'white', fontSize: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#161616', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2a2a2a' },
  modalTitle: { color: 'white', fontSize: 18, marginBottom: 12, fontWeight: '600' },
  label: { color: '#d0d0d0', fontSize: 12, marginBottom: 6 },
  input: { backgroundColor: '#111', color: 'white', borderRadius: 8, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#2a2a2a' },
  resultRow: { paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#222' },
  resultTitle: { color: 'white', fontSize: 14, fontWeight: '600' },
  resultMeta: { color: '#9b9b9b', fontSize: 12, marginTop: 2 },
  noResults: { color: '#9b9b9b', padding: 8 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  modalBtnCancel: { paddingVertical: 8, paddingHorizontal: 12, marginRight: 8 },
  modalBtnSave: { backgroundColor: '#1e88e5', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  modalBtnText: { color: 'white', fontWeight: '600' },
});