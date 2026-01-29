# AntiGravity Question Bank

A modern question bank management system built with Next.js 16, TypeScript, Tailwind CSS, and Appwrite.

## Features

- 🔐 **Authentication**: Email/password login with Appwrite Auth
- 👥 **Role-based Access**: Admin and User roles with different permissions
- 📁 **File Management**: Upload, rename, merge, and delete question banks
- ❓ **Question Management**: Full CRUD operations for questions
- 🖼️ **Image Support**: Upload images for questions and explanations
- 📊 **CSV Import**: Parse and import questions from CSV files
- 🔍 **Search & Filter**: Search questions and filter by section/type
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Appwrite (Auth, Database, Storage)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Appwrite Cloud account or self-hosted instance

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up Appwrite:
   - Follow the instructions in [APPWRITE_SETUP.md](./APPWRITE_SETUP.md)

4. Create environment variables:
```bash
cp .env.local.example .env.local
```

5. Update `.env.local` with your Appwrite credentials.

6. Run the development server:
```bash
pnpm dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── admin/          # Admin-only pages
│   │   ├── files/          # File management pages
│   │   └── questions/      # Question pages
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── layout.tsx          # Root layout
├── components/
│   ├── files/              # File-related components
│   ├── forms/              # Form components
│   ├── layout/             # Layout components (Navbar, Footer)
│   ├── questions/          # Question-related components
│   └── ui/                 # Reusable UI components
├── context/
│   └── AuthContext.tsx     # Authentication context
├── lib/
│   ├── appwrite.ts         # Appwrite client configuration
│   ├── auth.ts             # Authentication functions
│   ├── actions.ts          # Server actions for CRUD operations
│   └── utils.ts            # Utility functions
├── types/
│   └── index.ts            # TypeScript type definitions
└── middleware.ts           # Auth middleware
```

## Available Scripts

```bash
# Development
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## CSV Format

Upload CSV files with these columns:

| Column | Description | Required |
|--------|-------------|----------|
| questions | Question text (HTML) | Yes |
| option1-5 | Answer options | No |
| answer | Correct answer (1-5) | No |
| explanation | Explanation (HTML) | No |
| type | Question type (int) | No |
| section | Section code | No |

### Section Codes

- `p` - Physics
- `c` - Chemistry
- `m` - Math
- `b` - Biology
- `e` - English
- `gk` - General Knowledge

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Appwrite API endpoint |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | Appwrite project ID |
| `NEXT_PUBLIC_APPWRITE_DATABASE_ID` | Database ID |
| `NEXT_PUBLIC_APPWRITE_*_COLLECTION_ID` | Collection IDs |
| `NEXT_PUBLIC_APPWRITE_*_BUCKET_ID` | Storage bucket IDs |

## License

MIT
