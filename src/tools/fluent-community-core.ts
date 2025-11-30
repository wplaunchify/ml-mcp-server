// src/tools/fluent-community-core.ts
// COMM1 - Community Core (55 tools)
// Use case: "I manage my community - posts, members, engagement"

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { makeWordPressRequest } from '../wordpress.js';
import { z } from 'zod';

// ==================== SCHEMA DEFINITIONS ====================

// Posts
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
  privacy: z.enum(['public', 'private', 'friends']).optional().default('public').describe('Post privacy setting'),
  use_html5_bypass: z.boolean().optional().describe('Enable HTML5 bypass mode for full HTML/CSS/iframe support'),
  bypass_sanitization: z.boolean().optional().describe('Alias for use_html5_bypass')
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

// Spaces
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
  status: z.enum(['active', 'inactive']).optional().default('active').describe('Space status'),
  logo: z.string().optional().describe('Space logo/thumbnail URL'),
  cover_photo: z.string().optional().describe('Space cover photo URL')
});

const updateSpaceSchema = z.object({
  space_id: z.number().describe('The ID of the space to update'),
  title: z.string().optional().describe('Space title'),
  description: z.string().optional().describe('Space description'),
  privacy: z.enum(['public', 'private']).optional().describe('Privacy setting'),
  status: z.enum(['active', 'inactive', 'archived']).optional().describe('Space status'),
  logo: z.string().optional().describe('Space logo/thumbnail URL'),
  cover_photo: z.string().optional().describe('Space cover photo URL')
});

// Comments
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

const updateCommentSchema = z.object({
  comment_id: z.number().describe('The ID of the comment to update'),
  message: z.string().describe('Updated comment message')
});

const deleteCommentSchema = z.object({
  comment_id: z.number().describe('The ID of the comment to delete')
});

// Space Members
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

const registerMemberSchema = z.object({
  user_id: z.number().describe('The WordPress user ID to register in FluentCommunity'),
  status: z.enum(['active', 'inactive']).optional().default('active').describe('Member status'),
  avatar: z.string().optional().describe('Avatar URL'),
  cover_photo: z.string().optional().describe('Cover photo URL')
});

// Space Groups
const listSpaceGroupsSchema = z.object({
  limit: z.number().optional().default(20).describe('Number of groups to return')
});

const getSpaceGroupSchema = z.object({
  id: z.number().describe('Space group ID')
});

const createSpaceGroupSchema = z.object({
  title: z.string().describe('Group title'),
  description: z.string().optional().describe('Group description'),
  spaces: z.array(z.number()).optional().describe('Array of space IDs to include')
});

const updateSpaceGroupSchema = z.object({
  id: z.number().describe('Space group ID'),
  title: z.string().optional().describe('Group title'),
  description: z.string().optional().describe('Group description'),
  spaces: z.array(z.number()).optional().describe('Array of space IDs')
});

const deleteSpaceGroupSchema = z.object({
  id: z.number().describe('Space group ID')
});

// Managers
const listManagersSchema = z.object({
  space_id: z.number().optional().describe('Filter by space ID'),
  limit: z.number().optional().default(50).describe('Number of managers to return')
});

const addManagerSchema = z.object({
  user_id: z.number().describe('User ID to make manager'),
  space_id: z.number().optional().describe('Space ID (for space-specific manager)'),
  permissions: z.array(z.string()).optional().describe('Manager permissions')
});

const removeManagerSchema = z.object({
  id: z.number().describe('Manager ID to remove')
});

// Search & Analytics
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

// Bulk Operations
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

// Profiles
const listProfilesSchema = z.object({
  search: z.string().optional().describe('Search term'),
  limit: z.number().optional().default(20).describe('Number of profiles to return')
});

const getProfileSchema = z.object({
  id: z.number().describe('User/Profile ID')
});

const updateProfileSchema = z.object({
  id: z.number().describe('User/Profile ID'),
  display_name: z.string().optional().describe('Display name'),
  bio: z.string().optional().describe('Bio/description'),
  avatar: z.string().optional().describe('Avatar URL'),
  cover_photo: z.string().optional().describe('Cover photo URL'),
  social_links: z.record(z.string()).optional().describe('Social media links')
});

