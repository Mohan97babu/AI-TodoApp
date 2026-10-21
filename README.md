# Planify | Creative Daily Planner & Dev/Study AI Assistant

A modern, high-velocity daily planning and to-do application inspired by Adobe's creative visual aesthetics (Adobe Spectrum `#EB1000` crimson palette, fluid dark/light modes, micro-interactions). Built with **React 18**, **Spring Boot 3**, **PostgreSQL 16 / H2**, and integrated with a local **Qwen 3 (1.7B)** AI engine, curated programming summaries, and suggested reference links to **GeeksforGeeks**, **W3Schools**, and **TPointTech**.

---

## 🌟 Key Features

### 1. 🤖 Local Qwen 3 (1.7B) AI Dev & Study Assistant
- **Local Model Serving**: Direct GGUF inference serving `E:\model\qwen3-1.7b\Qwen3-1.7B-Q6_K.gguf` on `http://localhost:8000/v1` with hardware acceleration where supported.
- **API Key Security**: Fully authenticated OpenAI-compatible API Gateway secured with `sk-mdl-...` keys generated via `key_store.py`.
- **Learning References**: A small local catalog of programming summaries with suggested links to three external tutorial sites (not live website ingestion):
  - 🟢 **GeeksforGeeks** (`https://www.geeksforgeeks.org/`): Data structures, algorithms, coding problems, interview roadmaps.
  - 🟢 **W3Schools** (`https://www.w3schools.com/`): Web technologies, HTML5, CSS3 Flexbox/Grid, JavaScript, React.
  - 🟠 **TPointTech** (`https://www.tpointtech.com/`): Java core, Spring Boot, OOPs, design patterns, microservices.
- **Reference Toggles**: Choose which tutorial sites appear as suggested links in the drawer. These switches do not fetch site content.
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

## Run the application — commands and where to run them

> **Windows paths used below:** application at `F:\AI-TodoApp`; Qwen model gateway at `E:\model`. Use **PowerShell** for the commands marked PowerShell. The frontend is on port **5174**, the Spring Boot API on **8082**, and the optional local Qwen gateway on **8000**. Choose **either** native development **or** Docker for the application; do not start both on the same ports.

### 1. Get the latest `mothini` code — Windows PowerShell

If you already cloned the repository:

~~~powershell
cd F:\AI-TodoApp
git fetch origin
git switch mothini
git pull --ff-only origin mothini
~~~

If you **have not** cloned it (run in PowerShell from any directory; `F:\AI-TodoApp` must not already exist):

~~~powershell
git clone --branch mothini https://github.com/Mohan97babu/AI-TodoApp.git F:\AI-TodoApp
cd F:\AI-TodoApp
~~~

### 2. Configure environment variables — Windows PowerShell, project root

~~~powershell
cd F:\AI-TodoApp
Copy-Item .env.example .env
notepad .env
~~~

In `.env`, replace **all** `CHANGE_ME` values with a strong, unique `DB_PASSWORD`, a random `JWT_SECRET` of at least 32 characters, and the API token required by **your own** local model gateway (`OPENAI_API_KEY`). Keep the file private and **never commit it**. Set `OPENAI_MODEL=qwen3-1.7b`.

To generate a random JWT signing secret in PowerShell and paste the output into the `JWT_SECRET` value in `.env`:

~~~powershell
$bytes = New-Object byte[] 48
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
~~~

The example `OPENAI_API_URL=http://host.docker.internal:8000/v1/chat/completions` is for Docker. The native launcher translates this to `localhost`. Do not put the model's path (`E:\model\qwen3-1.7b`) in `OPENAI_API_URL`: the Spring Boot app needs an **HTTP endpoint**, not a model file path.

### 3A. Easiest local development — Windows (H2 database)

**Prerequisites:** Java 17+, Maven 3.8+, Node.js 22/npm, Python and the installed dependencies of your existing model gateway. Docker is **not** needed for this option. From **PowerShell**:

~~~powershell
cd F:\AI-TodoApp
.\start.ps1
~~~

Or from **Command Prompt (CMD)**:

~~~bat
cd /d F:\AI-TodoApp
start.bat
~~~

The launcher reads `.env`, starts the backend and frontend in separate windows, and tries to start `E:\model\run_server.py` when that file exists. To check the model and gateway paths in PowerShell:

~~~powershell
Test-Path 'E:\model\run_server.py'
Test-Path 'E:\model\qwen3-1.7b\Qwen3-1.7B-Q6_K.gguf'
~~~

For this option, Spring Boot uses **H2 in-memory development storage**: tasks do **not** survive a full backend restart. The launcher opens process windows; check their logs if a service fails. Open `http://localhost:5174/` in your browser.

#### Start services manually (three PowerShell terminals, alternative to the launcher)

**Terminal 1 — local model gateway** (only if you have `E:\model\run_server.py`):

~~~powershell
cd E:\model
python run_server.py --host 127.0.0.1 --port 8000 --no-browser
~~~

**Terminal 2 — Spring Boot backend.** The manual backend process does **not** load `.env` automatically, so import it into this PowerShell session first:

