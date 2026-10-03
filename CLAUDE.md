# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JobPilot is a full-stack job search assistant application with:
- **Frontend**: Next.js 16.2.1 (React 19.2.3) with TypeScript/JavaScript
- **Backend**: .NET 9.0 C# REST API
- **Database**: PostgreSQL with Entity Framework Core 9.0
- **Caching**: Redis
- **Auth**: JWT-based authentication via NextAuth on frontend, custom JWT service on backend
- **AI Integration**: Google Gemini API for resume analysis, interview question generation, and cover letter suggestions

## Quick Commands

### Frontend (Next.js)
```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Production build
npm build

# Start production server
npm start

# Lint frontend code
npm run lint
```

### Backend (.NET)
```bash
# Build backend
dotnet build JobPilotBackend

# Run backend (http://localhost:5000 or configured port)
dotnet run --project JobPilotBackend

# Apply database migrations
dotnet ef database update --project JobPilotBackend

# Add new migration
dotnet ef migrations add MigrationName --project JobPilotBackend

# Run tests (if test project exists)
dotnet test
```

## Architecture Overview

### Frontend Structure
- **`app/`** - Next.js App Router directory
  - **`api/auth/`** - NextAuth configuration and OAuth/JWT endpoints
  - **`dashboard/`** - User dashboard pages (interview, resume, cover letter, job matches, etc.)
  - **`components/ui/`** - Reusable UI components (GlassBubbleNav, FluidGlass animations, etc.)
  - **`Services/`** - Frontend service layer for API calls (InterviewService, ResumeService, CoverLetterService, UserService, JobService)
  - **`stores/`** - Zustand state management (swipeStore for job swipes)
  - **`hooks/`** - Custom React hooks (useSwipeFlush)
  - **`layout.jsx`** - Root layout with providers setup
  - **`globals.css`** - Global Tailwind CSS

- **Key Libraries**:
  - TailwindCSS 4.2.1 for styling (postcss plugin)
  - React Compiler enabled (babel-plugin-react-compiler) for automatic memoization
  - Three.js + react-three-fiber/drei for 3D visualizations
  - @react-pdf/renderer for PDF generation
  - Lucide React + FontAwesome for icons
  - ESLint with Next.js core web vitals config

### Backend Structure
- **`Controllers/`** - HTTP endpoints for each feature domain
  - `BaseApiController.cs` - Base controller with shared response handling
  - `AuthController.cs` - Authentication and authorization
  - `JobController.cs` - Job listing and matching
  - `ResumeAnalyzerController.cs` - Resume analysis via Google GenAI
  - `CoverLetterController.cs` - Cover letter generation
  - `InterviewController.cs` - Mock interview session management
  - `UserController.cs` - User profile and settings
  - `TtsController.cs` - Text-to-speech for interviews

- **`Services/`** - Business logic layer
  - Each service implements a corresponding interface (IAuthService, IJobsService, etc.)
  - `InterviewService.cs` - Generates interview questions via Google GenAI, manages session state
  - `ResumeAnalyzerService.cs` - Analyzes resumes and generates insights
  - `CoverLetterService.cs` - Generates cover letters
  - `AuthService.cs` - User authentication and JWT token creation
  - `JobsService.cs` - Job operations and matching
  - `UserService.cs` - User profile operations
  - `EmailService.cs` - Email sending
  - `TtsService.cs` - Text-to-speech generation
  - `JwtService.cs` - JWT token management
  - `RedisCacheService.cs` - Cache operations
  - `IRedisCacheService` - Cache abstraction

- **`Models/`** - EF Core entity models
  - `User.cs` - User identity and profile data
  - `UserProfile.cs` - Extended user profile information
  - `UserResume.cs` - Uploaded resume documents
  - `ResumeAnalysisResult.cs` - Analysis results from Google GenAI
  - `UserInterview.cs` - Mock interview session records
  - `UserInterviewQuestion.cs` - Individual question-answer pairs in interview
  - `Job.cs` - Job listings
  - `UserJobSwipe.cs` - User interactions with jobs (swipes)
  - `CoverLetter.cs` - Generated cover letters
  - `PasswordResetToken.cs` - Password reset flow

- **`Data/`**
  - `JobPilotDbContext.cs` - EF Core DbContext with all entity configurations

- **`DTOs/`** - Data transfer objects for API requests/responses (organized by feature)

- **`Migrations/`** - EF Core database migrations (auto-generated)

- **`Errors/`** - Custom error definitions (likely using ErrorOr package)

- **`Helpers/`** - Utility functions and extension methods

- **`Assets/`** - Static files (resumes, PDFs, etc.)

### Key Architectural Patterns
- **Service Layer Pattern**: Business logic abstraction between controllers and data access
- **Dependency Injection**: ASP.NET Core DI container manages service lifecycles (Scoped for request-scoped services)
- **Repository Pattern**: Implied through DbContext and service layer (not explicit repository classes)
- **ErrorOr Pattern**: Result-based error handling instead of exceptions (ErrorOr 2.0.1)
- **CORS Policy**: Configured to allow Frontend origins (localhost:3000 + Vercel deployments)
- **OpenAPI**: Swagger/OpenAPI support enabled for API documentation

