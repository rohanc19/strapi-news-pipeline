#!/bin/bash
set -e

# Install dependencies
yarn install --network-timeout 600000

# Build Strapi
yarn build

# Print success message
echo "Build completed successfully!"
