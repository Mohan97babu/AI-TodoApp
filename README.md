# Planify | Creative Daily Planner & Dev/Study AI Assistant

A modern, high-velocity daily planning and to-do application inspired by Adobe's creative visual aesthetics (Adobe Spectrum `#EB1000` crimson palette, fluid dark/light modes, micro-interactions). Built with **React 18**, **Spring Boot 3**, **PostgreSQL 16 / H2**, and powered by a local **Qwen 3 (1.7B)** AI engine grounded in official knowledge from **GeeksforGeeks**, **W3Schools**, and **TPointTech**.

---

## 🌟 Key Features

### 1. 🤖 Local Qwen 3 (1.7B) AI Dev & Study Assistant
- **Local Model Serving**: Direct GGUF inference serving `E:\model\qwen3-1.7b\Qwen3-1.7B-Q6_K.gguf` on `http://localhost:8000/v1` with hardware acceleration where supported.
- **API Key Security**: Fully authenticated OpenAI-compatible API Gateway secured with `sk-mdl-...` keys generated via `key_store.py`.
- **Knowledge Grounding Engine**: Real-time integration with 3 leading developer and computer science platforms:
  - 🟢 **GeeksforGeeks** (`https://www.geeksforgeeks.org/`): Data structures, algorithms, coding problems, interview roadmaps.
  - 🟢 **W3Schools** (`https://www.w3schools.com/`): Web technologies, HTML5, CSS3 Flexbox/Grid, JavaScript, React.
  - 🟠 **TPointTech** (`https://www.tpointtech.com/`): Java core, Spring Boot, OOPs, design patterns, microservices.
- **Source Toggles**: Interactively enable or disable specific grounding sources in the drawer.
- **Model Reasoning Display**: Collapsible chain-of-thought drawer to inspect Qwen 3's step-by-step thinking.
- **1-Click "Add to To-Dos"**: Convert any suggested coding exercise, drill, or practice step directly into your daily planner with a single click.

### 2. 📅 AI Study Plan Architect
- Generates structured day-by-day learning roadmaps for any topic, duration (1-30 days), and skill level.
- Interactive **Review & Edit Modal**: Customize day titles, focus themes, task descriptions, and time estimates.
- **1-Click Schedule**: Automatically schedules tasks starting from your selected date and persists them to the database.

### 3. 🎨 Adobe Spectrum Creative Aesthetics
- Bold red accent (`#EB1000`) with high-contrast dark slate (`#0D0D11`) and clean white canvas modes.
- Micro-animations: Confetti particles upon completion, smooth checkmark fills, floating assistant trigger (FAB), and glassmorphism.

### 4. 🔒 Strict Multi-Tenant Security & Notifications
- Stateless JWT Bearer token authentication and BCrypt (strength 12) passwords.
- Strict isolation: All queries enforce `WHERE user_id = :currentUserId`.
- Dual-channel notifications: Browser push alerts and Web Audio synthesized chimes.

---

## 📁 Repository Structure

```
├── backend/
│   ├── mvnw.cmd                 # Portable Maven wrapper
│   ├── Dockerfile
│   └── src/main/
│       ├── java/com/todoapp/
│       │   ├── controller/      # Auth, Task, Reminder, AI Controllers
│       │   ├── dto/             # Request & Response DTOs (ChatbotRequest, etc.)
│       │   ├── entity/          # JPA Entities (User, Task, Reminder, StudyPlan)
│       │   ├── service/         # TaskService, WebKnowledgeService, AiChatbotService
│       │   └── config/          # Spring Security, JWT Filter, Scheduler
│       └── resources/
│           ├── application.yml  # Configured for Qwen3-1.7b & local model gateway
│           └── db/migration/V1__init_schema.sql
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AiDevChatbotDrawer.jsx   # Qwen 3 + GFG/W3S/TPointTech Chatbot
│   │   │   ├── AiStudyPlannerDrawer.jsx # Curriculum generator drawer
│   │   │   ├── Navbar.jsx               # Header with AI Dev Assistant trigger
│   │   │   ├── TaskCard.jsx             # Interactive task cards
│   │   │   └── QuickAddTask.jsx
│   │   ├── services/
│   │   │   ├── aiService.js             # Chatbot & model status client
│   │   │   └── taskService.js
│   │   └── index.css                    # Design tokens & micro-animations
├── tools/
│   └── apache-maven-3.9.6/      # Portable Maven runtime
├── start.bat                    # 1-Click launcher (Model + Backend + Frontend)
├── start.ps1                    # PowerShell 1-Click launcher
└── docker-compose.yml           # PostgreSQL, Backend, Frontend
```

