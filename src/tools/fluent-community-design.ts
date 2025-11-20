import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { makeWordPressRequest } from '../wordpress.js';

// ==================== ZOD SCHEMA DEFINITIONS ====================

const getColorsSchema = z.object({
  mode: z.enum(['light', 'dark']).optional().default('light').describe('Color mode (light or dark)')
});

const updateColorsSchema = z.object({
  mode: z.enum(['light', 'dark']).optional().default('light').describe('Color mode (light or dark)'),
  colors: z.object({
    navbar_bg: z.string().optional().describe('Navbar background color (hex)'),
    navbar_text: z.string().optional().describe('Navbar text color (hex)'),
    sidebar_bg: z.string().optional().describe('Sidebar background color (hex)'),
    sidebar_text: z.string().optional().describe('Sidebar text color (hex)'),
    feed_bg: z.string().optional().describe('Feed background color (hex)'),
    button_primary: z.string().optional().describe('Primary button color (hex)'),
    button_secondary: z.string().optional().describe('Secondary button color (hex)'),
    link_color: z.string().optional().describe('Link color (hex)'),
    accent_color: z.string().optional().describe('Accent color (hex)')
  }).describe('Color values to update')
});

const updatePortalSettingsSchema = z.object({
  settings: z.object({
    dark_mode_enabled: z.boolean().optional().describe('Enable dark mode'),
    sticky_header: z.boolean().optional().describe('Enable sticky header'),
    post_layout: z.enum(['card', 'list', 'grid']).optional().describe('Post layout style'),
    sidebar_position: z.enum(['left', 'right']).optional().describe('Sidebar position'),
    show_member_count: z.boolean().optional().describe('Show member count'),
    show_post_count: z.boolean().optional().describe('Show post count'),
    enable_reactions: z.boolean().optional().describe('Enable post reactions'),
    enable_comments: z.boolean().optional().describe('Enable comments')
  }).describe('Portal settings to update')
});

const updateBrandingSchema = z.object({
  branding: z.object({
    logo_url: z.string().optional().describe('Logo URL'),
    logo_width: z.number().optional().describe('Logo width in pixels'),
    favicon_url: z.string().optional().describe('Favicon URL'),
    site_title: z.string().optional().describe('Site title'),
    site_tagline: z.string().optional().describe('Site tagline'),
    custom_css: z.string().optional().describe('Custom CSS code'),
    custom_header_code: z.string().optional().describe('Custom header HTML/JS'),
    custom_footer_code: z.string().optional().describe('Custom footer HTML/JS')
  }).describe('Branding data to update')
});

// ==================== TOOL DEFINITIONS ====================

export const fluentCommunityDesignTools: Tool[] = [
  {
    name: 'fc_get_colors',
    description: 'Get FluentCommunity color scheme (light or dark mode)',
    inputSchema: { type: 'object', properties: getColorsSchema.shape }
  },
  {
    name: 'fc_update_colors',
    description: 'Update FluentCommunity color scheme for light or dark mode',
    inputSchema: { type: 'object', properties: updateColorsSchema.shape }
  },
  {
    name: 'fc_get_portal_settings',
    description: 'Get FluentCommunity portal display settings',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'fc_update_portal_settings',
    description: 'Update FluentCommunity portal display settings (layout, sidebar, features)',
    inputSchema: { type: 'object', properties: updatePortalSettingsSchema.shape }
  },
  {
    name: 'fc_get_branding',
    description: 'Get FluentCommunity branding settings (logo, favicon, custom CSS)',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'fc_update_branding',
    description: 'Update FluentCommunity branding (logo, favicon, custom CSS/HTML)',
    inputSchema: { type: 'object', properties: updateBrandingSchema.shape }
  }
];

// ==================== TOOL HANDLERS ====================

export const fluentCommunityDesignHandlers: Record<string, (args: any) => Promise<any>> = {
  fc_get_colors: async (args: any) => {
    try {
      // Use FluentCommunity's NATIVE color-config endpoint
      const response = await makeWordPressRequest('GET', 'fluent-community/v2/settings/color-config');
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_update_colors: async (args: any) => {
    try {
      // Use FluentCommunity's NATIVE color-config endpoint
      const data = {
        mode: args.mode || 'light',
        colors: args.colors
      };
      
      const response = await makeWordPressRequest('POST', 'fluent-community/v2/settings/color-config', data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_get_portal_settings: async (args: any) => {
    try {
      // Use FluentCommunity's NATIVE customization-settings endpoint
      const response = await makeWordPressRequest('GET', 'fluent-community/v2/settings/customization-settings');
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_update_portal_settings: async (args: any) => {
    try {
      // Use FluentCommunity's NATIVE customization-settings endpoint
      const data = {
        settings: args.settings
      };
      
      const response = await makeWordPressRequest('POST', 'fluent-community/v2/settings/customization-settings', data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_get_branding: async (args: any) => {
    try {
      // Use FluentCommunity's NATIVE customization-settings endpoint (branding is part of customization)
      const response = await makeWordPressRequest('GET', 'fluent-community/v2/settings/customization-settings');
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_update_branding: async (args: any) => {
    try {
      // Use FluentCommunity's NATIVE customization-settings endpoint (branding is part of customization)
      const data = {
        branding: args.branding
      };
      
      const response = await makeWordPressRequest('POST', 'fluent-community/v2/settings/customization-settings', data);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  }
};



