import {
  request,
  setAccessToken,
  clearAccessToken,
  getAccessToken,
} from "./api";
import {
  saveSession,
  getStoredToken,
  getStoredUser,
  clearSessionStorage,
} from "./session";

async function handleAuthResponse(promise) {
  const data = await promise;
  if (!data || !data.accessToken || !data.user) {
    throw new Error("Invalid auth response");
  }
  await saveSession({ token: data.accessToken, user: data.user });
  setAccessToken(data.accessToken);
  return data;
}

export async function login(credentials) {
  return handleAuthResponse(
    request("/auth/login", {
      method: "POST",
      body: credentials,
      auth: false,
    })
  );
}

export async function register(payload) {
  return handleAuthResponse(
    request("/auth/register", {
      method: "POST",
      body: payload,
      auth: false,
    })
  );
}

export async function logout() {
  try {
    await request("/auth/logout", { method: "POST" });
  } catch (err) {
    if (!err?.isUnauthorized) {
      throw err;
    }
  } finally {
    await clearSessionStorage();
    clearAccessToken();
  }
}

export async function loadStoredSession() {
  const [token, user] = await Promise.all([getStoredToken(), getStoredUser()]);
  if (token) {
    setAccessToken(token);
  }
  return { token, user };
}

export async function getToken() {
  return getAccessToken() || (await getStoredToken());
}

export async function getUserId() {
  const user = await getStoredUser();
  return user?._id || null;
}
