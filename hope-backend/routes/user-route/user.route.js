/**
 * @fileoverview Express routes for regular user authentication & profile
 * @module routes/userRoutes
 */

const express = require("express");
const router = express.Router();

const userController = require("../../controllers/user-controller/user.controller");
const {
  encryptedAuthMiddleware,
  authLimiter,
} = require("../../middlewares/auth-middleware/auth.middleware");
const cloudinaryUtility = require("../../utilities/cloudinary-utility/cloudinary.utility");

/**
 * @description Register new regular user (with optional profile picture)
 * @route   POST /api/user/signup-user
 * @access  Public
 */
router.post(
  "/signup-user",
  cloudinaryUtility.upload,
  userController.registerUser,
);

/**
 * @description Login user → returns encrypted JWT
 * @route   POST /api/user/signin-user
 * @access  Public
 */
router.post("/signin-user", authLimiter, userController.loginUser);

/**
 * @description Get user profile details
 * @route   GET /api/user/get-user-by-id/:userId
 * @access  Private (Authenticated user)
 */
router.get(
  "/get-user-by-id/:userId",
  encryptedAuthMiddleware,
  userController.getUserById,
);

/**
 * @description Update user profile (name, phone, address, picture)
 * @route   PATCH /api/user/update-user/:userId
 * @access  Private (Authenticated user)
 */
router.patch(
  "/update-user/:userId",
  encryptedAuthMiddleware,
  cloudinaryUtility.upload,
  userController.updateProfile,
);

/**
 * @description Permanently delete user account
 * @route   DELETE /api/user/delete-user/:userId
 * @access  Private (Authenticated user)
 */
router.delete(
  "/delete-user/:userId",
  encryptedAuthMiddleware,
  userController.deleteAccount,
);

/**
 * @description Logout user → invalidate session
 * @route   POST /api/user/logout-user
 * @access  Private (Authenticated user)
 */
router.post("/logout-user", encryptedAuthMiddleware, userController.logoutUser);

/**
 * @description Send email verification OTP to user email
 * @route   POST /api/user/send-verification-email
 * @access  Public
 */

router.post(
  "/send-verification-email",
  encryptedAuthMiddleware,
  userController.requestEmailVerification,
);

/**
 * @description Verify email using OTP
 * @route   POST /api/user/verify-email
 * @access  Public
 */

router.post(
  "/verify-email",
  encryptedAuthMiddleware,
  userController.verifyEmail,
);

/**
 * @description Set Stealth Mode PIN for User Privacy
 * @route   POST /api/user/stealth/set-stealth-pin
 * @access  Private (User)
 */
router.post(
  "/stealth/set-stealth-pin",
  encryptedAuthMiddleware,
  userController.setStealthPIN,
);

/**
 * @description Verify Stealth Mode PIN for User Privacy
 * @route   POST /api/user/stealth/verify-stealth-pin
 * @access  Private (User)
 */
router.post(
  "/stealth/verify-stealth-pin",
  encryptedAuthMiddleware,
  userController.verifyStealthPIN,
);

/**
 * @description Enable Stealth Mode
 * @route   POST /api/user/stealth/enable-stealth-mode
 * @access  Private (User)
 */
router.post(
  "/stealth/enable-stealth-mode",
  encryptedAuthMiddleware,
  userController.enableStealthMode,
);

/**
 * @description Disable Stealth Mode
 * @route   POST /api/user/stealth/disable-stealth-mode
 * @access  Private (User)
 */
router.post(
  "/stealth/disable-stealth-mode",
  encryptedAuthMiddleware,
  userController.disableStealthMode,
);

/**
 * @description Get stealth mode status for user
 * @route   GET /api/user/stealth/get-stealth-status
 * @access  Private (User)
 */
router.get(
  "/stealth/get-stealth-status",
  encryptedAuthMiddleware,
  userController.getStealthStatus,
);

/**
 * @description Change stealth mode PIN
 * @route   PATCH /api/user/stealth/change-stealth-pin
 * @access  Private (User)
 */
router.patch(
  "/stealth/change-stealth-pin",
  encryptedAuthMiddleware,
  userController.changeStealthPIN,
);

/**
 * @description Get all users
 * @route   GET /api/user/get-all-users
 * @access  Private (Super Admin)
 */
router.get(
  "/get-all-users",
  encryptedAuthMiddleware,
  userController.getAllUsers,
);

module.exports = router;
