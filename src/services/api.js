const BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000"
).replace(/\/$/, "");

let accessToken = null;

function setAccessToken(token) {
  accessToken = token || null;
}

function clearAccessToken() {
  accessToken = null;
}

function getAccessToken() {
  return accessToken;
}

function normalisePath(path) {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function shouldAttachAuth(path, explicit) {
  if (typeof explicit === "boolean") {
    return explicit;
  }
  const target = normalisePath(path);
  if (target === "/healthz") return false;
  return !target.startsWith("/auth/");
}

async function parseResponse(res) {
  const contentType = res.headers?.get?.("content-type") || "";
  const isJson = contentType.includes("application/json");
  if (res.status === 204 || res.headers?.get?.("content-length") === "0") {
    return { data: null, isJson };
  }

  if (isJson) {
    try {
      const data = await res.json();
      return { data, isJson: true };
    } catch (err) {
      return { data: null, isJson: true };
    }
  }

  try {
    const text = await res.text();
    return { data: text, isJson: false };
  } catch (err) {
    return { data: null, isJson: false };
  }
}

async function request(path, options = {}) {
  const {
    method = "GET",
    headers = {},
    body,
    auth,
    skipAuthOn401,
    ...rest
  } = options;

  const targetPath = normalisePath(path);
  const url = `${BASE_URL}${targetPath}`;

  const finalHeaders = {
    Accept: "application/json",
    ...headers,
  };

  const useAuth = shouldAttachAuth(targetPath, auth);
  if (useAuth && accessToken) {
    finalHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const hasFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  if (!hasFormData && body !== undefined && !("Content-Type" in finalHeaders)) {
    finalHeaders["Content-Type"] = "application/json";
  }

  const fetchBody =
    body === undefined || hasFormData || typeof body === "string"
      ? body
      : JSON.stringify(body);

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: fetchBody,
    ...rest,
  });

  const { data } = await parseResponse(res);

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && data.message) || res.statusText;
    const error = new Error(message || "Request failed");
    error.status = res.status;
    if (data && typeof data === "object") {
      error.code = data.code;
      error.details = data.details;
      error.body = data;
    } else {
      error.body = data;
    }
    if (res.status === 401 && !skipAuthOn401) {
      error.isUnauthorized = true;
    }
    throw error;
  }

  return data;
}

async function checkHealth() {
  const data = await request("/healthz", { auth: false });
  if (!data || data.status !== "ok") {
    throw new Error("Health check failed");
  }
  return data;
}

export {
  BASE_URL,
  request,
  setAccessToken,
  clearAccessToken,
  getAccessToken,
  checkHealth,
};
