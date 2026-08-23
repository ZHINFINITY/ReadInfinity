/**
 * CustomDictionaries — system-dictionary exclusivity lock.
 *
 * `settings.providerEnabled` is whole-field synced across devices, so the
 * System Dictionary "enabled" flag can arrive (true) on a device that doesn't
 * support the OS handoff at all (web, Linux, Windows). On those platforms the
 * System Dictionary row is hidden and the feature is a no-op at lookup time —
 * so it must NOT lock the other providers' toggles. On platforms where the
 * handoff is supported, enabling it stays exclusive and locks the rest.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import CustomDictionaries from '@/components/settings/CustomDictionaries';
import { useCustomDictionaryStore } from '@/store/customDictionaryStore';
import { BUILTIN_PROVIDER_IDS } from '@/services/dictionaries/types';
import type { DictionarySettings } from '@/services/dictionaries/types';
import { eventDispatcher } from '@/utils/event';

// Per-test platform control. `isSystemDictionaryEnabled` (real, from the
// registry) reads `isSystemDictionarySupported`, so toggling these flips both
// the row visibility and the lock gate the component now relies on.
const platform = vi.hoisted(() => ({ supported: false, available: false }));
const mocks = vi.hoisted(() => ({
  loadDictionariesFromFolder: vi.fn(),
}));
vi.mock('@/services/dictionaries/systemDictionary', () => ({
  isSystemDictionarySupported: () => platform.supported,
  isSystemDictionaryAvailable: () => platform.available,
}));

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => (s: string, values?: Record<string, string | number>) =>
    s.replace(/\{\{(\w+)\}\}/gu, (_match, key: string) => String(values?.[key] ?? '')),
}));

vi.mock('@/context/EnvContext', () => ({
  useEnv: () => ({
    appService: {
      isAndroidApp: true,
      isIOSApp: false,
      allowPathsInScopes: vi.fn(),
      loadDictionariesFromFolder: mocks.loadDictionariesFromFolder,
    },
    envConfig: {},
  }),
}));

vi.mock('@/utils/bridge', () => ({
  selectDirectory: vi.fn(async () => ({ path: '/storage/emulated/0/Dictionaries' })),
}));

vi.mock('@/utils/permission', () => ({
  requestStoragePermission: vi.fn(async () => true),
}));

const LOCKED_TITLE = 'Disable System Dictionary first to change this.';

const seedSettings = (settings: DictionarySettings) => {
  useCustomDictionaryStore.setState({
    dictionaries: [],
    settings,
    // The mount effect calls loadCustomDictionaries; no-op it so it can't
    // clobber the seeded state with on-disk defaults.
    loadCustomDictionaries: async () => {},
    saveCustomDictionaries: async () => {},
  });
};

const enabledSystemSettings: DictionarySettings = {
  providerOrder: [
    BUILTIN_PROVIDER_IDS.systemDictionary,
    BUILTIN_PROVIDER_IDS.wiktionary,
    BUILTIN_PROVIDER_IDS.wikipedia,
  ],
  providerEnabled: {
    // Synced "on" from a device where the OS handoff exists.
    [BUILTIN_PROVIDER_IDS.systemDictionary]: true,
    [BUILTIN_PROVIDER_IDS.wiktionary]: true,
    [BUILTIN_PROVIDER_IDS.wikipedia]: true,
  },
  webSearches: [],
};

const getToggles = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));

beforeEach(() => {
  platform.supported = false;
  platform.available = false;
  mocks.loadDictionariesFromFolder.mockReset();
});

afterEach(() => {
  cleanup();
});

describe('CustomDictionaries — system-dictionary lock', () => {
  it('does not lock other toggles when System Dictionary is unsupported on this platform', () => {
    // Web: not supported. System Dictionary row is hidden and the synced flag
    // must not lock Wiktionary / Wikipedia.
    platform.supported = false;
    platform.available = false;
    seedSettings(enabledSystemSettings);

    const { container } = render(<CustomDictionaries onBack={() => {}} />);
    const toggles = getToggles(container);

    // Two visible rows (System Dictionary hidden on this platform).
    expect(toggles).toHaveLength(2);
    expect(toggles.every((t) => !t.disabled)).toBe(true);
    expect(toggles.some((t) => t.title === LOCKED_TITLE)).toBe(false);
  });

  it('locks other toggles when System Dictionary is supported and enabled', () => {
    // macOS: supported. Enabling System Dictionary is exclusive, so the other
    // providers stay read-only while the System row itself remains toggleable.
    platform.supported = true;
    platform.available = true;
    seedSettings(enabledSystemSettings);

    const { container } = render(<CustomDictionaries onBack={() => {}} />);
    const toggles = getToggles(container);

    // All three rows visible (System Dictionary first per providerOrder).
    expect(toggles).toHaveLength(3);
    const [systemToggle, ...otherToggles] = toggles;
    expect(systemToggle!.disabled).toBe(false);
    expect(systemToggle!.title).not.toBe(LOCKED_TITLE);
    expect(otherToggles.every((t) => t.disabled)).toBe(true);
    expect(otherToggles.every((t) => t.title === LOCKED_TITLE)).toBe(true);
  });
});

describe('CustomDictionaries — direct folder loading', () => {
  it('keeps the folder action busy until direct discovery completes', async () => {
    seedSettings({ providerOrder: [], providerEnabled: {}, webSearches: [] });
    let finishLoad: ((result: unknown) => void) | undefined;
    mocks.loadDictionariesFromFolder.mockImplementation(
      () =>
        new Promise((resolve) => {
          finishLoad = resolve;
        }),
    );

    render(<CustomDictionaries onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Choose Dictionary Folder' }));

    expect((await screen.findByRole('button', { name: 'Loading…' })) as HTMLButtonElement).toMatchObject({
      disabled: true,
    });
    await act(async () => {
      finishLoad?.({ imported: [], replacements: [], orphanFiles: [] });
    });
    expect(
      (await screen.findByRole('button', { name: 'Choose Dictionary Folder' })) as HTMLButtonElement,
    ).toMatchObject({ disabled: false });
  });

  it('reports a direct-folder discovery failure', async () => {
    seedSettings({ providerOrder: [], providerEnabled: {}, webSearches: [] });
    mocks.loadDictionariesFromFolder.mockRejectedValue(new Error('folder is not readable'));
    const dispatch = vi.spyOn(eventDispatcher, 'dispatch');

    render(<CustomDictionaries onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Choose Dictionary Folder' }));

    await waitFor(() =>
      expect(dispatch).toHaveBeenCalledWith(
        'toast',
        expect.objectContaining({
          type: 'error',
          message: 'Failed to load dictionary folder: folder is not readable',
        }),
      ),
    );
  });
});
