# LuxeFlow CRM — Luxury Travel Operations Platform

Enterprise-leaning, end-to-end CRM tailored for luxury travel agencies. Centralizes client management, booking lifecycle, operations, finance, and supplier knowledge (the "Resort Bible"), with AI to accelerate proposals, handoffs, and operations.

## Tech Stack

- **Framework:** React 18 with TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS v3 with @tailwindcss/typography
- **UI:** Radix UI primitives, custom components
- **State:** TanStack React Query
- **Forms:** React Hook Form with Zod
- **Routing:** React Router 6
- **Charts:** Recharts
- **Toasts:** Sonner
- **Backend:** Supabase (Auth, Database, Storage)

## Getting Started

```bash
npm install
npm run build
```

### Environment Variables

Create `.env` with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=/api
```

## Pages

- **Public:** Landing, Login, Signup, Forgot Password
- **Dashboard:** Command Center, KPIs, Quick Actions, AI Assistant
- **Clients:** List (search, filters), Detail (tabs: Overview, Bookings, Documents, Preferences)
- **Bookings:** List (table/board), Detail, Create Wizard (stepper)
- **Calendar:** Week view, check-ins/outs
- **Tasks:** Kanban and list views
- **Resort Bible:** Directory with faceted search, Resort Detail
- **Reports:** KPIs, revenue charts, export
- **Team Chat:** Channels, message composer
- **AI Assistant:** Context selector, RAG-powered recommendations
- **Admin:** Org settings, users, integrations, audit logs
- **Settings:** Profile, notifications
- **Transactions:** Payment history, Stripe integration
- **Documents:** Media library, OCR

## Design System

- **Colors:** Primary #FFFFFF, Accent #8A9A5B, Supporting #C6AB62
- **Typography:** Playfair Display (headings), Lato (body)
- **Cards:** White, soft shadow, 4-8px radius, hover lift

## License

Proprietary
