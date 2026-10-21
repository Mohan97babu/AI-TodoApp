# Planify | Creative Daily Planner & Dev/Study AI Assistant

A modern, high-velocity daily planning and to-do application inspired by Adobe's creative visual aesthetics (Adobe Spectrum `#EB1000` crimson palette, fluid dark/light modes, micro-interactions). Built with **React 18**, **Spring Boot 3**, **PostgreSQL 16 / H2**, and integrated with a local **Qwen 3 (1.7B)** AI engine, curated programming summaries, and suggested reference links to **GeeksforGeeks**, **W3Schools**, and **TPointTech**.

---

## 🌟 Key Features

### 1. 🤖 Local Qwen 3 (1.7B) AI Dev & Study Assistant
- **Docker self-contained AI**: Compose starts Ollama and automatically downloads `qwen3:1.7b` (~1.4 GB, Q4_K_M) into a persistent Docker volume on first use. Other computers **do not** need your `E:\model` folder or a separate local Qwen installation.
- **Optional native Windows gateway**: `start.ps1` can still serve your own `E:\model\qwen3-1.7b\Qwen3-1.7B-Q6_K.gguf` using `E:\model\run_server.py`. This Q6_K file is **not** the same as the Ollama Q4_K_M default.
- **API security**: Browser access to chat uses JWT-protected Spring Boot endpoints. The Docker-internal Ollama API **does not authenticate its own requests**; it is not published to the host or internet. An optional standalone model gateway can enforce its own key.
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
├── docker-compose.yml           # PostgreSQL, Backend, Frontend, Ollama + model init
├── docker-compose.gpu.yml       # Optional NVIDIA acceleration
├── docker-compose.ci.yml        # CI mock model (not for real users)
├── start-docker.ps1             # Docker one-command Windows setup
└── start-docker.sh              # Docker one-command Linux/macOS setup
```

---

## Run the application — commands and where to run them

> **Windows paths used below:** application at `F:\AI-TodoApp`. The optional *non-Docker* model gateway is at `E:\model`. **Docker mode does not use your E: drive.** Frontend: `5174`, Spring Boot API: `8082`; Docker Ollama runs only inside the private Compose network at `ollama:11434`. Choose **either** native development or Docker, not both on the same application ports.

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

### 2. Configure environment variables for **native Windows mode** (skip for Docker)

**If you use Docker, skip this step and go straight to 3B.** `start-docker.ps1` or `start-docker.sh` automatically creates `.env` with random database/JWT secrets, and Ollama installs the model automatically. For standalone Windows development, use PowerShell:

~~~powershell
cd F:\AI-TodoApp
Copy-Item .env.example .env
notepad .env
~~~

In `.env`, replace the `CHANGE_ME` passwords and JWT secret with unique values. For **standalone Windows** mode, set `OPENAI_API_KEY` to the key for your own local model gateway, `OPENAI_API_URL=http://localhost:8000/v1/chat/completions`, and `OPENAI_MODEL=qwen3-1.7b`. Keep `.env` private. Docker mode ignores the standalone model key and URL and uses its own internal Ollama service.

To generate a random JWT signing secret in PowerShell and paste the output into the `JWT_SECRET` value in `.env`:

~~~powershell
$bytes = New-Object byte[] 48
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
~~~

Do not put the model file path (`E:\model\qwen3-1.7b`) into `OPENAI_API_URL`: the standalone backend uses an HTTP endpoint. Docker mode connects automatically to `http://ollama:11434/v1/chat/completions` and does **not** require any `OPENAI_API_KEY` to access Ollama.

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

### 3B. Docker deployment — all services plus Qwen3 (recommended)

**Prerequisite: Docker Desktop** on Windows/macOS or Docker Engine + Compose on Linux. You do **not** need Python, Java, npm, Ollama or a model file installed on your computer. The default Ollama inference works on **CPU** (can be slow). First startup downloads model weights **once within Docker**; later launches reuse the `ollama_data` volume.

**New user, Windows PowerShell** (after cloning the repository):

~~~powershell
cd F:\AI-TodoApp
.\start-docker.ps1
~~~

This creates `.env` with random strong secrets (if one does not exist), validates the Docker configuration, builds the frontend/backend containers, starts PostgreSQL + Ollama, downloads Qwen automatically and then starts Spring Boot.

**New user, macOS/Linux terminal** (after cloning the repository):

~~~bash
cd AI-TodoApp
sh ./start-docker.sh
~~~

