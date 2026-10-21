# Planify | Creative Daily Planner & Dev/Study AI Assistant

A modern, high-velocity daily planning and to-do application inspired by Adobe's creative visual aesthetics (Adobe Spectrum `#EB1000` crimson palette, fluid dark/light modes, micro-interactions). Built with **React 18**, **Spring Boot 3**, **PostgreSQL 16 / H2**, and powered by a local **Qwen 3 (1.7B)** AI engine grounded in official knowledge from **GeeksforGeeks**, **W3Schools**, and **TPointTech**.

---

## 🌟 Key Features

### 1. 🤖 Local Qwen 3 (1.7B) AI Dev & Study Assistant
- **Local Model Serving**: Direct GGUF inference serving `E:\model\qwen3-1.7b\Qwen3-1.7B-Q6_K.gguf` on `http://localhost:8000/v1` with Vulkan/CUDA GPU acceleration (>100 tokens/sec).
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

### Option 1: 1-Click Launcher (Recommended)

Simply double-click or run:
```cmd
start.bat
```
This automatically starts:
1. **Local Model Server** on `http://localhost:8000` (serving `qwen3-1.7b`)
2. **Spring Boot Backend** on `http://localhost:8082`
3. **React Frontend** on `http://localhost:5174`
4. Automatically opens `http://localhost:5174` in your default browser!

---

### Option 2: Step-by-Step Manual Launch

#### 1. Start the Local Model Server
```bash
cd E:\model
python run_server.py --host 0.0.0.0 --port 8000 --no-browser
```

#### 2. Start the Spring Boot Backend
```cmd
cd backend
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2
```
Backend will be live on `http://localhost:8082`.

#### 3. Start the React Frontend
```bash
cd frontend
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
| **Planify API Key** | `sk-mdl-Axh6jn1UzhEss0ERIrAwRAuypUsgb1CmuQW_gaWZLBc` |
| **Grounding Sources** | GeeksforGeeks, W3Schools, TPointTech |

---

## 🐳 Docker Deployment

To run containerized services:
```bash
docker compose up --build -d
```
- Frontend: `http://localhost:5174`
- Backend: `http://localhost:8082`
- PostgreSQL: `localhost:5433` (Database: `tododb`)
