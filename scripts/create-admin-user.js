#!/usr/bin/env node
/**
 * Create Admin User Script
 * Creates a test admin user in Appwrite
 */

require("dotenv").config({ path: ".env.local" });

const { Client, Account, Users } = require("node-appwrite");

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const users = new Users(client);

async function createAdminUser() {
  try {
    console.log("👤 Creating admin user...\n");

    const email = "examify@mify26.com";
    const password = "ex@mify26";
    const name = "Examify Admin";

    // Create user
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Password: ${password}`);
    console.log(`👤 Name: ${name}\n`);

    const user = await users.create(
      "unique()", // userId - auto-generate
      email,
      password,
      name,
    );

    console.log("✅ User created successfully!");
    console.log(`User ID: ${user.$id}\n`);
    console.log("🎉 You can now login with:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);

    process.exit(0);
  } catch (error) {
    if (error.code === 409) {
      console.log("ℹ️ User already exists with this email\n");
      console.log("🎉 You can login with:");
      console.log(`   Email: examify@mify26.com`);
      console.log(`   Password: ex@mify26\n`);
      process.exit(0);
    } else {
      console.error("❌ Error:", error.message);
      process.exit(1);
    }
  }
}

createAdminUser();