**Already configured `.env`?** You can use Docker directly from the project root:

~~~powershell
docker compose up --build -d
docker compose ps
~~~

**View model download progress and check the installed model:**

~~~powershell
docker compose logs -f ollama-init
docker compose exec ollama ollama list
docker compose logs --tail 100 backend
~~~

The model is **qwen3:1.7b**, approximately **1.4 GB** in Ollama's `Q4_K_M` quantization. It is not a copy of your custom Q6_K GGUF file. Models are pulled over the internet on first use, not committed to GitHub. Updates or changing `OLLAMA_MODEL` in `.env` may download new weights. Users need enough free disk space, RAM, and an internet connection **for the first run**.

**Open your app:**

~~~powershell
Start-Process 'http://localhost:5174/'
curl.exe http://localhost:8082/actuator/health
~~~

**Optional NVIDIA GPU acceleration** (requires compatible GPU, drivers, and NVIDIA container runtime support):

~~~powershell
docker compose -f docker-compose.yml -f docker-compose.gpu.yml up --build -d
~~~

The CPU-only Compose works without an NVIDIA GPU. On other GPU types, verify Docker pass-through support before enabling acceleration.

**Stop and restart while keeping PostgreSQL data and model cache:**

~~~powershell
docker compose down
docker compose up -d
~~~

**Never run `docker compose down -v` unless you intentionally want to delete *both* database data and cached model weights.** The model is stored in Docker's named `ollama_data` volume, not a Windows `E:\model` folder. Ollama's port 11434 is **not exposed publicly**. The application connects over Compose networking.

If your project folder already has a `.env` from an older version, `start-docker.ps1` will preserve it. Replace any `CHANGE_ME` values for `DB_PASSWORD` and `JWT_SECRET`. The previous standalone gateway settings are not used by the Docker backend. To choose a different Ollama tag, set `OLLAMA_MODEL` in `.env`.

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

GitHub Actions builds the application with `docker-compose.ci.yml`, which uses a **simulated** Ollama-compatible API to validate chatbot routing without downloading 1.4 GB of weights on every push. CI also tests API health, authentication, task CRUD, and user isolation. Real Qwen generation must additionally be tested on a machine running the normal `docker-compose.yml`.

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

# Docker Qwen model pull and installed models
docker compose logs --tail 120 ollama-init
docker compose exec ollama ollama list

# Optional non-Docker Windows gateway only
Test-Path 'E:\model\run_server.py'
Test-Path 'E:\model\qwen3-1.7b\Qwen3-1.7B-Q6_K.gguf'
~~~

If Docker cannot start, verify Docker Desktop is running, `DB_PASSWORD`/`JWT_SECRET` are configured, and ports 5174/8082/5433 are free. If Qwen shows offline, inspect `docker compose logs ollama-init` and `docker compose logs ollama`. Use `docker compose exec ollama ollama list` to verify the model is present. Port 8000 only applies to the **optional native Windows gateway**, not Docker.

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

- Keep JWT, database, and any **standalone** gateway secrets in environment configuration. Docker's built-in Ollama service has **no API authentication** and must stay network-private. **Rotate credentials that appeared in earlier commits**: removing them from the latest source does not remove them from Git history.
- Use HTTPS/TLS in front of Nginx for public access. Configure firewall rules, monitoring, database backups, disaster recovery, and migrations.
- Changing `DB_USER` or `DB_PASSWORD` in `.env` does not reconfigure an already-initialized PostgreSQL volume; plan credential changes without deleting production data.
- API chat and study planning require sign-in. Only public health/model availability information should be exposed.
- Verify Docker Qwen inference on a target machine after its first model pull. You do not need a standalone model server. The repository's programming knowledge is **curated topic notes with reference links**, not live ingestion of GeeksforGeeks, W3Schools, or TPointTech.

---

## Documentation integrity and remaining launch requirements

The Qwen integration currently uses built-in curated topic summaries and suggested URLs, **not** continuously synchronized content from third-party tutorial sites. The app does not confirm each linked page is current or even available. Do not market those responses as verified live retrieval. Future indexing should follow the sites' access rules and licensing terms, and provide per-answer citations to the actual retrieved passages.

The GitHub Actions Docker smoke tests exercise registration, task creation/listing/update/deletion, user isolation and mocked AI routing in a fresh database. They **do not** download or test real Qwen weights, actual GPU inference, live external website retrieval, HTTPS termination, database backup recovery, or browser-level accessibility. Perform those checks with the real production infrastructure before public launch.
