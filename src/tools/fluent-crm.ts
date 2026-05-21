import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { makeWordPressRequest } from '../wordpress.js';

/**
 * FluentCRM Tools - Email Marketing & CRM
 * Uses FluentMCP wrapper API at /fc-manager/v1/fcrm/
 * Proxies to FluentCRM's database via WordPress plugin
 */

// ==================== ZOD SCHEMA DEFINITIONS ====================

const fluentCrmContactStatusSchema = z.enum([
  'subscribed',
  'pending',
  'unsubscribed',
  'bounced',
  'complained',
  'transactional',
]);

// Contact schemas
const listContactsSchema = z.object({
  page: z.number().optional(),
  per_page: z.number().optional(),
  search: z.string().optional(),
  status: fluentCrmContactStatusSchema.optional(),
  tags: z.array(z.number()).optional(),
  lists: z.array(z.number()).optional(),
});

const createContactSchema = z.object({
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  status: fluentCrmContactStatusSchema.optional(),
  tags: z.array(z.number()).optional(),
  lists: z.array(z.number()).optional(),
  custom_fields: z.record(z.any()).optional(),
});

const updateContactSchema = z.object({
  id: z.number(),
  email: z.string().email().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  status: fluentCrmContactStatusSchema.optional(),
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

const campaignIdSchema = z.object({ id: z.number() });

const campaignLinksSchema = z.object({
  id: z.number(),
  limit: z.number().int().positive().optional(),
});

const campaignClickersSchema = z.object({
  id: z.number(),
  include_contact: z.boolean().optional(),
});

// Template schemas
const listTemplatesSchema = z.object({
  page: z.number().optional(),
  per_page: z.number().optional(),
  search: z.string().optional(),
});

const createTemplateSchema = z.object({
  post_title: z.string(),
  post_content: z.string(),
  email_subject: z.string().optional(),
  design_template: z.enum(['simple', 'plain', 'classic', 'raw_classic', 'raw_html']).optional(),
});

// Note / Activity schemas
const noteTypeSchema = z.enum(['note', 'call', 'email', 'meeting', 'activity']);

const listNotesSchema = z.object({
  id: z.number(),
  per_page: z.number().optional(),
  page: z.number().optional(),
  type: noteTypeSchema.optional(),
});

const createNoteSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  description: z.string().optional(),
  type: noteTypeSchema.optional(),
});

const updateNoteSchema = z.object({
  id: z.number(),
  note_id: z.number(),
  title: z.string().optional(),
  description: z.string().optional(),
  type: noteTypeSchema.optional(),
});

const deleteNoteSchema = z.object({
  id: z.number(),
  note_id: z.number(),
});

const dryRunSchema = z.object({ dry_run: z.boolean().optional() });

const upsertContactSchema = createContactSchema.extend({
  id: z.number().optional(),
  force_update: z.boolean().optional(),
  detach_tags: z.array(z.union([z.number(), z.string()])).optional(),
  detach_lists: z.array(z.union([z.number(), z.string()])).optional(),
});

const bulkUpsertContactsSchema = z.object({
  contacts: z.array(z.record(z.any())),
  force_update: z.boolean().optional(),
  double_optin: z.boolean().optional(),
  dry_run: z.boolean().optional(),
});

const applySegmentsSchema = z.object({
  contact_ids: z.array(z.number()).optional(),
  subscriber_ids: z.array(z.number()).optional(),
  search: z.string().optional(),
  status: fluentCrmContactStatusSchema.optional(),
  attach_tags: z.array(z.union([z.number(), z.string()])).optional(),
  detach_tags: z.array(z.union([z.number(), z.string()])).optional(),
  tags: z.array(z.union([z.number(), z.string()])).optional(),
  attach_lists: z.array(z.union([z.number(), z.string()])).optional(),
  detach_lists: z.array(z.union([z.number(), z.string()])).optional(),
  lists: z.array(z.union([z.number(), z.string()])).optional(),
  dry_run: z.boolean().optional(),
});

const upsertCampaignSchema = createCampaignSchema.extend({
  id: z.number().optional(),
});

const changeCampaignStatusSchema = z.object({
  id: z.number(),
  action: z.enum(['pause', 'resume', 'duplicate', 'schedule', 'send', 'delete']),
  scheduled_at: z.string().optional(),
  dry_run: z.boolean().optional(),
});

const sendTestEmailSchema = z.object({
  id: z.number(),
  email: z.string().email().optional(),
});

const sendEmailToContactSchema = z.object({
  id: z.number(),
  campaign: z.record(z.any()),
});

