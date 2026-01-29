"use server";

import {
  getDatabases,
  getStorage,
  appwriteConfig,
  ID,
  Query,
} from "./appwrite";
import { requireAuth, requireAdmin } from "./auth";
import { getImageUrl } from "./utils";
import type {
  QuestionFile,
  Question,
  ActionResponse,
  PaginatedResponse,
  ParsedQuestionRow,
  QuestionFilters,
  FileFilters,
} from "@/types";
import Papa from "papaparse";

// ============================================================================
// FILE OPERATIONS
// ============================================================================

export async function getFiles(
  filters: FileFilters = {},
): Promise<ActionResponse<PaginatedResponse<QuestionFile>>> {
  try {
    await requireAuth();

    const databases = await getDatabases();
    const {
      search = "",
      sortBy = "uploaded",
      sortOrder = "desc",
      page = 1,
      pageSize = 25,
    } = filters;

    const queries: string[] = [];

    // Search filter
    if (search) {
      queries.push(Query.search("displayName", search));
    }

    // Sorting
    switch (sortBy) {
      case "name":
        queries.push(
          sortOrder === "asc"
            ? Query.orderAsc("displayName")
            : Query.orderDesc("displayName"),
        );
        break;
      case "questions":
        queries.push(
          sortOrder === "asc"
            ? Query.orderAsc("totalQuestions")
            : Query.orderDesc("totalQuestions"),
        );
        break;
      default:
        queries.push(
          sortOrder === "asc"
            ? Query.orderAsc("uploadedAt")
            : Query.orderDesc("uploadedAt"),
        );
    }

    // Pagination
    const offset = (page - 1) * pageSize;
    queries.push(Query.limit(pageSize));
    queries.push(Query.offset(offset));

    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.files,
      queries,
    );

    return {
      success: true,
      data: {
        documents: response.documents as unknown as QuestionFile[],
        total: response.total,
        page,
        pageSize,
        totalPages: Math.ceil(response.total / pageSize),
      },
    };
  } catch (error) {
    console.error("Get files error:", error);
    return { success: false, error: "Failed to fetch files" };
  }
}

export async function getFileById(
  fileId: string,
): Promise<ActionResponse<QuestionFile>> {
  try {
    await requireAuth();

    const databases = await getDatabases();

    const file = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.files,
      fileId,
    );

    return { success: true, data: file as unknown as QuestionFile };
  } catch (error) {
    console.error("Get file error:", error);
    return { success: false, error: "File not found" };
  }
}

export async function createFile(
  originalFilename: string,
  displayName: string,
  storageFileId?: string,
): Promise<ActionResponse<QuestionFile>> {
  try {
    const { user } = await requireAdmin();

    const databases = await getDatabases();

    const file = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.files,
      ID.unique(),
      {
        originalFilename,
        displayName: displayName || originalFilename,
        storageFileId,
        totalQuestions: 0,
        uploadedBy: user.userId,
        uploadedAt: new Date().toISOString(),
      },
    );

    return { success: true, data: file as unknown as QuestionFile };
  } catch (error) {
    console.error("Create file error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create file";
    return { success: false, error: message };
  }
}

export async function updateFile(
  fileId: string,
  data: { displayName?: string; totalQuestions?: number },
): Promise<ActionResponse<QuestionFile>> {
  try {
    await requireAdmin();

    const databases = await getDatabases();

    const file = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.files,
      fileId,
      data,
    );

    return { success: true, data: file as unknown as QuestionFile };
  } catch (error) {
    console.error("Update file error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update file";
    return { success: false, error: message };
  }
}

