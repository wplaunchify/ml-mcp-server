import { z } from 'zod';
import { makeWordPressRequest } from '../wordpress.js';

// Layout Control Tools for FluentCommunity Manager

export const fluentCommunityLayoutTools = [
  {
    name: 'fc_get_layout',
    description: 'Get FluentCommunity layout settings (menu position, sidebar placement, component visibility, content injection)',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'fc_update_layout',
    description: 'Update FluentCommunity layout settings. Control menu positioning (top/side), sidebar placement (left/right), component visibility (hide/show members, spaces, etc.), and inject custom content (header, sidebar, footer with HTML/shortcodes)',
    inputSchema: { type: 'object' as const, properties: z.object({
      layout: z.object({
        menu_position: z.enum(['top', 'side']).optional().describe('Menu position: top or side'),
        sidebar_position: z.enum(['left', 'right']).optional().describe('Sidebar position: left or right'),
        hide_members_list: z.boolean().optional().describe('Hide members list component'),
        hide_spaces_list: z.boolean().optional().describe('Hide spaces list component'),
        hide_activity_feed: z.boolean().optional().describe('Hide activity feed component'),
        hide_search: z.boolean().optional().describe('Hide search component'),
        custom_header_content: z.string().optional().describe('Custom header content (HTML/shortcodes)'),
        custom_sidebar_content: z.string().optional().describe('Custom sidebar content (HTML/shortcodes)'),
        custom_footer_content: z.string().optional().describe('Custom footer content (HTML/shortcodes)'),
        hide_home_feed: z.boolean().optional().describe('Hide the default home feed'),
        custom_home_content: z.string().optional().describe('Custom home page content (HTML/shortcodes)'),
        home_feed_label: z.string().optional().describe('Custom label for home feed'),
        embed_post_id: z.number().optional().describe('Post ID to embed on home page'),
        social_links: z.array(z.object({
          platform: z.string().describe('Social platform name (e.g., twitter, linkedin, github)'),
          url: z.string().describe('Profile URL'),
          icon: z.string().optional().describe('Icon class or SVG'),
        })).optional().describe('Social profile links for user profiles'),
      }).describe('Layout settings object'),
    }).shape },
  },
];

export const fluentCommunityLayoutHandlers = {
  fc_get_layout: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/settings/layout');
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
            text: `Error getting layout settings: ${error.message}`
          }]
        }
      };
    }
  },

  fc_update_layout: async (args: any) => {
    try {
      const response = await makeWordPressRequest('PUT', 'fc-manager/v1/settings/layout', {
        layout: args.layout
      });
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
            text: `Error updating layout settings: ${error.message}`
          }]
        }
      };
    }
  },
};

