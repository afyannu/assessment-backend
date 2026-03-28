const mongoose = require("mongoose");
const Role = require("./models/role"); // make sure this path points to your Role model

// Replace 'yourDB' with the actual database name you use in MongoDB
mongoose.connect("mongodb://localhost:27017/authdb")

async function ensureCustomerRole() {
  try {
    const role = await Role.findOne({ name: "customer" }); // lowercase
    if (!role) {
      await Role.create({ name: "customer", permissions: {} });
      console.log("Customer role created");
    } else {
      console.log("Customer role already exists");
    }
  } catch (error) {
    console.error("Error seeding role:", error);
  } finally {
    mongoose.disconnect();
  }
}

ensureCustomerRole();