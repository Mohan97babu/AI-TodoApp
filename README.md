# Planify | Creative Daily Planner & AI Study Architect

A modern, high-velocity daily planning and to-do application inspired by Adobe's creative visual aesthetics (Adobe Spectrum `#EB1000` crimson palette, fluid dark/light modes, micro-interactions). Built with **React 18**, **Spring Boot 3**, and **PostgreSQL 16**.

---

## 🌟 Key Features

1. **Adobe Creative Aesthetics & Fluid Design**
   - Signature bold red accent (`#EB1000`) with high-contrast dark slate (`#0D0D11`) and clean white canvas modes.
   - Micro-animations: Smooth checkmark fill, confetti particles upon task completion, acrylic backdrop blurs, and responsive card layouts.
   - Low-friction workflows: Inline 1-click task additions, quick options dropdown, and status toggles.

2. **Secure User Isolation & Authentication**
   - Stateless JWT Bearer token authentication.
   - Passwords securely hashed with BCrypt (strength 12).
   - Strict tenant isolation: Every query enforces `WHERE user_id = :currentUserId` across tasks, reminders, and study plans.

3. **Task & Daily Planning Engine**
   - Full CRUD operations with priority tags (`URGENT`, `HIGH`, `MEDIUM`, `LOW`), categories (`WORK`, `STUDY`, `PERSONAL`, `HEALTH`, `GENERAL`), and due dates.
   - Status tracking: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.
   - Real-time search and multi-dimensional status/category filters with dynamic task count badges.

4. **Recurring Tasks & Scheduled Reminders**
   - Automated recurrence rules: `DAILY`, `WEEKDAYS` (Mon-Fri), `WEEKLY`, `MONTHLY`.
   - Spawns subsequent recurring tasks upon completion so historical records remain intact.
   - Background notification scheduler (`NotificationScheduler.java`) polling every 30 seconds for due alerts.
   - Dual-channel notifications: Browser Push (Web Notification API) and Web Audio API synthesized audio chimes.

5. **AI Study Plan Architect & Chat Coach**
   - Generates structured day-by-day learning roadmaps for any topic, duration (1-30 days), and skill level.
   - Interactive **Review & Edit Modal**: Users can customize day titles, focus themes, edit task names/descriptions, adjust duration, add custom tasks, or remove items.
   - 1-Click **"Confirm & Add to My To-Dos"**: Sequentially schedules all tasks starting from the selected start date and commits them to the database.
   - Strategy Coach chatbot for active study guidance, active recall tips, and pomodoro pacing.
   - Resilient hybrid backend: Works with OpenAI (`OPENAI_API_KEY`) and features an intelligent built-in curriculum generator fallback that operates offline.

---

## 📁 Repository Structure

```
├── backend/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/
│       ├── java/com/todoapp/
│       │   ├── TodoApplication.java
│       │   ├── config/          # Spring Security, JWT Filter, Scheduler
│       │   ├── controller/      # Auth, Task, Reminder, AI Controllers
│       │   ├── dto/             # Request & Response Data Transfer Objects
│       │   ├── entity/          # JPA Entities (User, Task, Reminder, StudyPlan)
│       │   ├── repository/      # Spring Data JPA Repositories
│       │   ├── service/         # Business logic, recurring engine, AI service
│       │   └── exception/       # Global exception handler & custom exceptions
│       └── resources/
│           ├── application.yml
│           └── db/migration/V1__init_schema.sql
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── Dockerfile
│   └── src/
│       ├── index.css            # Adobe Spectrum design tokens & animations
│       ├── App.jsx              # Main workspace orchestrator
│       ├── components/          # Navbar, TaskCard, QuickAdd, Modals, AI Drawer
│       ├── context/             # AuthContext, NotificationContext
│       └── services/            # API client, auth, tasks, AI, notifications
└── docker-compose.yml           # PostgreSQL 16, Spring Boot & React services
```

---

## 🚀 Quick Start Guide

### Option 1: One-Command Run with Docker Compose (Recommended)

Make sure Docker is running on your machine:

```bash
# Start PostgreSQL, Spring Boot backend, and React frontend
docker compose up --build -d

# Check running status
docker compose ps
```

- **Frontend Application**: `http://localhost:5174`
- **Backend REST API**: `http://localhost:8080`
- **PostgreSQL Database**: `localhost:5433` (DB: `tododb`, User: `postgres`, Password: `postgres`)

---

### Option 2: Local Development (Native)

#### Prerequisites
- Java 17+ (e.g. JDK 17, 18, or 21)
- Apache Maven 3.8+
- Node.js 18+ and npm
- PostgreSQL 16 (or Docker container running PostgreSQL on port 5433 or 5432)

#### 1. Start PostgreSQL Database
```bash
docker run -d --name planify-postgres -e POSTGRES_DB=tododb -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5433:5432 postgres:16-alpine
```

#### 2. Run the Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
*Note: To run with the lightweight in-memory H2 database (zero installation needed), simply activate the H2 profile:*
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

#### 3. Run the React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5174` in your browser.

---

## 🔐 Demo Credentials

You can instantly register your own account or click the **"Auto-Fill Demo Credentials"** button in the sign-in modal:
- **Username**: `creative_designer`
- **Password**: `AdobeCreative2026!`
- **Email**: `designer@adobe.creative`

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate and retrieve JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/tasks` | List tasks (supports `status`, `category`, `search`) | Yes |
| `POST` | `/api/tasks` | Create a new task with due date & recurrence | Yes |
| `GET` | `/api/tasks/{id}` | Retrieve specific task (isolated to owner) | Yes |
| `PUT` | `/api/tasks/{id}` | Update task title, description, priority, etc. | Yes |
| `PATCH` | `/api/tasks/{id}/status` | Update task status (handles recurring spawn) | Yes |
| `DELETE` | `/api/tasks/{id}` | Delete task | Yes |
| `POST` | `/api/tasks/batch` | Batch create tasks (from AI study plan) | Yes |
| `GET` | `/api/reminders/upcoming` | Fetch pending upcoming reminders | Yes |
| `PATCH` | `/api/reminders/{id}/dismiss` | Dismiss an active reminder alert | Yes |
| `POST` | `/api/ai/study-plan` | Generate day-by-day study roadmap | Yes |
| `POST` | `/api/ai/chat` | Chat coaching assistant response | Yes |
