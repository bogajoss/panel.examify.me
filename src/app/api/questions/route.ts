import { NextRequest, NextResponse } from "next/server";
import { getDatabases, appwriteConfig, Query } from "@/lib/appwrite";
import { getImageUrl } from "@/lib/utils";
import { Question, QuestionFile } from "@/types";

/**
 * Mapping function to transform Appwrite Question document to PHP-style API format
 */
function mapQuestionToPhpStyle(q: Question) {
  return {
    id: q.$id,
    file_id: q.fileId,
    question_text: q.questionText,
    option1: q.option1,
    option2: q.option2,
    option3: q.option3,
    option4: q.option4,
    option5: q.option5,
    answer: q.answer,
    explanation: q.explanation,
    question_image: q.questionImageId || null,
    explanation_image: q.explanationImageId || null,
    question_image_url: q.questionImageId ? getImageUrl(q.questionImageId) : "",
    explanation_image_url: q.explanationImageId
      ? getImageUrl(q.explanationImageId)
      : "",
    type: q.type,
    section: q.section,
    order_index: q.orderIndex,
    created_at: q.$createdAt,
  };
}

/**
 * Mapping function to transform Appwrite File document to PHP-style API format
 */
function mapFileToPhpStyle(f: QuestionFile) {
  return {
    id: f.$id,
    original_filename: f.originalFilename,
    uploaded_at: f.uploadedAt,
    total_questions: f.totalQuestions,
    display_name: f.displayName || f.originalFilename,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const route = searchParams.get("route");

    // 1. Validate Token
    const secretToken =
      process.env.API_SECRET_TOKEN || "antigravity_secret_2026";
    if (!token || token !== secretToken) {
      return NextResponse.json(
        { error: "Invalid or missing API Token" },
        { status: 401 },
      );
    }

    const databases = await getDatabases();

    // 2. Route Request
    switch (route) {
      case "files": {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.files,
          [Query.orderDesc("uploadedAt"), Query.limit(100)],
        );
        const files = (response.documents as unknown as QuestionFile[]).map(
          mapFileToPhpStyle,
        );
        return NextResponse.json(files);
      }

      case "questions": {
        const fileId = searchParams.get("file_id");
        const queries: string[] = [
          Query.orderAsc("orderIndex"),
          Query.limit(500),
        ];

        if (fileId) {
          queries.push(Query.equal("fileId", fileId));
        }

        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.questions,
          queries,
        );
        const questions = (response.documents as unknown as Question[]).map(
          mapQuestionToPhpStyle,
        );
        return NextResponse.json(questions);
      }

      case "question": {
        const id = searchParams.get("id");
        if (!id) {
          return NextResponse.json(
            { error: "Missing question ID" },
            { status: 400 },
          );
        }

        try {
          const question = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.questions,
            id,
          );
          return NextResponse.json(
            mapQuestionToPhpStyle(question as unknown as Question),
          );
        } catch (error) {
          return NextResponse.json(
            { error: "Question not found" },
            { status: 404 },
          );
        }
      }

      default:
        return NextResponse.json(
          { error: "Route not found or not specified" },
          { status: 404 },
        );
    }
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const route = searchParams.get("route");

    // 1. Validate Token
    const secretToken =
      process.env.API_SECRET_TOKEN || "antigravity_secret_2026";
    if (!token || token !== secretToken) {
      return NextResponse.json(
        { error: "Invalid or missing API Token" },
        { status: 401 },
      );
    }

    if (route !== "update-question") {
      return NextResponse.json(
        { error: "Invalid route for POST" },
        { status: 400 },
      );
    }

    const input = await req.json();
    const id = input.id;

    if (!id) {
      return NextResponse.json(
        { error: "Missing question ID" },
        { status: 400 },
      );
    }

    const databases = await getDatabases();

    // Mapping PHP fields back to Appwrite fields
    const updateData: any = {};
    if (input.question_text !== undefined)
      updateData.questionText = input.question_text;
    if (input.option1 !== undefined) updateData.option1 = input.option1;
    if (input.option2 !== undefined) updateData.option2 = input.option2;
    if (input.option3 !== undefined) updateData.option3 = input.option3;
    if (input.option4 !== undefined) updateData.option4 = input.option4;
    if (input.option5 !== undefined) updateData.option5 = input.option5;
    if (input.answer !== undefined) updateData.answer = input.answer;
    if (input.explanation !== undefined)
      updateData.explanation = input.explanation;
    if (input.type !== undefined) updateData.type = Number(input.type);
    if (input.section !== undefined) updateData.section = String(input.section);

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.questions,
      id,
      updateData,
    );

    return NextResponse.json({ success: true, message: "Question updated" });
  } catch (error: any) {
    console.error("API POST Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
