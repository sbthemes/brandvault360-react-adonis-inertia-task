# AdonisJS E-Commerce Product Configurator

An e-commerce product configurator admin panel built with AdonisJS 6, Inertia.js, React, and Radix UI. This application allows you to manage categories, products, and options for customizable products (e.g., T-shirts with different sizes and colors).

## Features

- Admin authentication system
- Category management (CRUD)
- Product management (CRUD)
- Option and option value management (CRUD)
- Product configurator API
- Dynamic SKU generation
- Price calculation based on selected options
- Modern UI built with Radix UI components

## Tech Stack

- **Backend**: AdonisJS 6
- **Frontend**: React 19 with Inertia.js
- **Database**: MySQL
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **ORM**: Lucid ORM

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- MySQL (v8.0 or higher)
- Git

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd adonis-ecommerce
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

If `.env.example` doesn't exist, create a `.env` file with the following variables:

```env
NODE_ENV=development
PORT=3333
APP_KEY=your-app-key-here
HOST=0.0.0.0
APP_URL=http://localhost:3333
LOG_LEVEL=info

SESSION_DRIVER=cookie

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_DATABASE=your-database-name
```

**Important**: Generate a secure `APP_KEY` by running:

```bash
node ace generate:key
```

Copy the generated key and add it to your `.env` file.

### 4. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE your_database_name;
```

### 5. Run Migrations

Run the database migrations to create the necessary tables:

```bash
node ace migration:run
```

### 6. Seed the Database

Seed the database with initial data (including the default admin user):

```bash
node ace db:seed
```

**Default Admin Credentials:**

- Email: `admin@example.com`
- Password: `password`

**Important**: Change the default password after first login in production environments.

### 7. Start the Development Server

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:3333`

## Available Scripts

- `npm run dev` - Start the development server with HMR
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking
- `npm run check` - Run format, lint, and build checks

## Project Structure

```
adonis-ecommerce/
├── app/
│   ├── controllers/     # Application controllers
│   │   ├── admin/       # Admin panel controllers
│   │   └── api/         # API controllers
│   ├── models/          # Lucid models
│   ├── middleware/      # Route middleware
│   ├── utils/           # Utility functions
│   └── validators/      # Request validators
├── config/              # Configuration files
├── database/
│   ├── migrations/      # Database migrations
│   └── seeders/         # Database seeders
├── inertia/             # Frontend React application
│   ├── app/             # React app entry point
│   ├── components/      # React components
│   ├── pages/           # Inertia pages
│   └── types/           # TypeScript types
├── public/              # Public assets
│   └── uploads/         # Uploaded files
├── resources/           # Resources
│   └── views/           # Edge templates
└── start/               # Application entry points
    ├── routes.ts        # Route definitions
    └── kernel.ts        # Middleware and exception handlers
```

## Admin Panel Routes

- `/admin/login` - Admin login page
- `/admin/dashboard` - Admin dashboard
- `/admin/categories` - Category management
- `/admin/products` - Product management
- `/admin/options` - Option management

## API Endpoints

- `GET /api/categories` - Fetch all categories
- `GET /api/products/:categoryId` - Fetch products and their valid options for a category
- `POST /api/configure` - Generate SKU and calculate price based on configuration

## License

UNLICENSED
