# Overview

GesundEinkauf (HealthyShopping) is a German health-conscious grocery shopping application that helps users find and evaluate products based on strict nutritional criteria. The app features a shopping list management system, product recommendation engine powered by AI, and supermarket selection functionality. It provides health scores and evaluations for products using OpenAI's GPT models to assess items against comprehensive nutritional standards including organic certification, sugar content, harmful additives, and processing levels.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client uses a modern React-based single-page application built with Vite and TypeScript. The UI is constructed with shadcn/ui components providing a consistent design system with Radix UI primitives and Tailwind CSS for styling. The application follows a component-based architecture with pages, reusable UI components, and custom hooks. State management is handled through TanStack Query (React Query) for server state and local React state for UI interactions.

## Backend Architecture
The server is built with Express.js and TypeScript, following a RESTful API design pattern. The application uses an in-memory storage implementation (MemStorage) that implements a well-defined IStorage interface, making it easy to swap for database persistence later. The server includes middleware for request logging, JSON parsing, and error handling. Routes are organized modularly with clear separation between shopping list, product, supermarket, and health criteria endpoints.

## Database Schema
The application uses Drizzle ORM with PostgreSQL schema definitions but currently runs with in-memory storage. The schema includes four main entities: shopping list items, products (with comprehensive nutritional data), supermarkets (with distance and selection status), and health criteria (configurable filter options). Products contain detailed health-related fields including organic status, allergen information, nutritional ratios, and AI-generated health scores.

## AI Integration
OpenAI GPT integration provides intelligent product evaluation based on strict German nutritional standards. The AI service evaluates products against criteria including trans-fats, sugar content, harmful additives, omega-6 ratios, fiber content, and organic certification. The system generates health scores (1-5 scale) and detailed German-language explanations for product recommendations.

## Component Architecture
The frontend follows a modular component structure with clear separation of concerns. Main components include navigation, shopping list sidebar, supermarket selector, filter controls, product recommendations, and product detail modal. Each component uses TypeScript interfaces for type safety and includes comprehensive test identifiers for quality assurance.

# External Dependencies

## Core Technologies
- **React 18** with TypeScript for frontend framework
- **Express.js** with TypeScript for backend API server
- **Vite** for build tooling and development server
- **TanStack Query** for server state management and caching
- **Drizzle ORM** with PostgreSQL dialect for database operations
- **Neon Database** as PostgreSQL provider (configured but not actively used)

## UI and Styling
- **shadcn/ui** component library with Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom theme
- **Lucide React** for consistent iconography
- **React Hook Form** with Zod validation for form handling

## AI and External Services
- **OpenAI API** for product health evaluation and recommendations
- **Zod** for runtime type validation and schema parsing

## Development Tools
- **TypeScript** for static type checking across the entire stack
- **ESBuild** for production server bundling
- **PostCSS** with Autoprefixer for CSS processing
- **Wouter** for lightweight client-side routing

## Session and Storage
- **connect-pg-simple** for PostgreSQL session storage (configured)
- Custom in-memory storage implementation with plans for database migration