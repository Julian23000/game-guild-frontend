import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FriendProgress from '../components/friendprogress';

export default function Home({ navigation }) { // 👈 add navigation prop
  const mockData = [
    { id: 1, name: 'nart', game: 'gta v', progress: 70 },
    { id: 2, name: 'nikhil', game: 'pubg: battlegrounds', progress: 10 },
    { id: 3, name: 'liisi', game: 'gang beasts', progress: 100 },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>add your friends!</Text>

        {/* Friend Requests Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Friends')} // 👈 navigate to Friends screen
        >
          <Ionicons name="person-add" size={20} color="white" />
          <Text style={styles.addText}>friend requests</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable friend progress list */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {mockData.map((item) => (
          <FriendProgress key={item.id} data={item} />
        ))}
      </ScrollView>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  addText: {
    color: 'white',
    fontSize: 13,
    marginLeft: 6,
  },
});
