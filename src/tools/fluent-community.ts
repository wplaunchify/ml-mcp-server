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
  privacy: z.enum(['public', 'private', 'friends']).optional().default('public').describe('Post privacy setting'),
  use_html5_bypass: z.boolean().optional().describe('Enable HTML5 bypass mode for full HTML/CSS/iframe support (bypasses markdown processing)'),
  bypass_sanitization: z.boolean().optional().describe('Alias for use_html5_bypass - bypasses sanitization for full HTML5 support')
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

const registerMemberSchema = z.object({
  user_id: z.number().describe('The WordPress user ID to register in FluentCommunity'),
  status: z.enum(['active', 'inactive']).optional().default('active').describe('Member status'),
  avatar: z.string().optional().describe('Avatar URL'),
  cover_photo: z.string().optional().describe('Cover photo URL')
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

// Course Management Schemas
const listCoursesSchema = z.object({
  space_id: z.number().optional().describe('Filter courses by space ID'),
  status: z.enum(['published', 'draft', 'archived']).optional().describe('Filter by status'),
  limit: z.number().optional().default(20).describe('Number of courses to return'),
  search: z.string().optional().describe('Search term')
});

const getCourseSchema = z.object({
  id: z.number().describe('The ID of the course to retrieve')
});

const createCourseSchema = z.object({
  title: z.string().describe('Course title'),
  space_id: z.number().describe('The space ID where the course will be created'),
  description: z.string().optional().describe('Course description'),
  featured_image: z.string().optional().describe('Featured image URL'),
  status: z.enum(['published', 'draft']).optional().default('draft').describe('Course status'),
  settings: z.object({
    enrollment_type: z.enum(['open', 'approval', 'closed']).optional(),
    certificate_enabled: z.boolean().optional(),
    drip_enabled: z.boolean().optional()
  }).optional().describe('Course settings')
});

const updateCourseSchema = z.object({
  id: z.number().describe('The ID of the course to update'),
  title: z.string().optional().describe('Course title'),
  description: z.string().optional().describe('Course description'),
  featured_image: z.string().optional().describe('Featured image URL'),
  status: z.enum(['published', 'draft', 'archived']).optional().describe('Course status'),
  settings: z.object({
    enrollment_type: z.enum(['open', 'approval', 'closed']).optional(),
    certificate_enabled: z.boolean().optional(),
    drip_enabled: z.boolean().optional()
  }).optional().describe('Course settings')
});

const deleteCourseSchema = z.object({
  id: z.number().describe('The ID of the course to delete')
});

// Lesson Management Schemas
const listLessonsSchema = z.object({
  course_id: z.number().describe('The course ID to list lessons from'),
  limit: z.number().optional().default(50).describe('Number of lessons to return')
});

const getLessonSchema = z.object({
  course_id: z.number().describe('The course ID'),
  id: z.number().describe('The ID of the lesson to retrieve')
});

const createLessonSchema = z.object({
  course_id: z.number().describe('The course ID where the lesson will be created'),
  title: z.string().describe('Lesson title'),
  content: z.string().describe('Lesson content (HTML supported)'),
  order: z.number().optional().describe('Lesson order/position'),
  type: z.enum(['lesson', 'quiz', 'assignment']).optional().default('lesson').describe('Lesson type'),
  settings: z.object({
    video_url: z.string().optional(),
    duration: z.number().optional(),
    downloadable: z.boolean().optional()
  }).optional().describe('Lesson settings')
});

const updateLessonSchema = z.object({
  course_id: z.number().describe('The course ID'),
  id: z.number().describe('The ID of the lesson to update'),
  title: z.string().optional().describe('Lesson title'),
  content: z.string().optional().describe('Lesson content (HTML supported)'),
  order: z.number().optional().describe('Lesson order/position'),
  type: z.enum(['lesson', 'quiz', 'assignment']).optional().describe('Lesson type'),
  settings: z.object({
    video_url: z.string().optional(),
    duration: z.number().optional(),
    downloadable: z.boolean().optional()
  }).optional().describe('Lesson settings')
});

const deleteLessonSchema = z.object({
  course_id: z.number().describe('The course ID'),
  id: z.number().describe('The ID of the lesson to delete')
});

// Course Progress Schemas
const getCourseProgressSchema = z.object({
  course_id: z.number().describe('The course ID to get progress for'),
  user_id: z.number().optional().describe('User ID (defaults to current user)')
});

const updateCourseProgressSchema = z.object({
  course_id: z.number().describe('The course ID'),
  lesson_id: z.number().describe('The lesson ID to mark progress for'),
  status: z.enum(['completed', 'in_progress']).describe('Progress status'),
  user_id: z.number().optional().describe('User ID (defaults to current user)')
});

const getMyCoursesSchema = z.object({
  status: z.enum(['enrolled', 'completed', 'in_progress']).optional().describe('Filter by enrollment status'),
  limit: z.number().optional().default(20).describe('Number of courses to return')
});

// Quiz Schemas
const listQuizzesSchema = z.object({
  course_id: z.number().describe('The course ID'),
  limit: z.number().optional().default(50).describe('Number of quizzes to return')
});

const getQuizSchema = z.object({
  course_id: z.number().describe('The course ID'),
  id: z.number().describe('The quiz ID')
});

const createQuizSchema = z.object({
  course_id: z.number().describe('The course ID'),
  title: z.string().describe('Quiz title'),
  questions: z.array(z.object({
    question: z.string(),
    answers: z.array(z.string()),
    correct_answer: z.number()
  })).describe('Quiz questions'),
  passing_score: z.number().optional().describe('Passing score percentage')
});

const updateQuizSchema = z.object({
  course_id: z.number().describe('The course ID'),
  id: z.number().describe('The quiz ID'),
  title: z.string().optional().describe('Quiz title'),
  questions: z.array(z.object({
    question: z.string(),
    answers: z.array(z.string()),
    correct_answer: z.number()
  })).optional().describe('Quiz questions'),
  passing_score: z.number().optional().describe('Passing score percentage')
});

const deleteQuizSchema = z.object({
  course_id: z.number().describe('The course ID'),
  id: z.number().describe('The quiz ID')
});

// Profile Schemas
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

// Space Group Schemas
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

// Activities Schema
const listActivitiesSchema = z.object({
  user_id: z.number().optional().describe('Filter by user ID'),
  limit: z.number().optional().default(50).describe('Number of activities to return')
});

// Reactions Schemas
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

// Bookmarks Schemas
const listBookmarksSchema = z.object({
  limit: z.number().optional().default(50).describe('Number of bookmarks to return')
});

const addBookmarkSchema = z.object({
  post_id: z.number().describe('Post ID to bookmark')
});

const removeBookmarkSchema = z.object({
  id: z.number().describe('Bookmark ID to remove')
});

// Notifications Schemas
const listNotificationsSchema = z.object({
  unread_only: z.boolean().optional().describe('Show only unread notifications'),
  limit: z.number().optional().default(50).describe('Number of notifications to return')
});

// Media Schemas
const listMediaSchema = z.object({
  limit: z.number().optional().default(50).describe('Number of media items to return')
});

const uploadMediaSchema = z.object({
  file_url: z.string().describe('URL of file to upload'),
  file_name: z.string().optional().describe('File name')
});

const sideloadMediaSchema = z.object({
  url: z.string().describe('URL of image to download and upload to FluentCommunity. Use this to set space logo/cover_photo - FluentCommunity only accepts images from its own media system.'),
  context: z.string().optional().default('space').describe('Context for the media (space, profile, post). Default: space')
});

// Giphy Schema
const searchGiphySchema = z.object({
  query: z.string().describe('Search query for GIFs'),
  limit: z.number().optional().default(20).describe('Number of GIFs to return')
});

// Followers Schemas (Pro)
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

// Moderation Schemas (Pro)
const listReportsSchema = z.object({
  status: z.enum(['pending', 'resolved', 'dismissed']).optional().describe('Filter by status'),
  limit: z.number().optional().default(50).describe('Number of reports to return')
});

const createReportSchema = z.object({
  content_id: z.number().describe('Content ID being reported'),
  content_type: z.enum(['post', 'comment', 'user']).describe('Type of content'),
  reason: z.string().describe('Reason for report')
});

// Topics Schemas (Pro)
const listTopicsSchema = z.object({
  limit: z.number().optional().default(50).describe('Number of topics to return')
});

const getTopicSchema = z.object({
  id: z.number().describe('Topic ID')
});

const createTopicSchema = z.object({
  title: z.string().describe('Topic title'),
  description: z.string().optional().describe('Topic description'),
  icon: z.string().optional().describe('Topic icon')
});

const updateTopicSchema = z.object({
  id: z.number().describe('Topic ID'),
  title: z.string().optional().describe('Topic title'),
  description: z.string().optional().describe('Topic description'),
  icon: z.string().optional().describe('Topic icon')
});

const deleteTopicSchema = z.object({
  id: z.number().describe('Topic ID')
});

// Webhooks Schemas (Pro)
const listWebhooksSchema = z.object({
  limit: z.number().optional().default(50).describe('Number of webhooks to return')
});

const createWebhookSchema = z.object({
  url: z.string().describe('Webhook URL'),
  events: z.array(z.string()).describe('Events to trigger webhook'),
  secret: z.string().optional().describe('Webhook secret for verification')
});

const deleteWebhookSchema = z.object({
  id: z.number().describe('Webhook ID')
});

// Scheduled Posts Schema (Pro)
const listScheduledPostsSchema = z.object({
  limit: z.number().optional().default(50).describe('Number of scheduled posts to return')
});

// Managers Schemas (Pro)
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

// Leaderboard Schemas (Pro)
const getLeaderboardSchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'all_time']).optional().default('all_time').describe('Leaderboard period'),
  limit: z.number().optional().default(50).describe('Number of users to return')
});

