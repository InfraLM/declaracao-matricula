# Script de Preparação Profissional para cPanel (V2 - Divisão Back/Front)

$DEPLOY_ROOT = "deploy_package"
$BACKEND_DEPLOY = "$DEPLOY_ROOT/backend"
$FRONTEND_DEPLOY = "$DEPLOY_ROOT/frontend"

Write-Host "=== Iniciando Preparação do Pacote de Deploy (Fase 2) ===" -ForegroundColor Cyan

# 1. Limpeza
if (Test-Path $DEPLOY_ROOT) { Remove-Item -Recurse -Force $DEPLOY_ROOT }
New-Item -ItemType Directory -Path $BACKEND_DEPLOY
New-Item -ItemType Directory -Path $FRONTEND_DEPLOY

# 2. Preparar BACKEND (O coração dos dados)
Write-Host "[1/4] Organizando Backend (Express + Prisma)..." -ForegroundColor Yellow
Copy-Item backend/server.js $BACKEND_DEPLOY/server.js
Copy-Item backend/package.json $BACKEND_DEPLOY/package.json
if (Test-Path "backend/prisma") {
    Copy-Item -Path "backend/prisma" -Destination $BACKEND_DEPLOY -Recurse -Force
}
Copy-Item .env $BACKEND_DEPLOY/.env

# 3. Preparar FRONTEND (Next.js Standalone)
Write-Host "[2/4] Executando build do Frontend..." -ForegroundColor Yellow
npm run build

Write-Host "[3/4] Empacotando Frontend standalone..." -ForegroundColor Yellow
if (Test-Path ".next/standalone") {
    Copy-Item -Path ".next/standalone/*" -Destination $FRONTEND_DEPLOY -Recurse -Force
}
if (Test-Path "public") {
    Copy-Item -Path "public" -Destination "$FRONTEND_DEPLOY/public" -Recurse -Force
}
if (Test-Path ".next/static") {
    # Criar a pasta .next/static manualmente para garantir a estrutura
    New-Item -ItemType Directory -Path "$FRONTEND_DEPLOY/.next/static" -Force | Out-Null
    Copy-Item -Path ".next/static/*" -Destination "$FRONTEND_DEPLOY/.next/static" -Recurse -Force
}
# O standalone do Next gera um server.js próprio, vamos renomear se necessário ou manter
# No cPanel, o Frontend costuma ser o "Main Domain" e o Backend um "Subdomain" ou Porta.

# 4. Limpeza de node_modules (Evitar conflito Windows/Linux)
Write-Host "[4/4] Removendo node_modules locais para garantir instalação limpa no cPanel..." -ForegroundColor Yellow
if (Test-Path "$BACKEND_DEPLOY/node_modules") { Remove-Item -Recurse -Force "$BACKEND_DEPLOY/node_modules" }
if (Test-Path "$FRONTEND_DEPLOY/node_modules") { Remove-Item -Recurse -Force "$FRONTEND_DEPLOY/node_modules" }
if (Test-Path "$FRONTEND_DEPLOY/.next/standalone/node_modules") { Remove-Item -Recurse -Force "$FRONTEND_DEPLOY/.next/standalone/node_modules" }

# Finalização
Write-Host "`n=== PACOTES PRONTOS EM /$DEPLOY_ROOT ===" -ForegroundColor Green
Write-Host "ESTRUTURA GERADA:" -ForegroundColor Cyan
Write-Host " - /deploy_package/backend  -> Suba como App Node no cPanel (ex: api.seudominio.com)"
Write-Host " - /deploy_package/frontend -> Suba como App Node no cPanel (dominio principal)"

Write-Host "`nDICA: No cPanel do Backend, lembre-se de rodar 'NPM Install' para gerar o Prisma." -ForegroundColor Yellow
