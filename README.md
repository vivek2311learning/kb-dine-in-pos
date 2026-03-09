# KB Dine-In POS 🍽️

KB Dine-In POS is a restaurant dine-in management system built with Next.js and MongoDB.

It helps restaurants manage tables, orders, kitchen workflow, and billing through role-based staff panels.

---

## Features

### Authentication & Authorization

- JWT based authentication
- Role based access control
- Protected routes using middleware

### Admin Panel

- Dashboard overview
- Menu management
- Staff management
- Reports

### Counter System

- Table management
- Create orders
- Add items to order
- Billing

### Kitchen System

- Kitchen order queue
- Mark items ready
- Track served items

---

## Tech Stack

Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

Backend

- Next.js API Routes
- Node.js

Database

- MongoDB
- Mongoose

Security

- JWT Authentication
- Role-based authorization
- Middleware protection

---

## Project Structure

app/
api/
components/
lib/
models/
middleware.ts

---

## Installation

Clone the repository

bash
git clone https://github.com/YOUR_USERNAME/kb-dine-in-pos.git

Install dependencies

bash
npm install

Run development server

bash
npm run dev

App will run at:

http://localhost:3000

---

## User Roles

The system has three roles:

Admin  
Counter  
Kitchen

Each role has access to specific dashboards and APIs.

---

## Environment Variables

Create a .env.local file based on .env.example.

Example:

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

---

## Future Improvements

- Real-time updates with WebSockets
- Online payment integration
- Mobile app
- Inventory management

---

## License

This project is for learning and development purposes.
