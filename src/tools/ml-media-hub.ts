/**
 * ML Media Hub P2P Tools
 * 
 * Provides 10 core tools for image search, icon import, and media management:
 * - Google Images search via SERP API
 * - Noun Project icon search and import
 * - Media library management with custom categories
 * - Hotlink support for fast imports
 * 
 * API Namespace: /mediahub/v1/
 * Plugin Version: 3.9.0+
 * 
 * NOTE: Requires ML Media Hub P2P plugin installed and activated
 */

import { z } from 'zod';
import { makeWordPressRequest } from '../wordpress.js';

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================

export const mlMediaHubTools = [
  {
    name: 'mlmh_search_images',
    description: 'Search Google Images via SERP API. Returns image results with URLs, thumbnails, dimensions, and sources ready for import to WordPress media library. Requires SERP API key configured in ML Media Hub settings.',
    inputSchema: { type: 'object' as const, properties: z.object({
      query: z.string().describe('Search query for images (e.g., "sunset beach", "coffee cup photos", "business team meeting")'),
      num: z.number().optional().default(10).describe('Number of results to return (1-50)'),
      size: z.enum(['large', 'medium', 'icon']).optional().describe('Image size filter'),
      types: z.enum(['photo', 'clipart', 'lineart', 'animated']).optional().describe('Image type filter'),
      license: z.enum(['creative_commons', 'public_domain']).optional().describe('License filter for copyright-free images')
    }).shape }
  },
  
  {
    name: 'mlmh_import_images',
    description: 'Import images from search results to WordPress media library. Can import as hotlinks (fast, external hosting) or download locally (slower, permanent). Optionally assign to media category for organization.',
    inputSchema: { type: 'object' as const, properties: z.object({
      images: z.array(z.object({
        url: z.string().describe('Image URL'),
        title: z.string().describe('Image title'),
        source: z.string().optional().describe('Image source'),
        thumbnail: z.string().optional().describe('Thumbnail URL')
      })).describe('Array of image objects from mlmh_search_images results'),
      category_id: z.number().optional().describe('Media category ID to assign imported images to (get from mlmh_list_categories)'),
      search_term: z.string().optional().describe('Original search term for metadata tracking'),
      is_hotlink: z.boolean().optional().default(false).describe('Import as hotlink (true = fast, external hosting) or download locally (false = slower, permanent storage)')
    }).shape }
  },
  
  {
    name: 'mlmh_search_icons',
    description: 'Search Noun Project icon database. Returns icon results with preview URLs, attribution info, and metadata. Requires Noun Project API credentials configured in ML Media Hub settings.',
    inputSchema: { type: 'object' as const, properties: z.object({
      query: z.string().describe('Search term for icons (e.g., "home", "user profile", "settings gear", "shopping cart")'),
      limit: z.number().optional().default(20).describe('Number of results to return'),
      filters: z.object({
        public_domain_only: z.boolean().optional().describe('Only return public domain icons'),
        license: z.string().optional().describe('License type filter'),
        styles: z.array(z.string()).optional().describe('Style filters (e.g., ["outline", "filled"])'),
        sort: z.enum(['relevance', 'popularity', 'newest']).optional().describe('Sort order for results')
      }).optional().describe('Optional filters for icon search')
    }).shape }
  },
  
  {
    name: 'mlmh_import_icon',
    description: 'Import a Noun Project icon to WordPress media library. Includes proper attribution and metadata for licensing compliance.',
    inputSchema: { type: 'object' as const, properties: z.object({
      icon_id: z.string().describe('Noun Project icon ID from mlmh_search_icons results'),
      icon_url: z.string().describe('Icon preview/download URL from search results'),
      icon_name: z.string().describe('Icon name/title from search results'),
      attribution: z.string().optional().describe('Attribution text for the icon creator (from search results)'),
      category_id: z.number().optional().describe('Media category ID to assign icon to')
    }).shape }
  },
  
  {
    name: 'mlmh_list_media',
    description: 'List WordPress media library items with filtering by category, search term, and pagination. Shows media URLs, thumbnails, categories, and metadata.',
    inputSchema: { type: 'object' as const, properties: z.object({
      per_page: z.number().optional().default(20).describe('Items per page'),
      page: z.number().optional().default(1).describe('Page number for pagination'),
      category_id: z.number().optional().describe('Filter by media category ID'),
      search: z.string().optional().describe('Search term for media titles')
    }).shape }
  },
  
  {
    name: 'mlmh_list_categories',
    description: 'List all custom media categories created by ML Media Hub. These are separate from WordPress post categories and used specifically for organizing media library items. Public endpoint, no authentication required.',
    inputSchema: { type: 'object' as const, properties: {} }
  },
  
  {
    name: 'mlmh_create_category',
    description: 'Create a new custom media category for organizing media library items. Categories help organize imported images and icons.',
    inputSchema: { type: 'object' as const, properties: z.object({
      name: z.string().describe('Category name (e.g., "Product Photos", "Social Media Graphics", "Icons")'),
      slug: z.string().optional().describe('Category slug (URL-friendly name, auto-generated if not provided)'),
      description: z.string().optional().describe('Category description')
    }).shape }
  },
  
  {
    name: 'mlmh_get_settings',
    description: 'Get ML Media Hub plugin configuration status including API key configuration, media counts, and plugin version. Useful for troubleshooting and verifying setup.',
    inputSchema: { type: 'object' as const, properties: {} }
  },
  
  {
    name: 'mlmh_update_settings',
    description: 'Update ML Media Hub API keys and settings. Requires admin (manage_options) capability. Use this to configure SERP API key for image search and Noun Project credentials for icon search.',
    inputSchema: { type: 'object' as const, properties: z.object({
      serpapi_key: z.string().optional().describe('SERP API key for Google Images search (get from https://serpapi.com)'),
      noun_api_key: z.string().optional().describe('Noun Project API key (get from https://thenounproject.com/developers)'),
      noun_api_secret: z.string().optional().describe('Noun Project API secret')
    }).shape }
  },
  
  {
    name: 'mlmh_get_info',
    description: 'Get complete API documentation for ML Media Hub including all endpoints, authentication methods, parameters, and usage examples. Self-documenting endpoint. Public, no authentication required.',
    inputSchema: { type: 'object' as const, properties: {} }
  }
  
  // NOTE: Advanced search/preset/collection tools removed - require plugin endpoints not yet implemented
  // To add: /search-images-advanced, /noun-search-advanced, /presets, /noun-collections, /noun-collection-icons
];

