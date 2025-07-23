/**
 * Properly Flattened MCP server for  API
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || "https://contentfeedapi.machinegenerated.com";
// Hardcode the feed ID to 58 for Netflix viewership data
const FEED_ID = "58";
const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

if (!API_KEY || !SECRET_KEY) {
  console.error("API_KEY and SECRET_KEY must be provided in environment variables");
  process.exit(1);
}

// API Client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'api-key': API_KEY,
    'secret': SECRET_KEY
  }
});

// Add request/response interceptors for debugging if needed
apiClient.interceptors.request.use(request => {
  console.error(JSON.stringify({
    level: 'info',
    message: 'API Request',
    data: {
      url: request.url,
      method: request.method
    }
  }));
  return request;
});

apiClient.interceptors.response.use(
  response => {
    console.error(JSON.stringify({
      level: 'info',
      message: 'API Response Status',
      data: {
        status: response.status
      }
    }));
    return response;
  },
  error => {
    console.error(JSON.stringify({
      level: 'error',
      message: 'API Error',
      error: {
        message: error.message,
        status: error.response?.status
      }
    }));
    return Promise.reject(error);
  }
);

/**
 * Create an MCP server with capabilities for tools only
 */
const server = new Server(
  {
    name: "netflix-viewership-data-flattened",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler that lists available tools - directly exposing the four Netflix report types
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error(JSON.stringify({
    level: 'info',
    message: 'Listing available tools'
  }));
  
  return {
    tools: [
      {
        name: "discover_netflix_data_capabilities",
        description: "Provides a comprehensive guide to the Netflix viewership data available through this API. This explains how to effectively analyze trending content, compare viewership metrics, and track popularity changes over time.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "get_trending_english_tv_shows",
        description: "Retrieves Netflix's trending English-language TV shows with viewership data, rankings, and week-over-week changes.",
        inputSchema: {
          type: "object",
          properties: {
            page_num: {
              type: "integer",
              description: "Page number (0-based)",
              default: 0
            },
            page_size: {
              type: "integer",
              description: "Number of items per page",
              default: 10
            },
            published_date_from: {
              type: "string",
              format: "date",
              description: "Start date for content (YYYY-MM-DD)"
            },
            published_date_to: {
              type: "string",
              format: "date",
              description: "End date for content (YYYY-MM-DD)"
            }
          }
        }
      },
      {
        name: "get_trending_non_english_tv_shows",
        description: "Retrieves Netflix's trending non-English TV shows with viewership data, rankings, and week-over-week changes.",
        inputSchema: {
          type: "object",
          properties: {
            page_num: {
              type: "integer",
              description: "Page number (0-based)",
              default: 0
            },
            page_size: {
              type: "integer",
              description: "Number of items per page",
              default: 10
            },
            published_date_from: {
              type: "string",
              format: "date",
              description: "Start date for content (YYYY-MM-DD)"
            },
            published_date_to: {
              type: "string",
              format: "date",
              description: "End date for content (YYYY-MM-DD)"
            }
          }
        }
      },
      {
        name: "get_trending_english_movies",
        description: "Retrieves Netflix's trending English-language movies with viewership data, rankings, and week-over-week changes.",
        inputSchema: {
          type: "object",
          properties: {
            page_num: {
              type: "integer",
              description: "Page number (0-based)",
              default: 0
            },
            page_size: {
              type: "integer",
              description: "Number of items per page",
              default: 10
            },
            published_date_from: {
              type: "string",
              format: "date",
              description: "Start date for content (YYYY-MM-DD)"
            },
            published_date_to: {
              type: "string",
              format: "date",
              description: "End date for content (YYYY-MM-DD)"
            }
          }
        }
      },
      {
        name: "get_trending_non_english_movies",
        description: "Retrieves Netflix's trending non-English movies with viewership data, rankings, and week-over-week changes.",
        inputSchema: {
          type: "object",
          properties: {
            page_num: {
              type: "integer",
              description: "Page number (0-based)",
              default: 0
            },
            page_size: {
              type: "integer",
              description: "Number of items per page",
              default: 10
            },
            published_date_from: {
              type: "string",
              format: "date",
              description: "Start date for content (YYYY-MM-DD)"
            },
            published_date_to: {
              type: "string",
              format: "date",
              description: "End date for content (YYYY-MM-DD)"
            }
          }
        }
      }
    ]
  };
});

