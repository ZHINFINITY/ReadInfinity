# Contribution Guidelines

Thank you for helping improve **Read∞**. Contributions may include code, documentation, translations, accessibility improvements, testing, bug reports, and design feedback.

Before contributing:

- Follow the [Code of Conduct](CODE_OF_CONDUCT.md).
- Be respectful, civil, and open-minded.
- Search the [Read∞ issue tracker](https://github.com/ZHINFINITY/readinfinity/issues) for known issues and fixes.
- For a substantial feature or behavior change, open an issue first so the scope can be discussed before implementation.

## Prerequisites

Read∞ is a monorepo built with Node.js, pnpm, Rust, Cargo, and Tauri. Use a current supported Node.js release, install pnpm, and keep Rust current through `rustup`.

```bash
nvm install --lts
nvm use --lts
npm install --global pnpm
rustup update
```

The [Tauri prerequisites guide](https://v2.tauri.app/start/prerequisites/) describes platform-specific requirements. Android development also requires Java 17, the Android SDK, and the Android Rust compilation targets.

## Getting started

Clone the repository and enter its directory:

```bash
git clone https://github.com/ZHINFINITY/readinfinity.git
cd readinfinity
```

Install dependencies and prepare the local reader vendors:

```bash
git submodule update --init --recursive
pnpm install --frozen-lockfile
pnpm --filter ./apps/readest-app setup-vendors
```

You can inspect the local environment with:

```bash
pnpm tauri info
```

If Nix is available, the repository also provides development shells:

```bash
nix develop           # web and desktop development
nix develop .#android # Android development
nix develop .#ios     # iOS development on macOS
```

## Development

From the repository root:

```bash
pnpm tauri dev   # native desktop development
pnpm dev-web     # web development
pnpm preview     # preview the web build
```

For Android, initialize the generated project once and then start development:

```bash
rm -rf apps/readest-app/src-tauri/gen/android
pnpm --filter ./apps/readest-app tauri android init
pnpm --filter ./apps/readest-app tauri icon apps/readest-app/src-tauri/icons/icon.png
pnpm --filter ./apps/readest-app tauri android dev
```

To run on a device reachable over the local network, use the Android development command with its host option. Keep generated Android files and local signing material out of commits unless a change is intentionally being promoted into the repository.

## Validation and production builds

Run the checks relevant to your change. At minimum, inspect the diff and run the application type check when changing TypeScript:

```bash
git diff --check
pnpm --filter ./apps/readest-app exec tsc --noEmit -p apps/readest-app/tsconfig.json
```

Production builds use the native platform toolchains:

```bash
pnpm tauri build
pnpm --filter ./apps/readest-app tauri android build
pnpm --filter ./apps/readest-app tauri ios build
```

The public Android release workflow is [`.github/workflows/android-stable-release.yml`](.github/workflows/android-stable-release.yml). Release signing keys and passwords belong only in protected repository secrets; never commit them or print them in logs.

## Project layout

The main application is in [`apps/readest-app`](apps/readest-app). Frontend-only work can use the following commands:

| Command | Purpose |
|---|---|
| `pnpm dev-web` | Start the web application |
| `pnpm build-web` | Build the web application |
| `pnpm --filter ./apps/readest-app exec tsc --noEmit -p apps/readest-app/tsconfig.json` | Type-check the application |
| `git diff --check` | Check for whitespace errors |

Please also perform a manual functional test for the changed behavior. For Android changes, test both system Back presses and the affected reader or library flows on a physical device or emulator when possible.

## Pull requests

Explain the user-visible behavior, implementation scope, test commands, and any platform limitations in the pull request description. Keep unrelated refactors out of focused fixes. Documentation, translations, and code changes should retain applicable third-party notices and attribution.

## Credits

This guide is adapted in part from the contributing guidelines of [Cloudflare Wrangler](https://github.com/cloudflare/workers-sdk/blob/main/packages/wrangler/CONTRIBUTING.md). Read∞ also credits the open-source projects listed in the [README credits section](README.md#credits).
