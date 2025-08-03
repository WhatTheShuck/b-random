# b-random

A personalised content aggregation platform that curates information from multiple sources and ranks it according to my interests. Built as a learning journey through modern web technologies with planned transitions to native mobile and Rust backend.

## Project Vision

This project serves dual purposes:
- **Personal Tool**: Fill a gap in how I consume and prioritise online content
- **Learning Challenge**: Progressive skill development through planned technology transitions

### Planned Evolution
1. **Phase 1** (Current): TypeScript fullstack with separated frontend/backend
2. **Phase 2**: Transition frontend to native mobile app (Android)
3. **Phase 3**: Rewrite backend in Rust

## Features

- **Multi-Source Aggregation**: YouTube channels, Hacker News, RSS feeds
- **Intelligent Ranking**: Custom algorithms to prioritise content based on personal interests
- **Local Hosting**: Self-hosted solution running in Docker containers
- **Future AI Integration**: Local AI processing for content analysis and recommendations

## Tech Stack

### Phase 1 (Current)
**Frontend:**
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS
- PWA capabilities

**Backend:**
- Fastify with TypeScript
- PostgreSQL with Drizzle ORM
- Redis for caching
- node-cron for scheduled jobs

**Infrastructure:**
- Docker & Docker Compose
- Local network hosting

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js Web   │    │  Fastify API    │    │   PostgreSQL    │
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
│   (Port 3000)   │    │  (Port 3001)    │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
                       ┌─────────────────┐
                       │      Redis      │
                       │   (Port 6379)   │
                       └─────────────────┘
```

## Project Structure

```
b-random/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable components
│   │   ├── lib/            # Utilities and API clients
│   │   └── types/          # TypeScript type definitions
│   ├── public/
│   └── package.json
├── backend/                  # Fastify API server
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # External API integrations
│   │   │   ├── youtube.ts
│   │   │   ├── hackernews.ts
│   │   │   └── rss.ts
│   │   ├── models/         # Drizzle schemas & data models
│   │   ├── jobs/           # Scheduled tasks
│   │   ├── utils/          # Ranking algorithms & helpers
│   │   └── app.ts         # Fastify application setup
│   ├── drizzle/            # Database migrations & config
│   └── package.json
├── docker-compose.yml        # Container orchestration
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- pnpm (recommended) or npm

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd everything-app
   ```

2. **Start the infrastructure**
   ```bash
   docker-compose up -d postgres redis
   ```

3. **Backend setup**
   ```bash
   cd backend
   pnpm install

   # Set up environment variables
   cp .env.example .env
   # Edit .env with your API keys and database URL

   # Run database migrations
   pnpm drizzle-kit push:pg

   # Start the server
   pnpm dev
   ```

4. **Frontend setup**
   ```bash
   cd frontend
   pnpm install

   # Set up environment variables
   cp .env.local.example .env.local
   # Edit .env.local with your backend URL

   # Start the development server
   pnpm dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/docs

## Configuration

### Environment Variables

**Backend (.env):**
```
DATABASE_URL="postgresql://user:password@localhost:5432/everything_app"
REDIS_URL="redis://localhost:6379"
YOUTUBE_API_KEY="your_youtube_api_key"
PORT=3001
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### API Keys Required
- **YouTube Data API v3**: For fetching channel videos
- Additional APIs as sources are added

## Development

### Useful Commands

**Backend:**
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm db:generate  # Generate database migrations
pnpm db:push      # Push schema changes to database
pnpm db:studio    # Database GUI (drizzle-kit studio)
pnpm test         # Run tests
```

**Frontend:**
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm type-check   # TypeScript type checking
```

### Docker Development
```bash
# Build and run all services
docker-compose up --build

# Run specific services
docker-compose up postgres redis

# View logs
docker-compose logs -f backend
```

## Data Sources

### Currently Supported
- **YouTube**: Channel RSS feeds and API integration
- **Hacker News**: Top stories and specific searches
- **RSS Feeds**: Custom blog and news sources

### Planned Additions
- Reddit subreddits
- Twitter/X feeds
- GitHub releases and trending repos
- Custom webhooks

## Ranking Algorithm

The content ranking system considers:
- Source reliability weighting
- Personal interest keywords
- Content freshness
- Engagement metrics (where available)
- Reading/viewing history patterns

*Algorithm details and tuning parameters are documented in `/backend/src/utils/ranking.ts`*

## Future Roadmap

### Phase 2: Native Mobile App
- **Target**: Android (Kotlin or Flutter)
- **Timeline**: After Phase 1 stabilisation
- **Goal**: Learn native mobile development

### Phase 3: Rust Backend
- **Target**: Axum or Actix-web framework
- **Timeline**: After mobile app completion
- **Goal**: Performance optimisation and Rust learning

### Additional Features
- Local AI integration for content summarisation
- Advanced filtering and search
- Content archiving and offline reading
- Social features (sharing, comments)

## Contributing

This is primarily a personal learning project, but suggestions and discussions are welcome! Please open an issue to discuss any major changes.

## License

MIT License - see LICENSE file for details.

---

**Note**: This application is designed for personal use and local hosting. Ensure you comply with the terms of service for all external APIs and data sources.*Note**: This application is designed for personal use and local hosting. Ensure you comply with the terms of service for all external APIs and data sources.
