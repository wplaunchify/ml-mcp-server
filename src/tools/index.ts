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
import { mlSimpleSiteTools, mlSimpleSiteHandlers } from './ml-simple-site.js';
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
import { fluentMcpProTools, fluentMcpProHandlers } from './fluent-mcp-pro.js';
import { mlSocialTools, mlSocialHandlers } from './ml-social.js';

// All tools - always loaded, no conditional filtering
export const allTools: Tool[] = [
  // WordPress Core
  ...unifiedContentTools,
  ...unifiedTaxonomyTools,
  ...pluginTools,
  ...mediaTools,
  ...userTools,
  ...pluginRepositoryTools,
  ...commentTools,

  // ML Plugins (Canvas, Simple Site, Image Editor, Media Hub, Social)
  ...mlCanvasTools,
  ...mlSimpleSiteTools,
  ...mlImageEditorTools,
  ...mlMediaHubTools,
  ...mlSocialTools,

  // FluentMCP Pro (WooCommerce, file system, database, WP settings, system, WP-CLI)
  ...fluentMcpProTools,

  // FluentCommunity
  ...fluentCommunityTools,
  ...fluentCommunityDesignTools,
  ...fluentCommunityLayoutTools,
  ...fluentCommunityChatTools,
  ...fluentCommunityAdminTools,
  ...fluentCommunityCoreTools,
  ...fluentCommunityLearningTools,

  // FluentCart
  ...fluentCartTools,
  ...fluentCartAnalyticsTools,
  ...fluentCartLicensingTools,
  ...fluentCartAdminTools,

  // FluentCRM
  ...fluentCRMTools,

  // Fluent Affiliate
  ...fluentAffiliateTools,

  // Debug
  ...debugTools
];

// All handlers - always loaded, no conditional filtering
export const toolHandlers: Record<string, any> = {
  // WordPress Core
  ...unifiedContentHandlers,
  ...unifiedTaxonomyHandlers,
  ...pluginHandlers,
  ...mediaHandlers,
  ...userHandlers,
  ...pluginRepositoryHandlers,
  ...commentHandlers,

  // ML Plugins
  ...mlCanvasHandlers,
  ...mlSimpleSiteHandlers,
  ...mlImageEditorHandlers,
  ...mlMediaHubHandlers,
  ...mlSocialHandlers,

  // FluentMCP Pro
  ...fluentMcpProHandlers,

  // FluentCommunity
  ...fluentCommunityHandlers,
  ...fluentCommunityDesignHandlers,
  ...fluentCommunityLayoutHandlers,
  ...fluentCommunityChatHandlers,
  ...fluentCommunityAdminHandlers,
  ...fluentCommunityCoreHandlers,
  ...fluentCommunityLearningHandlers,

  // FluentCart
  ...fluentCartHandlers,
  ...fluentCartAnalyticsHandlers,
  ...fluentCartLicensingHandlers,
  ...fluentCartAdminHandlers,

  // FluentCRM
  ...fluentCRMHandlers,

  // Fluent Affiliate
  ...fluentAffiliateHandlers,

  // Debug
  ...debugHandlers
};

console.error(`📦 Loaded ${allTools.length} tools`);
