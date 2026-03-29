/**
 * @fileoverview Enhanced Robust controller for Mental Health Information Library
 * @module controllers/infoLibraryController
 */

const InformationLibrary = require("../../models/information-library-model/information.library.model");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../../utilities/cloudinary-utility/cloudinary.utility");

const {
  LIBRARY_CATEGORIES,
  FLAT_CATEGORIES,
} = require("../../constants/categories.constants");
const {
  formatArticleContent,
} = require("../../utilities/content-formatter-utility/content.formatter.utility");

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new library article with nested category validation
 * @access Private (Super Admin Only)
 */
exports.createArticle = async (req, res) => {
  let uploadedUrls = [];

  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "SuperAdmin access required",
      });
    }

    const { title, content, category, tags, readingTime, isPublished } =
      req.body;

    /* ---------------- VALIDATION ---------------- */
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and category are mandatory.",
      });
    }

    // Category Hierarchy Check
    const normalizedCategory = category.toUpperCase().trim();
    if (!FLAT_CATEGORIES.includes(normalizedCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category. Please choose from supported groups.",
        validCategories: LIBRARY_CATEGORIES, // Return nested list so admin knows what to pick
      });
    }

    /* ---------------- THUMBNAIL UPLOAD (MAX 3) ---------------- */
    let thumbnailUrls = [];
    if (req.files?.thumbnail && req.files.thumbnail.length > 0) {
      const filesToUpload = req.files.thumbnail.slice(0, 3);
      for (const file of filesToUpload) {
        const result = await uploadToCloudinary(file, "thumbnail");
        thumbnailUrls.push(result.url);
        uploadedUrls.push(result.url);
      }
    }

    /* ---------------- CREATE ARTICLE ---------------- */
    const article = new InformationLibrary({
      thumbnail: thumbnailUrls,
      title: title.trim(),
      content: formatArticleContent(content),
      category: normalizedCategory,
      tags: tags
        ? Array.isArray(tags)
          ? tags
          : tags.split(",").map((t) => t.trim())
        : [],
      readingTime: Number(readingTime) || 5,
      isPublished: isPublished === "true" || isPublished === true,
      addedBy: req.user.id,
    });

    await article.save();

    res.status(201).json({
      success: true,
      message: "Article published successfully",
      newArticle: article,
    });
  } catch (error) {
    if (uploadedUrls.length > 0) {
      for (const url of uploadedUrls) {
        await deleteFromCloudinary(url).catch((err) =>
          console.error("Cleanup Error:", err),
        );
      }
    }
    if (error.code === 11000)
      return res
        .status(400)
        .json({ success: false, message: "Duplicate title found." });
    res.status(500).json({
      success: false,
      message: "Failed to publish article",
      error: error.message,
    });
  }
};

/**
 * Get single article details
 * @param {string} articleId
 * @access Public
 */
exports.getArticleById = async (req, res) => {
  try {
    const article = await InformationLibrary.findById(req.params.articleId);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Article fetched successfully",
      article,
    });
  } catch (error) {
    console.error("Get article error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Update article details with category re-validation + thumbnail support
 * @access Private (Super Admin)
 */
exports.updateArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const updates = { ...req.body };

    // Category validation
    if (updates.category) {
      updates.category = updates.category.toUpperCase().trim();
      if (!FLAT_CATEGORIES.includes(updates.category)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid category update." });
      }
    }

    // Fetch existing article
    const existingArticle = await InformationLibrary.findById(articleId);
    if (!existingArticle) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }

    // ====================== THUMBNAIL UPDATE ======================
    if (req.files?.thumbnail && req.files.thumbnail.length > 0) {
      const uploadPromises = req.files.thumbnail.map(
        (file) => uploadToCloudinary(file, "thumbnail"), // ← Use "thumbnail" here
      );

      const uploadResults = await Promise.all(uploadPromises);
      const newThumbnailUrls = uploadResults.map((result) => result.url);

      // Delete old thumbnails
      if (existingArticle.thumbnail?.length > 0) {
        const deletePromises = existingArticle.thumbnail.map((url) =>
          deleteFromCloudinary(url).catch(console.error),
        );
        await Promise.all(deletePromises);
      }

      updates.thumbnail = newThumbnailUrls;
    }

    // ====================== UPDATE ARTICLE ======================
    const updatedArticle = await InformationLibrary.findByIdAndUpdate(
      articleId,
      { $set: updates },
      { new: true, runValidators: true },
    ).populate("addedBy", "userName bio profilePicture");

    if (!updatedArticle) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }

    res.status(200).json({
      success: true,
      message: "Article updated successfully",
      updatedArticle,
    });
  } catch (error) {
    console.error("Update Article Error:", error);
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

/**
 * Remove article and associated Cloudinary images
 */
exports.deleteArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const article = await InformationLibrary.findById(articleId);

    if (!article)
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });

    if (article.thumbnail?.length > 0) {
      for (const url of article.thumbnail) {
        await deleteFromCloudinary(url).catch((err) =>
          console.error("Cloudinary Error:", err),
        );
      }
    }

    await InformationLibrary.findByIdAndDelete(articleId);
    res
      .status(200)
      .json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// USER ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get library with nested category list support
 */
exports.getLibrary = async (req, res) => {
  try {
    const articles = await InformationLibrary.find()
      .populate("addedBy", "userName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Library fetched successfully",
      count: articles.length,
      allArticles: articles,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching library" });
  }
};

/**
 * Get single article by Slug
 */
exports.getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await InformationLibrary.findOneAndUpdate(
      { slug, isPublished: true },
      { $inc: { viewCount: 1 } },
      { new: true },
    ).populate("addedBy", "userName bio profilePicture");

    if (!article)
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    res.status(200).json({ success: true, article });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching article" });
  }
};

/**
 * Helper: Get just the category structure
 */
exports.getCategoryStructure = (req, res) => {
  res.status(200).json({ success: true, categories: LIBRARY_CATEGORIES });
};
