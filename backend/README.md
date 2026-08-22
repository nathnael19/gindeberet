# Gindeberet Backend API

Node.js/Express backend for the Gindeberet Construction Project Management system.

## Features

- RESTful API for project management
- JWT authentication for admin users
- MySQL database integration
- CORS support for frontend integration
- Activity logging
- Seed data for testing

## Prerequisites

- Node.js (v14 or higher)
- MySQL database server

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gindeberet_db
JWT_SECRET=your_secret_key
```

3. Initialize the database:
```bash
npm run init-db
```

4. Seed the database with sample data:
```bash
npm run seed
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on port 3001 by default.

## API Endpoints

### Authentication

- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user info (requires auth)
- `POST /api/auth/users` - Create new admin user (super admin only)

### Projects

- `GET /api/projects` - Get all projects (with filtering)
- `GET /api/projects/stats` - Get project statistics
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project (admin only)
- `PUT /api/projects/:id` - Update project (admin only)
- `DELETE /api/projects/:id` - Delete project (admin only)

### Activity

- `GET /api/activity` - Get recent activity log

### Health Check

- `GET /health` - Server health check

### Forgot password (admin OTP)

1. Open `/admin` → **Forgot password?**
2. Enter admin email → server sends a **6-digit OTP** (valid 15 minutes).
3. Enter OTP + new password on the next step.

**API**

- `POST /api/auth/forgot-password` — `{ "email": "..." }`
- `POST /api/auth/reset-password` — `{ "email", "otp", "newPassword" }`

**SMTP (required on production)** — Gmail example for `gindeberetconstruction278@gmail.com`:

- `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_SECURE=true`
- `SMTP_USER=gindeberetconstruction278@gmail.com`
- `SMTP_PASS` = Gmail **App Password** (not your normal login password)
- Optional `SMTP_FROM="Gindeberet Admin <gindeberetconstruction278@gmail.com>"`
- For local testing without mail: `EMAIL_DEV_LOG=true` (OTP printed in server logs)

## Default Admin User

After seeding / fix-content:

- Email: `gindeberetconstruction278@gmail.com`
- Password: `Gindeberetplc@246`

## Example API Usage

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gindeberetconstruction278@gmail.com","password":"Gindeberetplc@246"}'
```

### Get Projects (with token)
```bash
curl -X GET http://localhost:3001/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Project
```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "PRJ-1029",
    "name": "New Project",
    "client": "Client Name",
    "status": "active",
    "budget": "$10M",
    "location": "Location",
    "category": "Roads",
    "duration": "12 Months",
    "year": "2024"
  }'
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # MySQL connection pool
│   │   ├── schema.sql        # Database schema
│   │   ├── initDb.js         # Database initialization
│   │   └── seed.js           # Seed data
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── projectController.js # Project CRUD operations
│   │   └── activityController.js # Activity logging
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication
│   │   └── errorHandler.js  # Error handling
│   ├── routes/
│   │   ├── auth.js          # Auth routes
│   │   ├── projects.js      # Project routes
│   │   └── activity.js      # Activity routes
│   ├── utils/
│   │   └── jwt.js           # JWT utilities
│   └── server.js            # Main server file
├── .env                     # Environment variables
├── .env.example             # Environment template
└── package.json
```

## Database Schema

### admin_users
- id, email, password, first_name, last_name, role, is_active, created_at, updated_at, last_login

### projects
- id, name, client, status, budget, location, category, duration, year, description, image, created_by, created_at, updated_at

### activity_log
- id, user_id, action, target_type, target_id, description, created_at

## Deployment Notes for cPanel

1. Ensure MySQL is available on your cPanel hosting
2. Update `.env` with production database credentials
3. Set `NODE_ENV=production` in environment
4. Use a strong `JWT_SECRET` in production
5. Update `FRONTEND_URL` to your production frontend URL
6. Consider using process managers like PM2 for production

## Security Considerations

- Change the default admin password after first login
- Use strong JWT secrets in production
- Enable HTTPS in production
- Implement rate limiting for API endpoints
- Regularly update dependencies