import { request } from "./api";

export function getFriends() {
  return request("/friends");
}

export function getFriendRequests() {
  return request("/friends/requests");
}

export function sendFriendRequest(userId) {
  if (!userId) throw new Error("userId is required");
  return request(`/friends/requests/${userId}`, { method: "POST" });
}

export function acceptFriendRequest(userId) {
  if (!userId) throw new Error("userId is required");
  return request(`/friends/requests/${userId}/accept`, { method: "POST" });
}

export function declineFriendRequest(userId) {
  if (!userId) throw new Error("userId is required");
  return request(`/friends/requests/${userId}/decline`, { method: "POST" });
}
