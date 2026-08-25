<div align="center">
  <img src="./apps/readest-app/src-tauri/icons/icon.png" alt="Read∞ icon" width="160" />
  <h1>Read∞</h1>
  <p><strong>A private, offline-first ebook reader for Android and desktop platforms.</strong></p>
  <p>Open books and dictionaries directly from folders you choose. Your source files stay where you put them.</p>
  <p>
    <a href="https://github.com/ZHINFINITY/ReadInfinity/releases/latest">Latest release</a> ·
    <a href="https://github.com/ZHINFINITY/ReadInfinity/issues">Issues</a> ·
    <a href="https://github.com/ZHINFINITY/ReadInfinity/pulls">Pull requests</a>
  </p>
</div>

## Overview

Read∞ is a privacy-first, offline ebook reader for Android and desktop. It is designed for readers who want their books, dictionaries, annotations, and reading progress to remain on their own devices. The Android package is `com.infinity.readz`, and the current public release is [`v1.0.0`](https://github.com/ZHINFINITY/ReadInfinity/releases/tag/v1.0.0).

The native application opens supported files directly from user-selected device folders. It does not require an account, cloud library, online synchronization, telemetry, or a server connection for its core reading features. Local metadata, covers, notes, annotations, and reading progress remain on the device; original book and dictionary files stay in their selected folders.

## Features

| Feature | What Read∞ provides |
|---|---|
| Multi-format reading | EPUB, PDF, MOBI, KF8/AZW3, FB2, CBZ, TXT, and Markdown reading support |
| Direct device-folder reading | Opens books from their original device locations without importing or duplicating book bytes into app-managed storage |
| Multiple book folders | Choose multiple folders, recursively include subfolders, add or remove locations later, and scan only when requested |
| Controlled book discovery | Select supported formats and a minimum file size; an explicit full-device scan remains available as an optional fallback |
| Local dictionaries | Recursively discover supported StarDict, MDict, dictd, Slob, and Babylon dictionaries from a selected folder and its subfolders without importing the dictionary files |
| Search and navigation | Search books and navigate chapters, pages, footnotes, references, and table-of-contents entries |
| Notes and annotations | Highlights, bookmarks, notes, selection actions, reading progress, and local metadata |
| Themes and layout | AMOLED black, dark, light, fonts, spacing, margins, page layouts, and scrolling layouts; AMOLED is the Android startup default |
| Offline text-to-speech | Device-local text-to-speech with local playback state and caching where supported by the platform |
| Local sharing | Native/system sharing of local book content without requiring an online account |
| Read-along media | Compatible local EPUB 3 media overlays and DRM-free narration files |
| Accessibility | Keyboard navigation and support for platform screen readers |
| Android navigation | Back first dismisses or navigates the active folder, settings, reader, or dialog level; the library root requires a second press to exit |
| Private offline operation | No login, cloud library, remote synchronization, telemetry, or backend gate for core local reading |
| Release distribution | Signed Android APKs for `arm64-v8a`, `armeabi-v7a`, `x86`, and `x86_64`, published through GitHub Releases |

## Android download

Download the signed APK matching the device architecture from the public [`Read∞ v1.0.0` release](https://github.com/ZHINFINITY/ReadInfinity/releases/tag/v1.0.0):

| ABI | APK |
|---|---|
| `arm64-v8a` | [`ReadInfinity_1.0.0_arm64-v8a.apk`](https://github.com/ZHINFINITY/ReadInfinity/releases/download/v1.0.0/ReadInfinity_1.0.0_arm64-v8a.apk) |
| `armeabi-v7a` | [`ReadInfinity_1.0.0_armeabi-v7a.apk`](https://github.com/ZHINFINITY/ReadInfinity/releases/download/v1.0.0/ReadInfinity_1.0.0_armeabi-v7a.apk) |
| `x86` | [`ReadInfinity_1.0.0_x86.apk`](https://github.com/ZHINFINITY/ReadInfinity/releases/download/v1.0.0/ReadInfinity_1.0.0_x86.apk) |
| `x86_64` | [`ReadInfinity_1.0.0_x86_64.apk`](https://github.com/ZHINFINITY/ReadInfinity/releases/download/v1.0.0/ReadInfinity_1.0.0_x86_64.apk) |

GitHub displays each asset’s digest in the release metadata. This release intentionally does not publish separate `.apk.sha256` files.

## How direct folder reading works

On Android, select a books folder when prompted or from the library controls. Read∞ recursively discovers supported book files and records their original paths. A scan runs only when requested; returning to the application does not repeatedly scan the device. You can add or remove selected folders and choose supported formats or minimum file sizes.

Dictionary folders work in the same way. Choose a dictionary folder, including any parent folder containing subfolders, and Read∞ registers supported dictionaries from their original locations. The application stores only the local dictionary index and folder access information. User-owned book and dictionary bytes are not copied into an app import directory.

## Privacy and offline behavior

Read∞ does not require login or cloud synchronization for local reading. Online account, transfer, catalog, feed, and remote-integration surfaces are not part of the offline library workflow. Core reading, annotations, dictionaries, themes, search, backups, local sharing, and local text-to-speech remain available without a backend service.

For implementation details, see [`OFFLINE_BUILD.md`](OFFLINE_BUILD.md). For attribution and third-party notices, see [`NOTICE.md`](NOTICE.md).

## Project status and upstream attribution

Read∞ is an independent, community-maintained fork of the [Readest open-source project](https://github.com/readest/readest), distributed under the GNU Affero General Public License version 3 or later. The upstream project and its contributors retain the copyright and attribution applicable to their original work. The upstream name is referenced here only to identify the source project; Read∞ is not the upstream project’s official distribution.

This fork adds the offline Android product behavior, direct device-folder reading, local dictionary discovery, Read∞ branding, the `com.infinity.readz` Android identity, AMOLED startup defaults, Android navigation handling, and signed public Android release automation. See [`NOTICE.md`](NOTICE.md) for the attribution summary and [`LICENSE`](LICENSE) for the complete license text.

## Building from source

Install the workspace dependencies and run the application-specific checks:

```bash
pnpm install --frozen-lockfile
cd apps/readest-app
pnpm exec tsc --noEmit -p tsconfig.json
```

Android builds require the Android SDK, Java 17, Rust, the Android Rust targets, and the Tauri CLI. The signed public release workflow is [`.github/workflows/android-stable-release.yml`](.github/workflows/android-stable-release.yml).

## Credits

Read∞ is maintained by **ZHINFINITY**, with product credits shown in the application About section for **InfinityZ-Lab**. The project depends on and incorporates work from the open-source projects below.

| Project or resource | Contribution | License or reference |
|---|---|---|
| [Readest](https://github.com/readest/readest) and its contributors | Upstream application code and reader foundation from which this independent fork is derived | AGPL-3.0-or-later; retain applicable upstream notices |
| [Tauri](https://tauri.app/) | Native desktop and Android application shell | MIT |
| [Next.js](https://nextjs.org/) | Application framework and build tooling | MIT |
| [React](https://react.dev/) | User-interface framework | MIT |
| [Foliate JavaScript libraries](https://github.com/johnfactotum/foliate-js) | Book parsing and reading components | MIT |
| [PDF.js](https://mozilla.github.io/pdf.js/) | PDF rendering | Apache License 2.0 |
| [zip.js](https://github.com/gildas-lormeau/zip.js) | Archive access | BSD-3-Clause |
| [fflate](https://github.com/101arrowz/fflate) | Compression utilities | MIT |
| [daisyUI](https://daisyui.com/) | Interface components | MIT |
| [Marked](https://marked.js.org/) | Markdown rendering | MIT |
| [React Icons](https://react-icons.github.io/react-icons/) | Interface icon set | Open-source licenses |
| [Google Fonts](https://fonts.google.com/) and bundled font projects | Reading typography and multilingual support | Respective licenses |

Please retain the repository license, copyright notices, dependency licenses, attribution files, and applicable source-offer obligations when redistributing source or binaries. Third-party projects remain subject to their respective licenses.

## Contributing

Bug reports, feature requests, documentation improvements, translations, accessibility improvements, and pull requests are welcome. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md), [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), and [`SECURITY.md`](SECURITY.md) before participating.

## License

Read∞ is distributed under the **GNU Affero General Public License version 3 or later**. See [`LICENSE`](LICENSE) for the complete license text and [`NOTICE.md`](NOTICE.md) for the attribution summary.

<div align="center">
  <p>Read privately. Read directly. Read∞.</p>
</div>
