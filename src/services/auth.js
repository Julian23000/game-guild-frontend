import { request } from "./api";

export async function login({ email, password }) {
  return request("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function register({ username, email, password }) {
  return request("/auth/register", {
    method: "POST",
    body: { username, email, password },
  });
}
