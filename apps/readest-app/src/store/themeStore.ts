import { create } from 'zustand';
import { addPluginListener, type PluginListener } from '@tauri-apps/api/core';
import { AppService } from '@/types/system';
import { getThemeCode, ThemeCode } from '@/utils/style';
import {
  getSystemColorScheme,
  startAmbientLightUpdates,
  stopAmbientLightUpdates,
  type AmbientLightPayload,
} from '@/utils/bridge';
import {
  isValidThemeMode,
  readStoredAmbientIsDarkMode,
  resolveAmbientIsDarkMode,
  resolveThemeIsDarkMode,
} from '@/utils/ambientLight';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { CustomTheme, Palette, ThemeMode } from '@/styles/themes';
import { EnvConfigType, isTauriAppPlatform, isWebAppPlatform } from '@/services/environment';
import {
  getDefaultThemeColor,
  getDefaultThemeMode,
  getStoredThemeValue,
  setStoredThemeValue,
} from '@/utils/themeStorage';
import { SystemSettings } from '@/types/settings';
import { Insets } from '@/types/misc';

declare global {
  interface Window {
    __READEST_IS_EINK?: boolean;
    onNativeColorSchemeChange?: (colorScheme: 'light' | 'dark') => void;
  }
}

interface ThemeState {
  themeMode: ThemeMode;
  themeColor: string;
  systemIsDarkMode: boolean;
  ambientIsDarkMode: boolean;
  themeCode: ThemeCode;
  isDarkMode: boolean;
  systemUIVisible: boolean;
  statusBarHeight: number;
  systemUIAlwaysHidden: boolean;
  safeAreaInsets: Insets | null;
  isRoundedWindow: boolean;
  setSystemUIAlwaysHidden: (hidden: boolean) => void;
  setStatusBarHeight: (height: number) => void;
  showSystemUI: () => void;
  dismissSystemUI: () => void;
  getIsDarkMode: () => boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setThemeColor: (color: string) => void;
  updateAppTheme: (color: keyof Palette) => void;
  saveCustomTheme: (
    envConfig: EnvConfigType,
    settings: SystemSettings,
    theme: CustomTheme,
    isDelete?: boolean,
  ) => void;
  handleSystemThemeChange: (isDark: boolean) => void;
  handleAmbientLightChange: (lux: number) => void;
  updateSafeAreaInsets: (insets: Insets) => void;
}

const getInitialThemeMode = (): ThemeMode => {
  const stored = getStoredThemeValue('themeMode');
  if (isValidThemeMode(stored)) return stored;
  return getDefaultThemeMode();
};

const getInitialThemeColor = (): string => {
  const defaultColor =
    typeof window !== 'undefined' && window.__READEST_IS_EINK
      ? 'contrast'
      : getDefaultThemeColor();
  return getStoredThemeValue('themeColor') || defaultColor;
};

const getInitialAmbientIsDarkMode = (systemIsDarkMode: boolean): boolean =>
  readStoredAmbientIsDarkMode(getStoredThemeValue('ambientIsDarkMode'), systemIsDarkMode);

const persistAmbientIsDarkMode = (isDark: boolean) => {
  setStoredThemeValue('ambientIsDarkMode', isDark ? 'true' : 'false');
};

const applyDataTheme = (themeColor: string, isDarkMode: boolean) => {
  document.documentElement.setAttribute(
    'data-theme',
    `${themeColor}-${isDarkMode ? 'dark' : 'light'}`,
  );
};

let ambientLightListener: PluginListener | null = null;
let ambientLightListening = false;
let ambientHasLuxReading = false;

const stopAmbientLightListening = async () => {
  if (ambientLightListener) {
    try {
      await ambientLightListener.unregister();
    } catch {
      // ignore unregister races on teardown
    }
    ambientLightListener = null;
  }
  if (ambientLightListening) {
    ambientLightListening = false;
    try {
      await stopAmbientLightUpdates();
    } catch {
      // platform may not support ambient light
    }
  }
  ambientHasLuxReading = false;
};

