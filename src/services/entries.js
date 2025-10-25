import { request } from "./api";

export function createEntry(payload) {
  return request("/entries", {
    method: "POST",
    body: payload,
  });
}

export function getEntries({ limit } = {}) {
  const query = limit ? `?limit=${encodeURIComponent(limit)}` : "";
  return request(`/entries${query}`);
}

export function getEntry(id) {
  if (!id) throw new Error("entry id is required");
  return request(`/entries/${id}`);
}

export function updateEntry(id, payload) {
  if (!id) throw new Error("entry id is required");
  return request(`/entries/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteEntry(id) {
  if (!id) throw new Error("entry id is required");
  return request(`/entries/${id}`, { method: "DELETE" });
}
