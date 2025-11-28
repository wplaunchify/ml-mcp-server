import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { makeWordPressRequest } from '../wordpress.js';

// ==================== ZOD SCHEMA DEFINITIONS ====================

const cleanupMembersSchema = z.object({
  // No parameters - cleans up orphaned member records
});

const listTermsSchema = z.object({
  taxonomy: z.string().describe('Taxonomy slug (e.g., category, post_tag, or custom taxonomy)'),
  per_page: z.number().optional().describe('Number of terms per page (default: 100)'),
  page: z.number().optional().describe('Page number (default: 1)')
});

// ==================== TOOL DEFINITIONS ====================

export const fluentCommunityAdminTools: Tool[] = [
  {
    name: 'fc_cleanup_members',
    description: 'Cleanup orphaned FluentCommunity member records (maintenance tool)',
    inputSchema: { type: 'object', properties: cleanupMembersSchema.shape }
  },
  {
    name: 'fc_list_terms',
    description: 'List FluentCommunity taxonomy terms (categories, tags, or custom taxonomies)',
    inputSchema: { type: 'object', properties: listTermsSchema.shape }
  }
];

// ==================== TOOL HANDLERS ====================

export const fluentCommunityAdminHandlers: Record<string, (args: any) => Promise<any>> = {
  fc_cleanup_members: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/members/cleanup');
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_list_terms: async (args: any) => {
    try {
      const params: any = {
        taxonomy: args.taxonomy
      };
      if (args.per_page) params.per_page = args.per_page;
      if (args.page) params.page = args.page;
      
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/terms', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  }
};