const startAmbientLightListening = async () => {
  if (ambientLightListening) return;
  try {
    const started = await startAmbientLightUpdates();
    if (!started.success) {
      useThemeStore.getState().setThemeMode('auto');
      return;
    }
    ambientLightListening = true;
    ambientLightListener = await addPluginListener<AmbientLightPayload>(
      'native-bridge',
      'ambient-light',
      (payload) => {
        if (typeof payload?.lux === 'number') {
          useThemeStore.getState().handleAmbientLightChange(payload.lux);
        }
      },
    );
  } catch {
    useThemeStore.getState().setThemeMode('auto');
  }
};

// Start and stop both span several awaits, so overlapping calls could
// interleave: a stop landing after a start leaves the sensor off while we
// still believe we are listening, and two starts leak the first listener.
// Chaining every transition keeps the sensor in step with the last mode set.
let ambientLightSync: Promise<void> = Promise.resolve();

const syncAmbientLightSubscription = (mode: ThemeMode) => {
  ambientLightSync = ambientLightSync.then(() =>
    mode === 'ambient' ? startAmbientLightListening() : stopAmbientLightListening(),
  );
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialThemeMode = getInitialThemeMode();
  const initialThemeColor = getInitialThemeColor();
  const systemIsDarkMode =
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const ambientIsDarkMode = getInitialAmbientIsDarkMode(systemIsDarkMode);
  const isDarkMode = resolveThemeIsDarkMode(initialThemeMode, systemIsDarkMode, ambientIsDarkMode);
  const themeCode = getThemeCode();

  return {
    themeMode: initialThemeMode,
    themeColor: initialThemeColor,
    systemIsDarkMode,
    ambientIsDarkMode,
    isDarkMode,
    themeCode,
    systemUIVisible: false,
    statusBarHeight: 24,
    systemUIAlwaysHidden: false,
    safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
    isRoundedWindow: true,
    showSystemUI: () => set({ systemUIVisible: true }),
    dismissSystemUI: () => set({ systemUIVisible: false }),
    setStatusBarHeight: (height: number) => set({ statusBarHeight: height }),
    setSystemUIAlwaysHidden: (hidden: boolean) => set({ systemUIAlwaysHidden: hidden }),
    getIsDarkMode: () => get().isDarkMode,
    setThemeMode: (mode) => {
      setStoredThemeValue('themeMode', mode);
      const isDarkMode = resolveThemeIsDarkMode(
        mode,
        get().systemIsDarkMode,
        get().ambientIsDarkMode,
      );
      applyDataTheme(get().themeColor, isDarkMode);
      set({ themeMode: mode, isDarkMode });
      set({ themeCode: getThemeCode() });
      syncAmbientLightSubscription(mode);
    },
    setThemeColor: (color) => {
      setStoredThemeValue('themeColor', color);
      applyDataTheme(color, get().isDarkMode);
      set({ themeColor: color });
      set({ themeCode: getThemeCode() });
    },
    updateAppTheme: (color) => {
      if (isWebAppPlatform()) {
        const { palette } = get().themeCode;
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', palette[color]);
      }
    },
    saveCustomTheme: async (envConfig, settings, theme, isDelete) => {
      const customThemes = settings.globalReadSettings.customThemes || [];
      const index = customThemes.findIndex((t) => t.name === theme.name);
      if (isDelete) {
        if (index > -1) {
          customThemes.splice(index, 1);
        }
      } else {
        if (index > -1) {
          customThemes[index] = theme;
        } else {
          customThemes.push(theme);
        }
      }
      settings.globalReadSettings.customThemes = customThemes;
      localStorage.setItem('customThemes', JSON.stringify(customThemes));
      const appService = await envConfig.getAppService();
      await appService.saveSettings(settings);
    },
    handleSystemThemeChange: (systemIsDarkMode) => {
      const mode = get().themeMode;
      const isDarkMode = resolveThemeIsDarkMode(mode, systemIsDarkMode, get().ambientIsDarkMode);
      applyDataTheme(get().themeColor, isDarkMode);
      set({ systemIsDarkMode, isDarkMode });
      set({ themeCode: getThemeCode() });
    },
    handleAmbientLightChange: (lux) => {
      if (get().themeMode !== 'ambient') return;
      const previous = ambientHasLuxReading ? get().ambientIsDarkMode : null;
      ambientHasLuxReading = true;
      const nextAmbientIsDark = resolveAmbientIsDarkMode(lux, previous);
      if (nextAmbientIsDark === get().ambientIsDarkMode && get().isDarkMode === nextAmbientIsDark) {
        return;
      }
      persistAmbientIsDarkMode(nextAmbientIsDark);
      applyDataTheme(get().themeColor, nextAmbientIsDark);
      set({ ambientIsDarkMode: nextAmbientIsDark, isDarkMode: nextAmbientIsDark });
      set({ themeCode: getThemeCode() });
    },
    updateSafeAreaInsets: (insets) => {
      set({ safeAreaInsets: insets });
    },
  };
});

