# Handoff (to FluentMCP agent): Campaign analytics REST + tool catalog

**Audience:** Maintainer of **FluentMCP** (WordPress) — `plugin-files/fluent-mcp/fluent-mcp.php` (fluent-mcp repo).  
**Counterpart:** **`@wplaunchify/ml-mcp-server`** will expose matching MCP tools that call the routes below.  
**Coordination:** Ship **FluentMCP first** (or same day as NPM); standalone MCP users need both updates.

---

## 1. Confirmation from ml-mcp-server side

We are aligned on:

- **Three** tools/endpoints under `fc-manager` v1, names and paths **exactly** as specified.
- **Auth:** Same as existing `fcrm_*` routes (fc-manager permission / application password).
- **NPM package** will register MCP tools `fcrm_get_campaign_stats`, `fcrm_get_campaign_links`, `fcrm_get_campaign_clickers` with Zod schemas; handlers **GET** these URLs and pass JSON through (WordPress response is authoritative).

---

## 2. What you must implement (PHP)

### REST routes (relative base: `/wp-json/fc-manager/v1`)

| Method | Route | Purpose |
|--------|--------|---------|
| GET | `/fcrm/campaigns/{id}/stats` | Aggregate campaign send/open/click/unsubscribe metrics |
| GET | `/fcrm/campaigns/{id}/links` | Per-URL unique click counts |
| GET | `/fcrm/campaigns/{id}/clickers` | Who clicked (subscriber IDs; optional contact fields) |

**Full URL examples:**

- `{site}/wp-json/fc-manager/v1/fcrm/campaigns/128/stats`
- `{site}/wp-json/fc-manager/v1/fcrm/campaigns/122/links?limit=10`
- `{site}/wp-json/fc-manager/v1/fcrm/campaigns/127/clickers?include_contact=true`

### Query / path parameters

- **All:** `id` in path — required, campaign ID (integer).
- **links:** optional `limit` — max URLs; default **50** if omitted.
- **clickers:** optional `include_contact` — if true, include `email`, `first_name`, `last_name`; if false, IDs only (or null/omitted contact fields — **finalize one behavior** so NPM Zod can match).

### Target JSON shapes (200)

NPM will not re-map bodies; consumers expect shapes **compatible** with:

**`.../stats`**

```json
{
  "campaign_id": 128,
  "title": "FxN Intel 2026-03-20",
  "sent_count": 115,
  "open_count": 62,
  "open_rate": 53.91,
  "click_count": 2,
  "click_rate": 1.74,
  "click_to_open_rate": 3.23,
  "unsubscribe_count": 0,
  "scheduled_at": "2026-03-20 10:00:00"
}
```

**`.../links`**

```json
{
  "campaign_id": 122,
  "links": [
    { "url": "https://example.com/path", "unique_clicks": 5 }
  ]
}
```

**`.../clickers`**

```json
{
  "campaign_id": 127,
  "clicker_count": 7,
  "clickers": [
    {
      "subscriber_id": 42,
      "email": "user@example.com",
      "first_name": "L",
      "last_name": "Fleming"
    }
  ]
}
```

**Errors:** Same patterns as other `fcrm_*` endpoints (`fluentcrm_not_installed`, unknown campaign / 404, etc.).

### Tool catalog (in-plugin MCP / ML Claw)

- Append **three** entries to **`fmcp_mcp_list_tools()`** `tools` array: `endpoint` (full path under `/wp-json/fc-manager/v1/...`), `method`, `parameters` (path `id`, plus optional query params as above).
- Update **`fmcp_mcp_quick_start()`** CRM tool list if that list is maintained manually (counts/names).

### Implementation notes (from parallel handoff)

- Prefer **`rest_do_request`** to FluentCRM documented REST (e.g. overview / link-report) with **mapping** into these shapes; use DB only if API gaps (especially **clicker list**).
- Run **`php -l`** on `fluent-mcp.php`; build release zips per fluent-mcp repo rules.

---

## 3. Release order (do not invert)

1. **Merge & release FluentMCP** (routes + catalog).  
2. **Publish `@wplaunchify/ml-mcp-server`** with the three MCP tools.  
3. Communicate: sites must **update the plugin** before relying on new tools via NPM MCP.

---

## 4. Fill in when shipped

| Item | Value |
|------|--------|
| FluentMCP version | **2.6.8** (routes + MCP catalog in fluent-mcp repo) |
| ml-mcp-server version | _______________ |
| PR / commit links | _______________ |

---

## 5. Source handoff (NPM requirements detail)

Full NPM checklist and integration-test steps: **`fluent-mcp` repo** — `HANDOFF-ML-MCP-SERVER-CAMPAIGN-ANALYTICS.md`.

---

*End. PHP: routes + shapes + `fmcp_mcp_list_tools()` / quick start. NPM: mirror tool names and GET handlers after routes exist.*
