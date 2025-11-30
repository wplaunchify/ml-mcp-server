import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { makeWordPressRequest } from '../wordpress.js';

// ==================== ZOD SCHEMA DEFINITIONS ====================

const listFilesSchema = z.object({
  per_page: z.number().optional().describe('Number of files per page (default: 20)'),
  page: z.number().optional().describe('Page number (default: 1)')
});

const getPermissionsSchema = z.object({
  // No parameters - returns current user permissions
});

const listIntegrationAddonsSchema = z.object({
  // No parameters - returns all integration addons
});

const getGlobalSettingsSchema = z.object({
  // No parameters - returns global integration settings
});

const getGlobalFeedsSchema = z.object({
  // No parameters - returns global feeds
});

const listNotificationsSchema = z.object({
  per_page: z.number().optional().describe('Number of notifications per page (default: 20)'),
  page: z.number().optional().describe('Page number (default: 1)')
});

const getNotificationSchema = z.object({
  id: z.number().describe('Notification ID')
});

const listCategoriesSchema = z.object({
  per_page: z.number().optional().describe('Number of categories per page (default: 100)'),
  page: z.number().optional().describe('Page number (default: 1)')
});

const getCategorySchema = z.object({
  id: z.number().describe('Category ID')
});

// ==================== TOOL DEFINITIONS ====================

export const fluentCartAdminTools: Tool[] = [
  {
    name: 'fcart_list_files',
    description: 'List FluentCart digital product files',
    inputSchema: { type: 'object', properties: listFilesSchema.shape }
  },
  {
    name: 'fcart_get_permissions',
    description: 'Get current user FluentCart permissions and capabilities',
    inputSchema: { type: 'object', properties: getPermissionsSchema.shape }
  },
  {
    name: 'fcart_list_integration_addons',
    description: 'List available FluentCart integration addons',
    inputSchema: { type: 'object', properties: listIntegrationAddonsSchema.shape }
  },
  {
    name: 'fcart_get_global_settings',
    description: 'Get FluentCart global integration settings',
    inputSchema: { type: 'object', properties: getGlobalSettingsSchema.shape }
  },
  {
    name: 'fcart_get_global_feeds',
    description: 'Get FluentCart global feeds configuration',
    inputSchema: { type: 'object', properties: getGlobalFeedsSchema.shape }
  },
  {
    name: 'fcart_list_notifications',
    description: 'List FluentCart notifications',
    inputSchema: { type: 'object', properties: listNotificationsSchema.shape }
  },
  {
    name: 'fcart_get_notification',
    description: 'Get a specific FluentCart notification by ID',
    inputSchema: { type: 'object', properties: getNotificationSchema.shape }
  },
  {
    name: 'fcart_list_categories',
    description: 'List FluentCart product categories',
    inputSchema: { type: 'object', properties: listCategoriesSchema.shape }
  },
  {
    name: 'fcart_get_category',
    description: 'Get a specific FluentCart product category by ID',
    inputSchema: { type: 'object', properties: getCategorySchema.shape }
  }
];

// ==================== TOOL HANDLERS ====================

export const fluentCartAdminHandlers: Record<string, (args: any) => Promise<any>> = {
  fcart_list_files: async (args: any) => {
    try {
      const params: any = {};
      if (args.per_page) params.per_page = args.per_page;
      if (args.page) params.page = args.page;
      
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/fluentcart/files', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_get_permissions: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/fluentcart/permissions');
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_list_integration_addons: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/fluentcart/integration/addons');
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_get_global_settings: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/fluentcart/integration/global-settings');
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_get_global_feeds: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/fluentcart/integration/global-feeds');
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_list_notifications: async (args: any) => {
    try {
      const params: any = {};
      if (args.per_page) params.per_page = args.per_page;
      if (args.page) params.page = args.page;
      
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/fluentcart/notifications', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_get_notification: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fluentcart/notifications/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_list_categories: async (args: any) => {
    try {
      const params: any = {};
      if (args.per_page) params.per_page = args.per_page;
      if (args.page) params.page = args.page;
      
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/fcart/categories', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_get_category: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcart/categories/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  }
};








