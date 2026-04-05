/**
 * @fileoverview User controller – authentication & profile
 * @module controllers/userController
 * @description Handles registration, login, profile updates, deletion, logout.
 */

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../../models/user-model/user.model");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../../utilities/cloudinary-utility/cloudinary.utility");
const {
  passwordRegex,
  hashPassword,
} = require("../../helpers/password-helper/password.helper");
const {
  generateEncryptedToken,
} = require("../../middlewares/auth-middleware/auth.middleware");
const {
  sendEmailVerificationOtp,
} = require("../../helpers/email-helper/email.helper");

/**
 * Register new user
 * @body {string} userName
 * @body {string} email
 * @body {string} password
 * @body {string} [phone.countryCode]    – e.g. "+92", "+1", "+44"
 * @body {string} [phone.phoneNumber]    – local number without country code
 * @body {string} [address]
 * @files {profilePicture?}
 * @access Public
 */
exports.registerUser = async (req, res) => {
  let uploadedUrl = null;

  try {
    const {
      userName,
      email,
      password,
      age = null,
      gender = null,
      bio = null,
    } = req.body;

    /* ---------------- FIX: PARSE PHONE FROM FORMDATA ---------------- */
    const phone = {
      countryCode: req.body["phone.countryCode"],
      phoneNumber: req.body["phone.phoneNumber"],
    };

    /* ---------------- PASSWORD VALIDATION ---------------- */
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters with upper, lower, number and special character",
      });
    }

    /* ---------------- EMAIL CHECK ---------------- */
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    /* ---------------- AGE VALIDATION ---------------- */
    if (age && (age < 10 || age > 100)) {
      return res.status(400).json({
        success: false,
        message: "Age must be between 10 and 100",
      });
    }

    /* ---------------- GENDER VALIDATION ---------------- */
    const allowedGenders = ["MALE", "FEMALE", "OTHER"];
    if (gender && !allowedGenders.includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender value",
      });
    }

    /* ---------------- PHONE VALIDATION ---------------- */
    let phoneData = null;

    if (phone?.countryCode || phone?.phoneNumber) {
      if (!phone.countryCode || !phone.phoneNumber) {
        return res.status(400).json({
          success: false,
          message:
            "Both countryCode and phoneNumber are required if phone is provided",
        });
      }

      const cleanedNumber = phone.phoneNumber.replace(/\D/g, "");

      if (cleanedNumber.length < 7 || cleanedNumber.length > 15) {
        return res.status(400).json({
          success: false,
          message: "Phone number should be between 7 and 15 digits",
        });
      }

      phoneData = {
        countryCode: phone.countryCode.trim(),
        phoneNumber: cleanedNumber,
      };
    }

    /* ---------------- PROFILE IMAGE UPLOAD ---------------- */
    let profilePicture = null;

    if (req.files?.profilePicture?.[0]) {
      const result = await uploadToCloudinary(
        req.files.profilePicture[0],
        "profilePicture",
      );

      profilePicture = result.url;
      uploadedUrl = result.url;
    }

    /* ---------------- CREATE USER ---------------- */
    const user = new User({
      profilePicture,
      userName: userName.trim(),
      email: normalizedEmail,
      password: await hashPassword(password),
      age,
      gender,
      bio,
      phone: phoneData,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    /* ---------------- CLEANUP CLOUDINARY ---------------- */
    if (uploadedUrl) {
      await deleteFromCloudinary(uploadedUrl).catch(console.error);
    }

    console.error("Register user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: error.message,
    });
  }
};

/**
 * Login user → encrypted JWT
 * @body {string} email
 * @body {string} password
 * @access Public
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Lockout handling
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const mins = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account locked. Try again in ${mins} minutes.`,
      });
    }

    if (user.lockUntil && user.lockUntil <= Date.now()) {
      user.loginAttempts = 0;
      user.lockUntil = null;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 3) {
        user.lockUntil = Date.now() + 30 * 60 * 1000;
      }
      await user.save();

      return res.status(401).json({
        success: false,
        message: user.lockUntil
          ? "Account locked (30 min)"
          : "Invalid credentials",
      });
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();
    user.sessionId = crypto.randomBytes(32).toString("hex");
    await user.save();

    const token = generateEncryptedToken({
      role: "USER",
      user: { id: user._id.toString(), email: user.email },
      sessionId: user.sessionId,
    });

    res.cookie("accessToken", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("User login error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Get user profile
 * @param {string} userId
 * @access Private
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password -__v")
      .populate({
        path: "moodLogs",
        options: { sort: { createdAt: -1 } }, // optional sorting
      })

      .populate({
        path: "habits",
        options: { sort: { createdAt: -1 } }, // optional sorting
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Update user profile
 * @param {string} userId
 * @body {string} [userName]
 * @body {Object} [phone]                 – { countryCode, phoneNumber }
 * @body {string} [address]
 * @body {string} [preferredCity]
 * @files {profilePicture?}
 * @access Private
 */