// Activities
const listActivitiesSchema = z.object({
  user_id: z.number().optional().describe('Filter by user ID'),
  limit: z.number().optional().default(50).describe('Number of activities to return')
});

// Reactions
const listReactionsSchema = z.object({
  post_id: z.number().optional().describe('Filter by post ID'),
  limit: z.number().optional().default(50).describe('Number of reactions to return')
});

const addReactionSchema = z.object({
  post_id: z.number().describe('Post ID to react to'),
  reaction_type: z.string().describe('Reaction type (like, love, etc.)')
});

const removeReactionSchema = z.object({
  id: z.number().describe('Reaction ID to remove')
});

// Bookmarks
const listBookmarksSchema = z.object({
  limit: z.number().optional().default(50).describe('Number of bookmarks to return')
});

const addBookmarkSchema = z.object({
  post_id: z.number().describe('Post ID to bookmark')
});

const removeBookmarkSchema = z.object({
  id: z.number().describe('Bookmark ID to remove')
});

// Notifications
const listNotificationsSchema = z.object({
  unread_only: z.boolean().optional().describe('Show only unread notifications'),
  limit: z.number().optional().default(50).describe('Number of notifications to return')
});

// Followers
const listFollowersSchema = z.object({
  user_id: z.number().optional().describe('User ID to get followers for'),
  limit: z.number().optional().default(50).describe('Number of followers to return')
});

const followUserSchema = z.object({
  user_id: z.number().describe('User ID to follow')
});

const unfollowUserSchema = z.object({
  id: z.number().describe('User ID to unfollow')
});

// Topics
const listTopicsSchema = z.object({
  limit: z.number().optional().default(50).describe('Number of topics to return')
});

const getTopicSchema = z.object({
  id: z.number().describe('Topic ID')
});

const createTopicSchema = z.object({
  name: z.string().describe('Topic name'),
  description: z.string().optional().describe('Topic description'),
  icon: z.string().optional().describe('Topic icon')
});

const updateTopicSchema = z.object({
  id: z.number().describe('Topic ID'),
  name: z.string().optional().describe('Topic name'),
  description: z.string().optional().describe('Topic description'),
  icon: z.string().optional().describe('Topic icon')
});

const deleteTopicSchema = z.object({
  id: z.number().describe('Topic ID')
});

// Reports
const listReportsSchema = z.object({
  status: z.enum(['pending', 'resolved', 'dismissed']).optional().describe('Filter by status'),
  limit: z.number().optional().default(50).describe('Number of reports to return')
});

const createReportSchema = z.object({
  content_id: z.number().describe('Content ID being reported'),
  content_type: z.enum(['post', 'comment', 'user']).describe('Type of content'),
  reason: z.string().describe('Reason for report')
});

// Scheduled Posts
const listScheduledPostsSchema = z.object({
  limit: z.number().optional().default(50).describe('Number of scheduled posts to return')
});

// ==================== TOOL DEFINITIONS (55 tools) ====================

