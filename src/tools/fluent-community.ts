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

const updateCommentSchema = z.object({
  comment_id: z.number().describe('The ID of the comment to update'),
  message: z.string().describe('Updated comment message')
});

const deleteCommentSchema = z.object({
  comment_id: z.number().describe('The ID of the comment to delete')
});

const listSpaceMembersSchema = z.object({
  space_id: z.number().describe('The space ID to list members from'),
  status: z.enum(['active', 'pending', 'banned']).optional().describe('Filter by member status'),
  limit: z.number().optional().default(50).describe('Number of members to return')
});

const addSpaceMemberSchema = z.object({
  space_id: z.number().describe('The space ID'),
  user_id: z.number().describe('The user ID to add'),
  role: z.string().optional().default('member').describe('Member role in the space')
});

const removeSpaceMemberSchema = z.object({
  space_id: z.number().describe('The space ID'),
  user_id: z.number().describe('The user ID to remove')
});

const searchContentSchema = z.object({
  query: z.string().describe('Search query'),
  content_type: z.enum(['all', 'posts', 'comments', 'spaces']).optional().default('all').describe('Type of content to search'),
  space_id: z.number().optional().describe('Limit search to specific space'),
  limit: z.number().optional().default(20).describe('Number of results to return')
});

const getSpaceAnalyticsSchema = z.object({
  space_id: z.number().describe('The space ID to get analytics for'),
  date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
  date_to: z.string().optional().describe('End date (YYYY-MM-DD)')
});

const bulkCreatePostsSchema = z.object({
  posts: z.array(z.object({
    space_id: z.number(),
    user_id: z.number(),
    title: z.string().optional(),
    message: z.string(),
    type: z.string().optional(),
    status: z.string().optional()
  })).describe('Array of post objects to create')
});

const bulkUpdatePostsSchema = z.object({
  post_ids: z.array(z.number()).describe('Array of post IDs to update'),
  updates: z.object({
    status: z.string().optional(),
    privacy: z.string().optional()
  }).describe('Fields to update on all posts')
});

const bulkDeletePostsSchema = z.object({
  post_ids: z.array(z.number()).describe('Array of post IDs to delete')
});

