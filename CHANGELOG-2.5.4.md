# ml-mcp-server v2.5.4 - CRITICAL BUG FIX

**Published:** December 27, 2025  
**npm:** `@wplaunchify/ml-mcp-server@2.5.4`

## 🔥 CRITICAL FIX: Restored Graceful Error Handling

### What Was Broken

In v2.5.0-2.5.3, aggressive error handlers were causing the MCP server to crash and show "Could not connect" warnings in Claude Desktop when:
- Users had MCP configs for plugins that weren't installed
- Tools were called but endpoints returned 404 errors
- Any uncaught exception or unhandled promise rejection occurred

**Before v2.5.0:** Servers would start fine, tools would fail gracefully when called  
**v2.5.0-2.5.3:** Same config showed "Could not connect" warnings, servers crashed on errors  
**v2.5.4:** FIXED - Back to graceful behavior

### What Was Fixed

1. **Removed Aggressive Process Exit on Errors**
   - `process.on('uncaughtException')` now logs but doesn't kill the server
   - `process.on('unhandledRejection')` now logs but doesn't kill the server
   - Let the MCP SDK handle tool errors gracefully

2. **Added Try-Catch to Tool Handlers**
   - All tool handlers now wrapped in try-catch
   - Errors returned as tool results with `isError: true`
   - No more uncaught exceptions that kill the server

### Technical Details

**File Changed:** `src/server.ts`

**Before (v2.5.0-2.5.3):**
```typescript
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);  // ❌ KILLED THE SERVER
});
process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
    process.exit(1);  // ❌ KILLED THE SERVER
});
```

**After (v2.5.4):**
```typescript
// Log errors but don't kill the server - let MCP SDK handle tool errors gracefully
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    // Don't exit - let the server continue running
});
process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
    // Don't exit - let the server continue running
});
```

**Tool Handler Wrapping:**
```typescript
const wrappedHandler = async (args: any) => {
    try {
        const result = await handler(args);
        return {
            content: result.toolResult.content.map((item) => ({
                ...item,
                type: "text" as const
            })),
            isError: result.toolResult.isError
        };
    } catch (error: any) {
        // Return error as tool result instead of throwing
        return {
            content: [{
                type: "text" as const,
                text: `Error executing ${tool.name}: ${error.message || String(error)}`
            }],
            isError: true
        };
    }
};
```

### Impact

**Users can now:**
- Have all 5-6 MCP server configs in their `mcp.json`
- Not worry if FluentCommunity/FluentCart/FluentCRM/Pro aren't installed
- No "Could not connect" warnings in Claude Desktop
- Tools fail gracefully when called if plugin isn't installed
- Server stays running even if individual tool calls fail

### Upgrade Instructions

**For npm users:**
```bash
npm install @wplaunchify/ml-mcp-server@2.5.4
```

**For npx users:**
```bash
# Just restart Claude Desktop/Cursor - npx will auto-fetch latest
```

**No config changes needed** - this is a pure bug fix that restores the original graceful behavior from v2.4.10 and earlier.

### The "AI Constitution" Rule

This fix follows the **FluentMCP AI Constitution**: "We do not roll back when you break stuff. You roll forward and fix it."

Instead of reverting to v2.4.10, we:
1. Identified the breaking change (aggressive error handlers)
2. Fixed it in place (gentler error handling)
3. Published v2.5.4 with the fix
4. Preserved all the Pro tools and features added in v2.5.0

---

**Related Issues:**
- User reported: "Regardless of whether the plugins are installed, it shouldn't show warnings just because we've got a config file that says it could use the tools"
- Root cause: Aggressive `process.exit(1)` calls added in v2.5.0
- Solution: Removed aggressive exits, added try-catch to tool handlers

**Testing:**
- ✅ Server starts successfully even if WordPress is unreachable
- ✅ Tools fail gracefully with error messages instead of crashing
- ✅ Multiple MCP servers can run simultaneously without conflicts
- ✅ No "Could not connect" warnings in Claude Desktop for missing plugins

