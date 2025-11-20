// src/tools/fluent-community.ts
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { makeWordPressRequest } from '../wordpress.js';
import { z } from 'zod';

/**
 * FluentCommunity Tools
 * Provides comprehensive management of FluentCommunity plugin features
 */

// Zod Schema Definitions
const listPostsSchema = z.object({
  space_id: z.number().optional().describe('Filter posts by space ID'),
  user_id: z.number().optional().describe('Filter posts by user ID'),
  status: z.enum(['published', 'draft', 'pending', 'archived']).optional().describe('Filter by status'),
  type: z.string().optional().describe('Filter by post type (text, video, etc.)'),
  limit: z.number().optional().default(20).describe('Number of posts to return'),
  offset: z.number().optional().default(0).describe('Offset for pagination'),
  search: z.string().optional().describe('Search term to filter posts')
});

const getPostSchema = z.object({
  post_id: z.number().describe('The ID of the post to retrieve')
});

const createPostSchema = z.object({
  space_id: z.number().describe('The space ID where the post will be created'),
  user_id: z.number().describe('The user ID who creates the post'),
  title: z.string().optional().describe('Post title'),
  message: z.string().describe('Post content/message'),
  type: z.string().optional().default('text').describe('Post type (text, video, etc.)'),
  status: z.enum(['published', 'draft', 'pending']).optional().default('published').describe('Post status'),
  privacy: z.enum(['public', 'private', 'friends']).optional().default('public').describe('Post privacy setting')
});

const updatePostSchema = z.object({
  post_id: z.number().describe('The ID of the post to update'),
  title: z.string().optional().describe('Post title'),
  message: z.string().optional().describe('Post content/message'),
  status: z.enum(['published', 'draft', 'pending', 'archived']).optional().describe('Post status'),
  privacy: z.enum(['public', 'private', 'friends']).optional().describe('Post privacy setting')
});

const deletePostSchema = z.object({
  post_id: z.number().describe('The ID of the post to delete')
});

const listSpacesSchema = z.object({
  status: z.enum(['active', 'inactive', 'archived']).optional().describe('Filter by status'),
  privacy: z.enum(['public', 'private']).optional().describe('Filter by privacy setting'),
  limit: z.number().optional().default(20).describe('Number of spaces to return'),
  search: z.string().optional().describe('Search term')
});

const getSpaceSchema = z.object({
  space_id: z.number().describe('The ID of the space to retrieve')
});

const createSpaceSchema = z.object({
  title: z.string().describe('Space title'),
  slug: z.string().optional().describe('Space slug (URL-friendly name)'),
  description: z.string().optional().describe('Space description'),
  privacy: z.enum(['public', 'private']).optional().default('public').describe('Privacy setting'),
  status: z.enum(['active', 'inactive']).optional().default('active').describe('Space status')
});

const updateSpaceSchema = z.object({
  space_id: z.number().describe('The ID of the space to update'),
  title: z.string().optional().describe('Space title'),
  description: z.string().optional().describe('Space description'),
  privacy: z.enum(['public', 'private']).optional().describe('Privacy setting'),
  status: z.enum(['active', 'inactive', 'archived']).optional().describe('Space status')
});

const listCommentsSchema = z.object({
  post_id: z.number().optional().describe('Filter comments by post ID'),
  user_id: z.number().optional().describe('Filter comments by user ID'),
  limit: z.number().optional().default(50).describe('Number of comments to return')
});

const createCommentSchema = z.object({
  post_id: z.number().describe('The post ID to comment on'),
  user_id: z.number().describe('The user ID who creates the comment'),
  message: z.string().describe('Comment content')
});

const listMembersSchema = z.object({
  space_id: z.number().optional().describe('Filter members by space ID'),
  role: z.string().optional().describe('Filter by role'),
  limit: z.number().optional().default(50).describe('Number of members to return')
});

const getMemberSchema = z.object({
  member_id: z.number().describe('The ID of the member to retrieve')
});

