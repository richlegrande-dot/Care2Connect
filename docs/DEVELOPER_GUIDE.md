# CareConnect Developer Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure](#project-structure)
4. [Backend Development](#backend-development)
5. [Frontend Development](#frontend-development)
6. [Database Management](#database-management)
7. [API Integration](#api-integration)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Contributing](#contributing)
11. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **PostgreSQL** 14.x or higher
- **Git** for version control

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Care2system
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Setup environment variables**
   ```bash
   # Backend (.env)
   cp .env.example .env
   
   # Frontend (.env.local)
   cp .env.example .env.local
   ```

4. **Setup database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start development servers**
   ```bash
   # Backend (in one terminal)
   cd backend
   npm run dev
   
   # Frontend (in another terminal)
   cd frontend
   npm run dev
   ```

## Development Environment Setup

### Required Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/careconnect_dev"

# OpenAI API
OPENAI_API_KEY="sk-your-openai-api-key"

# API Keys
INDEED_API_KEY="your-indeed-api-key"
ADZUNA_APP_ID="your-adzuna-app-id"
ADZUNA_API_KEY="your-adzuna-api-key"
FINDHELP_API_KEY="your-findhelp-api-key"

# Server Configuration
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET="your-jwt-secret-key"
ENCRYPTION_KEY="your-32-byte-encryption-key"

# File Storage
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=52428800  # 50MB in bytes

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN="http://localhost:3000"

# Audio Processing
MAX_AUDIO_DURATION=600  # 10 minutes in seconds
SUPPORTED_AUDIO_FORMATS="mp3,wav,m4a,ogg"
```

#### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANONYMOUS_MODE=true
NEXT_PUBLIC_ENABLE_DONATIONS=true
NEXT_PUBLIC_ENABLE_JOB_SEARCH=true

# Analytics (optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your-ga-id
NEXT_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token

# Environment
NODE_ENV=development
```

### Database Setup

1. **Install PostgreSQL**
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql postgresql-contrib`

2. **Create database**
   ```sql
   createdb careconnect_dev
   createdb careconnect_test
   ```

3. **Run migrations**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```

4. **Seed database (optional)**
   ```bash
   npx prisma db seed
   ```

### IDE Configuration

#### VS Code Extensions
- **Prisma** - Database schema and query support
- **Thunder Client** - API testing
- **TypeScript Importer** - Auto import management
- **Tailwind CSS IntelliSense** - CSS class completion
- **ES7+ React/Redux/React-Native snippets** - React shortcuts

#### VS Code Settings
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.prisma": "prisma"
  }
}
```

## Project Structure

```
Care2system/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Custom middleware
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions
│   │   └── app.ts             # Express app configuration
│   ├── prisma/                # Database schema and migrations
│   ├── uploads/               # File upload storage
│   ├── tests/                 # Backend tests
│   └── package.json
├── frontend/                   # Next.js React application
│   ├── app/                   # Next.js 14 App Router
│   │   ├── (routes)/          # Route groups
│   │   ├── components/        # Reusable React components
│   │   ├── providers/         # Context providers
│   │   └── globals.css        # Global styles
│   ├── public/                # Static assets
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   ├── types/                 # TypeScript types
│   └── package.json
├── docs/                      # Documentation
├── docker-compose.yml         # Docker configuration
└── README.md
```

## Backend Development

### Architecture Overview

The backend follows a layered architecture:

```
Controller → Service → Repository → Database
```

#### Controllers
Handle HTTP requests and responses:

```typescript
// src/controllers/ProfileController.ts
export class ProfileController {
  async createProfile(req: Request, res: Response) {
    try {
      const profile = await ProfileService.createProfile(req.body);
      res.status(201).json({ success: true, data: profile });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
```

#### Services
Contain business logic:

```typescript
// src/services/ProfileService.ts
export class ProfileService {
  static async createProfile(data: CreateProfileData) {
    // Validate data
    const validatedData = ProfileValidator.validate(data);
    
    // Extract profile information using AI
    const extractedData = await AIService.extractProfileData(
      validatedData.transcript
    );
    
    // Save to database
    return await prisma.profile.create({
      data: { ...validatedData, ...extractedData }
    });
  }
}
```

#### Routes
Define API endpoints:

```typescript
// src/routes/profileRoutes.ts
const router = express.Router();
const controller = new ProfileController();

router.post('/', controller.createProfile);
router.get('/:id', controller.getProfile);
router.put('/:id', controller.updateProfile);

export default router;
```

### Adding New Features

1. **Create the database model** in `prisma/schema.prisma`
2. **Run migration**: `npx prisma migrate dev`
3. **Create service** in `src/services/`
4. **Create controller** in `src/controllers/`
5. **Add routes** in `src/routes/`
6. **Register routes** in `src/app.ts`
7. **Add types** in `src/types/`
8. **Write tests** in `tests/`

### Database Queries

Use Prisma for type-safe database operations:

```typescript
// Find user with profiles
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    profiles: true,
    messages: {
      orderBy: { createdAt: 'desc' },
      take: 10
    }
  }
});

// Create profile with transaction
const result = await prisma.$transaction(async (tx) => {
  const profile = await tx.profile.create({ data: profileData });
  await tx.user.update({
    where: { id: userId },
    data: { hasProfile: true }
  });
  return profile;
});
```

### Error Handling

Use custom error classes:

```typescript
// src/utils/errors.ts
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// In controllers
try {
  const result = await service.doSomething();
} catch (error) {
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }
  // Handle other errors...
}
```

### Middleware

#### Authentication Middleware
```typescript
// src/middleware/auth.ts
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  
  req.user = { id: userId };
  next();
};
```

#### Validation Middleware
```typescript
// src/middleware/validation.ts
export const validateSchema = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};
```

## Frontend Development

### Next.js 14 App Router

The frontend uses Next.js 14 with the App Router:

```typescript
// app/page.tsx - Home page
export default function HomePage() {
  return (
    <div>
      <h1>Welcome to CareConnect</h1>
      <AudioRecorder />
    </div>
  );
}

