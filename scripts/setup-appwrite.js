#!/usr/bin/env node
/**
 * Appwrite Database Setup Script
 * Automatically creates database, collections, attributes, and indexes
 * Run with: node scripts/setup-appwrite.js
 */

require("dotenv").config({ path: ".env.local" });

const { Client, Databases, Storage, Permission, Role } = require("node-appwrite");

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

const DATABASE_ID = "question-bank";
const COLLECTIONS = {
  USER_PROFILES: "user-profiles",
  FILES: "files",
  QUESTIONS: "questions",
};
const BUCKETS = {
  QUESTION_IMAGES: "question-images",
  SOURCE_FILES: "source-files",
};

async function setupDatabase() {
  try {
    console.log("🚀 Starting Appwrite database setup...\n");

    // Create database
    console.log(`📦 Creating database "${DATABASE_ID}"...`);
    try {
      await databases.create(DATABASE_ID, DATABASE_ID);
      console.log("✅ Database created\n");
    } catch (error) {
      if (error.code === 409) {
        console.log("ℹ️ Database already exists\n");
      } else {
        throw error;
      }
    }

    // Create User Profiles Collection
    console.log("📋 Creating User Profiles collection...");
    await createUserProfilesCollection();

    // Create Files Collection
    console.log("📋 Creating Files collection...");
    await createFilesCollection();

    // Create Questions Collection
    console.log("📋 Creating Questions collection...");
    await createQuestionsCollection();

    // Create Storage Buckets
    console.log("\n💾 Setting up storage buckets...");
    await createStorageBuckets();

    console.log("\n✨ Database setup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Setup failed:", error);
    process.exit(1);
  }
}

async function createUserProfilesCollection() {
  try {
    await databases.createCollection(
      DATABASE_ID,
      COLLECTIONS.USER_PROFILES,
      "User Profiles",
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]
    );
    console.log("✅ Collection created");
  } catch (error) {
    if (error.code !== 409) throw error;
    console.log("ℹ️ Collection already exists");
  }

  // Drop passwordHash attribute if it exists
  try {
    await databases.deleteAttribute(
      DATABASE_ID,
      COLLECTIONS.USER_PROFILES,
      "passwordHash"
    );
    console.log("  ✓ Dropped attribute: passwordHash");
  } catch (error) {
    // Ignore if attribute doesn't exist
  }

  // Add attributes
  const attributes = [
    {
      name: "userId",
      type: "string",
      required: true,
      size: 36,
    },
    {
      name: "username",
      type: "string",
      required: true,
      size: 255,
    },
    {
      name: "password",
      type: "string",
      required: true,
      size: 255,
    },
    {
      name: "name",
      type: "string",
      required: false,
      size: 255,
    },
    {
      name: "role",
      type: "enum",
      elements: ["admin", "user"],
      required: true,
    },
  ];

  for (const attr of attributes) {
    try {
      if (attr.type === "enum") {
        await databases.createEnumAttribute(
          DATABASE_ID,
          COLLECTIONS.USER_PROFILES,
          attr.name,
          attr.elements,
          attr.required
        );
      } else {
        await databases.createStringAttribute(
          DATABASE_ID,
          COLLECTIONS.USER_PROFILES,
          attr.name,
          attr.size,
          attr.required
        );
      }
      console.log(`  ✓ Added attribute: ${attr.name}`);
    } catch (error) {
      if (error.code === 409) {
        console.log(`  ℹ️ Attribute already exists: ${attr.name}`);
      } else {
        throw error;
      }
    }
  }

  // Create index for userId
  try {
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.USER_PROFILES,
      "userId_idx",
      "key",
      ["userId"]
    );
    console.log("  ✓ Created index on userId");
  } catch (error) {
    if (error.code !== 409) throw error;
    console.log("  ℹ️ Index already exists");
  }

  console.log();
}

