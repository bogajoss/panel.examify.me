# Appwrite Setup Guide

This document provides step-by-step instructions to set up Appwrite for the AntiGravity Question Bank application.

## Prerequisites

- An Appwrite Cloud account or self-hosted Appwrite instance (v1.4+)
- Access to Appwrite Console

## Step 1: Create a Project

1. Log in to Appwrite Console
2. Click "Create Project"
3. Name: `AntiGravity Question Bank`
4. Copy the **Project ID** for later use

## Step 2: Enable Authentication

1. Go to **Auth** → **Settings**
2. Enable **Email/Password** authentication

## Step 3: Create Database

1. Go to **Databases** → **Create Database**
2. Database ID: `question-bank` (or use auto-generated)
3. Name: `Question Bank`

## Step 4: Create Collections

### 4.1 User Profiles Collection

1. Create collection with ID: `user-profiles`
2. Name: `User Profiles`

**Attributes:**
| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| userId | String | 36 | Yes | - |
| role | Enum | - | Yes | - |

For the `role` enum, add values: `admin`, `user`

**Indexes:**
| Key | Type | Attributes |
|-----|------|------------|
| userId_unique | Unique | userId |

**Permissions:**

- Read: `any` (or `users` for authenticated only)
- Create: `users`
- Update: `users`

### 4.2 Files Collection

1. Create collection with ID: `files`
2. Name: `Files`

**Attributes:**
| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| originalFilename | String | 255 | Yes | - |
| displayName | String | 255 | No | - |
| storageFileId | String | 36 | No | - |
| totalQuestions | Integer | - | Yes | 0 |
| uploadedBy | String | 36 | Yes | - |
| uploadedAt | Datetime | - | Yes | - |

**Indexes:**
| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| uploadedBy_idx | Key | uploadedBy | ASC |
| uploadedAt_idx | Key | uploadedAt | DESC |
| displayName_search | Fulltext | displayName | - |

**Permissions:**

- Read: `any` (or `users` for authenticated only)
- Create: `users`
- Update: `users`
- Delete: `users`

### 4.3 Questions Collection

1. Create collection with ID: `questions`
2. Name: `Questions`

**Attributes:**
| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| fileId | String | 36 | Yes | - |
| questionText | String | 65535 | Yes | - |
| option1 | String | 65535 | No | - |
| option2 | String | 65535 | No | - |
| option3 | String | 65535 | No | - |
| option4 | String | 65535 | No | - |
| option5 | String | 65535 | No | - |
| answer | String | 10 | No | - |
| explanation | String | 65535 | No | - |
| questionImageId | String | 36 | No | - |
| explanationImageId | String | 36 | No | - |
| type | Integer | - | No | 0 |
| section | String | 10 | No | 0 |
| orderIndex | Integer | - | Yes | 0 |

**Indexes:**
| Key | Type | Attributes | Order |
|-----|------|------------|-------|
| fileId_idx | Key | fileId | ASC |
| fileId_order_idx | Key | fileId, orderIndex | ASC |
| section_idx | Key | section | ASC |
| type_idx | Key | type | ASC |
| questionText_search | Fulltext | questionText | - |

**Permissions:**

- Read: `any` (or `users` for authenticated only)
- Create: `users`
- Update: `users`
- Delete: `users`

## Step 5: Create Storage Buckets

### 5.1 Question Images Bucket

1. Go to **Storage** → **Create Bucket**
2. Bucket ID: `question-images`
3. Name: `Question Images`
4. Allowed file extensions: `jpg`, `jpeg`, `png`, `gif`, `webp`
5. Maximum file size: `5000000` (5MB)
6. Encryption: Enabled
7. Antivirus: Enabled (if available)

**Permissions:**

- Read: `any`
- Create: `users`
- Update: `users`
- Delete: `users`

### 5.2 Source Files Bucket

1. Go to **Storage** → **Create Bucket**
2. Bucket ID: `source-files`
3. Name: `Source Files`
4. Allowed file extensions: `csv`
5. Maximum file size: `10000000` (10MB)

**Permissions:**

- Read: `users`
- Create: `users`
- Update: `users`
- Delete: `users`

## Step 6: Create API Key (Optional - for server operations)

1. Go to **Project Settings** → **API Keys**
2. Click **Create API Key**
3. Name: `Server Key`
4. Scopes:
   - `databases.read`
   - `databases.write`
   - `documents.read`
   - `documents.write`
   - `files.read`
   - `files.write`
   - `users.read`
5. Copy the API Key secret

## Step 7: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=question-bank

# Collection IDs
NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID=user-profiles
NEXT_PUBLIC_APPWRITE_FILES_COLLECTION_ID=files
NEXT_PUBLIC_APPWRITE_QUESTIONS_COLLECTION_ID=questions

# Storage Bucket IDs
NEXT_PUBLIC_APPWRITE_QUESTION_IMAGES_BUCKET_ID=question-images
NEXT_PUBLIC_APPWRITE_SOURCE_FILES_BUCKET_ID=source-files

# Server-side API Key (optional)
APPWRITE_API_KEY=your-api-key
```

## Step 8: Create Admin User

1. Register a new user through the app
2. In Appwrite Console, go to **Databases** → **question-bank** → **user-profiles**
3. Find the user profile document
4. Update the `role` field from `user` to `admin`

## Security Considerations

### For Production:

1. **Restrict Permissions**: Update collection permissions to be more restrictive:
   - Files: Only admins can create/update/delete
   - Questions: Only admins can create/update/delete
   - Use Appwrite Teams or Labels for role-based access

2. **Enable HTTPS**: Always use HTTPS in production

3. **Rate Limiting**: Configure rate limits in Appwrite Console

4. **Backup**: Set up regular database backups

### Permission Examples (More Secure):

For admin-only write operations:

```
Read: any
Create: team:admins
Update: team:admins
Delete: team:admins
```

## Troubleshooting

### Common Issues:

1. **"Collection not found"**: Verify collection IDs match in `.env.local`
2. **"Unauthorized"**: Check session cookie and permissions
3. **"File too large"**: Increase bucket file size limit
4. **"Invalid file type"**: Add file extension to bucket allowed list

### Debug Mode:

Enable debug logging by adding to your API calls:

```typescript
console.log("Appwrite Config:", appwriteConfig);
```

## CSV Format

The application expects CSV files with these columns:

| Column      | Description                     | Required |
| ----------- | ------------------------------- | -------- |
| questions   | Question text (HTML allowed)    | Yes      |
| option1     | First option                    | No       |
| option2     | Second option                   | No       |
| option3     | Third option                    | No       |
| option4     | Fourth option                   | No       |
| option5     | Fifth option                    | No       |
| answer      | Correct answer (1-5 or A-E)     | No       |
| explanation | Explanation text (HTML allowed) | No       |
| type        | Question type (integer)         | No       |
| section     | Section code (p, c, m, b, etc.) | No       |

### Section Codes:

- `0` - None
- `p` - Physics
- `c` - Chemistry
- `m` - Math
- `b` - Biology
- `bm` - Bio + Math
- `bn` - Bio + Non-Bio
- `e` - English
- `i` - ICT
- `gk` - General Knowledge
- `iq` - IQ Test
