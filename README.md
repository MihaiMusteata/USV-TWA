# Lista de cumparaturi

Aplicatie full-stack pentru gestionarea unei liste de cumparaturi, cu autentificare JWT, produse per utilizator, filtre, mod light/dark si deployment pe Kubernetes.

## Demo live

Aplicatia este disponibila aici:

[https://mihail-musteata.mibo.monster](https://mihail-musteata.mibo.monster)

API health check:

[https://mihail-musteata.mibo.monster/api/healthz](https://mihail-musteata.mibo.monster/api/healthz)

## Screenshot-uri

### Autentificare in Dark Mode

![Autentificare Dark Mode](screenshots/Screenshot%202026-05-02%20at%2012.47.37.png)

### Dashboard in Dark Mode

![Dashboard Dark Mode](screenshots/Screenshot%202026-05-02%20at%2012.48.14.png)

### Dashboard in Light Mode

![Dashboard Light Mode](screenshots/Screenshot%202026-05-02%20at%2012.48.28.png)

### Lista cu produse

![Lista cu produse](screenshots/Screenshot%202026-05-02%20at%2012.49.22.png)

## Tehnologii folosite

- Backend: Python, FastAPI, SQLite
- Frontend: React, Vite, TypeScript
- Styling: Tailwind CSS prin CDN
- Autentificare: JWT access token + JWT refresh token, parole hash-uite cu bcrypt
- UI: React Toastify, Iconify, Light Mode / Dark Mode
- Infrastructura locala: Docker, Docker Compose
- Deployment: Kubernetes pe DigitalOcean, Traefik reverse proxy, HTTPS cu certificate automate
- CI/CD: GitHub Actions + DigitalOcean Container Registry

## Functionalitati

- Inregistrare utilizator
- Autentificare si logout
- Access token + refresh token JWT
- Salvare token-uri in `localStorage`
- Refresh automat al sesiunii la expirarea access token-ului
- Produse izolate per utilizator
- Adaugare, editare, stergere produs
- Modal form pentru produs nou/editare
- Dialog de confirmare pentru actiuni distructive
- Marcare produs ca fiind cumparat
- Filtrare dupa status: toate, necumparate, cumparate
- Cautare dupa nume sau categorie
- Filtru dupa categorie
- Sortare dupa recent, nume sau cantitate
- Contoare pentru total, cumparate si necumparate
- Toggle Light Mode / Dark Mode cu persistenta in `localStorage`

## Structura proiectului

```text
.
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── database/
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── services/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── api.ts
│   │   └── types.ts
│   ├── Dockerfile
│   └── Dockerfile.k8s
├── k8s/
├── screenshots/
├── docker-compose.yml
└── README.md
```

## Rulare locala cu Docker

Porneste tot proiectul cu:

```bash
docker compose up --build
```

Serviciile locale:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:8000](http://localhost:8000)
- Health check: [http://localhost:8000/healthz](http://localhost:8000/healthz)

Baza SQLite este persistata intr-un volum Docker si este montata in backend la:

```text
/data/shopping.db
```

## Variabile de mediu

Backend:

```env
SECRET_KEY=schimba-acest-secret-in-productie
REFRESH_SECRET_KEY=schimba-acest-refresh-secret-in-productie
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
DATABASE_PATH=/data/shopping.db
```

Frontend:

```env
VITE_API_URL=http://localhost:8000
```

## Cont de test

Aplicatia nu creeaza automat un cont de test.

Pentru testare:

1. Deschide aplicatia.
2. Alege tab-ul `Inregistrare`.
3. Introdu un email valid si o parola de minimum 8 caractere.
4. Dupa inregistrare, contul poate fi folosit imediat pentru autentificare.

## Endpoint-uri API

Autentificare:

| Metoda | Endpoint | Descriere |
| --- | --- | --- |
| `POST` | `/inregistrare` | Creeaza cont si returneaza access token + refresh token |
| `POST` | `/autentificare` | Autentifica utilizatorul si returneaza access token + refresh token |
| `POST` | `/refresh-token` | Reimprospateaza access token-ul folosind refresh token-ul |

Produse:

| Metoda | Endpoint | Descriere |
| --- | --- | --- |
| `GET` | `/produse` | Listeaza produsele utilizatorului autentificat |
| `GET` | `/produse/{id}` | Returneaza un produs |
| `POST` | `/produse` | Creeaza un produs |
| `PUT` | `/produse/{id}` | Actualizeaza un produs |
| `PATCH` | `/produse/{id}/cumpara` | Marcheaza produsul ca fiind cumparat |
| `DELETE` | `/produse/{id}` | Sterge un produs |
| `GET` | `/healthz` | Verifica starea backend-ului |

Endpoint-urile pentru produse necesita header-ul:

```http
Authorization: Bearer <access_token>
```

## Deployment

Deployment-ul este configurat pentru Kubernetes pe DigitalOcean:

- `k8s/backend.yaml`
- `k8s/frontend.yaml`
- `k8s/traefik.yaml`
- `k8s/ingress.yaml`

Traefik este folosit ca reverse proxy si gestioneaza traficul HTTPS pentru domeniul:

[https://mihail-musteata.mibo.monster](https://mihail-musteata.mibo.monster)

Pipeline-ul CI/CD din `.github/workflows/ci-cd.yml` valideaza backend-ul, construieste frontend-ul, publica imaginile Docker si aplica manifestele Kubernetes.
