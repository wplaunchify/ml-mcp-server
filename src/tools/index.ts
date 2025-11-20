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

// Combine all tools - WordPress + FluentCommunity + FluentCRM + FluentCart + ML Plugins = 145 tools
export const allTools: Tool[] = [
  ...unifiedContentTools,        // 8 tools (unified content management)
  ...unifiedTaxonomyTools,       // 8 tools (unified taxonomy management)
  ...pluginTools,                // 5 tools (WordPress plugin management)
  ...mediaTools,                 // 4 tools (WordPress media library)
  ...userTools,                  // 5 tools (WordPress user management)
  ...pluginRepositoryTools,      // 2 tools (WordPress.org plugin repository)
  ...commentTools,               // 5 tools (WordPress comments)
  ...fluentCommunityTools,       // 21 tools (FluentCommunity spaces, posts, members)
  ...fluentCommunityDesignTools, // 6 tools (FluentCommunity colors, branding, CSS)
  ...fluentCommunityLayoutTools, // 2 tools (FluentCommunity layout control)
  ...fluentCRMTools,             // 19 tools (FluentCRM contacts, lists, campaigns)
  ...fluentCartTools,            // 31 tools (FluentCart products, orders, customers)
  ...fluentAffiliateTools,       // 0 tools (FluentAffiliate - coming soon)
  ...mlCanvasTools,              // 3 tools (ML Canvas Block surgical HTML editing)
  ...mlImageEditorTools,         // 8 tools (ML Image Editor AI generation/editing)
  ...mlMediaHubTools             // 18 tools (ML Media Hub: basic + advanced search/filters)
];

// Combine all handlers
export const toolHandlers = {
  ...unifiedContentHandlers,
  ...unifiedTaxonomyHandlers,
  ...pluginHandlers,
  ...mediaHandlers,
  ...userHandlers,
  ...pluginRepositoryHandlers,
  ...commentHandlers,
  ...fluentCommunityHandlers,
  ...fluentCommunityDesignHandlers,
  ...fluentCommunityLayoutHandlers,
  ...fluentCRMHandlers,
  ...fluentCartHandlers,
  ...fluentAffiliateHandlers,
  ...mlCanvasHandlers,
  ...mlImageEditorHandlers,
  ...mlMediaHubHandlers
};
