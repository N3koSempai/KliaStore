# KliaStore - Architecture Documentation

## Project Overview
KliaStore is a desktop application built with Tauri 2, React, and TanStack Query that provides a frontend for browsing and managing Flathub applications.

## Technology Stack

### Core Technologies
- **Tauri 2**: Desktop application framework (Rust backend)
- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and dev server
- **Material UI v7**: Component library
- **TanStack Query v5**: Data fetching and caching
- **pnpm**: Package manager

### Key Tauri Plugins
- `@tauri-apps/plugin-http`: HTTP client for API requests (with `unsafe-headers` feature enabled)
- `@tauri-apps/plugin-opener`: Opening links/files
- `@tauri-apps/plugin-shell`: Execute shell commands (used for Flatpak installation)
- `@tauri-apps/plugin-dialog`: Native dialogs
- `@tauri-apps/plugin-fs`: File system operations
- `@tauri-apps/plugin-sql`: SQLite database

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CachedImage.tsx # Smart image component with caching
│   └── Terminal.tsx
├── hooks/              # Custom React hooks
│   ├── useCategories.ts
│   ├── useAppOfTheDay.ts
│   ├── useAppsOfTheWeek.ts
│   ├── useAppInitialization.ts
│   └── useCompleteSetup.ts
├── pages/              # Page-level components
│   ├── home/
│   │   ├── Home.tsx
│   │   └── components/
│   │       ├── FeaturedSection.tsx
│   │       ├── AppsOfTheDaySection.tsx
│   │       └── CategoriesSection.tsx
│   ├── welcome/
│   │   └── Welcome.tsx
│   └── appDetails/
│       └── AppDetails.tsx
├── services/           # API and external service integrations
│   └── api.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── imageCache.ts   # Image caching manager
├── theme/              # MUI theme configuration
│   └── theme.ts
├── App.tsx             # Root component with routing
└── main.tsx           # Application entry point with QueryClient setup
```

## Architecture Principles

### Separation of Concerns
- **Services Layer**: All HTTP/API calls are centralized in `src/services/`
- **Hooks Layer**: Business logic and data fetching wrapped in custom hooks
- **Components Layer**: Presentational components that consume hooks
- **Pages Layer**: Page-level composition of components

### Data Flow
1. **API Service** (`services/api.ts`): Handles raw HTTP requests using Tauri's HTTP plugin
2. **Custom Hooks** (`hooks/`): Wraps API calls with TanStack Query for caching, loading states, and error handling
3. **Components/Pages**: Consume hooks and render UI based on data state

## API Integration

### Flathub API
- Base URL: `https://flathub.org/api/v2`
- Endpoints used:
  - `GET /collection/category`: Returns array of category strings
  - `GET /appOfTheDay`: Returns app of the day details
  - `GET /picks/:collection_id`: Returns apps of the week
  - `GET /appstream/:app_id`: Returns app metadata

### HTTP Configuration
- Tauri HTTP plugin requires URL permissions in `src-tauri/capabilities/default.json`
- Current allowed URLs: `https://flathub.org/*`, `https://dl.flathub.org/*`
- Unsafe headers feature enabled in `src-tauri/Cargo.toml` for flexibility

## Image Caching System

### Overview
Smart caching system that stores app images locally to reduce bandwidth and improve loading times.

### Architecture
- **Location**: `~/.local/share/com.gatorand.klia-store/cacheImages/`
- **Index File**: `index.json` - Maps `appId` to cached image filename
- **Image Files**: Named using pattern `{appId}.{extension}`

### Components

#### Frontend (`src/utils/imageCache.ts`)
- `ImageCacheManager`: Singleton class managing cache operations
- Methods:
  - `getOrCacheImage(appId, imageUrl)`: Main method - checks cache first, downloads if needed
  - `getCachedImagePath(appId)`: Retrieves cached image path
  - `cacheImage(appId, imageUrl)`: Downloads and caches new image
- Uses `convertFileSrc()` to convert file paths to Tauri-compatible URLs

