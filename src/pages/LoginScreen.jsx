import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login: loginUser, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async () => {
    if (!email || !password) {
      setErrorMessage("please fill email and password");
      return;
    }
    try {
      setErrorMessage("");
      await loginUser({ email, password });
    } catch (err) {
      setErrorMessage(
        err?.message ||
          err?.body?.message ||
          "unable to login right now, please try again"
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.welcomeWrap}>
            <Text style={styles.welcome}>
              Welcome to <Text style={styles.brand}>GameGuild</Text>
            </Text>
          </View>
          <Text style={styles.header}>Login</Text>
          <View style={styles.card}>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color="#bbb" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#777"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color="#bbb" />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#777"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {!!errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={onSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={18} color="#fff" />
                  <Text style={styles.buttonText}>Login</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.linkRow]}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.linkText}>No account? Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  kav: {
    flex: 1,
    backgroundColor: "#121212",
  },
  welcomeWrap: {
    marginBottom: 8,
  },
  welcome: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  brand: {
    color: "#4ade80",
  },
  header: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
    alignSelf: "center",
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    maxWidth: 380,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#262626",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 44,
  },
  input: {
    flex: 1,
    color: "#fff",
    marginLeft: 8,
  },
  button: {
    backgroundColor: "#4ade80",
    borderRadius: 10,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    marginLeft: 6,
    textTransform: "capitalize",
  },
  errorText: {
    color: "#f87171",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
    textTransform: "lowercase",
  },
  linkRow: {
    marginTop: 12,
    alignItems: "center",
  },
  linkText: {
    color: "#bbb",
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
