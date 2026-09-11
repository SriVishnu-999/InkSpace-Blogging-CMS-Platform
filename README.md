# InkSpace — Blogging & CMS Platform

A professional Medium-style publishing platform built with ASP.NET Core, React, SQL Server and Quill.

## Features

- JWT registration/login with Author and Admin roles
- Rich-text writing with Quill 2
- Draft and publish workflow
- Author profiles with post/view statistics
- Categories and reusable tags
- Search, category/tag filters, latest/popular sorting
- Server-side pagination
- Moderated comments (Pending → Approved/Rejected)
- Author creator dashboard
- Admin account and seeded demo author
- Reading-time calculation and view counters
- HTML sanitization before content is stored
- Responsive modern editorial UI
- SQL Server persistence and Docker Compose setup

## Stack

- API: ASP.NET Core / .NET 10, EF Core, JWT Bearer auth, BCrypt, HtmlSanitizer
- Frontend: React 19.3, React Router, Axios, Quill 2.0.3, Lucide icons, Vite
- Database: SQL Server

## Project structure

```text
InkSpace/
├─ server/InkSpace.Api/
│  ├─ Controllers/
│  ├─ Data/
│  ├─ DTOs/
│  ├─ Models/
│  ├─ Services/
│  ├─ Program.cs
│  └─ appsettings.json
├─ client/
│  ├─ src/components/
│  ├─ src/context/
│  ├─ src/lib/
│  ├─ src/pages/
│  └─ src/styles.css
└─ docker-compose.yml
```

## Run locally

### 1. Start SQL Server

From the project root:

```bash
docker compose up -d
```

If you already have SQL Server installed, update `server/InkSpace.Api/appsettings.json` instead.

### 2. Start the API

Install the .NET 10 SDK, then:

```bash
cd server/InkSpace.Api
dotnet restore
dotnet run --urls http://localhost:5087
```

### 3. Start React

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Demo accounts

Author:
- Email: `alex@inkspace.local`
- Password: `Author@123`

Admin:
- Email: `admin@inkspace.local`
- Password: `Admin@123`

Change the demo credentials and JWT secret before any real deployment.

## Core API routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/posts` | Published stories + pagination/search/filter |
| GET | `/api/posts/{slug}` | Story detail |
| GET | `/api/posts/mine/all` | Current author's stories |
| POST | `/api/posts` | Create story |
| PUT | `/api/posts/{id}` | Edit story |
| DELETE | `/api/posts/{id}` | Delete story |
| GET | `/api/categories` | Categories |
| GET | `/api/tags` | Popular tags |
| GET | `/api/users/{username}` | Public author profile |
| GET | `/api/users/me/dashboard` | Creator statistics |
| GET | `/api/comments/post/{postId}` | Approved comments |
| POST | `/api/comments/post/{postId}` | Submit comment |
| GET | `/api/comments/pending` | Moderation queue |
| PATCH | `/api/comments/{id}/moderate` | Approve/reject |



## Production upgrades

For a real deployment:
- Store the JWT signing key in environment variables / a secret manager.
- Use EF Core migrations instead of automatic database creation.
- Add refresh tokens and email verification.
- Add object storage (Azure Blob/S3) for cover-image uploads.
- Add rate limiting, structured logging and health checks.
- Add automated tests and CI/CD.
