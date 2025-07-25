/**
 * Properly Flattened MCP server for Open-Meteo Weather API
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import { fetchWeatherApi } from 'openmeteo';
import { TollBitAuth } from './tollbit-auth.js';
import { getServerHost, isAuthEnabled, isTokenLoggingEnabled } from './config.js';

const params = {
	"latitude": 52.52,
	"longitude": 13.41,
	"hourly": "temperature_2m"
};
const url = "https://api.open-meteo.com/v1/forecast";
const responses = await fetchWeatherApi(url, params);

// Process first location. Add a for-loop for multiple locations or weather models
const response = responses[0];

// Attributes for timezone and location
const utcOffsetSeconds = response.utcOffsetSeconds();
const timezone = response.timezone();
const timezoneAbbreviation = response.timezoneAbbreviation();
const latitude = response.latitude();
const longitude = response.longitude();

const hourly = response.hourly()!;

// Note: The order of weather variables in the URL query and the indices below need to match!
const weatherData = {
	hourly: {
		time: [...Array((Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval())].map(
			(_, i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
		),
		temperature2m: hourly.variables(0)!.valuesArray()!,
	},
};

// `weatherData` now contains a simple structure with arrays for datetime and weather data
for (let i = 0; i < weatherData.hourly.time.length; i++) {
	console.log(
		weatherData.hourly.time[i].toISOString(),
		weatherData.hourly.temperature2m[i]
	);
}

/**
 * Create an MCP server with capabilities for tools only
 */
