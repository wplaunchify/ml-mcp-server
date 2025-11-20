/**
 * ML Media Hub P2P Tools
 * 
 * Provides 10 tools for image search, icon import, and media management:
 * - Google Images search via SERP API
 * - Noun Project icon search and import
 * - Media library management with custom categories
 * - Hotlink support for fast imports
 * 
 * API Namespace: /mediahub/v1/
 * Plugin Version: 3.8.0+
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
  },

  // ============================================================================
  // ADVANCED SEARCH & FILTER TOOLS (8 new tools)
  // ============================================================================

  {
    name: 'mlmh_advanced_image_search',
    description: 'Advanced Google Images search with comprehensive filters for size, color, type, license, aspect ratio, file format, and source domains. Provides fine-grained control over image search results.',
    inputSchema: { type: 'object' as const, properties: z.object({
      query: z.string().describe('Search query for images'),
      num: z.number().optional().default(10).describe('Number of results (1-50)'),
      filters: z.object({
        // Size filters
        size: z.enum(['large', 'medium', 'icon', 'exact']).optional().describe('Image size preset'),
        exact_width: z.number().optional().describe('Exact width in pixels (requires size=exact)'),
        exact_height: z.number().optional().describe('Exact height in pixels (requires size=exact)'),
        
        // Color filters
        color_type: z.enum(['color', 'grayscale', 'transparent']).optional().describe('Color type filter'),
        dominant_color: z.enum(['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'white', 'gray', 'black', 'brown']).optional().describe('Dominant color filter'),
        
        // Type filters
        type: z.enum(['photo', 'clipart', 'lineart', 'animated', 'face', 'news']).optional().describe('Image type'),
        
        // License filters
        license: z.enum(['creative_commons', 'public_domain', 'commercial', 'modify']).optional().describe('Usage rights filter'),
        
        // Time filters
        date_range: z.enum(['day', 'week', 'month', 'year']).optional().describe('Time range filter'),
        
        // Source filters
        site: z.string().optional().describe('Limit to specific domain (e.g., "unsplash.com")'),
        exclude_sites: z.array(z.string()).optional().describe('Exclude specific domains'),
        
        // Format filters
        file_type: z.enum(['jpg', 'png', 'gif', 'svg', 'bmp', 'webp']).optional().describe('File format filter'),
        
        // Aspect ratio
        aspect_ratio: z.enum(['tall', 'square', 'wide', 'panoramic']).optional().describe('Aspect ratio filter'),
        
        // Safe search
        safe_search: z.enum(['strict', 'moderate', 'off']).optional().describe('Safe search level')
      }).optional().describe('Advanced filter options')
    }).shape }
  },

  {
    name: 'mlmh_advanced_icon_search',
    description: 'Advanced Noun Project icon search with filters for style, license, format, popularity, collections, and creator. Perfect for finding icons that match your design system.',
    inputSchema: { type: 'object' as const, properties: z.object({
      query: z.string().describe('Search term for icons'),
      limit: z.number().optional().default(20).describe('Number of results'),
      filters: z.object({
        // Style filters
        style: z.enum(['outline', 'filled', 'glyph', 'hand-drawn', 'flat', '3d']).optional().describe('Icon style'),
        
        // License filters
        license: z.enum(['public_domain', 'creative_commons', 'royalty_free']).optional().describe('License type'),
        
        // Format preferences
        format: z.enum(['svg', 'png']).optional().describe('File format'),
        
        // Color options (for PNG)
        color: z.string().optional().describe('Icon color in hex format (e.g., "#FF0000")'),
        background: z.string().optional().describe('Background color in hex or "transparent"'),
        
        // Size options (for PNG)
        size: z.number().optional().describe('Icon size in pixels (32, 64, 128, 256, 512, or 1024)'),
        
        // Collection filters
        collection_id: z.number().optional().describe('Search within specific collection ID'),
        creator: z.string().optional().describe('Filter by icon creator username'),
        
        // Tag filters
        tags: z.array(z.string()).optional().describe('Must have these tags'),
        exclude_tags: z.array(z.string()).optional().describe('Must NOT have these tags'),
        
        // Popularity
        sort_by: z.enum(['relevance', 'popularity', 'recent']).optional().describe('Sort order'),
        min_downloads: z.number().optional().describe('Minimum download count filter')
      }).optional().describe('Advanced filter options')
    }).shape }
  },

  {
    name: 'mlmh_save_search_preset',
    description: 'Save a search configuration preset for reuse. Store commonly used filter combinations with a memorable name for quick access later.',
    inputSchema: { type: 'object' as const, properties: z.object({
      name: z.string().describe('Preset name (e.g., "Brand Photos", "Outline Icons", "Hero Images")'),
      type: z.enum(['images', 'icons']).describe('Preset type'),
      filters: z.record(z.any()).describe('Filter configuration object (same structure as advanced search filters)'),
      description: z.string().optional().describe('Optional description of what this preset is for')
    }).shape }
  },

  {
    name: 'mlmh_load_search_preset',
    description: 'Load a saved search preset by name. Returns the filter configuration that can be used with advanced search tools.',
    inputSchema: { type: 'object' as const, properties: z.object({
      name: z.string().describe('Preset name to load'),
      type: z.enum(['images', 'icons']).optional().describe('Filter by preset type')
    }).shape }
  },

  {
    name: 'mlmh_list_search_presets',
    description: 'List all saved search presets with their names, types, and descriptions. Useful for discovering available presets.',
    inputSchema: { type: 'object' as const, properties: z.object({
      type: z.enum(['images', 'icons', 'all']).optional().default('all').describe('Filter by preset type')
    }).shape }
  },

  {
    name: 'mlmh_delete_search_preset',
    description: 'Delete a saved search preset by name.',
    inputSchema: { type: 'object' as const, properties: z.object({
      name: z.string().describe('Preset name to delete')
    }).shape }
  },

  {
    name: 'mlmh_browse_icon_collections',
    description: 'Browse curated Noun Project icon collections. Collections are professionally curated sets of icons with consistent style and theme.',
    inputSchema: { type: 'object' as const, properties: z.object({
      page: z.number().optional().default(1).describe('Page number for pagination'),
      per_page: z.number().optional().default(20).describe('Collections per page'),
      search: z.string().optional().describe('Search term for collection names'),
      sort: z.enum(['popular', 'recent', 'name']).optional().describe('Sort order')
    }).shape }
  },

  {
    name: 'mlmh_get_collection_icons',
    description: 'Get all icons from a specific Noun Project collection. Perfect for importing entire icon sets with consistent styling.',
    inputSchema: { type: 'object' as const, properties: z.object({
      collection_id: z.number().describe('Collection ID from mlmh_browse_icon_collections'),
      limit: z.number().optional().default(50).describe('Number of icons to return'),
      format: z.enum(['svg', 'png']).optional().describe('Icon format preference')
    }).shape }
  }
];

// ============================================================================
// TOOL HANDLERS
// ============================================================================

export const mlMediaHubHandlers = {
  mlmh_search_images: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'mediahub/v1/search-images', args);
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
      const response = await makeWordPressRequest('POST', 'mediahub/v1/import-images', args);
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
      const response = await makeWordPressRequest('POST', 'mediahub/v1/noun-search', args);
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
      const response = await makeWordPressRequest('POST', 'mediahub/v1/noun-import', args);
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
      const response = await makeWordPressRequest('GET', `mediahub/v1/media${query ? '?' + query : ''}`);
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
      const response = await makeWordPressRequest('GET', 'mediahub/v1/categories');
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
      const response = await makeWordPressRequest('POST', 'mediahub/v1/categories', args);
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
      const response = await makeWordPressRequest('GET', 'mediahub/v1/settings');
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
      const response = await makeWordPressRequest('POST', 'mediahub/v1/settings', args);
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
      const response = await makeWordPressRequest('GET', 'mediahub/v1/info');
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
  },

  // ============================================================================
  // ADVANCED SEARCH & FILTER HANDLERS (8 new handlers)
  // ============================================================================

  mlmh_advanced_image_search: async (args: any) => {
    try {
      // Merge query and filters into a single request body
      const requestBody = {
        query: args.query,
        num: args.num || 10,
        ...args.filters
      };
      const response = await makeWordPressRequest('POST', 'mediahub/v1/search-images-advanced', requestBody);
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
            text: `Error in advanced image search: ${error.message}`
          }]
        }
      };
    }
  },

  mlmh_advanced_icon_search: async (args: any) => {
    try {
      const requestBody = {
        query: args.query,
        limit: args.limit || 20,
        ...args.filters
      };
      const response = await makeWordPressRequest('POST', 'mediahub/v1/noun-search-advanced', requestBody);
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
            text: `Error in advanced icon search: ${error.message}`
          }]
        }
      };
    }
  },

  mlmh_save_search_preset: async (args: any) => {
    try {
      const response = await makeWordPressRequest('POST', 'mediahub/v1/presets', args);
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
            text: `Error saving search preset: ${error.message}`
          }]
        }
      };
    }
  },

  mlmh_load_search_preset: async (args: any) => {
    try {
      const params = new URLSearchParams();
      params.append('name', args.name);
      if (args.type) params.append('type', args.type);
      
      const response = await makeWordPressRequest('GET', `mediahub/v1/presets?${params.toString()}`);
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
            text: `Error loading search preset: ${error.message}`
          }]
        }
      };
    }
  },

  mlmh_list_search_presets: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.type && args.type !== 'all') params.append('type', args.type);
      
      const query = params.toString();
      const response = await makeWordPressRequest('GET', `mediahub/v1/presets${query ? '?' + query : ''}`);
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
            text: `Error listing search presets: ${error.message}`
          }]
        }
      };
    }
  },

  mlmh_delete_search_preset: async (args: any) => {
    try {
      const response = await makeWordPressRequest('DELETE', `mediahub/v1/presets/${encodeURIComponent(args.name)}`);
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
            text: `Error deleting search preset: ${error.message}`
          }]
        }
      };
    }
  },

  mlmh_browse_icon_collections: async (args: any) => {
    try {
      const params = new URLSearchParams();
      if (args.page) params.append('page', args.page.toString());
      if (args.per_page) params.append('per_page', args.per_page.toString());
      if (args.search) params.append('search', args.search);
      if (args.sort) params.append('sort', args.sort);
      
      const query = params.toString();
      const response = await makeWordPressRequest('GET', `mediahub/v1/noun-collections${query ? '?' + query : ''}`);
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
            text: `Error browsing icon collections: ${error.message}`
          }]
        }
      };
    }
  },

  mlmh_get_collection_icons: async (args: any) => {
    try {
      const params = new URLSearchParams();
      params.append('collection_id', args.collection_id.toString());
      if (args.limit) params.append('limit', args.limit.toString());
      if (args.format) params.append('format', args.format);
      
      const response = await makeWordPressRequest('GET', `mediahub/v1/noun-collection-icons?${params.toString()}`);
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
            text: `Error getting collection icons: ${error.message}`
          }]
        }
      };
    }
  }
};

