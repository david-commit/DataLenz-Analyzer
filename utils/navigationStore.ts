const store = new Map<string, any>();

export function saveNavigationData(key: string, value: any) {
  store.set(key, value);
}

export function getNavigationData(key: string) {
  const val = store.get(key);
  // Optionally remove after read to avoid memory growth
  // store.delete(key);
  return val;
}

export function deleteNavigationData(key: string) {
  store.delete(key);
}
