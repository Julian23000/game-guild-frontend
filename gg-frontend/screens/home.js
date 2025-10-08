import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import FriendProgressCard from '../components/friendprogresscard';

const mockActivity = [
  { name: 'NartK', game: 'GTA V', progress: 70 },
  { name: 'NikhilV', game: 'PUBG: BATTLEGROUNDS', progress: 10 },
  { name: 'LiisiK', game: 'Gang Beasts', progress: 100 },
];

export default function HomeScreen() {
  return (
    <ScrollView style={{ backgroundColor: '#000', padding: 16 }}>
      <Button
        mode="contained"
        icon="account-plus"
        style={{ backgroundColor: '#111', marginBottom: 16 }}
        onPress={() => console.log('Friend Requests')}
      >
        Add your friends!
      </Button>

      {mockActivity.map((item, index) => (
        <FriendProgressCard key={index} {...item} />
      ))}
    </ScrollView>
  );
}
