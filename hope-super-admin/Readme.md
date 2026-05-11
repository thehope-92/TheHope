**Here's a clean and professional `README.md` for your `hope-super-admin` project:**

````markdown
# Hope Super Admin Dashboard

A modern, responsive **React + Vite** admin panel for the **Hope** wellness platform. Built for super administrators to manage users, articles, yoga guides, and platform content efficiently.

---

## ✨ Features

- **Secure Authentication**
  - Login, Forgot Password, Reset Password
  - Protected Routes

- **User Management**
  - View all users
  - User details and profiles

- **Content Management**
  - Manage Articles / Information Library
    - Create, Read, Update Articles
  - Manage Yoga Guides
    - Create, Read, Update Yoga content

- **Modern UI/UX**
  - Clean dashboard layout
  - Responsive design
  - Reusable components (Cards, Buttons, Modals, etc.)

- **State Management**
  - Redux Toolkit + Redux Persist
  - Centralized store with slices for auth, users, articles, and yoga

- **Notifications**
  - React Hot Toast integration

---

## 🛠️ Tech Stack

| Technology       | Purpose             |
| ---------------- | ------------------- |
| React 18         | Frontend Library    |
| Vite             | Build Tool          |
| Redux Toolkit    | State Management    |
| Redux Persist    | Persist Redux State |
| React Router DOM | Routing             |
| Axios            | HTTP Client         |
| Bootstrap5       | Styling             |
| React Hot Toast  | Notifications       |
| Zod              | Validation          |

---

## 📁 Project Structure

```bash
hope-super-admin/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/               # Images & logos
│   ├── navigation/           # Routing & Layouts
│   ├── redux/                # Redux store & slices
│   ├── screens/              # All pages & components
│   │   ├── auth/             # Authentication pages
│   │   ├── dashboard/
│   │   ├── manage-articles/
│   │   ├── manage-users/
│   │   └── manage-yoga-guides/
│   ├── styles/
│   ├── utilities/            # Reusable UI components
│   └── main.jsx
├── .env
├── vite.config.js
└── package.json
```

---

## 🔑 Key Screens

- **Authentication**
  - Sign In
  - Forgot Password
  - Reset Password

- **Dashboard**
  - Main overview

- **Management Modules**
  - Users Management
  - Articles Management (CRUD)
  - Yoga Guides Management (CRUD)

---

## 🎨 UI Components

Reusable components located in `src/utilities/`:

- Button
- Card
- InputField
- Loader
- Modal
- PopOver
- Sidebar

---

## 🔗 Backend Integration

This frontend connects to the **Hope Backend** (`hope-backend`) via REST APIs.

Make sure the backend is running on `http://localhost:5000` (or update `VITE_API_BASE_URL`).

## 📄 License

This project is part of the **Hope Wellness Platform**.

---

**Built with ❤️ for mental wellness and mindfulness.**

---
