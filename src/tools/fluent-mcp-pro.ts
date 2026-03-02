import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { makeWordPressRequest } from '../wordpress.js';

// FluentMCP Pro - 64 tools across 8 categories
// All names+endpoints verified against fluent-mcp-pro.php register_rest_routes()

// ====== SCHEMAS ======

const fsReadSchema = z.object({ path: z.string().describe('File path'), encoding: z.enum(['utf8','base64']).optional() });
const fsWriteSchema = z.object({ path: z.string().describe('File path'), content: z.string().describe('Content'), encoding: z.enum(['utf8','base64']).optional() });
const fsListSchema = z.object({ path: z.string().describe('Directory path'), recursive: z.boolean().optional() });
const fsDeleteSchema = z.object({ path: z.string().describe('File path') });
const fsMoveSchema = z.object({ source: z.string().describe('Source'), destination: z.string().describe('Destination') });
const fsCopySchema = z.object({ source: z.string().describe('Source'), destination: z.string().describe('Destination') });
const fsMkdirSchema = z.object({ path: z.string().describe('Directory path'), recursive: z.boolean().optional() });

const dbQuerySchema = z.object({ query: z.string().describe('SQL query'), type: z.enum(['SELECT','INSERT','UPDATE','DELETE']).optional() });
const dbBackupSchema = z.object({ tables: z.array(z.string()).optional() });
const dbOptimizeSchema = z.object({ tables: z.array(z.string()).optional() });
const dbTablesSchema = z.object({ prefix: z.string().optional() });
const dbTableStructureSchema = z.object({ table: z.string().describe('Table name') });
const dbTableInfoSchema = z.object({ table: z.string().describe('Table name') });
const dbExportSqlSchema = z.object({ tables: z.array(z.string()).optional() });
const dbImportSqlSchema = z.object({ sql: z.string().describe('SQL statements') });

const settingsGetOptionSchema = z.object({ option: z.string().describe('Option name') });
const settingsUpdateOptionSchema = z.object({ option: z.string().describe('Option name'), value: z.any().describe('Value') });
const settingsListOptionsSchema = z.object({ search: z.string().optional(), limit: z.number().optional() });
const settingsEmptySchema = z.object({});

const themeListSchema = z.object({});
const themeActivateSchema = z.object({ theme: z.string().describe('Theme slug') });
const themeInstallSchema = z.object({ slug: z.string().describe('Theme slug from WordPress.org') });
const themeDeleteSchema = z.object({ theme: z.string().describe('Theme slug to delete') });
const themeSearchSchema = z.object({ search: z.string().optional(), tag: z.string().optional(), page: z.number().optional(), per_page: z.number().optional() });
const themeUpdateSchema = z.object({ theme: z.string().describe('Theme slug to update') });

const sysCronJobsSchema = z.object({});
const sysRunCronSchema = z.object({ hook: z.string().describe('Cron hook name') });
const sysTransientsSchema = z.object({});
const sysSecurityScanSchema = z.object({});
const sysPerformanceSchema = z.object({});

const configWpConfigSchema = z.object({});
const configHtaccessSchema = z.object({ content: z.string().optional().describe('New content or omit to read') });

