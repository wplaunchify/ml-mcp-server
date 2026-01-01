# Changelog

All notable changes to the `@wplaunchify/ml-mcp-server` package will be documented in this file.

## [2.5.8] - 2026-01-01

### Fixed - Critical: Non-Blocking Plugin Detection ⚡

- **Added 3-second timeout** to plugin detection to prevent server startup hangs
- **Added `SKIP_PLUGIN_DETECTION` env var** to bypass detection entirely if needed
- **Prevents Claude Desktop crashes** when WordPress API is slow or requires authentication
- Plugin detection now fails gracefully and falls back to loading all tools

### Technical Details

- Plugin detection now uses `Promise.race()` with 3-second timeout
- If detection times out or fails, server loads all tools (safe fallback)
- Added `SKIP_PLUGIN_DETECTION=true` environment variable for emergency bypass
- Improved logging to show when detection is skipped or times out

### Why This Was Needed

v2.5.7 introduced plugin detection that made HTTP requests during server startup. This could cause:
- ❌ Claude Desktop to hang if WordPress API was slow
- ❌ Server startup failures if `/wp/v2/plugins` endpoint required special auth
- ❌ Timeout issues when multiple servers started simultaneously

v2.5.8 fixes this by:
- ✅ Adding timeout to prevent indefinite blocking
- ✅ Graceful fallback if detection fails
- ✅ Optional bypass via environment variable

### Backward Compatibility

✅ 100% backward compatible - all existing configurations work without changes.

---

## [2.5.7] - 2026-01-01

### Fixed - Graceful Plugin Detection Restored 🎯

- **Restored graceful plugin detection** that was removed in v2.5.6
- Server now detects which plugins are installed and only loads relevant tools
- **No more scary red error messages** when plugins aren't installed
- Clean connection experience - users only see tools for plugins they have

### Technical Details

- Added `getFilteredToolsAsync()` function that detects installed plugins via WordPress REST API
- Added `getFilteredHandlersAsync()` function to match handlers with loaded tools
- Updated `server.ts` to use async tool loading during initialization
- Plugin detection happens at startup when `ENABLED_TOOLS='all'` or not set
- Falls back to loading all tools if detection fails (safe default)
- Specific `ENABLED_TOOLS` values (wordpress, fluentcart, etc.) bypass detection

### Plugin Detection Logic

- WordPress tools: Always loaded (core functionality)
- FluentCommunity tools: Only if `fluent-community` or `fluentcommunity` plugin detected
- FluentCart tools: Only if `fluent-cart`, `fluentcart`, or `wp-payment-form` plugin detected
- FluentCRM tools: Only if `fluent-crm` or `fluentcrm` plugin detected
- ML Plugins tools: Only if `ml-image-editor`, `ml-media-hub`, or `fluent-affiliate` detected
- Pro tools: Only if `fluent-mcp-pro` or `fluentmcp-pro` plugin detected
- Debug tools: Always loaded

### User Impact

**Before (v2.5.6):**
- ⚠️ Red error messages for missing plugins
- 😱 Users thought something was broken
- 📞 Increased support requests

**After (v2.5.7):**
- ✅ Clean connection with no errors
- 😊 Only relevant tools shown
- 🎯 Professional user experience

### Backward Compatibility

✅ 100% backward compatible - all existing configurations work without changes.

### Preserved Features

- ✅ All ML Simple Site v4.0.4 tools (11 tools including revision management)
- ✅ All FluentMCP Pro tools (63 tools)
- ✅ All existing tool categories and handlers
- ✅ `ENABLED_TOOLS` environment variable filtering
- ✅ Multiple server configurations

---

## [2.5.0] - 2025-12-27

### Added - FluentMCP Pro Support 🎉

- **63 new Pro tools** for advanced WordPress management
- New `pro` tool category with `ENABLED_TOOLS=pro` support
- File System Operations (7 tools): read, write, list, delete, mkdir, move, info
- Database Operations (8 tools): query, backup, restore, tables, table info, optimize, repair, search/replace
- WordPress Settings (12 tools): general, reading, writing, discussion, media, permalink (get/update)
- Theme Management (3 tools): list, activate, get active
- System Utilities (5 tools): phpinfo, server info, disk space, error log, clear cache
- Config Files (2 tools): wp-config.php, .htaccess
- WooCommerce (13 tools): products, orders, customers, settings (full CRUD)
- WP-CLI Integration (2 tools): execute, check availability

### Changed