/**
 * Handler for tool calls with truly flattened approach for Netflix data
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const toolName = request.params.name;
    console.error(JSON.stringify({
      level: 'info',
      message: `Executing tool: ${toolName}`,
      data: request.params.arguments
    }));
    
    // Netflix data capabilities discovery
    if (toolName === "discover_netflix_data_capabilities") {
      // Create a comprehensive guide as a structured response
      const netflixDataGuide = {
        status: "success",
        title: "Netflix Viewership Data Capabilities Guide",
        overview: "This API provides access to Netflix's official top 10 viewership data across different content categories and languages. You can analyze trending content, view counts, hours watched, and rank changes over time.",
        availableReports: [
          {
            reportName: "get_trending_english_tv_shows",
            description: "Top 10 English-language TV shows on Netflix by viewership"
          },
          {
            reportName: "get_trending_non_english_tv_shows",
            description: "Top 10 non-English TV shows on Netflix by viewership"
          },
          {
            reportName: "get_trending_english_movies",
            description: "Top 10 English-language movies on Netflix by viewership"
          },
          {
            reportName: "get_trending_non_english_movies",
            description: "Top 10 non-English movies on Netflix by viewership"
          }
        ],
        metrics: [
          "Views count (millions)",
          "Hours viewed (millions)",
          "Rank position",
          "Week-over-week changes",
          "Percentage viewership changes"
        ],
        analysisScenarios: [
          {
            scenario: "Compare TV Shows vs. Movies popularity",
            approach: "Request both TV shows and Movies reports and compare view counts"
          },
          {
            scenario: "Analyze language preferences globally",
            approach: "Compare English vs. Non-English content performance within the same content type"
          },
          {
            scenario: "Track popularity trends over time",
            approach: "Use date parameters to request data from different time periods"
          },
          {
            scenario: "Identify sudden viewership surges",
            approach: "Look for high percentage increases in week-over-week comparisons"
          }
        ],
        responseStructure: {
          description: "Each content item contains detailed viewership statistics and comparative data",
          keyElements: [
            "headline - The title and main viewership insight",
            "body - Detailed analysis with sections for current period, previous period, and rank changes",
            "view counts - Number of unique views in millions",
            "hours viewed - Total watch time in millions of hours",
            "rank changes - Position movements with percentage viewership changes",
            "chart_media - Visual content thumbnails"
          ]
        }
      };

      return {
        content: [{
          type: "text",
          text: JSON.stringify(netflixDataGuide, null, 2)
        }]
      };
    }
    
    // Retrieve English TV Shows
    if (toolName === "get_trending_english_tv_shows") {
      const { 
        page_num = 0,
        page_size = 10,
        published_date_from,
        published_date_to
      } = request.params.arguments || {};
      
      const response = await apiClient.post('/api/content/feed', {
        feed_id: parseInt(FEED_ID),
        page_num,
        page_size,
        format: "json",
        entity_details: [
          { entity_type: "Visual Media", entity_value: "TV Show" },
          { entity_type: "Language", entity_value: "English" }
        ],
        published_date_from,
        published_date_to
      });
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            report_type: "trending_english_tv_shows",
            contents: response.data.contents,
            pagination: response.data.pagination
          }, null, 2)
        }]
      };
    }
    
    // Retrieve Non-English TV Shows
    if (toolName === "get_trending_non_english_tv_shows") {
      const { 
        page_num = 0,
        page_size = 10,
        published_date_from,
        published_date_to
      } = request.params.arguments || {};
      
      const response = await apiClient.post('/api/content/feed', {
        feed_id: parseInt(FEED_ID),
        page_num,
        page_size,
        format: "json",
        entity_details: [
          { entity_type: "Visual Media", entity_value: "TV Show" },
          { entity_type: "Language", entity_value: "Non English" }
        ],
        published_date_from,
        published_date_to
      });
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            report_type: "trending_non_english_tv_shows",
            contents: response.data.contents,
            pagination: response.data.pagination
          }, null, 2)
        }]
      };
    }
    
    // Retrieve English Movies
    if (toolName === "get_trending_english_movies") {
      const { 
        page_num = 0,
        page_size = 10,
        published_date_from,
        published_date_to
      } = request.params.arguments || {};
      
      const response = await apiClient.post('/api/content/feed', {
        feed_id: parseInt(FEED_ID),
        page_num,
        page_size,
        format: "json",
        entity_details: [
          { entity_type: "Visual Media", entity_value: "Movie" },
          { entity_type: "Language", entity_value: "English" }
        ],
        published_date_from,
        published_date_to
      });
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            report_type: "trending_english_movies",
            contents: response.data.contents,
            pagination: response.data.pagination
          }, null, 2)
        }]
      };
    }
    
    // Retrieve Non-English Movies
    if (toolName === "get_trending_non_english_movies") {
      const { 
        page_num = 0,
        page_size = 10,
        published_date_from,
        published_date_to
      } = request.params.arguments || {};
      
      const response = await apiClient.post('/api/content/feed', {
        feed_id: parseInt(FEED_ID),
        page_num,
        page_size,
        format: "json",
        entity_details: [
          { entity_type: "Visual Media", entity_value: "Movie" },
          { entity_type: "Language", entity_value: "Non English" }
        ],
        published_date_from,
        published_date_to
      });
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            report_type: "trending_non_english_movies",
            contents: response.data.contents,
            pagination: response.data.pagination
          }, null, 2)
        }]
      };
    }
    
    // Unknown tool
    throw new Error(`Unknown tool: ${toolName}`);
    
  } catch (error: unknown) {
    console.error(JSON.stringify({
      level: 'error',
      message: `Error executing tool ${request.params.name}`,
      error: error instanceof Error ? error.message : String(error)
    }));
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Unknown error occurred";
    
    return {
      content: [{
        type: "text",
        text: `Error: ${errorMessage}`
      }]
    };
  }
});

/**
 * Start the server using stdio transport
 */
async function main() {
  console.error(JSON.stringify({
    level: 'info',
    message: 'Starting Netflix Viewership MCP server with flattened tools'
  }));
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(JSON.stringify({
    level: 'error',
    message: 'Server error',
    error: error.message
  }));
  process.exit(1);
});