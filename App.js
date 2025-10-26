import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Home from "./src/pages/HomeScreen";
import Leaderboard from "./src/pages/Leaderboard";
import Profile from "./src/pages/ProfileScreen";
import LoginScreen from "./src/pages/LoginScreen";
import RegisterScreen from "./src/pages/RegisterScreen";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import Games from "./src/pages/Games";

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
          if (route.name === "Home") iconName = "home";
          else if (route.name === "Leaderboard") iconName = "trophy";
          else if (route.name === "Games") iconName = "game-controller";
          else if (route.name === "Profile") iconName = "person";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Leaderboard" component={Leaderboard} />
      <Tab.Screen name="Games" component={Games} />
      <Tab.Screen name="Profile" component={Profile} />
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
      <Tab.Screen name="Login" component={LoginScreen} />
      <Tab.Screen name="Register" component={RegisterScreen} />
    </Tab.Navigator>
  );
}

function RootNavigation() {
  const { isAuthenticated, isReady, healthStatus } = useAuth();

  if (!isReady) {
    return (
      <View style={styles.fullscreenCenter}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (healthStatus === "error" && !isAuthenticated) {
    return (
      <View style={styles.fullscreenCenter}>
        <Ionicons name="warning" size={32} color="#facc15" />
        <Text style={[styles.loadingText, { marginTop: 12 }]}>
          Sserver offline — check your API
        </Text>
      </View>
    );
  }

  return isAuthenticated ? <AppTabs /> : <AuthTabs />;
}

const styles = StyleSheet.create({
  fullscreenCenter: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    color: "#e5e5e5",
    marginTop: 16,
    textAlign: "center",
    textTransform: "lowercase",
    letterSpacing: 0.2,
  },
});

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigation />
      </NavigationContainer>
    </AuthProvider>
  );
}
