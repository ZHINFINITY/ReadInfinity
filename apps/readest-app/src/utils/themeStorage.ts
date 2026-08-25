import { ThemeMode } from '@/styles/themes';

export type ThemeStorageKey = 'themeMode' | 'themeColor' | 'ambientIsDarkMode' | 'systemIsDarkMode';

// Keep web storage compatibility, but isolate Tauri preferences from the
// unscoped values written by the original Readest WebView.
const isTauriBuild = () => process.env['NEXT_PUBLIC_APP_PLATFORM'] === 'tauri';

export const getThemeStorageKey = (key: ThemeStorageKey) =>
  isTauriBuild() ? `readinfinity.${key}` : key;

export const getStoredThemeValue = (key: ThemeStorageKey): string | null => {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage.getItem(getThemeStorageKey(key));
};

export const setStoredThemeValue = (key: ThemeStorageKey, value: string) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(getThemeStorageKey(key), value);
  }
};

export const getDefaultThemeMode = (): ThemeMode => (isTauriBuild() ? 'dark' : 'auto');
export const getDefaultThemeColor = () => 'amoled';
