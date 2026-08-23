import { useCallback } from 'react';
import type { Book } from '@/types/book';
import type { EnvConfigType } from '@/services/environment';
import type { AppService } from '@/types/system';
import { useTranslation } from '@/hooks/useTranslation';
import { eventDispatcher } from '@/utils/event';

interface BookDownloadOptions {
  redownload?: boolean;
  queued?: boolean;
  silent?: boolean;
}

/**
 * Offline replacement for the former cloud transfer hook. The public shape is
 * kept so shared bookshelf components remain reusable, but no upload, download
 * queue, sync provider, or remote API is touched.
 */
export const useBookTransferActions = (
  _envConfig: EnvConfigType,
  appService: AppService | null,
  _updateBook: (envConfig: EnvConfigType, book: Book) => Promise<void>,
  _setBooksTransferProgress: unknown,
) => {
  const _ = useTranslation();

  const handleBookUpload = useCallback(
    async (book: Book, _syncBooks = true) => {
      eventDispatcher.dispatch('toast', {
        type: 'info',
        timeout: 2500,
        message: _('Cloud upload is disabled in offline mode: {{title}}', { title: book.title }),
      });
      return false;
    },
    [_],
  );

  const handleBookDownload = useCallback(
    async (book: Book, _downloadOptions: BookDownloadOptions = {}) => {
      const available = appService ? await appService.isBookAvailable(book) : false;
      if (!available) {
        eventDispatcher.dispatch('toast', {
          type: 'error',
          timeout: 3500,
          message: _('This book is not available on this device: {{title}}', { title: book.title }),
        });
      }
      return available;
    },
    [appService, _],
  );

  return { handleBookUpload, handleBookDownload };
};
