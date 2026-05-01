# Deploy pe Render

Repo-ul este configurat cu `render.yaml` pentru Render Blueprint.

## Servicii create

- `shopping-list-api`: backend FastAPI, runtime Docker, cu disk persistent montat la `/data`
- `shopping-list-frontend`: static site React/Vite, publicat din `frontend/dist`

## Pași

1. Urcă repo-ul pe GitHub/GitLab/Bitbucket.
2. În Render Dashboard, alege **New > Blueprint**.
3. Selectează repo-ul și confirmă fișierul `render.yaml`.
4. Render va crea automat backend-ul și frontend-ul.

## Variabile importante

Backend:

- `PORT=10000`
- `DATABASE_PATH=/data/shopping.db`
- `SECRET_KEY` este generat automat de Render
- `CORS_ORIGINS=https://shopping-list-frontend.onrender.com`

Frontend:

- `VITE_API_URL=https://shopping-list-api.onrender.com`

## Note

- Persistent disk pe Render necesită un plan plătit pentru backend; de aceea `shopping-list-api` folosește `plan: starter`.
- Dacă schimbi numele serviciilor în Render, actualizează și URL-urile din `render.yaml`:
  - `CORS_ORIGINS`
  - `VITE_API_URL`
- Local, proiectul rămâne neschimbat și rulează cu `docker compose up --build`.
