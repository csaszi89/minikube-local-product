#Requires -Version 5.1
<#
.SYNOPSIS
    Builds Docker images inside Minikube and deploys all manifests.
.EXAMPLE
    .\deploy.ps1
    .\deploy.ps1 -SkipBuild   # csak kubectl apply, ha a képek már megvannak
#>
param(
    [switch]$SkipBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── 1. Minikube ellenőrzés ────────────────────────────────────────────────────
Write-Host "⏳ Minikube status check..." -ForegroundColor Cyan
$status = minikube status --format '{{.Host}}' 2>$null
if ($status -ne 'Running') {
    Write-Host "▶ Minikube indítása..." -ForegroundColor Yellow
    minikube start
}

# ── 2. Image build (minikube image build -> garantáltan a cluster daemon-ba) ──
if (-not $SkipBuild) {
    Write-Host "🔨 Building task-api:latest..." -ForegroundColor Cyan
    minikube image build -t task-api:latest ./backend

    Write-Host "🔨 Building task-frontend:latest..." -ForegroundColor Cyan
    minikube image build -t task-frontend:latest ./frontend
}

# ── 4. Manifests alkalmazása ──────────────────────────────────────────────────
Write-Host "☸ Applying Kubernetes manifests..." -ForegroundColor Cyan
kubectl apply -f k8s/mongo.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml

if (-not $SkipBuild) {
    # same :latest tag -> apply alone won't trigger new rollout, force it
    kubectl rollout restart deployment/backend deployment/frontend
}

# ── 5. Rollout bevárása ───────────────────────────────────────────────────────
Write-Host "⏳ Waiting for rollouts..." -ForegroundColor Cyan
kubectl rollout status statefulset/mongo   --timeout=120s
kubectl rollout status deployment/backend  --timeout=120s
kubectl rollout status deployment/frontend --timeout=120s

# ── 6. URL megjelenítése ──────────────────────────────────────────────────────
Write-Host ""
Write-Host "✅ Deploy kész!" -ForegroundColor Green
Write-Host "   Nyisd meg: minikube service frontend-svc" -ForegroundColor Green