// app/profile/[id]/page.tsx - Dynamic route
export default function ProfilePage({ params }: { params: { id: string } }) {
  return <ProfileView profileId={params.id} />;
}
```

### State Management

Use React Query for server state and Context for client state:

```typescript
// lib/api.ts
export const useProfile = (profileId: string) => {
  return useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => api.profile.get(profileId),
    enabled: !!profileId
  });
};

// providers/UserProvider.tsx
const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
```

### Component Structure

#### Atomic Design Pattern
```
components/
├── ui/                    # Basic UI components (Button, Input, etc.)
├── forms/                 # Form components
├── features/              # Feature-specific components
│   ├── audio/            # Audio recording components
│   ├── profile/          # Profile components
│   ├── chat/            # Chat components
│   └── jobs/            # Job search components
└── layout/               # Layout components
```

#### Example Component
```typescript
// components/features/audio/AudioRecorder.tsx
'use client';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  maxDuration?: number;
}

export function AudioRecorder({ onRecordingComplete, maxDuration = 600 }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        onRecordingComplete(event.data);
      }
    };
    
    setMediaRecorder(recorder);
    recorder.start();
    setIsRecording(true);
  };
  
  return (
    <div className="audio-recorder">
      <Button 
        onClick={isRecording ? stopRecording : startRecording}
        variant={isRecording ? "destructive" : "default"}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>
    </div>
  );
}
```

### Styling with Tailwind CSS

#### Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
};
```

#### Component Styling
```typescript
// Use Tailwind classes for styling
<div className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
  <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile</h2>
  <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
</div>
```

### Forms and Validation

Use React Hook Form with validation:

```typescript
// components/forms/ProfileForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().max(500, 'Bio must be under 500 characters'),
  skills: z.array(z.string()).min(1, 'At least one skill required')
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm({ onSubmit }: { onSubmit: (data: ProfileFormData) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Name" />
      {errors.name && <span className="error">{errors.name.message}</span>}
      
      <textarea {...register('bio')} placeholder="Bio" />
      {errors.bio && <span className="error">{errors.bio.message}</span>}
      
      <button type="submit">Save Profile</button>
    </form>
  );
}
```

## Database Management

### Schema Design

The database uses PostgreSQL with Prisma ORM:

