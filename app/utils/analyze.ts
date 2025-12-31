import { authService } from "../../services/auth";

export const analyzeRecord = async (backendUrl: string, id: string, payload?: any) => {
  const token = await authService.getValidToken();
  const user = await authService.getCurrentUser();
  const url = `${backendUrl.replace(/\/$/, "")}/analyze/${id}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
      "x-user-id": user?.localId || "",
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Analyze failed: ${res.status} ${txt}`);
  }

  return res.json();
};

