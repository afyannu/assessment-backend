require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
const app = express();
const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://your-vercel-app.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
const Role = require("./models/role");
const State = require("./models/states");
const City = require("./models/city");
const bcrypt = require("bcryptjs");
const Admin = require("./models/admin")
const Rolesroutes = require("./routes/roleroutes");
const Adminroutes = require("./routes/adminroutes");
const Managerroutes = require("./routes/managerroutes")
const Customerroutes = require("./routes/customerroutes");
const Locationroutes = require("./routes/locationroutes");
const Categoryroutes = require("./routes/categoryroutes");
const Productroutes = require("./routes/productroutes");
const Blogroutes = require("./routes/blogroutes");
const Dashboardroutes = require("./routes/dashboardroutes");  
const Usersroute = require("./routes/users");
const Profileroutes = require("./routes/profileroutes");
const Activityroutes = require("./routes/activityroutes");
const createDefaultAdmin = async () => {
  try {

    // 1️⃣ Check or create Super Admin role with permissions
    let superRole = await Role.findOne({ name: "Super Admin" });

    if (!superRole) {
      superRole = await Role.create({
        name: "Super Admin",
        permissions: {
          users: { view: true, add: true, edit: true, delete: true },
          customers: { view: true, add: true, edit: true, delete: true },
          category: { view: true, add: true, edit: true, delete: true },
          products: { view: true, add: true, edit: true, delete: true },
          blog: { view: true, add: true, edit: true, delete: true }
        }
      });

      console.log("Super Admin role created with permissions");
    }

    // 2️⃣ Check if admin exists
    const existingAdmin = await Admin.findOne({ email: "super@gmail.com" });

    if (existingAdmin) {
      console.log("Super Admin already exists");
      return;
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash("Super@123", 10);

    // 4️⃣ Create Super Admin
    await Admin.create({
      name: "Super Admin",
      email: "super@gmail.com",
      password: hashedPassword,
      role: superRole._id
    });

    console.log("Default Super Admin created");

  } catch (error) {
    console.error("Super Admin creation error:", error);
  }
};

const seedLocation = async () => {
  const count = await State.countDocuments();
  if (count === 0) {
    const tamil = await State.create({ name: "Tamil Nadu" });
    const kerala = await State.create({ name: "Kerala" });

    await City.insertMany([
      { name: "Chennai", state: tamil._id },
      { name: "Coimbatore", state: tamil._id },
      { name: "Madurai", state: tamil._id },
      { name: "Kochi", state: kerala._id },
      { name: "Trivandrum", state: kerala._id },
    ]);

    console.log("States & Cities Auto Inserted");
  }
};
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

console.log("===== SERVER STARTING =====");
app.get("/api/test", (req, res) => res.send("Server works"));

app.use("/api/auth", require("./routes/authent"));
app.use("/api/roles", require("./routes/roleroutes"));
app.use("/api/admins", require("./routes/adminroutes"));
app.use("/api/managers", require("./routes/managerroutes"));
app.use("/api/customers", require("./routes/customerroutes"));
app.use("/api/location", require("./routes/locationroutes"));
app.use("/api/categories", require("./routes/categoryroutes"));
app.use("/api/products", require("./routes/productroutes"));
app.use("/api/blogs", require("./routes/blogroutes"));
app.use("/api/stats", require("./routes/dashboardroutes"));

// ✅ Important: profile routes mounted under /api/users
app.use("/api/users/profile", require("./routes/profileroutes")); // /profile

app.use("/api/users", require("./routes/users"));           // /all, /:id

// Activities
app.use("/api/users/profile/activity", require("./routes/activityroutes"));

// Static uploads
app.use("/uploads", express.static("uploads"));

//Render port
connectDB().then(async() => {
  const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  await seedLocation(); 
  await createDefaultAdmin();
});
