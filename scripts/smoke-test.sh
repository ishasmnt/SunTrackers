#!/usr/bin/env bash
set -euo pipefail

# Simple smoke test for backend and frontend
# Usage: BACKEND_URL=http://localhost:5001 FRONTEND_URL=http://localhost:5173 ./scripts/smoke-test.sh

BACKEND_URL=${BACKEND_URL:-http://localhost:5001}
FRONTEND_URL=${FRONTEND_URL:-http://localhost:5173}

echo "Using BACKEND_URL=$BACKEND_URL"
echo "Using FRONTEND_URL=$FRONTEND_URL"

echo
echo "1) Checking backend /api/projects..."
projects=$(curl -sS -f "$BACKEND_URL/api/projects" || true)
if [ -z "$projects" ]; then
  echo "FAIL: /api/projects returned empty or error"
  exit 1
fi
echo "OK: /api/projects returned data"

echo
echo "2) Checking backend /api/chat (on-topic)..."
on_resp=$(curl -sS -X POST "$BACKEND_URL/api/chat" -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"How much solar do I need for 10 kWh/day?"}]}' || true)
if [ -z "$on_resp" ]; then
  echo "FAIL: /api/chat (on-topic) returned empty or error"
  exit 2
fi

if ! echo "$on_resp" | jq -e '.assistant.content' >/dev/null 2>&1; then
  echo "FAIL: on-topic response missing assistant.content"
  echo "$on_resp"
  exit 3
fi
echo "OK: on-topic chat returned assistant"

echo
echo "3) Checking backend /api/chat (off-topic)..."
off_resp=$(curl -sS -X POST "$BACKEND_URL/api/chat" -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"Which movies are trending this week?"}]}' || true)
if [ -z "$off_resp" ]; then
  echo "FAIL: /api/chat (off-topic) returned empty or error"
  exit 4
fi

# Expect the server to return a polite refusal for off-topic queries
off_text=$(echo "$off_resp" | jq -r '.assistant.content // ""')
echo "Off-topic assistant text: ${off_text:0:200}..."
if ! echo "$off_text" | grep -iq "only"; then
  echo "FAIL: off-topic response did not contain expected refusal text"
  echo "$off_resp"
  exit 5
fi
echo "OK: off-topic chat returned refusal"

echo
echo "4) Checking frontend root (HEAD request)..."
front_headers=$(curl -sS -I "$FRONTEND_URL" || true)
if echo "$front_headers" | grep -qi "200 OK"; then
  echo "OK: frontend returned 200"
else
  echo "WARN: frontend did not return 200; response headers:" 
  echo "$front_headers"
fi

echo
echo "SMOKE TESTS PASSED"
exit 0
