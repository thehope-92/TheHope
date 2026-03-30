/**
 * @fileoverview Robust controller for Self-Care Habit Tracker
 * @module controllers/habitController
 */

const Habit = require("../../models/habit-tracker-model/habit.tracker.model");
const User = require("../../models/user-model/user.model");
const moment = require("moment"); // Highly recommended for date handling

/**
 * Create a new personal habit (Backdating Allowed)
 * @access Private (User)
 */
exports.createHabit = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      frequency,
      isReminderOn,
      reminderTime,
      startDate, // The date the user picked (e.g., "2026-03-26")
    } = req.body;

    /* 1. VALIDATION */
    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Habit title is required",
      });
    }

    // Ensure a date is provided, otherwise default to today
    const finalStartDate = startDate || moment().format("YYYY-MM-DD");

    /* 2. CREATE HABIT */
    // No overrides here. If the user sends March 26, we save March 26.
    const habit = new Habit({
      user: req.user.id,
      title: title.trim(),
      description: description?.trim() || "",
      category: category || "OTHER",
      frequency: frequency || [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ],
      isReminderOn: !!isReminderOn,
      reminderTime: isReminderOn ? reminderTime : undefined,
      startDate: finalStartDate,
    });

    await habit.save();

    /* 3. Sync with User */
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { habits: habit._id } },
      { new: true },
    );

    if (!updatedUser) {
      // Cleanup if user update fails
      await Habit.findByIdAndDelete(habit._id);
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Habit created successfully",
      habit,
    });
  } catch (error) {
    console.error("Create Habit Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create habit",
      error: error.message,
    });
  }
};

/**
 * Get all habits for the logged-in user
 * @access Private (User)
 */
exports.getMyHabits = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, isActive } = req.query;

    // 1. Build a dynamic query object
    let query = { user: userId };

    // Filter by Category if provided (e.g., /?category=HYDRATION)
    if (category) {
      query.category = category.toUpperCase();
    }

    // Filter by Active status if provided (e.g., /?isActive=true)
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    // 2. Fetch habits from the Habit collection
    // We sort by createdAt: -1 so the most recently created habits appear at the top
    const habits = await Habit.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Habits fetched successfully",
      count: habits.length,
      allHabits: habits,
    });
  } catch (error) {
    console.error("Get Habits Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve habits",
      error: error.message,
    });
  }
};

/**
 * Toggle Habit Completion for Today
 * This is the engine for your Progress Bar
 * @access Private (User)
 */
exports.toggleHabitCompletion = async (req, res) => {
  try {
    const { habitId } = req.params;
    // We use YYYY-MM-DD to ensure consistency regardless of time of day
    const today = moment().format("YYYY-MM-DD");
    const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");

    const habit = await Habit.findOne({ _id: habitId, user: req.user.id });

    if (!habit) {
      return res
        .status(404)
        .json({ success: false, message: "Habit not found" });
    }

    const isDoneToday = habit.completedDates.includes(today);

    if (isDoneToday) {
      // 1. If already done, "Undo" it (Remove today's date)
      habit.completedDates = habit.completedDates.filter(
        (date) => date !== today,
      );

      // Recalculate streak (Simplistic version: decrement)
      if (habit.currentStreak > 0) habit.currentStreak -= 1;
    } else {
      // 2. Mark as Done (Add today's date)
      habit.completedDates.push(today);

      // 3. Update Streak Logic
      const wasDoneYesterday = habit.completedDates.includes(yesterday);
      if (wasDoneYesterday || habit.completedDates.length === 1) {
        habit.currentStreak += 1;
      } else {
        habit.currentStreak = 1; // Reset streak if they missed a day
      }

      // 4. Update Longest Streak
      if (habit.currentStreak > habit.longestStreak) {
        habit.longestStreak = habit.currentStreak;
      }
    }

    await habit.save();

    res.status(200).json({
      success: true,
      message: isDoneToday
        ? "Habit marked as incomplete"
        : "Habit completed! Streak updated.",
      currentStreak: habit.currentStreak,
      isCompletedToday: !isDoneToday,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error updating completion status" });
  }
};

/**
 * Get Dashboard for any selected date (Past or Today)
 * Directly drives the "Horizontal Calendar" and "Progress Bar" UI
 */
exports.getDailyDashboard = async (req, res) => {
  try {
    let targetDate = req.query.date || moment().format("YYYY-MM-DD");

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      targetDate = moment().format("YYYY-MM-DD");
    }

    const dayName = moment(targetDate).format("dddd").toUpperCase();
    const isFuture = moment(targetDate).isAfter(moment(), "day");

    // Find habits that:
    // - Belong to user
    // - Are active
    // - Have this day in frequency
    // - Have started on or before the target date
    const habits = await Habit.find({
      user: req.user.id,
      isActive: true,
      frequency: dayName,
      startDate: { $lte: targetDate }, // Habit must have started by this date
    }).sort({ startDate: 1, createdAt: 1 });

    // Format + check completion status for THIS specific date
    const formattedHabits = habits.map((habit) => {
      const habitObj = habit.toObject();
      return {
        ...habitObj,
        isCompleted: habit.completedDates.includes(targetDate),
      };
    });

    const total = formattedHabits.length;
    const completedCount = formattedHabits.filter((h) => h.isCompleted).length;
    const progressPercent =
      total > 0 ? Math.round((completedCount / total) * 100) : 0;

    res.status(200).json({
      success: true,
      message: "Daily dashboard loaded successfully",
      selectedDate: targetDate,
      dayOfWeek: dayName,
      isFuture,
      stats: {
        total,
        completed: completedCount,
        percent: progressPercent,
        label: `${completedCount} of ${total} completed`,
      },
      habits: formattedHabits,
    });
  } catch (error) {
    console.error("Get Daily Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Error loading dashboard",
    });
  }
};

/**
 * Delete Habit and remove reference from User profile
 * @access Private (User)
 */
exports.deleteHabit = async (req, res) => {
  try {
    const { habitId } = req.params;
    const userId = req.user.id;

    // 1. Delete the habit document
    // We check both _id and user to ensure a user can't delete someone else's habit
    const deletedHabit = await Habit.findOneAndDelete({
      _id: habitId,
      user: userId,
    });

    if (!deletedHabit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found or you do not have permission to delete it.",
      });
    }

    // 2. SYNC: Remove the Habit ID from the User's habits array
    await User.findByIdAndUpdate(
      userId,
      { $pull: { habits: habitId } }, // $pull removes all instances of the ID from the array
    );

    res.status(200).json({
      success: true,
      message: "Habit deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Habit Error:", error);
    res.status(500).json({
      success: false,
      message: "Delete operation failed",
      error: error.message,
    });
  }
};