const wooProductListSchema = z.object({ per_page: z.number().optional(), page: z.number().optional(), search: z.string().optional(), status: z.enum(['publish','draft','pending']).optional() });
const wooProductCreateSchema = z.object({ name: z.string(), type: z.enum(['simple','variable','grouped','external']).optional(), regular_price: z.string().optional(), description: z.string().optional() });
const wooProductGetSchema = z.object({ id: z.number().describe('Product ID') });
const wooProductUpdateSchema = z.object({ id: z.number(), name: z.string().optional(), regular_price: z.string().optional(), description: z.string().optional(), stock_quantity: z.number().optional() });
const wooProductDeleteSchema = z.object({ id: z.number(), force: z.boolean().optional() });
const wooOrderListSchema = z.object({ per_page: z.number().optional(), page: z.number().optional(), status: z.string().optional() });
const wooOrderCreateSchema = z.object({ status: z.string().optional(), customer_id: z.number().optional() });
const wooOrderGetSchema = z.object({ id: z.number().describe('Order ID') });
const wooOrderUpdateSchema = z.object({ id: z.number(), status: z.string().optional(), customer_note: z.string().optional() });
const wooOrderDeleteSchema = z.object({ id: z.number(), force: z.boolean().optional() });
const wooOrderStatusSchema = z.object({ id: z.number(), status: z.string().describe('New status') });
const wooCustomerListSchema = z.object({ per_page: z.number().optional(), page: z.number().optional(), search: z.string().optional() });
const wooCustomerCreateSchema = z.object({ email: z.string(), first_name: z.string().optional(), last_name: z.string().optional() });
const wooCustomerGetSchema = z.object({ id: z.number().describe('Customer ID') });
const wooCustomerUpdateSchema = z.object({ id: z.number(), email: z.string().optional(), first_name: z.string().optional(), last_name: z.string().optional() });
const wooCustomerDeleteSchema = z.object({ id: z.number(), force: z.boolean().optional() });
const wooInventoryStockSchema = z.object({ product_id: z.number(), stock_quantity: z.number() });
const wooLowStockSchema = z.object({ threshold: z.number().optional() });
const wooCategoriesSchema = z.object({});
const wooReportsSchema = z.object({ period: z.enum(['week','month','year']).optional() });

const wpCliExecuteSchema = z.object({ command: z.string().describe('WP-CLI command without wp prefix'), args: z.array(z.string()).optional() });
const wpCliAvailableSchema = z.object({});

// ====== TOOL DEFINITIONS ======