export const fluentCommunityCoreTools: Tool[] = [
  // Posts (5)
  { name: 'fc_list_posts', description: 'List all posts from FluentCommunity with optional filtering', inputSchema: { type: 'object', properties: listPostsSchema.shape } },
  { name: 'fc_get_post', description: 'Get a specific FluentCommunity post by ID', inputSchema: { type: 'object', properties: getPostSchema.shape } },
  { name: 'fc_create_post', description: 'Create a new post in FluentCommunity', inputSchema: { type: 'object', properties: createPostSchema.shape } },
  { name: 'fc_update_post', description: 'Update an existing FluentCommunity post', inputSchema: { type: 'object', properties: updatePostSchema.shape } },
  { name: 'fc_delete_post', description: 'Delete a FluentCommunity post', inputSchema: { type: 'object', properties: deletePostSchema.shape } },
  
  // Spaces (4)
  { name: 'fc_list_spaces', description: 'List all spaces in FluentCommunity', inputSchema: { type: 'object', properties: listSpacesSchema.shape } },
  { name: 'fc_get_space', description: 'Get detailed information about a specific space', inputSchema: { type: 'object', properties: getSpaceSchema.shape } },
  { name: 'fc_create_space', description: 'Create a new space in FluentCommunity. IMPORTANT: For logo/cover_photo, you MUST first use fc_sideload_media to upload the image - regular URLs will be silently ignored!', inputSchema: { type: 'object', properties: createSpaceSchema.shape } },
  { name: 'fc_update_space', description: 'Update an existing space. IMPORTANT: For logo/cover_photo, you MUST first use fc_sideload_media to upload the image - regular URLs will be silently ignored!', inputSchema: { type: 'object', properties: updateSpaceSchema.shape } },
  
  // Comments (4)
  { name: 'fc_list_comments', description: 'List FluentCommunity comments', inputSchema: { type: 'object', properties: listCommentsSchema.shape } },
  { name: 'fc_create_comment', description: 'Create a new comment on a post', inputSchema: { type: 'object', properties: createCommentSchema.shape } },
  { name: 'fc_update_comment', description: 'Update an existing comment', inputSchema: { type: 'object', properties: updateCommentSchema.shape } },
  { name: 'fc_delete_comment', description: 'Delete a comment', inputSchema: { type: 'object', properties: deleteCommentSchema.shape } },
  
  // Space Members (4)
  { name: 'fc_list_space_members', description: 'List members of a specific space', inputSchema: { type: 'object', properties: listSpaceMembersSchema.shape } },
  { name: 'fc_add_space_member', description: 'Add a user to a space', inputSchema: { type: 'object', properties: addSpaceMemberSchema.shape } },
  { name: 'fc_remove_space_member', description: 'Remove a user from a space', inputSchema: { type: 'object', properties: removeSpaceMemberSchema.shape } },
  { name: 'fc_register_member', description: 'Register a WordPress user in FluentCommunity', inputSchema: { type: 'object', properties: registerMemberSchema.shape } },
  
  // Space Groups (5)
  { name: 'fc_list_space_groups', description: 'List all space groups', inputSchema: { type: 'object', properties: listSpaceGroupsSchema.shape } },
  { name: 'fc_get_space_group', description: 'Get a specific space group', inputSchema: { type: 'object', properties: getSpaceGroupSchema.shape } },
  { name: 'fc_create_space_group', description: 'Create a new space group', inputSchema: { type: 'object', properties: createSpaceGroupSchema.shape } },
  { name: 'fc_update_space_group', description: 'Update a space group', inputSchema: { type: 'object', properties: updateSpaceGroupSchema.shape } },
  { name: 'fc_delete_space_group', description: 'Delete a space group', inputSchema: { type: 'object', properties: deleteSpaceGroupSchema.shape } },
  
  // Managers (3)
  { name: 'fc_list_managers', description: 'List community managers', inputSchema: { type: 'object', properties: listManagersSchema.shape } },
  { name: 'fc_add_manager', description: 'Add a community manager', inputSchema: { type: 'object', properties: addManagerSchema.shape } },
  { name: 'fc_remove_manager', description: 'Remove a community manager', inputSchema: { type: 'object', properties: removeManagerSchema.shape } },
  
  // Search & Analytics (2)
  { name: 'fc_search_content', description: 'Search across all FluentCommunity content', inputSchema: { type: 'object', properties: searchContentSchema.shape } },
  { name: 'fc_get_space_analytics', description: 'Get analytics for a space', inputSchema: { type: 'object', properties: getSpaceAnalyticsSchema.shape } },
  
  // Bulk Operations (3)
  { name: 'fc_bulk_create_posts', description: 'Create multiple posts at once', inputSchema: { type: 'object', properties: bulkCreatePostsSchema.shape } },
  { name: 'fc_bulk_update_posts', description: 'Update multiple posts at once', inputSchema: { type: 'object', properties: bulkUpdatePostsSchema.shape } },
  { name: 'fc_bulk_delete_posts', description: 'Delete multiple posts at once', inputSchema: { type: 'object', properties: bulkDeletePostsSchema.shape } },
  
  // Profiles (3)
  { name: 'fc_list_profiles', description: 'List user profiles', inputSchema: { type: 'object', properties: listProfilesSchema.shape } },
  { name: 'fc_get_profile', description: 'Get a specific user profile', inputSchema: { type: 'object', properties: getProfileSchema.shape } },
  { name: 'fc_update_profile', description: 'Update a user profile', inputSchema: { type: 'object', properties: updateProfileSchema.shape } },
  
  // Activities (1)
  { name: 'fc_list_activities', description: 'List user activities', inputSchema: { type: 'object', properties: listActivitiesSchema.shape } },
  
  // Reactions (3)
  { name: 'fc_list_reactions', description: 'List reactions on posts', inputSchema: { type: 'object', properties: listReactionsSchema.shape } },
  { name: 'fc_add_reaction', description: 'Add a reaction to a post', inputSchema: { type: 'object', properties: addReactionSchema.shape } },
  { name: 'fc_remove_reaction', description: 'Remove a reaction', inputSchema: { type: 'object', properties: removeReactionSchema.shape } },
  
  // Bookmarks (3)
  { name: 'fc_list_bookmarks', description: 'List user bookmarks', inputSchema: { type: 'object', properties: listBookmarksSchema.shape } },
  { name: 'fc_add_bookmark', description: 'Add a bookmark', inputSchema: { type: 'object', properties: addBookmarkSchema.shape } },
  { name: 'fc_remove_bookmark', description: 'Remove a bookmark', inputSchema: { type: 'object', properties: removeBookmarkSchema.shape } },
  
  // Notifications (2)
  { name: 'fc_list_notifications', description: 'List user notifications', inputSchema: { type: 'object', properties: listNotificationsSchema.shape } },
  { name: 'fc_mark_notifications_read', description: 'Mark notifications as read', inputSchema: { type: 'object', properties: z.object({}).shape } },
  
  // Followers (3)
  { name: 'fc_list_followers', description: 'List followers for a user', inputSchema: { type: 'object', properties: listFollowersSchema.shape } },
  { name: 'fc_follow_user', description: 'Follow a user', inputSchema: { type: 'object', properties: followUserSchema.shape } },
  { name: 'fc_unfollow_user', description: 'Unfollow a user', inputSchema: { type: 'object', properties: unfollowUserSchema.shape } },
  
  // Topics (5)
  { name: 'fc_list_topics', description: 'List all topics', inputSchema: { type: 'object', properties: listTopicsSchema.shape } },
  { name: 'fc_get_topic', description: 'Get a specific topic', inputSchema: { type: 'object', properties: getTopicSchema.shape } },
  { name: 'fc_create_topic', description: 'Create a new topic', inputSchema: { type: 'object', properties: createTopicSchema.shape } },
  { name: 'fc_update_topic', description: 'Update a topic', inputSchema: { type: 'object', properties: updateTopicSchema.shape } },
  { name: 'fc_delete_topic', description: 'Delete a topic', inputSchema: { type: 'object', properties: deleteTopicSchema.shape } },
  
  // Reports (2)
  { name: 'fc_list_reports', description: 'List moderation reports', inputSchema: { type: 'object', properties: listReportsSchema.shape } },
  { name: 'fc_create_report', description: 'Create a moderation report', inputSchema: { type: 'object', properties: createReportSchema.shape } },
  
  // Scheduled Posts (1)
  { name: 'fc_list_scheduled_posts', description: 'List scheduled posts', inputSchema: { type: 'object', properties: listScheduledPostsSchema.shape } },
];

