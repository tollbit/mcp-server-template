# Tollbit MCP Server Template

An open-source GitHub project template that allows developers to quickly spin up a lightweight version of the Tollbit MCP server locally for the [Open-Meteo Weather Forecast API](https://open-meteo.com/en/docs). This project serves as a public-facing boilerplate for prototyping, local development, and demos.

## About TollBit

[TollBit](https://docs.tollbit.com/) is a platform that allows you to quickly set up a paid layer in front of your website in as little as 15 minutes with no coding. This effectively puts your data behind a paywall, and allows you to immediately start charging bots for on-demand access.

### Introducing TollBit Tokens

[TollBit Tokens](https://tollbit.dev/new) give agents access to MCP servers, websites, A2A and more - without the need for separate API keys. One TollBit account gives your agent reliable access to a portfolio of 1400+ sites, APIs, agents and MCP servers to create powerful experiences.

### Key Features of TollBit Tokens

- **Auth & Security Made Simple**: Simply call the `/validate` endpoint without managing keys or cryptographic libraries
- **Dynamic Authorization**: Tokens adapt to context in real-time with access rules based on reputation scores, usage patterns, or custom logic
- **Unlock the Agent Economy**: Access premium articles, MCP servers, browser automation, and other agents seamlessly
- **Payments Just Work**: Pay-as-you-go micropayments with automatic reconciliation and real-time balance updates

## Features

- **Lightweight MCP Server**: Core Model Context Protocol server implementation
- **Optional Sidecar Container**: For logging, proxying, and monitoring
- **Docker Compose Setup**: Complete local development environment
- **GitHub Actions CI/CD**: Automated building, testing, and deployment
- **AWS ECR Integration**: Optional deployment to Amazon ECR
- **Multi-platform Support**: Builds for Linux, macOS, and Windows
- **Comprehensive Documentation**: Clear setup and usage instructions
- **AI Agent Ready**: Optimized for integration with AI agents and RAG systems
- **TollBit Token Integration**: Ready for token-based access control

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Agents     │    │   MCP Server    │    │   Sidecar       │
│   (Claude, etc) │◄──►│   (Main App)    │◄──►│   (Logging,     │
│                 │    │                 │    │    Proxy, etc)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   TollBit       │
                       │   Platform      │
                       │   (Tokens,      │
                       │    Payments,    │
                       │    Analytics)   │
                       └─────────────────┘
```

### Components

- **MCP Server**: Core server implementing the Model Context Protocol
- **Sidecar Container**: Optional companion for logging, monitoring, or proxying
- **Docker Compose**: Orchestration for local development and testing
- **TollBit Integration**: Token-based access control and payment processing

## Project Structure

```
mcp-server-template/
└── README.md             # This file
```

## Installation

```bash
npm install
npm run build
```

##  Quick Start

### Prerequisites

- Docker and Docker Compose
- TollBit account (for production deployment)

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MCP_PORT` | Server port | `8080` |



### TollBit Platform Integration

To integrate with the TollBit platform for AI agent data access:

1. **Create TollBit Account**: Visit the [TollBit Developer Dashboard](https://docs.tollbit.com/developer-introduction) to set up your organization
2. **Configure RAG Endpoints**: Set up your MCP server to serve RAG-optimized data
3. **Set Up Licensing**: Configure data licensing for AI agent consumption
4. **Enable Analytics**: Monitor AI agent usage patterns and data access
5. **Deploy to Marketplace**: Make your data available to AI agents 
