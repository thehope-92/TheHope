# Hope Backend

A robust Node.js/Express.js backend for the **Hope** wellness platform, focused on mental health, personal growth, and mindfulness. It includes habit tracking, mood tracking, yoga guidance, and an information library.

## ✨ Features

- **User Authentication & Authorization**
  - JWT-based auth
  - Secure password handling with bcrypt
  - Password reset functionality via email

- **Habit Tracker**
  - Create, manage, and track daily habits

- **Mood Tracker**
  - Log and monitor mood entries over time

- **Information Library**
  - Curated wellness and mental health content

- **Yoga Guide**
  - Yoga poses, routines, and guidance

- **Super Admin Panel**
  - Administrative controls and content management

- **Additional Features**
  - Email notifications
  - Image upload support (Cloudinary)
  - Rate limiting & security middlewares
  - Input sanitization and protection

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT + bcrypt
- **File Uploads**: Cloudinary
- **Security**: Helmet, CORS, Rate Limiting, HPP
- **Utilities**: Axios, dotenv, etc.

## 📁 Project Structure

```bash
hope-backend/
├── src/
│   ├── constants/
│   │   └── categories.constants.js
│   ├── controllers/
│   │   ├── habit.controller.js
│   │   ├── information-library.controller.js
│   │   ├── mood.controller.js
│   │   ├── shared/
│   │   │   └── password-reset.controller.js
│   │   ├── super-admin.controller.js
│   │   ├── user.controller.js
│   │   └── yoga-guide.controller.js
│   ├── helpers/
│   │   ├── email.helper.js
│   │   ├── password.helper.js
│   │   └── token.helper.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── security.middleware.js
│   ├── models/
│   │   ├── habit.model.js
│   │   ├── information-library.model.js
│   │   ├── mood.model.js
│   │   ├── super-admin.model.js
│   │   ├── user.model.js
│   │   └── yoga-guide.model.js
│   ├── routes/
│   │   ├── habit.route.js
│   │   ├── information-library.route.js
│   │   ├── mood.route.js
│   │   ├── shared.route.js
│   │   ├── super-admin.route.js
│   │   ├── user.route.js
│   │   └── yoga-guide.route.js
│   ├── services/
│   │   └── password.service.js
│   ├── utils/
│   │   ├── cloudinary.util.js
│   │   └── content-formatter.util.js
│   └── server.js                    # or app.js
├── .env
├── .gitignore
├── package.json
└── README.md

```

## 🧩 Main Modules

| Module              | Description                      |
| ------------------- | -------------------------------- |
| User                | User registration, profile, auth |
| Super Admin         | Admin dashboard & management     |
| Habit Tracker       | Habit creation and tracking      |
| Mood Tracker        | Daily mood logging & analytics   |
| Yoga Guide          | Yoga content & routines          |
| Information Library | Educational wellness content     |

## 🔐 Security

- Helmet for secure HTTP headers
- Rate limiting & slow down protection
- MongoDB injection protection
- Input validation & sanitization
- CORS configuration

Base URL: `http://localhost:5000/api`

## 📄 License

This project is licensed under the ISC License.

---

**Made with ❤️ for mental wellness and personal growth.**

```

```
