## About airtick-ui

This project is a separate front-end repository for consuming [AIR-TICKETING-MANAGEMENT-SYSTEM](https://github.com/dawoodriaza/AIR-TICKETING-MANAGEMENT-SYSTEM) REST API.

It implements the following features:
- Auth Flows (login, register, password recovery, change password, email verification)
- User Profile
- Admin Dashboard
- Browse Flights
- Flight Booking

## Tech Stack
- [Next.js](https://nextjs.org) - Front-end framework
- [TypeScript](https://www.typescriptlang.org/) - Superset of JavaScript
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn](https://ui.shadcn.com/) - Component Library
- [Axios](https://axios-http.com/) - HTTP client
- [Zod](https://zod.dev/) - TS schema validation
- [React Hook Form](https://react-hook-form.com/) - React Hooks for form state management and validation

## Prerequisites 

Before installation, make sure you have:

> [!Note] 
> Ensure you are using compatible versions to avoid dependency or build issues.

- **Node.js** (v22.12.0)
- **pnpm** (v10.28.1)
- A running instance of [AIR-TICKETING-MANAGEMENT-SYSTEM](https://github.com/dawoodriaza/AIR-TICKETING-MANAGEMENT-SYSTEM) REST API

## Installation

### 1. Clone & Install dependencies

```bash
git clone https://github.com/read2see/airtick-ui.git
cd airtick-ui
pnpm install
```

### 2. Environment Variables and Running Dev Server

- Copy `.env.example` to `.env` and update `NEXT_PUBLIC_REST_API_URL` to match your API instance port.
- Run dev server
```bash
pnpm dev
```

## Project Structure

```bash
airtick-ui/
├── app/ # Next.js App Router pages and layouts
│ ├── (auth)/ # Authentication routes (login, register, password recovery)
│ ├── admin/ # Admin dashboard pages (airports, flights, bookings, users)
│ ├── customer/ # Customer-facing pages (bookings)
│ ├── browse-flights/ # Flight browsing page
│ └── profile/ # User profile page
├── components/ # React components
│ ├── admin/ # Admin-specific components (tables, dialogs)
│ ├── customer/ # Customer-specific components
│ ├── layout/ # Layout components (header, navigation)
│ ├── profile/ # Profile-related components
│ └── ui/ # Shadcn UI components
├── contexts/ # React context providers (AuthContext)
├── lib/ # Utility libraries (API client, routes, auth helpers)
├── services/ # API service layer (AuthService, BookingService, etc.)
├── types/ # TypeScript type definitions
└── public/ # Static assets
```

## API Integration

- All API calls are centralized under `services/`
- Axios is configured with a shared instance
- Authentication is handled via HTTP-only cookies (server-managed JWTs)

## Related Repositories
- [Back-end API](https://github.com/dawoodriaza/AIR-TICKETING-MANAGEMENT-SYSTEM)

## License

This project is licensed under the MIT License.
