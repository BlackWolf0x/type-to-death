# Next.js Setup - Requirements

## Introduction

This spec defines the requirements for setting up a Next.js 16 application with TypeScript, Tailwind CSS v4, and shadcn/ui components. The application will serve as the foundation for the Type to Death game's web interface.

## Context

The project already has a basic Next.js 16 installation in the `app-next/` directory using Bun as the package manager. This spec focuses on configuring the project with the necessary tools and libraries to enable rapid UI development with shadcn/ui components.

## Glossary

- **Next.js Application**: The web application built with Next.js 16 framework
- **shadcn/ui**: A collection of reusable UI components built with Radix UI and Tailwind CSS
- **Bun**: A fast JavaScript runtime and package manager
- **App Router**: Next.js 13+ routing system using the `app/` directory
- **Import Alias**: TypeScript path mapping using `@/` prefix for cleaner imports
- **Route**: A URL path that maps to a specific page in the application
- **Page Component**: A React Server Component that renders the UI for a specific route

## Requirements

### Requirement 1: Project Configuration

**User Story:** As a developer, I want the Next.js project properly configured with TypeScript and Tailwind CSS, so that I can build type-safe applications with consistent styling.

#### Acceptance Criteria

1. WHEN the project is initialized THEN the Next.js Application SHALL use TypeScript for all source files
2. WHEN the project is initialized THEN the Next.js Application SHALL use Tailwind CSS v4 for styling
3. WHEN the project is initialized THEN the Next.js Application SHALL configure import aliases using `@/` prefix
4. WHEN the project is initialized THEN the Next.js Application SHALL use Bun as the package manager
5. WHEN the project is initialized THEN the Next.js Application SHALL include ESLint configuration for code quality

### Requirement 2: shadcn/ui Integration

**User Story:** As a developer, I want shadcn/ui components integrated into the project, so that I can build consistent UI components quickly.

#### Acceptance Criteria

1. WHEN shadcn/ui is configured THEN the Next.js Application SHALL initialize shadcn/ui with the New York style variant
2. WHEN shadcn/ui is configured THEN the Next.js Application SHALL use CSS variables for theming
3. WHEN shadcn/ui is configured THEN the Next.js Application SHALL configure the neutral base color
4. WHEN shadcn/ui is configured THEN the Next.js Application SHALL use Lucide React for icons
5. WHEN shadcn/ui is configured THEN the Next.js Application SHALL create a `components/ui/` directory for shadcn components

### Requirement 3: Development Environment

**User Story:** As a developer, I want proper development scripts and tooling configured, so that I can develop and test the application efficiently.

#### Acceptance Criteria

1. WHEN development scripts are configured THEN the Next.js Application SHALL provide a `dev` script using Bun
2. WHEN development scripts are configured THEN the Next.js Application SHALL provide a `build` script for production builds
3. WHEN development scripts are configured THEN the Next.js Application SHALL provide a `start` script for production server
4. WHEN development scripts are configured THEN the Next.js Application SHALL provide a `lint` script for code quality checks

### Requirement 4: Application Routing

**User Story:** As a developer, I want the application to have distinct pages for different game stages, so that I can implement the game flow with proper navigation.

#### Acceptance Criteria

1. WHEN the application is accessed at the root path THEN the Next.js Application SHALL display the main menu page
2. WHEN the application is accessed at `/permission` THEN the Next.js Application SHALL display the webcam permission request page
3. WHEN the application is accessed at `/calibration` THEN the Next.js Application SHALL display the blink calibration page
4. WHEN the application is accessed at `/play` THEN the Next.js Application SHALL display the game play page
5. WHEN a page is created THEN the Next.js Application SHALL use the App Router file-based routing system

## Non-Functional Requirements

### NFR1: Performance
The Next.js application SHALL leverage Next.js 16 performance optimizations including React Server Components and automatic code splitting.

### NFR2: Developer Experience
The project configuration SHALL provide clear error messages, fast hot module replacement, and TypeScript IntelliSense support.

### NFR3: Maintainability
The project structure SHALL follow Next.js best practices and maintain consistency with the existing React application patterns.

### NFR4: Compatibility
The Next.js application SHALL be compatible with Next.js 16.0.5, React 19, and Bun runtime.

## Constraints

- Must use Bun as the package manager (not npm, yarn, or pnpm)
- Must use Next.js 16.0.5 (already installed)
- Must use Tailwind CSS v4 (already installed)
- Must use TypeScript for type safety
- Must follow the App Router pattern (not Pages Router)
- Must maintain compatibility with existing project conventions

## Dependencies

- Next.js 16.0.5 (installed)
- React 19 (installed)
- TypeScript (installed)
- Tailwind CSS v4 (installed)
- Bun runtime and package manager
- shadcn/ui (to be configured)

## Success Metrics

- All TypeScript files compile without errors
- shadcn/ui components can be added and used successfully
- Import aliases work correctly across the project
- Development server starts without errors
- Linting passes with no critical issues
- Project structure matches established conventions

## Out of Scope

- State management setup (Zustand or other libraries)
- Project structure organization (components, stores, hooks directories)
- Unity WebGL integration (separate spec)
- Blink detection implementation (separate spec)
- Typing game logic (separate spec)
- Authentication system
- Database integration
- Deployment configuration
- Testing setup (unit tests, e2e tests)
- CI/CD pipeline configuration
