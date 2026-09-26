# Mémoire projet — Sharaco

## Vue d’ensemble
- Application Next.js 16 (App Router) avec TypeScript, Tailwind CSS 4 et React 19.
- Objectif principal : interface SaaS pour gérer devis, factures, dashboard, clients, reminders et templates.
- Stack principale : Next.js, TanStack Query, Zustand, next-themes, Radix UI, Recharts, Framer Motion.

## Structure du projet
- src/app/ : routes principales et layouts (login, dashboard, settings, editor).
- src/components/ : providers, thème, composants UI partagés.
- src/features/ : domaines métier : auth, clients, dashboard, invoices, quotes, reminders, settings, templates, navigation.
- src/hooks/ : hooks utilitaires (toast, theme, local storage).
- src/lib/ : clients API, utilitaires, query client.
- src/store/ : état global Zustand.

## Palette et thèmes
- Thème clair : background #ffffff, foreground #171717.
- Thème sombre : background #0a0a0a, foreground #ededed.
- Accent visuel principal : dégradé bleu-violet (#0ea5e9 → #0084d1).
- Effet glass : fond semi-transparent avec blur pour cartes et panneaux.
- Polices : Geist Sans / Geist Mono via next/font/google.

## Notes d’implémentation
- Le thème utilise next-themes avec attribut class et mode système par défaut.
- Les pages du dashboard utilisent un layout avec sidebar, header et toaster.
- Les composants UI sont inspirés de shadcn/ui et vivent dans src/components/ui/.
