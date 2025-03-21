require("dotenv").config();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const dbConnection = require("../db/Connection");
const User = require("../models/user");

async function createAdmin() {
  try {
    await dbConnection();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error("Admin email or password is not defined in .env");
    }

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin user already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const adminUser = new User({
      full_name: "Admin",
      person_number: "0000",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      is_approved: true,
    });

    await adminUser.save();
    console.log("Admin user created successfully.");
  } catch (err) {
    console.error("Error seeding admin user:", err.message || err);
  } finally {
    mongoose.connection.close();
  }
}

module.exports = createAdmin;
