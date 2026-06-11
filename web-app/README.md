# PromptShield Web Dashboard

Modern, responsive web dashboard for PromptShield enterprise platform built with React, TypeScript, and Tailwind CSS.

## Features

✨ **Dashboard** - Real-time detection metrics and trends
📊 **Analytics** - Comprehensive security analytics
🚨 **Detections** - View and filter injection detection events
🔑 **API Keys** - Manage API access tokens
📋 **Rules** - Configure and manage detection rules
⚙️ **Settings** - User and application settings
🔐 **Authentication** - Secure login/signup

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State Management**: Zustand
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Routing**: React Router

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
cd web-app
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```
web-app/
├── public/                  # Static files
├── src/
│   ├── components/         # Reusable components
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Charts.tsx
│   ├── pages/             # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Detections.tsx
│   │   ├── Analytics.tsx
│   │   ├── ApiKeys.tsx
│   │   ├── Rules.tsx
│   │   ├── Settings.tsx
│   │   └── Login.tsx
│   ├── lib/               # Utilities & API
│   │   ├── api.ts        # Axios configuration
│   │   └── auth.ts       # Authentication state
│   ├── hooks/             # Custom hooks
│   │   └── useData.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/              # Supabase schema and documentation
│   ├── schema.sql         # Database schema
│   └── README.md          # Supabase setup instructions
├── api/                   # Vercel Serverless Functions
│   ├── supabase.ts        # Supabase client initialization
│   ├── auth/              # Authentication endpoints
│   │   ├── me.ts
│   │   ├── login.ts
│   │   ├── signup.ts
│   │   └── logout.ts
│   ├── stats.ts           # Dashboard statistics
│   ├── detections.ts      # Detection events
│   ├── api-keys.ts        # API key management
│   ├── rules.ts           # Detection rules
│   ├── notifications.ts   # Notifications
│   └── analytics.ts       # Analytics data
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── vercel.json            # Vercel configuration
```

## Pages

### Dashboard
Overview of detection metrics, trends, and recent alerts.

**Features**:
- Real-time statistics cards
- Detection trend chart
- Risk distribution pie chart
- Recent detections table

### Detections
Comprehensive list of all injection detection events with filtering and search.

**Features**:
- Search and filter by pattern, user, risk level
- Export detection data
- View detailed detection information
- Real-time updates

### Analytics
Advanced analytics and insights into attack patterns and trends.

**Features**:
- Detection accuracy metrics
- False positive rates
- Performance statistics
- Top attack patterns

### API Keys
Manage API keys for programmatic access.

**Features**:
- Create/revoke API keys
- View key usage history
- Copy keys to clipboard
- API documentation

### Rules
Configure and manage detection rules.

**Features**:
- Enable/disable rules
- View rule performance
- Edit rule settings
- Add custom rules

### Settings
User account and application settings.

**Features**:
- Profile management
- Detection settings
- Notification preferences
- Password management
- Subscription info

### Login
Authentication page with signup support.

**Features**:
- Email/password login
- User registration
- Demo credentials
- Error handling

## API Integration

The dashboard connects to a backend API built with Vercel Serverless Functions and Supabase. Configure the API endpoint:

```typescript
// src/lib/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})
```

### Expected API Endpoints

All API endpoints are prefixed with `/api`:

```
GET    /api/auth/me             - Get current user
POST   /api/auth/login          - Login
POST   /api/auth/signup         - Signup
GET    /api/stats               - Dashboard statistics
GET    /api/detections          - List detections
GET    /api/analytics           - Analytics data
GET    /api/api-keys            - List API keys
POST   /api/api-keys            - Create API key
DELETE /api/api-keys/:id        - Delete API key
GET    /api/rules               - List detection rules
POST   /api/rules               - Create rule
PUT    /api/rules/:id           - Update rule
DELETE /api/rules/:id           - Delete rule
GET    /api/notifications       - List notifications
PUT    /api/notifications/:id   - Update notification (mark as read)
DELETE /api/notifications/:id   - Delete notification
```

## Customization

### Theme

Edit `tailwind.config.js` to customize colors and styles.

### Components

Reusable components are in `src/components/`:
- `Chart` - Wrapper for chart components
- `TrendChart` - Line chart for trends
- `RiskDistributionChart` - Pie chart for risk distribution
- `BarChartComponent` - Bar chart for comparisons

### State Management

Use Zustand stores for global state:

```typescript
// src/lib/auth.ts
export const useAuthStore = create<AuthState>(...)
```

## Performance

- **Code Splitting**: Automatic with Vite
- **Lazy Loading**: Route-based code splitting
- **Caching**: API response caching with Zustand
- **Optimization**: Tailwind CSS purging

## Security

- **Authentication**: Token-based (JWT)
- **CORS**: Configured in Vite
- **HTTPS**: Use HTTPS in production
- **API Key**: Secure storage in localStorage

## Deployment

### Vercel (Recommended)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Execute the SQL schema found in `supabase/schema.sql` in your Supabase SQL editor
3. Get your Supabase URL and anon key from Supabase Settings → API
4. Get your Supabase service role key from Supabase Settings → API
5. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
6. Import the project to Vercel
7. Add the following environment variables in Vercel:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `VITE_API_URL`: Leave blank (defaults to `/api` for Vercel)
8. Vercel will automatically detect the Vercel configuration and deploy your app

### Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

### Docker

```dockerfile
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API URL (for development proxy)
VITE_API_URL=http://localhost:8000

# Optional: For analytics (Umami)
VITE_UMAMI_URL=your_umami_url
VITE_UMAMI_WEBSITE_ID=your_umami_website_id

# Optional: For error tracking (Sentry)
VITE_SENTRY_DSN=your_sentry_dsn
```

## Testing

```bash
npm run test
```

## Linting

```bash
npm run lint
```

## Type Checking

```bash
npm run type-check
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md)

## License

MIT - See [LICENSE](../LICENSE)

## Support

- Documentation: [docs/](../docs/)
- Issues: GitHub Issues
- Email: support@promptshield.io
