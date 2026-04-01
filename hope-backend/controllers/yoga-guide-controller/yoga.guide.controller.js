/**
 * @fileoverview Yoga Guide controller
 * @module controllers/yogaGuideController
 * @description Handles creation, retrieval, update, and deletion of yoga guides.
 */

const Yoga = require("../../models/yoga-guide-model/yoga.guide.model");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../../utilities/cloudinary-utility/cloudinary.utility");

/**
 * Create a new yoga guide
 * @access Private(Super Admin)
 */
exports.createYogaGuide = async (req, res) => {
  let uploadedImageUrl = null;
  let uploadedVideoUrl = null;

  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "SuperAdmin access required",
      });
    }

    const {
      title,
      description,
      category,
      difficultyLevel,
      durationMinutes,
      benefits,
      targetAreas,
      equipmentNeeded,
      instructions,
    } = req.body;

    /* ---------------- BASIC VALIDATION ---------------- */
    if (!title || !description || !category || !durationMinutes) {
      return res.status(400).json({
        success: false,
        message: "Title, description, category, and duration are required.",
      });
    }

    /* ---------------- COVER IMAGE UPLOAD ---------------- */
    let coverImage = null;
    if (req.files?.coverImage?.[0]) {
      const imageResult = await uploadToCloudinary(
        req.files.coverImage[0],
        "coverImage",
      );
      coverImage = imageResult.url;
      uploadedImageUrl = imageResult.url; // Tracked for cleanup
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Cover image is required" });
    }

    /* ---------------- OPTIONAL VIDEO UPLOAD ---------------- */
    let video = null;
    if (req.files?.video?.[0]) {
      const videoResult = await uploadToCloudinary(req.files.video[0], "video");
      video = videoResult.url;
      uploadedVideoUrl = videoResult.url;
    }

    /* ---------------- PARSE JSON ARRAYS ---------------- */
    // Helper to handle strings vs objects (common in multipart/form-data)
    const parseField = (field) =>
      typeof field === "string" ? JSON.parse(field || "[]") : field;

    /* ---------------- CREATE YOGA GUIDE ---------------- */
    const yogaGuide = new Yoga({
      title: title.trim(),
      description: description.trim(),
      category,
      difficultyLevel,
      durationMinutes: Number(durationMinutes),
      benefits: parseField(benefits),
      targetAreas: parseField(targetAreas),
      equipmentNeeded: parseField(equipmentNeeded),
      instructions: parseField(instructions),
      coverImage,
      video,
      isActive: true,
    });

    await yogaGuide.save();

    res.status(201).json({
      success: true,
      message: "Yoga guide created successfully",
      newYogaGuide: yogaGuide,
    });
  } catch (error) {
    /* ---------------- CLEANUP CLOUDINARY ON FAILURE ---------------- */
    // If DB fails, we don't want "zombie" images sitting in Cloudinary
    if (uploadedImageUrl)
      await deleteFromCloudinary(uploadedImageUrl).catch(console.error);
    if (uploadedVideoUrl)
      await deleteFromCloudinary(uploadedVideoUrl).catch(console.error);

    console.error("Create Yoga Guide error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create yoga guide",
      error: error.message,
    });
  }
};

/**
 * Get all yoga guides with advanced filtering, search, and pagination
 * @access Public/Private (Depending on your app flow)
 * @route GET /api/yoga/get-all-yoga-guides
 */
exports.getAllYogaGuides = async (req, res) => {
  try {
    const {
      category,
      difficultyLevel,
      search,
      page = 1,
      limit = 10,
      sort = "-createdAt", // Default to newest first
    } = req.query;

    // 1. Build dynamic filter object
    const filter = {};

    // Only show active guides by default
    filter.isActive = true;

    // Filter by Category (e.g., VINYASA, HATHA)
    if (category) {
      filter.category = category;
    }

    // Filter by Difficulty (e.g., BEGINNER)
    if (difficultyLevel) {
      filter.difficultyLevel = difficultyLevel;
    }

    // Keyword Search (Search in Title or Description)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // 2. Pagination Logic
    const skip = (Number(page) - 1) * Number(limit);

    // 3. Database Query
    // Optimization: .select() excludes heavy 'instructions' and 'benefits' for the list view
    const [guides, total] = await Promise.all([
      Yoga.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
      Yoga.countDocuments(filter),
    ]);

    // 4. Response with Metadata
    res.status(200).json({
      success: true,
      message: "Yoga guides fetched successfully",
      count: guides.length,
      meta: {
        totalGuides: total,
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
      allYogaGuides: guides,
    });
  } catch (error) {
    console.error("Get All Yoga Guides Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch yoga guides",
      error: error.message,
    });
  }
};

/**
 * Get single product details
 * @param {string} productId
 * @access Public
 */
