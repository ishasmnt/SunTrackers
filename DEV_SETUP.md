# Dev setup & quick smoke test

This project contains a tiny smoke-test script to quickly verify the backend and frontend are running correctly on your machine.

Prerequisites
- Node (develop with Node &gt;= 20.19 or 22.x). We recommend using nvm and Node 22.
- jq (used by the smoke-test script). Install on macOS: `brew install jq`.

Start servers
- Backend (from project root):
  ```bash
  cd backend
  # make sure you have GROQ_API_KEY in backend/.env or environment
  node index.js
  ```

- Frontend (from project root):
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

Run smoke tests
- From project root (defaults):
  ```bash
  ./scripts/smoke-test.sh
  ```

- To override ports/hosts:
  ```bash
  BACKEND_URL=http://localhost:5001 FRONTEND_URL=http://localhost:5173 ./scripts/smoke-test.sh
  ```

The script performs:
- GET /api/projects
- POST /api/chat with an on-topic message (expects assistant content)
- POST /api/chat with an off-topic message (expects a polite refusal)
- HEAD request to frontend root

If any check fails the script exits with a non-zero code and prints diagnostic output.