export async function deleteFile(fileId: string): Promise<ActionResponse> {
  try {
    await requireAdmin();

    const databases = await getDatabases();
    const storage = await getStorage();

    // Get file to check for storage file
    const file = (await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.files,
      fileId,
    )) as unknown as QuestionFile;

    // Delete all questions for this file
    let hasMore = true;
    while (hasMore) {
      const questions = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.questions,
        [Query.equal("fileId", fileId), Query.limit(100)],
      );

      for (const q of questions.documents) {
        // Delete question images if any
        const question = q as unknown as Question;
        if (question.questionImageId) {
          try {
            await storage.deleteFile(
              appwriteConfig.buckets.questionImages,
              question.questionImageId,
            );
          } catch (e) {
            console.error("Error deleting question image:", e);
          }
        }
        if (question.explanationImageId) {
          try {
            await storage.deleteFile(
              appwriteConfig.buckets.questionImages,
              question.explanationImageId,
            );
          } catch (e) {
            console.error("Error deleting explanation image:", e);
          }
        }

        await databases.deleteDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.questions,
          q.$id,
        );
      }

      hasMore = questions.documents.length === 100;
    }

    // Delete storage file if exists
    if (file.storageFileId) {
      try {
        await storage.deleteFile(
          appwriteConfig.buckets.sourceFiles,
          file.storageFileId,
        );
      } catch (e) {
        console.error("Error deleting source file:", e);
      }
    }

    // Delete the file document
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.files,
      fileId,
    );

    return { success: true };
  } catch (error) {
    console.error("Delete file error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete file";
    return { success: false, error: message };
  }
}

// ============================================================================
// QUESTION OPERATIONS
// ============================================================================

export async function getQuestions(
  filters: QuestionFilters = {},
): Promise<ActionResponse<PaginatedResponse<Question>>> {
  try {
    await requireAuth();

    const databases = await getDatabases();
    const { fileId, section, type, search, page = 1, pageSize = 25 } = filters;

    const queries: string[] = [];

    if (fileId) {
      queries.push(Query.equal("fileId", fileId));
    }

    if (section && section !== "0") {
      queries.push(Query.equal("section", section));
    }

    if (type !== undefined) {
      queries.push(Query.equal("type", type));
    }

    if (search) {
      queries.push(Query.search("questionText", search));
    }

    // Order by orderIndex
    queries.push(Query.orderAsc("orderIndex"));

    // Pagination
    const offset = (page - 1) * pageSize;
    queries.push(Query.limit(pageSize));
    queries.push(Query.offset(offset));

    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.questions,
      queries,
    );

    return {
      success: true,
      data: {
        documents: response.documents as unknown as Question[],
        total: response.total,
        page,
        pageSize,
        totalPages: Math.ceil(response.total / pageSize),
      },
    };
  } catch (error) {
    console.error("Get questions error:", error);
    return { success: false, error: "Failed to fetch questions" };
  }
}

export async function getQuestionById(
  questionId: string,
): Promise<ActionResponse<Question>> {
  try {
    await requireAuth();

    const databases = await getDatabases();

    const question = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.questions,
      questionId,
    );

    return { success: true, data: question as unknown as Question };
  } catch (error) {
    console.error("Get question error:", error);
    return { success: false, error: "Question not found" };
  }
}

export async function createQuestion(
  fileId: string,
  data: Omit<Question, "$id" | "$createdAt" | "$updatedAt" | "fileId">,
): Promise<ActionResponse<Question>> {
  try {
    await requireAdmin();

    const databases = await getDatabases();

    const question = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.questions,
      ID.unique(),
      {
        fileId,
        ...data,
      },
    );

    // Update file question count
    const file = (await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.files,
      fileId,
    )) as unknown as QuestionFile;

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.files,
      fileId,
      {
        totalQuestions: file.totalQuestions + 1,
      },
    );

    return { success: true, data: question as unknown as Question };
  } catch (error) {
    console.error("Create question error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create question";
    return { success: false, error: message };
  }
}

export async function updateQuestion(
  questionId: string,
  data: Partial<Omit<Question, "$id" | "$createdAt" | "$updatedAt">>,
): Promise<ActionResponse<Question>> {
  try {
    await requireAdmin();

    const databases = await getDatabases();

    const question = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.questions,
      questionId,
      data,
    );

    return { success: true, data: question as unknown as Question };
  } catch (error) {
    console.error("Update question error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update question";
    return { success: false, error: message };
  }
}

