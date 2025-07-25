/**
 * Configuration for TollBit Token Authorization
 */

export interface TollBitConfig {
  serverHost: string;
  enableAuth: boolean;
  logTokens: boolean;
}

// Default configuration
export const tollBitConfig: TollBitConfig = {
  // Replace with your actual MCP server host
  serverHost: process.env.TOLLBIT_SERVER_HOST || 'https://mcp-weather-server.example.com',
  
  // Enable/disable token authorization
  enableAuth: process.env.TOLLBIT_ENABLE_AUTH !== 'false',
  
  // Enable token logging for debugging
  logTokens: process.env.TOLLBIT_LOG_TOKENS === 'true'
};

/**
 * Get the server host for token validation
 */
export function getServerHost(): string {
  return tollBitConfig.serverHost;
}

/**
 * Check if authorization is enabled
 */
export function isAuthEnabled(): boolean {
  return tollBitConfig.enableAuth;
}

/**
 * Check if token logging is enabled
 */
export function isTokenLoggingEnabled(): boolean {
  return tollBitConfig.logTokens;
} 