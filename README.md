# Task Manager — Minikube Local Product

Minimal .NET 10 + MongoDB + React CRUD app Kubernetes learning project.

## Projekt struktúra

```
.
├── backend/        # .NET 10 Minimal API
├── frontend/       # React + Vite + TypeScript
└── k8s/            # Kubernetes manifests
    ├── mongo.yaml  # MongoDB StatefulSet
    ├── backend.yaml
    └── frontend.yaml
```

## Lokális fejlesztés (Docker nélkül)

### 1. MongoDB indítása lokálisan
```bash
docker run -d -p 27017:27017 --name mongo mongo:7
```

### 2. Backend futtatása
```bash
cd backend
dotnet run
# API: http://localhost:8080
# Docs: http://localhost:8080/openapi/v1.json
```

### 3. Frontend futtatása
```bash
cd frontend
npm install
npm run dev
# UI: http://localhost:5173
```

---

## Minikube deployment

### 1. Minikube Docker registry beállítása
```bash
# Powershell: minikube docker-env kimenetét futtatni
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

### 2. Docker image-ek buildelése
```bash
docker build -t task-api:latest ./backend
docker build -t task-frontend:latest ./frontend
```

### 3. Deploy Kubernetes-re
```bash
kubectl apply -f k8s/mongo.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
```

### 4. Ellenőrzés
```bash
kubectl get pods
kubectl get services
```

### 5. App elérése
```bash
minikube ip
# Böngészőben: http://<minikube-ip>:30080
```

## API végpontok

| Method | Endpoint           | Leírás              |
|--------|--------------------|---------------------|
| GET    | /api/tasks         | Összes task listázás |
| GET    | /api/tasks/{id}    | Egy task lekérése   |
| POST   | /api/tasks         | Új task létrehozás  |
| PUT    | /api/tasks/{id}    | Task frissítés      |
| DELETE | /api/tasks/{id}    | Task törlés         |
| GET    | /health            | Health check        |
