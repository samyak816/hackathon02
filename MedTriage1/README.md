# MedTriage - Quick Medical Triage Demo

## Folder Structure

```
MedTriage/
├── frontend/                # Frontend UI layer
│   ├── App.tsx              # Root app component with routing
│   ├── main.tsx             # Entry point
│   ├── features/            # Domain-based feature modules
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # Landing/home page
│   │   ├── survey/          # Multi-step survey wizard
│   │   ├── triage/          # Triage results & visualizations
│   │   ├── feedback/        # User feedback page
│   │   └── common/          # Shared pages (404, etc.)
│   ├── components/          # Reusable UI components
│   │   └── ui/              # shadcn/ui components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Shared utilities
│   └── styles/              # CSS & Tailwind styles
│
├── backend/                 # Backend logic layer (client-side mock)
│   ├── auth/                # Authentication logic (localStorage-based)
│   │   └── auth.ts
│   └── triage/              # Triage scoring engine
│       └── triage.ts
│
├── config/                  # Project configuration
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── postcss.config.js
│   └── package.json
│
└── README.md
```

## Tech Stack
- React 18 + TypeScript
- Vite 5
- Tailwind CSS v3
- Framer Motion (animations)
- Recharts (data visualizations)
- shadcn/ui (component library)

## Getting Started
1. Copy config files to project root
2. Run `npm install`
3. Run `npm run dev`
