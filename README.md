# MonadStudio

> The complete developer environment for building on Monad.

Write, secure, optimize, deploy, and monitor smart contracts — all in one studio.

---

## Tools

| Tool | Description | Status |
|---|---|---|
| 🔴 **MonGuard** | AI-powered security scanner | ✅ Ready |
| 🟡 **GasLens** | Gas optimizer | 🔜 Next |
| 🟠 **MonadForge** | AI contract generator + deployer | 🔜 Queued |
| 🔵 **SentinelMon** | Real-time monitoring | 🔜 Queued |
| 🟢 **ParaDebug** | Parallel execution visualizer | 🔜 Queued |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: Privy (Account Abstraction)
- **AI**: Anthropic Claude API
- **Blockchain**: Viem + Wagmi
- **Database**: Supabase (coming with SentinelMon)
- **Deployment**: Vercel

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo>
cd monadstudio
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Then fill in:

```env
# Get from https://privy.io — create a new app
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# Get from https://console.anthropic.com
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Monad testnet (these defaults work)
NEXT_PUBLIC_MONAD_TESTNET_RPC=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_MONAD_CHAIN_ID=10143

# Local dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up Privy

1. Go to [privy.io](https://privy.io) and create an account
2. Create a new app
3. Copy your App ID into `NEXT_PUBLIC_PRIVY_APP_ID`
4. In Privy dashboard → Settings → Allowed Origins: add `http://localhost:3000`

### 4. Set up Anthropic

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Copy into `ANTHROPIC_API_KEY`

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
monadstudio/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout (fonts, providers)
│   ├── globals.css                 # Global styles
│   ├── api/
│   │   └── monguard/
│   │       └── scan/route.ts       # MonGuard AI scan endpoint
│   ├── app-shell/                  # Authenticated app (has sidebar)
│   │   ├── layout.tsx              # App layout with auth guard
│   │   ├── dashboard/page.tsx      # Dashboard
│   │   └── studio/
│   │       ├── monguard/page.tsx   # MonGuard tool ✅
│   │       ├── gaslens/page.tsx    # GasLens (coming)
│   │       ├── monadforge/page.tsx # MonadForge (coming)
│   │       ├── sentinelmon/page.tsx# SentinelMon (coming)
│   │       └── paradebug/page.tsx  # ParaDebug (coming)
│   └── settings/page.tsx           # Settings
├── components/
│   ├── layout/
│   │   ├── providers.tsx           # Privy + Wagmi providers
│   │   └── sidebar.tsx             # App sidebar navigation
│   └── ui/
│       ├── severity-badge.tsx      # Severity badge component
│       └── score-ring.tsx          # Score ring SVG component
├── lib/
│   ├── utils.ts                    # Utility functions
│   └── monad.ts                    # Monad chain config
├── types/
│   └── index.ts                    # All TypeScript types
└── hooks/                          # Custom hooks (coming)
```

---

## Route Structure

```
/                          → Landing page
/dashboard                 → App dashboard (auth required)
/studio/monguard           → Security scanner
/studio/gaslens            → Gas optimizer
/studio/monadforge         → AI contract generator
/studio/sentinelmon        → Live monitor
/studio/paradebug          → Parallel execution visualizer
/settings                  → Account settings
```

**Note**: The Next.js route group `app-shell` maps `/app-shell/dashboard` → `/dashboard`, `/app-shell/studio/*` → `/studio/*`. This is Next.js App Router route group syntax — the folder name in parentheses is invisible in the URL.

**⚠️ Important**: Rename the `app-shell` folder to `(app)` when running locally. It was named `app-shell` here because the shell creation couldn't use parentheses in mkdir. The correct Next.js route group syntax requires parentheses:

```bash
mv app/app-shell "app/(app)"
```

---

## Build Order

1. ✅ Platform shell (done)
2. ✅ MonGuard — security scanner (done)
3. 🔜 GasLens — gas optimizer
4. 🔜 MonadForge — AI generator + deployer
5. 🔜 SentinelMon — live monitoring (needs Supabase)
6. 🔜 ParaDebug — parallel execution visualizer

---

## Deployment

```bash
# Deploy to Vercel
npx vercel

# Set environment variables in Vercel dashboard
# Make sure to add your production URL to Privy's allowed origins
```
