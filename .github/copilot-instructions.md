# Copilot Instructions for SmartGrocery

## Projektüberblick
- **SmartGrocery** ist in drei Hauptbereiche gegliedert:
  - `client/` (React-Frontend, TypeScript)
  - `server/` (Express-Backend, TypeScript)
  - `shared/` (geteilte Typen/Schemas)

## Architektur & Patterns
- **Frontend:**
  - Komponenten liegen unter `client/src/components` (UI-Bausteine in `ui/`)
  - State-Management und Server-Kommunikation via TanStack React Query (`lib/queryClient.ts`)
  - Seiten unter `client/src/pages`, Hooks unter `client/src/hooks`
- **Backend:**
  - Einstieg: `server/index.ts`
  - Routing: `server/routes.ts`
  - Services: z.B. OpenAI-Integration in `server/services/openai.ts`
  - Datenbankzugriff via Drizzle ORM, Schema in `shared/schema.ts`
- **Cross-Kommunikation:**
  - Gemeinsame Typen/Schemas in `shared/schema.ts` verwenden

## Workflows
- **Entwicklung:**
  - `npm run dev` startet Backend (und ggf. Frontend via Vite)
  - Frontend-Startpunkt: `client/index.html` und `client/src/main.tsx`
- **Build & Deployment:**
  - `npm run build` baut Frontend (Vite) & Backend (esbuild)
  - `npm run start` startet die gebaute App
- **DB-Migration:**
  - `npm run db:push` synchronisiert das Schema mit der Datenbank

## Konventionen
- **TypeScript-only** (kein JS im Kerncode)
- **React-Komponenten**: Funktional, Hooks-basiert, Props klar typisiert
- **UI-Komponenten**: Wiederverwendbar, Styling via TailwindCSS
- **Backend**: Express Middleware, Services für externe APIs, keine Business-Logik in Routen

## Beispiele & Hinweise
- Neue UI-Komponenten in `client/src/components/ui/` ablegen
- Gemeinsame Typen immer in `shared/schema.ts` definieren und importieren
- Für neue Services im Backend: `server/services/` nutzen und in `routes.ts` einbinden

## Externe Abhängigkeiten
- React, TanStack Query, Radix UI, Drizzle ORM, OpenAI, Express, Passport, TailwindCSS

## Troubleshooting
- Bei Build-Fehlern: `npm run check` (TypeScript), Logs prüfen
- Datenbankprobleme: Schema in `shared/schema.ts` und Drizzle-CLI prüfen

---

Diese Datei regelmäßig aktualisieren, wenn sich Architektur, Workflows oder Konventionen ändern.