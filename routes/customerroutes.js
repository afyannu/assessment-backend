const express = require("express");
const router = express.Router();
const Customer = require("../models/customer");

// GET All Customers
router.get("/", async (req, res) => {
  const customers = await Customer.find()
    .populate("states", "name")
      .populate("cities", "name");
  res.json(customers);
});

router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate("states", "name")
      .populate("cities", "name");

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE Customer
router.post("/", async (req, res) => {
  const customer = await Customer.create(req.body);
  res.json(customer);
});

// DELETE Customer
router.delete("/:id", async (req, res) => {
  await Customer.findByIdAndDelete(req.params.id);
  res.json({ message: "Customer deleted" });
});
// UPDATE Customer
router.put("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // returns the updated document
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;