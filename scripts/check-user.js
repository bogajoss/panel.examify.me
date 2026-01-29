const { Client, Databases, Query } = require("node-appwrite");

const client = new Client()
  .setEndpoint("https://sgp.cloud.appwrite.io/v1")
  .setProject("695103540022da68cbb9")
  .setKey(
    "standard_98ab153bd8522e3fad12fc56435c49f24aa1e2551688c10b3de9b9c88b0a913cdf8890716f69824faa3c78586e98b7a70e5da161d786b49ae089bf20578741e8d5e3bb72e88a74f1fde8c03407f535bc00d1eeacd65de0f6e1ebef9b6cdea2ef4b341265d8b3d90ed0eb6c81f4a91d3cdf155ffefd081e57dd88c71a98c9f697",
  );

const databases = new Databases(client);

async function checkUser() {
  try {
    const result = await databases.listDocuments(
      "question-bank",
      "user-profiles",
      [Query.equal("username", "examify")],
    );

    if (result.documents.length === 0) {
      console.log("❌ User 'examify' not found.");
    } else {
      const user = result.documents[0];
      console.log("✅ User 'examify' found:");
      console.log(`   ID: ${user.$id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Password Field: ${user.password}`);
      console.log(`   PasswordHash Field: ${user.passwordHash}`);
      console.log(`   Role: ${user.role}`);

      if (user.password === "ex@mify26") {
        console.log("🎉 Password matches correctly in the database!");
      } else {
        console.log("❌ Password DOES NOT match!");
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

checkUser();
