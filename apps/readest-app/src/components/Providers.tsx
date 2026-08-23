'use client';

import '@/utils/polyfill';
import i18n from '@/i18n/i18n';
import { useEffect } from 'react';
import { IconContext } from 'react-icons';
import { AuthProvider } from '@/context/AuthContext';
import { useEnv } from '@/context/EnvContext';
import { SyncProvider } from '@/context/SyncContext';
import { initSystemThemeListener, loadDataTheme } from '@/store/themeStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useCustomTextureStore } from '@/store/customTextureStore';
import { useSafeAreaInsets } from '@/hooks/useSafeAreaInsets';
import { useSettingsSync } from '@/hooks/useSettingsSync';
import { useDefaultIconSize } from '@/hooks/useResponsiveSize';
import { useBackgroundTexture } from '@/hooks/useBackgroundTexture';
import { useEinkMode } from '@/hooks/useEinkMode';
import { getLocale } from '@/utils/misc';
import { getDirFromUILanguage } from '@/utils/rtl';
import { getAndroidPatchedViewportContent } from '@/utils/viewport';
import { getLibraryViewSettings } from '@/helpers/settings';
import { DropdownProvider } from '@/context/DropdownContext';
import { CommandPaletteProvider, CommandPalette } from '@/components/command-palette';
import AtmosphereOverlay from '@/components/AtmosphereOverlay';
import AppLockScreen from '@/components/AppLockScreen';
import AppLockDialog from '@/components/settings/AppLockDialog';
import PassphrasePrompt from '@/components/PassphrasePrompt';
import { upgradeToKeychainIfAvailable } from '@/libs/crypto/passphrase';
import { cryptoSession } from '@/libs/crypto/session';
import { useAppLockStore } from '@/store/appLockStore';

const Providers = ({ children }: { children: React.ReactNode }) => {
  const { envConfig, appService } = useEnv();
  const { applyUILanguage } = useSettingsStore();
  const { applyBackgroundTexture } = useBackgroundTexture();
  const { applyEinkMode } = useEinkMode();
  const {
    isInitialized: isLockInitialized,
    isUnlocked,
    initialize: initializeAppLock,
  } = useAppLockStore();
  const iconSize = useDefaultIconSize();
  useSafeAreaInsets();
  useSettingsSync(); // Local multi-window settings broadcast only.

  useEffect(() => {
    const handlerLanguageChanged = (lng: string) => {
      document.documentElement.lang = lng;
      const dir = getDirFromUILanguage();
      if (dir === 'rtl') {
        document.documentElement.classList.add('ui-rtl');
      } else {
        document.documentElement.classList.remove('ui-rtl');
      }
    };

    const locale = getLocale();
    handlerLanguageChanged(locale);
    i18n.on('languageChanged', handlerLanguageChanged);
    return () => {
      i18n.off('languageChanged', handlerLanguageChanged);
    };
  }, []);

  useEffect(() => {
    loadDataTheme();
    if (appService) {
      initSystemThemeListener(appService);
      appService.loadSettings().then((settings) => {
        const globalViewSettings = settings.globalViewSettings;
        applyUILanguage(globalViewSettings.uiLanguage);
        if (settings.customTextures?.length) {
          useCustomTextureStore.getState().setTextures(settings.customTextures);
        }
        applyBackgroundTexture(envConfig, getLibraryViewSettings(settings));
        if (globalViewSettings.isEink) {
          applyEinkMode(true);
        }
        initializeAppLock({
          enabled: !!settings.pinCodeEnabled,
          hash: settings.pinCodeHash,
          salt: settings.pinCodeSalt,
          biometricUnlockEnabled: !!settings.biometricUnlockEnabled,
        });
      });
    }
  }, [
    envConfig,
    appService,
    applyUILanguage,
    applyBackgroundTexture,
    applyEinkMode,
    initializeAppLock,
  ]);

  // Local-only passphrase restoration for encrypted settings and annotations.
  useEffect(() => {
    void (async () => {
      await upgradeToKeychainIfAvailable();
      await cryptoSession.tryRestoreFromStore();
    })();
  }, []);

  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    if (!meta) return;
    const updated = getAndroidPatchedViewportContent(navigator.userAgent, meta.content);
    if (updated) meta.content = updated;
  }, []);

  if (!appService) return null;

  const showAppLockScreen = isLockInitialized && !isUnlocked;
  const appShellHidden = !isLockInitialized || !isUnlocked;

  return (
    <AuthProvider>
      <IconContext.Provider value={{ size: `${iconSize}px` }}>
        <SyncProvider>
          <DropdownProvider>
            <CommandPaletteProvider>
              <div
                aria-hidden={appShellHidden}
                style={appShellHidden ? { display: 'none' } : undefined}
              >
                {children}
                <CommandPalette />
                <AtmosphereOverlay />
                <PassphrasePrompt />
              </div>
              <AppLockDialog />
              {showAppLockScreen && <AppLockScreen />}
            </CommandPaletteProvider>
          </DropdownProvider>
        </SyncProvider>
      </IconContext.Provider>
    </AuthProvider>
  );
};

export default Providers;
