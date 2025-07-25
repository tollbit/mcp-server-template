# TollBit Token Integration Guide

This guide explains how to integrate TollBit token authorization into your MCP server for secure, paid access to your weather data.

## Overview

TollBit Tokens provide a secure way to authorize and monetize access to your MCP server. When users make tool calls through TollBit's platform, a signed JWT token is generated and sent to your server for verification.

## Features

- **Secure Authorization**: JWT-based token verification using TollBit's public keys
- **User Identification**: Extract user IDs and transaction IDs from tokens
- **Rate Limiting**: Track usage per user for custom rate limiting
- **Payment Integration**: Ensure payment has been processed before serving data
- **Optional Integration**: Can be enabled/disabled via environment variables

## Installation

1. **Install Dependencies**:
   ```bash
   npm install jsonwebtoken jose
   npm install --save-dev @types/jsonwebtoken
   ```

2. **Build the Project**:
   ```bash
   npm run build
   ```

## Configuration

### Environment Variables

Set these environment variables to configure TollBit token integration:

```bash
# Your MCP server's host URL (required for token validation)
TOLLBIT_SERVER_HOST=https://your-mcp-server.com

# Enable/disable token authorization (default: true)
TOLLBIT_ENABLE_AUTH=true

# Enable token logging for debugging (default: false)
TOLLBIT_LOG_TOKENS=false
```

### Configuration Options

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `TOLLBIT_SERVER_HOST` | Your MCP server's host URL | `https://mcp-weather-server.example.com` | Yes |
| `TOLLBIT_ENABLE_AUTH` | Enable token authorization | `true` | No |
| `TOLLBIT_LOG_TOKENS` | Log token details for debugging | `false` | No |

## How It Works

### 1. Token Generation
When a user makes a tool call through TollBit:
- TollBit generates a signed JWT token
- Token contains user ID, transaction ID, and server host
- Token is sent in the `_meta.authorization` field of the tool call

### 2. Token Verification
Your MCP server:
- Extracts the token from the tool call
- Verifies the signature using TollBit's public keys
- Validates the token claims (issuer, audience, expiration)
- Extracts user information for tracking

### 3. Authorization Flow
```
User Request → TollBit Platform → JWT Token → Your MCP Server
     ↓              ↓                ↓              ↓
   Tool Call    Generate Token   Verify Token   Serve Data
```

## Token Structure

TollBit tokens are JWTs with the following claims:

```json
{
  "iss": "https://gateway.tollbit.com/foundry",
  "sub": "user-tollbit-id",
  "aud": "https://your-mcp-server.com",
  "iat": 1750960739,
  "nbf": 1750960679,
  "exp": 1750961039,
  "jti": "tx-12345"
}
```

### Claims Explained

- **`iss`** (Issuer): Always `https://gateway.tollbit.com/foundry`
- **`sub`** (Subject): User's TollBit ID
- **`aud`** (Audience): Your MCP server's host
- **`iat`** (Issued At): Token creation timestamp
- **`nbf`** (Not Before): Token validity start (1 minute before `iat`)
- **`exp`** (Expiration): Token expiry (5 minutes after `iat`)
- **`jti`** (JWT ID): Unique transaction ID

## Implementation Details

### File Structure

```
src/
├── index.ts           # Main MCP server with token integration
├── tollbit-auth.ts    # Token verification utilities
└── config.ts          # Configuration management
```

### Key Components

1. **`TollBitAuth` Class**: Handles token verification and extraction
2. **Configuration**: Environment-based settings
3. **Integration**: Seamless integration with existing tool handlers

### Token Extraction

The server extracts tokens from multiple locations:

```typescript
// From _meta.authorization
if (toolCall._meta?.authorization) {
  return toolCall._meta.authorization;
}

// From Authorization header
if (toolCall._meta?.headers?.authorization) {
  const authHeader = toolCall._meta.headers.authorization;
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return authHeader;
}
```

## Usage Examples

### Basic Integration

