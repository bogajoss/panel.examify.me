const { Client, Databases, ID, Query } = require("node-appwrite");

const client = new Client();

const endpoint = "https://sgp.cloud.appwrite.io/v1";
const projectId = "695103540022da68cbb9";
const databaseId = "question-bank";
const userProfilesId = "user-profiles";
const apiKey = "standard_98ab153bd8522e3fad12fc56435c49f24aa1e2551688c10b3de9b9c88b0a913cdf8890716f69824faa3c78586e98b7a70e5da161d786b49ae089bf20578741e8d5e3bb72e88a74f1fde8c03407f535bc00d1eeacd65de0f6e1ebef9b6cdea2ef4b341265d8b3d90ed0eb6c81f4a91d3cdf155ffefd081e57dd88c71a98c9f697";

if (!endpoint || !projectId || !databaseId || !userProfilesId || !apiKey) {
  console.error("Missing environment variables");
  process.exit(1);
}

client.setEndpoint(endpoint).setProject(projectId).setKey(apiKey);

const databases = new Databases(client);

async function updateSchema() {
  try {
    console.log("Updating user-profiles schema...");

    // Try to add username attribute
    try {
      console.log("Adding username attribute...");
      await databases.createStringAttribute(
        databaseId,
        userProfilesId,
        "username",
        255,
        true // required
      );
      console.log("✓ Added username attribute");

      // Create unique index for username
      await databases.createIndex(
        databaseId,
        userProfilesId,
        "username_unique",
        "unique",
        ["username"]
      );
      console.log("✓ Created username unique index");
    } catch (err) {
      if (err.message.includes("Attribute already exists")) {
        console.log("✓ Username attribute already exists");
      } else {
        throw err;
      }
    }

    // Try to add password attribute
    try {
      console.log("Adding password attribute...");
      await databases.createStringAttribute(
        databaseId,
        userProfilesId,
        "password",
        512,
        true // required
      );
      console.log("✓ Added password attribute");
    } catch (err) {
      if (err.message.includes("Attribute already exists")) {
        console.log("✓ password attribute already exists");
      } else {
        throw err;
      }
    }

    // Try to add name attribute
    try {
      console.log("Adding name attribute...");
      await databases.createStringAttribute(
        databaseId,
        userProfilesId,
        "name",
        255,
        false // not required
      );
      console.log("✓ Added name attribute");
    } catch (err) {
      if (err.message.includes("Attribute already exists")) {
        console.log("✓ name attribute already exists");
      } else {
        throw err;
      }
    }

    console.log("\n✓ Schema update complete!");
  } catch (error) {
    console.error("Schema update failed:", error);
    process.exit(1);
  }
}

async function createAdminUser() {
  try {
    console.log("\nCreating admin user...");

    const username = "examify";
    const password = "ex@mify26";
    const name = "Examify Admin";

    // Use raw plaintext password as requested
    const plaintextPassword = password;

    // Check if user exists
    try {
      const result = await databases.listDocuments(databaseId, userProfilesId, [
        Query.equal("username", username),
      ]);

      if (result.documents.length > 0) {
        console.log("✓ Admin user already exists, updating password...");
        await databases.updateDocument(
          databaseId,
          userProfilesId,
          result.documents[0].$id,
          {
            password: plaintextPassword,
          }
        );
        console.log("✓ Admin password updated to plaintext successfully!");
        return;
      }
    } catch (err) {
      // Collection might not have data yet, that's fine
    }

    // Create admin user
    const userId = ID.unique();
    const newUser = await databases.createDocument(
      databaseId,
      userProfilesId,
      userId,
      {
        userId,  // Include the userId field for compatibility
        username,
        password: plaintextPassword,
        name,
        role: "admin",
        createdAt: new Date().toISOString(),
      }
    );

    console.log("✓ Admin user created successfully!");
    console.log(`  Username: ${username}`);
    console.log(`  Password: ${password}`);
    console.log(`  User ID: ${user.$id}`);
  } catch (error) {
    console.error("Admin user creation failed:", error);
    process.exit(1);
  }
}

async function main() {
  await updateSchema();
  await createAdminUser();
  console.log("\n✅ All done!");
}

main();
