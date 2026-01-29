const { Client, Databases, ID, Query } = require("node-appwrite");

const client = new Client();

const endpoint = "https://sgp.cloud.appwrite.io/v1";
const projectId = "695103540022da68cbb9";
const databaseId = "question-bank";
const userProfilesId = "user-profiles";
const apiKey =
  "standard_98ab153bd8522e3fad12fc56435c49f24aa1e2551688c10b3de9b9c88b0a913cdf8890716f69824faa3c78586e98b7a70e5da161d786b49ae089bf20578741e8d5e3bb72e88a74f1fde8c03407f535bc00d1eeacd65de0f6e1ebef9b6cdea2ef4b341265d8b3d90ed0eb6c81f4a91d3cdf155ffefd081e57dd88c71a98c9f697";

client.setEndpoint(endpoint).setProject(projectId).setKey(apiKey);

const databases = new Databases(client);

async function createAdminUser() {
  try {
    console.log("Creating admin user...");

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
          },
        );
        console.log("✓ Admin password updated to plaintext successfully!");
        return;
      }
    } catch (err) {
      // Collection might not have data yet, that's fine
    }

    // Create user in database
    const userId = ID.unique();
    const newUser = await databases.createDocument(
      databaseId,
      userProfilesId,
      userId,
      {
        userId, // Include the userId field for compatibility
        username,
        password: plaintextPassword,
        name,
        role: "admin",
      },
    );

    console.log("✓ Admin user created successfully!");
    console.log(`  Username: ${username}`);
    console.log(`  Password: ${password}`);
    console.log(`  User ID: ${newUser.$id}`);
  } catch (error) {
    console.error("Admin user creation failed:", error);
    process.exit(1);
  }
}

createAdminUser();
