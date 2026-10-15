#!/usr/bin/env bash
# Tân: chạy giao diện Next.js đã tinh gọn cho bốn luồng.
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR/client2"

echo "==================================================="
echo "  ĐANG KHỞI ĐỘNG CLIENT 2 (NEXT.JS - PORT 3001)"
echo "  BACKEND PROXY (PORT 8089)"
echo "==================================================="

echo "Đang khởi chạy Next.js Dev Server trên port 3001..."
npx next dev -p 3001