export const fluentMcpProTools: Tool[] = [
  { name: 'pro_fs_read', description: 'Read file contents from WordPress file system (2MB limit)', inputSchema: { type: 'object' as const, properties: fsReadSchema.shape } },
  { name: 'pro_fs_write', description: 'Write or create file in WordPress file system', inputSchema: { type: 'object' as const, properties: fsWriteSchema.shape } },
  { name: 'pro_fs_list', description: 'List directory contents in WordPress file system', inputSchema: { type: 'object' as const, properties: fsListSchema.shape } },
  { name: 'pro_fs_delete', description: 'Delete file from WordPress file system', inputSchema: { type: 'object' as const, properties: fsDeleteSchema.shape } },
  { name: 'pro_fs_move', description: 'Move or rename file', inputSchema: { type: 'object' as const, properties: fsMoveSchema.shape } },
  { name: 'pro_fs_copy', description: 'Copy a file', inputSchema: { type: 'object' as const, properties: fsCopySchema.shape } },
  { name: 'pro_fs_mkdir', description: 'Create directory', inputSchema: { type: 'object' as const, properties: fsMkdirSchema.shape } },
  { name: 'pro_db_query', description: 'Execute SQL query on WordPress database', inputSchema: { type: 'object' as const, properties: dbQuerySchema.shape } },
  { name: 'pro_db_backup', description: 'Create database backup', inputSchema: { type: 'object' as const, properties: dbBackupSchema.shape } },
  { name: 'pro_db_optimize', description: 'Optimize database tables', inputSchema: { type: 'object' as const, properties: dbOptimizeSchema.shape } },
  { name: 'pro_db_tables', description: 'List all database tables', inputSchema: { type: 'object' as const, properties: dbTablesSchema.shape } },
  { name: 'pro_db_table_structure', description: 'Get table column structure', inputSchema: { type: 'object' as const, properties: dbTableStructureSchema.shape } },
  { name: 'pro_db_table_info', description: 'Get table row count and size', inputSchema: { type: 'object' as const, properties: dbTableInfoSchema.shape } },
  { name: 'pro_db_export_sql', description: 'Export tables as SQL', inputSchema: { type: 'object' as const, properties: dbExportSqlSchema.shape } },
  { name: 'pro_db_import_sql', description: 'Import and execute SQL', inputSchema: { type: 'object' as const, properties: dbImportSqlSchema.shape } },
  { name: 'pro_settings_get_option', description: 'Get a WordPress option value', inputSchema: { type: 'object' as const, properties: settingsGetOptionSchema.shape } },
  { name: 'pro_settings_update_option', description: 'Update a WordPress option', inputSchema: { type: 'object' as const, properties: settingsUpdateOptionSchema.shape } },
  { name: 'pro_settings_list_options', description: 'List WordPress options', inputSchema: { type: 'object' as const, properties: settingsListOptionsSchema.shape } },
  { name: 'pro_settings_general', description: 'Get or update general WordPress settings', inputSchema: { type: 'object' as const, properties: settingsEmptySchema.shape } },
  { name: 'pro_settings_reading', description: 'Get or update reading settings', inputSchema: { type: 'object' as const, properties: settingsEmptySchema.shape } },
  { name: 'pro_settings_writing', description: 'Get or update writing settings', inputSchema: { type: 'object' as const, properties: settingsEmptySchema.shape } },
  { name: 'pro_settings_permalinks', description: 'Get or update permalink settings', inputSchema: { type: 'object' as const, properties: settingsEmptySchema.shape } },
  { name: 'pro_settings_flush_permalinks', description: 'Flush and regenerate permalink rules', inputSchema: { type: 'object' as const, properties: settingsEmptySchema.shape } },
  { name: 'pro_settings_clear_cache', description: 'Clear WordPress object and page cache', inputSchema: { type: 'object' as const, properties: settingsEmptySchema.shape } },
  { name: 'pro_settings_customizer', description: 'Get or update theme customizer settings', inputSchema: { type: 'object' as const, properties: settingsEmptySchema.shape } },
  { name: 'pro_settings_menus', description: 'List WordPress navigation menus', inputSchema: { type: 'object' as const, properties: settingsEmptySchema.shape } },
  { name: 'pro_settings_widgets', description: 'List WordPress widget areas and widgets', inputSchema: { type: 'object' as const, properties: settingsEmptySchema.shape } },
  { name: 'pro_theme_list', description: 'List all installed WordPress themes', inputSchema: { type: 'object' as const, properties: themeListSchema.shape } },
  { name: 'pro_theme_activate', description: 'Activate an installed WordPress theme', inputSchema: { type: 'object' as const, properties: themeActivateSchema.shape } },
  { name: 'pro_theme_install', description: 'Install a theme from WordPress.org repository', inputSchema: { type: 'object' as const, properties: themeInstallSchema.shape } },
  { name: 'pro_theme_delete', description: 'Delete an installed WordPress theme', inputSchema: { type: 'object' as const, properties: themeDeleteSchema.shape } },
  { name: 'pro_theme_search', description: 'Search the WordPress.org theme directory', inputSchema: { type: 'object' as const, properties: themeSearchSchema.shape } },
  { name: 'pro_theme_update', description: 'Update a theme to its latest version', inputSchema: { type: 'object' as const, properties: themeUpdateSchema.shape } },
  { name: 'pro_system_cron_jobs', description: 'List WordPress scheduled cron jobs', inputSchema: { type: 'object' as const, properties: sysCronJobsSchema.shape } },
  { name: 'pro_system_run_cron', description: 'Manually trigger a cron hook', inputSchema: { type: 'object' as const, properties: sysRunCronSchema.shape } },
  { name: 'pro_system_transients', description: 'List WordPress transients', inputSchema: { type: 'object' as const, properties: sysTransientsSchema.shape } },
  { name: 'pro_system_security_scan', description: 'Run a WordPress security scan', inputSchema: { type: 'object' as const, properties: sysSecurityScanSchema.shape } },
  { name: 'pro_system_performance', description: 'Get server and WordPress performance metrics', inputSchema: { type: 'object' as const, properties: sysPerformanceSchema.shape } },
  { name: 'pro_config_wp_config', description: 'Read wp-config.php (sensitive values redacted)', inputSchema: { type: 'object' as const, properties: configWpConfigSchema.shape } },
  { name: 'pro_config_htaccess', description: 'Read or update .htaccess file', inputSchema: { type: 'object' as const, properties: configHtaccessSchema.shape } },
  { name: 'pro_woo_list_products', description: 'List WooCommerce products', inputSchema: { type: 'object' as const, properties: wooProductListSchema.shape } },
  { name: 'pro_woo_create_product', description: 'Create a WooCommerce product', inputSchema: { type: 'object' as const, properties: wooProductCreateSchema.shape } },
  { name: 'pro_woo_get_product', description: 'Get a WooCommerce product by ID', inputSchema: { type: 'object' as const, properties: wooProductGetSchema.shape } },
  { name: 'pro_woo_update_product', description: 'Update a WooCommerce product', inputSchema: { type: 'object' as const, properties: wooProductUpdateSchema.shape } },
  { name: 'pro_woo_delete_product', description: 'Delete a WooCommerce product', inputSchema: { type: 'object' as const, properties: wooProductDeleteSchema.shape } },
  { name: 'pro_woo_list_orders', description: 'List WooCommerce orders', inputSchema: { type: 'object' as const, properties: wooOrderListSchema.shape } },
  { name: 'pro_woo_create_order', description: 'Create a WooCommerce order', inputSchema: { type: 'object' as const, properties: wooOrderCreateSchema.shape } },
  { name: 'pro_woo_get_order', description: 'Get a WooCommerce order by ID', inputSchema: { type: 'object' as const, properties: wooOrderGetSchema.shape } },
  { name: 'pro_woo_update_order', description: 'Update a WooCommerce order', inputSchema: { type: 'object' as const, properties: wooOrderUpdateSchema.shape } },
  { name: 'pro_woo_delete_order', description: 'Delete a WooCommerce order', inputSchema: { type: 'object' as const, properties: wooOrderDeleteSchema.shape } },
  { name: 'pro_woo_update_order_status', description: 'Update order status', inputSchema: { type: 'object' as const, properties: wooOrderStatusSchema.shape } },
  { name: 'pro_woo_list_customers', description: 'List WooCommerce customers', inputSchema: { type: 'object' as const, properties: wooCustomerListSchema.shape } },
  { name: 'pro_woo_create_customer', description: 'Create a WooCommerce customer', inputSchema: { type: 'object' as const, properties: wooCustomerCreateSchema.shape } },
  { name: 'pro_woo_get_customer', description: 'Get a WooCommerce customer by ID', inputSchema: { type: 'object' as const, properties: wooCustomerGetSchema.shape } },
  { name: 'pro_woo_update_customer', description: 'Update a WooCommerce customer', inputSchema: { type: 'object' as const, properties: wooCustomerUpdateSchema.shape } },
  { name: 'pro_woo_delete_customer', description: 'Delete a WooCommerce customer', inputSchema: { type: 'object' as const, properties: wooCustomerDeleteSchema.shape } },
  { name: 'pro_woo_inventory_stock', description: 'Update product stock quantity', inputSchema: { type: 'object' as const, properties: wooInventoryStockSchema.shape } },
  { name: 'pro_woo_low_stock', description: 'Get low stock products', inputSchema: { type: 'object' as const, properties: wooLowStockSchema.shape } },
  { name: 'pro_woo_categories', description: 'List product categories', inputSchema: { type: 'object' as const, properties: wooCategoriesSchema.shape } },
  { name: 'pro_woo_reports_sales', description: 'Get WooCommerce sales reports', inputSchema: { type: 'object' as const, properties: wooReportsSchema.shape } },
  { name: 'pro_woo_reports_top_products', description: 'Get top selling products', inputSchema: { type: 'object' as const, properties: wooReportsSchema.shape } },
  { name: 'pro_woo_reports_customers', description: 'Get customer reports', inputSchema: { type: 'object' as const, properties: wooReportsSchema.shape } },
  { name: 'pro_wpcli_execute', description: 'Execute a WP-CLI command', inputSchema: { type: 'object' as const, properties: wpCliExecuteSchema.shape } },
  { name: 'pro_wpcli_available', description: 'Check if WP-CLI is available', inputSchema: { type: 'object' as const, properties: wpCliAvailableSchema.shape } },
];

