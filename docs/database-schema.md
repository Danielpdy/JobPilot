# JobPilot — Database Schema & Implementation Plan

**Database:** Neon (serverless PostgreSQL)
**Cache:** Redis (feed caching + refresh limits)
**ORM:** Entity Framework Core (EF Core)
**AI:** Gemini (job ranking)

---

## What We Are Building (Simple Terms)

Think of the database as 4 filing cabinets:

1. **Users cabinet** — who you are (name, email, password)
2. **UserProfiles cabinet** — what kind of job you want (skills, salary, work type)
3. **Jobs cabinet** — job listings Gemini picked for you
4. **Swipes cabinet** — every job you liked or dismissed

On top of that, we have **Redis** — think of it as a whiteboard on the wall. It's fast, temporary memory we use so we don't have to go back to the filing cabinets every single time. We use it to remember your last job feed and track how many refreshes you've used today.

---

## Final Database Tables

---

### 1. `Users`
**Simple:** Stores who you are — just identity and login info. Nothing about job preferences goes here.

**Technical:** Auth-only table. `PasswordHashed` is nullable to support OAuth users who never set a password. `IsOnboarded` acts as a gate — middleware checks this on every request to protected routes.

| Column | Type | Notes |
|---|---|---|
| UserId | `SERIAL` PK | auto-increment |
| FirstName | `TEXT` | |
| LastName | `TEXT` | |
| Email | `TEXT` UNIQUE | |
| PasswordHashed | `TEXT` nullable | null for Google/GitHub OAuth users |
| RefreshToken | `TEXT` nullable | JWT refresh token |
| RefreshTokenExpiresAt | `TIMESTAMP` | |
| IsOnboarded | `BOOLEAN` | default `false` — gates dashboard access |

---

### 2. `UserProfiles`
**Simple:** Everything you told us during onboarding. One row per user — created the moment you finish the onboarding form. Also tracks how many feed refreshes you've used today and whether you're a premium member.

**Technical:** 1:1 with Users via unique FK. `Skills` uses Postgres native `text[]` array — avoids a join table and supports array operators like `@>` for overlap queries. `RefreshesResetAt` stores when the current 24h window started, so we can calculate time remaining on the frontend.

| Column | Type | Notes |
|---|---|---|
| UserProfileId | `SERIAL` PK | |
| UserId | `INT` FK → Users | unique, 1:1 |
| JobTitle | `TEXT` | e.g. "Software Engineer" |
| ExperienceLevel | `TEXT` | Entry / Mid / Senior / Lead |
| Skills | `TEXT[]` | e.g. `{React, Python, Figma}` |
| WorkType | `TEXT` | Remote / Hybrid / On-site |
| SalaryRange | `TEXT` | e.g. "$70k–$100k" |
| PreferredLocation | `TEXT` nullable | optional |
| IsPremium | `BOOLEAN` | default `false` |
| RefreshesUsedToday | `INT` | default `0`, max 10 for free users |
| RefreshesResetAt | `TIMESTAMP` | when the current 24h window started |

---

### 3. `Jobs`
**Simple:** Every job listing Gemini selected for a user gets stored here. We also save Gemini's score and reason so we can show the user why a job was recommended. The `RawData` column is a free-form blob that stores whatever the job API sent back — useful if different APIs return different fields.

**Technical:** `ExternalId` + `Source` together form a natural unique key — prevents the same job from being stored twice even if fetched by multiple users. `AiMatchScore` (0.0–1.0) and `AiMatchReason` are populated by Gemini per user context but stored per job. `Tags text[]` enables GIN-indexed array queries. `RawData jsonb` is schema-free storage for the full API response.

| Column | Type | Notes |
|---|---|---|
| JobId | `SERIAL` PK | |
| ExternalId | `TEXT` | ID from the source API |
| Source | `TEXT` | "linkedin" / "indeed" / "adzuna" |
| Title | `TEXT` | |
| Company | `TEXT` | |
| Location | `TEXT` | |
| WorkType | `TEXT` | Remote / Hybrid / On-site |
| SalaryMin | `INT` nullable | parsed number for filtering |
| SalaryMax | `INT` nullable | |
| Url | `TEXT` | link to apply on the company's site |
| Tags | `TEXT[]` | skills/keywords from the listing |
| Description | `TEXT` | full job description |
| AiMatchScore | `FLOAT` nullable | 0.0–1.0, Gemini's confidence |
| AiMatchReason | `TEXT` nullable | "Strong React match, remote-first role" |
| RawData | `JSONB` | full original API response |
| FetchedAt | `TIMESTAMP` | when we pulled it |

