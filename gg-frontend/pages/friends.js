import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';

const friendsList = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
  { id: '4', name: 'David' },
];

export default function Friends() {
  const [search, setSearch] = useState('');

  const filteredFriends = friendsList.filter(friend =>
    friend.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddFriend = (friend) => {
    alert(`${friend.name} added!`);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search friends..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.friendCard} onPress={() => handleAddFriend(item)}>
            <Text style={styles.friendName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212',
  },
  searchBar: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
    backgroundColor: '#333',
  },
  friendCard: {
    backgroundColor: '#333',
    borderColor: '#4ade80',
    borderWidth: 1,
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#fffafaff',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
