#!/usr/bin/env bash
# Khởi: nạp seed MySQL; Lợi: khởi động Servlet và cấu hình OTP cho bản demo.
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"
if [[ -f .env.backend.local ]]; then
  set -a
  source .env.backend.local
  set +a
fi
docker compose up -d --wait mysql_db
docker compose exec -T mysql_db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 -uroot' < backend2/src/main/resources/database/init.sql
docker compose up -d --build --wait backend2_servlet
echo "Servlet API: http://localhost:${BACKEND_HOST_PORT:-8089}/api/v1/health"
