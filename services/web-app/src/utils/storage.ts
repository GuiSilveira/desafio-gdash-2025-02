import { STORAGE_KEYS } from "@/constants/app";

export interface StorageService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

class LocalStorageService implements StorageService {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return null;
      return JSON.parse(item) as T;
    } catch {
      const item = localStorage.getItem(key);
      return item as T | null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      if (typeof value === "string") {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}

class MemoryStorageService implements StorageService {
  private store: Map<string, string> = new Map();

  get<T>(key: string): T | null {
    const item = this.store.get(key);
    if (item === undefined) return null;
    try {
      return JSON.parse(item) as T;
    } catch {
      return item as T | null;
    }
  }

  set<T>(key: string, value: T): void {
    if (typeof value === "string") {
      this.store.set(key, value);
    } else {
      this.store.set(key, JSON.stringify(value));
    }
  }

  remove(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

let storageInstance: StorageService | null = null;

export function getStorage(): StorageService {
  if (!storageInstance) {
    storageInstance = new LocalStorageService();
  }
  return storageInstance;
}

export function setStorage(service: StorageService): void {
  storageInstance = service;
}

export function createMemoryStorage(): StorageService {
  return new MemoryStorageService();
}

export const tokenStorage = {
  get: (): string | null => getStorage().get<string>(STORAGE_KEYS.TOKEN),
  set: (token: string): void => getStorage().set(STORAGE_KEYS.TOKEN, token),
  remove: (): void => getStorage().remove(STORAGE_KEYS.TOKEN),
};

export const themeStorage = {
  get: (): string | null => getStorage().get<string>(STORAGE_KEYS.THEME),
  set: (theme: string): void => getStorage().set(STORAGE_KEYS.THEME, theme),
  remove: (): void => getStorage().remove(STORAGE_KEYS.THEME),
};

export const aiAutoModeStorage = {
  get: (): boolean => getStorage().get<boolean>(STORAGE_KEYS.AI_AUTO_MODE) ?? false,
  set: (enabled: boolean): void => getStorage().set(STORAGE_KEYS.AI_AUTO_MODE, enabled),
  remove: (): void => getStorage().remove(STORAGE_KEYS.AI_AUTO_MODE),
};

export const searchedLocationStorage = {
  get: (): string | null => getStorage().get<string>(STORAGE_KEYS.SEARCHED_LOCATION),
  set: (location: string): void =>
    getStorage().set(STORAGE_KEYS.SEARCHED_LOCATION, location),
  remove: (): void => getStorage().remove(STORAGE_KEYS.SEARCHED_LOCATION),
};
