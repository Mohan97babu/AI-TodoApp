# Planify | Creative Daily Planner & Dev/Study AI Assistant

A full-stack AI to-do and study planner built with **React 18, Spring Boot 3, PostgreSQL 16, Ollama, and Qwen3 1.7B**. With the recommended Docker setup, the **app, database, and AI model server start together**. No separately installed Qwen model or local \`E:\model\` folder is required.

## 🚀 Quick Start — clone and run with Docker (recommended)

**Requirements:** Git, Docker Desktop (Windows/macOS) or Docker Engine + Docker Compose (Linux), an internet connection for the first setup, and enough disk space/RAM for the app and model. You do **not** need Java, Node.js, Python, Maven, Ollama, or Qwen installed on your host computer.

### Windows — PowerShell

Run these commands in **PowerShell** in the folder where you want to clone the project:

\`\`\`powershell
git clone --branch mothini https://github.com/Mohan97babu/AI-TodoApp.git
cd AI-TodoApp
.\start-docker.ps1
\`\`\`

Open **http://localhost:5174** after the services have started. Keep Docker Desktop running.

### Linux / macOS — terminal

\`\`\`bash
git clone --branch mothini https://github.com/Mohan97babu/AI-TodoApp.git
cd AI-TodoApp
sh ./start-docker.sh
\`\`\`

Open **http://localhost:5174**.

### What starts automatically?

| Container | Purpose | Accessible from host |
|---|---|---|
| \`frontend\` | React production build served by Nginx | \`http://localhost:5174\` |
| \`backend\` | Spring Boot REST API and authenticated AI integration | \`http://localhost:8082\` (loopback only) |
| \`postgres\` | Persistent tasks and user data | \`127.0.0.1:5433\` |
| \`ollama\` | Private local AI inference service | Docker internal network only |
| \`ollama-init\` | Downloads Qwen3 on first run (and ensures it is present) | Not exposed |

The startup scripts create a local \`.env\` with randomly generated **database password** and **JWT secret** if it does not already exist. Existing \`.env\` files are preserved. If an existing file has \`CHANGE_ME\` values for \`DB_PASSWORD\` or \`JWT_SECRET\`, replace those values before starting. Keep \`.env\` out of Git.

### Model installation: automatic and cached

Docker uses Ollama's **\`qwen3:1.7b\`** (approximately **1.4 GB** in the default quantization). The \`ollama-init\` container pulls the model automatically. The weights are **not part of the Git repository** and are **not** taken from the original developer's computer.

- **First run:** Docker downloads the Ollama image(s) and Qwen model. Startup will take longer and requires internet access.
- **Later runs:** Previously downloaded weights are reused from the **\`ollama_data\` Docker volume**. No manual model installation is required.
- **Different computer:** Each computer downloads its own copy automatically on its first startup.
- **Your original GGUF:** The separate \`E:\model\qwen3-1.7b\Qwen3-1.7B-Q6_K.gguf\` is **not** copied into the image. The default Docker model is a different quantization of Qwen3 1.7B.

**Check model download and status:**

\`\`\`powershell
docker compose ps
docker compose logs -f ollama-init
docker compose exec ollama ollama list
docker compose logs --tail 100 backend
\`\`\`

**Stop and start again without deleting data/model weights:**

\`\`\`powershell
docker compose down
docker compose up -d
\`\`\`

**Do not use \`docker compose down -v\`** unless you intentionally want to delete **both** PostgreSQL data and cached model weights.

### Optional NVIDIA GPU acceleration

The default configuration supports **CPU inference** (slower but no NVIDIA GPU required). On a system with properly configured NVIDIA GPU access for Docker:

\`\`\`powershell
docker compose -f docker-compose.yml -f docker-compose.gpu.yml up --build -d
\`\`\`

GPU support depends on the host drivers, Docker runtime and hardware. The model is not publicly exposed: the Spring Boot backend calls \`http://ollama:11434/v1/chat/completions\` on the private Compose network.

---

## 🌟 Key Features

### 1. 🤖 Local Qwen 3 (1.7B) AI Dev & Study Assistant
- **Docker-managed AI**: Compose starts Ollama and automatically downloads `qwen3:1.7b` (~1.4 GB, Q4_K_M) into a persistent Docker volume on first use. Other computers **do not** need your `E:\model` folder or a separate local Qwen installation.
- **Optional native Windows gateway**: `start.ps1` can still serve your own `E:\model\qwen3-1.7b\Qwen3-1.7B-Q6_K.gguf` using `E:\model\run_server.py`. This Q6_K file is **not** the same as the Ollama Q4_K_M default.
- **API security**: Browser access to chat uses JWT-protected Spring Boot endpoints. The Docker-internal Ollama API **does not authenticate its own requests**; it is not published to the host or internet. An optional standalone model gateway can enforce its own key.
- **Learning References**: A small local catalog of programming summaries with suggested links to three external tutorial sites (not live website ingestion):
  - 🟢 **GeeksforGeeks** (`https://www.geeksforgeeks.org/`): Data structures, algorithms, coding problems, interview roadmaps.
  - 🟢 **W3Schools** (`https://www.w3schools.com/`): Web technologies, HTML5, CSS3 Flexbox/Grid, JavaScript, React.
  - 🟠 **TPointTech** (`https://www.tpointtech.com/`): Java core, Spring Boot, OOPs, design patterns, microservices.
