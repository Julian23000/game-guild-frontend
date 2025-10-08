import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Home from "./src/pages/HomeScreen";
import Leaderboard from "./src/pages/Leaderboard";
import Profile from "./src/pages/ProfileScreen";
import LoginScreen from "./src/pages/LoginScreen";
import RegisterScreen from "./src/pages/RegisterScreen";
import { View, Text } from "react-native";
import { AuthProvider, useAuth } from "./src/context/AuthContext";

const Tab = createBottomTabNavigator();

function Placeholder({ name }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#121212",
      }}
    >
      <Text style={{ color: "white", fontSize: 20 }}>{name} page</Text>
    </View>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: "#121212", borderTopColor: "#222" },
        tabBarActiveTintColor: "#4ade80",
        tabBarInactiveTintColor: "#888",
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "home") iconName = "home";
          else if (route.name === "leaderboard") iconName = "trophy";
          else if (route.name === "games") iconName = "game-controller";
          else if (route.name === "profile") iconName = "person";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="home" component={Home} />
      <Tab.Screen name="leaderboard" component={Leaderboard} />
      <Tab.Screen name="games" children={() => <Placeholder name="games" />} />
      <Tab.Screen name="profile" component={Profile} />
    </Tab.Navigator>
  );
}

function AuthTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
        tabBarButton: () => null,
      }}
    >
      <Tab.Screen name="login" component={LoginScreen} />
      <Tab.Screen name="register" component={RegisterScreen} />
    </Tab.Navigator>
  );
}

function RootNavigation() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AppTabs /> : <AuthTabs />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigation />
      </NavigationContainer>
    </AuthProvider>
  );
}
