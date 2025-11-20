# ML MCP Server

**Universal Model Context Protocol (MCP) Server for WordPress and Fluent Suite**

Connect AI assistants like Claude and Cursor directly to your WordPress site with 145 powerful tools for managing content, e-commerce, CRM, community, and more.

---

## 🚀 Features

### **WordPress Core (37 tools)**
- Content management (posts, pages, custom post types)
- Taxonomy management (categories, tags, custom taxonomies)
- User management
- Media library
- Comments
- Plugin management

### **Fluent Suite (79 tools)**
- **FluentCommunity** (29 tools) - Spaces, posts, members, design, layout
- **FluentCart** (31 tools) - Products, orders, customers, subscriptions, coupons
- **FluentCRM** (19 tools) - Contacts, lists, campaigns, tags

### **MinuteLaunch Plugins (29 tools)**
- **ML Canvas Block** (3 tools) - Surgical HTML editing
- **ML Image Editor** (8 tools) - AI image generation and editing
- **ML Media Hub** (18 tools) - Google Images search, Noun Project icons, advanced filters

---

## 📦 Installation

### **Prerequisites**
- Node.js 18 or higher
- WordPress site with one of the following plugins:
  - `ml-mcp` (MinuteLaunch - full feature set)
  - `fluent-mcp` (FluentMCP - Community/Cart/CRM only)

### **Install via npx (Recommended)**

Add to your MCP client configuration (e.g., Cursor's `mcp.json`):

```json
{
  "mcpServers": {
    "wordpress": {
      "command": "npx",
      "args": ["-y", "@wplaunchify/ml-mcp-server"],
      "env": {
        "WORDPRESS_API_URL": "https://your-site.com",
        "WORDPRESS_USERNAME": "your-username",
        "WORDPRESS_APP_PASSWORD": "xxxx xxxx xxxx xxxx xxxx xxxx"
      }
    }
  }
}
```

### **Install Globally**

```bash
npm install -g @wplaunchify/ml-mcp-server
```

---

## 🔧 Configuration

### **1. WordPress Application Password**

1. Go to **WordPress Admin → Users → Profile**
2. Scroll to **Application Passwords**
3. Enter name: "MCP Server"
4. Click **Add New Application Password**
5. Copy the generated password (format: `xxxx xxxx xxxx xxxx xxxx xxxx`)

### **2. Environment Variables**

Create a `.env` file or set in your MCP client config:

```bash
WORDPRESS_API_URL=https://your-site.com
WORDPRESS_USERNAME=your-username
WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
```

### **3. WordPress Plugin**

Install one of these plugins on your WordPress site:

- **ml-mcp.php** - Full feature set (MinuteLaunch subscribers)
- **fluent-mcp.php** - Core features only (FluentMCP customers)

The plugin exposes REST API endpoints that the MCP server connects to.

---

## 🛠️ Development

### **Build from Source**

```bash
git clone https://github.com/wplaunchify/ml-mcp-server.git
cd ml-mcp-server
npm install
npm run build
```

### **Run in Development Mode**

```bash
npm run dev
```

### **Run Tests**

```bash
npm test
```

---

## 📖 Usage Examples

### **Create a FluentCommunity Post**

```javascript
// AI assistant can now do this:
"Create a post in the General space titled 'Welcome' with content 'Hello everyone!'"
```

### **Manage FluentCart Products**

```javascript
// AI assistant can now do this:
"List all products, then update the price of 'Premium Plan' to $99"
```

### **Search and Import Images**

```javascript
// AI assistant can now do this:
"Search Google Images for 'sunset beach' with large size and creative commons license, then import the first result"
```

---

## 🏗️ Architecture

```
AI Assistant (Claude/Cursor)
         ↓
   MCP Server (this package)
         ↓
   WordPress REST API
         ↓
   WordPress Plugin (ml-mcp or fluent-mcp)
         ↓
   WordPress Site + Fluent Plugins
```

The MCP server acts as a bridge, translating AI requests into WordPress REST API calls.

---

## 📋 Tool Categories

| Category | Tools | Description |
|----------|-------|-------------|
| **Content** | 8 | Posts, pages, custom post types |
| **Taxonomies** | 8 | Categories, tags, custom taxonomies |
| **Users** | 5 | User management and roles |
| **Media** | 4 | Media library management |
| **Comments** | 5 | Comment moderation |
| **Plugins** | 7 | Plugin management and repository search |
| **FluentCommunity** | 29 | Social network features |
| **FluentCart** | 31 | E-commerce management |
| **FluentCRM** | 19 | Contact and campaign management |
| **ML Canvas** | 3 | HTML editing |
| **ML Image Editor** | 8 | AI image generation |
| **ML Media Hub** | 18 | Image/icon search and import |

---

## 🔐 Security

- Uses WordPress Application Passwords (no plain passwords)
- REST API authentication via HTTP Basic Auth
- License validation enforced by WordPress plugin
- No credentials stored in MCP server

---

## 📄 License

MIT License - Copyright (c) 2025 1WD LLC

---

## 🆘 Support

- **Documentation**: [GitHub Wiki](https://github.com/wplaunchify/ml-mcp-server/wiki)
- **Issues**: [GitHub Issues](https://github.com/wplaunchify/ml-mcp-server/issues)
- **Website**: [MinuteLaunch.com](https://minutelaunch.com) | [FluentMCP.com](https://fluentmcp.com)

---

## 🎯 Products

This MCP server powers two products:

- **MinuteLaunch MCP** - Full feature set with ML plugins (recurring subscription)
- **FluentMCP** - Core WordPress + Fluent Suite only (one-time purchase)

Both use the same MCP server - the WordPress plugin determines which features are available.

---

**Built with ❤️ by 1WD LLC**