```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  anonymous Boolean  @default(true)
  location  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  profiles   Profile[]
  messages   Message[]
  audioFiles AudioFile[]
  
  @@map("users")
}

model Profile {
  id              String   @id @default(cuid())
  userId          String
  name            String
  bio             String?
  skills          String[]
  urgentNeeds     String[]
  longTermGoals   String[]
  donationPitch   String?
  cashtag         String?
  gofundmeUrl     String?
  isProfilePublic Boolean  @default(false)
  viewCount       Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("profiles")
}
```

### Migrations

Create and run migrations:

```bash
# Create a new migration
npx prisma migrate dev --name add_new_field

# Reset database (development only)
npx prisma migrate reset

# Deploy to production
npx prisma migrate deploy
```

### Seeding

Create seed data for development:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      anonymous: false,
      location: 'San Francisco, CA',
      profiles: {
        create: {
          name: 'John Doe',
          bio: 'Experienced construction worker looking for opportunities',
          skills: ['construction', 'painting', 'carpentry'],
          urgentNeeds: ['housing', 'employment'],
          longTermGoals: ['stable housing', 'full-time job'],
          isProfilePublic: true
        }
      }
    }
  });
  
  console.log('Seed data created');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Database Queries

#### Common Patterns

```typescript
// Find with pagination
const profiles = await prisma.profile.findMany({
  where: { isProfilePublic: true },
  include: { user: { select: { location: true } } },
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * limit,
  take: limit
});

// Search with full-text search
const searchResults = await prisma.profile.findMany({
  where: {
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { bio: { contains: query, mode: 'insensitive' } },
      { skills: { hasSome: query.split(' ') } }
    ]
  }
});

// Aggregate data
const stats = await prisma.profile.aggregate({
  _count: { id: true },
  _avg: { viewCount: true },
  where: { isProfilePublic: true }
});
```

## API Integration

### HTTP Client Setup

Create a typed API client:

```typescript
// lib/api-client.ts
class APIClient {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // Profile methods
  profile = {
    get: (id: string) => this.request<ProfileResponse>(`/profile/${id}`),
    create: (data: CreateProfileData) => 
      this.request<ProfileResponse>('/profile', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id: string, data: UpdateProfileData) =>
      this.request<ProfileResponse>(`/profile/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
  };
  
  // Other API methods...
}

export const api = new APIClient(process.env.NEXT_PUBLIC_API_URL!);
```

### React Query Integration

```typescript
// hooks/useProfile.ts
export function useProfile(profileId: string) {
  return useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => api.profile.get(profileId),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.profile.create,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    }
  });
}
```

### Error Handling

```typescript
// lib/error-handler.ts
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    switch (error.status) {
      case 400:
        toast.error('Please check your input and try again');
        break;
      case 401:
        toast.error('Please log in to continue');
        break;
      case 403:
        toast.error('You do not have permission to perform this action');
        break;
      case 404:
        toast.error('The requested resource was not found');
        break;
      case 429:
        toast.error('Too many requests. Please try again later');
        break;
      default:
        toast.error('An unexpected error occurred');
    }
  }
}
```

## Testing

### Backend Testing

#### Unit Tests with Jest
```typescript
// tests/services/ProfileService.test.ts
import { ProfileService } from '../../src/services/ProfileService';
import { prismaMock } from '../__mocks__/prisma';

describe('ProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('createProfile', () => {
    it('should create a profile successfully', async () => {
      const mockProfile = {
        id: 'profile-123',
        name: 'John Doe',
        bio: 'Test bio'
      };
      
      prismaMock.profile.create.mockResolvedValue(mockProfile);
      
      const result = await ProfileService.createProfile({
        userId: 'user-123',
        name: 'John Doe',
        bio: 'Test bio'
      });
      
      expect(result).toEqual(mockProfile);
      expect(prismaMock.profile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-123',
          name: 'John Doe',
          bio: 'Test bio'
        })
      });
    });
  });
});
```

#### Integration Tests
```typescript
// tests/routes/profile.test.ts
import request from 'supertest';
import { app } from '../../src/app';