~~~powershell
cd F:\AI-TodoApp
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
    [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2].Trim().Trim('"').Trim("'"), 'Process')
  }
}
$env:OPENAI_API_URL = 'http://localhost:8000/v1/chat/completions'
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=h2"
~~~

**Terminal 3 — React frontend:**

~~~powershell
cd F:\AI-TodoApp\frontend
npm ci
npm run dev
~~~

Visit `http://localhost:5174/`. The development Vite server forwards `/api` requests to `http://localhost:8082`.

### 3B. Docker deployment — Windows PowerShell (persistent PostgreSQL)

**Prerequisites:** Docker Desktop with Docker Compose, the configured `.env` from step 2, and an independently running Qwen gateway if you want live model answers. Run all the following **from the project root**:

~~~powershell
cd F:\AI-TodoApp
docker compose config --quiet
docker compose up --build -d
docker compose ps
~~~

Check the application and services:

~~~powershell
curl.exe http://localhost:8082/actuator/health
Start-Process 'http://localhost:5174/'
docker compose logs --tail 100 backend
~~~

To follow backend logs continuously (press **Ctrl+C** to stop following logs):

~~~powershell
docker compose logs -f backend
~~~

To **stop** the containers without deleting PostgreSQL data:

~~~powershell
cd F:\AI-TodoApp
docker compose down
~~~

To start again using existing images:

~~~powershell
docker compose up -d
~~~

**Database:** PostgreSQL runs in Docker and persists data in the `pgdata` volume. Never use `docker compose down -v` on data you want to keep. The database is bound to `127.0.0.1:5433`, the backend to `127.0.0.1:8082`, and the Nginx frontend to port `5174`.

**Qwen with Docker:** The model weights at `E:\model\qwen3-1.7b` remain on the Windows host; they are **not** bundled in the Docker images. Start the host's gateway separately, and ensure the container can actually reach the `OPENAI_API_URL` in `.env` (normally `http://host.docker.internal:8000/v1/chat/completions`). A gateway that listens only on `127.0.0.1` may not be reachable from a container. If you change its listening address, restrict port 8000 with Windows Firewall; do **not** expose it publicly. Use the gateway's own API token.

### 4. Test before pushing or deploying

Run **frontend tests and production build** from Windows PowerShell:

~~~powershell
cd F:\AI-TodoApp\frontend
npm ci
npm test
npm run build
~~~

Run **Spring Boot verification** from another PowerShell terminal:

~~~powershell
cd F:\AI-TodoApp\backend
mvn -B -ntp verify
~~~

The connected GitHub Actions workflow additionally builds the Docker images and tests API health, authentication, task CRUD, and isolation between users against a disposable PostgreSQL database.

### 5. Troubleshooting commands

~~~powershell
# From F:\AI-TodoApp — container status and errors
docker compose ps
docker compose logs --tail 150 backend
docker compose logs --tail 100 postgres
docker compose logs --tail 100 frontend

# Confirm the API is responding
curl.exe -i http://localhost:8082/actuator/health

# Confirm Java, Maven and Node.js are installed
java -version
mvn -version
node --version
npm --version

# Check local model gateway files
Test-Path 'E:\model\run_server.py'
Test-Path 'E:\model\qwen3-1.7b\Qwen3-1.7B-Q6_K.gguf'
~~~

If Docker cannot start, verify Docker Desktop is running, the `.env` placeholders were replaced, and ports 5174/8082/5433 are free. If Qwen shows offline, check port 8000, the model gateway process, its API token, and the configured `OPENAI_API_URL`.

### 6. Git commands to commit future updates — PowerShell

~~~powershell
cd F:\AI-TodoApp
git switch mothini
git status
git add .
git commit -m "Describe your changes"
git push origin mothini
~~~

Only run `git commit` when you have local changes to save. The `.env` file is ignored by Git; double-check staged files with `git diff --cached --name-only` before pushing.

### Production release notes

- Keep JWT, database, and gateway secrets in environment configuration. **Rotate credentials that appeared in earlier commits**: removing them from the latest source does not remove them from Git history.
- Use HTTPS/TLS in front of Nginx for public access. Configure firewall rules, monitoring, database backups, disaster recovery, and migrations.
- Changing `DB_USER` or `DB_PASSWORD` in `.env` does not reconfigure an already-initialized PostgreSQL volume; plan credential changes without deleting production data.
- API chat and study planning require sign-in. Only public health/model availability information should be exposed.
- Verify Qwen's real inference separately on your Windows PC. The repository's programming knowledge is **curated topic notes with reference links**, not live ingestion of GeeksforGeeks, W3Schools, or TPointTech.

---

## Documentation integrity and remaining launch requirements

The Qwen integration currently uses built-in curated topic summaries and suggested URLs, **not** continuously synchronized content from third-party tutorial sites. The app does not confirm each linked page is current or even available. Do not market those responses as verified live retrieval. Future indexing should follow the sites' access rules and licensing terms, and provide per-answer citations to the actual retrieved passages.

The GitHub Actions Docker smoke tests exercise registration, task creation/listing/update/deletion, and user isolation in a fresh database. They **do not** verify the model weights at `E:\model\qwen3-1.7b`, actual GPU inference, live external website retrieval, HTTPS termination, database backup recovery, or browser-level accessibility. Perform those checks with the real production infrastructure before public launch.
