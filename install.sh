# 启动脚本
#!/bin/bash

if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    echo "Found frontend; attempting to build..."
    if command -v npm >/dev/null 2>&1; then
        cd frontend
        echo "Installing frontend dependencies..."
        npm install
        echo "Building frontend (vite)..."
        npm run build
        cd ..
    else
        echo "npm not found. Skipping frontend build. Install Node/npm to build frontend."
    fi
fi

if [ -d "backend" ] && [ -f "backend/package.json" ]; then
    cd backend
    npm install
    cd ..
fi

# 启动服务-测试
npx serve -s frontend/public -l 3000