---

### 4. `UserJobSwipes`
**Simple:** Every time a user swipes right (like) or left (dismiss) on a job card, we record it here. The wishlist is just all the "liked" records. Dismissed jobs are also tracked so Gemini never shows the same job twice.

**Technical:** Composite unique constraint on `(UserId, JobId)` prevents double-swiping the same job. Indexed on `UserId` for fast wishlist queries and on `JobId` for fast joins back to the Jobs table.

| Column | Type | Notes |
|---|---|---|
| SwipeId | `SERIAL` PK | |
| UserId | `INT` FK → Users | indexed |
| JobId | `INT` FK → Jobs | indexed |
| Action | `TEXT` | `"liked"` or `"dismissed"` |
| SwipedAt | `TIMESTAMP` | default `NOW()` |

---

## Redis (Temporary Cache)

**Simple:** Redis is not a database — it's fast temporary memory. We use it for two things: remembering your last job feed so we don't call Gemini every time you open the app, and counting how many refreshes you've used today.

**Technical:** Key-value store with TTL. No persistence needed — if Redis restarts, the app falls back to Postgres gracefully. Hosted on Redis Cloud free tier or Railway.

| Key | Value | TTL | Purpose |
|---|---|---|---|
| `feed:{userId}` | JSON array of job objects | 24 hours | Last Gemini feed for this user |
| `refreshes:{userId}` | integer (0–10) | 24 hours | Refresh count for free tier |

When TTL expires → both reset automatically. No cron job needed.

---

## Table Relationships

```
Users (1) ──────────── (1) UserProfiles
  │
  └── (1) ──────────── (N) UserJobSwipes
                                │
Jobs (1) ───────────── (N) UserJobSwipes
```

---

## How the Full System Works (Simple Terms)

```
SIGN UP / LOGIN
─────────────────────────────────────────────
1. You sign up (email or Google/GitHub)
   → A row is created in Users
   → IsOnboarded is set to false
   → You get redirected to /onboard (can't go anywhere else)

2. You complete the onboard form
   → A row is created in UserProfiles with your skills and preferences
   → IsOnboarded flips to true
   → You land on /dashboard


OPENING THE FEED
─────────────────────────────────────────────
3. You open the job feed
   → Backend checks: do you have jobs left from last time? (checks Redis)

   IF YES (Redis hit):
   → Return the cached jobs instantly (no API call, no Gemini call)

   IF NO (Redis miss or first time):
   → Check: have you used all 10 refreshes today? (free users only)

      IF REFRESHES LEFT:
      → Call job API with your skills + preferences as search filters
      → Send results to Gemini: "rank these by best fit for this user"
      → Gemini returns top 20 jobs with a score and reason for each
      → Store jobs in Postgres Jobs table
      → Store the feed in Redis (so next open is instant)
      → Increment your refresh count in Redis
      → Return jobs to you

      IF NO REFRESHES LEFT:
      → Serve the last cached feed from Redis
      → Show banner: "You've used all 10 refreshes — resets in X hours"
      → Offer upgrade to premium


SWIPING
─────────────────────────────────────────────
4. You swipe right (like)
   → Insert row in UserJobSwipes: { userId, jobId, action: "liked" }
   → Job stays in your wishlist forever

5. You swipe left (dismiss)
   → Insert row in UserJobSwipes: { userId, jobId, action: "dismissed" }
   → Gemini will never show this job to you again


WISHLIST
─────────────────────────────────────────────
6. You open your wishlist
   → Query UserJobSwipes WHERE userId = you AND action = "liked"
   → Join with Jobs table to get full job details
   → Show cards with "Apply" button

7. You click Apply
   → Opens Job.Url in a new tab
   → Takes you directly to the company's application page
```

---

## Step-by-Step Implementation Plan

---

### PHASE 1 — Set Up the Database Connection

**Simple:** Tell your backend where the database lives.

**Steps:**

