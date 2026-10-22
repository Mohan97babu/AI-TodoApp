#!/bin/sh
# Run: sh ./start-docker.sh   (requires Docker + Compose, not Python or local Qwen)
set -eu
cd "$(dirname "$0")"
if [ ! -f .env ]; then
  umask 077
  random_secret() { od -An -N48 -tx1 /dev/urandom | tr -d ' \n'; }
  DB_PASSWORD="$(random_secret)"
  JWT_SECRET="$(random_secret)"
  cat > .env <<EOF
# Locally generated secrets. Never commit this file.
DB_NAME=tododb
DB_USER=planify
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
OLLAMA_MODEL=qwen3:1.7b
OPENAI_API_KEY=CHANGE_ME_TO_YOUR_STANDALONE_GATEWAY_TOKEN
OPENAI_API_URL=http://localhost:8000/v1/chat/completions
OPENAI_MODEL=qwen3-1.7b
CORS_ALLOWED_ORIGINS=http://localhost:5174,http://localhost:5173
EOF
  echo "Generated .env with unique database and JWT secrets."
else
  echo "Using existing .env; no credentials were overwritten."
fi

if grep -E '^(DB_PASSWORD|JWT_SECRET)=CHANGE_ME' .env >/dev/null; then
  echo "ERROR: replace DB_PASSWORD and JWT_SECRET placeholders in .env first." >&2
  exit 1
fi

docker compose config --quiet
echo "Starting PostgreSQL, backend, frontend and Ollama (downloads Qwen3 once into Docker volume)..."
docker compose up --build -d
docker compose ps
echo "Open http://localhost:5174/"
echo "To see model download progress: docker compose logs -f ollama-init"