export async function deleteQuestion(
  questionId: string,
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    const databases = await getDatabases();
    const storage = await getStorage();

    // Get the question first
    const question = (await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.questions,
      questionId,
    )) as unknown as Question;

    const fileId = question.fileId;

    // Delete associated images
    if (question.questionImageId) {
      try {
        await storage.deleteFile(
          appwriteConfig.buckets.questionImages,
          question.questionImageId,
        );
      } catch (e) {
        console.error("Error deleting question image:", e);
      }
    }
    if (question.explanationImageId) {
      try {
        await storage.deleteFile(
          appwriteConfig.buckets.questionImages,
          question.explanationImageId,
        );
      } catch (e) {
        console.error("Error deleting explanation image:", e);
      }
    }

    // Delete the question
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.questions,
      questionId,
    );

    // Update file question count
    const file = (await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.files,
      fileId,
    )) as unknown as QuestionFile;

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.files,
      fileId,
      {
        totalQuestions: Math.max(0, file.totalQuestions - 1),
      },
    );

    return { success: true };
  } catch (error) {
    console.error("Delete question error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete question";
    return { success: false, error: message };
  }
}

export async function reorderQuestions(
  fileId: string,
  questionIds: string[],
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    const databases = await getDatabases();

    // Update order index for each question
    for (let i = 0; i < questionIds.length; i++) {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.questions,
        questionIds[i],
        { orderIndex: i },
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Reorder questions error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to reorder questions";
    return { success: false, error: message };
  }
}

// ============================================================================
// CSV PARSING
// ============================================================================

interface CSVRow {
  questions?: string;
  question?: string;
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  option5?: string;
  answer?: string;
  explanation?: string;
  type?: string;
  section?: string;
  [key: string]: string | undefined;
}