## Data Flow

1. **Frontend** → Makes API calls via service layer to backend endpoints
2. **Backend** → Receives requests in controllers, delegates to services
3. **Services** → Execute business logic, interact with EF Core DbContext and external APIs
4. **Database** → PostgreSQL with EF Core ORM
5. **Cache** → Redis caching for frequently accessed data (managed via RedisCacheService)
6. **External APIs** → Google GenAI for AI features (resume analysis, interview questions, cover letters)

## Configuration & Environment

### Frontend (`.env` at root)
- `NEXT_PUBLIC_*` variables accessible on client-side
- NextAuth configuration
- Backend API URL

### Backend (appsettings.json / User Secrets)
- `ConnectionString` - PostgreSQL connection
- `Redis:ConnectionString` - Redis cache
- `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience` - JWT signing configuration
- `Cors:AllowedOrigins` - Comma-separated list of allowed frontend origins
- Google GenAI API key (likely in user secrets for security)

## Interview Feature Deep Dive

The AI Mock Interview feature includes:
- **Frontend** (`InterviewSession.jsx`) - Session component with Web Speech API (TTS/STT), waveform animation, state machine flow
- **Backend** (`InterviewService.cs`, `InterviewController.cs`) - Question generation via Google Gemini, session management
- **Models** - `UserInterview` (session), `UserInterviewQuestion` (question-answer records)
- **Note**: Score/feedback generation per question is TODO

## Common Development Tasks

### Adding a New API Endpoint
1. Create DTO in `DTOs/`
2. Create service method in `Services/` and interface
3. Register service in `Program.cs` with `AddScoped<IService, Service>()`
4. Create controller action in `Controllers/`
5. Add EF Core model if new entity needed
6. Create and apply migration: `dotnet ef migrations add EntityName`

### Running the Full Stack Locally
1. Start backend: `dotnet run --project JobPilotBackend`
2. In separate terminal, start frontend: `npm run dev`
3. Frontend will proxy to backend via configured URL in services

### Database Schema Changes
1. Update model in `Models/`
2. Update DbContext in `Data/JobPilotDbContext.cs`
3. Create migration: `dotnet ef migrations add DescriptiveName`
4. Review and apply: `dotnet ef database update`
5. Commit migration files

### Adding UI Components
- Follow existing pattern in `app/components/ui/` with `.jsx` files and matching `.module.css` files
- Use Tailwind for utility styles, CSS modules for component-specific scoping
- Consider shadcn component library already available

### Frontend Service Layer
- Place API calls in `app/Services/` not directly in components
- Example pattern: `InterviewService.js` exports functions like `startInterview()`, `submitAnswer()`
- Services import and call backend endpoints

## UI & Layout Requirements

Whenever working on UIs or layouts, they must be responsive across the full range of screens, from the largest desktop monitors down to very small phones.
- Use many breakpoints so layouts resize smoothly, not in big jumps between a few sizes.
- Prefer fluid techniques (`clamp()`, relative units, flexible grids) in addition to breakpoints so spacing, type, and sizing scale continuously.
- Check new or changed UI at both extremes (very large and very small) and at the widths in between.

## Important Notes

- **React Compiler**: Enabled via Babel plugin - provides automatic component memoization, reducing manual `React.memo()` usage
- **Standalone Output**: Next.js configured for `output: 'standalone'` (optimized for containerization)
- **Database Migrations**: Auto-applied on backend startup via `db.Database.Migrate()` in Program.cs
- **Nullable Reference Types**: Enabled in C# (.NET 9.0) for null-safety
- **JWT Authentication**: Stateless, token-based; validate with configured issuer/audience/key
- **CORS Configuration**: Dynamically built from config; Vercel deployments (*.vercel.app) are always allowed

## Testing

- Frontend: Likely uses Jest (not explicitly configured in visible config, but standard for Next.js)
- Backend: Likely uses xUnit or NUnit (not yet visible in repo structure)
- Run tests with: `npm test` (frontend) and `dotnet test` (backend)

## Known Issues / TODOs

- Interview feature: Score/feedback not being generated or saved per question (from recent commits)
- Interviewer TTS voice needs customization
- Interview session UI polish needed

## Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend Runtime | React 19.2.3 on Next.js 16.2.1 |
| Styling | TailwindCSS 4.2.1 + CSS Modules |
| State Management | Zustand |
| Authentication | NextAuth 4.24.13 + Custom JWT |
| 3D Graphics | Three.js + react-three-fiber |
| Backend Runtime | .NET 9.0 |
| ORM | Entity Framework Core 9.0 |
| Database | PostgreSQL |
| Cache | Redis |
| API Documentation | OpenAPI/Swagger |
| Error Handling | ErrorOr (result-based) |
