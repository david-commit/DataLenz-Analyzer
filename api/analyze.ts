import { authService } from "@/services/auth";

export const analyzeRecord = async (record: any) => {
  const backendUrl: string = process.env.EXPO_PUBLIC_BACKEND_URL ?? "";
  const token = await authService.getValidToken();
  const user = await authService.getCurrentUser();
  const url = `${backendUrl.replace(/\/$/, "")}/analyze/${record.id}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
      "x-user-id": user?.localId || "",
    },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Analysis failed: ${res.status} ${txt}`);
  }

  return res.json();
};

