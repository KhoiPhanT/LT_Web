#!/usr/bin/env bash
# JSP được Tomcat phục vụ cùng Servlet; không có tiến trình frontend riêng.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
COMPOSE=(docker compose)
if [[ -f .env.backend.local ]]; then COMPOSE+=(--env-file .env.backend.local); fi
TASK_WEB_ADDRESS="$("${COMPOSE[@]}" port backend2_servlet 8080)"
echo "Mở giao diện JSP: http://${TASK_WEB_ADDRESS}/"
