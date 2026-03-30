/**
 * @fileoverview Robust Mongoose schema for Self-Care Habit Tracker
 * @module models/habitModel
 */

const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A habit must belong to a user"],
    },

    title: {
      type: String,
      required: [true, "Please provide a habit title"],
      trim: true,
      maxlength: [50, "Title is too long"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description is too long"],
    },

    category: {
      type: String,
      enum: [
        "HYDRATION",
        "SLEEP",
        "NUTRITION",
        "EXERCISE",
        "MEDICATION",
        "HYGIENE",
        "POSTURE",
        "MINDFULNESS",
        "JOURNALING",
        "THERAPY",
        "MOOD_CHECK",
        "READING",
        "SOCIALIZING",
        "KINDNESS",
        "FAMILY",
        "DIGITAL_DETOX",
        "CLEANING",
        "HOBBY",
        "OTHER",
      ],
      default: "OTHER",
    },

    // ─── FREQUENCY & REMINDERS ──────────────────────────────────────────
    // Allows the user to choose specific days (e.g., only Mon, Wed, Fri)
    frequency: {
      type: [String],
      enum: [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ],
      default: [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ],
    },

    isReminderOn: {
      type: Boolean,
      default: false,
    },

    reminderTime: {
      type: String, // HH:mm format (e.g., "07:30")
      validate: {
        validator: function (v) {
          return !this.isReminderOn || /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: "Invalid time format (HH:mm)",
      },
    },

    // ─── COMPLETION TRACKING ───────────────────────────────────────────
    // We store completed dates as strings "YYYY-MM-DD" for high performance
    completedDates: [
      {
        type: String,
      },
    ],

    // Keeps track of consecutive days completed
    currentStreak: {
      type: Number,
      default: 0,
    },

    longestStreak: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    startDate: {
      type: String, // Format: "YYYY-MM-DD"
      required: [true, "Start date is required"],
      validate: {
        validator: function (v) {
          return /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: "startDate must be in YYYY-MM-DD format",
      },
    },
  },
  {
    timestamps: true,
  },
);

// Optimized Index for the progress bar logic
habitSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model("Habit", habitSchema);
