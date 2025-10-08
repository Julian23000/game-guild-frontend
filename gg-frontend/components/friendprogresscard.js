import React from 'react';
import { View } from 'react-native';
import { Card, Text, ProgressBar } from 'react-native-paper';

export default function FriendProgressCard({ name, game, progress }) {
  return (
    <Card style={{ backgroundColor: '#111', marginBottom: 12, padding: 10 }}>
      <Text style={{ color: '#fff', marginBottom: 8 }}>
        {name} has made progress in:
      </Text>
      <Text style={{ color: '#0f0', fontWeight: 'bold' }}>{game}</Text>
      <Text style={{ color: '#aaa', marginVertical: 8 }}>
        Achievements now at: {progress}%
      </Text>
      <ProgressBar progress={progress / 100} color="#00FF99" />
    </Card>
  );
}
