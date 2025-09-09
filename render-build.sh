#!/bin/bash
# Render build script for BRACU Research Repository

echo "Installing backend dependencies..."
npm install

echo "Installing frontend dependencies..."
cd client
npm install

echo "Building frontend..."
npm run build

echo "Going back to root..."
cd ..

echo "Build completed successfully!"
