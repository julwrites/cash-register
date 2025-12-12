export function useLocalStorage() {
  const setItem = (key: string, value: string) => {
    if (import.meta.client) {
      localStorage.setItem(key, value);
    }
  };

  const getItem = (key: string) => {
    if (import.meta.client) {
      return localStorage.getItem(key);
    }
    return null;
  };

  const removeItem = (key: string) => {
    if (import.meta.client) {
      localStorage.removeItem(key);
    }
  };

  return {
    setItem,
    getItem,
    removeItem,
  };
}
