import { Dispatch, SetStateAction, useCallback } from 'react';
import { Book } from '@/types/book';
import { useEnv } from '@/context/EnvContext';
import { useLibraryStore } from '@/store/libraryStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppRouter } from '@/hooks/useAppRouter';
import { eventDispatcher } from '@/utils/event';
import { navigateToReader, showReaderWindow } from '@/utils/nav';
import { isAudiobook } from '@/utils/audiobook';

interface UseOpenBookOptions {
  setLoading: Dispatch<SetStateAction<boolean>>;
  handleBookDownload: (
    book: Book,
    options?: { redownload?: boolean; queued?: boolean },
  ) => Promise<boolean>;
}

/**
 * Shared "open this book" flow used by per-item taps (`BookshelfItem`) and
 * the recently-read shelf. Offline builds only open files available on this
 * device and never download missing cloud-backed books.
 */
export const useOpenBook = ({
  setLoading: _setLoading,
  handleBookDownload: _handleBookDownload,
}: UseOpenBookOptions) => {
  const _ = useTranslation();
  const router = useAppRouter();
  const { envConfig, appService } = useEnv();
  const { settings } = useSettingsStore();
  const { updateBook } = useLibraryStore();

  const makeBookAvailable = useCallback(
    async (book: Book) => {
      // A library row is usable only while its file is available locally.
      // Never attempt a remote download in the offline distribution.
      if (await appService?.isBookAvailable(book)) {
        if (!book.downloadedAt || !book.coverDownloadedAt) {
          book.downloadedAt = Date.now();
          book.coverDownloadedAt = Date.now();
          await updateBook(envConfig, book);
        }
        return true;
      }
      eventDispatcher.dispatch('toast', {
        message: _('Book file is not available on this device.'),
        type: 'error',
      });
      return false;
    },
    [appService, envConfig, updateBook, _],
  );

  const openBook = useCallback(
    async (book: Book, cfi?: string, options?: { highlightSearchResult?: boolean }) => {
      // A streaming audiobook has no local file and no document loader path -
      // it opens in the full-screen player instead of the reader. Short-circuit
      // before any of the file-availability logic below, which assumes a real
      // file backs `book.filePath`.
      if (isAudiobook(book)) {
        router.push(`/player?id=${book.hash}`);
        return;
      }
      // In-place books point at a file outside Books/<hash>/ that the user (or
      // another app) may have moved, renamed, or deleted between sessions.
      // Probe the source before navigating and remove only the stale local row.
      if (book.filePath && !book.deletedAt) {
        const available = await appService?.isBookAvailable(book);
        if (!available) {
          eventDispatcher.dispatch('toast', {
            message: _(
              'Book file no longer exists. Confirm deletion to remove it from the library.',
            ),
            type: 'info',
          });
          eventDispatcher.dispatch('delete-books', { ids: [book.hash] });
          return;
        }
      }
      const available = await makeBookAvailable(book);
      if (!available) return;
      const params = new URLSearchParams();
      if (cfi) params.set('cfi', cfi);
      if (cfi && options?.highlightSearchResult) params.set('highlight', 'search');
      const queryParams = params.size ? params.toString() : undefined;
      if (appService?.hasWindow && settings.openBookInNewWindow) {
        showReaderWindow(appService, [book.hash], queryParams);
      } else {
        setTimeout(() => {
          navigateToReader(router, [book.hash], queryParams);
        }, 0);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appService, makeBookAvailable, settings.openBookInNewWindow],
  );

  return { openBook, makeBookAvailable };
};
