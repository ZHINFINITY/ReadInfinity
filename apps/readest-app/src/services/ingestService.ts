import type { Book, BookLookupIndex } from '@/types/book';
import type { AppService, OsPlatform } from '@/types/system';
import type { SystemSettings } from '@/types/settings';
import { normalizeFilePathForIndex } from '@/services/bookService';
import { isContentURI, isValidURL } from '@/utils/misc';
import { isPseStreamFileName } from '@/services/opds/pseStream';

export interface IngestFileDeps {
  appService: AppService;
  settings: SystemSettings;
  /** Retained for compatibility with shared callers; always ignored offline. */
  isLoggedIn?: boolean;
  appBooksPrefix?: string | null;
}

export interface IngestFileOptions {
  file: File | string;
  books: Book[];
  lookupIndex?: BookLookupIndex;
  groupId?: string;
  groupName?: string;
  subjectTag?: string;
  /** Retained for compatibility with shared callers; uploads are disabled. */
  forceUpload?: boolean;
  transient?: boolean;
  forceCopy?: boolean;
}

/**
 * Offline policy: native paths and content-provider URIs are opened in place.
 * The library stores only metadata and the source reference, not a second
 * managed copy under Books/<hash>/. Browser File objects still use the browser
 * storage implementation because browsers cannot retain arbitrary filesystem
 * paths without a user-granted File System Access handle.
 */
function shouldImportInPlace(
  file: File | string,
  opts: Pick<IngestFileOptions, 'transient' | 'forceCopy'>,
  _inPlaceRoots: string[],
  _osPlatform: OsPlatform,
  _appBooksPrefix: string | null,
): boolean {
  if (opts.transient || opts.forceCopy || typeof file !== 'string') return false;
  if (isContentURI(file)) return true;
  if (isValidURL(file)) return false;
  const isWindowsDrive = /^[A-Za-z]:[\\/]/.test(file);
  return file.startsWith('/') || isWindowsDrive || file.startsWith('\\\\');
}

export async function ingestFile(
  opts: IngestFileOptions,
  deps: IngestFileDeps,
): Promise<Book | null> {
  const { appService, settings, appBooksPrefix } = deps;
  const inPlace = shouldImportInPlace(
    opts.file,
    opts,
    settings.externalLibraryFolders ?? [],
    appService.osPlatform,
    appBooksPrefix ?? null,
  );

  // Avoid reparsing the same on-disk file during watched-folder scans.
  if (
    inPlace &&
    !opts.transient &&
    opts.lookupIndex &&
    typeof opts.file === 'string' &&
    !isPseStreamFileName(opts.file) &&
    !isValidURL(opts.file) &&
    !isContentURI(opts.file)
  ) {
    const key = normalizeFilePathForIndex(opts.file, appService.osPlatform);
    const existing = key ? opts.lookupIndex.byFilePath.get(key) : undefined;
    if (existing) return existing;
  }

  const book = await appService.importBook(opts.file, opts.books, {
    lookupIndex: opts.lookupIndex,
    transient: opts.transient,
    inPlace,
  });
  if (!book) return null;

  if (opts.groupId !== undefined) {
    book.groupId = opts.groupId;
    book.groupName = opts.groupName;
  }

  const tag = opts.subjectTag?.trim();
  if (tag) {
    const tags = book.tags ?? [];
    if (!tags.includes(tag)) {
      book.tags = [...tags, tag];
      book.updatedAt = Date.now();
      book.metadataUpdatedAt = book.updatedAt;
    }
  }

  // Deliberately no upload, cloud-library, transfer-queue, or login gate.
  // All reading progress, annotations, metadata, and book references remain
  // on the local device through AppService's local database/filesystem.
  return book;
}
