# Debug Utilities

This directory contains organized debugging utilities for the sharing system.

## Scripts

- `sharing-debug-utils.mjs` - Modern consolidated debug utilities

## Usage

```bash
# Debug page content
node scripts/debug-utils/sharing-debug-utils.mjs page

# Debug share dialog
node scripts/debug-utils/sharing-debug-utils.mjs dialog <deck-id>

# Debug collaborator addition
node scripts/debug-utils/sharing-debug-utils.mjs add <deck-id> <email>
```

## Archive

Archived debug scripts can be found in `scripts/archive/debug/`.

## Screenshots

Debug screenshots are saved to `debug-screenshots/` and are automatically ignored by git.