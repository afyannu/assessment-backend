const express = require("express");
const router = express.Router();
const Blog = require("../models/blog");
const upload = require("../config/multer")

/* ================= CREATE BLOG ================= */

router.post("/", upload("blogs").single("image"), async (req, res) => {
  try {
    const blog = new Blog({
      title: req.body.title,
      description: req.body.description,
      content: req.body.content,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      status: req.body.status,
      image: req.file ? req.file.path : "",
    });

    await blog.save();

    res.json({ message: "Blog created", blog });
  } catch (error) {
  console.log("BLOG ERROR:", error);
  res.status(500).json({ message: error.message });
}
});

/* ================= GET BLOGS ================= */

router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
  console.log("BLOG ERROR:", error);
  res.status(500).json({ message: error.message });
}
});

router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (err) {
    console.error(err);
    // Handle invalid ObjectId
    if (err.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid blog ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", upload("blogs").single("image"), async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      content: req.body.content,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      status: req.body.status,
    };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after" }
    );

    res.json(blog);
  }catch (error) {
  console.log("BLOG ERROR:", error);
  res.status(500).json({ message: error.message });
}
});

/* ================= DELETE BLOG ================= */

router.delete("/:id", async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Blog deleted" });
  }catch (error) {
  console.log("BLOG ERROR:", error);
  res.status(500).json({ message: error.message });
}
});

module.exports = router;