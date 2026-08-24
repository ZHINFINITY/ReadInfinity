<div align="center">
  <img src="./apps/readest-app/src-tauri/icons/icon.png" alt="Read∞ icon" width="160" />
  <h1>Read∞</h1>
  <p><strong>A private, offline-first ebook reader for Android and desktop platforms.</strong></p>
  <p>Open books and dictionaries directly from folders you choose. Your source files stay where you put them.</p>
  <p>
    <a href="https://github.com/ZHINFINITY/readinfinity/releases/tag/v1.0.0">Latest release</a> ·
    <a href="https://github.com/ZHINFINITY/readinfinity/issues">Issues</a> ·
    <a href="https://github.com/ZHINFINITY/readinfinity/pulls">Pull requests</a>
  </p>
</div>

## Overview

Read∞ is an offline-first reading application for people who want their books, dictionaries, annotations, and reading progress to remain on their own devices. The Android package is `com.infinity.readz`, and the current public release is `v1.0.0`.

The native application opens supported files directly from user-selected device folders. It does not require an account, cloud library, online synchronization, telemetry, or a server connection for its core reading features. Local metadata, covers, notes, annotations, and reading progress are stored on the device; the original book and dictionary files remain in their selected folders.

## Features

| Feature | Description | Status |
|---|---|---|
| Multi-format reading | EPUB, PDF, MOBI, KF8/AZW3, FB2, CBZ, TXT, and Markdown | Available |
| Direct folder reading | Choose one or more book folders and scan their subfolders without copying book files into app storage | Available |
| Local dictionaries | Recursively load supported StarDict, MDict, dictd, Slob, and Babylon dictionaries from a selected folder | Available |
| Search and navigation | Search within books and navigate chapters, pages, footnotes, and references | Available |
| Notes and annotations | Highlights, bookmarks, notes, reading progress, and local metadata | Available |
| Themes and layout | AMOLED black mode, dark mode, fonts, spacing, margins, and page or scroll layouts | Available |
| Text-to-speech | Local text-to-speech where supported by the device | Available |
| Read-along media | Play compatible local EPUB 3 media overlays and DRM-free narration files | Available |
| Accessibility | Keyboard navigation and support for platform screen readers | Available |
| Online accounts and cloud sync | Not included in the offline application experience | Disabled |
| Remote catalogs and online integrations | Not required for local reading and disabled in offline mode | Disabled |

## Android download

The public release page contains separate signed APKs for all four Android ABIs:

| ABI | Download |
|---|---|
| `arm64-v8a` | [Read∞ Android release](https://github.com/ZHINFINITY/readinfinity/releases/tag/v1.0.0) |
| `armeabi-v7a` | [Read∞ Android release](https://github.com/ZHINFINITY/readinfinity/releases/tag/v1.0.0) |
| `x86` | [Read∞ Android release](https://github.com/ZHINFINITY/readinfinity/releases/tag/v1.0.0) |
| `x86_64` | [Read∞ Android release](https://github.com/ZHINFINITY/readinfinity/releases/tag/v1.0.0) |

Select the APK matching the device architecture. The release page also provides SHA-256 checksum files.

## How direct folder reading works

On Android, select a books folder when prompted or from the library controls. Read∞ recursively discovers supported book files and records their original paths. A scan runs only when requested; returning to the application does not repeatedly scan the device. You can add or remove selected folders and choose supported formats or minimum file sizes.

Dictionary folders work in the same way. Choose a dictionary folder, including any parent folder containing subfolders, and Read∞ registers supported dictionaries from their original locations. The application stores only the local dictionary index and folder access information.

## Privacy and offline behavior

Read∞ does not require login or cloud synchronization for local reading. Online account, transfer, catalog, feed, and remote-integration surfaces are not part of the offline library workflow. Core reading, annotations, dictionaries, themes, search, backups, and local text-to-speech remain available without a backend service.

For implementation details, see [`OFFLINE_BUILD.md`](OFFLINE_BUILD.md).

## Building from source

Install the workspace dependencies and run the application-specific checks:

```bash
pnpm install --frozen-lockfile
cd apps/readest-app
pnpm exec tsc --noEmit -p tsconfig.json
```

Android builds require the Android SDK, Java 17, Rust, the Android Rust targets, and the Tauri CLI. The public release workflow is [`.github/workflows/android-stable-release.yml`](.github/workflows/android-stable-release.yml).

## Credits

Read∞ is maintained by **ZHINFINITY** and benefits from the work of the open-source projects and communities below:

| Project or resource | Contribution | License or reference |
|---|---|---|
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

The project also incorporates contributions from the wider open-source community. Please retain the repository license, copyright notices, dependency licenses, and attribution files when redistributing source or binaries.

## Contributing

Bug reports, feature requests, documentation improvements, and pull requests are welcome. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md), [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), and [`SECURITY.md`](SECURITY.md) before participating.

## License

Read∞ is distributed under the **GNU Affero General Public License version 3 or later**. See [`LICENSE`](LICENSE) for the complete license text and the repository for applicable third-party notices.

<div align="center">
  <p>Read privately. Read directly. Read∞.</p>
</div>
