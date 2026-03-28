require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const State = require("../models/states");
const City = require("../models/city");

const seedData = async () => {
  try {
    await connectDB();

    console.log("Connected to DB...");

    // Clear existing data (optional)
    await State.deleteMany({});
    await City.deleteMany({});

    // Create States
    const tamil = await State.create({ name: "Tamil Nadu" });
    const kerala = await State.create({ name: "Kerala" });

    // Create Cities
    await City.insertMany([
      { name: "Chennai", state: tamil._id },
      { name: "Coimbatore", state: tamil._id },
      { name: "Madurai", state: tamil._id },
      { name: "Kochi", state: kerala._id },
      { name: "Trivandrum", state: kerala._id }
    ]);

    console.log("✅ States & Cities Seeded Successfully");

    process.exit();

  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedData();