import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function Profile() {
  const user = {
    name: 'nart',
    avatar: 'https://i.pravatar.cc/150?img=11',
    platforms: {
      steam: 'nart_steam',
      xbox: 'nartX',
      psn: 'nartPS',
      discord: 'nart#2190',
    },
    finishedGames: 42,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.gamesFinished}>{user.finishedGames} games finished</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>platform handles</Text>
        {Object.entries(user.platforms).map(([key, value]) => (
          <View style={styles.platformRow} key={key}>
            <MaterialCommunityIcons name={key} size={20} color="#4ade80" />
            <Text style={styles.platformText}>{value}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.button}>
        <Ionicons name="settings-outline" size={18} color="white" />
        <Text style={styles.buttonText}>edit profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#b91c1c', marginBottom: 60 }]}>
        <Ionicons name="log-out-outline" size={18} color="white" />
        <Text style={styles.buttonText}>logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  name: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  gamesFinished: {
    color: '#4ade80',
    fontSize: 14,
    marginTop: 6,
  },
  section: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#4ade80',
    fontSize: 16,
    marginBottom: 10,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#1e1e1e',
    borderRadius: 25,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    marginLeft: 6,
    textTransform: 'capitalize',
  },
});
