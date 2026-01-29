import {
  Client,
  Account,
  Databases,
  Storage,
  ID,
  Query,
  type Models,
} from "node-appwrite";

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

const requiredEnvVars = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  userProfilesCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID,
  filesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_FILES_COLLECTION_ID,
  questionsCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_QUESTIONS_COLLECTION_ID,
  questionImagesBucketId:
    process.env.NEXT_PUBLIC_APPWRITE_QUESTION_IMAGES_BUCKET_ID,
  sourceFilesBucketId: process.env.NEXT_PUBLIC_APPWRITE_SOURCE_FILES_BUCKET_ID,
} as const;

// Validate all required env vars are present
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    console.warn(
      `Missing environment variable for ${key}. Please check your .env.local file.`,
    );
  }
}

// ============================================================================
// APPWRITE CONFIG
// ============================================================================

export const appwriteConfig = {
  endpoint: requiredEnvVars.endpoint || "https://cloud.appwrite.io/v1",
  projectId: requiredEnvVars.projectId || "",
  databaseId: requiredEnvVars.databaseId || "",
  collections: {
    userProfiles: requiredEnvVars.userProfilesCollectionId || "user-profiles",
    files: requiredEnvVars.filesCollectionId || "files",
    questions: requiredEnvVars.questionsCollectionId || "questions",
  },
  buckets: {
    questionImages: requiredEnvVars.questionImagesBucketId || "question-images",
    sourceFiles: requiredEnvVars.sourceFilesBucketId || "source-files",
  },
} as const;

// ============================================================================
// CLIENT INITIALIZATION
// ============================================================================

let client: Client | null = null;
let serverClient: Client | null = null;

export function getClient(): Client {
  if (!client) {
    client = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId);
  }
  return client;
}

export function getServerClient(): Client {
  if (!serverClient) {
    const c = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId);

    if (process.env.APPWRITE_API_KEY) {
      c.setKey(process.env.APPWRITE_API_KEY);
    }
    serverClient = c;
  }
  return serverClient;
}

export function getAccount(): Account {
  return new Account(getClient());
}

export function getDatabases(): Databases {
  // Use server client with API key if on server
  if (typeof window === "undefined" && process.env.APPWRITE_API_KEY) {
    return new Databases(getServerClient());
  }
  return new Databases(getClient());
}

export function getStorage(): Storage {
  // Use server client with API key if on server
  if (typeof window === "undefined" && process.env.APPWRITE_API_KEY) {
    return new Storage(getServerClient());
  }
  return new Storage(getClient());
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export async function setSession(session: string): Promise<void> {
  const client = getClient();
  client.setSession(session);
}

export function createSessionClient(session: string): {
  account: Account;
  databases: Databases;
  storage: Storage;
} {
  const sessionClient = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setSession(session);

  return {
    account: new Account(sessionClient),
    databases: new Databases(sessionClient),
    storage: new Storage(sessionClient),
  };
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

export { ID, Query };
export type { Models };