exports.updateProfile = async (req, res) => {
  let uploadedUrl = null;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (req.body.userName) user.userName = req.body.userName.trim();
    if (req.body.bio) user.bio = req.body.bio.trim();
    if (req.body.gender) user.gender = req.body.gender.trim();

    // Handle phone update (partial allowed)
    if (req.body.phone) {
      const { countryCode, phoneNumber } = req.body.phone;

      if (countryCode !== undefined) {
        user.phone = user.phone || {};
        user.phone.countryCode = countryCode.trim() || null;
      }

      if (phoneNumber !== undefined) {
        user.phone = user.phone || {};
        user.phone.phoneNumber = phoneNumber.trim() || null;
      }

      // Optional: clear phone if both are empty
      if (!user.phone?.countryCode && !user.phone?.phoneNumber) {
        user.phone = null;
      }
    }

    if (req.body.address) user.address = req.body.address.trim();

    if (req.body.preferredCity) {
      // Validate against enum (optional – mongoose will throw if invalid)
      user.preferredCity = req.body.preferredCity;
    }

    if (req.files?.profilePicture?.[0]) {
      if (user.profilePicture) {
        await deleteFromCloudinary(user.profilePicture).catch(console.error);
      }

      const result = await uploadToCloudinary(
        req.files.profilePicture[0],
        "profilePicture",
      );
      user.profilePicture = result.url;
      uploadedUrl = result.url;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      updatedUser: user,
    });
  } catch (error) {
    if (uploadedUrl)
      await deleteFromCloudinary(uploadedUrl).catch(console.error);
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Delete user account
 * @param {string} userId
 * @body {string} reason
 * @access Private
 */
exports.deleteAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Reason required (min 5 characters)",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.profilePicture) {
      await deleteFromCloudinary(user.profilePicture).catch(console.error);
    }

    await User.findByIdAndDelete(userId);

    res.clearCookie("accessToken", { httpOnly: true, sameSite: "strict" });

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Logout user
 * @access Private
 */
exports.logoutUser = async (req, res) => {
  try {
    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, { sessionId: null });
    }

    res.clearCookie("accessToken", { httpOnly: true, sameSite: "strict" });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Request 6-digit OTP to verify email address
 * @body {string} [email] – optional (uses authenticated user's email if omitted)
 * @access Private (logged-in user)
 */
exports.requestEmailVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select(
      "email userName isEmailVerified",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Your email is already verified",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 100000–999999

    // Hash OTP before storing (security best practice)
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Save hashed OTP + expiry
    user.emailVerificationToken = hashedOtp;
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Send OTP email using the helper function
    const emailSent = await sendEmailVerificationOtp(
      user.email,
      user.userName,
      otp,
    );

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again later.",
      });
    }

    res.status(200).json({
      success: true,
      message: "A 6-digit verification code has been sent to your email",
    });
  } catch (error) {
    console.error("Request email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Verify email using the 6-digit OTP
 * @body {string} otp – the 6-digit code received via email
 * @access Private (logged-in user)
 */
exports.verifyEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otp } = req.body;

    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "A valid 6-digit OTP is required",
      });
    }

    const user = await User.findById(userId).select(
      "email isEmailVerified emailVerificationToken emailVerificationExpires",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Your email is already verified",
      });
    }

    if (!user.emailVerificationToken || !user.emailVerificationExpires) {
      return res.status(400).json({
        success: false,
        message:
          "No active verification request found. Please request a new code.",
      });
    }

    if (user.emailVerificationExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "This OTP has expired. Please request a new one.",
      });
    }

    // Compare hashed input OTP with stored hash
    const hashedInput = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedInput !== user.emailVerificationToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    // Success: mark as verified and clear token data
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully!",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ====================== STEALTH MODE HELPERS (keep these at the top of user.controller.js) ====================== */
const hashPIN = async (pin) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(pin, salt);
};

const verifyPIN = async (pin, hash) => {
  return await bcrypt.compare(pin, hash);
};

/* ====================== STEALTH MODE CONTROLLERS (FULL UPDATED VERSION) ====================== */

/**
 * SET STEALTH PIN + ENABLE (FIRST TIME ONLY)
 * Called only when user has NEVER set a PIN before.
 * User provides their own 4-6 digit PIN.
 * @route   POST /api/user/stealth/set-stealth-pin
 * @access  Private
 * @body    { pin: string }
 */
