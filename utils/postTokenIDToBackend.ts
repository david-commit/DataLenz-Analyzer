export const postIdTokenToBackend = async(idToken: string | null) => {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  if (!idToken) {
    throw new Error("No idToken to post");
  }

  console.log("TOKEN:", idToken);
  
  
  if (!BACKEND_URL) {
    throw new Error("No backend URL configured (BACKEND_URL)");
  }
  
  const url = BACKEND_URL.replace(/\/$/, "") + "/auth";
  console.log("[oauthHandlers] posting idToken to backend:", url);

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: idToken }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Backend responded with ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  console.debug("[oauthHandlers] backend response:", data);
  return data;
}