exports.getYogaGuideById = async (req, res) => {
  try {
    const yogaGuide = await Yoga.findById(req.params.yogaId);

    if (!yogaGuide) {
      return res.status(404).json({
        success: false,
        message: "Yoga guide not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Yoga guide fetched successfully",
      yogaGuide,
    });
  } catch (error) {
    console.error("Get yoga guide error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Update an existing yoga guide
 * @access Private(Super Admin)
 * @route PATCH /api/yoga/update-yoga-guide/:yogaId
 */
exports.updateYogaGuide = async (req, res) => {
  let newImageUrl = null;
  let newVideoUrl = null;
  const { yogaId } = req.params;

  try {
    // 1. Authorization Check
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // 2. Find existing guide
    const existingGuide = await Yoga.findById(yogaId);
    if (!existingGuide) {
      return res
        .status(404)
        .json({ success: false, message: "Yoga guide not found" });
    }

    // 3. Handle Media Updates (Cloudinary)
    // Update Cover Image
    if (req.files?.coverImage?.[0]) {
      const imageResult = await uploadToCloudinary(
        req.files.coverImage[0],
        "coverImage",
      );
      newImageUrl = imageResult.url;

      // Delete old image from Cloudinary after successful new upload
      if (existingGuide.coverImage) {
        await deleteFromCloudinary(existingGuide.coverImage).catch(
          console.error,
        );
      }
      existingGuide.coverImage = newImageUrl;
    }

    // Update Video
    if (req.files?.video?.[0]) {
      const videoResult = await uploadToCloudinary(req.files.video[0], "video");
      newVideoUrl = videoResult.url;

      if (existingGuide.video) {
        await deleteFromCloudinary(existingGuide.video).catch(console.error);
      }
      existingGuide.video = newVideoUrl;
    }

    // 4. Parse and Update Text/Array Fields
    const parseField = (field) =>
      typeof field === "string" ? JSON.parse(field || "[]") : field;

    const updatableFields = [
      "title",
      "description",
      "category",
      "difficultyLevel",
      "durationMinutes",
    ];

    // Update simple fields
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        existingGuide[field] =
          field === "durationMinutes"
            ? Number(req.body[field])
            : req.body[field];
      }
    });

    // Update Array/JSON fields
    if (req.body.benefits)
      existingGuide.benefits = parseField(req.body.benefits);
    if (req.body.targetAreas)
      existingGuide.targetAreas = parseField(req.body.targetAreas);
    if (req.body.equipmentNeeded)
      existingGuide.equipmentNeeded = parseField(req.body.equipmentNeeded);
    if (req.body.instructions)
      existingGuide.instructions = parseField(req.body.instructions);

    // 5. Save Changes
    const updatedGuide = await existingGuide.save();

    res.status(200).json({
      success: true,
      message: "Yoga guide updated successfully",
      updatedYogaGuide: updatedGuide,
    });
  } catch (error) {
    // ---------------- ROLLBACK ----------------
    // If DB save fails, delete the NEWLY uploaded files so they don't become "zombies"
    if (newImageUrl)
      await deleteFromCloudinary(newImageUrl).catch(console.error);
    if (newVideoUrl)
      await deleteFromCloudinary(newVideoUrl).catch(console.error);

    console.error("Update Yoga Guide error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update yoga guide",
      error: error.message,
    });
  }
};

/**
 * Delete a yoga guide and its associated media
 * @access Private(Super Admin)
 * @route DELETE /api/yoga/delete/:id
 */
exports.deleteYogaGuide = async (req, res) => {
  try {
    const { yogaId } = req.params;

    // 1. Authorization Check
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. SuperAdmin privileges required.",
      });
    }

    // 2. Find the guide first to get the Cloudinary URLs
    const guide = await Yoga.findById(yogaId);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Yoga guide not found.",
      });
    }

    /* ---------------- MEDIA CLEANUP ---------------- */
    // We use Promise.allSettled so that even if one deletion fails,
    // the others continue and the DB record still gets deleted.
    const cleanupTasks = [];

    if (guide.coverImage) {
      cleanupTasks.push(deleteFromCloudinary(guide.coverImage));
    }

    if (guide.video) {
      cleanupTasks.push(deleteFromCloudinary(guide.video));
    }

    // If your schema has step images in the instructions array:
    if (guide.instructions && guide.instructions.length > 0) {
      guide.instructions.forEach((step) => {
        if (step.stepImageUrl) {
          cleanupTasks.push(deleteFromCloudinary(step.stepImageUrl));
        }
      });
    }

    // Execute Cloudinary deletions in the background
    await Promise.allSettled(cleanupTasks);

    // 3. Delete the record from MongoDB
    await Yoga.findByIdAndDelete(yogaId);

    res.status(200).json({
      success: true,
      message: "Yoga guide deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Yoga Guide Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete yoga guide.",
      error: error.message,
    });
  }
};
