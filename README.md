# Task Manager — Minikube Local Product

Minimal .NET 10 + MongoDB + React CRUD app Kubernetes learning project.

## Project structure

```
.
├── backend/        # .NET 10 Minimal API
├── frontend/       # React + Vite + TypeScript
├── k8s/            # Kubernetes manifests
│   ├── mongo.yaml  # MongoDB StatefulSet
│   ├── backend.yaml
│   └── frontend.yaml
├── docker-compose.yml
└── deploy.ps1      # Minikube deploy script
```

## Local development (without Docker)

### 1. Start MongoDB locally
```bash
docker run -d -p 27017:27017 --name mongo mongo:7
```

### 2. Run the backend
```bash
cd backend
dotnet run
# API: http://localhost:8080
# Docs: http://localhost:8080/openapi/v1.json
```

### 3. Run the frontend
```bash
cd frontend
npm install
npm run dev
# UI: http://localhost:5173
```

---

## Docker Compose (local development)

```powershell
docker compose up --build
# UI: http://localhost:3000
```

---

## Minikube deployment (Windows)

### Prerequisites
- [Minikube](https://minikube.sigs.k8s.io/) installed and started: `minikube start`

### Deploy

```powershell
.\deploy.ps1
```

The script:
1. Checks that Minikube is running
2. Builds images into Minikube's internal daemon (`minikube image build`)
3. Applies the K8s manifests
4. Waits for all rollouts to complete

### Open the app

```powershell
minikube service frontend-svc
```

> **Note (Windows + Docker driver):** the IP returned by `minikube ip` is not directly reachable from Windows, so `minikube service` tunnel is required.

### Manifest-only update (no image rebuild)

```powershell
.\deploy.ps1 -SkipBuild
```

## API endpoints

| Method | Endpoint        | Description       |
|--------|-----------------|-------------------|
| GET    | /api/tasks      | List all tasks    |
| GET    | /api/tasks/{id} | Get a task        |
| POST   | /api/tasks      | Create a task     |
| PUT    | /api/tasks/{id} | Update a task     |
| DELETE | /api/tasks/{id} | Delete a task     |
| GET    | /health         | Health check      |