const getAnalyticsSchema = z.object({
  space_id: z.number().optional().describe('Filter analytics by space ID'),
  start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
  end_date: z.string().optional().describe('End date (YYYY-MM-DD)')
});

export const fluentCommunityTools: Tool[] = [
  // ==================== POSTS TOOLS ====================
  {
    name: 'fc_list_posts',
    description: 'List all posts from FluentCommunity with optional filtering',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: {
          type: 'number',
          description: 'Filter posts by space ID',
        },
        user_id: {
          type: 'number',
          description: 'Filter posts by user ID',
        },
        status: {
          type: 'string',
          description: 'Filter by status (published, draft, etc.)',
          enum: ['published', 'draft', 'pending', 'archived'],
        },
        type: {
          type: 'string',
          description: 'Filter by post type (text, video, etc.)',
        },
        limit: {
          type: 'number',
          description: 'Number of posts to return (default: 20)',
          default: 20,
        },
        offset: {
          type: 'number',
          description: 'Offset for pagination (default: 0)',
          default: 0,
        },
        search: {
          type: 'string',
          description: 'Search term to filter posts',
        },
      },
    },
  },
  {
    name: 'fc_get_post',
    description: 'Get a specific FluentCommunity post by ID with all details',
    inputSchema: {
      type: 'object',
      properties: {
        post_id: {
          type: 'number',
          description: 'The ID of the post to retrieve',
        },
      },
      required: ['post_id'],
    },
  },
  {
    name: 'fc_create_post',
    description: 'Create a new post in FluentCommunity',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: {
          type: 'number',
          description: 'The space ID where the post will be created',
        },
        user_id: {
          type: 'number',
          description: 'The user ID who creates the post',
        },
        title: {
          type: 'string',
          description: 'Post title',
        },
        message: {
          type: 'string',
          description: 'Post content/message',
        },
        type: {
          type: 'string',
          description: 'Post type (text, video, etc.)',
          default: 'text',
        },
        status: {
          type: 'string',
          description: 'Post status',
          enum: ['published', 'draft', 'pending'],
          default: 'published',
        },
        privacy: {
          type: 'string',
          description: 'Post privacy setting',
          enum: ['public', 'private', 'friends'],
          default: 'public',
        },
      },
      required: ['space_id', 'user_id', 'message'],
    },
  },
  {
    name: 'fc_update_post',
    description: 'Update an existing FluentCommunity post',
    inputSchema: {
      type: 'object',
      properties: {
        post_id: {
          type: 'number',
          description: 'The ID of the post to update',
        },
        title: {
          type: 'string',
          description: 'Post title',
        },
        message: {
          type: 'string',
          description: 'Post content/message',
        },
        status: {
          type: 'string',
          description: 'Post status',
          enum: ['published', 'draft', 'pending', 'archived'],
        },
        privacy: {
          type: 'string',
          description: 'Post privacy setting',
          enum: ['public', 'private', 'friends'],
        },
      },
      required: ['post_id'],
    },
  },
  {
    name: 'fc_delete_post',
    description: 'Delete a FluentCommunity post',
    inputSchema: {
      type: 'object',
      properties: {
        post_id: {
          type: 'number',
          description: 'The ID of the post to delete',
        },
      },
      required: ['post_id'],
    },
  },
  
  // ==================== SPACES TOOLS ====================
  {
    name: 'fc_list_spaces',
    description: 'List all spaces in FluentCommunity',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by status',
          enum: ['active', 'inactive', 'archived'],
        },
        privacy: {
          type: 'string',
          description: 'Filter by privacy setting',
          enum: ['public', 'private'],
        },
        limit: {
          type: 'number',
          description: 'Number of spaces to return',
          default: 20,
        },
        search: {
          type: 'string',
          description: 'Search term',
        },
      },
    },
  },
  {
    name: 'fc_get_space',
    description: 'Get detailed information about a specific FluentCommunity space',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: {
          type: 'number',
          description: 'The ID of the space to retrieve',
        },
      },
      required: ['space_id'],
    },
  },
  {
    name: 'fc_create_space',
    description: 'Create a new space in FluentCommunity',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Space title',
        },
        slug: {
          type: 'string',
          description: 'Space slug (URL-friendly name)',
        },
        description: {
          type: 'string',
          description: 'Space description',
        },
        privacy: {
          type: 'string',
          description: 'Privacy setting',
          enum: ['public', 'private'],
          default: 'public',
        },
        status: {
          type: 'string',
          description: 'Space status',
          enum: ['active', 'inactive'],
          default: 'active',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'fc_update_space',
    description: 'Update an existing FluentCommunity space',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: {
          type: 'number',
          description: 'The ID of the space to update',
        },
        title: {
          type: 'string',
          description: 'Space title',
        },
        description: {
          type: 'string',
          description: 'Space description',
        },
        privacy: {
          type: 'string',
          description: 'Privacy setting',
          enum: ['public', 'private'],
        },
        status: {
          type: 'string',
          description: 'Space status',
          enum: ['active', 'inactive', 'archived'],
        },
      },
      required: ['space_id'],
    },
  },
  
  // ==================== COMMENTS TOOLS ====================
  {
    name: 'fc_list_comments',
    description: 'List FluentCommunity comments for a specific post or all comments',
    inputSchema: {
      type: 'object',
      properties: {
        post_id: {
          type: 'number',
          description: 'Filter comments by post ID',
        },
        user_id: {
          type: 'number',
          description: 'Filter comments by user ID',
        },
        limit: {
          type: 'number',
          description: 'Number of comments to return',
          default: 50,
        },
      },
    },
  },
  {
    name: 'fc_create_comment',
    description: 'Create a new comment on a FluentCommunity post',
    inputSchema: {
      type: 'object',
      properties: {
        post_id: {
          type: 'number',
          description: 'The post ID to comment on',
        },
        user_id: {
          type: 'number',
          description: 'The user ID creating the comment',
        },
        message: {
          type: 'string',
          description: 'Comment message',
        },
        parent_id: {
          type: 'number',
          description: 'Parent comment ID for replies',
        },
      },
      required: ['post_id', 'user_id', 'message'],
    },
  },
  {
    name: 'fc_update_comment',
    description: 'Update an existing FluentCommunity comment',
    inputSchema: {
      type: 'object',
      properties: {
        comment_id: {
          type: 'number',
          description: 'The ID of the comment to update',
        },
        message: {
          type: 'string',
          description: 'Updated comment message',
        },
      },
      required: ['comment_id'],
    },
  },
  {
    name: 'fc_delete_comment',
    description: 'Delete a FluentCommunity comment',
    inputSchema: {
      type: 'object',
      properties: {
        comment_id: {
          type: 'number',
          description: 'The ID of the comment to delete',
        },
      },
      required: ['comment_id'],
    },
  },
  
  // ==================== SPACE MEMBERS TOOLS ====================
  {
    name: 'fc_list_space_members',
    description: 'List members of a specific FluentCommunity space',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: {
          type: 'number',
          description: 'The space ID to list members from',
        },
        status: {
          type: 'string',
          description: 'Filter by member status',
          enum: ['active', 'pending', 'banned'],
        },
        limit: {
          type: 'number',
          description: 'Number of members to return',
          default: 50,
        },
      },
      required: ['space_id'],
    },
  },
  {
    name: 'fc_add_space_member',
    description: 'Add a user to a FluentCommunity space',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: {
          type: 'number',
          description: 'The space ID',
        },
        user_id: {
          type: 'number',
          description: 'The user ID to add',
        },
        role: {
          type: 'string',
          description: 'Member role in the space',
          default: 'member',
        },
      },
      required: ['space_id', 'user_id'],
    },
  },
  {
    name: 'fc_remove_space_member',
    description: 'Remove a user from a FluentCommunity space',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: {
          type: 'number',
          description: 'The space ID',
        },
        user_id: {
          type: 'number',
          description: 'The user ID to remove',
        },
      },
      required: ['space_id', 'user_id'],
    },
  },
  
  // ==================== SEARCH & ANALYTICS TOOLS ====================
  {
    name: 'fc_search_content',
    description: 'Search across all FluentCommunity content (posts, comments, spaces)',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
        content_type: {
          type: 'string',
          description: 'Type of content to search',
          enum: ['all', 'posts', 'comments', 'spaces'],
          default: 'all',
        },
        space_id: {
          type: 'number',
          description: 'Limit search to specific space',
        },
        limit: {
          type: 'number',
          description: 'Number of results to return',
          default: 20,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'fc_get_space_analytics',
    description: 'Get analytics and statistics for a FluentCommunity space',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: {
          type: 'number',
          description: 'The space ID to get analytics for',
        },
        date_from: {
          type: 'string',
          description: 'Start date (YYYY-MM-DD)',
        },
        date_to: {
          type: 'string',
          description: 'End date (YYYY-MM-DD)',
        },
      },
      required: ['space_id'],
    },
  },
  
  // ==================== BULK OPERATIONS ====================
  {
    name: 'fc_bulk_create_posts',
    description: 'Create multiple FluentCommunity posts at once (useful for AI-generated content campaigns)',
    inputSchema: {
      type: 'object',
      properties: {
        posts: {
          type: 'array',
          description: 'Array of post objects to create',
          items: {
            type: 'object',
            properties: {
              space_id: { type: 'number' },
              user_id: { type: 'number' },
              title: { type: 'string' },
              message: { type: 'string' },
              type: { type: 'string' },
              status: { type: 'string' },
            },
            required: ['space_id', 'user_id', 'message'],
          },
        },
      },
      required: ['posts'],
    },
  },
  {
    name: 'fc_bulk_update_posts',
    description: 'Update multiple FluentCommunity posts at once',
    inputSchema: {
      type: 'object',
      properties: {
        post_ids: {
          type: 'array',
          description: 'Array of post IDs to update',
          items: { type: 'number' },
        },
        updates: {
          type: 'object',
          description: 'Fields to update on all posts',
          properties: {
            status: { type: 'string' },
            privacy: { type: 'string' },
          },
        },
      },
      required: ['post_ids', 'updates'],
    },
  },
  {
    name: 'fc_bulk_delete_posts',
    description: 'Delete multiple FluentCommunity posts at once',
    inputSchema: {
      type: 'object',
      properties: {
        post_ids: {
          type: 'array',
          description: 'Array of post IDs to delete',
          items: { type: 'number' },
        },
      },
      required: ['post_ids'],
    },
  },
];

