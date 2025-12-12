# Architecture Documentation

## Project Overview

This is a Nuxt 3 cash register application with SQLite database backend. It's a full-stack application with authentication, expense tracking, category management, and user administration features.

## Development Commands

- `npm run dev` - Start development server on port 14322 with environment file
- `npm run build` - Build the application for production
- `npm run preview` - Preview production build locally
- `npm run generate` - Generate static site

## Architecture

### Frontend (Nuxt 3)
- **Framework**: Nuxt 3 with Vue 3 composition API
- **UI Library**: Nuxt UI (Tailwind CSS based)
- **Authentication**: @sidebase/nuxt-auth with NextAuth
- **PWA**: @vite-pwa/nuxt for Progressive Web App functionality
- **Charts**: Chart.js with vue-chartjs wrapper

### Backend (Nitro Server)
- **API Routes**: File-based routing in `server/api/`
- **Database**: Better-sqlite3 with year-based SQLite files
- **Authentication**: JWT-based with jsonwebtoken

### Database Structure
- **Year-based storage**: Expenses are stored in separate SQLite files per year (`expenses-{year}.sqlite`)
- **Shared databases**: `categories.sqlite` and `users.sqlite` for shared data
- **Location**: All databases are stored in the `data/` directory

### Key Directories
- `pages/` - Vue page components with file-based routing
- `server/api/` - API endpoints (categories, expenses, users)
- `composables/` - Vue composables for shared logic
- `assets/` - Global CSS and static assets
- `data/` - SQLite database files

## API Endpoints

### Categories (`/api/categories`)
- `GET` - Retrieve all categories
- `POST` - Create new category

### Expenses (`/api/expenses`)
- `GET` - Retrieve expenses from all year-based databases
- Database files are automatically discovered in `data/` directory

### Users (`/api/users`)
- User management and authentication endpoints

## Important Configuration

- **Port**: Development server runs on port 14322
- **Environment**: Uses `.env` file for configuration
- **Color Mode**: Dark mode preference with system fallback
- **Database Path**: SQLite files located in `data/` directory

## Development Notes

- The application uses year-based SQLite files for expenses, allowing for scalable data management
- Authentication is integrated with the UI components via Nuxt UI
- PWA functionality is configured for offline capability
- Tailwind CSS is used for styling through Nuxt UI components
