# Changelog v2.1.3 → v2.1.4

**Date:** 2025-11-30

## Changes in v2.1.4

### Fixed
- **CRITICAL BUG**: Added missing `mlCanvasHandlers` to `wordpress` handler category
  - Tools were defined: `mlCanvasTools` was in `toolCategories.wordpress`
  - Handlers were missing: `mlCanvasHandlers` was NOT in `handlerCategories.wordpress`
  - This caused ML Canvas tools to fail when using `ENABLED_TOOLS=wordpress`

### Added
- Comments in index.ts documenting the 5-category structure matching MCP config

## Files Changed
- `src/tools/index.ts` - Added `...mlCanvasHandlers` to `handlerCategories.wordpress`
- `package.json` - Version bumped from 2.1.3 to 2.1.4

## Backup
- `old-versions/index-2.1.3.ts` - Pre-change backup

## The 5 Categories (matching TOOL-TRUTH-TABLE.md)

| # | Config Name | ENABLED_TOOLS Value | Tool Count |
|---|-------------|---------------------|------------|
| 1 | WP | `wordpress` | 40 |
| 2 | COMM1 | `fluentcommunity-core` | 55 |
| 3 | COMM2 | `fluentcommunity-learning` | 36 |
| 4 | CART | `fluentcart` | 48 |
| 5 | CRM | `fluentcrm` | 19 |

## Root Cause Analysis
The `wordpress` category in `toolCategories` included `...mlCanvasTools` but the corresponding `handlerCategories.wordpress` did NOT include `...mlCanvasHandlers`. This meant:
- The tools were registered (appeared in tool list)
- But calling them failed because no handler was registered

This is why ML Canvas tools weren't working when using `ENABLED_TOOLS=wordpress`.