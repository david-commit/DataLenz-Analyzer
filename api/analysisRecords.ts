export async function getRecords(userId: string, token: string) {
  const base = process.env.EXPO_PUBLIC_BACKEND_URL || "";
  const url = `${base.replace(/\/$/, "")}/get-records`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
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