- **Reference Toggles**: Choose which tutorial sites appear as suggested links in the drawer. These switches do not fetch site content.
- **AI Response Details**: Collapsible model reasoning when a compatible model supplies it; the Docker Qwen configuration requests concise, non-thinking responses.
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
├── docker-compose.yml           # Production app stack: DB, API, UI, Ollama + model pull
├── docker-compose.gpu.yml       # Optional NVIDIA acceleration
├── docker-compose.ci.yml        # CI mock model (not for real users)
├── start-docker.ps1             # Docker one-command Windows setup
└── start-docker.sh              # Docker one-command Linux/macOS setup
```

---

## 🛠️ Advanced: run without Docker (optional)

This is an alternative **development mode**, not required for anyone using the Docker Quick Start above. It runs the React frontend, Spring Boot backend (H2 in-memory development database) and **your own separately installed** model gateway on Windows.

**Requirements for this option only:** Java 17+, Maven, Node.js/npm, Python and any dependencies required by your own Qwen gateway. The \`start.ps1\` launcher looks for a gateway script at \`E:\model\run_server.py\`.

**1. Clone or update the branch:**

\`\`\`powershell
git clone --branch mothini https://github.com/Mohan97babu/AI-TodoApp.git
cd AI-TodoApp
\`\`\`

If you already cloned it, use \`git switch mothini\` and \`git pull origin mothini\` instead.

**2. Configure the local environment:**

\`\`\`powershell
Copy-Item .env.example .env
notepad .env
\`\`\`

Replace \`DB_PASSWORD\` and \`JWT_SECRET\` with unique strong values. For the **standalone gateway only**, configure \`OPENAI_API_KEY\`, \`OPENAI_API_URL=http://localhost:8000/v1/chat/completions\`, and \`OPENAI_MODEL=qwen3-1.7b\` according to your gateway.

**3. Start the local launcher:**

\`\`\`powershell
.\start.ps1
\`\`\`

Or in Command Prompt: \`start.bat\`. The launcher opens separate terminal windows for the backend/frontend and tries to launch the model gateway if present. Open \`http://localhost:5174\`. This mode uses an H2 **in-memory database**, so application data does not survive a backend restart.

For manual setup, use **three separate PowerShell terminals**:

\`\`\`powershell
# Terminal 1 — OPTIONAL: only when E:\model\run_server.py exists
cd E:\model
python run_server.py --host 127.0.0.1 --port 8000 --no-browser
\`\`\`

\`\`\`powershell
# Terminal 2 — backend; read .env into this process first
cd <your-repo-folder>
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
    [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2].Trim().Trim('"').Trim("'"), 'Process')
  }
}
$env:OPENAI_API_URL = 'http://localhost:8000/v1/chat/completions'
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=h2"
\`\`\`

\`\`\`powershell
# Terminal 3 — frontend
cd <your-repo-folder>\frontend
npm ci
npm run dev
\`\`\`

The PowerShell commands above use \`<your-repo-folder>\` as a placeholder for your actual cloned repository path. For example, use \`F:\AI-TodoApp\`. Run native and Docker modes separately to avoid port conflicts.

---

## ✅ Test before pushing or deploying

For contributors with Node.js and Java/Maven installed locally, run these commands in PowerShell (Docker-only users can skip them):

**Frontend tests and production build:**

~~~powershell
cd F:\AI-TodoApp\frontend
npm ci
npm test
npm run build
~~~

**Spring Boot verification:**

~~~powershell
cd F:\AI-TodoApp\backend
mvn -B -ntp verify
~~~

GitHub Actions builds the application with `docker-compose.ci.yml`, which uses a **simulated** Ollama-compatible API to validate chatbot routing without downloading the real model weights on every push. CI also tests API health, authentication, task CRUD, and user isolation. Real Qwen generation must additionally be tested on a machine running the normal `docker-compose.yml`.

## 🧰 Troubleshooting

Run in PowerShell from the cloned project directory:

\`\`\`powershell
# Container status and logs
docker compose ps
docker compose logs --tail 150 backend
docker compose logs --tail 100 postgres
docker compose logs --tail 100 frontend
docker compose logs --tail 120 ollama-init
docker compose logs --tail 120 ollama

# Check backend / model cache
curl.exe -i http://localhost:8082/actuator/health
docker compose exec ollama ollama list
\`\`\`

**For the optional non-Docker Windows development mode only:**

\`\`\`powershell
java -version
mvn -version
node --version
npm --version
Test-Path 'E:\model\run_server.py'
\`\`\`

**Common issues:** If Docker cannot start, check that Docker Desktop/Engine is running, your `.env` has valid `DB_PASSWORD` and `JWT_SECRET`, and ports 5174/8082/5433 are free. If the app starts but the AI is unavailable, check `docker compose logs ollama-init` for first-run download errors and `docker compose exec ollama ollama list` for `qwen3:1.7b`. CPU inference may be slow. Port 8000 applies only to the optional **non-Docker** model gateway.

## 🔀 Git commands to commit future updates — PowerShell

~~~powershell
cd F:\AI-TodoApp
git switch mothini
git status
git add .
git commit -m "Describe your changes"
git push origin mothini
~~~

Run these commands from the project folder. Only run `git commit` when you have local changes to save. The `.env` file is ignored by Git; double-check staged files with `git diff --cached --name-only` before pushing.

## 🔒 Production release notes

- Keep JWT, database, and any **standalone** gateway secrets in environment configuration. Docker's built-in Ollama service has **no API authentication** and must stay network-private. **Rotate credentials that appeared in earlier commits**: removing them from the latest source does not remove them from Git history.
- Use HTTPS/TLS in front of Nginx for public access. Configure firewall rules, monitoring, database backups, disaster recovery, and migrations.
- Changing `DB_USER` or `DB_PASSWORD` in `.env` does not reconfigure an already-initialized PostgreSQL volume; plan credential changes without deleting production data.
- API chat and study planning require sign-in. Only public health/model availability information should be exposed.
- Verify Docker Qwen inference on a target machine after its first model pull. You do not need a standalone model server. The repository's programming knowledge is **curated topic notes with reference links**, not live ingestion of GeeksforGeeks, W3Schools, or TPointTech.

---

## Documentation integrity and remaining launch requirements

The Qwen integration currently uses built-in curated topic summaries and suggested URLs, **not** continuously synchronized content from third-party tutorial sites. The app does not confirm each linked page is current or even available. Do not market those responses as verified live retrieval. Future indexing should follow the sites' access rules and licensing terms, and provide per-answer citations to the actual retrieved passages.

The GitHub Actions Docker smoke tests exercise registration, task creation/listing/update/deletion, user isolation and mocked AI routing in a fresh database. They **do not** download or test real Qwen weights, actual GPU inference, live external website retrieval, HTTPS termination, database backup recovery, or browser-level accessibility. Perform those checks with the real production infrastructure before public launch.