const server = new Server(
  {
    name: "open-meteo-weather-data-flattened",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler that lists available weather tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error(JSON.stringify({
    level: 'info',
    message: 'Listing available tools'
  }));
  
  return {
    tools: [
      {
        name: "discover_weather_capabilities",
        description: "Provides a comprehensive guide to the weather data available through the Open-Meteo API. Explains available weather parameters, forecasting options, and how to effectively analyze weather patterns.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "get_current_weather",
        description: "Get current weather conditions including temperature, humidity, wind, and precipitation for a specific location.",
        inputSchema: {
          type: "object",
          properties: {
            latitude: {
              type: "number",
              description: "Latitude coordinate",
              default: 52.52
            },
            longitude: {
              type: "number", 
              description: "Longitude coordinate",
              default: 13.41
            },
            temperature_unit: {
              type: "string",
              enum: ["celsius", "fahrenheit"],
              description: "Temperature unit",
              default: "celsius"
            },
            wind_speed_unit: {
              type: "string",
              enum: ["kmh", "mph", "ms", "kn"],
              description: "Wind speed unit",
              default: "kmh"
            },
            precipitation_unit: {
              type: "string",
              enum: ["mm", "inch"],
              description: "Precipitation unit",
              default: "mm"
            }
          },
          required: ["latitude", "longitude"]
        }
      },
      {
        name: "get_hourly_forecast",
        description: "Get detailed hourly weather forecast including temperature, precipitation, wind, humidity, and more for up to 7 days.",
        inputSchema: {
          type: "object",
          properties: {
            latitude: {
              type: "number",
              description: "Latitude coordinate",
              default: 52.52
            },
            longitude: {
              type: "number",
              description: "Longitude coordinate", 
              default: 13.41
            },
            hourly: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "temperature_2m", "relative_humidity_2m", "dew_point_2m",
                  "apparent_temperature", "precipitation_probability", "precipitation",
                  "rain", "showers", "snowfall", "weather_code",
                  "pressure_msl", "surface_pressure", "cloud_cover",
                  "cloud_cover_low", "cloud_cover_mid", "cloud_cover_high",
                  "visibility", "evapotranspiration", "et0_fao_evapotranspiration",
                  "vapour_pressure_deficit", "wind_speed_10m", "wind_speed_100m",
                  "wind_direction_10m", "wind_direction_100m", "wind_gusts_10m",
                  "soil_temperature_0_to_7cm", "soil_temperature_7_to_28cm",
                  "soil_temperature_28_to_100cm", "soil_temperature_100_to_255cm",
                  "soil_moisture_0_to_7cm", "soil_moisture_7_to_28cm",
                  "soil_moisture_28_to_100cm", "soil_moisture_100_to_255cm"
                ]
              },
              description: "Weather variables to include in hourly forecast",
              default: ["temperature_2m", "relative_humidity_2m", "precipitation", "wind_speed_10m"]
            },
            start_date: {
              type: "string",
              format: "date",
              description: "Start date (YYYY-MM-DD), defaults to today"
            },
            end_date: {
              type: "string", 
              format: "date",
              description: "End date (YYYY-MM-DD), defaults to 7 days from start"
            },
            timezone: {
              type: "string",
              description: "Timezone (e.g., 'auto', 'Europe/Berlin', 'America/New_York')",
              default: "auto"
            }
          },
          required: ["latitude", "longitude"]
        }
      },
      {
        name: "get_daily_forecast",
        description: "Get daily weather forecast including temperature ranges, precipitation totals, and weather summaries.",
        inputSchema: {
          type: "object",
          properties: {
            latitude: {
              type: "number",
              description: "Latitude coordinate",
              default: 52.52
            },
            longitude: {
              type: "number",
              description: "Longitude coordinate",
              default: 13.41
            },
            daily: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "temperature_2m_max", "temperature_2m_min", "apparent_temperature_max",
                  "apparent_temperature_min", "precipitation_sum", "rain_sum",
                  "showers_sum", "snowfall_sum", "precipitation_hours",
                  "precipitation_probability_max", "weather_code",
                  "sunrise", "sunset", "daylight_duration",
                  "sunshine_duration", "uv_index_max", "uv_index_clear_sky_max",
                  "wind_speed_10m_max", "wind_gusts_10m_max", "wind_direction_10m_dominant",
                  "shortwave_radiation_sum", "et0_fao_evapotranspiration"
                ]
              },
              description: "Weather variables to include in daily forecast",
              default: ["temperature_2m_max", "temperature_2m_min", "precipitation_sum", "weather_code"]
            },
            start_date: {
              type: "string",
              format: "date", 
              description: "Start date (YYYY-MM-DD), defaults to today"
            },
            end_date: {
              type: "string",
              format: "date",
              description: "End date (YYYY-MM-DD), defaults to 7 days from start"
            },
            timezone: {
              type: "string",
              description: "Timezone (e.g., 'auto', 'Europe/Berlin', 'America/New_York')",
              default: "auto"
            }
          },
          required: ["latitude", "longitude"]
        }
      },
      {
        name: "get_marine_weather",
        description: "Get marine weather forecast including wave height, wave direction, and sea temperature.",
        inputSchema: {
          type: "object",
          properties: {
            latitude: {
              type: "number",
              description: "Latitude coordinate",
              default: 52.52
            },
            longitude: {
              type: "number",
              description: "Longitude coordinate",
              default: 13.41
            },
            hourly: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "wave_height", "wave_direction", "wave_period",
                  "sea_temperature", "wind_wave_height", "wind_wave_direction",
                  "wind_wave_period", "swell_wave_height", "swell_wave_direction",
                  "swell_wave_period"
                ]
              },
              description: "Marine weather variables",
              default: ["wave_height", "wave_direction", "sea_temperature"]
            },
            start_date: {
              type: "string",
              format: "date",
              description: "Start date (YYYY-MM-DD)"
            },
            end_date: {
              type: "string", 
              format: "date",
              description: "End date (YYYY-MM-DD)"
            }
          },
          required: ["latitude", "longitude"]
        }
      },
      {
        name: "get_air_quality",
        description: "Get air quality data including PM2.5, PM10, ozone, and other pollutants.",
        inputSchema: {
          type: "object",
          properties: {
            latitude: {
              type: "number",
              description: "Latitude coordinate",
              default: 52.52
            },
            longitude: {
              type: "number",
              description: "Longitude coordinate",
              default: 13.41
            },
            hourly: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "pm10", "pm2_5", "carbon_monoxide", "nitrogen_dioxide",
                  "sulphur_dioxide", "ozone", "aerosol_optical_depth",
                  "dust", "uv_index", "uv_index_clear_sky",
                  "ammonia", "alder_pollen", "birch_pollen", "grass_pollen",
                  "mugwort_pollen", "olive_pollen", "ragweed_pollen"
                ]
              },
              description: "Air quality variables",
              default: ["pm10", "pm2_5", "ozone", "nitrogen_dioxide"]
            },
            start_date: {
              type: "string",
              format: "date",
              description: "Start date (YYYY-MM-DD)"
            },
            end_date: {
              type: "string",
              format: "date",
              description: "End date (YYYY-MM-DD)"
            }
          },
          required: ["latitude", "longitude"]
        }
      },
      {
        name: "get_historical_weather",
        description: "Get historical weather data for past dates (limited availability).",
        inputSchema: {
          type: "object",
          properties: {
            latitude: {
              type: "number",
              description: "Latitude coordinate",
              default: 52.52
            },
            longitude: {
              type: "number",
              description: "Longitude coordinate",
              default: 13.41
            },
            start_date: {
              type: "string",
              format: "date",
              description: "Start date (YYYY-MM-DD), must be in the past"
            },
            end_date: {
              type: "string",
              format: "date",
              description: "End date (YYYY-MM-DD), must be in the past"
            },
            hourly: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "temperature_2m", "relative_humidity_2m", "dew_point_2m",
                  "apparent_temperature", "precipitation", "rain", "snowfall",
                  "weather_code", "pressure_msl", "surface_pressure",
                  "cloud_cover", "wind_speed_10m", "wind_direction_10m"
                ]
              },
              description: "Historical weather variables",
              default: ["temperature_2m", "precipitation", "weather_code"]
            }
          },
          required: ["latitude", "longitude", "start_date", "end_date"]
        }
      },
      {
        name: "get_weather_alerts",
        description: "Get severe weather alerts and warnings for a specific location.",
        inputSchema: {
          type: "object",
          properties: {
            latitude: {
              type: "number",
              description: "Latitude coordinate",
              default: 52.52
            },
            longitude: {
              type: "number",
              description: "Longitude coordinate",
              default: 13.41
            }
          },
          required: ["latitude", "longitude"]
        }
      },
      {
        name: "get_geocoding",
        description: "Convert location names to coordinates for weather queries.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Location name (e.g., 'London', 'New York', 'Tokyo')"
            },
            count: {
              type: "integer",
              description: "Number of results to return",
              default: 10
            },
            language: {
              type: "string",
              description: "Language for results",
              default: "en"
            },
            format: {
              type: "string",
              enum: ["json", "xml"],
              description: "Response format",
              default: "json"
            }
          },
          required: ["name"]
        }
      }
    ]
  };
});

