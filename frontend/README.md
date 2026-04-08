# Barista Frontend Pro

A competitive intelligence frontend application that operates as a workspace for the research platform. This project is built using React, Vite, Tailwind CSS, and Radix UI components.

## 🗂 File Structure

The repository is structured as a `pnpm` workspace containing different artifacts for the tool.

```
/barista_frontend_proo
├── artifacts/
│   ├── research-platform/   # The main frontend application (Vite + React)
│   ├── api-server/          # API server artifacts 
│   └── mockup-sandbox/      # Mockup configurations and sandboxes
├── lib/                     # Shared library code used across the workspace
├── scripts/                 # Utility scripts for the workspace
├── package.json             # Root workspace definitions and typecheck scripts
├── pnpm-workspace.yaml      # pnpm workspace configurations
└── README.md                # Project documentation (this file)
```

## 🛠 Prerequisites

Ensure you have the following installed on your system before proceeding:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) package manager (`npm install -g pnpm`)

## 📦 Dependencies & Tech Stack

The `research-platform` artifact relies on the following core technologies:
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS & `tailwind-merge`
- **UI Components**: Radix UI Primitives `@radix-ui/react-*`
- **Routing**: Wouter
- **Animations**: Framer Motion
- **Icons**: Lucide React & React Icons
- **Data Fetching**: `@tanstack/react-query`
- **Data Visualization**: Recharts
- **Forms**: React Hook Form with Zod validation (`@hookform/resolvers`)

## ⚙️ Environment Variables

Before running the frontend, you need to set up your environment variables. 
Navigate to the `artifacts/research-platform` directory and create or configure a `.env.local` file with the following variables:

```env
# The port the Vite dev server will run on
PORT=5173

# The base path for the application routing
BASE_PATH=/

# The endpoint where your Barista CI backend API provides data
VITE_API_BASE_URL=http://localhost:8000/api
```

*(Adjust `VITE_API_BASE_URL` to point to wherever your backend service is running.)*

## 🚀 How to Run the Application

Since this is a monorepo setup, you should execute commands from the **root of the repository**:

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Run the development server**:
   We use the `pnpm --filter` option to specifically target and run the frontend package defined in our workspace.
   ```bash
   pnpm --filter @workspace/research-platform dev
   ```

3. **Verify Connection**:
   Once the development server is running, the app should be accessible at:
   [http://localhost:5173](http://localhost:5173)

## 🏗 Build & Typechecking

To typecheck the entire workspace from the root:
```bash
pnpm run typecheck
```

To build the workspace for production:
```bash
pnpm run build
```
