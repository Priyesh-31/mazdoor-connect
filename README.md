# 👷 Mazdoor Connect

A full-stack web platform that connects workers (mazdoors) directly with customers, eliminating middlemen and ensuring fair wages.

🔗 **Live Demo:** https://mazdoor-connect-mh7n.vercel.app/

---

## 🚀 Overview

Mazdoor Connect is designed to solve a real-world problem — lack of direct access between workers and customers.  
The platform enables workers to showcase their skills and availability, while customers can easily find and connect with them.

---

## ✨ Features

### 👤 User Features
- 🔐 User Authentication (Login / Register)
- 👷 Worker & Customer roles
- 📝 Profile creation and management

### 🔍 Core Functionality
- 🔎 Search workers by category (plumber, electrician, etc.)
- 📍 Location-based filtering
- 💰 Set and view service rates
- 🟢 Availability status toggle

### 📊 Dashboard
- 📋 View all workers
- 📌 Detailed worker profiles
- ⚡ Dynamic data rendering

---

## 🛠️ Tech Stack

### 🌐 Frontend
- React (Vite)
- Tailwind CSS
- React Router

### ⚙️ Backend
- Node.js
- Express.js

### 🗄️ Database
- MongoDB (Atlas)

### 🔐 Authentication
- JWT (JSON Web Tokens)
- bcrypt (password hashing)

### 🚀 Deployment
- Vercel (Frontend)
- Render / Railway (Backend)

---

## 🧠 Architecture


Frontend (React - Vercel)
↓
Backend (Node.js API)
↓
MongoDB Database


---

## 📂 Project Structure


mazdoor-connect/
│
├── frontend/
│ ├── src/
│ ├── components/
│ ├── pages/
│ └── App.jsx
│
├── backend/
│ ├── models/
│ ├── routes/
│ ├── controllers/
│ └── server.js


---

## ⚙️ Setup Instructions

### 🔧 Frontend

```bash
git clone https://github.com/Priyesh-31/mazdoor-connect.git
cd mazdoor-connect
npm install
npm run dev
🔧 Backend
cd backend
npm install
npm run dev
🔐 Environment Variables

Create .env in backend:

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
📸 Screenshots

(Add screenshots here)

🚀 Future Improvements
💬 Real-time chat system
⭐ Worker rating & reviews
📍 Map integration (nearby workers)
💳 Online payments
📱 PWA (installable app)
👨‍💻 Author

Priyesh Raj
B.Tech CSE (Design) | RGIPT

🌟 Why This Project?

This project addresses a real-world problem in the labor market by enabling direct communication between workers and customers, promoting transparency and fair wages.

⭐ If you like this project, consider giving it a star!
