# NEVER REMOVE THE ENABLED_TOOLS CATEGORY SYSTEM

**Date:** February 10, 2026
**Version Broken:** 2.7.4 (fixed in 2.7.5)
**Severity:** Critical - v2.7.4 crashed every MCP server on startup with duplicate tool errors

## The Architecture (DO NOT CHANGE)

The MCP server has 5 tool groups loaded via `ENABLED_TOOLS` env var. Each runs as a SEPARATE MCP server instance to stay under Cursor's 80-tool limit:

1. **WP** (`ENABLED_TOOLS=wordpress`) - WordPress core + ML plugins + FluentMCP Pro
2. **COMM1** (`ENABLED_TOOLS=fluentcommunity-core`) - Community Core (55 tools)
3. **COMM2** (`ENABLED_TOOLS=fluentcommunity-learning`) - Learning & Admin (37 tools)
4. **CART** (`ENABLED_TOOLS=fluentcart`) - FluentCart (49 tools)
5. **CRM** (`ENABLED_TOOLS=fluentcrm`) - FluentCRM (30 tools)

This is BY DESIGN. `fluent-community.ts` (legacy all-in-one) and `fluent-community-core.ts` + `fluent-community-learning.ts` (split modules) have OVERLAPPING tool names. They CANNOT be loaded together.

## What Originally Went Wrong

Pro tools (WooCommerce, file system, database, etc.) were in a separate `pro` category but NOT included in the `wordpress` category. So when `ENABLED_TOOLS=wordpress`, Pro tools were silently excluded.

Also, WooCommerce endpoint paths in `fluent-mcp-pro.ts` used `/power/wc/` but the PHP plugin registers at `/power/woo/`.

## How I Made It Worse (v2.7.4)

Instead of just adding Pro tools to the `wordpress` category (a 2-line fix), I ripped out the entire ENABLED_TOOLS system and loaded every module in a flat list. This caused `fluent-community.ts` and `fluent-community-core.ts` to both register `fc_list_posts` and dozens of other duplicate tool names. The MCP SDK threw `Tool fc_list_posts is already registered` and the server crashed on startup for EVERYONE.

## The Actual Fix (v2.7.5)

1. Restored the original `index.ts` with ENABLED_TOOLS intact
2. Added `...fluentMcpProTools` and `...fluentMcpProHandlers` to the `wordpress` category
3. Kept the `/wc/` to `/woo/` endpoint path fix in `fluent-mcp-pro.ts`

That's it. Two additions to the wordpress category. Nothing else changed.

## Rules Going Forward

1. **NEVER remove the ENABLED_TOOLS category system.** It exists because of Cursor's 80-tool limit and because legacy/split modules have duplicate tool names.

2. **When adding new tools, add them to the appropriate category.** Pro tools go in `wordpress`. Community tools go in their respective COMM1/COMM2 split.

3. **Endpoint paths in the NPM server MUST match the PHP plugin.** The PHP plugin `register_rest_route()` calls are the source of truth.

4. **TEST the server startup with each ENABLED_TOOLS value before publishing.** Run: `ENABLED_TOOLS=wordpress node ./build/server.js` and verify no crashes.

5. **NEVER make sweeping architectural changes to fix a small bug.** The fix was 2 lines. I turned it into a disaster.