// ==================== HANDLERS ====================

export const fluentCommunityCoreHandlers = {
  // Posts
  fc_list_posts: async (args: any) => {
    try {
      const params: any = { per_page: args.limit || 20, offset: args.offset || 0 };
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
        space_id: args.space_id, user_id: args.user_id, message: args.message,
        type: args.type || 'text', status: args.status || 'published', privacy: args.privacy || 'public'
      };
      if (args.title) postData.title = args.title;
      if (args.use_html5_bypass) postData.use_html5_bypass = args.use_html5_bypass;
      if (args.bypass_sanitization) postData.bypass_sanitization = args.bypass_sanitization;
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/posts', postData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_update_post: async (args: any) => {
    try {
      const { post_id, ...updateData } = args;
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/posts/${post_id}`, updateData);
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

  // Spaces
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
        title: args.title, slug: args.slug || args.title.toLowerCase().replace(/\s+/g, '-'),
        privacy: args.privacy || 'public', status: args.status || 'active'
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
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/spaces/${space_id}`, updateData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Comments
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
      const commentData: any = { post_id: args.post_id, user_id: args.user_id, message: args.message };
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
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/comments/${comment_id}`, updateData);
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

  // Space Members
  fc_list_space_members: async (args: any) => {
    try {
      const params: any = { per_page: args.limit || 50 };
      if (args.status) params.status = args.status;
      const response = await makeWordPressRequest('GET', `fc-manager/v1/spaces/${args.space_id}/members`, params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_add_space_member: async (args: any) => {
    try {
      const queryParams = new URLSearchParams({ user_id: args.user_id.toString(), role: args.role || 'member' });
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

  fc_register_member: async (args: any) => {
    try {
      const memberData: any = { user_id: args.user_id };
      if (args.status) memberData.status = args.status;
      if (args.avatar) memberData.avatar = args.avatar;
      if (args.cover_photo) memberData.cover_photo = args.cover_photo;
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/members/register', memberData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Space Groups
  fc_list_space_groups: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/space-groups', { per_page: args.limit || 20 });
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_get_space_group: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/space-groups/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_create_space_group: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/space-groups', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_update_space_group: async (args: any) => {
    try {
      const { id, ...updateData } = args;
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/space-groups/${id}`, updateData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_delete_space_group: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/space-groups/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Managers
  fc_list_managers: async (args: any) => {
    try {
      const params: any = { per_page: args.limit || 50 };
      if (args.space_id) params.space_id = args.space_id;
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/managers', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_add_manager: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/managers', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_remove_manager: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/managers/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Search & Analytics
  fc_search_content: async (args: any) => {
    try {
      const params: any = { query: args.query, content_type: args.content_type || 'all', per_page: args.limit || 20 };
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

  // Bulk Operations
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
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/posts/bulk-update', { post_ids: args.post_ids, updates: args.updates });
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

  // Profiles
  fc_list_profiles: async (args: any) => {
    try {
      const params: any = { per_page: args.limit || 20 };
      if (args.search) params.search = args.search;
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/profiles', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_get_profile: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/profiles/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_update_profile: async (args: any) => {
    try {
      const { id, ...updateData } = args;
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/profiles/${id}`, updateData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Activities
  fc_list_activities: async (args: any) => {
    try {
      const params: any = { per_page: args.limit || 50 };
      if (args.user_id) params.user_id = args.user_id;
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/activities', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Reactions
  fc_list_reactions: async (args: any) => {
    try {
      const params: any = { per_page: args.limit || 50 };
      if (args.post_id) params.post_id = args.post_id;
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/reactions', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_add_reaction: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/reactions', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_remove_reaction: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/reactions/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Bookmarks
  fc_list_bookmarks: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/bookmarks', { per_page: args.limit || 50 });
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_add_bookmark: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/bookmarks', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_remove_bookmark: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/bookmarks/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Notifications
  fc_list_notifications: async (args: any) => {
    try {
      const params: any = { per_page: args.limit || 50 };
      if (args.unread_only) params.unread_only = args.unread_only;
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/notifications', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_mark_notifications_read: async (args: any) => {
    try {
      const response = await makeWordPressRequest('PUT', 'fc-manager/v1/notifications', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Followers
  fc_list_followers: async (args: any) => {
    try {
      const params: any = { per_page: args.limit || 50 };
      if (args.user_id) params.user_id = args.user_id;
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/followers', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_follow_user: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/followers', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_unfollow_user: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/followers/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Topics
  fc_list_topics: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/topics', { per_page: args.limit || 50 });
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_get_topic: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/topics/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_create_topic: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/topics', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_update_topic: async (args: any) => {
    try {
      const { id, ...updateData } = args;
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/topics/${id}`, updateData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_delete_topic: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/topics/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Reports
  fc_list_reports: async (args: any) => {
    try {
      const params: any = { per_page: args.limit || 50 };
      if (args.status) params.status = args.status;
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/moderation/reports', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_create_report: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/moderation/reports', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Scheduled Posts
  fc_list_scheduled_posts: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/scheduled-posts', { per_page: args.limit || 50 });
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },
};