- Total tool count increased from 198 to 261 when using `ENABLED_TOOLS=all`
- Updated package description to mention FluentMCP Pro
- Added `fluentmcp-pro` and `woocommerce` to keywords

### Technical Details

- New file: `src/tools/fluent-mcp-pro.ts` with all Pro tool definitions and handlers
- Updated: `src/tools/index.ts` to integrate Pro category
- All Pro tools use `/fc-manager/v1/power/*` REST API endpoints
- Requires `fluent-mcp-pro.php` WordPress plugin v1.0.0+

### Backward Compatibility

✅ 100% backward compatible - all existing configurations continue to work without changes.

---

## [2.4.10] - 2025-12-20

### Fixed

- Resolved Claude Desktop crash when loading multiple FluentMCP servers simultaneously
- Made WordPress connection verification non-blocking in `initWordPress()` function
- Added optional `SKIP_INIT_CHECK` environment variable for faster startup

### Changed

- Connection errors now log warnings instead of throwing errors during initialization
- Improved startup reliability when WordPress API is slow or temporarily unavailable

---

## [2.4.9] - 2025-12-17

### Fixed

- Fixed duplicate tool registration bug for `mlcanvas_create_page`
- Removed `mlCanvasTools` from `mlplugins` category (was already in `wordpress` category)
- ML Canvas tools now only registered once in the `wordpress` category

---

## [2.4.8] - 2025-12-15

### Added

- ML Simple Site tools (5 tools): get site, save site, update settings, add block, get preview URL
- ML Canvas Block tools (3 tools): create page, edit page, get docs

### Changed

- ML Canvas and ML Simple Site tools now part of base `wordpress` category
- Updated tool count for `wordpress` category to 45 tools

---

## [2.4.0] - 2025-12-10

### Added

- FluentCommunity split into two categories for better tool management:
  - `fluentcommunity-core` (COMM1): 55 tools for posts, spaces, members, engagement
  - `fluentcommunity-learning` (COMM2): 36 tools for courses, lessons, design, admin
- Support for `ENABLED_TOOLS=fluentcommunity-core` and `ENABLED_TOOLS=fluentcommunity-learning`

### Changed

- Improved tool categorization to stay under 80-tool limit per MCP server
- Legacy `ENABLED_TOOLS=fluentcommunity` still works (loads all 91 tools)

---

## [2.3.0] - 2025-12-01

### Added

- FluentCart Analytics tools (5 tools)
- FluentCart Licensing tools (8 tools)
- FluentCart Admin tools (10 tools)
- FluentCommunity Chat tools (4 tools)
- FluentCommunity Admin tools (12 tools)

### Changed

- Total FluentCart tools increased to 48
- Total FluentCommunity tools increased to 91

---

## [2.2.0] - 2025-11-20

### Added

- Complete FluentCommunity implementation (91 tools total)
- FluentCommunity Core tools (55 tools)
- FluentCommunity Learning tools (36 tools)
- All FluentCommunity REST API endpoints now supported

---

## [2.1.0] - 2025-11-10

### Added

- FluentCRM tools (19 tools): contacts, lists, tags, campaigns
- FluentCart tools (31 tools): products, orders, customers, coupons
- Support for `ENABLED_TOOLS=fluentcrm` and `ENABLED_TOOLS=fluentcart`

---

## [2.0.0] - 2025-11-01

### Added

- Initial release of unified MCP server
- WordPress core tools (37 tools): content, taxonomies, plugins, media, users, comments
- FluentCommunity tools (58 tools): posts, spaces, members, courses
- Support for `ENABLED_TOOLS` environment variable
- Tool categorization and selective loading

### Breaking Changes

- Replaced multiple specialized MCP servers with single unified server
- New configuration format using `ENABLED_TOOLS` instead of separate packages

---

## Version History

- **2.5.0** - FluentMCP Pro support (63 new tools)
- **2.4.10** - Startup reliability fixes
- **2.4.9** - Duplicate tool registration fix
- **2.4.8** - ML Canvas & ML Simple Site tools
- **2.4.0** - FluentCommunity split (COMM1/COMM2)
- **2.3.0** - FluentCart/Community admin tools
- **2.2.0** - Complete FluentCommunity
- **2.1.0** - FluentCRM & FluentCart
- **2.0.0** - Initial unified release

---

**Note:** This package requires the corresponding WordPress plugins:
- `fluent-mcp.php` (base plugin)
- `fluent-mcp-pro.php` (for Pro tools)
- FluentCommunity, FluentCRM, FluentCart (for respective tools)

