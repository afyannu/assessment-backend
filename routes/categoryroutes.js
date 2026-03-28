const express = require("express");
const router = express.Router();
const Category = require("../models/category");
const upload = require("../config/multer");

// CREATE
router.post("/", upload("categories").single("image"), async (req, res) => {
  try {
    const category = await Category.create({
      name: req.body.name,
      description: req.body.description,
      parentCategory: req.body.parentCategory || null,
      status: req.body.status === "true",
      image: req.file ? req.file.path : "",
    });

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ALL
router.get("/", async (req, res) => {
  const categories = await Category.find()
    .populate("parentCategory", "name")
    .sort({ createdAt: -1 });

  res.json(categories);
});
// GET single category by ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "parentCategory",
      "name"
    );
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// DELETE
router.delete("/:id", async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});
router.put("/:id", upload("categories").single("image"), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      parentCategory: req.body.parentCategory || null,
      status: req.body.status === "true",
    };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;