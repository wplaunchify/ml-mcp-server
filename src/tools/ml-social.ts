import { z } from 'zod';
import { makeWordPressRequest } from '../wordpress.js';

// ML Social Tools - Social Media Publishing via Late API
// Requires ML Social plugin on WordPress

export const mlSocialTools = [
  {
    name: 'social_status',
    description: 'Check ML Social connection status - returns whether Late API is configured and connected, plus account/platform counts',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'social_accounts',
    description: 'List all connected social media accounts with their IDs, platforms, and usernames. Use these account IDs when publishing posts.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'social_publish',
    description: 'Publish content to one or more social media platforms. Supports immediate posting or scheduling. First call social_accounts to get valid account IDs.',
    inputSchema: { type: 'object' as const, properties: z.object({
      content: z.string().describe('Post text content (required). Platform character limits: Twitter 280, LinkedIn 3000, Instagram 2200'),
      platforms: z.array(z.object({
        accountId: z.string().describe('Account ID from social_accounts'),
      })).describe('Array of platform objects. Each must have accountId from social_accounts.'),
      mediaItems: z.array(z.object({
        url: z.string().describe('Public URL to image or video'),
        type: z.enum(['image', 'video']).describe('Media type'),
      })).optional().describe('Optional array of media attachments'),
      scheduledFor: z.string().optional().describe('Optional ISO 8601 timestamp to schedule post (e.g., 2026-02-05T09:00:00Z)'),
      timezone: z.string().optional().describe('Optional timezone for scheduled posts (e.g., America/Chicago)'),
      publishNow: z.boolean().optional().describe('Set to true to publish immediately (default). Set to false with scheduledFor to schedule.'),
    }).shape },
  },
  {
    name: 'social_posts',
    description: 'List recent social media posts created through ML Social. Shows post content, platforms, status, and timestamps.',
    inputSchema: { type: 'object' as const, properties: z.object({
      limit: z.number().optional().describe('Number of posts to return (default: 20, max: 100)'),
    }).shape },
  },
];

export const mlSocialHandlers = {
  social_status: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'ml-social/v1/status');
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
            text: `Error checking social status: ${error.message}`
          }]
        }
      };
    }
  },

  social_accounts: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'ml-social/v1/accounts');
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
            text: `Error listing social accounts: ${error.message}`
          }]
        }
      };
    }
  },

  social_publish: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'ml-social/v1/post', args);
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
            text: `Error publishing to social: ${error.message}`
          }]
        }
      };
    }
  },

  social_posts: async (args: any) => {
    try {
      const params = args.limit ? `?limit=${args.limit}` : '';
      const response = await makeWordPressRequest('GET', `ml-social/v1/posts${params}`);
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
            text: `Error listing social posts: ${error.message}`
          }]
        }
      };
    }
  },
};
