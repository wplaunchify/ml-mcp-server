import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { makeWordPressRequest } from '../wordpress.js';

// FluentMCP Pro Tools - Advanced WordPress Management for Power Users
// Requires: fluent-mcp-pro.php WordPress plugin
// 63 tools across 10 categories

// ============================================================================
// SCHEMA DEFINITIONS (Define schemas FIRST, then use .shape)
// ============================================================================

// File System Schemas
const fsReadSchema = z.object({
  path: z.string().describe('File path relative to WordPress root or absolute path within allowed directories'),
  encoding: z.enum(['utf8', 'base64']).optional().describe('File encoding (default: utf8)'),
});

const fsWriteSchema = z.object({
  path: z.string().describe('File path relative to WordPress root or absolute path within allowed directories'),
  content: z.string().describe('File content to write'),
  encoding: z.enum(['utf8', 'base64']).optional().describe('File encoding (default: utf8)'),
});

const fsListSchema = z.object({
  path: z.string().describe('Directory path relative to WordPress root or absolute path within allowed directories'),
  recursive: z.boolean().optional().describe('List subdirectories recursively (default: false)'),
});

const fsDeleteSchema = z.object({
  path: z.string().describe('File path relative to WordPress root or absolute path within allowed directories'),
});

const fsMkdirSchema = z.object({
  path: z.string().describe('Directory path relative to WordPress root or absolute path within allowed directories'),
  recursive: z.boolean().optional().describe('Create parent directories if needed (default: true)'),
});

const fsMoveSchema = z.object({
  source: z.string().describe('Source file path'),
  destination: z.string().describe('Destination file path'),
});

const fsInfoSchema = z.object({
  path: z.string().describe('File path relative to WordPress root or absolute path within allowed directories'),
});

// Database Schemas
const dbQuerySchema = z.object({
  query: z.string().describe('SQL query to execute'),
  type: z.enum(['SELECT', 'INSERT', 'UPDATE', 'DELETE']).optional().describe('Query type (default: SELECT)'),
});

const dbBackupSchema = z.object({
  tables: z.array(z.string()).optional().describe('Specific tables to backup (default: all tables)'),
});

const dbRestoreSchema = z.object({
  file: z.string().describe('Path to SQL backup file to restore'),
});

const dbTableListSchema = z.object({
  prefix: z.string().optional().describe('Filter tables by prefix (default: wp_)'),
});

const dbTableInfoSchema = z.object({
  table: z.string().describe('Table name to get information about'),
});

const dbOptimizeSchema = z.object({
  tables: z.array(z.string()).optional().describe('Specific tables to optimize (default: all tables)'),
});

const dbRepairSchema = z.object({
  tables: z.array(z.string()).optional().describe('Specific tables to repair (default: all tables)'),
});

const dbExportSchema = z.object({
  table: z.string().describe('Table name to export'),
  format: z.enum(['csv', 'json']).optional().describe('Export format (default: csv)'),
});

// WordPress Settings Schemas
const wpGetOptionSchema = z.object({
  option: z.string().describe('Option name to retrieve'),
});

const wpSetOptionSchema = z.object({
  option: z.string().describe('Option name to set'),
  value: z.any().describe('Option value to set'),
});

const wpDeleteOptionSchema = z.object({
  option: z.string().describe('Option name to delete'),
});

const wpListOptionsSchema = z.object({
  search: z.string().optional().describe('Search term to filter options'),
  limit: z.number().optional().describe('Number of options to return (default: 100)'),
});

const wpGetConstantsSchema = z.object({
  search: z.string().optional().describe('Search term to filter constants'),
});

const wpGetEnvSchema = z.object({
  key: z.string().optional().describe('Specific environment variable to get (default: all)'),
});

const wpSiteInfoSchema = z.object({
  include_server: z.boolean().optional().describe('Include server information (default: false)'),
});

const wpGetPermalinksSchema = z.object({});

