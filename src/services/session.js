import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@gameguild/token";
const USER_KEY = "@gameguild/user";

async function storeToken(token) {
  if (!token) {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return;
  }
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

async function storeUser(user) {
  if (!user) {
    await AsyncStorage.removeItem(USER_KEY);
    return;
  }
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function saveSession({ token, user }) {
  await Promise.all([storeToken(token), storeUser(user)]);
}

export async function getStoredToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getStoredUser() {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    await AsyncStorage.removeItem(USER_KEY);
    return null;
  }
}

export async function clearSessionStorage() {
  await Promise.all([
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem(USER_KEY),
  ]);
}