The token verification is automatically integrated into your tool handlers:

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Token verification happens automatically
  if (isAuthEnabled()) {
    const authResult = await TollBitAuth.validateToolCall(request.params, serverHost);
    if (!authResult.isValid) {
      return { content: [{ type: "text", text: "Authorization failed" }] };
    }
  }
  
  // Your tool logic here
  const result = await executeWeatherTool(request.params);
  return result;
});
```

### Custom Rate Limiting

Use the user ID for custom rate limiting:

```typescript
const authResult = await TollBitAuth.validateToolCall(request.params, serverHost);
if (authResult.isValid) {
  const userId = authResult.userId;
  const transactionId = authResult.transactionId;
  
  // Implement your rate limiting logic
  if (isRateLimited(userId)) {
    return { content: [{ type: "text", text: "Rate limit exceeded" }] };
  }
}
```

### Transaction Tracking

Track usage with transaction IDs:

```typescript
const authResult = await TollBitAuth.validateToolCall(request.params, serverHost);
if (authResult.isValid) {
  // Log the transaction for analytics
  logTransaction({
    userId: authResult.userId,
    transactionId: authResult.transactionId,
    tool: request.params.name,
    timestamp: new Date().toISOString()
  });
}
```

## Testing

### Enable Token Logging

Set `TOLLBIT_LOG_TOKENS=true` to see token details in logs:

```bash
TOLLBIT_LOG_TOKENS=true npm start
```

### Disable Authorization

For development/testing, disable token verification:

```bash
TOLLBIT_ENABLE_AUTH=false npm start
```

### Test Token

Use the example token from the [TollBit documentation](https://docs.tollbit.dev/experimental/tollbit-tokens):

```
eyJhbGciOiJFUzI1NiIsImtpZCI6Im1jcF9rZXlfMDEiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJodHRwczovL21jcC5leGFtcGxlLmNvbSIsImV4cCI6MTc1MDk2MTAzOSwiaWF0IjoxNzUwOTYwNzM5LCJpc3MiOiJodHRwczovL2dhdGV3YXkudG9sbGJpdC5jb20vZm91bmRyeSIsImp0aSI6InR4LTEyMzQ1IiwibmJmIjoxNzUwOTYwNjc5LCJzdWIiOiJ0ZXN0LXVzZXItaWQifQ.3gEkFa-CbJYDZLnoy0OuOR2zWkMDxsNRC-LMnWytHguNdc7GmpCxYbuMGk3vj0Oa4P-qIqnwRafZ2Nn2YFXlwA
```

## Security Considerations

### Token Validation

- **Signature Verification**: Uses TollBit's public keys from JWKS
- **Expiration Check**: Tokens expire after 5 minutes
- **Replay Protection**: Uses `jti` (transaction ID) as nonce
- **Audience Validation**: Ensures token is for your server

### Best Practices

1. **Always verify tokens** in production
2. **Use HTTPS** for your MCP server
3. **Log failed authorizations** for monitoring
4. **Implement rate limiting** per user
5. **Cache JWKS** to reduce API calls

### Error Handling

The integration handles various error scenarios:

- Missing tokens
- Invalid signatures
- Expired tokens
- Wrong audience
- Network errors

## Troubleshooting

### Common Issues

1. **"No authorization token found"**
   - Check if token is being sent in `_meta.authorization`
   - Verify TollBit platform configuration

2. **"Token verification failed"**
   - Check server host matches token audience
   - Verify network connectivity to JWKS endpoint
   - Check token expiration

3. **"JWKS fetch failed"**
   - Network connectivity issues
   - TollBit JWKS endpoint changes
   - DNS resolution problems

### Debug Mode

Enable debug logging:

```bash
TOLLBIT_LOG_TOKENS=true TOLLBIT_ENABLE_AUTH=true npm start
```

## Integration with TollBit Platform

1. **Register your MCP server** with TollBit
2. **Set up pricing** for your weather data
3. **Configure access rules** and rate limits
4. **Monitor usage** through TollBit dashboard

## Support

- **TollBit Documentation**: [https://docs.tollbit.dev/experimental/tollbit-tokens](https://docs.tollbit.dev/experimental/tollbit-tokens)
- **JWKS Endpoint**: [https://oauth.tollbit.com/.well-known/jwks.json](https://oauth.tollbit.com/.well-known/jwks.json)
- **JWT Debugger**: [https://jwt.io](https://jwt.io)

## License

This integration is part of the MIT-licensed MCP server template. 