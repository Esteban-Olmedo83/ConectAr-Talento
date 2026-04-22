#!/bin/bash
# ─── ConectAr Talento — Deploy Script ─────────────────────────────────────────
# Uso: bash deploy.sh
# Requiere: Node.js 18+, Git configurado, cuenta de Vercel

set -e

echo "🚀 ConectAr Talento — Deploy a Vercel"
echo "────────────────────────────────────────"

# 1. Verificar que el build pasa
echo "📦 Verificando build..."
npm run build

# 2. Deploy a Vercel (te pedirá login si no estás autenticado)
echo ""
echo "☁️  Desplegando a Vercel..."
echo "   Si es tu primer deploy, te pedirá que te logues."
echo "   Usa tu cuenta de Vercel: esteban-olmedo83"
echo ""

npx vercel --prod \
  --scope esteban-olmedo83s-projects \
  --yes \
  --name conectar-talento

echo ""
echo "✅ ¡Deploy completado!"
echo "   Tu app está en: https://conectar-talento.vercel.app"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Agregar GEMINI_API_KEY en Vercel Dashboard → Settings → Environment Variables"
echo "   2. Ir a https://aistudio.google.com/app/apikey para obtener la API key gratis"
echo "   3. Redeploy después de agregar las variables"
