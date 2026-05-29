@AGENTS.md

# ConectAr Talento — Instrucciones para agentes autónomos

## Proyecto
ATS SaaS para reclutadores latinoamericanos. Stack: Next.js 16, TypeScript, Supabase, Tailwind CSS, Groq/Llama.

## Repositorio y branches
- Repo: `esteban-olmedo83/conectar-talento`
- Branch de trabajo activo: `claude/youthful-noether-uihFY`
- Branch protegido: `main` (requiere PR para mergear)
- Vercel project: `conect-ar-talento` (prj_y8yCaYxSdlWLdHsCYia4qul6NPcU)
- Team Vercel: `team_uUXj5kOTKNXmMx8eeqpqxJ6A`

## Flujo obligatorio para cada tarea autónoma

Cuando el usuario inicia una tarea y se ausenta, seguir SIEMPRE este flujo completo:

1. **Implementar** en la rama `claude/youthful-noether-uihFY`
2. **Verificar** que `npm run build` pasa sin errores TypeScript antes de commitear
3. **Commitear** con mensaje descriptivo en español
4. **Pushear** con `git push -u origin claude/youthful-noether-uihFY`
5. **Crear PR** via GitHub MCP apuntando a `main` con título y descripción en español
6. **Suscribirse** a eventos del PR via `subscribe_pr_activity`
7. **Mergear el PR** via GitHub MCP cuando CI pase (o si no hay CI, mergear directamente)
8. **Verificar deployment** en Vercel via MCP — esperar estado READY
9. **Notificar** en el chat con el mensaje exacto del template de notificación de abajo

## Template de notificación al completar

Usar SIEMPRE este formato cuando una tarea termina y está en producción:

```
✅ TAREA COMPLETADA Y EN PRODUCCIÓN

📌 Qué se hizo: [descripción breve de 1-2 líneas]
🔀 PR mergeado: #[número] → main
🚀 Deploy: https://conect-ar-talento-esteban-olmedo83s-projects.vercel.app
⏱ Tiempo total: [X minutos]

▶ Próxima tarea sugerida: [nombre de la siguiente tarea del backlog]
```

## Backlog priorizado (ejecutar en este orden)

- [ ] TAREA 1: SEO técnico (robots.txt, sitemap.xml, Open Graph, JSON-LD)
- [ ] TAREA 2: Sentry + Google Analytics 4 + Crisp chat
- [ ] TAREA 3: Rate limiting en rutas /api/ai/*
- [ ] TAREA 4: Emails transaccionales con Resend
- [ ] TAREA 5: Stripe — setup base, webhooks, tabla subscriptions
- [ ] TAREA 6: Stripe — página de billing y checkout
- [ ] TAREA 7: Admin monitoring dashboard (/admin/monitoring)
- [ ] TAREA 8: Logging de uso de IA en ai_usage_logs
- [ ] TAREA 9: Landing tienda digital /tienda con ebooks
- [ ] TAREA 10: Tests E2E con Playwright (flujos críticos)

## Reglas técnicas

- `appUrl` SIEMPRE: `const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin`
- Nunca usar `const x = x || fallback` — causa circular reference en TypeScript
- Todos los textos de UI en español
- Estilo visual: fondo `#0B0B14`, acento `#5D50D6`, acento suave `#8B7EFF`
- Admin email: `conectar.rrhh.ar@gmail.com` (variable `ADMIN_EMAIL`)
- Rama de deploy: `claude/youthful-noether-uihFY` → siempre PR a `main`

## Variables de entorno requeridas

Ver `.env.local.example` para la lista completa. Las críticas:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `GROQ_API_KEY`
- `ADMIN_EMAIL`
