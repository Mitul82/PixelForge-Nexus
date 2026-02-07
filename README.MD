# PixelForge

# Tech Stack:
  - Frontend: React, Vite
  - Backend: Node.js, Express.js
  - Database: MongoDB (Data), Multer(Documents)
  - DevOps: Docker, Docker Compose, Nginx

# System Architecture:
The application is architected to ensure environment parity and data persistence:
  - Orchestration: Docker Compose manages four distinct services (Frontend, API, DB, Admin UI).
  - Persistence: Utilizes Docker Volumes to ensure MongoDB data survives container restarts.

# Installation & Setup:
  - Prerequisites:
    - Node.js(v18+)
    - Docker Desktop

  1. Clone the Repository:
  ```bash
  git clone https://github.com/Mitul82/FastTalk.git
  cd FastTalk
  ```

  2. Configure Environment Variables
  Create a .env file in the root directory. You can use the provided template:
  ```bash
  cp .env.example .env
  ```
  3. Launch with Docker
  This project is optimized to run with a single command. Docker will handle dependency installation and service linking:
  ```bash
  docker-compose --env-file ./.env up --build
  ```

  - Frontend: http://localhost:80
  - Backend API: http://localhost:3000
  - Database GUI (Mongo-Express): http://localhost:8081