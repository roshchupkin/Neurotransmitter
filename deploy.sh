#!/bin/bash

# Deploy script for Neurotransmitter Game
echo "🚀 Deploying Neurotransmitter Game to GitHub Pages..."

# Build the project
echo "📦 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Add all changes
    git add .
    
    # Commit changes
    git commit -m "Deploy to GitHub Pages"
    
    # Push to GitHub
    git push origin main
    
    echo "🎉 Deployment completed!"
    echo "🌐 Your game will be available at: https://roshchupkin.github.io/Neurotransmitter"
    echo "⏰ It may take a few minutes for changes to appear."
else
    echo "❌ Build failed! Please check for errors."
    exit 1
fi
