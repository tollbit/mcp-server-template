# Use official Node.js LTS image
FROM node:20-alpine

WORKDIR /app

# Install build tools for native modules (if needed)
RUN apk add --no-cache python3 make g++

# Copy all files (including source code and package files)
COPY . .

# Install dependencies (now source code is present for build step)
RUN npm install

# Build the TypeScript code (optional, since prepare already does it)
# RUN npm run build

# Expose any necessary ports (not strictly needed for stdio MCP, but for future HTTP use)
# EXPOSE 3000

# Command to run the MCP server
CMD ["npm", "start"] 