const wpSetPermalinksSchema = z.object({
  structure: z.string().describe('Permalink structure (e.g., /%postname%/)'),
});

const wpGetTimezoneSchema = z.object({});

const wpSetTimezoneSchema = z.object({
  timezone: z.string().describe('Timezone string (e.g., America/New_York)'),
});

const wpFlushCacheSchema = z.object({
  type: z.enum(['all', 'object', 'transient']).optional().describe('Cache type to flush (default: all)'),
});

// Theme Management Schemas
const themeListSchema = z.object({});

const themeActivateSchema = z.object({
  theme: z.string().describe('Theme slug to activate'),
});

const themeDeleteSchema = z.object({
  theme: z.string().describe('Theme slug to delete'),
});

// System Utilities Schemas
const systemInfoSchema = z.object({});

const systemHealthSchema = z.object({});

const systemLogsSchema = z.object({
  lines: z.number().optional().describe('Number of log lines to return (default: 100)'),
  type: z.enum(['error', 'debug', 'all']).optional().describe('Log type to retrieve (default: error)'),
});

const systemCronSchema = z.object({});

const systemCronRunSchema = z.object({
  hook: z.string().describe('Cron hook name to execute'),
});

// WooCommerce Schemas
const wcProductListSchema = z.object({
  per_page: z.number().optional().describe('Products per page (default: 10)'),
  page: z.number().optional().describe('Page number (default: 1)'),
  search: z.string().optional().describe('Search term'),
  status: z.enum(['publish', 'draft', 'pending']).optional().describe('Product status'),
});

const wcProductGetSchema = z.object({
  id: z.number().describe('Product ID'),
});

const wcProductCreateSchema = z.object({
  name: z.string().describe('Product name'),
  type: z.enum(['simple', 'variable', 'grouped', 'external']).optional().describe('Product type (default: simple)'),
  regular_price: z.string().optional().describe('Regular price'),
  description: z.string().optional().describe('Product description'),
  short_description: z.string().optional().describe('Short description'),
  categories: z.array(z.object({ id: z.number() })).optional().describe('Product categories'),
  images: z.array(z.object({ src: z.string() })).optional().describe('Product images'),
});

const wcProductUpdateSchema = z.object({
  id: z.number().describe('Product ID'),
  name: z.string().optional().describe('Product name'),
  regular_price: z.string().optional().describe('Regular price'),
  description: z.string().optional().describe('Product description'),
  short_description: z.string().optional().describe('Short description'),
  stock_quantity: z.number().optional().describe('Stock quantity'),
});

const wcProductDeleteSchema = z.object({
  id: z.number().describe('Product ID'),
  force: z.boolean().optional().describe('Force delete (default: false)'),
});

const wcOrderListSchema = z.object({
  per_page: z.number().optional().describe('Orders per page (default: 10)'),
  page: z.number().optional().describe('Page number (default: 1)'),
  status: z.string().optional().describe('Order status'),
});

const wcOrderGetSchema = z.object({
  id: z.number().describe('Order ID'),
});

const wcOrderUpdateSchema = z.object({
  id: z.number().describe('Order ID'),
  status: z.string().optional().describe('Order status'),
  customer_note: z.string().optional().describe('Customer note'),
});

const wcCustomerListSchema = z.object({
  per_page: z.number().optional().describe('Customers per page (default: 10)'),
  page: z.number().optional().describe('Page number (default: 1)'),
  search: z.string().optional().describe('Search term'),
});

const wcCustomerGetSchema = z.object({
  id: z.number().describe('Customer ID'),
});

const wcReportsSchema = z.object({
  period: z.enum(['week', 'month', 'year']).optional().describe('Report period (default: week)'),
});

const wcCouponListSchema = z.object({
  per_page: z.number().optional().describe('Coupons per page (default: 10)'),
  page: z.number().optional().describe('Page number (default: 1)'),
});

