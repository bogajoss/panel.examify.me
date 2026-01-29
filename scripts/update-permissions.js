const { Client, Databases, Permission, Role } = require("node-appwrite");

const client = new Client()
  .setEndpoint("https://sgp.cloud.appwrite.io/v1")
  .setProject("695103540022da68cbb9")
  .setKey(
    "standard_98ab153bd8522e3fad12fc56435c49f24aa1e2551688c10b3de9b9c88b0a913cdf8890716f69824faa3c78586e98b7a70e5da161d786b49ae089bf20578741e8d5e3bb72e88a74f1fde8c03407f535bc00d1eeacd65de0f6e1ebef9b6cdea2ef4b341265d8b3d90ed0eb6c81f4a91d3cdf155ffefd081e57dd88c71a98c9f697",
  );

const databases = new Databases(client);

async function updatePermissions() {
  try {
    console.log("Updating USER_PROFILES permissions...");
    await databases.updateCollection(
      "question-bank",
      "user-profiles",
      "User Profiles",
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ],
    );
    console.log("✅ USER_PROFILES permissions updated!");

    console.log("Updating FILES permissions...");
    await databases.updateCollection(
      "question-bank",
      "files",
      "Question Files",
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ],
    );
    console.log("✅ FILES permissions updated!");

    console.log("Updating QUESTIONS permissions...");
    await databases.updateCollection(
      "question-bank",
      "questions",
      "Questions",
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ],
    );
    console.log("✅ QUESTIONS permissions updated!");
  } catch (error) {
    console.error("Error:", error);
  }
}

updatePermissions();
