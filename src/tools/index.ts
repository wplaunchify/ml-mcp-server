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

// Combine all tools - WordPress + FluentCommunity + FluentCRM + FluentCart + ML Plugins
export const allTools: Tool[] = [
  ...unifiedContentTools,        // WordPress Core: unified content management
  ...unifiedTaxonomyTools,       // WordPress Core: unified taxonomy management
  ...pluginTools,                // WordPress Core: plugin management
  ...mediaTools,                 // WordPress Core: media library
  ...userTools,                  // WordPress Core: user management
  ...pluginRepositoryTools,      // WordPress Core: WordPress.org plugin repository
  ...commentTools,               // WordPress Core: comments
  ...fluentCommunityTools,       // FluentCommunity: spaces, posts, members
  ...fluentCommunityDesignTools, // FluentCommunity: colors, branding, CSS
  ...fluentCommunityLayoutTools, // FluentCommunity: layout control
  ...fluentCommunityChatTools,   // FluentCommunity: chat threads, messages
  ...fluentCommunityAdminTools,  // FluentCommunity: cleanup, terms
  ...fluentCRMTools,             // FluentCRM: contacts, lists, campaigns
  ...fluentCartTools,            // FluentCart: products, orders, customers, subscriptions
  ...fluentCartAnalyticsTools,   // FluentCart: reports, stats, analytics
  ...fluentCartLicensingTools,   // FluentCart: licensing charts, summary
  ...fluentCartAdminTools,       // FluentCart: files, categories, notifications, settings
  ...mlCanvasTools,              // ML Canvas Block: surgical HTML editing
  ...mlImageEditorTools,         // ML Image Editor: AI generation/editing
  ...mlMediaHubTools,            // ML Media Hub: image/icon search and filters
  ...debugTools                  // Debug: diagnostic tools
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
  ...fluentCommunityChatHandlers,
  ...fluentCommunityAdminHandlers,
  ...fluentCRMHandlers,
  ...fluentCartHandlers,
  ...fluentCartAnalyticsHandlers,
  ...fluentCartLicensingHandlers,
  ...fluentCartAdminHandlers,
  ...mlCanvasHandlers,
  ...mlImageEditorHandlers,
  ...mlMediaHubHandlers,
  ...debugHandlers
};
