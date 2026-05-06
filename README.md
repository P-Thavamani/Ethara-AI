# TaskFlow 🚀

> An enterprise-grade Team Task Management Platform designed for scale, security, and seamless collaboration.

![TaskFlow Header](https://via.placeholder.com/1200x400/007bff/ffffff?text=TaskFlow+-+Modern+Task+Management)

TaskFlow is a high-performance web application built to streamline project management and team productivity. With a modern architecture, real-time sync, and comprehensive security protocols, it’s built for teams of all sizes.

## ✨ Key Features

- **Secure Authentication**: Utilizing secure, `httpOnly` cookies and industry-standard JWT protocols.
- **Real-Time Collaboration**: Powered by `Socket.io` for live Kanban updates, instantly reflecting task creations, updates, and deletions.
- **Robust Role-Based Access Control (RBAC)**: Manage Project Admins and Members with precision.
- **Task Comments & Attachments**: Discuss tasks inline and upload files securely via **Supabase Storage**.
- **Email Verification & Password Recovery**: Integrated with **Resend** for reliable transactional emails.
- **Infinite Pagination**: High-performance task list rendering that seamlessly scales.

## 🛠 Tech Stack

### Frontend
- **React 18** (Vite)
- **Zustand** for lightweight, predictable state management
- **React Router v6**
- **Axios** with credentials parsing
- **Socket.io-client**
- **Tailwind-like Custom CSS Modules**

### Backend
- **Node.js & Express**
- **Prisma ORM** connecting to **PostgreSQL (Supabase)**
- **Socket.io** for WebSockets
- **Multer** for multipart file parsing
- **JWT & cookie-parser** for secure auth

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A PostgreSQL database (e.g., Supabase)
- A Resend API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/taskflow.git
   cd taskflow
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

#### Backend `.env`
Create a `.env` file in the `backend/` directory:
```env
# Database configuration
DATABASE_URL="postgres://..."
DIRECT_URL="postgres://..."

# Supabase Storage Configuration
SUPABASE_URL="https://..."
SUPABASE_KEY="..."

# Application Secrets
JWT_SECRET="your-super-secret-key"
FRONTEND_URL="http://localhost:5173"

# Email Service (Resend)
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@yourdomain.com"
```

#### Frontend `.env`
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL="http://localhost:5000/api"
```

### Running the Application

1. **Start the Backend**
   ```bash
   cd backend
   npx prisma db push
   npm run dev
   ```

2. **Start the Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

## 🔒 Security Best Practices

TaskFlow is hardened by default:
- **XSS Protection**: Tokens are stored in `httpOnly` cookies, completely inaccessible to JavaScript.
- **CSRF Protection**: Relying on strict `SameSite` cookie policies.
- **Rate Limiting**: Protects authentication and general API endpoints from abuse.
- **Helmet Headers**: Secure HTTP headers applied across the board.

## 🎨 Design Philosophy

Our UI focuses on a **Dark/Light adaptive, minimalist interface** engineered for clarity. By leveraging Custom CSS Modules, we maintain tight encapsulation, avoiding global scope pollution while ensuring a stunning aesthetic.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