export async function parseCSVContent(
  csvContent: string,
  convertZeroIndexed: boolean = false,
): Promise<ParsedQuestionRow[]> {
  return new Promise((resolve, reject) => {
    const questions: ParsedQuestionRow[] = [];

    Papa.parse<CSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().trim(),
      complete: (results) => {
        for (const row of results.data) {
          const questionText = row.questions || row.question || "";

          if (!questionText.trim()) continue;

          let answer = row.answer?.trim() || "";

          // Convert 0-indexed to 1-indexed if needed
          if (convertZeroIndexed && /^[0-4]$/.test(answer)) {
            answer = String(parseInt(answer, 10) + 1);
          }

          // Map section from number to code if needed
          let section = row.section?.trim() || "0";
          const sectionMap: Record<string, string> = {
            "1": "p",
            "2": "c",
            "3": "m",
            "4": "b",
          };
          if (sectionMap[section]) {
            section = sectionMap[section];
          }

          questions.push({
            questionText,
            option1: row.option1?.trim() || "",
            option2: row.option2?.trim() || "",
            option3: row.option3?.trim() || "",
            option4: row.option4?.trim() || "",
            option5: row.option5?.trim() || "",
            answer,
            explanation: row.explanation?.trim() || "",
            type: parseInt(row.type || "0", 10) || 0,
            section,
          });
        }

        resolve(questions);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

export async function uploadCSVFile(
  formData: FormData,
): Promise<ActionResponse<{ fileId: string; questionCount: number }>> {
  try {
    const { user } = await requireAdmin();

    const databases = await getDatabases();
    const storage = await getStorage();

    const file = formData.get("file") as File;
    const displayName = formData.get("displayName") as string;
    const convertZeroIndexed = formData.get("convertZeroIndexed") === "true";

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return { success: false, error: "Only CSV files are allowed" };
    }

    // Read file content
    const csvContent = await file.text();

    // Parse CSV
    const questions = await parseCSVContent(csvContent, convertZeroIndexed);

    if (questions.length === 0) {
      return { success: false, error: "No valid questions found in CSV" };
    }

    // Upload file to storage
    let storageFileId: string | undefined;
    try {
      const uploadedFile = await storage.createFile(
        appwriteConfig.buckets.sourceFiles,
        ID.unique(),
        file,
      );
      storageFileId = uploadedFile.$id;
    } catch (e) {
      console.error("Error uploading file to storage:", e);
    }

    // Create file record
    const fileRecord = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.files,
      ID.unique(),
      {
        originalFilename: file.name,
        displayName: displayName || file.name,
        storageFileId,
        totalQuestions: questions.length,
        uploadedBy: user.userId,
        uploadedAt: new Date().toISOString(),
      },
    );

    // Create questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.questions,
        ID.unique(),
        {
          fileId: fileRecord.$id,
          questionText: q.questionText,
          option1: q.option1,
          option2: q.option2,
          option3: q.option3,
          option4: q.option4,
          option5: q.option5,
          answer: q.answer,
          explanation: q.explanation,
          type: q.type,
          section: q.section,
          orderIndex: i,
        },
      );
    }

    return {
      success: true,
      data: {
        fileId: fileRecord.$id,
        questionCount: questions.length,
      },
    };
  } catch (error) {
    console.error("Upload CSV error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to upload CSV";
    return { success: false, error: message };
  }
}

export async function mergeCSVFile(
  fileId: string,
  formData: FormData,
): Promise<ActionResponse<{ questionCount: number }>> {
  try {
    await requireAdmin();

    const databases = await getDatabases();

    const file = formData.get("file") as File;
    const convertZeroIndexed = formData.get("convertZeroIndexed") === "true";

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return { success: false, error: "Only CSV files are allowed" };
    }

    // Get current max order index
    const existingQuestions = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.questions,
      [
        Query.equal("fileId", fileId),
        Query.orderDesc("orderIndex"),
        Query.limit(1),
      ],
    );

    const maxOrderIndex =
      existingQuestions.documents.length > 0
        ? (existingQuestions.documents[0] as unknown as Question).orderIndex
        : -1;

    // Read and parse CSV
    const csvContent = await file.text();
    const questions = await parseCSVContent(csvContent, convertZeroIndexed);

    if (questions.length === 0) {
      return { success: false, error: "No valid questions found in CSV" };
    }

    // Create questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.questions,
        ID.unique(),
        {
          fileId,
          questionText: q.questionText,
          option1: q.option1,
          option2: q.option2,
          option3: q.option3,
          option4: q.option4,
          option5: q.option5,
          answer: q.answer,
          explanation: q.explanation,
          type: q.type,
          section: q.section,
          orderIndex: maxOrderIndex + 1 + i,
        },
      );
    }

    // Update file question count
    const fileDoc = (await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.files,
      fileId,
    )) as unknown as QuestionFile;

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.files,
      fileId,
      {
        totalQuestions: fileDoc.totalQuestions + questions.length,
      },
    );

    return {
      success: true,
      data: {
        questionCount: questions.length,
      },
    };
  } catch (error) {
    console.error("Merge CSV error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to merge CSV";
    return { success: false, error: message };
  }
}

// ============================================================================
// IMAGE OPERATIONS
// ============================================================================

export async function uploadQuestionImage(
  formData: FormData,
): Promise<ActionResponse<{ fileId: string; url: string }>> {
  try {
    await requireAdmin();

    const storage = await getStorage();

    const file = formData.get("file") as File;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.",
      };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: "File size exceeds 5MB limit" };
    }

    const uploadedFile = await storage.createFile(
      appwriteConfig.buckets.questionImages,
      ID.unique(),
      file,
    );

    const url = getImageUrl(uploadedFile.$id);

    return {
      success: true,
      data: {
        fileId: uploadedFile.$id,
        url,
      },
    };
  } catch (error) {
    console.error("Upload image error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to upload image";
    return { success: false, error: message };
  }
}

export async function deleteQuestionImage(
  imageId: string,
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    const storage = await getStorage();

    await storage.deleteFile(appwriteConfig.buckets.questionImages, imageId);

    return { success: true };
  } catch (error) {
    console.error("Delete image error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete image";
    return { success: false, error: message };
  }
}
