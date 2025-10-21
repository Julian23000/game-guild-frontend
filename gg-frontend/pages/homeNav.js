import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './home';
import Friends from './friends';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={Home}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Friends"
        component={Friends}
        options={{
          headerStyle: { backgroundColor: '#121212' },
          headerTintColor: 'white',
          title: 'Friends',
        }}
      />
    </Stack.Navigator>
  );
}
