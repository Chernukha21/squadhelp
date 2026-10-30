#!/usr/bin/env bash

set -euo pipefail

COMPOSE_FILE="docker-compose-dev.yaml"
started_at=$(date +"%s")

echo "-----> Building and starting development containers"
docker compose --file "$COMPOSE_FILE" up --detach --build

echo "-----> Waiting for PostgreSQL"

until docker compose --file "$COMPOSE_FILE" exec -T db-dev \
  pg_isready -U postgres -d todo-dev > /dev/null 2>&1
do
  sleep 1
done

echo "-----> Running Sequelize migrations"
docker compose --file "$COMPOSE_FILE" exec -T server-dev \
  npx sequelize-cli db:migrate

echo "-----> Running Sequelize seeders"
docker compose --file "$COMPOSE_FILE" exec -T server-dev \
  npx sequelize-cli db:seed:all

ended_at=$(date +"%s")
minutes=$(((ended_at - started_at) / 60))
seconds=$(((ended_at - started_at) % 60))

echo "-----> Application is ready"
echo "-----> Client: http://localhost:5000"
echo "-----> API: http://localhost:3000"
echo "-----> Done in ${minutes}m${seconds}s"
