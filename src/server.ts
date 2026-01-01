#!/usr/bin/env node
// src/server.ts
import * as dotenv from 'dotenv';
// Load environment variables from .env file if it exists (optional for npx usage)
dotenv.config({ path: '.env' });

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { allTools, toolHandlers } from './tools/index.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Generate server name from WordPress URL
function generateServerName(): string {
    const apiUrl = process.env.WORDPRESS_API_URL || '';
    const customName = process.env.MCP_SERVER_NAME;
    
    if (customName) {
        return customName;
    }
    
    if (!apiUrl) {
        return 'wordpress';
    }
    
    try {
        const url = new URL(apiUrl);
        const hostname = url.hostname;
        const parts = hostname.split('.');
        
        if (parts.length >= 3) {
            // e.g., fccmanagermcp.instawp.co
            const subdomain = parts[0];
            const domain = parts[1];
            
            // Try with domain (no TLD): fccmanagermcp-instawp
            const withDomain = `${subdomain}-${domain}`;
            if (withDomain.length <= 25) {
                return withDomain;
            }
            
            // Fallback to subdomain only: fccmanagermcp
            return subdomain;
        }
        
        // Fallback to hostname without TLD
        return parts.slice(0, -1).join('-') || 'wordpress';
    } catch (e) {
        return 'wordpress';
    }
}

// Create MCP server instance
const server = new McpServer({
    name: generateServerName(),
    version: "1.0.7"
}, {
    capabilities: {
        tools: allTools.reduce((acc, tool) => {
            acc[tool.name] = tool;
            return acc;
        }, {} as Record<string, any>)
    }
});

// Register each tool from our tools list with its corresponding handler
let registeredCount = 0;
for (const tool of allTools) {
    const handler = toolHandlers[tool.name as keyof typeof toolHandlers];
    if (!handler) {
        console.error(`⚠️  No handler for tool: ${tool.name}`);
        continue;
    }
    
    const wrappedHandler = async (args: any) => {
        try {
            // The handler functions are already typed with their specific parameter types
            const result = await handler(args);
            return {
                content: result.toolResult.content.map((item: { type: string; text: string }) => ({
                    ...item,
                    type: "text" as const
                })),
                isError: result.toolResult.isError
            };
        } catch (error: any) {
            // Return error as tool result instead of throwing
            return {
                content: [{
                    type: "text" as const,
                    text: `Error executing ${tool.name}: ${error.message || String(error)}`
                }],
                isError: true
            };
        }
    };
    
    // console.log(`Registering tool: ${tool.name}`);
    // console.log(`Input schema: ${JSON.stringify(tool.inputSchema)}`);

    // const zodSchema = z.any().optional();
    // const jsonSchema = zodToJsonSchema(z.object(tool.inputSchema.properties as z.ZodRawShape));

    // const schema = z.object(tool.inputSchema as z.ZodRawShape).catchall(z.unknown());
    
    // The inputSchema is already in JSON Schema format with properties
    // server.tool(tool.name, tool.inputSchema.shape, wrappedHandler);
    // const zodSchema = z.any().optional();
    // const jsonSchema = zodToJsonSchema(z.object(tool.inputSchema.properties as z.ZodRawShape));
    // const parsedSchema = z.any().optional().parse(jsonSchema);

    const zodSchema = z.object(tool.inputSchema.properties as z.ZodRawShape); 
    server.tool(tool.name, zodSchema.shape, wrappedHandler);
    registeredCount++;
}

console.error(`✅ Registered ${registeredCount} of ${allTools.length} tools`);

async function main() {
    const { logToFile } = await import('./wordpress.js');
    logToFile('Starting WordPress MCP server...');
    
    // Environment variables are passed by MCP client (Claude Desktop, Cursor, etc.)
    // Don't exit here - let initWordPress() handle the validation
    if (!process.env.WORDPRESS_API_URL) {
        logToFile('Warning: WORDPRESS_API_URL not set. Will fail on first tool call if not provided by MCP client.');
    }

    try {
        logToFile('Initializing WordPress client...');
        const { initWordPress } = await import('./wordpress.js');
        await initWordPress();
        logToFile('WordPress client initialized successfully.');

        logToFile('Setting up server transport...');
        const transport = new StdioServerTransport();
        await server.connect(transport);
        logToFile('WordPress MCP Server running on stdio');
    } catch (error) {
        logToFile(`Failed to initialize server: ${error}`);
        // Don't exit immediately - let the MCP client handle the error
        throw error;
    }
}

// Handle process signals gracefully
process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal, shutting down...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('Received SIGINT signal, shutting down...');
    process.exit(0);
});

// Log errors but don't kill the server - let MCP SDK handle tool errors gracefully
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    // Don't exit - let the server continue running
});
process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
    // Don't exit - let the server continue running
});

main().catch((error) => {
    console.error('Startup error:', error);
    process.exit(1);
});