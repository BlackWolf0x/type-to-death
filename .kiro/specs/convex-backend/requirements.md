# Convex Backend - Requirements

## Introduction

This feature integrates Convex as the backend infrastructure for the Type to Death game. Convex provides a real-time database, serverless functions, and authentication capabilities for the Next.js application.

## Glossary

- **Convex**: A backend-as-a-service platform providing real-time database and serverless functions
- **Next.js App**: The application located in `app-next/` directory
- **Convex Dev**: Development server that syncs schema and functions with the Convex cloud
- **Username**: A unique identifier chosen by the user for display on leaderboards and in-game
- **Username Setup Dialog**: A modal dialog that forces users to set their username before proceeding

## Requirements

### Requirement 1: Convex Installation and Setup

**User Story:** As a developer, I want to install and configure Convex in the Next.js app, so that I can use it as the backend infrastructure.

#### Acceptance Criteria

1. WHEN the developer runs the installation command THEN the system SHALL install Convex dependencies using Bun package manager
2. WHEN Convex is initialized THEN the system SHALL create the necessary configuration files in the project
3. WHEN the developer runs `convex dev` THEN the system SHALL start the Convex development server and sync with the cloud
4. THE Next.js application SHALL be configured to connect to the Convex backend

### Requirement 2: Project Configuration

**User Story:** As a developer, I want the Next.js app properly configured with Convex, so that components can access backend functionality.

#### Acceptance Criteria

1. THE Next.js app SHALL include the Convex provider at the root level
2. THE application SHALL use the correct Convex deployment URL from environment variables
3. WHEN the app starts THEN the Convex client SHALL successfully connect to the backend

### Requirement 3: Username Setup After Sign In

**User Story:** As a player, I want to set a unique username after signing in, so that I can be identified on leaderboards and in the game.

#### Acceptance Criteria

1. WHEN a user signs in successfully AND the user has no username set THEN the system SHALL display a username setup dialog
2. WHEN a user signs in successfully AND the user already has a username THEN the system SHALL NOT display the username setup dialog
3. WHILE the username setup dialog is displayed THEN the system SHALL prevent the user from closing the dialog without setting a username
4. WHEN a user enters a username THEN the system SHALL query the database to check if the username is already taken
5. IF the username is already taken THEN the system SHALL display an error message indicating the username is unavailable
6. IF the username is available AND meets validation requirements THEN the system SHALL save the username to the user's profile
7. WHEN the username is successfully saved THEN the system SHALL close the dialog and allow the user to proceed
8. THE username SHALL be between 3 and 20 characters in length
9. THE username SHALL only contain alphanumeric characters and underscores
10. THE username input field SHALL only accept lowercase characters

### Requirement 4: Authentication State UI

**User Story:** As a player, I want to see my login status and be able to log out, so that I can manage my session.

#### Acceptance Criteria

1. WHEN a user is NOT signed in THEN the system SHALL display a "Login / Sign Up" button
2. WHEN a user is signed in THEN the system SHALL NOT display the "Login / Sign Up" button
3. WHEN a user is signed in THEN the system SHALL display a "Log Out of [username]" button
4. WHEN a user clicks the logout button THEN the system SHALL sign out the user using Convex Auth
5. WHEN a user signs out THEN the system SHALL return to the unauthenticated state

## Non-Functional Requirements

### NFR1: Compatibility
- Must work with Next.js App Router
- Must be compatible with Bun package manager
- Must support the existing project structure

### NFR2: Development Experience
- Setup process should be straightforward and well-documented
- Development server should provide clear feedback
- Configuration should follow Convex best practices

## Constraints

- Must use Bun as the package manager (not npm/pnpm/yarn)
- Must integrate with existing Next.js app in `app-next/` directory
- Must not disrupt existing functionality during installation

## Dependencies

- Next.js application (already exists in `app-next/`)
- Bun package manager
- Convex account and project
- Internet connection for Convex cloud sync

## Success Metrics

- Convex successfully installed with zero errors
- `convex dev` runs without issues
- Next.js app can connect to Convex backend
- Users are prompted to set username after first sign in
- Username uniqueness is enforced across all users
- Users with existing usernames can proceed without the dialog

## Out of Scope

- Creating Convex functions for game logic (scores, leaderboards)
- Data migration from any existing backend
- Production deployment configuration
- Username change functionality (users can only set username once)
- Profile picture or avatar selection