1. Go to your Neon dashboard → copy the connection string
2. Open `JobPilotBackend/appsettings.json` and add:
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=xxx.neon.tech;Database=jobpilot;Username=xxx;Password=xxx;SSL Mode=Require"
}
```
3. Install the Postgres EF Core package:
```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
```
4. Register it in `Program.cs`:
```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
```

---

### PHASE 2 — Create the C# Models

**Simple:** Write one C# class per table. EF Core reads these and creates the actual tables in Neon.

**Steps:**

1. `User.cs` — already exists, just add `IsOnboarded`
2. Create `UserProfile.cs` in `JobPilotBackend/Models/`
3. Create `Job.cs` in `JobPilotBackend/Models/`
4. Create `UserJobSwipe.cs` in `JobPilotBackend/Models/`

Each class property = one column in the table. EF Core maps them automatically.

For Postgres-specific types (arrays, jsonb), install:
```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
```
Then in your model config use `HasColumnType("text[]")` for arrays and `HasColumnType("jsonb")` for raw data.

---

### PHASE 3 — Register Models in DbContext

**Simple:** Tell EF Core which tables exist by adding them to `AppDbContext.cs`.

```csharp
public DbSet<User> Users { get; set; }
public DbSet<UserProfile> UserProfiles { get; set; }
public DbSet<Job> Jobs { get; set; }
public DbSet<UserJobSwipe> UserJobSwipes { get; set; }
```

Also define indexes and constraints here in `OnModelCreating`:
```csharp
// Prevent same job being stored twice
modelBuilder.Entity<Job>()
    .HasIndex(j => j.ExternalId).IsUnique();

// Fast wishlist queries
modelBuilder.Entity<UserJobSwipe>()
    .HasIndex(s => s.UserId);

// Prevent double-swiping same job
modelBuilder.Entity<UserJobSwipe>()
    .HasIndex(s => new { s.UserId, s.JobId }).IsUnique();
```

---

### PHASE 4 — Run the Migration

**Simple:** Two commands that generate and execute the SQL to create your tables in Neon.

```bash
dotnet ef migrations add InitialSchema
dotnet ef database update
```

First command → generates a migration file (the SQL instructions)
Second command → runs that SQL against your Neon database → tables are created

---

### PHASE 5 — Set Up Redis

**Simple:** Add a fast memory layer for feed caching and refresh tracking.

1. Create a free Redis instance on Redis Cloud or Railway
2. Copy the connection string
3. Install the Redis package:
```bash
dotnet add package StackExchange.Redis
```
4. Add to `appsettings.json`:
```json
"Redis": {
  "ConnectionString": "redis://xxx"
}
```
5. Register in `Program.cs`:
```csharp
builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect(builder.Configuration["Redis:ConnectionString"]));
```

---

### PHASE 6 — Build the Endpoints

**Simple:** Create the API routes the frontend will call.

| Endpoint | What it does |
|---|---|
| `POST /api/users/onboard` | Save UserProfile, flip IsOnboarded = true |
| `GET /api/jobs/feed` | Return AI-ranked job stack (with Redis + refresh logic) |
| `POST /api/jobs/swipe` | Record a liked or dismissed swipe |
| `GET /api/jobs/wishlist` | Return all jobs the user liked |
| `POST /api/users/upgrade` | Flip IsPremium = true (when payment is handled) |

**Feed endpoint logic (most complex one):**
```
1. Get user's profile from Postgres
2. Check Redis for cached feed (key: feed:{userId})
   → Hit: return it immediately
3. Check Redis refresh count (key: refreshes:{userId})
   → Free user at 10: return cached feed + "limit reached" flag
4. Call external job API with user's skills + location
5. Send jobs + user profile to Gemini
6. Get back ranked list with scores and reasons
7. Save new jobs to Postgres (ON CONFLICT DO NOTHING for duplicates)
8. Save feed to Redis with 24h TTL
9. Increment refresh count in Redis
10. Return jobs to frontend
```

---

### PHASE 7 — Add Middleware for Onboarding Gate

**Simple:** Make sure users who haven't finished onboarding can't access the dashboard or feed.

**Technical:** ASP.NET middleware that checks `IsOnboarded` on every request to protected routes. If false, returns 403 with a redirect hint to `/onboard`.

```csharp
if (!user.IsOnboarded && request.Path != "/api/users/onboard")
    return Results.Forbid();
```

---

## Tech Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| Database | Neon (Postgres) | All persistent data |
| Cache | Redis | Feed cache + refresh limits |
| ORM | EF Core | C# ↔ Postgres bridge |
| AI | Gemini | Job ranking + match reasons |
| Job Data | External API (Adzuna / JSearch) | Raw job listings |
| Auth | JWT + NextAuth | Sessions + OAuth |

---

## Notes
- Neon scales to zero when idle — no cost during dev
- Redis TTL handles the 24h refresh reset automatically — no scheduled jobs needed
- Gemini only gets called when a real refresh happens — protects API budget
- `ON CONFLICT DO NOTHING` on job inserts means multiple users seeing the same job never creates duplicates
- For full-text job search later: add a `tsvector` column on `Jobs.Description` with a GIN index — no Elasticsearch needed
