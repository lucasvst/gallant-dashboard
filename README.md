# Gallant Bike Dashboard

A modern, offline-first web dashboard for real-time indoor cycling telemetry via Web Bluetooth API. Built as a monorepo with high performance and type-safety in mind.

## 🏗 Architecture

This project uses a **Turborepo** + **pnpm workspaces** architecture to ensure modularity and decoupled domain logic.

### Apps and Packages

- `apps/web`: The frontend dashboard. Built with React, Vite, and TailwindCSS. Uses a robust State Machine to manage Web Bluetooth connections and persist data buffers in case of failure.
- `apps/api`: A blazing fast backend built using ElysiaJS and Bun. Provides REST endpoints (`/v1/workouts`) with TypeBox validation and an auto-generated Swagger UI.
- `packages/core`: The core domain logic. Contains a stateless `GallantParser` that handles the heavy lifting of extracting and converting speed, cadence, and power metrics from 18-byte and 6-byte Bluetooth data buffers. fully tested via `Vitest`.
- `packages/db`: Data abstraction layer powered by Drizzle ORM and LibSQL (SQLite). Provides schemas for `workouts` and `workout_points`.

## 🚀 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Bun, ElysiaJS, TypeBox
- **Database**: LibSQL (SQLite), Drizzle ORM
- **Core / Tooling**: TypeScript, Turborepo, pnpm, Vitest

## 🛠 Getting Started

### Prerequisites

- Node.js installed
- [pnpm](https://pnpm.io/installation) installed (`npm install -g pnpm`)
- Bun installed (`curl -fsSL https://bun.sh/install | bash`)

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd app-glt
   ```
2. Install all dependencies across the monorepo:
   ```bash
   pnpm install
   ```

### Running the Apps locally

You can run the entire stack (both frontend and API) concurrently from the project root using Turborepo:

```bash
pnpm dev
```

Alternatively, you can run them individually:
- **API**: `cd apps/api && pnpm dev` (Runs on `http://localhost:3000`)
- **Web**: `cd apps/web && pnpm dev` (Runs on `http://localhost:5173`)

### Accessing the Dashboard & API

- **Dashboard UI**: `http://localhost:5173`
- **Swagger Documentation**: `http://localhost:3000/swagger`

## 🧪 Testing

The `/packages/core` module is fully covered by unit tests to ensure the Bluetooth buffer parsing logic remains correct.

To run tests across all packages:
```bash
pnpm test
```

## 🔗 How it Works 

1. **Connect**: Click "Connect Bike" in the dashboard. The browser will prompt you to select your Gallant Bluetooth device.
2. **Telemetry**: Once connected, the interface reads from the GATT Server notifications, pushes raw buffer data through `@mono/core`, and hydrates the React state.
3. **Session**: Hitting "Start" registers a workout ID. Clicking "Stop & Save" will aggregate data and dispatch a final POST to the Elysia API to save the session summary to the SQLite database.
