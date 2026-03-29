/**
 * @fileoverview Mood Tracking controller synced with User Schema
 * @module controllers/moodTrackingController
 */

const mongoose = require("mongoose");
const MoodTracking = require("../../models/mood-tracker-model/mood.tracker.model");
const User = require("../../models/user-model/user.model");

/**
 * Create new mood entry & sync with User moodLogs
 * @access Private
 */
exports.createMoodEntry = async (req, res) => {
  try {
    const {
      moodType,
      moodIntensity,
      energyLevel,
      sleepHours,
      location,
      moodNote,
      weatherCondition,
      tags,
      isPrivate,
    } = req.body;

    // 1. Enforce Daily Limit (One entry per day)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingEntry = await MoodTracking.findOne({
      userId: req.user.id,
      moodDate: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message:
          "You have already logged your mood for today. Please update your existing entry instead.",
      });
    }

    // 2. Create and Save Mood
    const moodEntry = new MoodTracking({
      userId: req.user.id,
      moodType,
      moodIntensity,
      energyLevel,
      sleepHours,
      location,
      moodNote,
      weatherCondition,
      tags,
      isPrivate,
    });

    const savedMood = await moodEntry.save();

    // 3. SYNC: Push the Mood ID to the User's moodLogs array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { moodLogs: savedMood._id } },
      { new: true },
    );

    res.status(201).json({
      success: true,
      message: "Mood created successfully",
      mood: savedMood,
    });
  } catch (error) {
    console.error("Create mood error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create mood entry" });
  }
};

/**
 * Get all mood entries for logged-in user
 */
exports.getUserMoods = async (req, res) => {
  try {
    const moods = await MoodTracking.find({ userId: req.user.id }).sort({
      moodDate: -1,
    });

    res.status(200).json({
      success: true,
      count: moods.length,
      moods,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch entries" });
  }
};

/**
 * Update mood entry (IDs remain synced)
 */
exports.updateMoodEntry = async (req, res) => {
  try {
    const { moodId } = req.params;

    const mood = await MoodTracking.findById(moodId);

    if (!mood) {
      return res
        .status(404)
        .json({ success: false, message: "Entry not found" });
    }

    // Security check
    if (mood.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access" });
    }

    // Prevent overwriting internal references
    const updates = req.body;
    ["userId", "moodDate", "_id"].forEach((key) => delete updates[key]);

    Object.assign(mood, updates);
    await mood.save();

    res.status(200).json({
      success: true,
      message: "Mood updated successfully",
      updatedMood: mood,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

/**
 * Delete mood entry & remove reference from User moodLogs
 * @access Private
 */
exports.deleteMoodEntry = async (req, res) => {
  try {
    const { moodId } = req.params;

    const mood = await MoodTracking.findById(moodId);

    if (!mood) {
      return res
        .status(404)
        .json({ success: false, message: "Entry not found" });
    }

    // Security check
    if (mood.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized action" });
    }

    // 1. Delete actual document
    await MoodTracking.findByIdAndDelete(moodId);

    // 2. SYNC: Pull the ID from the User's moodLogs array to keep it clean
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { moodLogs: moodId },
    });

    res.status(200).json({
      success: true,
      message: "Mood deleted successfully",
    });
  } catch (error) {
    console.error("Delete mood error:", error);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

/**
 * Advanced Mood Analytics
 */
exports.getMoodAnalytics = async (req, res) => {
  try {
    const analytics = await MoodTracking.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: "$moodType",
          count: { $sum: 1 },
          avgIntensity: { $avg: "$moodIntensity" },
          avgSleep: { $avg: "$sleepHours" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      message: "Mood analytics retrieved successfully",
      analytics,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Analytics failed" });
  }
};
