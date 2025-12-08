// src/tools/index.ts
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { unifiedContentTools, unifiedContentHandlers } from './unified-content.js';
import { unifiedTaxonomyTools, unifiedTaxonomyHandlers } from './unified-taxonomies.js';
import { pluginTools, pluginHandlers } from './plugins.js';
import { mediaTools, mediaHandlers } from './media.js';
import { userTools, userHandlers } from './users.js';
import { pluginRepositoryTools, pluginRepositoryHandlers } from './plugin-repository.js';
import { commentTools, commentHandlers } from './comments.js';
import { fluentCommunityTools, fluentCommunityHandlers } from './fluent-community.js';
import { fluentCommunityDesignTools, fluentCommunityDesignHandlers } from './fluent-community-design.js';
import { fluentCommunityLayoutTools, fluentCommunityLayoutHandlers } from './fluent-community-layout.js';
import { fluentCartTools, fluentCartHandlers } from './fluent-cart.js';
import { fluentCRMTools, fluentCRMHandlers } from './fluent-crm.js';
import { mlCanvasTools, mlCanvasHandlers } from './ml-canvas.js';
import { mlImageEditorTools, mlImageEditorHandlers } from './ml-image-editor.js';
import { fluentAffiliateTools, fluentAffiliateHandlers } from './fluent-affiliate.js';
import { mlMediaHubTools, mlMediaHubHandlers } from './ml-media-hub.js';
import { debugTools, debugHandlers } from './debug.js';
import { fluentCartAnalyticsTools, fluentCartAnalyticsHandlers } from './fluent-cart-analytics.js';
import { fluentCartLicensingTools, fluentCartLicensingHandlers } from './fluent-cart-licensing.js';
import { fluentCartAdminTools, fluentCartAdminHandlers } from './fluent-cart-admin.js';
import { fluentCommunityChatTools, fluentCommunityChatHandlers } from './fluent-community-chat.js';
import { fluentCommunityAdminTools, fluentCommunityAdminHandlers } from './fluent-community-admin.js';
import { fluentCommunityCoreTools, fluentCommunityCoreHandlers } from './fluent-community-core.js';
import { fluentCommunityLearningTools, fluentCommunityLearningHandlers } from './fluent-community-learning.js';

// Tool categories for selective loading
const toolCategories = {
  wordpress: [
    ...unifiedContentTools,
    ...unifiedTaxonomyTools,
    ...pluginTools,
    ...mediaTools,
    ...userTools,
    ...pluginRepositoryTools,
    ...commentTools,
    ...mlCanvasTools
  ],
  // Full FluentCommunity (91 tools) - legacy support
  fluentcommunity: [
    ...fluentCommunityTools,
    ...fluentCommunityDesignTools,
    ...fluentCommunityLayoutTools,
    ...fluentCommunityChatTools,
    ...fluentCommunityAdminTools
  ],
  // COMM1 - Community Core (55 tools) - posts, spaces, members, engagement
  'fluentcommunity-core': [
    ...fluentCommunityCoreTools,
    ...fluentCommunityChatTools  // Chat is part of core community
  ],
  // COMM2 - Learning & Admin (36 tools) - courses, lessons, settings
  'fluentcommunity-learning': [
    ...fluentCommunityLearningTools,
    ...fluentCommunityDesignTools,
    ...fluentCommunityLayoutTools,
    ...fluentCommunityAdminTools
  ],
  fluentcart: [
    ...fluentCartTools,
    ...fluentCartAnalyticsTools,
    ...fluentCartLicensingTools,
    ...fluentCartAdminTools
  ],
  fluentcrm: [
    ...fluentCRMTools
  ],
  mlplugins: [
    ...mlCanvasTools,
    ...mlImageEditorTools,
    ...mlMediaHubTools,
    ...fluentAffiliateTools
  ],
  debug: [
    ...debugTools
  ]
};

