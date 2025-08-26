@echo off
REM 动态模式构建脚本 - Windows版本
REM 用于Vercel、服务器等动态部署环境

setlocal enabledelayedexpansion

echo 🚀 开始动态模式构建...

REM 设置默认内存配置
set "NODE_OPTIONS=--max_old_space_size=2048 --max-semi-space-size=96"
echo 🔧 Node.js 选项: %NODE_OPTIONS%

REM 设置环境变量
set "INIT_CWD=%CD%"

REM 确保不在静态模式
set "EXPORT="
set "STATIC_MODE="

echo 🔍 执行模式检查...
call npm run check-mode
if !errorlevel! neq 0 (
    echo ❌ 模式检查失败
    exit /b 1
)

echo 📝 步骤 1: 生成内容索引...
set "NODE_OPTIONS=--max_old_space_size=2048 --max-semi-space-size=64 --expose-gc"
node scripts/generate-content.mjs
if !errorlevel! neq 0 (
    echo ❌ 内容生成失败
    exit /b 1
)

echo ⏱️  等待内存释放...
timeout /t 2 /nobreak >nul

echo 🏗️  步骤 2: Next.js 构建...
set "NODE_OPTIONS=--max_old_space_size=2048 --max-semi-space-size=96"
call next build
if !errorlevel! neq 0 (
    echo ❌ Next.js 构建失败
    exit /b 1
)

echo ⏱️  等待内存释放...
timeout /t 1 /nobreak >nul

echo 📦 步骤 3: 执行构建后处理...
set "NODE_OPTIONS=--experimental-json-modules --max_old_space_size=512"
node ./scripts/postbuild.mjs
if !errorlevel! neq 0 (
    echo ❌ 构建后处理失败
    exit /b 1
)

echo ✅ 动态模式构建完成！
echo.
echo 📂 构建产物位置:
echo   .next/          - Next.js 构建文件
echo   public/         - 静态资源文件
echo   ├── blog-assets/  - 博客资源文件
echo   └── blog-assets-manifest.json - 资源清单
echo.
echo 🚀 启动生产服务器:
echo   npm run serve:dynamic
echo.
echo 🔍 验证服务器:
echo   curl -I http://localhost:3000

endlocal