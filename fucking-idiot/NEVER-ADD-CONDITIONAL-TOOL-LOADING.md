# NEVER ADD CONDITIONAL TOOL LOADING

**Date:** February 10, 2026
**Version Fixed:** 2.7.4
**Severity:** Critical - all Pro tools (63 tools including WooCommerce) were completely invisible to every user

## What Happened

Someone added an `ENABLED_TOOLS` environment variable system to `src/tools/index.ts` that conditionally loaded tool categories based on a config value. The Pro tools (WooCommerce, file system, database, WP settings, system, WP-CLI) were put in a separate `pro` category. When `ENABLED_TOOLS=wordpress` was set (which is what all MCP configs use), the Pro tools were silently excluded. No error, no warning, just gone.

On top of that, the WooCommerce handler endpoint paths in `fluent-mcp-pro.ts` used `/power/wc/` while the actual PHP plugin registers endpoints at `/power/woo/`. So even if someone got the tools to load by setting `ENABLED_TOOLS=all`, every WooCommerce API call would have returned a 404.

Two bugs stacked on top of each other. Nobody could use WooCommerce tools. Period.

## What Was Fixed

1. **Ripped out the entire ENABLED_TOOLS conditional loading system.** `index.ts` is now a flat list - all tools, all handlers, always loaded. No environment variables, no category maps, no filtering functions.

2. **Fixed all WooCommerce endpoint paths** from `/power/wc/` to `/power/woo/` to match what the PHP plugin actually registers.

3. **Fixed the admin documentation** in `fluent-mcp-pro.php` that also showed the wrong `/wc/` paths.

## Rules Going Forward

1. **ALL tools load ALL the time.** No conditional loading. No environment variable filtering. No "categories" that silently exclude tools. If a tool exists in the codebase, it gets registered. Full stop.

2. **Endpoint paths in the NPM server MUST match the PHP plugin.** Before adding or changing any handler, verify the actual `register_rest_route()` call in the PHP plugin. The PHP plugin is the source of truth for endpoint paths.

3. **Never add "smart" loading systems** that try to reduce tool counts. The MCP client can handle all the tools. If there's ever a legitimate need to limit tools, that should be a user-facing configuration with loud warnings about what's being excluded, not a silent filter.

4. **Test that tools actually appear** in the MCP client's tool list after publishing. If a tool is defined but doesn't show up, something is broken.
