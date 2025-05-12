#!/bin/bash
set -e

echo "Starting build process..."

# Clean node_modules to ensure a fresh install
echo "Cleaning node_modules..."
rm -rf node_modules

# Install dependencies with increased network timeout
echo "Installing dependencies..."
yarn install --network-timeout 600000 --force

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p .tmp

# Build Strapi with increased memory limit
echo "Building Strapi admin panel..."
NODE_OPTIONS="--max-old-space-size=4096" yarn build

# Print success message
echo "Build completed successfully!"