---

## 🚀 Quick Start (Local Native)

### Option 1: Local Windows launcher

Copy `.env.example` to `.env` and set a random `JWT_SECRET` plus your local gateway token before starting. Ensure Java 17+, Maven, Node.js, npm and Python are available. Then run:
```cmd
start.bat
```
This automatically starts:
1. **Local Model Server** on `http://localhost:8000` (serving `qwen3-1.7b`)
2. **Spring Boot Backend** on `http://localhost:8082`
3. **React Frontend** on `http://localhost:5174`
4. Open `http://localhost:5174` in your browser after the service windows start.

---

### Option 2: Step-by-Step Manual Launch

#### 1. Start the Local Model Server
```bash
cd E:\model
python run_server.py --host 127.0.0.1 --port 8000 --no-browser
```

#### 2. Start the Spring Boot Backend
```cmd
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```
Backend will be live on `http://localhost:8082`.

#### 3. Start the React Frontend
```bash
cd frontend
npm ci
npm run dev
```
Frontend will be live on `http://localhost:5174`.

---

## 🔑 Model & API Key Configuration

| Parameter | Value |
|---|---|
| **Model Path** | `E:\model\qwen3-1.7b\Qwen3-1.7B-Q6_K.gguf` |
| **Model ID** | `qwen3-1.7b` |
| **Gateway Base URL** | `http://localhost:8000/v1` |
| **Local Model Gateway API Key** | `[SET_IN_ENV]` |
| **Grounding Sources** | GeeksforGeeks, W3Schools, TPointTech |

---

## 🐳 Docker Deployment

To run containerized services, first create `.env` with strong values as described below:
```bash
docker compose up --build -d
```
- Frontend: `http://localhost:5174`
- Backend: `http://localhost:8082`
- PostgreSQL: `localhost:5433` (Database: `tododb`)


## Production configuration (required)

1. Copy `.env.example` to `.env`, replace every placeholder with unique strong secrets, and keep `.env` out of Git.
2. Rotate any model API key and JWT signing secret that were previously committed. Changing the JWT secret invalidates existing sessions.
3. Run `docker compose up --build -d` and check `docker compose ps` and `http://localhost:5174/`.
4. Production frontend is served by Nginx with `/api` forwarded to Spring Boot; expose TLS using your chosen reverse proxy/load balancer.
5. Qwen runs on the host, not inside Compose; configure `OPENAI_API_URL` to reach your actual model gateway from the backend container. Protect the model gateway with a firewall and key.
6. API chat and study planning require login; model status and health remain public.

Run `cd frontend && npm ci && npm run build` and `cd backend && mvn -B test package` before release.

**Existing PostgreSQL volumes:** Changing `DB_USER` or `DB_PASSWORD` in Compose does not update credentials inside an already-initialized database. Back up data and migrate credentials before switching an existing deployment; do not delete production volumes just to reset a password.

**Release gate:** CI runs React tests/build, Maven verification, configuration/secret scans, and a Docker smoke test. HTTPS, backups, database migrations, monitoring, and access policies must still be configured for a public production environment. Never expose the model gateway directly to the internet.
