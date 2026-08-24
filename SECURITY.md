# Security Policy

## Scope and threat model

Read∞ is an offline-first ebook reader for Android and desktop platforms. It processes user-selected ebook and dictionary files, stores reading metadata locally, and provides native filesystem access only through the application’s scoped platform integrations. Core reading does not require an account, cloud library, remote synchronization, telemetry, or a backend service.

The primary security boundary is the user’s device. Book and dictionary files are untrusted input and may be malformed or intentionally hostile. The application also includes native components, third-party parsing and rendering libraries, WebView content, build dependencies, and platform filesystem integrations.

## Protected assets

| Asset | Protection goal |
|---|---|
| User-selected ebook and dictionary files | Prevent unintended modification, deletion, disclosure, or execution outside the reader’s supported content model |
| Reading progress, annotations, notes, covers, and preferences | Keep local metadata private and consistent |
| Selected-folder permissions and paths | Use only the folders the user grants or selects |
| Native bridge and filesystem operations | Limit platform actions to explicit application capabilities and validated inputs |
| Release signing material | Keep private signing keys and passwords outside the repository and CI logs |
| Dependencies and build outputs | Detect tampering and known vulnerabilities before release |

## Important mitigations

### Untrusted book content

Book files are treated as untrusted content. Rendering is isolated through the application’s WebView and reader boundaries, and the application does not treat ebook markup as native application code. Parser, renderer, archive, and content-security issues should be reported even when they require a specially crafted local file.

### Local filesystem access

Native file access is initiated by an explicit user-selected folder, file picker, or operating-system open-with action. Read∞ records source paths and local metadata; it does not need to copy user books into a remote service. A report involving path traversal, unintended folder access, destructive file operations, or access outside a granted scope is security-sensitive.

### Offline data handling

The offline application does not depend on login or cloud synchronization for its core library. Reports should still cover accidental network transmission, unexpected remote requests, exposed local metadata, unsafe URL handling, or a path that allows untrusted book content to reach privileged native operations.

### Native and WebView boundaries

Native commands and Android integrations are reviewed as privileged boundaries. Reports involving arbitrary command execution, unsafe IPC, WebView escape, exported activities, permission escalation, or bypasses of user-selected-folder restrictions should include a minimal reproduction whenever possible.

### Dependency and release security

JavaScript and Rust dependencies are pinned through the repository lockfiles. Release APKs are built in GitHub Actions, signed with repository secrets, and verified for package identity, signature, and ABI contents before publication. Signing passwords and private key material must never be committed or printed in logs.

## Out of scope

The following are generally outside the project’s direct control unless the application introduces a specific unsafe interaction with them:

- Vulnerabilities in an unmodified operating system, Android WebView, browser, or device firmware.
- Physical access attacks against an unlocked device.
- Malicious files opened by a user when no application boundary is bypassed.
- Availability or security incidents in unrelated third-party services.
- Feature requests or ordinary bugs without a confidentiality, integrity, privilege, or code-execution impact.

## Supported versions

Security fixes are prioritized for the latest public release series.

| Version | Supported |
|---|---|
| `1.0.x` | Yes |
| Older versions | Best effort only; update to the latest release when possible |

## Reporting a vulnerability

Please report suspected vulnerabilities privately. Do not open a public issue or discussion for security-sensitive details. Use [GitHub’s private vulnerability reporting for this repository](https://github.com/ZHINFINITY/readinfinity/security/advisories/new), or contact the repository maintainer privately through the [ZHINFINITY GitHub profile](https://github.com/ZHINFINITY).

Include the affected version, platform and ABI where relevant, a clear security impact, reproduction steps or a minimal proof of concept, and any suggested mitigation. Please redact personal files, private paths, signing material, and unrelated sensitive information.

We aim to acknowledge reports within three business days. We may request additional reproduction details or validation. Please keep vulnerability details private until a fix and disclosure plan have been agreed with the maintainer.

## Incident response

For a confirmed vulnerability, maintainers will triage severity and affected versions, develop and test a mitigation, publish a patched release when appropriate, and document the resolution in the repository or release notes. Disclosure timing will be coordinated with the reporter whenever practical.