/**
 * Handler for weather tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    // TollBit Token Authorization (optional)
    if (isAuthEnabled()) {
      const serverHost = getServerHost();
      const authResult = await TollBitAuth.validateToolCall(request.params, serverHost);
      
      if (!authResult.isValid) {
        console.error(JSON.stringify({
          level: 'error',
          message: 'Authorization failed',
          error: authResult.error
        }));
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "error",
              error: "Authorization failed",
              message: authResult.error
            }, null, 2)
          }]
        };
      }

      console.error(JSON.stringify({
        level: 'info',
        message: 'Authorization successful',
        userId: authResult.userId,
        transactionId: authResult.transactionId
      }));

      // Log token info if enabled
      if (isTokenLoggingEnabled()) {
        const token = TollBitAuth.extractTokenFromToolCall(request.params);
        if (token) {
          TollBitAuth.logTokenInfo(token);
        }
      }
    }

    const toolName = request.params.name;
    const args = request.params.arguments || {};
    
    console.error(JSON.stringify({
      level: 'info',
      message: `Executing weather tool: ${toolName}`,
      data: args
    }));

    // Weather capabilities discovery
    if (toolName === "discover_weather_capabilities") {
      const weatherGuide = {
        status: "success",
        title: "Open-Meteo Weather API Capabilities Guide",
        overview: "This API provides comprehensive weather data including current conditions, hourly/daily forecasts, marine weather, air quality, and historical data. All data is free and available globally.",
        availableTools: [
          {
            toolName: "get_current_weather",
            description: "Current weather conditions with temperature, humidity, wind, and precipitation"
          },
          {
            toolName: "get_hourly_forecast", 
            description: "Detailed hourly forecasts for up to 7 days with multiple weather parameters"
          },
          {
            toolName: "get_daily_forecast",
            description: "Daily weather summaries with temperature ranges and precipitation totals"
          },
          {
            toolName: "get_marine_weather",
            description: "Marine weather including wave height, direction, and sea temperature"
          },
          {
            toolName: "get_air_quality",
            description: "Air quality data including PM2.5, PM10, ozone, and pollutants"
          },
          {
            toolName: "get_historical_weather",
            description: "Historical weather data for past dates (limited availability)"
          },
          {
            toolName: "get_weather_alerts",
            description: "Severe weather alerts and warnings"
          },
          {
            toolName: "get_geocoding",
            description: "Convert location names to coordinates"
          }
        ],
        weatherParameters: {
          temperature: ["temperature_2m", "apparent_temperature", "dew_point_2m"],
          precipitation: ["precipitation", "rain", "showers", "snowfall", "precipitation_probability"],
          wind: ["wind_speed_10m", "wind_direction_10m", "wind_gusts_10m"],
          humidity: ["relative_humidity_2m", "vapour_pressure_deficit"],
          pressure: ["pressure_msl", "surface_pressure"],
          clouds: ["cloud_cover", "cloud_cover_low", "cloud_cover_mid", "cloud_cover_high"],
          visibility: ["visibility", "weather_code"],
          soil: ["soil_temperature_0_to_7cm", "soil_moisture_0_to_7cm"],
          marine: ["wave_height", "wave_direction", "sea_temperature"],
          airQuality: ["pm10", "pm2_5", "ozone", "nitrogen_dioxide"]
        },
        units: {
          temperature: ["celsius", "fahrenheit"],
          windSpeed: ["kmh", "mph", "ms", "kn"],
          precipitation: ["mm", "inch"]
        },
        coverage: {
          global: "Worldwide coverage",
          resolution: "11km for most parameters",
          updateFrequency: "Real-time updates",
          forecastRange: "Up to 7 days",
          historicalData: "Limited availability for past dates"
        }
      };

      return {
        content: [{
          type: "text",
          text: JSON.stringify(weatherGuide, null, 2)
        }]
      };
    }

    // Get current weather
    if (toolName === "get_current_weather") {
      const { latitude, longitude, temperature_unit = "celsius", wind_speed_unit = "kmh", precipitation_unit = "mm" } = args;
      
      const params = {
        latitude,
        longitude,
        current: ["temperature_2m", "relative_humidity_2m", "apparent_temperature", "precipitation", "rain", "weather_code", "pressure_msl", "surface_pressure", "wind_speed_10m", "wind_direction_10m"],
        temperature_unit,
        wind_speed_unit,
        precipitation_unit
      };

      const url = "https://api.open-meteo.com/v1/forecast";
      const response = await axios.get(url, { params });
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            tool: "get_current_weather",
            location: { latitude, longitude },
            current_weather: response.data.current,
            units: { temperature_unit, wind_speed_unit, precipitation_unit }
          }, null, 2)
        }]
      };
    }

    // Get hourly forecast
    if (toolName === "get_hourly_forecast") {
      const { latitude, longitude, hourly = ["temperature_2m", "relative_humidity_2m", "precipitation", "wind_speed_10m"], start_date, end_date, timezone = "auto" } = args;
      
      const params: any = {
        latitude,
        longitude,
        hourly,
        timezone
      };
      
      if (start_date) params.start_date = start_date;
      if (end_date) params.end_date = end_date;

      const url = "https://api.open-meteo.com/v1/forecast";
      const response = await axios.get(url, { params });
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            tool: "get_hourly_forecast",
            location: { latitude, longitude },
            hourly_data: response.data.hourly,
            timezone: response.data.timezone,
            timezone_abbreviation: response.data.timezone_abbreviation,
            utc_offset_seconds: response.data.utc_offset_seconds
          }, null, 2)
        }]
      };
    }

    // Get daily forecast
    if (toolName === "get_daily_forecast") {
      const { latitude, longitude, daily = ["temperature_2m_max", "temperature_2m_min", "precipitation_sum", "weather_code"], start_date, end_date, timezone = "auto" } = args;
      
      const params: any = {
        latitude,
        longitude,
        daily,
        timezone
      };
      
      if (start_date) params.start_date = start_date;
      if (end_date) params.end_date = end_date;

      const url = "https://api.open-meteo.com/v1/forecast";
      const response = await axios.get(url, { params });
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            tool: "get_daily_forecast",
            location: { latitude, longitude },
            daily_data: response.data.daily,
            timezone: response.data.timezone,
            timezone_abbreviation: response.data.timezone_abbreviation,
            utc_offset_seconds: response.data.utc_offset_seconds
          }, null, 2)
        }]
      };
    }

    // Get marine weather
    if (toolName === "get_marine_weather") {
      const { latitude, longitude, hourly = ["wave_height", "wave_direction", "sea_temperature"], start_date, end_date } = args;
      
      const params: any = {
        latitude,
        longitude,
        hourly,
        models: "gfs_seamless"
      };
      
      if (start_date) params.start_date = start_date;
      if (end_date) params.end_date = end_date;

      const url = "https://marine-api.open-meteo.com/v1/marine";
      const response = await axios.get(url, { params });
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            tool: "get_marine_weather",
            location: { latitude, longitude },
            marine_data: response.data.hourly,
            timezone: response.data.timezone
          }, null, 2)
        }]
      };
    }

    // Get air quality
    if (toolName === "get_air_quality") {
      const { latitude, longitude, hourly = ["pm10", "pm2_5", "ozone", "nitrogen_dioxide"], start_date, end_date } = args;
      
      const params: any = {
        latitude,
        longitude,
        hourly
      };
      
      if (start_date) params.start_date = start_date;
      if (end_date) params.end_date = end_date;

      const url = "https://air-quality-api.open-meteo.com/v1/air-quality";
      const response = await axios.get(url, { params });
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            tool: "get_air_quality",
            location: { latitude, longitude },
            air_quality_data: response.data.hourly,
            timezone: response.data.timezone
          }, null, 2)
        }]
      };
    }

    // Get historical weather
    if (toolName === "get_historical_weather") {
      const { latitude, longitude, start_date, end_date, hourly = ["temperature_2m", "precipitation", "weather_code"] } = args;
      
      const params = {
        latitude,
        longitude,
        hourly,
        start_date,
        end_date
      };

      const url = "https://archive-api.open-meteo.com/v1/archive";
      const response = await axios.get(url, { params });
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            tool: "get_historical_weather",
            location: { latitude, longitude },
            historical_data: response.data.hourly,
            timezone: response.data.timezone
          }, null, 2)
        }]
      };
    }

    // Get weather alerts
    if (toolName === "get_weather_alerts") {
      const { latitude, longitude } = args;
      
      const params = {
        latitude,
        longitude
      };

      const url = "https://api.open-meteo.com/v1/forecast";
      const response = await axios.get(url, { params });
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            tool: "get_weather_alerts",
            location: { latitude, longitude },
            alerts: response.data.alerts || null
          }, null, 2)
        }]
      };
    }

    // Get geocoding
    if (toolName === "get_geocoding") {
      const { name, count = 10, language = "en", format = "json" } = args;
      
      const params = {
        name,
        count,
        language,
        format
      };

      const url = "https://geocoding-api.open-meteo.com/v1/search";
      const response = await axios.get(url, { params });
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "success",
            tool: "get_geocoding",
            search_term: name,
            results: response.data.results || []
          }, null, 2)
        }]
      };
    }

    // Unknown tool
    throw new Error(`Unknown weather tool: ${toolName}`);
    
  } catch (error: unknown) {
    console.error(JSON.stringify({
      level: 'error',
      message: `Error executing weather tool ${request.params.name}`,
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
    message: 'Starting Open-Meteo Weather MCP server with comprehensive weather tools'
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