const addPointsSchema = z.object({
  user_id: z.number().describe('User ID'),
  points: z.number().describe('Points to add'),
  reason: z.string().optional().describe('Reason for points')
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
    description: 'Create a new space in FluentCommunity. IMPORTANT: For logo/cover_photo, you MUST first use fc_sideload_media to upload the image - regular URLs will be silently ignored!',
    inputSchema: { type: 'object', properties: createSpaceSchema.shape }
  },
  {
    name: 'fc_update_space',
    description: 'Update an existing FluentCommunity space. IMPORTANT: For logo/cover_photo, you MUST first use fc_sideload_media to upload the image - regular URLs will be silently ignored!',
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
  {
    name: 'fc_register_member',
    description: 'Register a WordPress user in FluentCommunity (creates XProfile entry so they appear in Members directory)',
    inputSchema: { type: 'object', properties: registerMemberSchema.shape }
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
  
  // ==================== COURSE MANAGEMENT ====================
  {
    name: 'fc_list_courses',
    description: 'List all courses in FluentCommunity (supports filtering by space, status, search)',
    inputSchema: { type: 'object', properties: listCoursesSchema.shape }
  },
  {
    name: 'fc_get_course',
    description: 'Get a specific course by ID with full details',
    inputSchema: { type: 'object', properties: getCourseSchema.shape }
  },
  {
    name: 'fc_create_course',
    description: 'Create a new course in FluentCommunity (requires title and space_id)',
    inputSchema: { type: 'object', properties: createCourseSchema.shape }
  },
  {
    name: 'fc_update_course',
    description: 'Update an existing course (title, description, status, settings)',
    inputSchema: { type: 'object', properties: updateCourseSchema.shape }
  },
  {
    name: 'fc_delete_course',
    description: 'Delete a course from FluentCommunity',
    inputSchema: { type: 'object', properties: deleteCourseSchema.shape }
  },
  
  // ==================== LESSON MANAGEMENT ====================
  {
    name: 'fc_list_lessons',
    description: 'List all lessons in a specific course',
    inputSchema: { type: 'object', properties: listLessonsSchema.shape }
  },
  {
    name: 'fc_get_lesson',
    description: 'Get a specific lesson by ID with full content',
    inputSchema: { type: 'object', properties: getLessonSchema.shape }
  },
  {
    name: 'fc_create_lesson',
    description: 'Create a new lesson in a course (supports HTML content, video embeds)',
    inputSchema: { type: 'object', properties: createLessonSchema.shape }
  },
  {
    name: 'fc_update_lesson',
    description: 'Update an existing lesson (content, title, order, settings)',
    inputSchema: { type: 'object', properties: updateLessonSchema.shape }
  },
  {
    name: 'fc_delete_lesson',
    description: 'Delete a lesson from a course',
    inputSchema: { type: 'object', properties: deleteLessonSchema.shape }
  },
  
  // ==================== COURSE PROGRESS ====================
  {
    name: 'fc_get_course_progress',
    description: 'Get course progress for a user (completed lessons, scores, etc.)',
    inputSchema: { type: 'object', properties: getCourseProgressSchema.shape }
  },
  {
    name: 'fc_update_course_progress',
    description: 'Update course progress (mark lesson as completed or in progress)',
    inputSchema: { type: 'object', properties: updateCourseProgressSchema.shape }
  },
  {
    name: 'fc_get_my_courses',
    description: 'Get all courses the current user is enrolled in',
    inputSchema: { type: 'object', properties: getMyCoursesSchema.shape }
  },

  // ==================== QUIZZES ====================
  {
    name: 'fc_list_quizzes',
    description: 'List quizzes for a specific course',
    inputSchema: { type: 'object', properties: listQuizzesSchema.shape }
  },
  {
    name: 'fc_get_quiz',
    description: 'Get a specific quiz by ID',
    inputSchema: { type: 'object', properties: getQuizSchema.shape }
  },
  {
    name: 'fc_create_quiz',
    description: 'Create a new quiz in a course',
    inputSchema: { type: 'object', properties: createQuizSchema.shape }
  },
  {
    name: 'fc_update_quiz',
    description: 'Update an existing quiz',
    inputSchema: { type: 'object', properties: updateQuizSchema.shape }
  },
  {
    name: 'fc_delete_quiz',
    description: 'Delete a quiz',
    inputSchema: { type: 'object', properties: deleteQuizSchema.shape }
  },

  // ==================== PROFILES ====================
  {
    name: 'fc_list_profiles',
    description: 'List user profiles',
    inputSchema: { type: 'object', properties: listProfilesSchema.shape }
  },
  {
    name: 'fc_get_profile',
    description: 'Get a specific user profile',
    inputSchema: { type: 'object', properties: getProfileSchema.shape }
  },
  {
    name: 'fc_update_profile',
    description: 'Update a user profile',
    inputSchema: { type: 'object', properties: updateProfileSchema.shape }
  },

  // ==================== SPACE GROUPS ====================
  {
    name: 'fc_list_space_groups',
    description: 'List all space groups',
    inputSchema: { type: 'object', properties: listSpaceGroupsSchema.shape }
  },
  {
    name: 'fc_get_space_group',
    description: 'Get a specific space group',
    inputSchema: { type: 'object', properties: getSpaceGroupSchema.shape }
  },
  {
    name: 'fc_create_space_group',
    description: 'Create a new space group',
    inputSchema: { type: 'object', properties: createSpaceGroupSchema.shape }
  },
  {
    name: 'fc_update_space_group',
    description: 'Update a space group',
    inputSchema: { type: 'object', properties: updateSpaceGroupSchema.shape }
  },
  {
    name: 'fc_delete_space_group',
    description: 'Delete a space group',
    inputSchema: { type: 'object', properties: deleteSpaceGroupSchema.shape }
  },

  // ==================== ACTIVITIES ====================
  {
    name: 'fc_list_activities',
    description: 'List user activities',
    inputSchema: { type: 'object', properties: listActivitiesSchema.shape }
  },

  // ==================== REACTIONS ====================
  {
    name: 'fc_list_reactions',
    description: 'List reactions on posts',
    inputSchema: { type: 'object', properties: listReactionsSchema.shape }
  },
  {
    name: 'fc_add_reaction',
    description: 'Add a reaction to a post',
    inputSchema: { type: 'object', properties: addReactionSchema.shape }
  },
  {
    name: 'fc_remove_reaction',
    description: 'Remove a reaction',
    inputSchema: { type: 'object', properties: removeReactionSchema.shape }
  },

  // ==================== BOOKMARKS ====================
  {
    name: 'fc_list_bookmarks',
    description: 'List user bookmarks',
    inputSchema: { type: 'object', properties: listBookmarksSchema.shape }
  },
  {
    name: 'fc_add_bookmark',
    description: 'Add a bookmark',
    inputSchema: { type: 'object', properties: addBookmarkSchema.shape }
  },
  {
    name: 'fc_remove_bookmark',
    description: 'Remove a bookmark',
    inputSchema: { type: 'object', properties: removeBookmarkSchema.shape }
  },

  // ==================== NOTIFICATIONS ====================
  {
    name: 'fc_list_notifications',
    description: 'List user notifications',
    inputSchema: { type: 'object', properties: listNotificationsSchema.shape }
  },
  {
    name: 'fc_mark_notifications_read',
    description: 'Mark notifications as read',
    inputSchema: { type: 'object', properties: z.object({}).shape }
  },

  // ==================== MEDIA ====================
  {
    name: 'fc_list_media',
    description: 'List media items',
    inputSchema: { type: 'object', properties: listMediaSchema.shape }
  },
  {
    name: 'fc_upload_media',
    description: 'Upload media file',
    inputSchema: { type: 'object', properties: uploadMediaSchema.shape }
  },
  {
    name: 'fc_sideload_media',
    description: 'Download image from any URL and upload to FluentCommunity media system. REQUIRED for setting space logo/cover_photo - FluentCommunity only accepts images from its own media table. Returns URL that works with fc_update_space.',
    inputSchema: { type: 'object', properties: sideloadMediaSchema.shape }
  },

  // ==================== GIPHY ====================
  {
    name: 'fc_search_giphy',
    description: 'Search Giphy for GIFs',
    inputSchema: { type: 'object', properties: searchGiphySchema.shape }
  },

  // ==================== FOLLOWERS (PRO) ====================
  {
    name: 'fc_list_followers',
    description: 'List followers for a user',
    inputSchema: { type: 'object', properties: listFollowersSchema.shape }
  },
  {
    name: 'fc_follow_user',
    description: 'Follow a user',
    inputSchema: { type: 'object', properties: followUserSchema.shape }
  },
  {
    name: 'fc_unfollow_user',
    description: 'Unfollow a user',
    inputSchema: { type: 'object', properties: unfollowUserSchema.shape }
  },

  // ==================== MODERATION (PRO) ====================
  {
    name: 'fc_list_reports',
    description: 'List moderation reports',
    inputSchema: { type: 'object', properties: listReportsSchema.shape }
  },
  {
    name: 'fc_create_report',
    description: 'Create a moderation report',
    inputSchema: { type: 'object', properties: createReportSchema.shape }
  },

  // ==================== TOPICS (PRO) ====================
  {
    name: 'fc_list_topics',
    description: 'List all topics',
    inputSchema: { type: 'object', properties: listTopicsSchema.shape }
  },
  {
    name: 'fc_get_topic',
    description: 'Get a specific topic',
    inputSchema: { type: 'object', properties: getTopicSchema.shape }
  },
  {
    name: 'fc_create_topic',
    description: 'Create a new topic',
    inputSchema: { type: 'object', properties: createTopicSchema.shape }
  },
  {
    name: 'fc_update_topic',
    description: 'Update a topic',
    inputSchema: { type: 'object', properties: updateTopicSchema.shape }
  },
  {
    name: 'fc_delete_topic',
    description: 'Delete a topic',
    inputSchema: { type: 'object', properties: deleteTopicSchema.shape }
  },

  // ==================== WEBHOOKS (PRO) ====================
  {
    name: 'fc_list_webhooks',
    description: 'List all webhooks',
    inputSchema: { type: 'object', properties: listWebhooksSchema.shape }
  },
  {
    name: 'fc_create_webhook',
    description: 'Create a new webhook',
    inputSchema: { type: 'object', properties: createWebhookSchema.shape }
  },
  {
    name: 'fc_delete_webhook',
    description: 'Delete a webhook',
    inputSchema: { type: 'object', properties: deleteWebhookSchema.shape }
  },

  // ==================== SCHEDULED POSTS (PRO) ====================
  {
    name: 'fc_list_scheduled_posts',
    description: 'List scheduled posts',
    inputSchema: { type: 'object', properties: listScheduledPostsSchema.shape }
  },

  // ==================== MANAGERS (PRO) ====================
  {
    name: 'fc_list_managers',
    description: 'List community managers',
    inputSchema: { type: 'object', properties: listManagersSchema.shape }
  },
  {
    name: 'fc_add_manager',
    description: 'Add a community manager',
    inputSchema: { type: 'object', properties: addManagerSchema.shape }
  },
  {
    name: 'fc_remove_manager',
    description: 'Remove a community manager',
    inputSchema: { type: 'object', properties: removeManagerSchema.shape }
  },

  // ==================== LEADERBOARD (PRO) ====================
  {
    name: 'fc_get_leaderboard',
    description: 'Get the community leaderboard',
    inputSchema: { type: 'object', properties: getLeaderboardSchema.shape }
  },
  {
    name: 'fc_add_points',
    description: 'Add points to a user',
    inputSchema: { type: 'object', properties: addPointsSchema.shape }
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
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/spaces/${space_id}`, updateData);
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

  fc_register_member: async (args: any) => {
    try {
      const memberData: any = {
        user_id: args.user_id
      };
      
      if (args.status) memberData.status = args.status;
      if (args.avatar) memberData.avatar = args.avatar;
      if (args.cover_photo) memberData.cover_photo = args.cover_photo;
      
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/members/register', memberData);
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

  // ==================== COURSE MANAGEMENT HANDLERS ====================
  fc_list_courses: async (args: any) => {
    try {
      const params: any = {
        per_page: args.limit || 20
      };
      
      if (args.space_id) params.space_id = args.space_id;
      if (args.status) params.status = args.status;
      if (args.search) params.search = args.search;
      
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/courses', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_get_course: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/courses/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_create_course: async (args: any) => {
    try {
      const courseData: any = {
        title: args.title,
        space_id: args.space_id,
        status: args.status || 'draft'
      };
      
      if (args.description) courseData.description = args.description;
      if (args.featured_image) courseData.featured_image = args.featured_image;
      if (args.settings) courseData.settings = args.settings;
      
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/courses', courseData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_update_course: async (args: any) => {
    try {
      const { id, ...updateData } = args;
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/courses/${id}`, updateData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_delete_course: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/courses/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // ==================== LESSON MANAGEMENT HANDLERS ====================
  fc_list_lessons: async (args: any) => {
    try {
      const params: any = {
        per_page: args.limit || 50
      };
      
      const response = await makeWordPressRequest('GET', `fc-manager/v1/courses/${args.course_id}/lessons`, params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_get_lesson: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/courses/${args.course_id}/lessons/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_create_lesson: async (args: any) => {
    try {
      const lessonData: any = {
        title: args.title,
        content: args.content,
        type: args.type || 'lesson'
      };
      
      if (args.order) lessonData.order = args.order;
      if (args.settings) lessonData.settings = args.settings;
      
      const response = await makeWordPressRequest('POST', `fc-manager/v1/courses/${args.course_id}/lessons`, lessonData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_update_lesson: async (args: any) => {
    try {
      const { course_id, id, ...updateData } = args;
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/courses/${course_id}/lessons/${id}`, updateData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_delete_lesson: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/courses/${args.course_id}/lessons/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // ==================== COURSE PROGRESS HANDLERS ====================
  fc_get_course_progress: async (args: any) => {
    try {
      const params: any = {};
      if (args.user_id) params.user_id = args.user_id;
      
      const response = await makeWordPressRequest('GET', `fc-manager/v1/courses/${args.course_id}/progress`, params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_update_course_progress: async (args: any) => {
    try {
      const progressData: any = {
        lesson_id: args.lesson_id,
        status: args.status
      };
      
      if (args.user_id) progressData.user_id = args.user_id;
      
      const response = await makeWordPressRequest('POST', `fc-manager/v1/courses/${args.course_id}/progress`, progressData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_get_my_courses: async (args: any) => {
    try {
      const params: any = {
        per_page: args.limit || 20
      };
      
      if (args.status) params.status = args.status;
      
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/courses/my-courses', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // ==================== QUIZ HANDLERS ====================
  fc_list_quizzes: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/courses/${args.course_id}/quizzes`, { per_page: args.limit || 50 });
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_get_quiz: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `fc-manager/v1/courses/${args.course_id}/quizzes/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_create_quiz: async (args: any) => {
    try {
      const { course_id, ...quizData } = args;
      const response = await makeWordPressRequest('POST', `fc-manager/v1/courses/${course_id}/quizzes`, quizData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_update_quiz: async (args: any) => {
    try {
      const { course_id, id, ...updateData } = args;
      const response = await makeWordPressRequest('PUT', `fc-manager/v1/courses/${course_id}/quizzes/${id}`, updateData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_delete_quiz: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/courses/${args.course_id}/quizzes/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // ==================== PROFILE HANDLERS ====================
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

  // ==================== SPACE GROUP HANDLERS ====================
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

  // ==================== ACTIVITY HANDLERS ====================
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

  // ==================== REACTION HANDLERS ====================
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

  // ==================== BOOKMARK HANDLERS ====================
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

  // ==================== NOTIFICATION HANDLERS ====================
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

  // ==================== MEDIA HANDLERS ====================
  fc_list_media: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/media', { per_page: args.limit || 50 });
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_upload_media: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/media', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_sideload_media: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/media/sideload', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // ==================== GIPHY HANDLERS ====================
  fc_search_giphy: async (args: any) => {
    try {
      const params: any = { query: args.query, limit: args.limit || 20 };
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/giphy/search', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // ==================== FOLLOWER HANDLERS (PRO) ====================
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

  // ==================== MODERATION HANDLERS (PRO) ====================
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

  // ==================== TOPIC HANDLERS (PRO) ====================
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

  // ==================== WEBHOOK HANDLERS (PRO) ====================
  fc_list_webhooks: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/webhooks', { per_page: args.limit || 50 });
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_create_webhook: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/webhooks', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_delete_webhook: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `fc-manager/v1/webhooks/${args.id}`);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // ==================== SCHEDULED POST HANDLERS (PRO) ====================
  fc_list_scheduled_posts: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/scheduled-posts', { per_page: args.limit || 50 });
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // ==================== MANAGER HANDLERS (PRO) ====================
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

  // ==================== LEADERBOARD HANDLERS (PRO) ====================
  fc_get_leaderboard: async (args: any) => {
    try {
      const params: any = { per_page: args.limit || 50 };
      if (args.period) params.period = args.period;
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/leaderboard', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_add_points: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/leaderboard/points', args);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },
};

