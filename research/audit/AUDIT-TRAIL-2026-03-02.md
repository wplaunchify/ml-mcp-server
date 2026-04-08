# FluentMCP Pro Tool Sync Audit - 2026-03-02

## Problem
The NPM MCP server (`@wplaunchify/ml-mcp-server`) `fluent-mcp-pro.ts` had widespread mismatches against the WordPress plugin (`fluent-mcp-pro.php` v1.1.4):
- Wrong endpoint paths (e.g., `wp/*` instead of `settings/*`)
- Wrong HTTP methods (GET where POST was needed, etc.)
- Missing tools (themes install/delete/search/update, config, multiple WooCommerce CRUD)
- Wrong tool names (e.g., `pro_wc_*` vs PHP's `pro_woo_*`, `pro_themes_*` vs `pro_theme_*`)

## What Changed

### NPM Server: `@wplaunchify/ml-mcp-server` v2.7.6 -> v2.7.7

**File: `src/tools/fluent-mcp-pro.ts`** - Complete rewrite (backup at `.backup-before-audit-fix`)

#### Verification Performed
1. 64 tool definitions, 64 handlers - count match verified
2. Every tool name matches its PHP `'name' => 'pro_...'` descriptor exactly
3. Every handler endpoint matches its PHP `register_rest_route()` path exactly
4. Every handler HTTP method matches what the PHP route accepts
5. TypeScript compiles clean (`npm run build` - zero errors)
6. Export signatures unchanged: `fluentMcpProTools: Tool[]`, `fluentMcpProHandlers: Record<string, handler>`

### Tool Inventory (64 tools across 8 categories)

| Category | Count | Tool Names |
|----------|-------|------------|
| File System | 7 | pro_fs_read, pro_fs_write, pro_fs_list, pro_fs_delete, pro_fs_move, pro_fs_copy, pro_fs_mkdir |
| Database | 8 | pro_db_query, pro_db_backup, pro_db_optimize, pro_db_tables, pro_db_table_structure, pro_db_table_info, pro_db_export_sql, pro_db_import_sql |
| Settings | 12 | pro_settings_get_option, pro_settings_update_option, pro_settings_list_options, pro_settings_general, pro_settings_reading, pro_settings_writing, pro_settings_permalinks, pro_settings_flush_permalinks, pro_settings_clear_cache, pro_settings_customizer, pro_settings_menus, pro_settings_widgets |
| Themes | 6 | pro_theme_list, pro_theme_activate, pro_theme_install, pro_theme_delete, pro_theme_search, pro_theme_update |
| System | 5 | pro_system_cron_jobs, pro_system_run_cron, pro_system_transients, pro_system_security_scan, pro_system_performance |
| Config | 2 | pro_config_wp_config, pro_config_htaccess |
| WooCommerce | 22 | pro_woo_list_products, pro_woo_create_product, pro_woo_get_product, pro_woo_update_product, pro_woo_delete_product, pro_woo_list_orders, pro_woo_create_order, pro_woo_get_order, pro_woo_update_order, pro_woo_delete_order, pro_woo_update_order_status, pro_woo_list_customers, pro_woo_create_customer, pro_woo_get_customer, pro_woo_update_customer, pro_woo_delete_customer, pro_woo_inventory_stock, pro_woo_low_stock, pro_woo_categories, pro_woo_reports_sales, pro_woo_reports_top_products, pro_woo_reports_customers |
| WP-CLI | 2 | pro_wpcli_execute, pro_wpcli_available |

### Endpoint Mapping (every handler -> PHP route)

| Handler | Method | Endpoint Path |
|---------|--------|---------------|
| pro_fs_read | POST | fc-manager/v1/power/fs/read |
| pro_fs_write | POST | fc-manager/v1/power/fs/write |
| pro_fs_list | POST | fc-manager/v1/power/fs/list |
| pro_fs_delete | POST | fc-manager/v1/power/fs/delete |
| pro_fs_move | POST | fc-manager/v1/power/fs/move |
| pro_fs_copy | POST | fc-manager/v1/power/fs/copy |
| pro_fs_mkdir | POST | fc-manager/v1/power/fs/mkdir |
| pro_db_query | POST | fc-manager/v1/power/db/query |
| pro_db_backup | POST | fc-manager/v1/power/db/backup |
| pro_db_optimize | POST | fc-manager/v1/power/db/optimize |
| pro_db_tables | GET | fc-manager/v1/power/db/tables |
| pro_db_table_structure | POST | fc-manager/v1/power/db/table-structure |
| pro_db_table_info | POST | fc-manager/v1/power/db/table-info |
| pro_db_export_sql | POST | fc-manager/v1/power/db/export-sql |
| pro_db_import_sql | POST | fc-manager/v1/power/db/import-sql |
| pro_settings_get_option | POST | fc-manager/v1/power/settings/get-option |
| pro_settings_update_option | POST | fc-manager/v1/power/settings/update-option |
| pro_settings_list_options | GET | fc-manager/v1/power/settings/list-options |
| pro_settings_general | GET | fc-manager/v1/power/settings/general |
| pro_settings_reading | GET | fc-manager/v1/power/settings/reading |
| pro_settings_writing | GET | fc-manager/v1/power/settings/writing |
| pro_settings_permalinks | GET | fc-manager/v1/power/settings/permalinks |
| pro_settings_flush_permalinks | POST | fc-manager/v1/power/settings/flush-permalinks |
| pro_settings_clear_cache | POST | fc-manager/v1/power/settings/clear-cache |
| pro_settings_customizer | GET | fc-manager/v1/power/settings/customizer |
| pro_settings_menus | GET | fc-manager/v1/power/settings/menus |
| pro_settings_widgets | GET | fc-manager/v1/power/settings/widgets |
| pro_theme_list | GET | fc-manager/v1/power/themes/list |
| pro_theme_activate | POST | fc-manager/v1/power/themes/activate |
| pro_theme_install | POST | fc-manager/v1/power/themes/install |
| pro_theme_delete | POST | fc-manager/v1/power/themes/delete |
| pro_theme_search | GET | fc-manager/v1/power/themes/search |
| pro_theme_update | POST | fc-manager/v1/power/themes/update |
| pro_system_cron_jobs | GET | fc-manager/v1/power/system/cron-jobs |
| pro_system_run_cron | POST | fc-manager/v1/power/system/run-cron |
| pro_system_transients | GET | fc-manager/v1/power/system/transients |
| pro_system_security_scan | POST | fc-manager/v1/power/system/security-scan |
| pro_system_performance | GET | fc-manager/v1/power/system/performance |
| pro_config_wp_config | GET | fc-manager/v1/power/config/wp-config |
| pro_config_htaccess | GET | fc-manager/v1/power/config/htaccess |
| pro_woo_list_products | GET | fc-manager/v1/power/woo/products |
| pro_woo_create_product | POST | fc-manager/v1/power/woo/products |
| pro_woo_get_product | GET | fc-manager/v1/power/woo/products/{id} |
| pro_woo_update_product | PUT | fc-manager/v1/power/woo/products/{id} |
| pro_woo_delete_product | DELETE | fc-manager/v1/power/woo/products/{id} |
| pro_woo_list_orders | GET | fc-manager/v1/power/woo/orders |
| pro_woo_create_order | POST | fc-manager/v1/power/woo/orders |
| pro_woo_get_order | GET | fc-manager/v1/power/woo/orders/{id} |
| pro_woo_update_order | PUT | fc-manager/v1/power/woo/orders/{id} |
| pro_woo_delete_order | DELETE | fc-manager/v1/power/woo/orders/{id} |
| pro_woo_update_order_status | POST | fc-manager/v1/power/woo/orders/{id}/status |
| pro_woo_list_customers | GET | fc-manager/v1/power/woo/customers |
| pro_woo_create_customer | POST | fc-manager/v1/power/woo/customers |
| pro_woo_get_customer | GET | fc-manager/v1/power/woo/customers/{id} |
| pro_woo_update_customer | PUT | fc-manager/v1/power/woo/customers/{id} |
| pro_woo_delete_customer | DELETE | fc-manager/v1/power/woo/customers/{id} |
| pro_woo_inventory_stock | POST | fc-manager/v1/power/woo/inventory/stock |
| pro_woo_low_stock | GET | fc-manager/v1/power/woo/inventory/low-stock |
| pro_woo_categories | GET | fc-manager/v1/power/woo/categories |
| pro_woo_reports_sales | GET | fc-manager/v1/power/woo/reports/sales |
| pro_woo_reports_top_products | GET | fc-manager/v1/power/woo/reports/top-products |
| pro_woo_reports_customers | GET | fc-manager/v1/power/woo/reports/customers |
| pro_wpcli_execute | POST | fc-manager/v1/power/wpcli/execute |
| pro_wpcli_available | GET | fc-manager/v1/power/wpcli/available |

### What Was NOT Changed
- `index.ts` - untouched, imports/exports are structurally identical
- All other tool files (wordpress core, fluent-community, fluent-cart, fluent-crm, etc.)
- PHP plugin `fluent-mcp-pro.php` v1.1.4 - not modified in this session (was updated in previous session)
- ENABLED_TOOLS group logic - unaffected (wordpress, pro, fluentcommunity, fluentcart, fluentcrm, mlplugins, debug)
- Goose integration compatibility - tool names and endpoints now match exactly

### Key Fixes by Category

| Category | Old (broken) | New (fixed) |
|----------|-------------|-------------|
| Settings (all 12) | Endpoints were `wp/*` paths | Corrected to `settings/*` paths |
| System (all 5) | Mixed wrong paths, 3 missing | All 5 correct: `system/cron-jobs`, `system/run-cron`, etc. |
| Themes (3 new) | Only list/activate/install existed | Added delete, search, update |
| Config (2 new) | Did not exist | Added wp-config and htaccess tools |
| WooCommerce (10 new) | Only 12 tools, naming was `pro_wc_*` | Now 22 tools, naming is `pro_woo_*` |
| WP-CLI | Endpoint was `wp-cli/*` | Corrected to `wpcli/*` |
| File System | Missing `fs_copy`, had bogus `fs_info` | Added `fs_copy`, removed `fs_info` |
| Database | Wrong methods, missing tools | All 8 tools with correct methods |
