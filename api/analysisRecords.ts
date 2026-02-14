import { authService } from "@/services/auth";
const backendUrl: string = process.env.EXPO_PUBLIC_BACKEND_URL ?? "";


export async function getRecords() {
  const token = await authService.getValidToken();
  const user = await authService.getCurrentUser();
  
  if (!user || !token) {
    throw new Error("User not authenticated. Please login again.");
  }
  const url = `${backendUrl.replace(/\/$/, "")}/get-records`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": user.localId,
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch records: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data;
}

export async function deleteRecord(recordId: any) {
  const token = await authService.getValidToken();
  const user = await authService.getCurrentUser();

  if (!user || !token) {
    throw new Error("User not authenticated. Please login again.");
  }
  const url = `${backendUrl.replace(/\/$/, "")}/delete-record/${recordId}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": user.localId,
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete record: ${res.status} ${text}`);
  }
;
  return res.status === 204;
}
