import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { makeWordPressRequest } from '../wordpress.js';

/**
 * FluentCRM Tools - Email Marketing & CRM
 * Uses FluentCRM's native REST API at /fluent-crm/v2/
 * Documentation: https://fluentcrm.com/docs/rest-api/
 */

// ==================== ZOD SCHEMA DEFINITIONS ====================

// Contact schemas
const listContactsSchema = z.object({
  page: z.number().optional(),
  per_page: z.number().optional(),
  search: z.string().optional(),
  status: z.enum(['subscribed', 'unsubscribed', 'bounced', 'complained']).optional(),
  tags: z.array(z.number()).optional(),
  lists: z.array(z.number()).optional(),
});

const createContactSchema = z.object({
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  status: z.enum(['subscribed', 'unsubscribed', 'pending']).optional(),
  tags: z.array(z.number()).optional(),
  lists: z.array(z.number()).optional(),
  custom_fields: z.record(z.any()).optional(),
});

// List schemas
const listListsSchema = z.object({
  page: z.number().optional(),
  per_page: z.number().optional(),
  search: z.string().optional(),
});

const createListSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  description: z.string().optional(),
});

// Tag schemas
const listTagsSchema = z.object({
  page: z.number().optional(),
  per_page: z.number().optional(),
  search: z.string().optional(),
});

const createTagSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  description: z.string().optional(),
});

// Campaign schemas
const listCampaignsSchema = z.object({
  page: z.number().optional(),
  per_page: z.number().optional(),
  status: z.enum(['draft', 'scheduled', 'sent', 'archived']).optional(),
});

const createCampaignSchema = z.object({
  title: z.string(),
  subject: z.string(),
  email_body: z.string(),
  status: z.enum(['draft', 'scheduled']).optional(),
  scheduled_at: z.string().optional(),
});

// ==================== TOOL DEFINITIONS ====================

export const fluentCRMTools: Tool[] = [
  // Contact Management
  {
    name: 'fcrm_list_contacts',
    description: 'List FluentCRM contacts with filtering and pagination',
    inputSchema: { type: 'object' as const, properties: listContactsSchema.shape }
  },
  {
    name: 'fcrm_get_contact',
    description: 'Get a specific FluentCRM contact by ID',
    inputSchema: { type: 'object' as const, properties: z.object({ id: z.number() }).shape }
  },
  {
    name: 'fcrm_create_contact',
    description: 'Create a new FluentCRM contact',
    inputSchema: { type: 'object' as const, properties: createContactSchema.shape }
  },
  {
    name: 'fcrm_update_contact',
    description: 'Update an existing FluentCRM contact',
    inputSchema: { type: 'object' as const, properties: z.object({
      id: z.number(),
      email: z.string().email().optional(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      status: z.enum(['subscribed', 'unsubscribed', 'pending']).optional(),
    }).shape }
  },
  {
    name: 'fcrm_delete_contact',
    description: 'Delete a FluentCRM contact',
    inputSchema: { type: 'object' as const, properties: z.object({ id: z.number() }).shape }
  },
  
  // List Management
  {
    name: 'fcrm_list_lists',
    description: 'List all FluentCRM contact lists',
    inputSchema: { type: 'object' as const, properties: listListsSchema.shape }
  },
  {
    name: 'fcrm_get_list',
    description: 'Get a specific FluentCRM list by ID',
    inputSchema: { type: 'object' as const, properties: z.object({ id: z.number() }).shape }
  },
  {
    name: 'fcrm_create_list',
    description: 'Create a new FluentCRM list',
    inputSchema: { type: 'object' as const, properties: createListSchema.shape }
  },
  {
    name: 'fcrm_update_list',
    description: 'Update a FluentCRM list',
    inputSchema: { type: 'object' as const, properties: z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
    }).shape }
  },
  {
    name: 'fcrm_delete_list',
    description: 'Delete a FluentCRM list',
    inputSchema: { type: 'object' as const, properties: z.object({ id: z.number() }).shape }
  },
  
  // Tag Management
  {
    name: 'fcrm_list_tags',
    description: 'List all FluentCRM tags',
    inputSchema: { type: 'object' as const, properties: listTagsSchema.shape }
  },
  {
    name: 'fcrm_get_tag',
    description: 'Get a specific FluentCRM tag by ID',
    inputSchema: { type: 'object' as const, properties: z.object({ id: z.number() }).shape }
  },
  {
    name: 'fcrm_create_tag',
    description: 'Create a new FluentCRM tag',
    inputSchema: { type: 'object' as const, properties: createTagSchema.shape }
  },
  {
    name: 'fcrm_update_tag',
    description: 'Update a FluentCRM tag',
    inputSchema: { type: 'object' as const, properties: z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
    }).shape }
  },
  {
    name: 'fcrm_delete_tag',
    description: 'Delete a FluentCRM tag',
    inputSchema: { type: 'object' as const, properties: z.object({ id: z.number() }).shape }
  },
  
  // Campaign Management
  {
    name: 'fcrm_list_campaigns',
    description: 'List all FluentCRM email campaigns',
    inputSchema: { type: 'object' as const, properties: listCampaignsSchema.shape }
  },
  {
    name: 'fcrm_get_campaign',
    description: 'Get a specific FluentCRM campaign by ID',
    inputSchema: { type: 'object' as const, properties: z.object({ id: z.number() }).shape }
  },
  {
    name: 'fcrm_create_campaign',
    description: 'Create a new FluentCRM email campaign',
    inputSchema: { type: 'object' as const, properties: createCampaignSchema.shape }
  },
  {
    name: 'fcrm_send_campaign',
    description: 'Send a FluentCRM campaign',
    inputSchema: { type: 'object' as const, properties: z.object({
      id: z.number(),
      scheduled_at: z.string().optional(),
    }).shape }
  },
];

