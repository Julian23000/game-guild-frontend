import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'currentUser';

export async function saveAuth({ user, token }) {
  if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken() {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

export async function getUser() {
  const s = await AsyncStorage.getItem(USER_KEY);
  return s ? JSON.parse(s) : null;
}

export async function getUserId() {
  const u = await getUser();
  if (!u) return null;
  return u._id || u.id || null;
}

export async function clearAuth() {
  await AsyncStorage.removeItem(USER_KEY);
  await AsyncStorage.removeItem(TOKEN_KEY);
};