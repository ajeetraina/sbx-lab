import axios from "axios";
import Cookies from "js-cookie";

const TOKEN_COOKIE = "devboard_token";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

// Attach the JWT (if any) to every request.
api.interceptors.request.use((config) => {
  const token = Cookies.get(TOKEN_COOKIE);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Send the user back to the login page when the session is missing or expired.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const onLoginPage =
      typeof window !== "undefined" && window.location.pathname === "/login";
    if (error?.response?.status === 401 && !onLoginPage && typeof window !== "undefined") {
      Cookies.remove(TOKEN_COOKIE);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function register(email: string, username: string, password: string) {
  const { data } = await api.post("/auth/register", { email, username, password });
  return data;
}

export async function login(username: string, password: string) {
  // The API follows the OAuth2 password flow, which expects form-encoded data.
  const body = new URLSearchParams({ username, password });
  const { data } = await api.post<{ access_token: string }>("/auth/login", body);
  Cookies.set(TOKEN_COOKIE, data.access_token, { sameSite: "strict", expires: 1 });
  return data;
}

// ── Projects ──────────────────────────────────────────────────────────────────

export async function getProjects() {
  const { data } = await api.get("/projects/");
  return data;
}

export async function getProject(id: number) {
  const { data } = await api.get(`/projects/${id}`);
  return data;
}

export async function createProject(name: string, description?: string) {
  const { data } = await api.post("/projects/", { name, description });
  return data;
}

export async function deleteProject(id: number) {
  await api.delete(`/projects/${id}`);
}

// ── Issues ────────────────────────────────────────────────────────────────────

export async function getIssues(
  projectId: number,
  params: { page?: number; page_size?: number; status?: string; priority?: string } = {}
) {
  const { data } = await api.get(`/projects/${projectId}/issues/`, { params });
  return data;
}

export async function searchIssues(projectId: number, q: string) {
  const { data } = await api.get(`/projects/${projectId}/issues/search`, { params: { q } });
  return data;
}

export async function createIssue(
  projectId: number,
  issue: { title: string; description?: string; priority?: string; assignee_id?: number }
) {
  const { data } = await api.post(`/projects/${projectId}/issues/`, issue);
  return data;
}

export async function updateIssue(
  projectId: number,
  issueId: number,
  changes: { title?: string; description?: string; status?: string; priority?: string }
) {
  const { data } = await api.put(`/projects/${projectId}/issues/${issueId}`, changes);
  return data;
}

export async function deleteIssue(projectId: number, issueId: number) {
  await api.delete(`/projects/${projectId}/issues/${issueId}`);
}
