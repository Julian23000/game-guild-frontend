import { request } from "./api";

export function getCurrentUser() {
  return request("/users/me");
}

export function updateCurrentUser(payload) {
  return request("/users/me", {
    method: "PATCH",
    body: payload,
  });
}

export function deleteCurrentUser() {
  return request("/users/me", { method: "DELETE" });
}

export function getUserById(id) {
  if (!id) {
    throw new Error("User id is required");
  }
  return request(`/users/${id}`);
}

export function searchUsers({ q, limit } = {}) {
  const params = [];
  if (q) params.push(`q=${encodeURIComponent(q)}`);
  if (limit) params.push(`limit=${encodeURIComponent(limit)}`);
  const query = params.length ? `?${params.join("&")}` : "";
  return request(`/users/search${query}`);
}
