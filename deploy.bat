@echo off
echo 🚀 Deploying Neurotransmitter Game to GitHub Pages...

echo 📦 Building project...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
    
    git add .
    git commit -m "Deploy to GitHub Pages"
    git push origin main
    
    echo 🎉 Deployment completed!
    echo 🌐 Your game will be available at: https://roshchupkin.github.io/Neurotransmitter
    echo ⏰ It may take a few minutes for changes to appear.
) else (
    echo ❌ Build failed! Please check for errors.
    pause
    exit /b 1
)
