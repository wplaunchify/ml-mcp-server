import { z } from 'zod';
import { makeWordPressRequest } from '../wordpress.js';

// ML Simple Site Tools - Complete Website Creation via MCP
// Requires ML Simple Site plugin v1.6.0+ on WordPress

export const mlSimpleSiteTools = [
  {
    name: 'mlss_get_site',
    description: 'Get the complete ML Simple Site configuration including settings, blocks, and preview URL',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'mlss_save_site',
    description: 'Save complete ML Simple Site - settings and all blocks at once. Use this to create or replace an entire site. Perfect for generating personalized websites from CRM contact data.',
    inputSchema: { type: 'object' as const, properties: z.object({
      settings: z.object({
        site_mode: z.enum(['single', 'multi']).optional().describe('single=scroll page, multi=separate pages'),
        site_title: z.string().optional().describe('Site title displayed in header'),
        logo_url: z.string().optional().describe('URL to logo image'),
        primary_color: z.string().optional().describe('Hex color like #2563eb'),
        display_location: z.enum(['disabled', 'homepage', 'page']).optional().describe('Where to display the site'),
        display_page_id: z.number().optional().describe('Page ID when display_location is page'),
        show_header: z.enum(['yes', 'no']).optional().describe('Show site header'),
        nav_style: z.enum(['fixed', 'static']).optional().describe('Navigation style'),
        header_height: z.number().optional().describe('Header height in pixels'),
        header_bg: z.string().optional().describe('Header background color (hex)'),
        nav_link_color: z.string().optional().describe('Navigation link color (hex)'),
        nav_font: z.string().optional().describe('Navigation font family'),
        nav_font_size: z.number().optional().describe('Navigation font size in pixels'),
      }).describe('Site settings object'),
      blocks: z.array(z.object({
        name: z.string().describe('Block name (appears in nav)'),
        html: z.string().describe('HTML content'),
        css: z.string().optional().describe('CSS styles'),
        hide_from_nav: z.boolean().optional().describe('Hide from navigation menu'),
      })).describe('Array of content blocks'),
    }).shape },
  },
  {
    name: 'mlss_update_settings',
    description: 'Update ML Simple Site settings. Supports partial updates - only specify fields you want to change.',
    inputSchema: { type: 'object' as const, properties: z.object({
      site_mode: z.enum(['single', 'multi']).optional().describe('single=scroll page, multi=separate pages'),
      site_title: z.string().optional().describe('Site title displayed in header'),
      logo_url: z.string().optional().describe('URL to logo image'),
      primary_color: z.string().optional().describe('Hex color like #FF6B35'),
      display_location: z.enum(['disabled', 'homepage', 'page']).optional().describe('Where to display the site'),
      display_page_id: z.number().optional().describe('Page ID when display_location is page'),
      show_header: z.enum(['yes', 'no']).optional().describe('Show site header'),
      nav_style: z.enum(['fixed', 'static']).optional().describe('Navigation style'),
      header_height: z.number().optional().describe('Header height in pixels'),
      header_bg: z.string().optional().describe('Header background color (hex)'),
      nav_link_color: z.string().optional().describe('Navigation link color (hex)'),
      nav_font: z.string().optional().describe('Navigation font family'),
      nav_font_size: z.number().optional().describe('Navigation font size in pixels'),
    }).shape },
  },
  {
    name: 'mlss_add_block',
    description: 'Add a single content block to ML Simple Site. Block is appended to the end.',
    inputSchema: { type: 'object' as const, properties: z.object({
      name: z.string().describe('Block name (appears in navigation)'),
      html: z.string().describe('HTML content for the block'),
      css: z.string().optional().describe('CSS styles for the block'),
      hide_from_nav: z.boolean().optional().describe('Hide from navigation menu (default false)'),
    }).shape },
  },
  {
    name: 'mlss_get_preview_url',
    description: 'Get the frontend preview URL for the ML Simple Site',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'mlss_edit_block',
    description: 'Edit a specific block with surgical precision. Supports full replacement or find/replace mode.',
    inputSchema: { type: 'object' as const, properties: z.object({
      block_index: z.number().describe('Index of block to edit (0-based)'),
      name: z.string().optional().describe('New block name'),
      html: z.string().optional().describe('New HTML content (replaces entire HTML)'),
      css: z.string().optional().describe('New CSS content (replaces entire CSS)'),
      find_html: z.string().optional().describe('HTML string to find and replace'),
      replace_html: z.string().optional().describe('HTML string to replace with'),
      find_css: z.string().optional().describe('CSS string to find and replace'),
      replace_css: z.string().optional().describe('CSS string to replace with'),
      hide_from_nav: z.boolean().optional().describe('Hide block from navigation'),
    }).shape },
  },
  {
    name: 'mlss_reorder_blocks',
    description: 'Reorder blocks by providing new order as array of indices (e.g., [2, 0, 1, 3] moves block 2 to position 0)',
    inputSchema: { type: 'object' as const, properties: z.object({
      block_order: z.array(z.number()).describe('New order of blocks by index (must include all blocks)'),
    }).shape },
  },
  {
    name: 'mlss_delete_block',
    description: 'Delete a specific block by index',
    inputSchema: { type: 'object' as const, properties: z.object({
      block_index: z.number().describe('Index of block to delete (0-based)'),
    }).shape },
  },
  {
    name: 'mlss_create_contact',
    description: 'Create contact in FluentCRM with optional list and tags. One-call contact creation.',
    inputSchema: { type: 'object' as const, properties: z.object({
      email: z.string().describe('Contact email address (required)'),
      full_name: z.string().optional().describe('Full name (will be split into first/last)'),
      first_name: z.string().optional().describe('First name'),
      last_name: z.string().optional().describe('Last name'),
      phone: z.string().optional().describe('Phone number'),
      company: z.string().optional().describe('Company name'),
      title: z.string().optional().describe('Job title'),
      location: z.string().optional().describe('Location/address'),
      list_id: z.number().optional().describe('FluentCRM list ID to add contact to'),
      tags: z.array(z.string()).optional().describe('Array of tags to add'),
    }).shape },
  },
  {
    name: 'mlss_get_revisions',
    description: 'List all saved revisions of the SimpleSite with metadata (index, description, timestamp, user, block count). Use this to show version history or before restoring.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'mlss_restore_revision',
    description: 'Restore a specific revision by index. Automatically saves current state before restoring. Perfect for rolling back changes or A/B testing.',
    inputSchema: { type: 'object' as const, properties: z.object({
      revision_index: z.number().describe('Index of revision to restore (0 = oldest, get from mlss_get_revisions)'),
    }).shape },
  },
  {
    name: 'mlss_save_revision',
    description: 'Save current state as a revision with optional description. Use before making experimental changes.',
    inputSchema: { type: 'object' as const, properties: z.object({
      description: z.string().optional().describe('Description of this revision (e.g., "Before major redesign")'),
    }).shape },
  },
];

