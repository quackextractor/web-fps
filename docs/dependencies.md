# Project Dependencies

This document provides a brief justification for every external library used in the `industrialist-web-game` project, fulfilling strict documentation requirements.

## Production Dependencies (`dependencies`)
- **@prisma/client**: Auto-generated query builder for interacting with the Supabase PostgreSQL database securely.
- **@radix-ui/react-***: Unstyled, accessible UI components (Accordion, Dialog, Select, etc.) that form the foundation of our retro interface system.
- **@vercel/analytics**: Provides privacy-friendly web analytics and performance tracking natively in the Vercel cloud environment.
- **bcryptjs**: Required for heavy, secure salt-and-hash encryption of user passwords during account creation.
- **class-variance-authority**: A utility to manage complex UI component styling states cleanly using Tailwind classes.
- **clsx**: A tiny utility for constructing `className` strings conditionally.
- **cmdk**: A fast, composable command menu React component used for in-game terminal/settings interactions.
- **dompurify**: Security library used to aggressively sanitize raw HTML before it is injected via React's `dangerouslySetInnerHTML`.
- **embla-carousel-react**: A lightweight carousel slider component used for UI item selection in menus.
- **input-otp**: Accessible one-time-password input component for secure account recovery/2FA.
- **jose**: Handles secure signing and verification of JSON Web Tokens (JWT) for stateless player sessions.
- **lucide-react**: A pixel-perfect SVG icon library utilized exclusively for mobile touchscreen buttons and UI elements.
- **next**: The core React framework providing App Router, server-side rendering, and robust build optimizations.
- **next-themes**: Handles user preference switching between Light and Dark mode seamlessly.
- **prisma**: The next-generation Node.js TypeScript ORM strictly managing our database schema and migrations.
- **react** & **react-dom**: The fundamental library for structuring complex component-based user interfaces.
- **react-day-picker**: A flexible date picker component for event scheduling UI.
- **react-hook-form**: Performant, flexible, and extensible forms with easy-to-use validation.
- **react-resizable-panels**: React components for building resizable panel groups and layouts.
- **recharts**: Composable charting library to render economic progress and factory throughput metrics.
- **sonner**: A well-designed, accessible toast notification system for instant user feedback.
- **tailwind-merge**: A utility function to reliably merge Tailwind CSS classes without style conflicts.
- **vaul**: An accessible drawer component used for mobile side-menus.
- **zod**: TypeScript-first schema declaration and validation library to strictly sanitize all incoming API payloads.

## Development Dependencies (`devDependencies`)
- **@eslint/*** & **eslint***: Robust JavaScript and TypeScript code linters that enforce strict coding standards and catch logic errors early.
- **@tailwindcss/postcss** & **tailwindcss**: The utility-first CSS framework (v4) accelerating the styling process.
- **@testing-library/*** & **jsdom**: The complete testing suite providing the DOM environment and component rendering utilities to assert UI behavior.
- **@types/*** : Standard TypeScript definition stubs for type safety across Node and React standard libraries.
- **@typescript-eslint/*** : Specialized rules and parsers to bring ESLint checks safely into TypeScript code.
- **@vitejs/plugin-react** & **vitest**: A lightning-fast Vite-native testing framework serving as our primary test runner, mocking API networks securely.
- **dotenv**: Loads local `.env` configuration files into `process.env` during local test execution.
- **postcss**: A compiler utilizing JavaScript plugins to parse and transform CSS natively (powers Tailwind).
- **tw-animate-css**: A Tailwind CSS wrapper combining predefined Animate.css micro-animations.
- **typescript**: The static typing layer applied over JavaScript ensuring enterprise-grade robust compilation.
- **vitest-mock-extended**: Strictly typed mocking library ensuring correct Vitest interactions against Prism and generic classes.
