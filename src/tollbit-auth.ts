/**
 * TollBit Token Authorization Utilities
 * Based on https://docs.tollbit.dev/experimental/tollbit-tokens
 */

import jwt from 'jsonwebtoken';
import { importJWK, jwtVerify } from 'jose';
import axios from 'axios';

export interface TollBitTokenPayload {
  iss: string; // Issuer: https://gateway.tollbit.com/foundry
  sub: string; // Subject: User's TollBit ID
  aud: string; // Audience: Host of your MCP server
  iat: number; // Issued at time
  nbf: number; // Not before time
  exp: number; // Expiration time
  jti: string; // Unique identifier (transaction ID)
}

export interface TollBitTokenHeader {
  alg: string;
  kid: string;
  typ: string;
}

export class TollBitAuth {
  private static jwksUrl = 'https://oauth.tollbit.com/.well-known/jwks.json';
  private static issuer = 'https://gateway.tollbit.com/foundry';
  private static jwksCache: any = null;
  private static cacheExpiry: number = 0;
  private static cacheDuration = 3600000; // 1 hour

  /**
   * Verify a TollBit JWT token
   */
  static async verifyToken(token: string, expectedAudience: string): Promise<TollBitTokenPayload> {
    try {
      // Get the JWKS (JSON Web Key Set)
      const jwks = await this.getJWKS();
      
      // Verify the JWT
      const { payload } = await jwtVerify(token, jwks, {
        issuer: this.issuer,
        audience: expectedAudience,
        algorithms: ['ES256'],
      });

      return payload as TollBitTokenPayload;
    } catch (error) {
      throw new Error(`Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract token from MCP tool call metadata
   */
  static extractTokenFromToolCall(toolCall: any): string | null {
    try {
      // Check if token is in the _meta field
      if (toolCall._meta?.authorization) {
        return toolCall._meta.authorization;
      }
      
      // Check if token is in the Authorization header
      if (toolCall._meta?.headers?.authorization) {
        const authHeader = toolCall._meta.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
          return authHeader.substring(7);
        }
        return authHeader;
      }

      return null;
    } catch (error) {
      console.error('Error extracting token from tool call:', error);
      return null;
    }
  }

  /**
   * Validate token and extract user information
   */
  static async validateToolCall(toolCall: any, serverHost: string): Promise<{
    isValid: boolean;
    userId?: string;
    transactionId?: string;
    error?: string;
  }> {
    try {
      const token = this.extractTokenFromToolCall(toolCall);
      
      if (!token) {
        return {
          isValid: false,
          error: 'No authorization token found in tool call'
        };
      }

      const payload = await this.verifyToken(token, serverHost);
      
      return {
        isValid: true,
        userId: payload.sub,
        transactionId: payload.jti
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Token validation failed'
      };
    }
  }

  /**
   * Get JWKS with caching
   */
  private static async getJWKS(): Promise<any> {
    const now = Date.now();
    
    // Return cached JWKS if still valid
    if (this.jwksCache && now < this.cacheExpiry) {
      return this.jwksCache;
    }

    try {
      // Fetch JWKS from TollBit
      const response = await axios.get(this.jwksUrl);
      const jwks = response.data;
      
      // Cache the JWKS
      this.jwksCache = jwks;
      this.cacheExpiry = now + this.cacheDuration;
      
      return jwks;
    } catch (error) {
      throw new Error(`Failed to fetch JWKS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Log token information for debugging
   */
  static logTokenInfo(token: string): void {
    try {
      // Decode token without verification for logging
      const decoded = jwt.decode(token, { complete: true });
      if (decoded && typeof decoded === 'object') {
        console.log('Token Info:', {
          header: decoded.header,
          payload: decoded.payload,
          signature: decoded.signature ? 'present' : 'missing'
        });
      }
    } catch (error) {
      console.error('Error decoding token for logging:', error);
    }
  }
} 