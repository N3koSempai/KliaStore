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

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── FeaturedSection.tsx
│   ├── AppsOfTheDaySection.tsx
│   └── CategoriesSection.tsx
├── hooks/              # Custom React hooks
│   └── useCategories.ts
├── pages/              # Page-level components
│   └── Home.tsx
├── services/           # API and external service integrations
│   └── api.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Root component
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

### HTTP Configuration
- Tauri HTTP plugin requires URL permissions in `src-tauri/capabilities/default.json`
- Current allowed URLs: `https://flathub.org/*`
- Unsafe headers feature enabled in `src-tauri/Cargo.toml` for flexibility

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

## Home Page Sections

1. **Featured Section**: Carousel placeholder for featured apps
2. **Apps of the Day**: Placeholder for daily app highlights
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

## Future Considerations

- Add routing (React Router)
- Implement featured carousel with actual data
- Add app details pages
- Implement search functionality
- Add state management if needed (Zustand/Redux)
- Add error boundaries
- Implement app installation flow