// ==================== TOOL HANDLERS ====================

export const fluentCRMHandlers: Record<string, (args: any) => Promise<any>> = {
  // Contact handlers
  fcrm_list_contacts: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.page) params.append('page', args.page);
      if (args.per_page) params.append('per_page', args.per_page);
      if (args.search) params.append('search', args.search);
      if (args.status) params.append('status', args.status);
      
      const response = await makeWordPressRequest('GET', `fluent-crm/v2/contacts?${params}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_get_contact: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fluent-crm/v2/contacts/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_create_contact: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fluent-crm/v2/contacts', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_update_contact: async (args: any) => {
    try {
      const { id, ...data } = args;
      const response = await makeWordPressRequest('PUT', `fluent-crm/v2/contacts/${id}`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_delete_contact: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fluent-crm/v2/contacts/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // List handlers
  fcrm_list_lists: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.page) params.append('page', args.page);
      if (args.per_page) params.append('per_page', args.per_page);
      if (args.search) params.append('search', args.search);
      
      const response = await makeWordPressRequest('GET', `fluent-crm/v2/lists?${params}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_get_list: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fluent-crm/v2/lists/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_create_list: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fluent-crm/v2/lists', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_update_list: async (args: any) => {
    try {
      const { id, ...data } = args;
      const response = await makeWordPressRequest('PUT', `fluent-crm/v2/lists/${id}`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_delete_list: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fluent-crm/v2/lists/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Tag handlers
  fcrm_list_tags: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.page) params.append('page', args.page);
      if (args.per_page) params.append('per_page', args.per_page);
      if (args.search) params.append('search', args.search);
      
      const response = await makeWordPressRequest('GET', `fluent-crm/v2/tags?${params}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_get_tag: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fluent-crm/v2/tags/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_create_tag: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fluent-crm/v2/tags', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_update_tag: async (args: any) => {
    try {
      const { id, ...data } = args;
      const response = await makeWordPressRequest('PUT', `fluent-crm/v2/tags/${id}`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_delete_tag: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fluent-crm/v2/tags/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Campaign handlers
  fcrm_list_campaigns: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.page) params.append('page', args.page);
      if (args.per_page) params.append('per_page', args.per_page);
      if (args.status) params.append('status', args.status);
      
      const response = await makeWordPressRequest('GET', `fluent-crm/v2/campaigns?${params}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_get_campaign: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fluent-crm/v2/campaigns/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_create_campaign: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fluent-crm/v2/campaigns', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_send_campaign: async (args: any) => {
    try {
      const { id, ...data } = args;
      const response = await makeWordPressRequest('POST', `fluent-crm/v2/campaigns/${id}/send`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },
};