// ============================================================================
// TOOL HANDLERS
// ============================================================================

export const mlMediaHubHandlers = {
  // All handlers now use FluentMCP proxy at fc-manager/v1/mediahub/* for unified authentication
  
  mlmh_search_images: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/mediahub/search-images', args);
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
            text: `Error searching images: ${error.message}`
          }]
        }
      };
    }
  },

  mlmh_import_images: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/mediahub/import-images', args);
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
            text: `Error importing images: ${error.message}`
          }]
        }
      };
    }
  },

  mlmh_search_icons: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/mediahub/search-icons', args);
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
            text: `Error searching icons: ${error.message}`
          }]
        }
      };
    }
  },

  mlmh_import_icon: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/mediahub/import-icon', args);
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
            text: `Error importing icon: ${error.message}`
          }]
        }
      };
    }
  },

  mlmh_list_media: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.per_page) params.append('per_page', args.per_page.toString());
      if (args.page) params.append('page', args.page.toString());
      if (args.category_id) params.append('category_id', args.category_id.toString());
      if (args.search) params.append('search', args.search);
      
      const query = params.toString();
      const response = await makeWordPressRequest('GET', `fc-manager/v1/mediahub/media${query ? '?' + query : ''}`);
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
            text: `Error listing media: ${error.message}`
          }]
        }
      };
    }
  },

  mlmh_list_categories: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/mediahub/categories');
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

  mlmh_create_category: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/mediahub/categories', args);
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
            text: `Error creating category: ${error.message}`
          }]
        }
      };
    }
  },

  mlmh_get_settings: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/mediahub/settings');
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
            text: `Error getting settings: ${error.message}`
          }]
        }
      };
    }
  },

  mlmh_update_settings: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'fc-manager/v1/mediahub/settings', args);
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
            text: `Error updating settings: ${error.message}`
          }]
        }
      };
    }
  },

  mlmh_get_info: async (args: any) => {
    try {
      const response = await makeWordPressRequest('GET', 'fc-manager/v1/mediahub/info');
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
            text: `Error getting API info: ${error.message}`
          }]
        }
      };
    }
  }
  
  // NOTE: Advanced handlers removed - require plugin endpoints not yet implemented
};

