const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getAuthToken = () => localStorage.getItem("token");

const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function request(path: string, options: RequestInit = {}) {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        ...authHeaders()
      }
    });
  } catch (e: unknown) {
    const hint =
      typeof window !== "undefined" &&
      API_BASE_URL.includes("localhost") &&
      !window.location.hostname.includes("localhost")
        ? " API URL points to localhost — set VITE_API_URL on Vercel to your Render URL (https://…/api)."
        : " Check internet, Render cold start (wait 60s), CORS (FRONTEND_URL / CORS_ALLOW_VERCEL_PREVIEWS), and VITE_API_URL.";
    throw new Error(`Failed to fetch.${hint}`);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export const api = {
  register: (body: any) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  verifyOtp: (email: string, otp: string) => request("/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, otp }) }),
  resendOtp: (email: string) => request("/auth/resend-otp", { method: "POST", body: JSON.stringify({ email }) }),
  login: (body: any) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request("/auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) }),
  me: () => request("/auth/me"),
  updateProfile: (body: any) => request("/users/me", { method: "PUT", body: JSON.stringify(body) }),
  deleteAccount: () => request("/users/me", { method: "DELETE" }),
  discover: (gender?: "male" | "female" | "other") =>
    request(`/users/discover${gender ? `?gender=${gender}` : ""}`),
  skipUser: (userId: string) => request(`/users/skip/${userId}`, { method: "POST" }),
  sendCrush: (receiverId: string) => request("/crush", { method: "POST", body: JSON.stringify({ receiverId }) }),
  matches: () => request("/matches"),
  messagesForMatch: (matchId: string) => request(`/messages/${matchId}`),
  reportUser: (reportedUserId: string, reason: string) =>
    request("/users/report", { method: "POST", body: JSON.stringify({ reportedUserId, reason }) }),
  blockUser: (userId: string) => request(`/users/block/${userId}`, { method: "POST" }),
  blockedUsers: () => request("/users/blocked"),
  unblockUser: (userId: string) => request(`/users/unblock/${userId}`, { method: "POST" })
};

