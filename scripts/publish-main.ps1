$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$currentBranch = git branch --show-current

if (-not $currentBranch) {
  throw "No se pudo detectar la rama actual."
}

if ($currentBranch -ne "main") {
  Write-Host "Cambiando a main..."
  git checkout main
}

Write-Host "Estado actual:"
git status --short --branch

$hasChanges = git status --porcelain
if (-not $hasChanges) {
  Write-Host "No hay cambios para publicar."
  exit 0
}

$message = $args -join " "
if ([string]::IsNullOrWhiteSpace($message)) {
  $message = "chore: update ConectAr Talento"
}

Write-Host "Staging cambios..."
git add .

Write-Host "Creando commit..."
git commit -m $message

Write-Host "Subiendo a GitHub..."
git push origin main

Write-Host ""
Write-Host "Publicacion completada."
Write-Host "GitHub ya recibio los cambios y Vercel deberia disparar el deploy automatico."
