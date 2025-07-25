# Open-Meteo Weather MCP Server Template

An open-source GitHub project template that allows developers to quickly spin up a lightweight MCP server for the [Open-Meteo Weather Forecast API](https://open-meteo.com/en/docs). This project serves as a public-facing boilerplate for prototyping, local development, and demos with comprehensive weather data tools.

## About TollBit

[TollBit](https://docs.tollbit.com/) is a platform that allows you to quickly set up a paid layer in front of your website in as little as 15 minutes with no coding. This effectively puts your data behind a paywall, and allows you to immediately start charging bots for on-demand access.

### Introducing TollBit Tokens

[TollBit Tokens](https://docs.tollbit.dev/experimental/tollbit-tokens) give agents access to MCP servers, websites, A2A and more - without the need for separate API keys. One TollBit account gives your agent reliable access to a portfolio of 1400+ sites, APIs, agents and MCP servers to create powerful experiences.

### Key Features of TollBit Tokens

- **Dynamic Authorization**: Tokens adapt to context in real-time with access rules based on reputation scores, usage patterns, or custom logic
- **Unlock the Agent Economy**: Access premium articles, MCP servers, browser automation, and other agents seamlessly
- **Payments Just Work**: Pay-as-you-go micropayments with automatic reconciliation and real-time balance updates

## Features

- **Comprehensive Weather Tools**: 9 different weather data tools covering current conditions, forecasts, marine weather, air quality, and more
- **Open-Meteo API Integration**: Direct integration with the free Open-Meteo weather API
- **Lightweight MCP Server**: Core Model Context Protocol server implementation
- **Docker Support**: Containerized deployment with Docker
- **TypeScript Implementation**: Full TypeScript support with proper type definitions
- **Global Weather Coverage**: Worldwide weather data access
- **Multiple Weather Parameters**: Temperature, precipitation, wind, humidity, pressure, clouds, visibility, soil, marine, and air quality
- **Real-time Updates**: Live weather information and forecasts
- **AI Agent Ready**: Optimized for integration with AI agents and RAG systems
- **TollBit Token Integration**: Ready for token-based access control

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Agents     │    │   MCP Server    │    │   Open-Meteo    │
│   (Claude, etc) │◄──►│   (Weather      │◄──►│   Weather API   │
│                 │    │    Tools)       │    │                 │
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

- **MCP Server**: Core server implementing the Model Context Protocol with weather tools
- **Weather Tools**: 9 comprehensive tools for different weather data types
- **Open-Meteo API**: Free weather data API with global coverage
- **Docker Container**: Containerized deployment for easy scaling
- **TollBit Integration**: Token-based access control and payment processing

## Project Structure

```
mcp-server-template/
├── README.md                    # Project documentation
├── package.json                 # Node.js dependencies and scripts
├── package-lock.json            # Locked dependency versions
├── tsconfig.json               # TypeScript configuration
├── Dockerfile                  # Docker container definition
├── .gitignore                  # Git ignore patterns
├── LICENSE                     # MIT license
├── claude_desktop_config.json  # Claude Desktop MCP configuration
├── TOLBIT_INTEGRATION.md       # TollBit token integration guide
├── build/                      # Compiled JavaScript output
├── node_modules/               # Node.js dependencies
└── src/
    ├── index.ts                # Main MCP server implementation
    ├── tollbit-auth.ts         # TollBit token verification utilities
    └── config.ts               # Configuration management
```

## Installation

```bash
npm install
npm run build
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker (optional, for containerized deployment)

### Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build the Project**:
   ```bash
   npm run build
   ```

3. **Run the Server**:
   ```bash
   npm start
   ```

4. **Test with MCP Inspector**:
   ```bash
   npm run inspector
   ```

### Docker Deployment

1. **Build the Container**:
   ```bash
   docker build -t mcp-weather-server .
   ```

2. **Run the Container**:
   ```bash
   docker run -p 8080:8080 mcp-weather-server
   ```

## Available Weather Tools

The MCP server provides 9 comprehensive weather tools:

### Core Weather Tools
- **`get_current_weather`** - Current conditions (temperature, humidity, wind, precipitation)
- **`get_hourly_forecast`** - Detailed hourly forecasts for up to 7 days
- **`get_daily_forecast`** - Daily weather summaries with temperature ranges

### Specialized Weather Tools
- **`get_marine_weather`** - Marine forecasts (wave height, direction, sea temperature)
- **`get_air_quality`** - Air quality data (PM2.5, PM10, ozone, pollutants)
- **`get_historical_weather`** - Historical weather data for past dates
- **`get_weather_alerts`** - Severe weather alerts and warnings

### Utility Tools
- **`get_geocoding`** - Convert location names to coordinates
- **`discover_weather_capabilities`** - Comprehensive guide to all available weather data

## Configuration

### Environment Variables

The server uses the Open-Meteo API which is free and doesn't require API keys. For TollBit token integration, you can set these optional environment variables:

```bash
# TollBit Token Configuration (Optional)
TOLLBIT_SERVER_HOST=https://your-mcp-server.com  # Your server's host URL
TOLLBIT_ENABLE_AUTH=true                         # Enable token authorization
TOLLBIT_LOG_TOKENS=false                         # Enable token logging for debugging
```

### Weather Parameters

The server supports a wide range of weather parameters:

- **Temperature**: `temperature_2m`, `apparent_temperature`, `dew_point_2m`
- **Precipitation**: `precipitation`, `rain`, `showers`, `snowfall`, `precipitation_probability`
- **Wind**: `wind_speed_10m`, `wind_direction_10m`, `wind_gusts_10m`
- **Humidity**: `relative_humidity_2m`, `vapour_pressure_deficit`
- **Pressure**: `pressure_msl`, `surface_pressure`
- **Clouds**: `cloud_cover`, `cloud_cover_low`, `cloud_cover_mid`, `cloud_cover_high`
- **Visibility**: `visibility`, `weather_code`
- **Soil**: `soil_temperature_0_to_7cm`, `soil_moisture_0_to_7cm`
- **Marine**: `wave_height`, `wave_direction`, `sea_temperature`
- **Air Quality**: `pm10`, `pm2_5`, `ozone`, `nitrogen_dioxide`

### Units

- **Temperature**: `celsius`, `fahrenheit`
- **Wind Speed**: `kmh`, `mph`, `ms`, `kn`
- **Precipitation**: `mm`, `inch`

## TollBit Platform Integration

To integrate with the TollBit platform for AI agent data access:

1. **Create TollBit Account**: Visit the [TollBit Developer Dashboard](https://docs.tollbit.com/developer-introduction) to set up your organization
2. **Configure Weather Endpoints**: Set up your MCP server to serve weather data with access control
3. **Set Up Licensing**: Configure data licensing for AI agent consumption
4. **Enable Analytics**: Monitor AI agent usage patterns and weather data access
5. **Deploy to Marketplace**: Make your weather data available to AI agents

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

- **Open-Meteo API**: [Documentation](https://open-meteo.com/en/docs)
- **TollBit Platform**: [Developer Documentation](https://docs.tollbit.com/)
- **TollBit Tokens**: [Token Integration Guide](TOLBIT_INTEGRATION.md)
- **MCP Protocol**: [Model Context Protocol](https://modelcontextprotocol.io/) 