/**
 * FluentCommunity Tool Handlers
 */
export const fluentCommunityHandlers = {
  // ==================== POSTS HANDLERS ====================
  fc_list_posts: async (args: any) => {
    try {
      const params: any = {
        per_page: args.limit || 20,
        offset: args.offset || 0,
      };
      
      if (args.space_id) params.space_id = args.space_id;
      if (args.user_id) params.user_id = args.user_id;
      if (args.status) params.status = args.status;
      if (args.type) params.type = args.type;
      if (args.search) params.search = args.search;
      
      const response = await makeWordPressRequest('GET', '../fc-manager/v1/posts', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_get_post: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `../fc-manager/v1/posts/${args.post_id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_create_post: async (args: any) => {
    try {
      const postData: any = {
        space_id: args.space_id,
        user_id: args.user_id,
        message: args.message,
        type: args.type || 'text',
        status: args.status || 'published',
        privacy: args.privacy || 'public',
      };
      
      if (args.title) postData.title = args.title;
      
      const response = await makeWordPressRequest('POST', '../fc-manager/v1/posts', postData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_update_post: async (args: any) => {
    try {
      const { post_id, ...updateData } = args;
      const response = await makeWordPressRequest('POST', `../fc-manager/v1/posts/${post_id}`, updateData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_delete_post: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `../fc-manager/v1/posts/${args.post_id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // ==================== SPACES HANDLERS ====================
  fc_list_spaces: async (args: any) => {
    try {
      const params: any = { per_page: args.limit || 20 };
      
      if (args.status) params.status = args.status;
      if (args.privacy) params.privacy = args.privacy;
      if (args.search) params.search = args.search;
      
      const response = await makeWordPressRequest('GET', '../fc-manager/v1/spaces', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_get_space: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `../fc-manager/v1/spaces/${args.space_id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_create_space: async (args: any) => {
    try {
      const spaceData: any = {
        title: args.title,
        slug: args.slug || args.title.toLowerCase().replace(/\s+/g, '-'),
        privacy: args.privacy || 'public',
        status: args.status || 'active',
      };
      
      if (args.description) spaceData.description = args.description;
      
      const response = await makeWordPressRequest('POST', '../fc-manager/v1/spaces', spaceData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_update_space: async (args: any) => {
    try {
      const { space_id, ...updateData } = args;
      const response = await makeWordPressRequest('POST', `../fc-manager/v1/spaces/${space_id}`, updateData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // ==================== COMMENTS HANDLERS ====================
  fc_list_comments: async (args: any) => {
    try {
      const params: any = { per_page: args.limit || 50 };
      
      if (args.post_id) params.post_id = args.post_id;
      if (args.user_id) params.user_id = args.user_id;
      
      const response = await makeWordPressRequest('GET', '../fc-manager/v1/comments', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_create_comment: async (args: any) => {
    try {
      const commentData: any = {
        post_id: args.post_id,
        user_id: args.user_id,
        message: args.message,
      };
      
      if (args.parent_id) commentData.parent_id = args.parent_id;
      
      const response = await makeWordPressRequest('POST', '../fc-manager/v1/comments', commentData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_update_comment: async (args: any) => {
    try {
      const { comment_id, ...updateData } = args;
      const response = await makeWordPressRequest('POST', `../fc-manager/v1/comments/${comment_id}`, updateData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_delete_comment: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `../fc-manager/v1/comments/${args.comment_id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // ==================== SPACE MEMBERS HANDLERS ====================
  fc_list_space_members: async (args: any) => {
    try {
      const params: any = {
        space_id: args.space_id,
        per_page: args.limit || 50,
      };
      
      if (args.status) params.status = args.status;
      
      const response = await makeWordPressRequest('GET', '../fc-manager/v1/space-members', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_add_space_member: async (args: any) => {
    try {
      const memberData = {
        space_id: args.space_id,
        user_id: args.user_id,
        role: args.role || 'member',
      };
      
      const response = await makeWordPressRequest('POST', '../fc-manager/v1/space-members', memberData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_remove_space_member: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `../fc-manager/v1/space-members/${args.space_id}/${args.user_id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // ==================== SEARCH & ANALYTICS HANDLERS ====================
  fc_search_content: async (args: any) => {
    try {
      const params: any = {
        query: args.query,
        content_type: args.content_type || 'all',
        per_page: args.limit || 20,
      };
      
      if (args.space_id) params.space_id = args.space_id;
      
      const response = await makeWordPressRequest('GET', '../fc-manager/v1/search', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_get_space_analytics: async (args: any) => {
    try {
      const params: any = { space_id: args.space_id };
      
      if (args.date_from) params.date_from = args.date_from;
      if (args.date_to) params.date_to = args.date_to;
      
      const response = await makeWordPressRequest('GET', '../fc-manager/v1/analytics/space', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // ==================== BULK OPERATIONS HANDLERS ====================
  fc_bulk_create_posts: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', '../fc-manager/v1/posts/bulk', { posts: args.posts });
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_bulk_update_posts: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', '../fc-manager/v1/posts/bulk-update', {
        post_ids: args.post_ids,
        updates: args.updates,
      });
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_bulk_delete_posts: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', '../fc-manager/v1/posts/bulk-delete', { post_ids: args.post_ids });
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },
};

