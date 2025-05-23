#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const DOCS_BASE_URL = 'https://docs.hellomoon.io';

interface DocumentationPage {
  title: string;
  url: string;
  content: string;
  section: string;
}

class HelloMoonDocsServer {
  private server: Server;
  private axiosInstance;
  private documentationCache: Map<string, DocumentationPage> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'hellomoon-docs-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.axiosInstance = axios.create({
      baseURL: DOCS_BASE_URL,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 30000,
    });

    this.setupResourceHandlers();
    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'hellomoon-docs://quickstart',
          name: 'HelloMoon Quickstart Guide',
          mimeType: 'text/plain',
          description: 'Stream Builder Quickstart documentation',
        },
        {
          uri: 'hellomoon-docs://datastreams/overview',
          name: 'Datastreams Overview',
          mimeType: 'text/plain',
          description: 'Overview of all available datastreams',
        },
        {
          uri: 'hellomoon-docs://api/reference',
          name: 'API Reference',
          mimeType: 'text/plain',
          description: 'HelloMoon API reference documentation',
        },
      ],
    }));

    this.server.setRequestHandler(
      ListResourceTemplatesRequestSchema,
      async () => ({
        resourceTemplates: [
          {
            uriTemplate: 'hellomoon-docs://page/{slug}',
            name: 'Documentation page by slug',
            mimeType: 'text/plain',
            description: 'Access any HelloMoon documentation page by its URL slug',
          },
          {
            uriTemplate: 'hellomoon-docs://datastream/{type}',
            name: 'Specific datastream documentation',
            mimeType: 'text/plain',
            description: 'Documentation for a specific datastream type',
          },
        ],
      })
    );

    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const uri = request.params.uri;
        if (uri === 'hellomoon-docs://quickstart') {
          const content = await this.fetchDocumentationPage('/docs/your-first-data-stream');
          return { contents: [{ uri, mimeType: 'text/plain', text: content }] };
        }
        if (uri === 'hellomoon-docs://datastreams/overview') {
          const content = await this.fetchDocumentationPage('/docs/all-datastreams');
          return { contents: [{ uri, mimeType: 'text/plain', text: content }] };
        }
        if (uri === 'hellomoon-docs://api/reference') {
          const content = await this.fetchDocumentationPage('/reference');
          return { contents: [{ uri, mimeType: 'text/plain', text: content }] };
        }
        const pageMatch = uri.match(/^hellomoon-docs:\/\/page\/(.+)$/);
        if (pageMatch) {
          const slug = decodeURIComponent(pageMatch[1]);
          const content = await this.fetchDocumentationPage(`/docs/${slug}`);
          return { contents: [{ uri, mimeType: 'text/plain', text: content }] };
        }
        const datastreamMatch = uri.match(/^hellomoon-docs:\/\/datastream\/(.+)$/);
        if (datastreamMatch) {
          const type = decodeURIComponent(datastreamMatch[1]);
          const content = await this.fetchDocumentationPage(`/docs/${type}`);
          return { contents: [{ uri, mimeType: 'text/plain', text: content }] };
        }
        throw new McpError(ErrorCode.InvalidRequest, `Unknown resource URI: ${uri}`);
      }
    );
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'search_documentation',
          description: 'Search HelloMoon documentation for specific topics',
          inputSchema: { type: 'object', properties: { query: { type: 'string' }, section: { type: 'string', enum: ['setup', 'datastreams', 'api', 'faq', 'all'] } }, required: ['query'] },
        },
        {
          name: 'get_datastream_info',
          description: 'Get detailed information about a specific datastream type',
          inputSchema: { type: 'object', properties: { streamType: { type: 'string' } }, required: ['streamType'] },
        },
        {
          name: 'list_available_datastreams',
          description: 'List all available HelloMoon datastream types',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'get_api_endpoints',
          description: 'Get information about HelloMoon API endpoints',
          inputSchema: { type: 'object', properties: { category: { type: 'string' } } },
        },
        {
          name: 'get_setup_instructions',
          description: 'Get setup and quickstart instructions',
          inputSchema: { type: 'object', properties: { type: { type: 'string', enum: ['stream-builder', 'sdk', 'community-sdks'] } }, required: ['type'] },
        },
        {
          name: 'answer_question',
          description: 'Answer questions about HelloMoon based on documentation',
          inputSchema: { type: 'object', properties: { question: { type: 'string' } }, required: ['question'] },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      try {
        switch (name) {
          case 'search_documentation': return await this.searchDocumentation(args);
          case 'get_datastream_info': return await this.getDatastreamInfo(args);
          case 'list_available_datastreams': return await this.listAvailableDatastreams();
          case 'get_api_endpoints': return await this.getApiEndpoints(args);
          case 'get_setup_instructions': return await this.getSetupInstructions(args);
          case 'answer_question': return await this.answerQuestion(args);
          default: throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    });
  }

  private async fetchDocumentationPage(path: string): Promise<string> {
    const cacheKey = path;
    if (this.documentationCache.has(cacheKey)) return this.documentationCache.get(cacheKey)!.content;
    const response = await this.axiosInstance.get(path);
    const textContent = this.extractTextFromHtml(response.data);
    this.documentationCache.set(cacheKey, { title: this.extractTitle(response.data), url: `${DOCS_BASE_URL}${path}`, content: textContent, section: this.categorizeContent(path) });
    return textContent;
  }

  private extractTextFromHtml(html: string): string {
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    text = text.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
    return text.replace(/\s+/g, ' ').trim();
  }

  private extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : 'HelloMoon Documentation';
  }

  private categorizeContent(path: string): string {
    if (path.includes('setup') || path.includes('quickstart')) return 'setup';
    if (path.includes('datastream')) return 'datastreams';
    if (path.includes('api') || path.includes('reference')) return 'api';
    if (path.includes('faq')) return 'faq';
    return 'general';
  }

  private async searchDocumentation(args: any) {
    const { query, section = 'all' } = args;
    const pagesToSearch = ['/docs/your-first-data-stream', '/docs/all-datastreams', '/docs/token-price', '/docs/nft-secondary-market-actions', '/docs/balance-change', '/docs/token-swap', '/docs/token-transfer', '/reference'];
    const results = [];
    for (const page of pagesToSearch) {
      const content = await this.fetchDocumentationPage(page);
      const cachedPage = this.documentationCache.get(page);
      if ((section === 'all' || (cachedPage && cachedPage.section === section)) && content.toLowerCase().includes(query.toLowerCase())) {
        results.push({ title: cachedPage?.title || page, url: `${DOCS_BASE_URL}${page}`, snippet: this.extractSnippet(content, query), section: cachedPage?.section || 'unknown' });
      }
    }
    return { content: [{ type: 'text', text: JSON.stringify({ query, section, results, totalResults: results.length }, null, 2) }] };
  }

  private extractSnippet(content: string, query: string, maxLength: number = 200): string {
    const queryIndex = content.toLowerCase().indexOf(query.toLowerCase());
    if (queryIndex === -1) return content.substring(0, maxLength) + '...';
    const start = Math.max(0, queryIndex - 50);
    const end = Math.min(content.length, queryIndex + query.length + 150);
    return (start > 0 ? '...' : '') + content.substring(start, end) + (end < content.length ? '...' : '');
  }

  private async getDatastreamInfo(args: any) {
    const { streamType } = args;
    try {
      const content = await this.fetchDocumentationPage(`/docs/${streamType}`);
      return { content: [{ type: 'text', text: JSON.stringify({ streamType, documentation: content, url: `${DOCS_BASE_URL}/docs/${streamType}` }, null, 2) }] };
    } catch (error) {
      return { content: [{ type: 'text', text: JSON.stringify({ streamType, error: `Doc not found for ${streamType}` }, null, 2) }], isError: true };
    }
  }

  private async listAvailableDatastreams() {
    const knownDatastreams = [
      { name: 'token-price', description: 'Token price changes' }, { name: 'balance-change', description: 'Account balance changes' },
      { name: 'token-swap', description: 'Token swap events' }, { name: 'token-transfer', description: 'Token transfer events' },
      { name: 'nft-secondary-market-actions', description: 'NFT market activities' }, { name: 'nft-collection-listing-stats', description: 'NFT collection stats' },
      { name: 'lp-balance-changes', description: 'LP balance changes' }, { name: 'lp-creations', description: 'LP creation events' },
      { name: 'lp-deposits-withdrawals', description: 'LP deposit/withdrawal' }, { name: 'unparsed-transactions', description: 'Raw transaction data' },
      { name: 'parsed-account-updates', description: 'Parsed account updates' }, { name: 'unparsed-account-updates', description: 'Raw account updates' },
    ];
    return { content: [{ type: 'text', text: JSON.stringify({ datastreams: knownDatastreams }, null, 2) }] };
  }

  private async getApiEndpoints(args: any) {
    const content = await this.fetchDocumentationPage('/reference');
    return { content: [{ type: 'text', text: JSON.stringify({ apiReference: content, url: `${DOCS_BASE_URL}/reference` }, null, 2) }] };
  }

  private async getSetupInstructions(args: any) {
    const { type } = args;
    const pages = { 'stream-builder': '/docs/your-first-data-stream', 'sdk': '/docs/your-first-data-stream-1', 'community-sdks': '/docs/community-sdks' };
    const page = pages[type as keyof typeof pages];
    if (!page) return { content: [{ type: 'text', text: JSON.stringify({ error: `Unknown setup type: ${type}` }, null, 2) }], isError: true };
    const content = await this.fetchDocumentationPage(page);
    return { content: [{ type: 'text', text: JSON.stringify({ type, instructions: content, url: `${DOCS_BASE_URL}${page}` }, null, 2) }] };
  }

  private async answerQuestion(args: any) {
    const { question } = args;
    const searchResult = await this.searchDocumentation({ query: question, section: 'all' });
    return { content: [{ type: 'text', text: JSON.stringify({ question, answer: 'Based on search:', relevantContent: JSON.parse(searchResult.content[0].text) }, null, 2) }] };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('HelloMoon Docs MCP Server running on stdio');
  }
}

const server = new HelloMoonDocsServer();
server.run().catch(console.error);
