# ml-mcp-server v1.0.12 Release Notes

## 🚨 CRITICAL FIX: HTML5 Bypass Parameters Restored

### Summary
Added missing `use_html5_bypass` and `bypass_sanitization` parameters to the `fc_create_post` tool schema. These parameters were working in the FluentMCP WordPress plugin (v1.7.8+) but were never exposed in the MCP server tool schema, preventing AI agents from using the HTML5 bypass feature.

---

## What Was The Problem?

The FluentMCP WordPress plugin has had HTML5 bypass functionality since v1.7.8 (November 26, 2025), which allows:
- ✅ Full HTML5/CSS support
- ✅ CSS Grid layouts
- ✅ iframe embeds (YouTube, etc.)
- ✅ Inline styles with gradients, shadows
- ✅ Direct database write bypassing markdown processing

**BUT** the ml-mcp-server npm package was missing these parameters in the tool schema, so AI agents couldn't use them!

---

## What Was Fixed?

### 1. Updated `createPostSchema` in `fluent-community.ts`

Added two new optional parameters:

```typescript
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
```

### 2. Updated `fc_create_post` Handler

Now passes the parameters through to the WordPress REST API:

```typescript
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
}
```

---

## How To Use

### Standard Post (Markdown Processing)

```javascript
mcp_fmcp-comm-fccma_fc_create_post({
  space_id: 1,
  user_id: 1,
  title: "My Post",
  message: "This is **bold** and this is *italic*"
})
```

### HTML5 Bypass Post (Full HTML/CSS)

```javascript
mcp_fmcp-comm-fccma_fc_create_post({
  space_id: 1,
  user_id: 1,
  title: "Black Friday Sale",
  message: `
    <div style="background: linear-gradient(135deg, #FF0000 0%, #8B0000 100%); padding: 40px; color: white;">
      <h1 style="font-size: 48px; margin: 0;">🔥 BLACK FRIDAY</h1>
      <p style="font-size: 24px;">Up to 70% OFF!</p>
      <iframe src="https://www.youtube.com/embed/VIDEO_ID" width="100%" height="315"></iframe>
    </div>
  `,
  use_html5_bypass: true
})
```

---

## Upgrade Instructions

### For Cursor Users:

1. **Restart Cursor** - The MCP server will auto-update to v1.0.12
2. **Verify** - Check that `use_html5_bypass` parameter is available in `fc_create_post` tool

### For Claude Desktop Users:

1. **Stop Claude Desktop**
2. **Update package:**
   ```bash
   npm install -g @wplaunchify/ml-mcp-server@latest
   ```
3. **Restart Claude Desktop**

---

## Technical Details

### How HTML5 Bypass Works (FluentMCP Plugin v1.7.8+)

1. **Standard Mode** (`use_html5_bypass: false` or omitted):
   - Uses FluentCommunity REST API
   - Markdown processing runs
   - Sanitization applies
   - Safe for user-generated content

2. **HTML5 Bypass Mode** (`use_html5_bypass: true`):
   - Direct database write to `wp_fcom_posts`
   - Sets meta flags: `fluentmcp_html5_bypass` and `fluentmcp_trusted_html`
   - REST API interception restores raw HTML from database
   - No markdown processing
   - Full HTML5/CSS/iframe support

### REST API Interception (v1.7.8)

The FluentMCP plugin uses `rest_request_after_callbacks` filter to intercept FluentCommunity's REST API responses and restore raw HTML for posts with the bypass flag:

```php
add_filter('rest_request_after_callbacks', 'fmcp_intercept_fluentcommunity_feed_response', 10, 3);

function fmcp_intercept_fluentcommunity_feed_response($response, $handler, $request) {
    // Check if this is a FluentCommunity feed endpoint
    $route = $request->get_route();
    if (strpos($route, '/fluent-community/v2/feeds') === false) {
        return $response;
    }
    
    // Restore raw HTML for HTML5 bypass posts
    $data = $response->get_data();
    if (isset($data['feed']) && has_html5_bypass_flag($data['feed'])) {
        // Query database for raw content
        global $wpdb;
        $db_post = $wpdb->get_row("SELECT message, message_rendered FROM wp_fcom_posts WHERE id = {$data['feed']['id']}");
        $data['feed']['message'] = $db_post->message;
        $data['feed']['message_rendered'] = $db_post->message_rendered;
    }
    
    $response->set_data($data);
    return $response;
}
```

---

## Files Changed

1. **src/tools/fluent-community.ts**
   - Added `use_html5_bypass` parameter to `createPostSchema`
   - Added `bypass_sanitization` parameter to `createPostSchema`
   - Updated `fc_create_post` handler to pass parameters through

2. **package.json**
   - Version bump: 1.0.11 → 1.0.12

---

## Testing

To test the HTML5 bypass:

```javascript
// Create a post with CSS Grid and YouTube embed
mcp_fmcp-comm-fccma_fc_create_post({
  space_id: 27,
  user_id: 1,
  title: "🔥 BLACK FRIDAY 2025",
  message: `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 40px; background: #000;">
      <div style="background: linear-gradient(135deg, #FF0000 0%, #8B0000 100%); padding: 30px; border-radius: 10px; color: white;">
        <h2 style="font-size: 36px; margin: 0 0 20px 0;">🎉 Up to 70% OFF</h2>
        <p style="font-size: 18px;">Limited time only!</p>
      </div>
      <div style="background: #1a1a1a; padding: 30px; border-radius: 10px;">
        <iframe src="https://www.youtube.com/embed/yC3ZSgGg3LQ" width="100%" height="315" frameborder="0" allowfullscreen></iframe>
      </div>
    </div>
  `,
  use_html5_bypass: true
})
```

**Expected Result:**
- ✅ Two-column CSS Grid layout
- ✅ Gradient backgrounds render correctly
- ✅ YouTube video embeds and plays
- ✅ No `<pre><code>` wrappers
- ✅ All inline styles work

---

## Related Documents

- **FluentMCP Plugin:** `fluent-mcp/research/v1.7.8-REST-INTERCEPT-FIX.md`
- **HTML5 Bypass Handoff:** `fluent-mcp/research/HANDOFF-HTML5-BYPASS-ISSUE.md`
- **Test Script:** `fluent-mcp/test-html5-bypass.ps1`

---

## Credits

**Issue Discovered:** November 28, 2025 - During Black Friday post creation test  
**Root Cause:** HTML5 bypass parameters missing from MCP server tool schema  
**Fix:** Added parameters to schema and handler  
**Version:** 1.0.12  
**Published:** November 28, 2025

---

## Next Steps

This completes the HTML5 bypass feature! All components are now working:
- ✅ FluentMCP WordPress plugin (v1.7.8+) - Direct database write + REST interception
- ✅ ml-mcp-server npm package (v1.0.12) - Tool schema with bypass parameters
- ✅ Documentation and test scripts

**No further changes needed!** 🎉




