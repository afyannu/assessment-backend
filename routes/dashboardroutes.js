const express = require("express");
const router = express.Router();
const Admin = require("../models/admin");
const Manager = require("../models/manager");
const Customer = require("../models/customer");
const Product = require("../models/product");
const Category = require("../models/category");

// GET /api/stats
router.get("/", async (req, res) => {
  try {
    const [admins, managers, customers, products, categories] = await Promise.all([
      Admin.countDocuments(),
      Manager.countDocuments(),
      Customer.countDocuments(),
      Product.countDocuments(),
      Category.find() // we need category names to count products per category
    ]);

    // Count products per category
    // const categoryStats = await Promise.all(
    //   categories.map(async (cat) => {
    //     const count = await Product.countDocuments({ category: cat._id });
    //     return { name: cat.name, count };
    //   })
    // );
    
const categoryStats = await Product.aggregate([
  {
    $group: {
      _id: "$category",
      count: { $sum: 1 }
    }
  },
  {
    $lookup: {
      from: "categories",
      localField: "_id",
      foreignField: "_id",
      as: "category"
    }
  },
  {
    $unwind: "$category"
  },
  {
    $project: {
      name: "$category.name",
      count: 1
    }
  }
]);
const productStats = await Product.aggregate([
  {
    $group: {
      _id: { $month: "$createdAt" },
      count: { $sum: 1 }
    }
  },
  { $sort: { "_id": 1 } }
]);
    res.json({
      users: admins + managers, // total users
      admins,
      managers,
      customers,
      products,
      categories: categories.length,
      categoryStats,
      productStats
    });



    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;