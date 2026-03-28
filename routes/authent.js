const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const Customer = require("../models/customer");
const Manager = require("../models/manager")
const Role = require("../models/role");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client("130435756271-svq0d55hfp7cmnk5dgo9un8n7vb1r02h.apps.googleusercontent.com");

async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: "130435756271-svq0d55hfp7cmnk5dgo9un8n7vb1r02h.apps.googleusercontent.com",
  });

  return ticket.getPayload();
}
// REGISTER
const { body, validationResult } = require("express-validator");

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).withMessage("Minimum 6 characters"),
    body("pincode").isLength({ min: 6, max: 6 }).withMessage("Invalid pincode"),
  ],
  async (req, res) => {
    try {
      // validation check
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, email, password, phone, states, cities, pincode } = req.body;

      // check existing customer
      const existing = await Customer.findOne({ email });
      if (existing) return res.status(400).json({ message: "Email already exists" });

      // get customer role (case-insensitive)
      const customerRole = await Role.findOne({ name: { $regex: /^customer$/i } });
      if (!customerRole) return res.status(500).json({ message: "Customer role not found" });

      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // create customer
      const customer = await Customer.create({
        name,
        email,
        password: hashedPassword,
        phone,
        states, // must match schema
        cities, // must match schema
        pincode,
        role: customerRole._id,
      });

      res.status(201).json({
        message: "Customer registered successfully",
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
        },
      });

    } catch (error) {
      console.error("Register Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);
// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if email/password provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    let account = null;
    let type = "";

    // 🔹 Check Admin
    account = await Admin.findOne({ email }).populate("role");
    if (account) type = "admin";

    // 🔹 Check Manager
    if (!account) {
      account = await Manager.findOne({ email }).populate("role");
      if (account) type = "manager";
    }

    // 🔹 Check Customer
    if (!account) {
      account = await Customer.findOne({ email }).populate("role");
      if (account) type = "customer";
    }

    // 🔹 Account not found
    if (!account) {
      return res.status(400).json({ message: "Account not found" });
    }

    if (account.provider === "google") {
      return res.status(400).json({
        message: "Please login using Google",
      });
    }
    // 🔹 Compare password
    const isMatch = await bcrypt.compare(password, account.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 🔹 JWT payload
    const payload = {
      _id: account._id,
      role: account.role?.name || "N/A",
      type: type,
      name: account.name,                // ✅ ADD
      email: account.email,              // ✅ ADD
      profileImage: account.profileImage || "", // ✅ ADD
      coverImage: account.coverImage || "",     // ✅ ADD
    };

    // 🔹 Generate token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    // 🔹 Send response
    res.status(200).json({
      token,
      user: {
        id: account._id,
        name: account.name,
        email: account.email,
        role: account.role?.name,
        permissions: account.role?.permissions || {}
      }
    });

  }
  catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    const userInfo = await verifyGoogleToken(token);

    let account = null;
    let type = "";

    // 🔹 Check Admin
    account = await Admin.findOne({ email: userInfo.email }).populate("role");
    if (account) type = "admin";

    // 🔹 Check Manager
    if (!account) {
      account = await Manager.findOne({ email: userInfo.email }).populate("role");
      if (account) type = "manager";
    }

    // 🔹 Check Customer
    if (!account) {
      account = await Customer.findOne({ email: userInfo.email }).populate("role");
      if (account) type = "customer";
    }

    let profileImage = "";

    // ✅ ONLY download image if NEW user
    if (!account && userInfo.picture) {
      let imageUrl = userInfo.picture;

      if (imageUrl.includes("googleusercontent")) {
        imageUrl = imageUrl.split("=")[0] + "=s400-c";
      }

      const filename = `google_${Date.now()}.jpg`;
      const filepath = path.join(__dirname, "../uploads/profiles", filename);

      const response = await axios({
        url: imageUrl,
        method: "GET",
        responseType: "stream",
      });

      await new Promise((resolve, reject) => {
        const stream = response.data.pipe(fs.createWriteStream(filepath));
        stream.on("finish", resolve);
        stream.on("error", reject);
      });

      profileImage = filename;
    }

    // 🔹 Create new user
    if (!account) {
      const customerRole = await Role.findOne({ name: { $regex: /^customer$/i } });

      account = await Customer.create({
        name: userInfo.name || "No Name",
        email: userInfo.email || "No Email",
        password: "",
        role: customerRole?._id || null,
        provider: "google",
        profileImage: profileImage, // ✅ LOCAL image
      });

      type = "customer";
      await account.populate("role");
    }

    // 🔹 JWT
    const payload = {
      _id: account._id,
      role: account.role?.name || "N/A",
      type,
      name: account.name,
      email: account.email,
      profileImage: account.profileImage || "",
      coverImage: account.coverImage || "",
      permissions: account.role?.permissions || {},
    };

    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token: jwtToken,
      user: {
        id: account._id,
        name: account.name,
        email: account.email,
        profileImage: account.profileImage || "",
        coverImage: account.coverImage || "",
        role: account.role?.name || "N/A",
        permissions: account.role?.permissions || {},
      },
    });

  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(401).json({ message: "Invalid Google Token" });
  }
});

module.exports = router;