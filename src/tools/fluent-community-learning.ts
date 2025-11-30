// src/tools/fluent-community-learning.ts
// COMM2 - Learning & Admin (36 tools)
// Use case: "I create courses, manage lessons, and configure community settings"

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { makeWordPressRequest } from '../wordpress.js';
import { z } from 'zod';

// ==================== SCHEMA DEFINITIONS ====================

// Courses
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

// Lessons
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

// Course Progress
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

// Quizzes
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

// Media
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

// Giphy
const searchGiphySchema = z.object({
  query: z.string().describe('Search query for GIFs'),
  limit: z.number().optional().default(20).describe('Number of GIFs to return')
});

// Webhooks
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

// Leaderboard
const getLeaderboardSchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'all_time']).optional().default('all_time').describe('Leaderboard period'),
  limit: z.number().optional().default(50).describe('Number of users to return')
});

const addPointsSchema = z.object({
  user_id: z.number().describe('User ID'),
  points: z.number().describe('Points to add'),
  reason: z.string().optional().describe('Reason for points')
});

// ==================== TOOL DEFINITIONS (36 tools) ====================

export const fluentCommunityLearningTools: Tool[] = [
  // Courses (5)
  { name: 'fc_list_courses', description: 'List all courses in FluentCommunity', inputSchema: { type: 'object', properties: listCoursesSchema.shape } },
  { name: 'fc_get_course', description: 'Get a specific course by ID', inputSchema: { type: 'object', properties: getCourseSchema.shape } },
  { name: 'fc_create_course', description: 'Create a new course', inputSchema: { type: 'object', properties: createCourseSchema.shape } },
  { name: 'fc_update_course', description: 'Update an existing course', inputSchema: { type: 'object', properties: updateCourseSchema.shape } },
  { name: 'fc_delete_course', description: 'Delete a course', inputSchema: { type: 'object', properties: deleteCourseSchema.shape } },
  
  // Lessons (5)
  { name: 'fc_list_lessons', description: 'List all lessons in a course', inputSchema: { type: 'object', properties: listLessonsSchema.shape } },
  { name: 'fc_get_lesson', description: 'Get a specific lesson by ID', inputSchema: { type: 'object', properties: getLessonSchema.shape } },
  { name: 'fc_create_lesson', description: 'Create a new lesson in a course', inputSchema: { type: 'object', properties: createLessonSchema.shape } },
  { name: 'fc_update_lesson', description: 'Update an existing lesson', inputSchema: { type: 'object', properties: updateLessonSchema.shape } },
  { name: 'fc_delete_lesson', description: 'Delete a lesson', inputSchema: { type: 'object', properties: deleteLessonSchema.shape } },
  
  // Course Progress (3)
  { name: 'fc_get_course_progress', description: 'Get course progress for a user', inputSchema: { type: 'object', properties: getCourseProgressSchema.shape } },
  { name: 'fc_update_course_progress', description: 'Update course progress (mark lesson completed)', inputSchema: { type: 'object', properties: updateCourseProgressSchema.shape } },
  { name: 'fc_get_my_courses', description: 'Get all courses the current user is enrolled in', inputSchema: { type: 'object', properties: getMyCoursesSchema.shape } },
  
  // Quizzes (5)
  { name: 'fc_list_quizzes', description: 'List quizzes for a course', inputSchema: { type: 'object', properties: listQuizzesSchema.shape } },
  { name: 'fc_get_quiz', description: 'Get a specific quiz by ID', inputSchema: { type: 'object', properties: getQuizSchema.shape } },
  { name: 'fc_create_quiz', description: 'Create a new quiz in a course', inputSchema: { type: 'object', properties: createQuizSchema.shape } },
  { name: 'fc_update_quiz', description: 'Update an existing quiz', inputSchema: { type: 'object', properties: updateQuizSchema.shape } },
  { name: 'fc_delete_quiz', description: 'Delete a quiz', inputSchema: { type: 'object', properties: deleteQuizSchema.shape } },
  
  // Media (3)
  { name: 'fc_list_media', description: 'List media items', inputSchema: { type: 'object', properties: listMediaSchema.shape } },
  { name: 'fc_upload_media', description: 'Upload media file', inputSchema: { type: 'object', properties: uploadMediaSchema.shape } },
  { name: 'fc_sideload_media', description: 'Download image from any URL and upload to FluentCommunity media system. REQUIRED for setting space logo/cover_photo - FluentCommunity only accepts images from its own media table. Returns URL that works with fc_update_space.', inputSchema: { type: 'object', properties: sideloadMediaSchema.shape } },
  
  // Giphy (1)
  { name: 'fc_search_giphy', description: 'Search Giphy for GIFs', inputSchema: { type: 'object', properties: searchGiphySchema.shape } },
  
  // Webhooks (3)
  { name: 'fc_list_webhooks', description: 'List all webhooks', inputSchema: { type: 'object', properties: listWebhooksSchema.shape } },
  { name: 'fc_create_webhook', description: 'Create a new webhook', inputSchema: { type: 'object', properties: createWebhookSchema.shape } },
  { name: 'fc_delete_webhook', description: 'Delete a webhook', inputSchema: { type: 'object', properties: deleteWebhookSchema.shape } },
  
  // Leaderboard & Points (2)
  { name: 'fc_get_leaderboard', description: 'Get the community leaderboard', inputSchema: { type: 'object', properties: getLeaderboardSchema.shape } },
  { name: 'fc_add_points', description: 'Add points to a user', inputSchema: { type: 'object', properties: addPointsSchema.shape } },
];

// Note: Admin tools (fc_cleanup_members, fc_list_terms) are in fluent-community-admin.ts
// Note: Design tools (colors, portal, branding) are in fluent-community-design.ts  
// Note: Layout tools are in fluent-community-layout.ts
// These are automatically included when using fluentcommunity-learning

// ==================== HANDLERS ====================

export const fluentCommunityLearningHandlers = {
  // Courses
  fc_list_courses: async (args: any) => {
    try {
      const params: any = { per_page: args.limit || 20 };
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
      const courseData: any = { title: args.title, space_id: args.space_id, status: args.status || 'draft' };
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

  // Lessons
  fc_list_lessons: async (args: any) => {
    try {
      const params: any = { per_page: args.limit || 50 };
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
      const lessonData: any = { title: args.title, content: args.content, type: args.type || 'lesson' };
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

  // Course Progress
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
      const progressData: any = { lesson_id: args.lesson_id, status: args.status };
      if (args.user_id) progressData.user_id = args.user_id;
      const response = await makeWordPressRequest('POST', `fc-manager/v1/courses/${args.course_id}/progress`, progressData);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  fc_get_my_courses: async (args: any) => {
    try {
      const params: any = { per_page: args.limit || 20 };
      if (args.status) params.status = args.status;
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/courses/my-courses', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Quizzes
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

  // Media
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

  // Giphy
  fc_search_giphy: async (args: any) => {
    try {
      const params: any = { query: args.query, limit: args.limit || 20 };
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/giphy/search', params);
      return { toolResult: { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] } };
    } catch (error: any) {
      return { toolResult: { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] } };
    }
  },

  // Webhooks
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

  // Leaderboard
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


