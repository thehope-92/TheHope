# Hope Wellness Platform

A complete **mental wellness and personal growth ecosystem** consisting of three integrated applications:

- **Hope Backend** – Node.js/Express REST API
- **Hope Super Admin** – React Admin Dashboard
- **Hope User** – React Native Mobile Application

---

## 🌟 Overview

**Hope** is a holistic wellness platform designed to help users build better habits, track their mood, practice yoga, and consume valuable mental health content. It provides a seamless experience for end users while offering powerful administrative tools for content and user management.

### ✨ Core Features

- **Habit Tracker** – Build and maintain positive daily habits
- **Mood Tracker** – Daily mood logging with analytics
- **Yoga Guide** – Curated yoga poses and routines
- **Information Library** – Wellness articles and educational content
- **User Authentication** – Secure signup, login, and password recovery
- **Admin Management** – Full control over users, content, and platform settings

---

## 🏗️ Architecture

The platform consists of three main components:

| Component       | Technology                         | Purpose                                  |
| --------------- | ---------------------------------- | ---------------------------------------- |
| **Backend**     | Node.js + Express + MongoDB        | REST API, Authentication, Business Logic |
| **Super Admin** | React + Vite + Redux Toolkit       | Administrative Dashboard                 |
| **Mobile App**  | React Native (CLI) + Redux Toolkit | End-user mobile experience               |

---

## 📁 Project Structures

### 1. Hope Backend (`hope-backend`)

```bash
hope-backend/
├── src/
│   ├── config/              # Database & Cloudinary config
│   ├── constants/
│   ├── controllers/         # Request handlers
│   ├── helpers/             # Email, Token, Password helpers
│   ├── middlewares/         # Auth & Security
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── utils/               # Cloudinary, formatters
│   └── server.js
├── .env
├── package.json
└── README.md
```

### 2. Hope Super Admin (`hope-super-admin`)

```bash
hope-super-admin/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── navigation/          # Routing & Layouts
│   ├── redux/               # Redux store & slices
│   ├── screens/             # Pages & components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── manage-articles/
│   │   ├── manage-users/
│   │   └── manage-yoga-guides/
│   ├── styles/
│   ├── utilities/           # Reusable UI components
│   └── main.jsx
├── vite.config.js
└── package.json
```

### 3. Hope User Mobile App (`hope-user`)

```bash
hope-user/
├── src/
│   ├── assets/              # Images, icons, animations
│   ├── constants/
│   ├── navigation/          # Bottom tabs & stack navigation
│   ├── redux/               # Global state
│   ├── screens/             # All user-facing screens
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── habit-screen/
│   │   ├── mood-tracker-screen/
│   │   ├── articles-screen/
│   │   ├── yoga-guide-screen/
│   │   └── profile-screen/
│   ├── styles/
│   └── utilities/           # Custom components
├── App.jsx
├── index.js
└── package.json
```

---

## 🚀 Getting Started

### Backend

```bash
cd hope-backend
npm install
cp .env.example .env
# Configure your MongoDB, Cloudinary, JWT, etc.
npm run dev
```

### Super Admin Dashboard

```bash
cd hope-super-admin
npm install
cp .env.example .env
npm run dev
```

### Mobile App (Android)

```bash
cd hope-user
npm install
npx react-native run-android
```

---

## 🔗 API Integration

- The **Super Admin** and **Mobile App** both connect to the **Hope Backend**.
- Base URL: `http://localhost:8000/api` (configurable via `.env`)

---

## 🛠️ Tech Stack (Full)

**Backend:**

- Node.js, Express.js, MongoDB (Mongoose)
- JWT Authentication, bcrypt, Cloudinary
- Security: Helmet, CORS, Rate Limiting

**Super Admin:**

- React 18, Vite, Redux Toolkit, React Router
- Axios, React Hot Toast

**Mobile App:**

- React Native, Redux Toolkit, React Navigation
- React Native Vector Icons

**Common:**

- JavaScript, ESLint, Prettier

---

## 📋 Modules

- **Authentication** (Shared across all)
- **User Management**
- **Content Management** (Articles & Yoga Guides)
- **Habit & Mood Tracking**
- **Analytics & Insights**

---

## 📄 License

This project is part of the **Hope Wellness Platform** and is licensed under proprietary terms.

---

**Built with ❤️ for mental wellness, mindfulness, and personal growth.**

---
