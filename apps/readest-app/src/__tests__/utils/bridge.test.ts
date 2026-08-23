import { vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  addPluginListener: vi.fn(),
  invoke: vi.fn(),
}));

vi.mock('@tauri-apps/api/core', () => ({
  addPluginListener: mocks.addPluginListener,
  invoke: mocks.invoke,
  Channel: class Channel {},
}));

import { selectDirectory } from '@/utils/bridge';

type DirectoryHandler = (payload: {
  requestId?: string;
  cancelled?: boolean;
  path?: string;
  uri?: string;
  error?: string;
}) => void;

const unregister = vi.fn();
let directoryHandler: DirectoryHandler = () => undefined;

beforeEach(() => {
  vi.useRealTimers();
  mocks.addPluginListener.mockReset();
  mocks.invoke.mockReset();
  unregister.mockReset();
  mocks.addPluginListener.mockImplementation(
    async (_plugin: string, _event: string, handler: DirectoryHandler) => {
      directoryHandler = handler;
      return { unregister };
    },
  );
  mocks.invoke.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('selectDirectory Android event flow', () => {
  it('registers before launching, ignores another request, and resolves the matching event', async () => {
    const resultPromise = selectDirectory(true);
    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.addPluginListener).toHaveBeenCalledWith(
      'native-bridge',
      'directory-picker-result',
      expect.any(Function),
    );
    expect(mocks.invoke).toHaveBeenCalledWith(
      'plugin:native-bridge|show_directory_picker',
      expect.objectContaining({ payload: expect.objectContaining({ requestId: expect.any(String) }) }),
    );

    const requestId = mocks.invoke.mock.calls[0]?.[1]?.payload?.requestId as string;
    directoryHandler({ requestId: 'another-request', path: '/wrong' });
    const pending = await Promise.race([
      resultPromise.then(() => 'resolved'),
      Promise.resolve('pending'),
    ]);
    expect(pending).toBe('pending');

    directoryHandler({ requestId, cancelled: false, path: '/storage/emulated/0/Books' });
    await expect(resultPromise).resolves.toMatchObject({
      requestId,
      cancelled: false,
      path: '/storage/emulated/0/Books',
    });
    expect(unregister).toHaveBeenCalledTimes(1);
  });

  it('returns a native cancellation and unregisters the temporary listener', async () => {
    const resultPromise = selectDirectory(true);
    await Promise.resolve();
    await Promise.resolve();
    const requestId = mocks.invoke.mock.calls[0]?.[1]?.payload?.requestId as string;

    directoryHandler({ requestId, cancelled: true });

    await expect(resultPromise).resolves.toMatchObject({ requestId, cancelled: true });
    expect(unregister).toHaveBeenCalledTimes(1);
  });

  it('times out and cleans up when Android never emits a matching result', async () => {
    vi.useFakeTimers();
    const resultPromise = selectDirectory(true);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(120_000);

    await expect(resultPromise).resolves.toMatchObject({
      cancelled: true,
      error: 'Timed out waiting for the Android folder picker result',
    });
    expect(unregister).toHaveBeenCalledTimes(1);
  });
});
