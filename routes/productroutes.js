const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const upload = require("../config/multer");
const Category = require("../models/category");
// CREATE
router.post("/", upload("products").single("image"), async (req, res) => {
  const product = await Product.create({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    stock: req.body.stock,
    category: req.body.category,
    status: req.body.status,
    image: req.file ? req.file.path : "",
  });

  res.json(product);
});

// GET
router.get("/", async (req, res) => {
  const products = await Product.find()
    .populate("category", "name")
    .sort({ createdAt: -1 });

  res.json(products);
});
// GET single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// DELETE
router.delete("/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// router.get("/category/:categoryId", async (req, res) => {
//   try {
//     const products = await Product.find({
//       category: req.params.categoryId,
//     }).populate("category");

//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

router.get("/category/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    // find child categories
    const childCategories = await Category.find({
      parentCategory: categoryId,
    });

    const childIds = childCategories.map((c) => c._id);

    const products = await Product.find({
      category: { $in: [categoryId, ...childIds] },
    }).populate("category");

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", upload("products").single("image"), async (req, res) => {

  try {

    const updateData = {
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      description: req.body.description,
      stock:req.body.stock
    };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after" }
    );

    res.json(updatedProduct);

  } catch (err) {
    res.status(500).json(err);
  }

});

module.exports = router;