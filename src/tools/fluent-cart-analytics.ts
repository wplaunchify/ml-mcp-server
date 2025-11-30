import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { makeWordPressRequest } from '../wordpress.js';

// ==================== ZOD SCHEMA DEFINITIONS ====================

const getReportsOverviewSchema = z.object({
  date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
  date_to: z.string().optional().describe('End date (YYYY-MM-DD)')
});

const getQuickStatsSchema = z.object({
  // No parameters - returns current quick stats
});

const getDashboardStatsSchema = z.object({
  // No parameters - returns dashboard statistics
});

const getAnalyticsSchema = z.object({
  date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
  date_to: z.string().optional().describe('End date (YYYY-MM-DD)'),
  type: z.enum(['revenue', 'orders', 'products', 'customers']).optional().describe('Analytics type')
});

const getSettingsSchema = z.object({
  // No parameters - returns all FluentCart settings
});

const listTaxClassesSchema = z.object({
  per_page: z.number().optional().describe('Number of tax classes per page (default: 100)'),
  page: z.number().optional().describe('Page number (default: 1)')
});

const listShippingZonesSchema = z.object({
  // No parameters - returns all shipping zones
});

// ==================== TOOL DEFINITIONS ====================

export const fluentCartAnalyticsTools: Tool[] = [
  {
    name: 'fcart_get_reports_overview',
    description: 'Get FluentCart reports overview with sales, revenue, and order statistics for a date range',
    inputSchema: { type: 'object', properties: getReportsOverviewSchema.shape }
  },
  {
    name: 'fcart_get_quick_stats',
    description: 'Get FluentCart quick statistics (today\'s sales, pending orders, low stock items, etc.)',
    inputSchema: { type: 'object', properties: getQuickStatsSchema.shape }
  },
  {
    name: 'fcart_get_dashboard_stats',
    description: 'Get FluentCart dashboard statistics and metrics overview',
    inputSchema: { type: 'object', properties: getDashboardStatsSchema.shape }
  },
  {
    name: 'fcart_get_analytics',
    description: 'Get detailed FluentCart analytics (already exists but kept for compatibility)',
    inputSchema: { type: 'object', properties: getAnalyticsSchema.shape }
  },
  {
    name: 'fcart_get_settings',
    description: 'Get FluentCart global settings and configuration',
    inputSchema: { type: 'object', properties: getSettingsSchema.shape }
  },
  {
    name: 'fcart_list_tax_classes',
    description: 'List all FluentCart tax classes',
    inputSchema: { type: 'object', properties: listTaxClassesSchema.shape }
  },
  {
    name: 'fcart_list_shipping_zones',
    description: 'List all FluentCart shipping zones and methods',
    inputSchema: { type: 'object', properties: listShippingZonesSchema.shape }
  }
];

// ==================== TOOL HANDLERS ====================

export const fluentCartAnalyticsHandlers: Record<string, (args: any) => Promise<any>> = {
  fcart_get_reports_overview: async (args: any) => {
    try {
      const params: any = {};
      if (args.date_from) params.date_from = args.date_from;
      if (args.date_to) params.date_to = args.date_to;
      
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/fluentcart/reports/overview', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_get_quick_stats: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/fluentcart/reports/quick-stats');
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_get_dashboard_stats: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/fluentcart/dashboard/stats');
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_get_analytics: async (args: any) => {
    try {
      const params: any = {};
      if (args.date_from) params.date_from = args.date_from;
      if (args.date_to) params.date_to = args.date_to;
      if (args.type) params.type = args.type;
      
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/fluentcart/analytics', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_get_settings: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/fluentcart/settings');
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_list_tax_classes: async (args: any) => {
    try {
      const params: any = {};
      if (args.per_page) params.per_page = args.per_page;
      if (args.page) params.page = args.page;
      
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/fluentcart/tax/classes', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_list_shipping_zones: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/fluentcart/shipping/zones');
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  }
};