describe('Profile Routes', () => {
  describe('POST /api/profile', () => {
    it('should create a new profile', async () => {
      const profileData = {
        userId: 'user-123',
        name: 'John Doe',
        bio: 'Test bio'
      };
      
      const response = await request(app)
        .post('/api/profile')
        .send(profileData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          name: 'John Doe',
          bio: 'Test bio'
        })
      });
    });
  });
});
```

### Frontend Testing

#### Component Tests with React Testing Library
```typescript
// components/__tests__/ProfileCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProfileCard } from '../ProfileCard';

const mockProfile = {
  id: 'profile-123',
  name: 'John Doe',
  bio: 'Experienced construction worker',
  skills: ['construction', 'painting'],
  viewCount: 15
};

describe('ProfileCard', () => {
  it('renders profile information correctly', () => {
    render(<ProfileCard profile={mockProfile} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Experienced construction worker')).toBeInTheDocument();
    expect(screen.getByText('construction')).toBeInTheDocument();
    expect(screen.getByText('painting')).toBeInTheDocument();
    expect(screen.getByText('15 views')).toBeInTheDocument();
  });
});
```

### Test Configuration

#### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/app.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};
```

## Deployment

### Environment Setup

#### Production Environment Variables
```env
# Database
DATABASE_URL="postgresql://username:password@prod-db-url:5432/careconnect"

# API Keys (use production keys)
OPENAI_API_KEY="sk-prod-key"
INDEED_API_KEY="prod-indeed-key"

# Security
NODE_ENV=production
JWT_SECRET="production-jwt-secret"
ENCRYPTION_KEY="production-encryption-key"

# Server
PORT=3001
CORS_ORIGIN="https://careconnect.app"
```

### Docker Deployment

#### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

#### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: careconnect
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/careconnect
      NODE_ENV: production
    ports:
      - "3001:3001"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001/api
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Cloud Deployment

#### Vercel (Frontend)
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url"
  }
}
```

#### Railway/Render (Backend)
```json
// package.json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/app.js",
    "postinstall": "prisma generate && prisma migrate deploy"
  }
}
```

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-feature`
3. **Make changes and write tests**
4. **Run tests**: `npm test`
5. **Run linting**: `npm run lint`
6. **Commit changes**: `git commit -m "feat: add new feature"`
7. **Push branch**: `git push origin feature/new-feature`
8. **Create Pull Request**

### Code Style

#### ESLint Configuration
```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals", "@typescript-eslint/recommended"],
  "rules": {
    "prefer-const": "error",
    "no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

#### Prettier Configuration
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Reset database
npx prisma migrate reset
npx prisma db push
```

#### Node.js Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18.x or higher
```

#### TypeScript Issues
```bash
# Regenerate Prisma client
npx prisma generate

# Check TypeScript compilation
npx tsc --noEmit
```

### Debugging

#### Backend Debugging
```typescript
// Add debug logging
import debug from 'debug';
const log = debug('careconnect:profile');

export class ProfileService {
  static async createProfile(data: CreateProfileData) {
    log('Creating profile for user %s', data.userId);
    // ... rest of the code
  }
}

// Run with debug output
DEBUG=careconnect:* npm run dev
```

#### Frontend Debugging
```typescript
// Use React Developer Tools
// Add console logging for development
if (process.env.NODE_ENV === 'development') {
  console.log('Profile data:', profile);
}

// Use React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function App() {
  return (
    <>
      <YourApp />
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </>
  );
}
```

### Performance Optimization

#### Database Optimization
```typescript
// Use select to limit fields
const profiles = await prisma.profile.findMany({
  select: {
    id: true,
    name: true,
    bio: true,
    user: {
      select: { location: true }
    }
  }
});

// Use database indexes
// In schema.prisma
model Profile {
  // ...
  @@index([isProfilePublic, createdAt])
  @@index([userId])
}
```

#### Frontend Optimization
```typescript
// Use React.memo for expensive components
export const ProfileCard = React.memo(({ profile }: ProfileCardProps) => {
  return <div>...</div>;
});

// Lazy load components
const JobSearch = lazy(() => import('./JobSearch'));

// Use Next.js Image optimization
import Image from 'next/image';

<Image
  src="/profile-image.jpg"
  alt="Profile"
  width={200}
  height={200}
  priority
/>
```

For more help, see the [FAQ](./FAQ.md) or [create an issue](https://github.com/your-repo/issues).