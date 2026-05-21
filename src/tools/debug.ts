// src/tools/debug.ts
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { makeWordPressRequest } from '../wordpress.js';
import { z } from 'zod';

/**
 * Debug Tools
 * Provides debugging and diagnostic tools for FluentMCP
 */

// Zod Schema Definitions
const debugOptionsSchema = z.object({});
const debugFluentCRMSchema = z.object({});

const siteContextSchema = z.object({});

// Tool Definitions
export const debugTools: Tool[] = [
  {
    name: 'fmcp_get_site_context',
    description: 'Site-wide FluentMCP context: installed products, versions, counts, ENABLED_TOOLS categories, discovery URLs. Call first on a new site.',
    inputSchema: { type: 'object', properties: siteContextSchema.shape }
  },
  {
    name: 'debug_options',
    description: 'Debug endpoint to find FluentCommunity option names and values',
    inputSchema: { type: 'object', properties: debugOptionsSchema.shape }
  },
  {
    name: 'debug_fluentcrm',
    description: 'Debug endpoint to test FluentCRM API connectivity and configuration',
    inputSchema: { type: 'object', properties: debugFluentCRMSchema.shape }
  }
];

// Tool Handlers
export const debugHandlers = {
  fmcp_get_site_context: async () => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/mcp/site-context');
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  debug_options: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/debug/options');
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  debug_fluentcrm: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/debug/fluentcrm');
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  }
};










