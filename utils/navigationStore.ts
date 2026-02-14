const store = new Map<string, any>();

// Simple in-memory pub/sub for cross-screen updates
type Callback = (payload?: any) => void;
const listeners = new Map<string, Set<Callback>>();

export function saveNavigationData(key: string, value: any) {
  store.set(key, value);
  // emit update for convenience
  emit("navigation:update", { key, value });
}

export function getNavigationData(key: string) {
  const val = store.get(key);
  // Optionally remove after read to avoid memory growth
  // store.delete(key);
  return val;
}

export function deleteNavigationData(key: string) {
  store.delete(key);
  emit("navigation:delete", { key });
}

export function on(event: string, cb: Callback) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event)!.add(cb);
}

export function off(event: string, cb: Callback) {
  listeners.get(event)?.delete(cb);
}

export function emit(event: string, payload?: any) {
  listeners.get(event)?.forEach((cb: Callback) => {
    try {
      cb(payload);
    } catch (err) {
      // swallow listener errors
      // console.error("navigationStore listener error", err);
    }
  });
}
