#!/usr/bin/env bash
# Khởi: cùng một WAR phục vụ JSP và Servlet. Docker Compose đọc file env, không thực thi file đó.
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"
COMPOSE=(docker compose)
if [[ -f .env.backend.local ]]; then
  COMPOSE+=(--env-file .env.backend.local)
fi
"${COMPOSE[@]}" up -d --wait mysql_db
"${COMPOSE[@]}" exec -T mysql_db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 -uroot' < backend2/src/main/resources/database/init.sql
"${COMPOSE[@]}" up -d --build --wait backend2_servlet
TASK_WEB_ADDRESS="$("${COMPOSE[@]}" port backend2_servlet 8080)"
echo "Giao diện JSP: http://${TASK_WEB_ADDRESS}/"
echo "Servlet API: http://${TASK_WEB_ADDRESS}/api/v1/health"
