import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { makeWordPressRequest } from '../wordpress.js';

// ==================== ZOD SCHEMA DEFINITIONS ====================

const getLicensingLineChartSchema = z.object({
  date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
  date_to: z.string().optional().describe('End date (YYYY-MM-DD)')
});

const getLicensingPieChartSchema = z.object({
  // No parameters - returns license distribution
});

const getLicensingSummarySchema = z.object({
  // No parameters - returns licensing summary stats
});

// ==================== TOOL DEFINITIONS ====================

export const fluentCartLicensingTools: Tool[] = [
  {
    name: 'fcart_get_licensing_line_chart',
    description: 'Get FluentCart licensing line chart data showing license activations over time',
    inputSchema: { type: 'object', properties: getLicensingLineChartSchema.shape }
  },
  {
    name: 'fcart_get_licensing_pie_chart',
    description: 'Get FluentCart licensing pie chart data showing license distribution by status',
    inputSchema: { type: 'object', properties: getLicensingPieChartSchema.shape }
  },
  {
    name: 'fcart_get_licensing_summary',
    description: 'Get FluentCart licensing summary with total licenses, active, expired, and revenue',
    inputSchema: { type: 'object', properties: getLicensingSummarySchema.shape }
  }
];

// ==================== TOOL HANDLERS ====================

export const fluentCartLicensingHandlers: Record<string, (args: any) => Promise<any>> = {
  fcart_get_licensing_line_chart: async (args: any) => {
    try {
      const params: any = {};
      if (args.date_from) params.date_from = args.date_from;
      if (args.date_to) params.date_to = args.date_to;
      
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/fluentcart/licensing/line-chart', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_get_licensing_pie_chart: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/fluentcart/licensing/pie-chart');
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcart_get_licensing_summary: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/fluentcart/licensing/summary');
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  }
};