export const mlSimpleSiteHandlers = {
  mlss_get_site: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'mlss/v1/site');
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
            text: `Error getting site: ${error.message}`
          }]
        }
      };
    }
  },

  mlss_save_site: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'mlss/v1/site', args);
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
            text: `Error saving site: ${error.message}`
          }]
        }
      };
    }
  },

  mlss_update_settings: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'mlss/v1/settings', args);
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
            text: `Error updating settings: ${error.message}`
          }]
        }
      };
    }
  },

  mlss_add_block: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'mlss/v1/blocks/add', args);
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
            text: `Error adding block: ${error.message}`
          }]
        }
      };
    }
  },

  mlss_get_preview_url: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'mlss/v1/preview-url');
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
            text: `Error getting preview URL: ${error.message}`
          }]
        }
      };
    }
  },

  mlss_edit_block: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'mlss/v1/blocks/edit', args);
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
            text: `Error editing block: ${error.message}`
          }]
        }
      };
    }
  },

  mlss_reorder_blocks: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'mlss/v1/blocks/reorder', args);
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
            text: `Error reordering blocks: ${error.message}`
          }]
        }
      };
    }
  },

  mlss_delete_block: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'mlss/v1/blocks/delete', args);
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
            text: `Error deleting block: ${error.message}`
          }]
        }
      };
    }
  },

  mlss_create_contact: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'mlss/v1/contacts/create', args);
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
            text: `Error creating contact: ${error.message}`
          }]
        }
      };
    }
  },

  mlss_get_revisions: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'mlss/v1/revisions');
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
            text: `Error getting revisions: ${error.message}`
          }]
        }
      };
    }
  },

  mlss_restore_revision: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'mlss/v1/restore-revision', args);
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
            text: `Error restoring revision: ${error.message}`
          }]
        }
      };
    }
  },

  mlss_save_revision: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'mlss/v1/save-revision', args);
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
            text: `Error saving revision: ${error.message}`
          }]
        }
      };
    }
  },
};












