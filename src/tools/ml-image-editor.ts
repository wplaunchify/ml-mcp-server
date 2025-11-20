import { z } from 'zod';
import { makeWordPressRequest } from '../wordpress.js';

// ML Image Editor Tools - AI Image Generation & Editing via Gemini 2.5 Flash

export const mlImageEditorTools = [
  {
    name: 'mlimg_generate',
    description: 'Generate new AI image from text prompt using Gemini 2.5 Flash. Perfect for creating custom images, illustrations, and visual content.',
    inputSchema: { type: 'object' as const, properties: z.object({
      prompt: z.string().describe('Text description of image to generate (required)'),
      aspectRatio: z.enum(['1:1', '4:3', '16:9', '9:16']).optional().describe('Image aspect ratio (default: 1:1)'),
      selectedImages: z.array(z.number()).optional().describe('Reference image attachment IDs'),
      externalImageUrl: z.string().optional().describe('External reference image URL'),
    }).shape },
  },
  {
    name: 'mlimg_edit',
    description: 'Edit existing image with AI. Modify colors, add elements, change styles, or transform existing images.',
    inputSchema: { type: 'object' as const, properties: z.object({
      imageId: z.number().describe('WordPress attachment ID to edit (required)'),
      prompt: z.string().describe('How to modify the image (required)'),
      preserveOriginal: z.boolean().optional().describe('Keep original image (default: true)'),
    }).shape },
  },
  {
    name: 'mlimg_iterate',
    description: 'Create variations of existing image. Generate multiple versions with different styles or modifications.',
    inputSchema: { type: 'object' as const, properties: z.object({
      imageId: z.number().describe('Base image attachment ID (required)'),
      prompt: z.string().describe('How to vary the image (required)'),
      iterationStrength: z.number().min(0).max(1).optional().describe('Variation strength 0-1 (default: 0.5)'),
      numberOfVariations: z.number().min(1).max(4).optional().describe('Number of variations 1-4 (default: 1)'),
    }).shape },
  },
  {
    name: 'mlimg_batch_generate',
    description: 'Generate multiple AI images in batch. Create multiple images from different prompts in one request.',
    inputSchema: { type: 'object' as const, properties: z.object({
      prompts: z.array(z.object({
        prompt: z.string().describe('Image description'),
        title: z.string().optional().describe('Image title'),
      })).describe('Array of prompts to generate (required)'),
      sharedSettings: z.object({
        aspectRatio: z.enum(['1:1', '4:3', '16:9', '9:16']).optional(),
      }).optional().describe('Settings applied to all generations'),
    }).shape },
  },
  {
    name: 'mlimg_list_images',
    description: 'List AI-generated/edited images. Filter by operation type, category, and more.',
    inputSchema: { type: 'object' as const, properties: z.object({
      operationType: z.enum(['generated', 'edited', 'iterated', 'all']).optional().describe('Filter by operation (default: all)'),
      category: z.string().optional().describe('Filter by media category'),
      perPage: z.number().min(1).max(100).optional().describe('Items per page (default: 20)'),
      page: z.number().min(1).optional().describe('Page number (default: 1)'),
      orderBy: z.enum(['date', 'title', 'modified']).optional().describe('Sort by (default: date)'),
      order: z.enum(['DESC', 'ASC']).optional().describe('Sort order (default: DESC)'),
    }).shape },
  },
  {
    name: 'mlimg_get_history',
    description: 'Get image generation/editing history for a specific image. See all operations performed on an image.',
    inputSchema: { type: 'object' as const, properties: z.object({
      id: z.number().describe('Attachment ID (required)'),
    }).shape },
  },
  {
    name: 'mlimg_list_categories',
    description: 'List media categories available for organizing AI-generated images.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'mlimg_health',
    description: 'Check ML Image Editor API health and configuration. Verify plugin is installed and API keys are configured.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
];

export const mlImageEditorHandlers = {
  mlimg_generate: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'ml-image/v1/generate', args);
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
            text: `Error generating image: ${error.message}`
          }]
        }
      };
    }
  },

  mlimg_edit: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'ml-image/v1/edit', args);
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
            text: `Error editing image: ${error.message}`
          }]
        }
      };
    }
  },

  mlimg_iterate: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'ml-image/v1/iterate', args);
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
            text: `Error iterating image: ${error.message}`
          }]
        }
      };
    }
  },

  mlimg_batch_generate: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'ml-image/v1/batch-generate', args);
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
            text: `Error batch generating images: ${error.message}`
          }]
        }
      };
    }
  },

  mlimg_list_images: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'ml-image/v1/ai-images', args);
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
            text: `Error listing images: ${error.message}`
          }]
        }
      };
    }
  },

  mlimg_get_history: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', `ml-image/v1/ai-images/${args.id}/history`);
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
            text: `Error getting image history: ${error.message}`
          }]
        }
      };
    }
  },

  mlimg_list_categories: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'ml-image/v1/categories');
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
            text: `Error listing categories: ${error.message}`
          }]
        }
      };
    }
  },

  mlimg_health: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'ml-image/v1/health');
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
            text: `Error checking ML Image Editor health: ${error.message}`
          }]
        }
      };
    }
  },
};