async function createFilesCollection() {
  try {
    await databases.createCollection(
      DATABASE_ID,
      COLLECTIONS.FILES,
      "Question Files"
    );
    console.log("✅ Collection created");
  } catch (error) {
    if (error.code !== 409) throw error;
    console.log("ℹ️ Collection already exists");
  }

  // Add attributes
  const attributes = [
    { name: "originalFilename", type: "string", size: 255, required: true },
    { name: "displayName", type: "string", size: 255, required: false },
    { name: "storageFileId", type: "string", size: 36, required: false },
    { name: "totalQuestions", type: "integer", required: true, default: 0 },
    { name: "uploadedBy", type: "string", size: 36, required: true },
    { name: "uploadedAt", type: "datetime", required: true },
  ];

  for (const attr of attributes) {
    try {
      if (attr.type === "datetime") {
        await databases.createDatetimeAttribute(
          DATABASE_ID,
          COLLECTIONS.FILES,
          attr.name,
          attr.required
        );
      } else if (attr.type === "integer") {
        await databases.createIntegerAttribute(
          DATABASE_ID,
          COLLECTIONS.FILES,
          attr.name,
          attr.required,
          attr.default
        );
      } else {
        await databases.createStringAttribute(
          DATABASE_ID,
          COLLECTIONS.FILES,
          attr.name,
          attr.size,
          attr.required
        );
      }
      console.log(`  ✓ Added attribute: ${attr.name}`);
    } catch (error) {
      if (error.code === 409) {
        console.log(`  ℹ️ Attribute already exists: ${attr.name}`);
      } else {
        throw error;
      }
    }
  }

  // Create indexes
  const indexes = [
    { name: "uploadedBy_idx", attributes: ["uploadedBy"] },
    { name: "uploadedAt_idx", attributes: ["uploadedAt"] },
    { name: "displayName_search", attributes: ["displayName"] },
  ];

  for (const index of indexes) {
    try {
      await databases.createIndex(
        DATABASE_ID,
        COLLECTIONS.FILES,
        index.name,
        "key",
        index.attributes
      );
      console.log(`  ✓ Created index: ${index.name}`);
    } catch (error) {
      if (error.code !== 409) throw error;
      console.log(`  ℹ️ Index already exists: ${index.name}`);
    }
  }

  console.log();
}

async function createQuestionsCollection() {
  try {
    await databases.createCollection(
      DATABASE_ID,
      COLLECTIONS.QUESTIONS,
      "Questions"
    );
    console.log("✅ Collection created");
  } catch (error) {
    if (error.code !== 409) throw error;
    console.log("ℹ️ Collection already exists");
  }

  // Add attributes
  const attributes = [
    { name: "fileId", type: "string", size: 36, required: true },
    { name: "questionText", type: "string", size: 65535, required: true },
    { name: "option1", type: "string", size: 65535, required: false },
    { name: "option2", type: "string", size: 65535, required: false },
    { name: "option3", type: "string", size: 65535, required: false },
    { name: "option4", type: "string", size: 65535, required: false },
    { name: "option5", type: "string", size: 65535, required: false },
    { name: "answer", type: "string", size: 10, required: false },
    { name: "explanation", type: "string", size: 65535, required: false },
    { name: "questionImageId", type: "string", size: 36, required: false },
    { name: "explanationImageId", type: "string", size: 36, required: false },
    { name: "type", type: "integer", required: false, default: 0 },
    { name: "section", type: "string", size: 10, required: false, default: "0" },
    { name: "orderIndex", type: "integer", required: true, default: 0 },
  ];

  for (const attr of attributes) {
    try {
      if (attr.type === "integer") {
        await databases.createIntegerAttribute(
          DATABASE_ID,
          COLLECTIONS.QUESTIONS,
          attr.name,
          attr.required,
          attr.default
        );
      } else {
        await databases.createStringAttribute(
          DATABASE_ID,
          COLLECTIONS.QUESTIONS,
          attr.name,
          attr.size,
          attr.required,
          attr.default
        );
      }
      console.log(`  ✓ Added attribute: ${attr.name}`);
    } catch (error) {
      if (error.code === 409) {
        console.log(`  ℹ️ Attribute already exists: ${attr.name}`);
      } else {
        throw error;
      }
    }
  }

  // Create indexes
  const indexes = [
    { name: "fileId_idx", attributes: ["fileId"] },
    { name: "fileId_order_idx", attributes: ["fileId", "orderIndex"] },
    { name: "section_idx", attributes: ["section"] },
    { name: "type_idx", attributes: ["type"] },
  ];

  for (const index of indexes) {
    try {
      await databases.createIndex(
        DATABASE_ID,
        COLLECTIONS.QUESTIONS,
        index.name,
        "key",
        index.attributes
      );
      console.log(`  ✓ Created index: ${index.name}`);
    } catch (error) {
      if (error.code !== 409) throw error;
      console.log(`  ℹ️ Index already exists: ${index.name}`);
    }
  }

  console.log();
}

async function createStorageBuckets() {
  // Question Images Bucket
  console.log("📸 Creating Question Images bucket...");
  try {
    await storage.createBucket(
      BUCKETS.QUESTION_IMAGES,
      "Question Images",
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );
    console.log("✅ Question Images bucket created");
  } catch (error) {
    if (error.code === 409) {
      console.log("ℹ️ Question Images bucket already exists");
    } else {
      throw error;
    }
  }

  // Source Files Bucket
  console.log("📄 Creating Source Files bucket...");
  try {
    await storage.createBucket(
      BUCKETS.SOURCE_FILES,
      "Source Files",
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );
    console.log("✅ Source Files bucket created\n");
  } catch (error) {
    if (error.code === 409) {
      console.log("ℹ️ Source Files bucket already exists\n");
    } else {
      throw error;
    }
  }
}

// Run setup
setupDatabase();
