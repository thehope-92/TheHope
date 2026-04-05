/**
 * @fileoverview Mongoose schema for application users
 * @module models/userModel
 */

const mongoose = require("mongoose");

/**
 * Schema for User
 */
const userSchema = new mongoose.Schema(
  {
    profilePicture: {
      type: String,
      default: null,
    },

    userName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      min: 10,
      max: 100,
      default: null,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      default: "MALE",
    },

    bio: {
      type: String,
      trim: true,
      default: null,
    },

    phone: {
      countryCode: { type: String, default: null },
      phoneNumber: { type: String, default: null },
    },

    // Original Stealth Mode flag (kept for backward compatibility)
    isStealthModeEnabled: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["USER"],
      default: "USER",
    },

    // Tracking progress (Functional Requirements: Mood Tracker & Habit Tracker)
    moodLogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MoodTracking",
      },
    ],

    habits: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Habit",
      },
    ],

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      default: null,
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    sessionId: {
      type: String,
      default: null,
    },

    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },

    // ========== 🔐 ENHANCED STEALTH MODE (Decoy Launcher Alternative) ==========
    stealth: {
      // Hashed PIN (4-6 digits) - user must enter this to see real app
      pinHash: {
        type: String,
        default: null,
        select: false, // Don't return by default for security
      },

      // Failed PIN attempts counter (for brute force protection)
      pinAttempts: {
        type: Number,
        default: 0,
        min: 0,
      },

      // Lock the PIN verification after too many failed attempts
      pinLockedUntil: {
        type: Date,
        default: null,
      },

      // Last successful PIN verification timestamp
      lastVerifiedAt: {
        type: Date,
        default: null,
      },

      // Track authorized sessions (device + session combo)
      // This allows the real app to stay visible without re-entering PIN
      authorizedSessions: [
        {
          sessionId: {
            type: String,
            required: true,
          },
          deviceId: {
            type: String,
            default: null,
          },
          verifiedAt: {
            type: Date,
            default: Date.now,
          },
          expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours default
          },
          userAgent: {
            type: String,
            default: null,
          },
        },
      ],

      // When decoy screen was last shown to unauthorized user
      decoyShownAt: {
        type: Date,
        default: null,
      },

      // Total number of times decoy was shown (for analytics)
      decoyShownCount: {
        type: Number,
        default: 0,
      },

      // Timestamp when stealth mode was enabled
      enabledAt: {
        type: Date,
        default: null,
      },

      // Timestamp when stealth mode was last disabled
      disabledAt: {
        type: Date,
        default: null,
      },

      // New Boolean Field
      hasStealthPin: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for full phone number calculation
userSchema.virtual("fullPhone").get(function () {
  if (!this.phone?.countryCode || !this.phone?.phoneNumber) return null;
  return `${this.phone.countryCode}${this.phone.phoneNumber}`.replace(
    /\s+/g,
    "",
  );
});

// ========== VIRTUAL: Check if stealth mode is active ==========
userSchema.virtual("isStealthActive").get(function () {
  return this.isStealthModeEnabled === true && this.stealth.pinHash !== null;
});

// ========== VIRTUAL: Check if PIN is currently locked ==========
userSchema.virtual("isPinLocked").get(function () {
  return (
    this.stealth.pinLockedUntil && this.stealth.pinLockedUntil > new Date()
  );
});

// ========== VIRTUAL: Get remaining lock time in minutes ==========
userSchema.virtual("pinLockRemainingMinutes").get(function () {
  if (!this.isPinLocked) return 0;
  return Math.ceil((this.stealth.pinLockedUntil - new Date()) / 60000);
});

// ========== HELPER: Generate a random session ID ==========
userSchema.methods.generateStealthSessionId = function () {
  const crypto = require("crypto");
  return crypto.randomBytes(32).toString("hex");
};

// ========== METHOD: Check if a session is authorized ==========
userSchema.methods.isSessionAuthorized = function (sessionId) {
  if (!sessionId) return false;

  const authorizedSession = this.stealth.authorizedSessions.find(
    (session) =>
      session.sessionId === sessionId && session.expiresAt > new Date(),
  );

  return !!authorizedSession;
};

// ========== METHOD: Authorize a new session (after PIN verification) ==========
userSchema.methods.authorizeSession = function (
  sessionId,
  deviceId = null,
  userAgent = null,
) {
  // Remove expired sessions first
  this.stealth.authorizedSessions = this.stealth.authorizedSessions.filter(
    (session) => session.expiresAt > new Date(),
  );

  // Add new authorized session
  this.stealth.authorizedSessions.push({
    sessionId,
    deviceId,
    userAgent,
    verifiedAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });

  // Update last verified timestamp
  this.stealth.lastVerifiedAt = new Date();

  return this;
};

// ========== METHOD: Remove a session authorization (logout from stealth) ==========
userSchema.methods.deauthorizeSession = function (sessionId) {
  this.stealth.authorizedSessions = this.stealth.authorizedSessions.filter(
    (session) => session.sessionId !== sessionId,
  );
  return this;
};

// ========== METHOD: Clear all authorized sessions ==========
userSchema.methods.clearAllAuthorizedSessions = function () {
  this.stealth.authorizedSessions = [];
  return this;
};

// ========== METHOD: Increment decoy shown counter ==========
userSchema.methods.incrementDecoyShown = async function () {
  this.stealth.decoyShownAt = new Date();
  this.stealth.decoyShownCount += 1;
  return this;
};

// ========== STATIC: Find user by session ID (for stealth verification) ==========
userSchema.statics.findByStealthSessionId = async function (sessionId) {
  return this.findOne({
    "stealth.authorizedSessions.sessionId": sessionId,
    "stealth.authorizedSessions.expiresAt": { $gt: new Date() },
    isActive: true,
  });
};

module.exports = mongoose.model("User", userSchema);
