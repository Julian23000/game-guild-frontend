import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Leaderboard() {
  const mockData = [
    { id: 1, name: 'nart', gamesFinished: 42, avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: 2, name: 'nikhil', gamesFinished: 36, avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 3, name: 'liisi', gamesFinished: 28, avatar: 'https://i.pravatar.cc/150?img=7' },
    { id: 4, name: 'sam', gamesFinished: 25, avatar: 'https://i.pravatar.cc/150?img=9' },
    { id: 5, name: 'kira', gamesFinished: 22, avatar: 'https://i.pravatar.cc/150?img=12' },
  ];

  const renderItem = ({ item, index }) => (
    <View style={[styles.card, index < 3 && styles.topThree]}>
      <View style={styles.left}>
        <Text style={[styles.rank, index < 3 && styles.rankHighlight]}>{index + 1}</Text>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{item.name}</Text>
      </View>
      <View style={styles.right}>
        <Ionicons name="game-controller" size={16} color="#4ade80" />
        <Text style={styles.games}>{item.gamesFinished}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>top gamers</Text>
      <FlatList
        data={mockData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1e1e1e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  topThree: {
    borderColor: '#4ade80',
    borderWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    color: '#bbb',
    fontSize: 18,
    width: 24,
  },
  rankHighlight: {
    color: '#4ade80',
    fontWeight: '700',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginHorizontal: 8,
  },
  name: {
    color: 'white',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  games: {
    color: '#4ade80',
    fontSize: 16,
    marginLeft: 4,
  },
});
