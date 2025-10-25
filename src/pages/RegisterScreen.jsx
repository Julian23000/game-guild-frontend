import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register: registerUser, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async () => {
    if (!username || !email || !password) {
      setErrorMessage("please fill all fields");
      return;
    }
    try {
      setErrorMessage("");
      await registerUser({ username, email, password });
    } catch (err) {
      setErrorMessage(
        err?.message ||
          err?.body?.message ||
          "unable to register right now, please try again"
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
          <Text style={styles.header}>Register</Text>
          <View style={styles.card}>
        <View style={styles.inputRow}>
          <Ionicons name="person-outline" size={18} color="#bbb" />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#777"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
        </View>
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
              <Ionicons name="person-add-outline" size={18} color="#fff" />
              <Text style={styles.buttonText}>Create Account</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.linkRow]}
          onPress={() => navigation.navigate("login")}
        >
          <Text style={styles.linkText}>Have an account? Login</Text>
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
