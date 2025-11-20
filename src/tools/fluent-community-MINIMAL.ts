// src/tools/fluent-community-MINIMAL.ts
// MINIMAL VERSION FOR TESTING - Only 3 tools
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { makeWordPressRequest } from '../wordpress.js';
import { z } from 'zod';

// Zod Schema Definitions
const listPostsSchema = z.object({
  space_id: z.number().optional().describe('Filter posts by space ID'),
  limit: z.number().optional().describe('Number of posts to return')
});

const listSpacesSchema = z.object({
  limit: z.number().optional().describe('Number of spaces to return'),
  search: z.string().optional().describe('Search term')
});

const createPostSchema = z.object({
  space_id: z.number().describe('The space ID where the post will be created'),
  user_id: z.number().describe('The user ID who creates the post'),
  message: z.string().describe('Post content/message')
});

// Type definitions
type ListPostsParams = z.infer<typeof listPostsSchema>;
type ListSpacesParams = z.infer<typeof listSpacesSchema>;
type CreatePostParams = z.infer<typeof createPostSchema>;

export const fluentCommunityTools: Tool[] = [
  {
    name: 'fc_list_posts',
    description: 'List all posts from FluentCommunity with optional filtering',
    inputSchema: { type: 'object', properties: listPostsSchema.shape }
  },
  {
    name: 'fc_list_spaces',
    description: 'List all spaces in FluentCommunity',
    inputSchema: { type: 'object', properties: listSpacesSchema.shape }
  },
  {
    name: 'fc_create_post',
    description: 'Create a new post in FluentCommunity',
    inputSchema: { type: 'object', properties: createPostSchema.shape }
  }
];

export const fluentCommunityHandlers = {
  fc_list_posts: async (params: ListPostsParams) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/posts', params);
      return {
        toolResult: {
          content: [{ type: 'text', text: JSON.stringify(response, null, 2) }],
          isError: false
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          content: [{ type: 'text', text: `Error listing posts: ${error.message}` }],
          isError: true
        }
      };
    }
  },

  fc_list_spaces: async (params: ListSpacesParams) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/spaces', params);
      return {
        toolResult: {
          content: [{ type: 'text', text: JSON.stringify(response, null, 2) }],
          isError: false
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          content: [{ type: 'text', text: `Error listing spaces: ${error.message}` }],
          isError: true
        }
      };
    }
  },

  fc_create_post: async (params: CreatePostParams) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/posts', params);
      return {
        toolResult: {
          content: [{ type: 'text', text: JSON.stringify(response, null, 2) }],
          isError: false
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          content: [{ type: 'text', text: `Error creating post: ${error.message}` }],
          isError: true
        }
      };
    }
  }
};