const wcCouponCreateSchema = z.object({
  code: z.string().describe('Coupon code'),
  discount_type: z.enum(['percent', 'fixed_cart', 'fixed_product']).describe('Discount type'),
  amount: z.string().describe('Discount amount'),
  description: z.string().optional().describe('Coupon description'),
  expiry_date: z.string().optional().describe('Expiry date (YYYY-MM-DD)'),
});

// WP-CLI Schemas
const wpCliExecuteSchema = z.object({
  command: z.string().describe('WP-CLI command to execute (without "wp" prefix)'),
  args: z.array(z.string()).optional().describe('Command arguments'),
});

const wpCliAvailableSchema = z.object({});

// ============================================================================
// TOOL DEFINITIONS (Use .shape from schemas defined above)
// ============================================================================

export const fluentMcpProTools: Tool[] = [
  // File System Tools
  {
    name: 'pro_fs_read',
    description: 'Read file contents from WordPress file system (restricted to WordPress root and uploads directory, 2MB limit)',
    inputSchema: { type: 'object', properties: fsReadSchema.shape }
  },
  {
    name: 'pro_fs_write',
    description: 'Write or create file in WordPress file system (restricted to WordPress root and uploads directory)',
    inputSchema: { type: 'object', properties: fsWriteSchema.shape }
  },
  {
    name: 'pro_fs_list',
    description: 'List directory contents in WordPress file system (restricted to WordPress root and uploads directory)',
    inputSchema: { type: 'object', properties: fsListSchema.shape }
  },
  {
    name: 'pro_fs_delete',
    description: 'Delete file from WordPress file system (restricted to WordPress root and uploads directory)',
    inputSchema: { type: 'object', properties: fsDeleteSchema.shape }
  },
  {
    name: 'pro_fs_mkdir',
    description: 'Create directory in WordPress file system (restricted to WordPress root and uploads directory)',
    inputSchema: { type: 'object', properties: fsMkdirSchema.shape }
  },
  {
    name: 'pro_fs_move',
    description: 'Move or rename file in WordPress file system (restricted to WordPress root and uploads directory)',
    inputSchema: { type: 'object', properties: fsMoveSchema.shape }
  },
  {
    name: 'pro_fs_info',
    description: 'Get file information (size, modified date, permissions)',
    inputSchema: { type: 'object', properties: fsInfoSchema.shape }
  },

  // Database Tools
  {
    name: 'pro_db_query',
    description: 'Execute direct SQL query on WordPress database (use with caution, requires manage_options capability)',
    inputSchema: { type: 'object', properties: dbQuerySchema.shape }
  },
  {
    name: 'pro_db_backup',
    description: 'Create database backup (exports to SQL file in uploads directory)',
    inputSchema: { type: 'object', properties: dbBackupSchema.shape }
  },
  {
    name: 'pro_db_restore',
    description: 'Restore database from backup file',
    inputSchema: { type: 'object', properties: dbRestoreSchema.shape }
  },
  {
    name: 'pro_db_table_list',
    description: 'List all database tables',
    inputSchema: { type: 'object', properties: dbTableListSchema.shape }
  },
  {
    name: 'pro_db_table_info',
    description: 'Get information about a specific database table',
    inputSchema: { type: 'object', properties: dbTableInfoSchema.shape }
  },
  {
    name: 'pro_db_optimize',
    description: 'Optimize database tables',
    inputSchema: { type: 'object', properties: dbOptimizeSchema.shape }
  },
  {
    name: 'pro_db_repair',
    description: 'Repair database tables',
    inputSchema: { type: 'object', properties: dbRepairSchema.shape }
  },
  {
    name: 'pro_db_export',
    description: 'Export database table to CSV or JSON',
    inputSchema: { type: 'object', properties: dbExportSchema.shape }
  },

  // WordPress Settings Tools
  {
    name: 'pro_wp_get_option',
    description: 'Get WordPress option value',
    inputSchema: { type: 'object', properties: wpGetOptionSchema.shape }
  },
  {
    name: 'pro_wp_set_option',
    description: 'Set WordPress option value',
    inputSchema: { type: 'object', properties: wpSetOptionSchema.shape }
  },
  {
    name: 'pro_wp_delete_option',
    description: 'Delete WordPress option',
    inputSchema: { type: 'object', properties: wpDeleteOptionSchema.shape }
  },
  {
    name: 'pro_wp_list_options',
    description: 'List WordPress options',
    inputSchema: { type: 'object', properties: wpListOptionsSchema.shape }
  },
  {
    name: 'pro_wp_get_constants',
    description: 'Get WordPress constants',
    inputSchema: { type: 'object', properties: wpGetConstantsSchema.shape }
  },
  {
    name: 'pro_wp_get_env',
    description: 'Get environment variables',
    inputSchema: { type: 'object', properties: wpGetEnvSchema.shape }
  },
  {
    name: 'pro_wp_site_info',
    description: 'Get comprehensive WordPress site information',
    inputSchema: { type: 'object', properties: wpSiteInfoSchema.shape }
  },
  {
    name: 'pro_wp_get_permalinks',
    description: 'Get permalink structure',
    inputSchema: { type: 'object', properties: wpGetPermalinksSchema.shape }
  },
  {
    name: 'pro_wp_set_permalinks',
    description: 'Set permalink structure',
    inputSchema: { type: 'object', properties: wpSetPermalinksSchema.shape }
  },
  {
    name: 'pro_wp_get_timezone',
    description: 'Get WordPress timezone',
    inputSchema: { type: 'object', properties: wpGetTimezoneSchema.shape }
  },
  {
    name: 'pro_wp_set_timezone',
    description: 'Set WordPress timezone',
    inputSchema: { type: 'object', properties: wpSetTimezoneSchema.shape }
  },
  {
    name: 'pro_wp_flush_cache',
    description: 'Flush WordPress cache',
    inputSchema: { type: 'object', properties: wpFlushCacheSchema.shape }
  },

  // Theme Management Tools
  {
    name: 'pro_theme_list',
    description: 'List all installed themes',
    inputSchema: { type: 'object', properties: themeListSchema.shape }
  },
  {
    name: 'pro_theme_activate',
    description: 'Activate a theme',
    inputSchema: { type: 'object', properties: themeActivateSchema.shape }
  },
  {
    name: 'pro_theme_delete',
    description: 'Delete a theme',
    inputSchema: { type: 'object', properties: themeDeleteSchema.shape }
  },

  // System Utilities Tools
  {
    name: 'pro_system_info',
    description: 'Get system information (PHP, MySQL, server details)',
    inputSchema: { type: 'object', properties: systemInfoSchema.shape }
  },
  {
    name: 'pro_system_health',
    description: 'Get WordPress site health status',
    inputSchema: { type: 'object', properties: systemHealthSchema.shape }
  },
  {
    name: 'pro_system_logs',
    description: 'Get WordPress error logs',
    inputSchema: { type: 'object', properties: systemLogsSchema.shape }
  },
  {
    name: 'pro_system_cron',
    description: 'List scheduled cron jobs',
    inputSchema: { type: 'object', properties: systemCronSchema.shape }
  },
  {
    name: 'pro_system_cron_run',
    description: 'Execute a cron job immediately',
    inputSchema: { type: 'object', properties: systemCronRunSchema.shape }
  },

  // WooCommerce Tools
  {
    name: 'pro_wc_product_list',
    description: 'List WooCommerce products',
    inputSchema: { type: 'object', properties: wcProductListSchema.shape }
  },
  {
    name: 'pro_wc_product_get',
    description: 'Get WooCommerce product by ID',
    inputSchema: { type: 'object', properties: wcProductGetSchema.shape }
  },
  {
    name: 'pro_wc_product_create',
    description: 'Create WooCommerce product',
    inputSchema: { type: 'object', properties: wcProductCreateSchema.shape }
  },
  {
    name: 'pro_wc_product_update',
    description: 'Update WooCommerce product',
    inputSchema: { type: 'object', properties: wcProductUpdateSchema.shape }
  },
  {
    name: 'pro_wc_product_delete',
    description: 'Delete WooCommerce product',
    inputSchema: { type: 'object', properties: wcProductDeleteSchema.shape }
  },
  {
    name: 'pro_wc_order_list',
    description: 'List WooCommerce orders',
    inputSchema: { type: 'object', properties: wcOrderListSchema.shape }
  },
  {
    name: 'pro_wc_order_get',
    description: 'Get WooCommerce order by ID',
    inputSchema: { type: 'object', properties: wcOrderGetSchema.shape }
  },
  {
    name: 'pro_wc_order_update',
    description: 'Update WooCommerce order',
    inputSchema: { type: 'object', properties: wcOrderUpdateSchema.shape }
  },
  {
    name: 'pro_wc_customer_list',
    description: 'List WooCommerce customers',
    inputSchema: { type: 'object', properties: wcCustomerListSchema.shape }
  },
  {
    name: 'pro_wc_customer_get',
    description: 'Get WooCommerce customer by ID',
    inputSchema: { type: 'object', properties: wcCustomerGetSchema.shape }
  },
  {
    name: 'pro_wc_reports',
    description: 'Get WooCommerce sales reports',
    inputSchema: { type: 'object', properties: wcReportsSchema.shape }
  },
  {
    name: 'pro_wc_coupon_list',
    description: 'List WooCommerce coupons',
    inputSchema: { type: 'object', properties: wcCouponListSchema.shape }
  },
  {
    name: 'pro_wc_coupon_create',
    description: 'Create WooCommerce coupon',
    inputSchema: { type: 'object', properties: wcCouponCreateSchema.shape }
  },

  // WP-CLI Tools
  {
    name: 'pro_wp_cli_execute',
    description: 'Execute WP-CLI command',
    inputSchema: { type: 'object', properties: wpCliExecuteSchema.shape }
  },
  {
    name: 'pro_wp_cli_available',
    description: 'Check if WP-CLI is available',
    inputSchema: { type: 'object', properties: wpCliAvailableSchema.shape }
  },
];