exports.setStealthPIN = async (req, res) => {
  try {
    const { pin } = req.body;
    const userId = req.user.id;

    if (!pin || !/^\d{4,6}$/.test(pin)) {
      return res
        .status(400)
        .json({ success: false, message: "PIN must be 4 to 6 digits" });
    }

    const user = await User.findById(userId);

    // Check if PIN already exists using the new boolean
    if (user.stealth.hasStealthPin) {
      return res.status(400).json({
        success: false,
        message: "PIN already set. Use enable-stealth-mode.",
      });
    }

    const hashedPIN = await hashPIN(pin);

    // Update fields
    user.isStealthModeEnabled = true;
    user.stealth.pinHash = hashedPIN;
    user.stealth.hasStealthPin = true; // ✅ Mark as true
    user.stealth.pinAttempts = 0;
    user.stealth.enabledAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Stealth PIN set successfully",
      user: {
        isStealthModeEnabled: true,
        hasStealthPin: true,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * ENABLE STEALTH MODE (SUBSEQUENT TIMES)
 * User enters the ALREADY SET PIN (no need to set new PIN).
 * PIN is verified → stealth mode becomes active again.
 * @route   POST /api/user/stealth/enable-stealth-mode
 * @access  Private
 * @body    { pin: string }
 */
exports.enableStealthMode = async (req, res) => {
  try {
    const { pin } = req.body;
    const userId = req.user.id;

    if (!pin) {
      return res.status(400).json({
        success: false,
        message: "PIN is required to enable stealth mode",
      });
    }

    const user = await User.findById(userId).select("+stealth.pinHash");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isStealthModeEnabled) {
      return res.status(400).json({
        success: false,
        message: "Stealth mode is already enabled",
      });
    }

    // Must have a previously set PIN
    if (!user.stealth.pinHash) {
      return res.status(400).json({
        success: false,
        message: "No PIN is set yet. Please use set-stealth-pin first.",
      });
    }

    // Check lockout
    if (user.isPinLocked) {
      const remainingMinutes = user.pinLockRemainingMinutes;
      return res.status(403).json({
        success: false,
        message: `Too many failed attempts. Try again in ${remainingMinutes} minutes.`,
        locked: true,
        remainingMinutes,
      });
    }

    const isValidPIN = await verifyPIN(pin, user.stealth.pinHash);

    if (!isValidPIN) {
      user.stealth.pinAttempts += 1;

      if (user.stealth.pinAttempts >= 5) {
        user.stealth.pinLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        user.stealth.pinAttempts = 0;
      }
      await user.save();

      return res.status(401).json({
        success: false,
        message: "Incorrect PIN",
        remainingAttempts: 5 - user.stealth.pinAttempts,
      });
    }

    // ✅ Correct PIN → Re-enable stealth (PIN remains the same)
    user.isStealthModeEnabled = true;
    user.stealth.pinAttempts = 0;
    user.stealth.pinLockedUntil = null;
    user.stealth.enabledAt = new Date();
    user.stealth.lastVerifiedAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Stealth mode enabled successfully using your existing PIN.",
      data: {
        isStealthModeEnabled: true,
      },
    });
  } catch (error) {
    console.error("Enable Stealth Mode Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * VERIFY PIN – Called on every app launch when stealth is enabled
 * Correct → Real app
 * Wrong → Decoy screen
 * @route   POST /api/user/stealth/verify-stealth-pin
 * @access  Private
 * @body    { pin: string }
 */
exports.verifyStealthPIN = async (req, res) => {
  try {
    const { pin } = req.body;
    const userId = req.user.id;

    if (!pin) {
      return res.status(400).json({
        success: false,
        message: "PIN is required",
      });
    }

    const user = await User.findById(userId).select("+stealth.pinHash");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isStealthModeEnabled) {
      return res.status(200).json({
        success: true,
        message: "Stealth mode is not enabled",
        isStealthModeEnabled: false,
      });
    }

    if (user.isPinLocked) {
      const remainingMinutes = user.pinLockRemainingMinutes;
      return res.status(403).json({
        success: false,
        message: `Too many failed attempts. Try again in ${remainingMinutes} minutes.`,
        locked: true,
        remainingMinutes,
      });
    }

    const isValidPIN = await verifyPIN(pin, user.stealth.pinHash);

    if (!isValidPIN) {
      user.stealth.pinAttempts += 1;
      user.stealth.decoyShownAt = new Date();
      user.stealth.decoyShownCount += 1;

      if (user.stealth.pinAttempts >= 5) {
        user.stealth.pinLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        user.stealth.pinAttempts = 0;
      }

      await user.save();

      return res.status(401).json({
        success: false,
        message: "Incorrect PIN – Decoy screen shown",
        remainingAttempts: 5 - user.stealth.pinAttempts,
      });
    }

    // Correct PIN
    user.stealth.pinAttempts = 0;
    user.stealth.pinLockedUntil = null;
    user.stealth.lastVerifiedAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: "PIN verified successfully",
    });
  } catch (error) {
    console.error("Verify Stealth PIN Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * DISABLE STEALTH MODE
 * Keeps the existing PIN (so user can re-enable later with same PIN)
 * @route   POST /api/user/stealth/disable-stealth-mode
 * @access  Private
 * @body    { pin: string }
 */
exports.disableStealthMode = async (req, res) => {
  try {
    const { pin } = req.body;
    const userId = req.user.id;

    if (!pin) {
      return res.status(400).json({
        success: false,
        message: "PIN is required to disable stealth mode",
      });
    }

    const user = await User.findById(userId).select("+stealth.pinHash");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isStealthModeEnabled) {
      return res.status(400).json({
        success: false,
        message: "Stealth mode is not enabled",
      });
    }

    if (user.isPinLocked) {
      const remainingMinutes = user.pinLockRemainingMinutes;
      return res.status(403).json({
        success: false,
        message: `Too many failed attempts. Try again in ${remainingMinutes} minutes.`,
        locked: true,
      });
    }

    const isValidPIN = await verifyPIN(pin, user.stealth.pinHash);

    if (!isValidPIN) {
      user.stealth.pinAttempts += 1;

      if (user.stealth.pinAttempts >= 5) {
        user.stealth.pinLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        user.stealth.pinAttempts = 0;
      }
      await user.save();

      return res.status(401).json({
        success: false,
        message: "Incorrect PIN",
        remainingAttempts: 5 - user.stealth.pinAttempts,
      });
    }

    // Disable only the flag – PIN remains saved for future re-enable
    user.isStealthModeEnabled = false;
    user.stealth.pinAttempts = 0;
    user.stealth.pinLockedUntil = null;
    user.stealth.authorizedSessions = [];
    user.stealth.lastVerifiedAt = null;
    user.stealth.disabledAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Stealth mode disabled successfully. Your PIN is still saved for next time.",
      data: {
        isStealthModeEnabled: false,
      },
    });
  } catch (error) {
    console.error("Disable Stealth Mode Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * GET STEALTH STATUS – Call on every app launch
 * @route   GET /api/user/stealth/get-stealth-status
 * @access  Private
 */
exports.getStealthStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        isStealthModeEnabled: user.isStealthModeEnabled,
        isPinLocked: user.isPinLocked,
        pinLockRemainingMinutes: user.pinLockRemainingMinutes,
        hasPinSet: !!user.stealth.hasStealthPin, // helpful for frontend
        lastVerifiedAt: user.stealth.lastVerifiedAt,
        decoyShownCount: user.stealth.decoyShownCount,
      },
    });
  } catch (error) {
    console.error("Get Stealth Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * CHANGE STEALTH PIN (optional but recommended)
 * @route   PATCH /api/user/stealth/change-stealth-pin
 * @access  Private
 * @body    { oldPin: string, newPin: string }
 */
exports.changeStealthPIN = async (req, res) => {
  try {
    const { oldPin, newPin } = req.body;
    const userId = req.user.id;

    if (!oldPin || !newPin || !/^\d{4,6}$/.test(newPin)) {
      return res.status(400).json({
        success: false,
        message: "Old PIN and new PIN (4 digits) are required",
      });
    }

    const user = await User.findById(userId).select("+stealth.pinHash");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.stealth.pinHash) {
      return res.status(400).json({
        success: false,
        message: "No PIN is set yet",
      });
    }

    const isValidOldPIN = await verifyPIN(oldPin, user.stealth.pinHash);
    if (!isValidOldPIN) {
      return res.status(401).json({
        success: false,
        message: "Invalid old PIN",
      });
    }

    const hashedNewPIN = await hashPIN(newPin);

    user.stealth.pinHash = hashedNewPIN;
    user.stealth.pinAttempts = 0;
    user.stealth.pinLockedUntil = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "PIN changed successfully",
    });
  } catch (error) {
    console.error("Change Stealth PIN Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get all Users
 * @access Private(SuperAdmin)
 */

exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    // Chain the populate methods for habits and moodLogs
    const users = await User.find().populate("habits").populate("moodLogs");

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      count: users.length,
      allUsers: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
