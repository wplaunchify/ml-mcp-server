# CHANGELOG v2.5.9 - CRITICAL FIX: Restore Synchronous Startup

**Release Date:** January 1, 2026  
**Status:** CRITICAL BUG FIX - Claude Desktop Connection Restored

## 🚨 CRITICAL FIX

**Problem:** Versions 2.5.6-2.5.8 introduced async plugin detection during server startup that made HTTP requests, causing Claude Desktop to hang or crash when multiple MCP servers started simultaneously. Users could not connect to Claude Desktop at all.

**Root Cause:** The `detectInstalledPlugins()` function was called during startup (even with 3-second timeout and graceful fallback), violating the cardinal rule: **NEVER make blocking HTTP requests during MCP server startup.**

**Solution:** Completely removed async plugin detection from startup flow and restored the synchronous approach from v2.5.5 that was working perfectly.

## Changes Made

### ✅ Restored Working Architecture (v2.5.5)

1. **server.ts** - Reverted to synchronous tool loading
   - Tools are loaded synchronously via `allTools` and `toolHandlers` imports
   - Tool registration happens BEFORE `initWordPress()` is called
   - NO HTTP requests during server initialization
   - Server starts instantly without waiting for any network calls

2. **tools/index.ts** - Removed all async functions
   - Removed `getFilteredToolsAsync()` function
   - Removed `getFilteredHandlersAsync()` function
   - Removed `detectInstalledPlugins()` import
   - Removed `pluginRequirements` and `hasAnyPlugin()` helper functions
   - Kept only synchronous `getFilteredTools()` and `getFilteredHandlers()`

3. **wordpress.ts** - Plugin detection function remains but is NOT called during startup
   - `detectInstalledPlugins()` still exists for potential future use
   - Has proper timeout (3 seconds) and graceful fallback
   - Can be called AFTER server is running if needed
   - NOT called during startup - this is the key fix

### ✅ All New Tools Preserved

All tools added since v2.5.3 are still included:
- ✅ ML Simple Site version management tools (3 tools)
  - `mlss_get_revisions` - List all saved revisions
  - `mlss_restore_revision` - Restore specific revision
  - `mlss_save_revision` - Save current state as revision
- ✅ All other existing tools (198 total)

### ✅ ENABLED_TOOLS Still Works

The `ENABLED_TOOLS` environment variable still functions correctly:
- `ENABLED_TOOLS=wordpress` - Load only WordPress tools
- `ENABLED_TOOLS=fluentcommunity-core` - Load only FluentCommunity core tools
- `ENABLED_TOOLS=fluentcommunity-learning` - Load only learning tools
- `ENABLED_TOOLS=fluentcart` - Load only FluentCart tools
- `ENABLED_TOOLS=fluentcrm` - Load only FluentCRM tools
- `ENABLED_TOOLS=all` or empty - Load all tools (default)

## Why This Happened

**Version History:**
- **v2.5.3** - Working perfectly with synchronous loading
- **v2.5.4-2.5.5** - Still working (no changes to startup)
- **v2.5.6** - SimpleSight agent added async plugin detection
- **v2.5.7** - Attempted fix with timeout/fallback (still blocking)
- **v2.5.8** - Another attempted fix (still blocking)
- **v2.5.9** - **FIXED** - Completely removed async startup code

**The Lesson (Again):**
This is the THIRD time we've had this issue:
1. **v2.4.8** - `initWordPress()` made blocking HTTP GET during startup → Claude Desktop crashed
2. **v2.5.7** - `detectInstalledPlugins()` made blocking HTTP request during startup → Claude Desktop couldn't connect
3. **v2.5.9** - **FINAL FIX** - NO HTTP requests during startup AT ALL

**The Rule:**
> Before ANY startup code: (1) Does it make HTTP requests? (2) If YES, DON'T DO IT. (3) NO EXCEPTIONS.

See `fucking-idiot/NEVER-BLOCK-SERVER-STARTUP.md` and `fucking-idiot/NEVER-IGNORE-KNOWN-PROBLEMS.md`

## Testing

✅ Build succeeds without errors  
✅ No TypeScript linter errors  
✅ All tool imports present  
✅ Server starts synchronously  
✅ No HTTP requests during startup  
✅ Claude Desktop can connect to multiple servers simultaneously

## Upgrade Instructions

**For npm users:**
```bash
npm install @wplaunchify/ml-mcp-server@2.5.9
```

**For npx users:**
```bash
npx @wplaunchify/ml-mcp-server@2.5.9
```

**Restart Claude Desktop after upgrading.**

## Files Changed

- `src/server.ts` - Restored to v2.5.5 synchronous approach
- `src/tools/index.ts` - Removed async functions and plugin detection
- `package.json` - Version bump to 2.5.9
- `CHANGELOG-2.5.9.md` - This file

## Migration Notes

If you were using `SKIP_PLUGIN_DETECTION=true` as a workaround, you can remove it - plugin detection is no longer called during startup at all.

## Next Steps

If we want plugin-based tool filtering in the future, we need to:
1. Load ALL tools synchronously during startup (current behavior)
2. Make plugin detection call AFTER server is running
3. Dynamically register/unregister tools based on detection results
4. NEVER block server startup for any reason

---

**Version:** 2.5.9  
**Previous Version:** 2.5.8  
**Status:** Stable - Claude Desktop connection restored  
**Breaking Changes:** None - this is a bug fix that restores working behavior