// Total: 64 tools

// ====== HANDLER HELPERS ======

function h(method: string, endpoint: string, errMsg: string) {
  return async (args: any) => {
    try {
      const r = await makeWordPressRequest(method as any, endpoint, args);
      return { toolResult: { content: [{ type: 'text' as const, text: JSON.stringify(r, null, 2) }] } };
    } catch (e: any) {
      return { toolResult: { isError: true, content: [{ type: 'text' as const, text: errMsg + ': ' + e.message }] } };
    }
  };
}

function hId(method: string, base: string, idField: string, errMsg: string) {
  return async (args: any) => {
    try {
      const r = await makeWordPressRequest(method as any, base + '/' + args[idField], args);
      return { toolResult: { content: [{ type: 'text' as const, text: JSON.stringify(r, null, 2) }] } };
    } catch (e: any) {
      return { toolResult: { isError: true, content: [{ type: 'text' as const, text: errMsg + ': ' + e.message }] } };
    }
  };
}

// ====== HANDLERS - Endpoints match PHP register_rest_route() exactly ======

export const fluentMcpProHandlers: Record<string, (args: any) => Promise<any>> = {
  pro_fs_read: h('POST', 'fc-manager/v1/power/fs/read', 'Error reading file'),
  pro_fs_write: h('POST', 'fc-manager/v1/power/fs/write', 'Error writing file'),
  pro_fs_list: h('POST', 'fc-manager/v1/power/fs/list', 'Error listing directory'),
  pro_fs_delete: h('POST', 'fc-manager/v1/power/fs/delete', 'Error deleting file'),
  pro_fs_move: h('POST', 'fc-manager/v1/power/fs/move', 'Error moving file'),
  pro_fs_copy: h('POST', 'fc-manager/v1/power/fs/copy', 'Error copying file'),
  pro_fs_mkdir: h('POST', 'fc-manager/v1/power/fs/mkdir', 'Error creating directory'),
  pro_db_query: h('POST', 'fc-manager/v1/power/db/query', 'Error executing query'),
  pro_db_backup: h('POST', 'fc-manager/v1/power/db/backup', 'Error creating backup'),
  pro_db_optimize: h('POST', 'fc-manager/v1/power/db/optimize', 'Error optimizing tables'),
  pro_db_tables: h('GET', 'fc-manager/v1/power/db/tables', 'Error listing tables'),
  pro_db_table_structure: h('POST', 'fc-manager/v1/power/db/table-structure', 'Error getting structure'),
  pro_db_table_info: h('POST', 'fc-manager/v1/power/db/table-info', 'Error getting table info'),
  pro_db_export_sql: h('POST', 'fc-manager/v1/power/db/export-sql', 'Error exporting SQL'),
  pro_db_import_sql: h('POST', 'fc-manager/v1/power/db/import-sql', 'Error importing SQL'),
  pro_settings_get_option: h('POST', 'fc-manager/v1/power/settings/get-option', 'Error getting option'),
  pro_settings_update_option: h('POST', 'fc-manager/v1/power/settings/update-option', 'Error updating option'),
  pro_settings_list_options: h('GET', 'fc-manager/v1/power/settings/list-options', 'Error listing options'),
  pro_settings_general: h('GET', 'fc-manager/v1/power/settings/general', 'Error with general settings'),
  pro_settings_reading: h('GET', 'fc-manager/v1/power/settings/reading', 'Error with reading settings'),
  pro_settings_writing: h('GET', 'fc-manager/v1/power/settings/writing', 'Error with writing settings'),
  pro_settings_permalinks: h('GET', 'fc-manager/v1/power/settings/permalinks', 'Error with permalinks'),
  pro_settings_flush_permalinks: h('POST', 'fc-manager/v1/power/settings/flush-permalinks', 'Error flushing permalinks'),
  pro_settings_clear_cache: h('POST', 'fc-manager/v1/power/settings/clear-cache', 'Error clearing cache'),
  pro_settings_customizer: h('GET', 'fc-manager/v1/power/settings/customizer', 'Error with customizer'),
  pro_settings_menus: h('GET', 'fc-manager/v1/power/settings/menus', 'Error listing menus'),
  pro_settings_widgets: h('GET', 'fc-manager/v1/power/settings/widgets', 'Error listing widgets'),
  pro_theme_list: h('GET', 'fc-manager/v1/power/themes/list', 'Error listing themes'),
  pro_theme_activate: h('POST', 'fc-manager/v1/power/themes/activate', 'Error activating theme'),
  pro_theme_install: h('POST', 'fc-manager/v1/power/themes/install', 'Error installing theme'),
  pro_theme_delete: h('POST', 'fc-manager/v1/power/themes/delete', 'Error deleting theme'),
  pro_theme_search: h('GET', 'fc-manager/v1/power/themes/search', 'Error searching themes'),
  pro_theme_update: h('POST', 'fc-manager/v1/power/themes/update', 'Error updating theme'),
  pro_system_cron_jobs: h('GET', 'fc-manager/v1/power/system/cron-jobs', 'Error listing cron jobs'),
  pro_system_run_cron: h('POST', 'fc-manager/v1/power/system/run-cron', 'Error running cron'),
  pro_system_transients: h('GET', 'fc-manager/v1/power/system/transients', 'Error listing transients'),
  pro_system_security_scan: h('POST', 'fc-manager/v1/power/system/security-scan', 'Error running scan'),
  pro_system_performance: h('GET', 'fc-manager/v1/power/system/performance', 'Error getting performance'),
  pro_config_wp_config: h('GET', 'fc-manager/v1/power/config/wp-config', 'Error reading wp-config'),
  pro_config_htaccess: h('GET', 'fc-manager/v1/power/config/htaccess', 'Error with htaccess'),
  pro_woo_list_products: h('GET', 'fc-manager/v1/power/woo/products', 'Error listing products'),
  pro_woo_create_product: h('POST', 'fc-manager/v1/power/woo/products', 'Error creating product'),
  pro_woo_list_orders: h('GET', 'fc-manager/v1/power/woo/orders', 'Error listing orders'),
  pro_woo_create_order: h('POST', 'fc-manager/v1/power/woo/orders', 'Error creating order'),
  pro_woo_list_customers: h('GET', 'fc-manager/v1/power/woo/customers', 'Error listing customers'),
  pro_woo_create_customer: h('POST', 'fc-manager/v1/power/woo/customers', 'Error creating customer'),
  pro_woo_inventory_stock: h('POST', 'fc-manager/v1/power/woo/inventory/stock', 'Error updating stock'),
  pro_woo_low_stock: h('GET', 'fc-manager/v1/power/woo/inventory/low-stock', 'Error getting low stock'),
  pro_woo_categories: h('GET', 'fc-manager/v1/power/woo/categories', 'Error listing categories'),
  pro_woo_reports_sales: h('GET', 'fc-manager/v1/power/woo/reports/sales', 'Error getting sales'),
  pro_woo_reports_top_products: h('GET', 'fc-manager/v1/power/woo/reports/top-products', 'Error getting top products'),
  pro_woo_reports_customers: h('GET', 'fc-manager/v1/power/woo/reports/customers', 'Error getting customer report'),
  pro_wpcli_execute: h('POST', 'fc-manager/v1/power/wpcli/execute', 'Error executing WP-CLI'),
  pro_wpcli_available: h('GET', 'fc-manager/v1/power/wpcli/available', 'Error checking WP-CLI'),
  pro_woo_get_product: hId('GET', 'fc-manager/v1/power/woo/products', 'id', 'Error getting product'),
  pro_woo_update_product: hId('PUT', 'fc-manager/v1/power/woo/products', 'id', 'Error updating product'),
  pro_woo_delete_product: hId('DELETE', 'fc-manager/v1/power/woo/products', 'id', 'Error deleting product'),
  pro_woo_get_order: hId('GET', 'fc-manager/v1/power/woo/orders', 'id', 'Error getting order'),
  pro_woo_update_order: hId('PUT', 'fc-manager/v1/power/woo/orders', 'id', 'Error updating order'),
  pro_woo_delete_order: hId('DELETE', 'fc-manager/v1/power/woo/orders', 'id', 'Error deleting order'),
  pro_woo_update_order_status: async (args: any) => {
    try {
      const r = await makeWordPressRequest('POST' as any, `fc-manager/v1/power/woo/orders/${args.id}/status`, args);
      return { toolResult: { content: [{ type: 'text' as const, text: JSON.stringify(r, null, 2) }] } };
    } catch (e: any) {
      return { toolResult: { isError: true, content: [{ type: 'text' as const, text: 'Error updating status: ' + e.message }] } };
    }
  },
  pro_woo_get_customer: hId('GET', 'fc-manager/v1/power/woo/customers', 'id', 'Error getting customer'),
  pro_woo_update_customer: hId('PUT', 'fc-manager/v1/power/woo/customers', 'id', 'Error updating customer'),
  pro_woo_delete_customer: hId('DELETE', 'fc-manager/v1/power/woo/customers', 'id', 'Error deleting customer'),
};

// Verification: 64 tools, 64 handlers