// ============================================================================
// HANDLERS
// ============================================================================

export const fluentMcpProHandlers = {
  // File System Handlers
  pro_fs_read: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/fs/read', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error reading file: ${error.message}`
          }]
        }
      };
    }
  },

  pro_fs_write: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/fs/write', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error writing file: ${error.message}`
          }]
        }
      };
    }
  },

  pro_fs_list: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/fs/list', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error listing directory: ${error.message}`
          }]
        }
      };
    }
  },

  pro_fs_delete: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/fs/delete', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error deleting file: ${error.message}`
          }]
        }
      };
    }
  },

  pro_fs_mkdir: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/fs/mkdir', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error creating directory: ${error.message}`
          }]
        }
      };
    }
  },

  pro_fs_move: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/fs/move', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error moving file: ${error.message}`
          }]
        }
      };
    }
  },

  pro_fs_info: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/fs/info', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error getting file info: ${error.message}`
          }]
        }
      };
    }
  },

  // Database Handlers
  pro_db_query: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/db/query', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error executing query: ${error.message}`
          }]
        }
      };
    }
  },

  pro_db_backup: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/db/backup', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error creating backup: ${error.message}`
          }]
        }
      };
    }
  },

  pro_db_restore: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/db/restore', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error restoring backup: ${error.message}`
          }]
        }
      };
    }
  },

  pro_db_table_list: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/power/db/tables', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error listing tables: ${error.message}`
          }]
        }
      };
    }
  },

  pro_db_table_info: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/power/db/tables/${args.table}`, args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error getting table info: ${error.message}`
          }]
        }
      };
    }
  },

  pro_db_optimize: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/db/optimize', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error optimizing tables: ${error.message}`
          }]
        }
      };
    }
  },

  pro_db_repair: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/db/repair', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error repairing tables: ${error.message}`
          }]
        }
      };
    }
  },

  pro_db_export: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/db/export', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error exporting table: ${error.message}`
          }]
        }
      };
    }
  },

  // WordPress Settings Handlers
  pro_wp_get_option: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/power/wp/options/${args.option}`);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error getting option: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wp_set_option: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/wp/options', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error setting option: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wp_delete_option: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/power/wp/options/${args.option}`);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error deleting option: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wp_list_options: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/power/wp/options', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error listing options: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wp_get_constants: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/power/wp/constants', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error getting constants: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wp_get_env: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/power/wp/env', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error getting environment: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wp_site_info: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/power/wp/site-info', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error getting site info: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wp_get_permalinks: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/power/wp/permalinks');
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error getting permalinks: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wp_set_permalinks: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/wp/permalinks', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error setting permalinks: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wp_get_timezone: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/power/wp/timezone');
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error getting timezone: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wp_set_timezone: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/wp/timezone', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error setting timezone: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wp_flush_cache: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/wp/flush-cache', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error flushing cache: ${error.message}`
          }]
        }
      };
    }
  },

  // Theme Management Handlers
  pro_theme_list: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/power/themes');
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error listing themes: ${error.message}`
          }]
        }
      };
    }
  },

  pro_theme_activate: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/themes/activate', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error activating theme: ${error.message}`
          }]
        }
      };
    }
  },

  pro_theme_delete: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/power/themes/${args.theme}`);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error deleting theme: ${error.message}`
          }]
        }
      };
    }
  },

  // System Utilities Handlers
  pro_system_info: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/power/system/info');
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error getting system info: ${error.message}`
          }]
        }
      };
    }
  },

  pro_system_health: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/power/system/health');
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error getting system health: ${error.message}`
          }]
        }
      };
    }
  },

  pro_system_logs: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/power/system/logs', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error getting logs: ${error.message}`
          }]
        }
      };
    }
  },

  pro_system_cron: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/power/system/cron');
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error getting cron jobs: ${error.message}`
          }]
        }
      };
    }
  },

  pro_system_cron_run: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/system/cron/run', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error running cron job: ${error.message}`
          }]
        }
      };
    }
  },

  // WooCommerce Handlers
  pro_wc_product_list: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/power/woo/products', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error listing products: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wc_product_get: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/power/woo/products/${args.id}`);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error getting product: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wc_product_create: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/woo/products', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error creating product: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wc_product_update: async (args: any) => {
    try {
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/power/woo/products/${args.id}`, args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error updating product: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wc_product_delete: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/power/woo/products/${args.id}`, args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error deleting product: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wc_order_list: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/power/woo/orders', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error listing orders: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wc_order_get: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/power/woo/orders/${args.id}`);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error getting order: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wc_order_update: async (args: any) => {
    try {
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/power/woo/orders/${args.id}`, args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error updating order: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wc_customer_list: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/power/woo/customers', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error listing customers: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wc_customer_get: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/power/woo/customers/${args.id}`);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error getting customer: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wc_reports: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/power/woo/reports', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error getting reports: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wc_coupon_list: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/power/woo/coupons', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error listing coupons: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wc_coupon_create: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/woo/coupons', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error creating coupon: ${error.message}`
          }]
        }
      };
    }
  },

  // WP-CLI Handlers
  pro_wp_cli_execute: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/power/wp-cli/execute', args);
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error executing WP-CLI command: ${error.message}`
          }]
        }
      };
    }
  },

  pro_wp_cli_available: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/power/wp-cli/available');
      return {
        toolResult: {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          isError: true,
          content: [{
            type: 'text',
            text: `Error checking WP-CLI availability: ${error.message}`
          }]
        }
      };
    }
  },
};

