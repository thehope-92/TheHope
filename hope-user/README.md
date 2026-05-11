# Hope User Mobile App 📱

**Hope** is a comprehensive wellness and mental health mobile application designed to help users build positive habits, track their mood, explore yoga practices, and access valuable wellness content — all in one beautifully crafted experience.

---

## ✨ Features

- **Authentication System**

  - Secure Sign Up, Sign In, and Forgot Password flows

- **Personal Dashboard**

  - Centralized home for quick access to all modules

- **Habit Tracker**

  - Create, manage, and monitor daily habits

- **Mood Tracker**

  - Log daily moods with analytics and insights

- **Yoga Guide**

  - Browse yoga categories, detailed guides, and routines

- **Information Library (Articles)**

  - Curated wellness and mental health articles with categories

- **Profile Management**

  - Personal settings, account details, and preferences

- **Onboarding Experience**
  - Smooth and engaging first-time user journey

---

## 🛠️ Tech Stack

- **Framework:** React Native (CLI)
- **State Management:** Redux Toolkit + Redux Persist
- **Navigation:** React Navigation
- **UI Components:** Custom reusable components with clean styling
- **Icons:** React Native Vector Icons
- **Language:** JavaScript / JSX

---

## 📁 Project Structure

```bash
hope-user/
├── src/
│   ├── assets/                    # Images, animations & placeholders
│   │   ├── logo/
│   │   ├── navigatorIcons/
│   │   ├── onboarding/
│   │   └── placeHolder/
│   ├── constants/
│   │   └── categories/
│   ├── navigation/                # Navigation setup
│   │   ├── bottom-navigator/
│   │   ├── AppNavigator.jsx
│   │   └── RootNavigator.jsx
│   ├── redux/                     # Global state management
│   │   ├── config/
│   │   ├── slices/
│   │   └── store/
│   ├── screens/                   # All application screens
│   │   ├── articles-screen/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── habit-screen/
│   │   ├── mood-tracker-screen/
│   │   ├── onboarding-screen/
│   │   ├── profile-screen/
│   │   ├── splash-screen/
│   │   └── yoga-guide-screen/
│   ├── styles/                    # Global styles & themes
│   └── utilities/                 # Reusable components & hooks
│       └── custom-components/
├── App.jsx
├── index.js
├── package.json
├── .env
└── README.md
```

---

## 🚀 Installation & Setup

Make sure you have the [React Native development environment](https://reactnative.dev/docs/environment-setup) set up.

```bash
# 1. Clone the repository
git clone <https://github.com/zain100000/The_Hope.git>
cd hope-user

# 2. Install dependencies
npm install
# or
yarn install

# 3. Run the app
npx react-native run-android
# or
npx react-native run-ios
```

---

## 📌 Key Modules

| Module        | Description                            |
| ------------- | -------------------------------------- |
| Auth          | Login, Signup, Password Recovery       |
| Dashboard     | Main home screen                       |
| Habit Tracker | Build and track personal habits        |
| Mood Tracker  | Daily mood logging & insights          |
| Yoga Guide    | Yoga poses, routines & categories      |
| Articles      | Wellness content & information library |
| Profile       | User settings and account management   |

---

## 🎨 Design Philosophy

Hope focuses on **simplicity, calmness, and mindfulness** in its design — helping users feel supported on their wellness journey.

---

## 📄 License

This project is part of the **Hope Wellness Platform**.

---

**Built with ❤️ for mental wellness, mindfulness, and personal growth.**

---
