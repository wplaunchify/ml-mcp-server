import { z } from 'zod';
import { makeWordPressRequest } from '../wordpress.js';

// ML Canvas Block Tools - Custom HTML/CSS Page Creation & Surgical Editing

export const mlCanvasTools = [
  {
    name: 'mlcanvas_create_page',
    description: 'Create a custom HTML/CSS page using ML Canvas Block. Perfect for landing pages, full-width designs, and custom layouts. No block recovery needed!',
    inputSchema: { type: 'object' as const, properties: z.object({
      title: z.string().describe('Page title (required)'),
      html: z.string().optional().describe('Custom HTML content'),
      css: z.string().optional().describe('Custom CSS styles'),
      hideHeader: z.boolean().optional().describe('Hide site header'),
      hideFooter: z.boolean().optional().describe('Hide site footer'),
      canvasMode: z.boolean().optional().describe('Full-width canvas mode (100% width, zero padding)'),
      hideTitle: z.boolean().optional().describe('Hide page title/hero section'),
      status: z.enum(['draft', 'publish']).optional().describe('Page status (default: draft)'),
    }).shape },
  },
  {
    name: 'mlcanvas_edit_page',
    description: 'Surgical editing for ML Canvas pages - find/replace specific HTML/CSS snippets without rewriting entire page. Works on ANY post type with ML Canvas block.',
    inputSchema: { type: 'object' as const, properties: z.object({
      page_id: z.number().describe('Page/Post ID to edit (required)'),
      find_html: z.string().optional().describe('HTML string to find and replace'),
      replace_html: z.string().optional().describe('New HTML to replace with'),
      find_css: z.string().optional().describe('CSS string to find and replace'),
      replace_css: z.string().optional().describe('New CSS to replace with'),
    }).shape },
  },
  {
    name: 'mlcanvas_get_docs',
    description: 'Get ML Canvas Block API documentation',
    inputSchema: { type: 'object' as const, properties: {} },
  },
];

export const mlCanvasHandlers = {
  mlcanvas_create_page: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/canvas/create-page', args);
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
            text: `Error creating canvas page: ${error.message}`
          }]
        }
      };
    }
  },

  mlcanvas_edit_page: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/canvas/edit-page', args);
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
            text: `Error editing canvas page: ${error.message}`
          }]
        }
      };
    }
  },

  mlcanvas_get_docs: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/canvas/api-docs');
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
            text: `Error getting canvas docs: ${error.message}`
          }]
        }
      };
    }
  },
};

