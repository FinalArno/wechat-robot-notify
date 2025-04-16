#!/bin/bash
set -e  # 遇到错误立即退出

echo "Starting deployment..."

# SSH 连接并执行远程命令
ssh arno001 << 'EOF'
  cd /usr/www/wechat-robot-notify || exit 1
  
  echo "Pulling latest code..."
  git pull
  
  echo "Stopping service..."
  npm run stop
  
  # 等待服务完全停止
  sleep 2
  
  echo "Starting service..."
  npm run start
  
  echo "Deployment completed!"
EOF