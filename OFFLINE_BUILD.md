# ReadInfinity Offline Build

ReadInfinity is an unofficial offline distribution of [Readest](https://github.com/readest/readest). It preserves the original source attribution and AGPL license while removing the account and server-dependent parts of the application.

## Offline behavior

The application does not initialize Supabase authentication, create or refresh login sessions, start Readest replica synchronization, run cloud file synchronization, send telemetry, or expose the original server API routes. The `/auth`, `/auth/recovery`, `/auth/update`, and `/user` routes redirect to the local library instead of presenting account forms.

The library import flow is local-only. On native builds, absolute device paths and content-provider URIs are opened with the platform filesystem service and stored as the book’s `filePath`; the book file is not duplicated into `Books/<hash>/`. The reader checks that the source file still exists before opening it. If a file has been moved or deleted, the user receives a local availability error instead of a cloud-download attempt.

Native open-with and file-picker flows therefore provide direct device-file access. On Android, ReadInfinity requests All Files Access and automatically searches shared internal storage (`/storage/emulated/0`) for supported books when the library opens and when the app returns from the Android permission screen. The first-run fallback scans the shared-storage root; the **Choose Books Folder** action lets the user select a narrower folder such as `Books` or `Download`, remembers that path, and rescans it automatically on later starts. The scanner skips inaccessible system directories and retries after permission is granted. Watched-folder behavior remains local. The source book bytes stay in their original folders; ReadInfinity stores only its library index and optional metadata sidecars such as covers, configuration, annotations, and reading notes. Browser builds cannot retain unrestricted arbitrary filesystem paths: the browser must use its own user-selected file mechanism and browser storage constraints.

Online URL, web-novel, feed, OPDS, account, cloud-transfer, and AI settings surfaces are not offered from the offline library UI. Local features such as themes, annotations, reading progress, backups, dictionaries already stored on the device, app lock, full-text search, and local text-to-speech remain available where supported by the platform.

## Development checks

Install dependencies from the repository root with `pnpm install --frozen-lockfile`. TypeScript can be checked with:

```bash
cd apps/readest-app
pnpm exec tsc --noEmit -p tsconfig.json
```

The full production Next.js build may require a larger machine than a small sandbox because the upstream application bundles native readers and platform assets. A successful type check for the offline-modified files and `git diff --check` are useful lightweight checks when build memory is constrained.

## Licensing and redistribution

ReadInfinity remains subject to the original Readest license and third-party notices. Keep the repository’s `LICENSE` file, copyright notices, dependency licenses, and attribution when redistributing source or binaries. If you modify the covered work, identify the modifications and provide the corresponding source under the applicable AGPL terms. This repository is not an official Readest release and should not imply endorsement by the Readest project.
