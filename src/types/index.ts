import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

export const UserRole = {
  ADMIN: "admin",
  USER: "user",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const SectionType = {
  NONE: "0",
  PHYSICS: "p",
  CHEMISTRY: "c",
  MATH: "m",
  BIOLOGY: "b",
  BIO_MATH: "bm",
  BIO_NON_BIO: "bn",
  ENGLISH: "e",
  ICT: "i",
  GENERAL_KNOWLEDGE: "gk",
  IQ_TEST: "iq",
} as const;

export type SectionTypeValue = (typeof SectionType)[keyof typeof SectionType];

export const SECTION_LABELS: Record<SectionTypeValue, string> = {
  "0": "None",
  p: "Physics",
  c: "Chemistry",
  m: "Math",
  b: "Biology",
  bm: "Bio + Math",
  bn: "Bio + Non-Bio",
  e: "English",
  i: "ICT",
  gk: "General Knowledge",
  iq: "IQ Test",
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert numeric answer (1-5) to letter (A-E)
 */
export function answerToLetter(answer: string | number): string {
  const num = typeof answer === "string" ? parseInt(answer, 10) : answer;
  if (isNaN(num) || num < 1 || num > 5) return String(answer);
  return String.fromCharCode(64 + num); // 1=A, 2=B, etc.
}

/**
 * Convert letter answer (A-E) to number (1-5)
 */
export function letterToAnswer(letter: string): string {
  const upper = letter.toUpperCase();
  if (upper >= "A" && upper <= "E") {
    return String(upper.charCodeAt(0) - 64);
  }
  return letter;
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const questionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  option1: z.string(),
  option2: z.string(),
  option3: z.string(),
  option4: z.string(),
  option5: z.string(),
  answer: z.string(),
  explanation: z.string(),
  type: z.number().int(),
  section: z.string(),
});

export const fileUploadSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  convertZeroIndexed: z.boolean(),
});

export const fileUpdateSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
});

// ============================================================================
// INFERRED TYPES
// ============================================================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type QuestionFormData = z.infer<typeof questionSchema>;
export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
export type FileUpdateFormData = z.infer<typeof fileUpdateSchema>;

// ============================================================================
// DATABASE DOCUMENT TYPES
// ============================================================================

export interface UserProfile {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  role: UserRoleType;
}

export interface QuestionFile {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  originalFilename: string;
  displayName?: string;
  storageFileId?: string;
  totalQuestions: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Question {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  fileId: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  option5: string;
  answer: string;
  explanation: string;
  questionImageId?: string;
  explanationImageId?: string;
  type: number;
  section: string;
  orderIndex: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  documents: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// PARSED CSV ROW
// ============================================================================

export interface ParsedQuestionRow {
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  option5: string;
  answer: string;
  explanation: string;
  type: number;
  section: string;
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

export interface QuestionFilters {
  fileId?: string;
  section?: SectionTypeValue;
  type?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface FileFilters {
  search?: string;
  sortBy?: "name" | "uploaded" | "questions";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}
