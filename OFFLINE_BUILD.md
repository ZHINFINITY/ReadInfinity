# Read∞ Offline Build

Read∞ is an offline-first reading application maintained by ZHINFINITY. It focuses on private local reading and removes account and server-dependent behavior from the application experience while retaining the licenses and notices required by the included open-source components.

## Offline behavior

The application does not initialize authentication, create or refresh login sessions, start remote library synchronization, run cloud file synchronization, send telemetry, or expose server-dependent account routes. Account-oriented routes redirect to the local library instead of presenting login forms.

The library flow is local-only. On native builds, absolute device paths and content-provider URIs are opened with the platform filesystem service and stored as the book’s `filePath`; the book file is not duplicated into `Books/<hash>/`. The reader checks that the source file still exists before opening it. If a file has been moved or deleted, the user receives a local availability error instead of a remote-download attempt.

Native open-with and file-picker flows therefore provide direct device-file access. On Android, Read∞ requests the required storage access when the user starts discovery. It does not walk the whole shared-storage root on first launch. The user chooses one or more books folders, including their subfolders, and can select supported formats and a minimum file size before scanning. **Scan Books** scans the selected folders once; returning to the app does not start another scan. **Scan Entire Device Once** remains available as an explicit fallback for users who want a full shared-storage search. Selected folders are remembered and can be added or removed later. The source book bytes stay in their original folders; Read∞ stores only its library index and optional metadata sidecars such as covers, configuration, annotations, and reading notes. Browser builds must use the browser’s own user-selected file mechanism and browser storage constraints.

Dictionary settings use **Choose Dictionary Folder** rather than copying dictionary files into app-managed storage. On Android, the native folder picker grants access to the selected folder; Read∞ recursively discovers supported StarDict, MDict, dictd, Slob, and Babylon bundles, registers their original relative file paths, and opens them directly from the selected folder. Only dictionary metadata and the selected folder path are stored locally for the next launch. User-owned dictionary bytes are never copied or deleted.

Online URL, web-novel, feed, catalog, account, cloud-transfer, and remote AI settings surfaces are not offered from the offline library UI. Local features such as themes, annotations, reading progress, backups, dictionaries already stored on the device, app lock, full-text search, and local text-to-speech remain available where supported by the platform.

## Android navigation

The Android activity uses a two-press exit guard. The first system Back press displays a short confirmation message and keeps the application open; a second Back press within the confirmation window exits. Back presses consumed by dialogs, reader controls, and local navigation continue to be handled by the application before the exit guard is reached.

## Development checks

Install dependencies from the repository root with `pnpm install --frozen-lockfile`. TypeScript can be checked with:

```bash
cd apps/readest-app
pnpm exec tsc --noEmit -p tsconfig.json
```

The full production build may require a larger machine because the application bundles native readers and platform assets. Type checks for changed files and `git diff --check` are useful lightweight checks when build memory is constrained.

## Credits and licensing

Read∞ is maintained by **ZHINFINITY** and credits **InfinityZ-Lab** in the application About section. It is an independent fork of the [Readest open-source project](https://github.com/readest/readest); the upstream project and its contributors retain attribution for their original work. Read∞ also incorporates work from Tauri, Next.js, React, Foliate JavaScript libraries, PDF.js, zip.js, fflate, daisyUI, Marked, React Icons, and open-source font projects. See the [project credits in the README](README.md#credits) and the detailed [`NOTICE.md`](NOTICE.md).

Read∞ is distributed under the **GNU Affero General Public License version 3 or later**. Keep the repository’s `LICENSE` file, copyright notices, dependency licenses, and attribution when redistributing source or binaries. If you modify covered work, identify the modifications and provide the corresponding source under the applicable AGPL terms. Third-party projects remain subject to their respective licenses.
