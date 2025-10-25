import { request } from "./api";

export function createGame(payload) {
  return request("/games", {
    method: "POST",
    body: payload,
  });
}

export function getGame(id) {
  if (!id) throw new Error("game id is required");
  return request(`/games/${id}`);
}

export function searchGames({ search, platform, limit } = {}) {
  const params = [];
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (platform) params.push(`platform=${encodeURIComponent(platform)}`);
  if (limit) params.push(`limit=${encodeURIComponent(limit)}`);
  const query = params.length ? `?${params.join("&")}` : "";
  return request(`/games${query}`);
}

export function updateGame(id, payload) {
  if (!id) throw new Error("game id is required");
  return request(`/games/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteGame(id) {
  if (!id) throw new Error("game id is required");
  return request(`/games/${id}`, { method: "DELETE" });
}