#### CachedImage Component (`src/components/CachedImage.tsx`)
- React component wrapping image caching logic
- Props: `appId`, `imageUrl`, `alt`, `style`, `className`
- Features:
  - Loading placeholder
  - Automatic fallback to original URL on error
  - Transparent caching (consumer doesn't need to know about cache)

#### Rust Backend (`src-tauri/src/lib.rs`)
Tauri commands:
- `get_cache_image_dir()`: Returns cacheImages directory path
- `read_cache_index()`: Reads index.json (returns `{}` if not exists)
- `write_cache_index(content)`: Writes/updates index.json
- `download_and_cache_image(app_id, image_url)`: Downloads image, saves to disk, returns filename
- `get_cached_image_path(filename)`: Converts filename to full path

### Cache Flow
1. **First Load**:
   - `CachedImage` calls `getOrCacheImage()`
   - Check index.json for appId
   - Not found → Download image from URL
   - Save to disk as `{appId}.{ext}`
   - Update index.json with mapping
   - Return cached path

2. **Subsequent Loads**:
   - Check index.json for appId
   - Found → Return cached path directly
   - Skip download entirely

### File Format Detection
Automatically detects image type from HTTP `Content-Type` header:
- `image/png` → `.png`
- `image/jpeg` → `.jpg`
- `image/svg+xml` → `.svg`
- `image/webp` → `.webp`
- Default → `.png`

## Key Implementation Details

### Running the Application
- **Development**: `pnpm tauri dev` (NOT `pnpm run dev`)
  - `pnpm run dev` only runs Vite dev server without Tauri context
  - Tauri APIs (like HTTP plugin) only work in Tauri window
- **Build**: `pnpm tauri build`

### TanStack Query Setup
- QueryClient configured in `src/main.tsx`
- Query keys follow pattern: `["resource-name"]` (e.g., `["categories"]`)
- Automatic caching, refetching, and error handling

### Material UI Grid
- Uses **Grid2** (v2 API) not deprecated Grid v1
- Size prop syntax: `size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}`
- No `item` prop needed in v2

### Consistent Card Heights
- All cards use `height: "100%"` to fill grid cell
- Flexbox layout ensures consistent sizing across grid items

## Application Flow

### First Launch
1. App checks if `appConf.json` exists via `check_first_launch()`
2. If first launch → Shows Welcome page
3. User completes setup → `initialize_app()` creates:
   - `appConf.json` config file
   - `cacheImages/` directory
4. Navigate to Home page

### Home Page Sections

1. **Featured Section** (App of the Day):
   - Fetches from `/appOfTheDay` endpoint
   - Large card with app icon (cached), name, and summary
   - Uses `CachedImage` component
   - Click navigates to app details

2. **Apps of the Week**:
   - Fetches from `/picks/apps-of-the-week`
   - Grid of 5 app cards
   - Each card shows icon (cached), name, position
   - Uses `CachedImage` component
   - Click navigates to app details

3. **Categories Section**:
   - Displays categories from Flathub API
   - Shows skeleton loaders while fetching
   - Cards with image placeholders and category names
   - Responsive grid layout (5 columns on large screens)

## Development Guidelines

### Adding New API Endpoints
1. Add TypeScript types in `src/types/index.ts`
2. Create service method in `src/services/api.ts`
3. Create custom hook in `src/hooks/`
4. Use hook in components

### Adding New Pages
1. Create page component in `src/pages/`
2. Import and use in `App.tsx`

### Styling
- Prefer Material UI's `sx` prop for styling
- Use theme spacing units (e.g., `mb: 4`)
- Keep inline styles minimal

## Common Issues & Solutions

### Issue: "Cannot read properties of undefined (reading 'invoke')"
**Cause**: Running app with `pnpm run dev` instead of `pnpm tauri dev`
**Solution**: Always use `pnpm tauri dev` to access Tauri APIs

### Issue: HTTP requests blocked
**Cause**: URL not in permissions scope
**Solution**: Add URL pattern to `src-tauri/capabilities/default.json`:
```json
{
  "identifier": "http:default",
  "allow": [{ "url": "https://domain.com/*" }]
}
```

### Issue: MUI Grid warnings
**Cause**: Using deprecated Grid v1 API
**Solution**: Use Grid2 component with `size` prop

## Rust Backend Commands

All Tauri commands in `src-tauri/src/lib.rs`:

### App Management
- `check_first_launch()`: Returns boolean if app is first launch
- `initialize_app()`: Creates app directories and config file
- `get_app_data_path(subpath)`: Returns path to app data subdirectory

### Flatpak Installation
- `download_flatpakref(app_id)`: Downloads .flatpakref file
- `install_flatpak(app_id)`: Installs Flatpak app with real-time output events
  - Emits: `install-output`, `install-error`, `install-completed`

### Image Caching
- `get_cache_image_dir()`: Returns cacheImages directory path
- `read_cache_index()`: Reads index.json cache index
- `write_cache_index(content)`: Writes cache index
- `download_and_cache_image(app_id, image_url)`: Downloads and caches image
- `get_cached_image_path(filename)`: Converts filename to full path

## Future Considerations

- Implement search functionality
- Add state management if needed (Zustand/Redux)
- Add error boundaries
- Category filtering and browsing
- App update management
- Uninstall functionality
- Cache cleanup/management UI
- Offline mode support
