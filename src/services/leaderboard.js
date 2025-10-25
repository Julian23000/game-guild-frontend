import { request } from "./api";

const buildQuery = (limit) =>
  limit ? `?limit=${encodeURIComponent(limit)}` : "";

export function getFriendsLeaderboard({ limit } = {}) {
  return request(`/leaderboard/friends${buildQuery(limit)}`);
}

export function getGlobalLeaderboard({ limit } = {}) {
  return request(`/leaderboard/global${buildQuery(limit)}`);
}

