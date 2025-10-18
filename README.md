# KliaStore

A modern desktop application for browsing and managing Flatpak applications from Flathub.

## Features

- Browse Flathub applications
- View app of the day and apps of the week
- Browse by categories
- Smart caching system for images and app data
- Install Flatpak applications directly
- Built with Tauri, React, and TypeScript

## Tech Stack

- **Tauri 2**: Desktop application framework
- **React 19**: UI library
- **TypeScript**: Type safety
- **Material UI v7**: Component library
- **TanStack Query**: Data fetching and caching
- **pnpm**: Package manager

## Development

### Prerequisites

- Node.js 20+
- Rust
- pnpm (`corepack enable pnpm`)

### Setup

```bash
# Install dependencies
pnpm install

# Run development server (IMPORTANT: use tauri dev, not just dev)
pnpm tauri dev

# Build for production
pnpm tauri build
```

> **Important**: Always use `pnpm tauri dev` instead of `pnpm dev`. The Tauri context is required for the app to function properly.

## Building and Distribution

For detailed instructions on building Flatpak packages and troubleshooting common build issues, see:

**[📖 Build Documentation](./architecture.md#build-and-distribution)**

### Quick Build Commands

**Flatpak:**
```bash
flatpak-builder --user --install --force-clean build-dir com.gatorand.klia-store.yml
flatpak run com.gatorand.klia-store
```

**Debian Package:**
```bash
pnpm tauri build --bundles deb
sudo dpkg -i src-tauri/target/release/bundle/deb/klia-store_*.deb
```

## Documentation

- [Architecture Documentation](./architecture.md) - Detailed technical documentation
- [Contributing Guidelines](./CONTRIBUTING.md) - How to contribute to the project

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## License

[MIT](./LICENSE.md)