const handlerCategories = {
  wordpress: {
    ...unifiedContentHandlers,
    ...unifiedTaxonomyHandlers,
    ...pluginHandlers,
    ...mediaHandlers,
    ...userHandlers,
    ...pluginRepositoryHandlers,
    ...commentHandlers
  },
  fluentcommunity: {
    ...fluentCommunityHandlers,
    ...fluentCommunityDesignHandlers,
    ...fluentCommunityLayoutHandlers,
    ...fluentCommunityChatHandlers,
    ...fluentCommunityAdminHandlers
  },
  'fluentcommunity-core': {
    ...fluentCommunityCoreHandlers,
    ...fluentCommunityChatHandlers
  },
  'fluentcommunity-learning': {
    ...fluentCommunityLearningHandlers,
    ...fluentCommunityDesignHandlers,
    ...fluentCommunityLayoutHandlers,
    ...fluentCommunityAdminHandlers
  },
  fluentcart: {
    ...fluentCartHandlers,
    ...fluentCartAnalyticsHandlers,
    ...fluentCartLicensingHandlers,
    ...fluentCartAdminHandlers
  },
  fluentcrm: {
    ...fluentCRMHandlers
  },
  mlplugins: {
    ...mlCanvasHandlers,
    ...mlImageEditorHandlers,
    ...mlMediaHubHandlers,
    ...fluentAffiliateHandlers
  },
  debug: {
    ...debugHandlers
  }
};

// Filter tools based on ENABLED_TOOLS environment variable
function getFilteredTools(): Tool[] {
  const enabledTools = process.env.ENABLED_TOOLS?.toLowerCase();
  
  if (!enabledTools || enabledTools === 'all') {
    // No filter or 'all' - load all tools
    return [
      ...toolCategories.wordpress,
      ...toolCategories.fluentcommunity,
      ...toolCategories.fluentcart,
      ...toolCategories.fluentcrm,
      ...toolCategories.mlplugins,
      ...toolCategories.debug
    ];
  }
  
  // Map user-friendly names to internal category names
  const categoryMap: Record<string, keyof typeof toolCategories> = {
    'wordpress': 'wordpress',
    'fluent-community': 'fluentcommunity',
    'fluentcommunity': 'fluentcommunity',
    'fluentcommunity-core': 'fluentcommunity-core',
    'fluent-community-core': 'fluentcommunity-core',
    'fluentcommunity-learning': 'fluentcommunity-learning',
    'fluent-community-learning': 'fluentcommunity-learning',
    'fluent-cart': 'fluentcart',
    'fluentcart': 'fluentcart',
    'fluent-crm': 'fluentcrm',
    'fluentcrm': 'fluentcrm',
    'mlplugins': 'mlplugins',
    'debug': 'debug'
  };
  
  const category = categoryMap[enabledTools];
  if (category && toolCategories[category]) {
    console.error(`📦 Loading only: ${enabledTools} (${toolCategories[category].length} tools)`);
    return toolCategories[category];
  }
  
  console.error(`⚠️  Unknown ENABLED_TOOLS value: ${enabledTools}. Loading all tools.`);
  return [
    ...toolCategories.wordpress,
    ...toolCategories.fluentcommunity,
    ...toolCategories.fluentcart,
    ...toolCategories.fluentcrm,
    ...toolCategories.mlplugins,
    ...toolCategories.debug
  ];
}

function getFilteredHandlers(): Record<string, any> {
  const enabledTools = process.env.ENABLED_TOOLS?.toLowerCase();
  
  if (!enabledTools || enabledTools === 'all') {
    // No filter or 'all' - load all handlers
    return {
      ...handlerCategories.wordpress,
      ...handlerCategories.fluentcommunity,
      ...handlerCategories.fluentcart,
      ...handlerCategories.fluentcrm,
      ...handlerCategories.mlplugins,
      ...handlerCategories.debug
    };
  }
  
  // Map user-friendly names to internal category names
  const categoryMap: Record<string, keyof typeof handlerCategories> = {
    'wordpress': 'wordpress',
    'fluent-community': 'fluentcommunity',
    'fluentcommunity': 'fluentcommunity',
    'fluentcommunity-core': 'fluentcommunity-core',
    'fluent-community-core': 'fluentcommunity-core',
    'fluentcommunity-learning': 'fluentcommunity-learning',
    'fluent-community-learning': 'fluentcommunity-learning',
    'fluent-cart': 'fluentcart',
    'fluentcart': 'fluentcart',
    'fluent-crm': 'fluentcrm',
    'fluentcrm': 'fluentcrm',
    'mlplugins': 'mlplugins',
    'debug': 'debug'
  };
  
  const category = categoryMap[enabledTools];
  if (category && handlerCategories[category]) {
    return handlerCategories[category];
  }
  
  return {
    ...handlerCategories.wordpress,
    ...handlerCategories.fluentcommunity,
    ...handlerCategories.fluentcart,
    ...handlerCategories.fluentcrm,
    ...handlerCategories.mlplugins,
    ...handlerCategories.debug
  };
}

// Export filtered tools and handlers
export const allTools: Tool[] = getFilteredTools();
export const toolHandlers = getFilteredHandlers();