const listAutomationsSchema = z.object({
  page: z.number().optional(),
  per_page: z.number().optional(),
  search: z.string().optional(),
});

const getSequenceSchema = z.object({
  id: z.number(),
  include_email_bodies: z.boolean().optional(),
});

const manageSequenceSubscribersSchema = z.object({
  id: z.number(),
  action: z.enum(['subscribe', 'unsubscribe']).optional(),
  contact_ids: z.array(z.number()).optional(),
  subscriber_ids: z.array(z.number()).optional(),
  subscribers: z.record(z.any()).optional(),
  dry_run: z.boolean().optional(),
});

const updateAutomationStatusSchema = z.object({
  id: z.number(),
  contact_id: z.number(),
  status: z.string(),
});

const previewDeleteIdSchema = z.object({ id: z.number() });

const previewDeleteNoteSchema = z.object({
  id: z.number(),
  note_id: z.number(),
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
    inputSchema: { type: 'object' as const, properties: updateContactSchema.shape }
  },
  {
    name: 'fcrm_delete_contact',
    description: 'Delete a FluentCRM contact',
    inputSchema: { type: 'object' as const, properties: z.object({ id: z.number() }).shape }
  },
  
  // Contact Tag Management
  {
    name: 'fcrm_get_contact_tags',
    description: 'Get all tags attached to a FluentCRM contact',
    inputSchema: { type: 'object' as const, properties: z.object({ id: z.number() }).shape }
  },
  {
    name: 'fcrm_attach_tags',
    description: 'Attach tags to an existing FluentCRM contact',
    inputSchema: { type: 'object' as const, properties: z.object({
      id: z.number(),
      tags: z.array(z.number()),
    }).shape }
  },
  {
    name: 'fcrm_detach_tags',
    description: 'Remove tags from a FluentCRM contact',
    inputSchema: { type: 'object' as const, properties: z.object({
      id: z.number(),
      tags: z.array(z.number()),
    }).shape }
  },
  
  // Contact List Management
  {
    name: 'fcrm_get_contact_lists',
    description: 'Get all lists a FluentCRM contact belongs to',
    inputSchema: { type: 'object' as const, properties: z.object({ id: z.number() }).shape }
  },
  {
    name: 'fcrm_attach_lists',
    description: 'Add a FluentCRM contact to lists',
    inputSchema: { type: 'object' as const, properties: z.object({
      id: z.number(),
      lists: z.array(z.number()),
    }).shape }
  },
  {
    name: 'fcrm_detach_lists',
    description: 'Remove a FluentCRM contact from lists',
    inputSchema: { type: 'object' as const, properties: z.object({
      id: z.number(),
      lists: z.array(z.number()),
    }).shape }
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
    inputSchema: { type: 'object' as const, properties: campaignIdSchema.shape }
  },
  {
    name: 'fcrm_get_campaign_stats',
    description:
      'Get FluentCRM campaign analytics: sends, opens, clicks, rates, unsubscribes (requires FluentMCP REST route fc-manager/v1/fcrm/campaigns/{id}/stats)',
    inputSchema: { type: 'object' as const, properties: campaignIdSchema.shape }
  },
  {
    name: 'fcrm_get_campaign_links',
    description:
      'Get per-link unique click counts for a FluentCRM campaign (optional limit; default 50 on server; requires FluentMCP route .../campaigns/{id}/links)',
    inputSchema: { type: 'object' as const, properties: campaignLinksSchema.shape }
  },
  {
    name: 'fcrm_get_campaign_clickers',
    description:
      'List subscribers who clicked links in a campaign; set include_contact true for email and names (requires FluentMCP route .../campaigns/{id}/clickers)',
    inputSchema: { type: 'object' as const, properties: campaignClickersSchema.shape }
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
  
  // Template Management
  {
    name: 'fcrm_list_templates',
    description: 'List all FluentCRM email templates',
    inputSchema: { type: 'object' as const, properties: listTemplatesSchema.shape }
  },
  {
    name: 'fcrm_get_template',
    description: 'Get a specific FluentCRM email template by ID',
    inputSchema: { type: 'object' as const, properties: z.object({ id: z.number() }).shape }
  },
  {
    name: 'fcrm_create_template',
    description: 'Create a new FluentCRM email template',
    inputSchema: { type: 'object' as const, properties: createTemplateSchema.shape }
  },
  {
    name: 'fcrm_update_template',
    description: 'Update an existing FluentCRM email template',
    inputSchema: { type: 'object' as const, properties: z.object({
      id: z.number(),
      post_title: z.string().optional(),
      post_content: z.string().optional(),
      email_subject: z.string().optional(),
      design_template: z.enum(['simple', 'plain', 'classic', 'raw_classic', 'raw_html']).optional(),
    }).shape }
  },
  {
    name: 'fcrm_delete_template',
    description: 'Delete a FluentCRM email template',
    inputSchema: { type: 'object' as const, properties: z.object({ id: z.number() }).shape }
  },

  // Contact Notes / Activities
  {
    name: 'fcrm_list_notes',
    description: 'List notes and activities for a FluentCRM contact. Filter by type: note, call, email, meeting, activity.',
    inputSchema: { type: 'object' as const, properties: listNotesSchema.shape }
  },
  {
    name: 'fcrm_create_note',
    description: 'Create a note or activity on a FluentCRM contact. Supports HTML in description.',
    inputSchema: { type: 'object' as const, properties: createNoteSchema.shape }
  },
  {
    name: 'fcrm_update_note',
    description: 'Update a note or activity on a FluentCRM contact.',
    inputSchema: { type: 'object' as const, properties: updateNoteSchema.shape }
  },
  {
    name: 'fcrm_delete_note',
    description: 'Delete a note or activity from a FluentCRM contact.',
    inputSchema: { type: 'object' as const, properties: deleteNoteSchema.shape }
  },
  {
    name: 'fcrm_get_crm_context',
    description: 'FluentCRM context: versions, counts, contact statuses, note types, custom fields schema, canonical /fcrm endpoints.',
    inputSchema: { type: 'object' as const, properties: z.object({}).shape }
  },
  {
    name: 'fcrm_estimate_contacts',
    description: 'Count FluentCRM contacts matching filters without loading full list (same filters as fcrm_list_contacts).',
    inputSchema: { type: 'object' as const, properties: listContactsSchema.shape }
  },
  {
    name: 'fcrm_upsert_contact',
    description: 'Create or update a FluentCRM contact by id or email (single upsert).',
    inputSchema: { type: 'object' as const, properties: upsertContactSchema.shape }
  },
  {
    name: 'fcrm_bulk_upsert_contacts',
    description: 'Batch create/update up to 500 contacts. Set dry_run true to preview only.',
    inputSchema: { type: 'object' as const, properties: bulkUpsertContactsSchema.shape }
  },
  {
    name: 'fcrm_apply_segments_to_contacts',
    description: 'Bulk attach/detach tags and lists by contact IDs or search/status filters. dry_run previews ID lists.',
    inputSchema: { type: 'object' as const, properties: applySegmentsSchema.shape }
  },
  {
    name: 'fcrm_upsert_campaign',
    description: 'Create or update a FluentCRM campaign (pass id in body to update).',
    inputSchema: { type: 'object' as const, properties: upsertCampaignSchema.shape }
  },
  {
    name: 'fcrm_change_campaign_status',
    description: 'Change campaign state: pause, resume, duplicate, schedule, send, or delete.',
    inputSchema: { type: 'object' as const, properties: changeCampaignStatusSchema.shape }
  },
  {
    name: 'fcrm_send_test_email',
    description: 'Send a test copy of a campaign email.',
    inputSchema: { type: 'object' as const, properties: sendTestEmailSchema.shape }
  },
  {
    name: 'fcrm_send_email_to_contact',
    description: 'Send a one-off custom email to one contact (campaign object with subject and body).',
    inputSchema: { type: 'object' as const, properties: sendEmailToContactSchema.shape }
  },
  {
    name: 'fcrm_preview_delete_contact',
    description: 'Preview deleting a contact (dry run, no changes).',
    inputSchema: { type: 'object' as const, properties: previewDeleteIdSchema.shape }
  },
  {
    name: 'fcrm_preview_delete_list',
    description: 'Preview deleting a list (dry run).',
    inputSchema: { type: 'object' as const, properties: previewDeleteIdSchema.shape }
  },
  {
    name: 'fcrm_preview_delete_tag',
    description: 'Preview deleting a tag (dry run).',
    inputSchema: { type: 'object' as const, properties: previewDeleteIdSchema.shape }
  },
  {
    name: 'fcrm_preview_delete_note',
    description: 'Preview deleting a contact note (dry run).',
    inputSchema: { type: 'object' as const, properties: previewDeleteNoteSchema.shape }
  },
  {
    name: 'fcrm_list_automations',
    description: 'List FluentCRM automation funnels.',
    inputSchema: { type: 'object' as const, properties: listAutomationsSchema.shape }
  },
  {
    name: 'fcrm_get_automation',
    description: 'Get a FluentCRM automation funnel by ID.',
    inputSchema: { type: 'object' as const, properties: campaignIdSchema.shape }
  },
  {
    name: 'fcrm_list_funnel_subscribers',
    description: 'List contacts enrolled in an automation funnel.',
    inputSchema: { type: 'object' as const, properties: z.object({
      id: z.number(),
      page: z.number().optional(),
      per_page: z.number().optional(),
      search: z.string().optional(),
    }).shape }
  },
  {
    name: 'fcrm_update_contact_automation_status',
    description: 'Update a contact status inside an automation funnel.',
    inputSchema: { type: 'object' as const, properties: updateAutomationStatusSchema.shape }
  },
  {
    name: 'fcrm_list_sequences',
    description: 'List email sequences (FluentCampaign Pro).',
    inputSchema: { type: 'object' as const, properties: listAutomationsSchema.shape }
  },
  {
    name: 'fcrm_get_sequence',
    description: 'Get an email sequence by ID. include_email_bodies loads sequence emails.',
    inputSchema: { type: 'object' as const, properties: getSequenceSchema.shape }
  },
  {
    name: 'fcrm_manage_sequence_subscribers',
    description: 'Subscribe or unsubscribe contacts on a sequence (max 5000 IDs; dry_run for ID preview).',
    inputSchema: { type: 'object' as const, properties: manageSequenceSubscribersSchema.shape }
  },
  {
    name: 'fcrm_estimate_dynamic_segment',
    description: 'Count contacts matching segment filters without returning rows (FluentCampaign Pro).',
    inputSchema: { type: 'object' as const, properties: z.object({
      subscribers: z.record(z.any()).optional(),
      sending_filter: z.string().optional(),
      dynamic_segment: z.record(z.any()).optional(),
      advanced_filters: z.array(z.any()).optional(),
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
      
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/contacts?${params}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_get_contact: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/contacts/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_create_contact: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/fcrm/contacts', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_update_contact: async (args: any) => {
    try {
      const { id, ...data } = args;
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/fcrm/contacts/${id}`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_delete_contact: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/fcrm/contacts/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Contact Tag Management handlers
  fcrm_get_contact_tags: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/contacts/${args.id}/tags`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_attach_tags: async (args: any) => {
    try {
      const { id, tags } = args;
      const response = await makeWordPressRequest('POST', `fc-manager/v1/fcrm/contacts/${id}/tags`, { tags });
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_detach_tags: async (args: any) => {
    try {
      const { id, tags } = args;
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/fcrm/contacts/${id}/tags`, { tags });
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Contact List Management handlers
  fcrm_get_contact_lists: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/contacts/${args.id}/lists`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_attach_lists: async (args: any) => {
    try {
      const { id, lists } = args;
      const response = await makeWordPressRequest('POST', `fc-manager/v1/fcrm/contacts/${id}/lists`, { lists });
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_detach_lists: async (args: any) => {
    try {
      const { id, lists } = args;
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/fcrm/contacts/${id}/lists`, { lists });
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
      
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/lists?${params}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_get_list: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/lists/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_create_list: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/fcrm/lists', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_update_list: async (args: any) => {
    try {
      const { id, ...data } = args;
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/fcrm/lists/${id}`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_delete_list: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/fcrm/lists/${args.id}`);
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
      
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/tags?${params}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_get_tag: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/tags/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_create_tag: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/fcrm/tags', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_update_tag: async (args: any) => {
    try {
      const { id, ...data } = args;
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/fcrm/tags/${id}`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_delete_tag: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/fcrm/tags/${args.id}`);
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
      
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/campaigns?${params}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_get_campaign: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/campaigns/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_create_campaign: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/fcrm/campaigns', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_send_campaign: async (args: any) => {
    try {
      const { id, ...data } = args;
      const response = await makeWordPressRequest('POST', `fc-manager/v1/fcrm/campaigns/${id}/send`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_update_campaign: async (args: any) => {
    try {
      const { id, ...data } = args;
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/fcrm/campaigns/${id}`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_delete_campaign: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/fcrm/campaigns/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_get_campaign_stats: async (args: any) => {
    try {
      const response = await makeWordPressRequest(
        'GET',
        `fc-manager/v1/fcrm/campaigns/${args.id}/stats`
      );
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_get_campaign_links: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.limit != null) params.append('limit', String(args.limit));
      const q = params.toString();
      const path =
        `fc-manager/v1/fcrm/campaigns/${args.id}/links` + (q ? `?${q}` : '');
      const response = await makeWordPressRequest('GET', path);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_get_campaign_clickers: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.include_contact === true) params.append('include_contact', 'true');
      const q = params.toString();
      const path =
        `fc-manager/v1/fcrm/campaigns/${args.id}/clickers` + (q ? `?${q}` : '');
      const response = await makeWordPressRequest('GET', path);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Template handlers
  fcrm_list_templates: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.page) params.append('page', args.page);
      if (args.per_page) params.append('per_page', args.per_page);
      if (args.search) params.append('search', args.search);
      
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/templates?${params}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_get_template: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/templates/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_create_template: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/fcrm/templates', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_update_template: async (args: any) => {
    try {
      const { id, ...data } = args;
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/fcrm/templates/${id}`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_delete_template: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/fcrm/templates/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Contact Notes / Activities handlers
  fcrm_list_notes: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.per_page) params.append('per_page', args.per_page);
      if (args.page) params.append('page', args.page);
      if (args.type) params.append('type', args.type);
      const q = params.toString();
      const path = `fc-manager/v1/fcrm/contacts/${args.id}/notes` + (q ? `?${q}` : '');
      const response = await makeWordPressRequest('GET', path);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_create_note: async (args: any) => {
    try {
      const { id, ...data } = args;
      const response = await makeWordPressRequest('POST', `fc-manager/v1/fcrm/contacts/${id}/notes`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_update_note: async (args: any) => {
    try {
      const { id, note_id, ...data } = args;
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/fcrm/contacts/${id}/notes/${note_id}`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_delete_note: async (args: any) => {
    try {
      const { id, note_id, ...rest } = args;
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/fcrm/contacts/${id}/notes/${note_id}`, rest);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_get_crm_context: async () => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/fcrm/context');
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_estimate_contacts: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.search) params.append('search', args.search);
      if (args.status) params.append('status', args.status);
      const q = params.toString();
      const path = 'fc-manager/v1/fcrm/contacts/estimate' + (q ? `?${q}` : '');
      const response = await makeWordPressRequest('GET', path);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_upsert_contact: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/fcrm/contacts/upsert', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_bulk_upsert_contacts: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/fcrm/contacts/bulk-upsert', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_apply_segments_to_contacts: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/fcrm/contacts/apply-segments', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_upsert_campaign: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/fcrm/campaigns/upsert', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_change_campaign_status: async (args: any) => {
    try {
      const { id, ...data } = args;
      const response = await makeWordPressRequest('POST', `fc-manager/v1/fcrm/campaigns/${id}/status`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_send_test_email: async (args: any) => {
    try {
      const { id, ...data } = args;
      const response = await makeWordPressRequest('POST', `fc-manager/v1/fcrm/campaigns/${id}/send-test`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_send_email_to_contact: async (args: any) => {
    try {
      const { id, campaign } = args;
      const response = await makeWordPressRequest('POST', `fc-manager/v1/fcrm/contacts/${id}/send-email`, { campaign });
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_preview_delete_contact: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/contacts/${args.id}/delete-preview`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_preview_delete_list: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/lists/${args.id}/delete-preview`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_preview_delete_tag: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/tags/${args.id}/delete-preview`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_preview_delete_note: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/contacts/${args.id}/notes/${args.note_id}/delete-preview`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_list_automations: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.page) params.append('page', String(args.page));
      if (args.per_page) params.append('per_page', String(args.per_page));
      if (args.search) params.append('search', args.search);
      const q = params.toString();
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/automations${q ? `?${q}` : ''}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_get_automation: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/automations/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_list_funnel_subscribers: async (args: any) => {
    try {
      const { id, ...rest } = args;
      const params = new URLSearchParams();
      if (rest.page) params.append('page', String(rest.page));
      if (rest.per_page) params.append('per_page', String(rest.per_page));
      if (rest.search) params.append('search', rest.search);
      const q = params.toString();
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/automations/${id}/subscribers${q ? `?${q}` : ''}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_update_contact_automation_status: async (args: any) => {
    try {
      const { id, contact_id, status } = args;
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/fcrm/automations/${id}/contacts/${contact_id}/status`, { status });
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_list_sequences: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.page) params.append('page', String(args.page));
      if (args.per_page) params.append('per_page', String(args.per_page));
      if (args.search) params.append('search', args.search);
      const q = params.toString();
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/sequences${q ? `?${q}` : ''}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_get_sequence: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.include_email_bodies) params.append('include_email_bodies', 'true');
      const q = params.toString();
      const response = await makeWordPressRequest('GET', `fc-manager/v1/fcrm/sequences/${args.id}${q ? `?${q}` : ''}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_manage_sequence_subscribers: async (args: any) => {
    try {
      const { id, ...data } = args;
      const response = await makeWordPressRequest('POST', `fc-manager/v1/fcrm/sequences/${id}/subscribers`, data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fcrm_estimate_dynamic_segment: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/fcrm/segments/estimate', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },
};
