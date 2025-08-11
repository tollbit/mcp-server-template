# Open‑Meteo Weather MCP Server Template
An open-source GitHub project template that allows developers to quickly spin up a lightweight MCP server 
for the [Open-Meteo Weather Forecast API](https://open-meteo.com/en/docs). This project serves as a 
public-facing boilerplate for prototyping, local development, and demos with comprehensive weather data 
tools.

## Why Use This?
- Agent‑ready MCP tools for weather data in minutes
- Optional TollBit Tokens for per‑request authorization and monetization
- No API keys needed for Open‑Meteo; simple Docker/Node flows

## Installation
```bash
npm install
npm run build
```

## Quick Start
Run locally:
```bash
npm start
```
Test with MCP Inspector:
```bash
npm run inspector
```
Minimal tool call (hourly forecast):
```json
{
  "name": "get_hourly_forecast",
  "arguments": { "latitude": 52.52, "longitude": 13.41 }
}
```
Using TollBit Tokens (passed via _meta.authorization):
```json
{
  "name": "get_current_weather",
  "arguments": { "latitude": 40.71, "longitude": -74.00 },
  "_meta": { "authorization": "Bearer <tollbit_jwt>" }
}
```

## Key Features
- Current, hourly, daily, marine, air‑quality, historical weather tools
- Optional TollBit JWT verification via JWKS for hosted/paid flows
- Global coverage; rich parameter/unit options; TypeScript implementation

## Documentation
- Full Documentation: see this README and `TOLBIT_INTEGRATION.md`
- API Reference: Open‑Meteo Weather API — [open‑meteo.com/en/docs](https://open-meteo.com/en/docs)
- Examples: tool definitions and handlers in `src/index.ts`

## Common Use Cases
- Pay‑per‑request weather tools gated by TollBit Tokens
- Authenticated enterprise weather access for agents
- Usage tracking and per‑user/metered analytics

## Requirements
- Node.js 18+ and npm
- Optional: Docker (for containerized runs)

## Support
- Open‑Meteo Docs: [open‑meteo.com/en/docs](https://open-meteo.com/en/docs)
- TollBit Docs: [docs.tollbit.com](https://docs.tollbit.com/)
- TollBit Tokens: [docs.tollbit.dev/experimental/tollbit-tokens](https://docs.tollbit.dev/experimental/tollbit-tokens)
- Issues / Discussions: use this repository’s GitHub issues/discussions

### License
MIT — see `LICENSE`.

---

### How This Fits in the TollBit Toolbox
This MCP server provides weather tools that can be authorized by TollBit Tokens. The TollBit gateway signs a short‑lived JWT per tool call; your server verifies it, so you can:
- Accept only TollBit‑proven, paid traffic
- Identify the calling user (`sub`) and transaction (`jti`) for rate limits/analytics
- Avoid distributing API keys to agents
See JWT format and JWKS details: [TollBit Tokens](https://docs.tollbit.dev/experimental/tollbit-tokens).

### MCP Configuration
Claude Desktop snippet:
```json
{
  "mcpServers": {
    "open-meteo-weather": {
      "command": "node",
      "args": ["build/index.js"],
      "env": {
        "TOLLBIT_SERVER_HOST": "https://your-mcp-server.com",
        "TOLLBIT_ENABLE_AUTH": "true",
        "TOLLBIT_LOG_TOKENS": "false"
      }
    }
  }
}
```
Minimal tool calls:
```json
{ "name": "get_current_weather", "arguments": { "latitude": 40.71, "longitude": -74.00 } }
{ "name": "get_daily_forecast",  "arguments": { "latitude": 34.05, "longitude": -118.24 } }
{ "name": "get_geocoding",       "arguments": { "name": "Berlin" } }
```

### Authentication (TollBit)
How to authenticate with TollBit Tokens:
- TollBit issues a JWT per tool call (issuer `https://gateway.tollbit.com/foundry`).
- Client includes it as `Bearer <token>` in `_meta.authorization`.
- Server verifies signature using JWKS at `https://oauth.tollbit.com/.well-known/jwks.json` (kid rotates).
- Claims to validate: `iss`, `aud` (your host), `exp/nbf/iat`, and `jti` (nonce/transaction).
Quick config (optional):
```bash
TOLLBIT_SERVER_HOST=https://your-mcp-server.com
TOLLBIT_ENABLE_AUTH=true
TOLLBIT_LOG_TOKENS=false
```
See `TOLBIT_INTEGRATION.md` for details.

### Error Handling
- Missing/invalid JWT: ensure requests flow via TollBit and `_meta.authorization` is present.
- Audience mismatch: set `TOLLBIT_SERVER_HOST` to your public MCP host.
- Expired token: tokens expire in ~5 minutes; make fresh calls.
- JWKS issues: verify network access and `kid` rotation.

### Advanced Usage
- Add/extend tools in `src/index.ts` (hourly/daily/marine/air‑quality/historical).
- Use geocoding to fetch coordinates before forecast queries.
- Deep‑dive into token flow: `TOLBIT_INTEGRATION.md` and [TollBit Tokens](https://docs.tollbit.dev/experimental/tollbit-tokens). 