export const fluentCommunityTools: Tool[] = [
  // ==================== POSTS TOOLS ====================
  {
    name: 'fc_list_posts',
    description: 'List all posts from FluentCommunity with optional filtering',
    inputSchema: { type: 'object', properties: listPostsSchema.shape }
  },
  {
    name: 'fc_get_post',
    description: 'Get a specific FluentCommunity post by ID with all details',
    inputSchema: { type: 'object', properties: getPostSchema.shape }
  },
  {
    name: 'fc_create_post',
    description: 'Create a new post in FluentCommunity',
    inputSchema: { type: 'object', properties: createPostSchema.shape }
  },
  {
    name: 'fc_update_post',
    description: 'Update an existing FluentCommunity post',
    inputSchema: { type: 'object', properties: updatePostSchema.shape }
  },
  {
    name: 'fc_delete_post',
    description: 'Delete a FluentCommunity post',
    inputSchema: { type: 'object', properties: deletePostSchema.shape }
  },
  
  // ==================== SPACES TOOLS ====================
  {
    name: 'fc_list_spaces',
    description: 'List all spaces in FluentCommunity',
    inputSchema: { type: 'object', properties: listSpacesSchema.shape }
  },
  {
    name: 'fc_get_space',
    description: 'Get detailed information about a specific FluentCommunity space',
    inputSchema: { type: 'object', properties: getSpaceSchema.shape }
  },
  {
    name: 'fc_create_space',
    description: 'Create a new space in FluentCommunity',
    inputSchema: { type: 'object', properties: createSpaceSchema.shape }
  },
  {
    name: 'fc_update_space',
    description: 'Update an existing FluentCommunity space',
    inputSchema: { type: 'object', properties: updateSpaceSchema.shape }
  },
  
  // ==================== COMMENTS TOOLS ====================
  {
    name: 'fc_list_comments',
    description: 'List FluentCommunity comments for a specific post or all comments',
    inputSchema: { type: 'object', properties: listCommentsSchema.shape }
  },
  {
    name: 'fc_create_comment',
    description: 'Create a new comment on a FluentCommunity post',
    inputSchema: { type: 'object', properties: createCommentSchema.shape }
  },
  {
    name: 'fc_update_comment',
    description: 'Update an existing FluentCommunity comment',
    inputSchema: { type: 'object', properties: updateCommentSchema.shape }
  },
  {
    name: 'fc_delete_comment',
    description: 'Delete a FluentCommunity comment',
    inputSchema: { type: 'object', properties: deleteCommentSchema.shape }
  },
  
  // ==================== SPACE MEMBERS TOOLS ====================
  {
    name: 'fc_list_space_members',
    description: 'List members of a specific FluentCommunity space',
    inputSchema: { type: 'object', properties: listSpaceMembersSchema.shape }
  },
  {
    name: 'fc_add_space_member',
    description: 'Add a user to a FluentCommunity space',
    inputSchema: { type: 'object', properties: addSpaceMemberSchema.shape }
  },
  {
    name: 'fc_remove_space_member',
    description: 'Remove a user from a FluentCommunity space',
    inputSchema: { type: 'object', properties: removeSpaceMemberSchema.shape }
  },
  
  // ==================== SEARCH & ANALYTICS TOOLS ====================
  {
    name: 'fc_search_content',
    description: 'Search across all FluentCommunity content (posts, comments, spaces)',
    inputSchema: { type: 'object', properties: searchContentSchema.shape }
  },
  {
    name: 'fc_get_space_analytics',
    description: 'Get analytics and statistics for a FluentCommunity space',
    inputSchema: { type: 'object', properties: getSpaceAnalyticsSchema.shape }
  },
  
  // ==================== BULK OPERATIONS ====================
  {
    name: 'fc_bulk_create_posts',
    description: 'Create multiple FluentCommunity posts at once (useful for AI-generated content campaigns)',
    inputSchema: { type: 'object', properties: bulkCreatePostsSchema.shape }
  },
  {
    name: 'fc_bulk_update_posts',
    description: 'Update multiple FluentCommunity posts at once',
    inputSchema: { type: 'object', properties: bulkUpdatePostsSchema.shape }
  },
  {
    name: 'fc_bulk_delete_posts',
    description: 'Delete multiple FluentCommunity posts at once',
    inputSchema: { type: 'object', properties: bulkDeletePostsSchema.shape }
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
      
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/posts', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_get_post: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/posts/${args.post_id}`);
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
      
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/posts', postData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_update_post: async (args: any) => {
    try {
      const { post_id, ...updateData } = args;
      const response = await makeWordPressRequest('POST', `fc-manager/v1/posts/${post_id}`, updateData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_delete_post: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/posts/${args.post_id}`);
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
      
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/spaces', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_get_space: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/spaces/${args.space_id}`);
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
      
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/spaces', spaceData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_update_space: async (args: any) => {
    try {
      const { space_id, ...updateData } = args;
      const response = await makeWordPressRequest('POST', `fc-manager/v1/spaces/${space_id}`, updateData);
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
      
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/comments', params);
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
      
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/comments', commentData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_update_comment: async (args: any) => {
    try {
      const { comment_id, ...updateData } = args;
      const response = await makeWordPressRequest('POST', `fc-manager/v1/comments/${comment_id}`, updateData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_delete_comment: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/comments/${args.comment_id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // ==================== SPACE MEMBERS HANDLERS ====================
  fc_list_space_members: async (args: any) => {
    try {
      const params: any = {
        per_page: args.limit || 50,
      };
      
      if (args.status) params.status = args.status;
      
      const response = await makeWordPressRequest('GET', `fc-manager/v1/spaces/${args.space_id}/members`, params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_add_space_member: async (args: any) => {
    try {
      // WordPress endpoint expects URL parameters for POST
      const queryParams = new URLSearchParams({
        user_id: args.user_id.toString(),
        role: args.role || 'member',
      });
      
      const response = await makeWordPressRequest('POST', `fc-manager/v1/spaces/${args.space_id}/members?${queryParams.toString()}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_remove_space_member: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/spaces/${args.space_id}/members/${args.user_id}`);
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
      
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/search', params);
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
      
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/analytics/space', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // ==================== BULK OPERATIONS HANDLERS ====================
  fc_bulk_create_posts: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/posts/bulk', { posts: args.posts });
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_bulk_update_posts: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/posts/bulk-update', {
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
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/posts/bulk-delete', { post_ids: args.post_ids });
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },
};

