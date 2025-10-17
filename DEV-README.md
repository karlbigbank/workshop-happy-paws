# Pet Shelter Registry System - Development Setup

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Install all dependencies for both frontend and backend
npm run install:all
```

### Development
```bash
# Run both backend and frontend simultaneously with hot reload
npm run dev

# Or run individually:
npm run dev:backend    # Backend only (port 5000)
npm run dev:frontend   # Frontend only (port 3000)
```

### Building
```bash
# Build both projects
npm run build

# Or build individually:
npm run build:backend
npm run build:frontend
```

### Environment Configuration

#### Backend (.env)
- Copy `backend/.env.example` to `backend/.env`
- Update JWT_SECRET for production

#### Frontend (.env)
- Copy `frontend/.env.example` to `frontend/.env`
- API base URL points to backend (default: http://localhost:5000/api/v1)

## Project Structure

```
pet-shelter-registry/
├── backend/                 # Express.js API server
│   ├── src/                # TypeScript source code
│   ├── data/               # JSON file storage
│   │   ├── pets.json
│   │   ├── users.json
│   │   ├── applications.json
│   │   └── backups/
│   ├── uploads/            # Pet photo storage
│   └── .env               # Environment variables
├── frontend/               # Vue 3 client application
│   ├── src/               # Vue components and logic
│   └── .env              # Frontend environment variables
└── package.json          # Root workspace configuration
```

## Development URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1
- Backend Health Check: http://localhost:5000/api/health

## Available Scripts

### Root Level
- `npm run dev` - Run both projects with hot reload
- `npm run build` - Build both projects
- `npm run install:all` - Install dependencies for all projects

### Backend
- `npm run dev` - Development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run production build

### Frontend  
- `npm run dev` - Development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
