import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import LibraryEmptyState from '@/app/library/components/LibraryEmptyState';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => (key: string, options?: Record<string, string | number>) => {
    if (!options) return key;
    return key.replace(/{{(\w+)}}/g, (_match, name) => String(options[name] ?? ''));
  },
}));

const useEnvMock = vi.fn();
vi.mock('@/context/EnvContext', () => ({
  useEnv: () => useEnvMock(),
}));

afterEach(() => {
  cleanup();
  useEnvMock.mockReset();
});

describe('LibraryEmptyState', () => {
  it('renders the offline desktop description without a sync-login control', () => {
    useEnvMock.mockReturnValue({ appService: { isMobile: false } });
    render(<LibraryEmptyState onImport={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Start your library' })).toBeTruthy();
    expect(screen.getByText(/scans your book folders automatically/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open a Book' })).toBeTruthy();
    expect(screen.queryByText(/sign in to sync/i)).toBeNull();
  });

  it('renders mobile automatic-scan description without import instructions', () => {
    useEnvMock.mockReturnValue({ appService: { isMobile: true } });
    render(<LibraryEmptyState onImport={vi.fn()} />);

    expect(screen.getByText(/scans your device for books automatically/i)).toBeTruthy();
    expect(screen.queryByText(/pick a book from your device/i)).toBeNull();
  });

  it('calls onImport when the local open button is clicked', () => {
    useEnvMock.mockReturnValue({ appService: { isMobile: false } });
    const handleImport = vi.fn();
    render(<LibraryEmptyState onImport={handleImport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Open a Book' }));

    expect(handleImport).toHaveBeenCalledTimes(1);
  });
});