export const loadDataTheme = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const storedThemeMode = getStoredThemeValue('themeMode');
  const storedThemeColor = getStoredThemeValue('themeColor');
  // Web keeps its historical behavior when no preference exists. Tauri must
  // always paint its explicit AMOLED default before the rest of the app loads.
  if (!isTauriAppPlatform() && (!storedThemeMode || !storedThemeColor)) return;

  const systemIsDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const ambientIsDarkMode = getInitialAmbientIsDarkMode(systemIsDarkMode);
  const mode = isValidThemeMode(storedThemeMode) ? storedThemeMode : getDefaultThemeMode();
  const color =
    storedThemeColor || (window.__READEST_IS_EINK ? 'contrast' : getDefaultThemeColor());
  const isDarkMode = resolveThemeIsDarkMode(mode, systemIsDarkMode, ambientIsDarkMode);
  applyDataTheme(color, isDarkMode);
};

export const initSystemThemeListener = (appService: AppService) => {
  if (typeof window === 'undefined' || !appService) return;

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const applySystemTheme = (systemIsDarkMode: boolean) => {
    setStoredThemeValue('systemIsDarkMode', systemIsDarkMode ? 'true' : 'false');
    useThemeStore.getState().handleSystemThemeChange(systemIsDarkMode);
  };
  const updateColorTheme = async () => {
    let systemIsDarkMode;
    if (appService.isIOSApp) {
      const res = await getSystemColorScheme();
      systemIsDarkMode = res.colorScheme === 'dark';
    } else {
      systemIsDarkMode = mediaQuery.matches;
    }
    applySystemTheme(systemIsDarkMode);
  };

  const updateWindowTheme = async () => {
    if (!appService.hasWindow || !appService.isLinuxApp) return;
    const currentWindow = getCurrentWindow();
    const isFullscreen = await currentWindow.isFullscreen();
    const isMaximized = await currentWindow.isMaximized();
    useThemeStore.setState({ isRoundedWindow: !isMaximized && !isFullscreen });
  };

  const syncAmbientForVisibility = () => {
    const mode = useThemeStore.getState().themeMode;
    if (document.visibilityState === 'visible') {
      syncAmbientLightSubscription(mode);
    } else {
      void stopAmbientLightListening();
    }
  };

  mediaQuery?.addEventListener('change', updateColorTheme);
  document.addEventListener('visibilitychange', () => {
    void updateColorTheme();
    syncAmbientForVisibility();
  });
  window.addEventListener('resize', updateWindowTheme);

  // iOS WKWebView never fires the `prefers-color-scheme` media query
  // `change` event while the app stays foregrounded (e.g. toggling dark
  // mode from Control Center), so the native plugin pushes the new
  // appearance through this callback instead.
  if (appService.isIOSApp) {
    window.onNativeColorSchemeChange = (colorScheme) => {
      applySystemTheme(colorScheme === 'dark');
    };
  }

  updateColorTheme();

  // appService.init() has already probed the sensor by the time this runs, so
  // fall back when Ambient Mode was persisted on a device that lacks one.
  const themeMode = useThemeStore.getState().themeMode;
  if (themeMode === 'ambient' && !appService.hasAmbientLightSensor) {
    useThemeStore.getState().setThemeMode('auto');
  } else {
    syncAmbientLightSubscription(themeMode);
  }
};
