# CLAUDE.md - AI Assistant Guide for 装修小程序 (Renovation Mini-App)

> **Purpose**: This document provides AI assistants with comprehensive context about the codebase structure, development workflows, and conventions to follow when working on this project.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Codebase Navigation](#codebase-navigation)
4. [Development Workflows](#development-workflows)
5. [Code Conventions & Patterns](#code-conventions--patterns)
6. [Common Tasks Guide](#common-tasks-guide)
7. [API Integration](#api-integration)
8. [Database Schema Reference](#database-schema-reference)
9. [Testing & Deployment](#testing--deployment)
10. [Important Considerations](#important-considerations)

---

## Project Overview

**装修小程序 (Renovation Mini-App)** is a full-stack application for connecting homeowners with renovation professionals. It provides:
- Portfolio browsing (cases, designers)
- Construction diary tracking
- Real-time chat communication
- Merchant management system
- Personalized recommendations

### Key Features
- **User Features**: Browse cases/designers, create diaries, favorites, chat, recommendations
- **Merchant Features**: Manage portfolios, cases, designers, consultations
- **Admin Features**: Merchant approval, content moderation
- **Real-time**: Socket.io for instant messaging with typing indicators
- **Background Jobs**: Bull queues for emails, notifications, image processing, data sync

---

## Architecture & Technology Stack

### Frontend (Taro Mini-Program)
```
Technology: Taro 4.1.8 + React 18 + TypeScript 5.0 + SCSS
Platforms: WeChat, Alipay, Baidu, ByteDance mini-programs + H5
Location: /src, /config
Entry Point: /src/app.tsx
```

**Key Dependencies**:
- `@tarojs/components`, `@tarojs/react`, `@tarojs/taro` - Core Taro framework
- `react`, `react-dom` - UI library
- TypeScript for type safety

**Build System**:
- Webpack 5 via `@tarojs/webpack5-runner`
- Babel with `babel-preset-taro`
- ESLint with TypeScript support

### Backend (Express API)
```
Technology: Express 4.18 + TypeScript 5.3 + MongoDB 5+ + Redis 6+
Location: /server/src
Entry Point: /server/src/index.ts
API Base: /api/v1
```

**Core Dependencies**:
- **Framework**: Express 4.18.2 with TypeScript
- **Database**: MongoDB 5.0+ (Mongoose 8.0.3 ODM), Redis 6.0+
- **Authentication**: JWT (jsonwebtoken 9.0.2), bcryptjs 2.4.3
- **Real-time**: Socket.io 4.6.1
- **Job Queue**: Bull 4.12.0 (Redis-backed)
- **Media**: Sharp 0.33.1 (image processing)
- **Logging**: Winston 3.11.0 with daily rotation
- **API Docs**: Swagger/OpenAPI via swagger-ui-express
- **Security**: Helmet 7.1.0, CORS, express-validator 7.0.1

---

## Codebase Navigation

### Frontend Structure (`/src`)

```
/src
├── pages/                    # 19 page modules
│   ├── index/               # Home: banners, services, recommendations
│   ├── cases/               # Case list with filters/search
│   ├── case-detail/         # Case detail view
│   ├── designers/           # Designer browse
│   ├── designer-detail/     # Designer detail view
│   ├── diary/               # Construction diary list
│   ├── diary-edit/          # Diary CRUD
│   ├── merchant-cases/      # Merchant: case management
│   ├── merchant-center/     # Merchant: dashboard
│   ├── merchant-dashboard/  # Merchant: analytics
│   ├── chat/                # Real-time messaging
│   ├── login/               # Authentication
│   ├── mine/                # User profile
│   ├── my-consultations/    # User's consultations
│   └── my-favorites/        # User's saved items
├── services/                # API integration layer
│   ├── api.ts              # All API methods
│   └── request.ts          # HTTP client with auth
├── utils/                   # Helper functions
│   ├── user.ts             # User info persistence
│   ├── favorite.ts         # Favorites logic
│   ├── merchant.ts         # Merchant utilities
│   └── recommendation.ts   # Recommendation algorithm
├── assets/                  # Static resources
│   └── icons/              # TabBar icons
├── app.tsx                 # App entry point
├── app.config.ts           # Mini-program config (routes, tabBar)
└── app.scss                # Global styles
```

**Page Structure Convention**:
```
/pages/[page-name]/
├── index.tsx       # Component logic (React hooks)
├── index.scss      # Page-specific styles
└── index.config.ts # Page configuration (title, etc.)
```

### Backend Structure (`/server/src`)

```
/server/src
├── config/                  # System configuration
│   ├── database.ts         # MongoDB + Redis connections
│   ├── logger.ts           # Winston logger setup
│   ├── socket.ts           # Socket.io with JWT auth
│   ├── swagger.ts          # API documentation spec
│   └── queue.ts            # Bull queue definitions
├── controllers/             # Business logic (8 modules)
│   ├── authController.ts   # WeChat/phone login, profile
│   ├── caseController.ts   # Case CRUD, search, hot cases
│   ├── chatController.ts   # Conversations, messages
│   ├── diaryController.ts  # Diary CRUD, progress stats
│   ├── favoriteController.ts # Favorite add/remove/check
│   ├── merchantController.ts # Merchant apply, designer mgmt
│   ├── recommendController.ts # Personalized recommendations
│   └── uploadController.ts # Image upload with processing
├── middleware/              # Request processing
│   ├── auth.ts             # JWT verify + role-based access
│   └── errorHandler.ts     # Global error handler
├── models/                  # MongoDB schemas (9 models)
│   ├── User.ts             # User accounts + auth
│   ├── Case.ts             # Portfolio cases
│   ├── Designer.ts         # Designer profiles
│   ├── Diary.ts            # Construction diaries
│   ├── Favorite.ts         # User favorites
│   ├── Merchant.ts         # Merchant applications
│   ├── Message.ts          # Chat messages
│   ├── Conversation.ts     # Chat threads
│   └── BrowseHistory.ts    # User activity tracking
├── routes/                  # API endpoints (8 groups)
│   ├── index.ts            # Route aggregator
│   ├── authRoutes.ts       # /auth/*
│   ├── caseRoutes.ts       # /cases/*
│   ├── chatRoutes.ts       # /chat/*
│   ├── diaryRoutes.ts      # /diaries/*
│   ├── favoriteRoutes.ts   # /favorites/*
│   ├── merchantRoutes.ts   # /merchants/*
│   ├── recommendRoutes.ts  # /recommend/*
│   └── uploadRoutes.ts     # /upload/*
├── queues/                  # Background job processing
│   ├── index.ts            # Queue processors setup
│   └── processors/         # Job handlers
│       ├── emailProcessor.ts
│       ├── notificationProcessor.ts
│       ├── imageProcessor.ts
│       └── syncProcessor.ts
├── utils/                   # Helper functions
│   ├── wechat.ts           # WeChat API integration
│   └── image.ts            # Image processing with Sharp
└── index.ts                # Server entry point
```

**File Path Reference** (for quick navigation):

| Purpose | Path |
|---------|------|
| Frontend API client | `/src/services/request.ts` |
| Backend server entry | `/server/src/index.ts` |
| Auth middleware | `/server/src/middleware/auth.ts` |
| Socket.io setup | `/server/src/config/socket.ts` |
| User model | `/server/src/models/User.ts` |
| Case controller | `/server/src/controllers/caseController.ts` |
| Taro build config | `/config/index.ts` |
| Environment variables | `/server/.env.example` |

---

## Development Workflows

### Starting the Development Environment

**Prerequisites**:
- Node.js >= 16
- MongoDB >= 5.0 running on `localhost:27017`
- Redis >= 6.0 running on `localhost:6379`
- WeChat Developer Tools (for mini-program testing)

**Backend Setup**:
```bash
cd server
npm install
cp .env.example .env  # Edit with your config
npm run dev           # Starts on http://localhost:3000
```

**Frontend Setup**:
```bash
npm install
npm run dev:weapp     # WeChat mini-program (watch mode)
npm run dev:h5        # H5 web version
```

**For WeChat Mini-Program**:
1. Open WeChat Developer Tools
2. Import project → Select `/dist` directory
3. Configure: "不校验合法域名" for local development

### Build for Production

**Frontend**:
```bash
npm run build:weapp   # WeChat mini-program → /dist
npm run build:h5      # H5 web version → /dist
npm run build:alipay  # Alipay mini-program → /dist
```

**Backend**:
```bash
cd server
npm run build         # TypeScript → JavaScript in /dist
npm start             # Run production build
```

**Production Deployment Options**:
- **PM2 Cluster**: `pm2 start ecosystem.config.js`
- **Docker**: See `/server/DEPLOYMENT.md`

### Development Tools

**API Documentation**:
- Swagger UI: `http://localhost:3000/api-docs`
- Automatically generated from JSDoc comments

**Health Check**:
```bash
curl http://localhost:3000/api/v1/health
```

**Logging**:
- Development: Console output
- Production: `/server/logs/combined.log` and `/server/logs/error.log`
- Daily rotation enabled

**Code Quality**:
```bash
# Frontend
npm run lint

# Backend
cd server && npm run lint
```

---

## Code Conventions & Patterns

### Frontend Patterns

#### 1. Component Structure (React Hooks + TypeScript)
```typescript
// pages/example/index.tsx
import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import { getCases } from '@/services/api';
import './index.scss';

interface Case {
  id: string;
  title: string;
  // ...
}

export default function ExamplePage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    try {
      const response = await getCases({ page: 1, limit: 10 });
      if (response.success && response.data) {
        setCases(response.data.cases);
      }
    } catch (error) {
      console.error('Failed to load cases:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="example-page">
      {loading && <Text>Loading...</Text>}
      {cases.map(item => (
        <View key={item.id}>{item.title}</View>
      ))}
    </View>
  );
}
```

#### 2. Service Layer Pattern (`/src/services/api.ts`)
- All API calls isolated in `api.ts`
- Generic `request()` method with automatic auth handling
- Token stored in localStorage, automatically added to headers
- Example:
```typescript
export const getCases = (params?: {
  page?: number;
  limit?: number;
  style?: string;
}) => request<CaseListResponse>('/cases', 'GET', undefined, params);
```

#### 3. Naming Conventions
- **Pages**: `pages/case-detail/index.tsx` (kebab-case directories)
- **Components**: PascalCase for React components
- **Functions**: camelCase
- **Styles**: BEM-like naming in SCSS

### Backend Patterns

#### 1. MVC Architecture
```
Route → Controller → Model
  ↓         ↓          ↓
Express  Business   Mongoose
Router    Logic      Schema
```

**Example Flow**:
```
POST /api/v1/cases
  → caseRoutes.ts (route definition)
  → authenticate middleware (JWT verify)
  → checkRole('merchant') middleware
  → createCase controller (business logic)
  → Case model (database operation)
  → JSON response
```

#### 2. Controller Pattern
```typescript
// controllers/exampleController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Case from '../models/Case';

export const createCase = async (req: AuthRequest, res: Response) => {
  try {
    const { title, style, area, price } = req.body;
    const userId = req.userId; // From auth middleware

    const newCase = new Case({
      title,
      style,
      area,
      price,
      merchant: userId,
    });

    await newCase.save();

    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      data: newCase,
    });
  } catch (error) {
    throw new AppError('Failed to create case', 500);
  }
};
```

#### 3. Authentication Pattern
```typescript
// middleware/auth.ts
export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

// Usage in routes
router.post('/create',
  authenticate,                      // Verify JWT
  checkRole('merchant', 'admin'),   // Role-based access
  createCase                         // Controller
);
```

#### 4. Error Handling
```typescript
// Custom error class
export class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

// Usage in controllers
if (!user) {
  throw new AppError('User not found', 404);
}

// Caught by global errorHandler middleware
```

#### 5. Database Indexing Strategy
```typescript
// Composite indexes for common queries
CaseSchema.index({ style: 1, status: 1 });
CaseSchema.index({ designer: 1 });
CaseSchema.index({ viewCount: -1 });

// TTL index for auto-cleanup
BrowseHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
```

#### 6. Queue Pattern (Bull)
```typescript
// Adding job to queue
import { emailQueue } from '../config/queue';

await emailQueue.add({
  to: user.email,
  subject: 'Welcome',
  body: 'Hello!',
});

// Processing job (in queues/processors/emailProcessor.ts)
emailQueue.process(async (job) => {
  const { to, subject, body } = job.data;
  await sendEmail(to, subject, body);
});
```

---

## Common Tasks Guide

### Task: Add a New API Endpoint

**Steps**:
1. **Define Model** (if new entity): `/server/src/models/EntityName.ts`
2. **Create Controller**: `/server/src/controllers/entityController.ts`
3. **Define Routes**: `/server/src/routes/entityRoutes.ts`
4. **Register Routes**: Add to `/server/src/routes/index.ts`
5. **Add Frontend API Method**: `/src/services/api.ts`
6. **Update Swagger Docs**: Add JSDoc comments to route

**Example**:
```typescript
// 1. Model: /server/src/models/Review.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  case: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
}

const ReviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  case: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<IReview>('Review', ReviewSchema);

// 2. Controller: /server/src/controllers/reviewController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Review from '../models/Review';

export const createReview = async (req: AuthRequest, res: Response) => {
  const { caseId, rating, comment } = req.body;
  const review = new Review({
    user: req.userId,
    case: caseId,
    rating,
    comment,
  });
  await review.save();
  res.status(201).json({ success: true, data: review });
};

// 3. Routes: /server/src/routes/reviewRoutes.ts
import express from 'express';
import { authenticate } from '../middleware/auth';
import { createReview } from '../controllers/reviewController';

const router = express.Router();

router.post('/', authenticate, createReview);

export default router;

// 4. Register: /server/src/routes/index.ts
import reviewRoutes from './reviewRoutes';
router.use('/reviews', reviewRoutes);

// 5. Frontend API: /src/services/api.ts
export const createReview = (data: { caseId: string; rating: number; comment: string }) =>
  request('/reviews', 'POST', data);
```

### Task: Add a New Page (Frontend)

**Steps**:
1. Create page directory: `/src/pages/new-page/`
2. Create files: `index.tsx`, `index.scss`, `index.config.ts`
3. Register in `/src/app.config.ts` → `pages` array
4. If tabBar page, update `tabBar.list` in `app.config.ts`

**Example**:
```typescript
// 1. /src/pages/reviews/index.tsx
import { View, Text } from '@tarojs/components';
import { useState, useEffect } from 'react';
import { getReviews } from '@/services/api';
import './index.scss';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    const response = await getReviews();
    if (response.success) setReviews(response.data);
  };

  return (
    <View className="reviews-page">
      {reviews.map(review => (
        <View key={review.id}>{review.comment}</View>
      ))}
    </View>
  );
}

// 2. /src/pages/reviews/index.config.ts
export default {
  navigationBarTitleText: '评价列表'
};

// 3. /src/app.config.ts
export default {
  pages: [
    'pages/index/index',
    'pages/reviews/index',  // Add here
    // ...
  ],
};
```

### Task: Add Background Job Processing

**Steps**:
1. Define queue in `/server/src/config/queue.ts`
2. Create processor in `/server/src/queues/processors/`
3. Register processor in `/server/src/queues/index.ts`
4. Add job to queue from controller

**Example**:
```typescript
// 1. Define queue
import Queue from 'bull';
export const reviewNotificationQueue = new Queue('review-notification', {
  redis: { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) }
});

// 2. Processor
// /server/src/queues/processors/reviewNotificationProcessor.ts
export const processReviewNotification = async (job: any) => {
  const { userId, caseId } = job.data;
  // Send notification logic
  logger.info(`Notification sent for review on case ${caseId}`);
};

// 3. Register
import { reviewNotificationQueue } from '../config/queue';
import { processReviewNotification } from './processors/reviewNotificationProcessor';

reviewNotificationQueue.process(processReviewNotification);

// 4. Use in controller
import { reviewNotificationQueue } from '../config/queue';

await reviewNotificationQueue.add({ userId, caseId });
```

### Task: Implement Real-time Feature (Socket.io)

**Steps**:
1. Add event handler in `/server/src/config/socket.ts`
2. Emit events from controllers when needed
3. Listen to events in frontend

**Example**:
```typescript
// Backend: /server/src/config/socket.ts
io.on('connection', (socket) => {
  socket.on('new-review', async (data) => {
    const { caseId, review } = data;
    // Broadcast to all users viewing this case
    io.to(`case-${caseId}`).emit('review-added', review);
  });

  socket.on('join-case', (caseId) => {
    socket.join(`case-${caseId}`);
  });
});

// Frontend: Use in component
useEffect(() => {
  const socket = io('http://localhost:3000');
  socket.emit('join-case', caseId);
  socket.on('review-added', (review) => {
    setReviews(prev => [...prev, review]);
  });
  return () => socket.disconnect();
}, [caseId]);
```

---

## API Integration

### Request/Response Format

**Standard Response**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* ... */ }
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev only)"
}
```

### Authentication Flow

**WeChat Login**:
```typescript
// Frontend
const { code } = await Taro.login();
const { userInfo } = await Taro.getUserProfile({ desc: 'Login' });

const response = await wechatLogin({
  code,
  userInfo: {
    nickname: userInfo.nickName,
    avatar: userInfo.avatarUrl,
    gender: userInfo.gender === 1 ? 'male' : 'female',
  },
});

if (response.success && response.data?.token) {
  setToken(response.data.token);
}
```

**Authenticated Requests**:
- Token automatically added by `request.ts` from localStorage
- Header: `Authorization: Bearer <token>`
- 401 errors trigger auto-logout and redirect to login

### API Endpoints Quick Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/wechat-login` | POST | No | WeChat OAuth login |
| `/auth/me` | GET | Yes | Current user profile |
| `/cases` | GET | No | List cases with filters |
| `/cases/:id` | GET | No | Case detail (tracks view) |
| `/cases` | POST | Merchant | Create case |
| `/diaries` | GET | Yes | My diaries |
| `/diaries` | POST | Yes | Create diary |
| `/favorites` | POST | Yes | Add favorite |
| `/favorites/:type/:id` | DELETE | Yes | Remove favorite |
| `/recommend/cases` | GET | Yes | Personalized recs |
| `/upload/image` | POST | Yes | Upload with processing |
| `/merchants/apply` | POST | Yes | Apply as merchant |
| `/chat/conversations` | GET | Yes | Chat list |

Full API docs: See `/server/README.md` or Swagger UI at `/api-docs`

---

## Database Schema Reference

### Key Models

**User** (`/server/src/models/User.ts`):
- **Fields**: nickname, avatar, phone, openid (WeChat), gender, region, signature, role, isActive
- **Roles**: `user`, `merchant`, `admin`
- **Indexes**: phone, openid, createdAt

**Case** (`/server/src/models/Case.ts`):
- **Fields**: title, style (12 enums), area, price, images (1-20), description, tags, rooms, floor, district
- **Relations**: designer (ObjectId), merchant (ObjectId)
- **Metrics**: viewCount, favoriteCount, isHot, isRecommended
- **Status**: `draft`, `published`, `archived`
- **Indexes**: (style, status), designer, merchant, viewCount, area+price

**Designer** (`/server/src/models/Designer.ts`):
- **Fields**: name, avatar, title (7 levels), experience (years), specialties (array), introduction
- **Relations**: user, merchant
- **Metrics**: caseCount, rating (0-5), ratingCount, isActive

**Diary** (`/server/src/models/Diary.ts`):
- **Fields**: title, content, images (0-9), tags (8 enums), progress (0-100%)
- **Relation**: user
- **Indexes**: (user, createdAt), progress

**Merchant** (`/server/src/models/Merchant.ts`):
- **Fields**: companyName, businessLicense, contactPerson, contactPhone, address, description, logo
- **Relation**: user (unique)
- **Status**: `pending`, `approved`, `rejected`

**Favorite** (`/server/src/models/Favorite.ts`):
- **Fields**: targetType (case | designer), targetId (polymorphic)
- **Unique Index**: (user, targetType, targetId)

**BrowseHistory** (`/server/src/models/BrowseHistory.ts`):
- **TTL**: Auto-deletes after 30 days
- **Fields**: targetType, targetId
- **Relation**: user

**Message** (`/server/src/models/Message.ts`):
- **Fields**: conversationId, content, messageType (text | image | file), fileUrl, isRead
- **Relations**: sender, receiver (with types: user | merchant | designer)

**Conversation** (`/server/src/models/Conversation.ts`):
- **Participants**: Array of { userId, userType, lastReadAt }
- **Optional**: lastMessage, caseId, designerId

### Schema Patterns

**Timestamps**: All models use `{ timestamps: true }` → auto `createdAt` and `updatedAt`

**Soft Deletes**: Not implemented (use `isActive` or `status` fields instead)

**References**: Use `Schema.Types.ObjectId` with `ref` for relationships

**Validation**: Mongoose validators + custom validation in controllers

---

## Testing & Deployment

### Testing

**Current Status**: ⚠️ No formal test framework configured

**Recommendations**:
- Add Jest or Vitest for unit tests
- Add Supertest for API integration tests
- Add testing library for React components

**Code Quality**:
- ESLint configured for TypeScript + React
- Run: `npm run lint` (frontend), `cd server && npm run lint` (backend)

### Deployment

**Backend Deployment** (see `/server/DEPLOYMENT.md`):

1. **Environment Variables**: Copy `.env.example` to `.env` and configure
2. **Build**: `npm run build` → Compiles to `/server/dist`
3. **Run**: `npm start` or use PM2:
   ```bash
   pm2 start ecosystem.config.js
   pm2 logs zhuangxiu-api
   ```

4. **Prerequisites**:
   - MongoDB 5.0+ running
   - Redis 6.0+ running
   - WeChat App ID/Secret configured

**Frontend Deployment**:
1. **Build**: `npm run build:weapp` → Output to `/dist`
2. **WeChat**: Upload via WeChat Developer Tools
3. **H5**: Deploy `/dist` to static hosting (Nginx, CDN)

**Health Monitoring**:
- Endpoint: `GET /api/v1/health`
- Logs: `/server/logs/` (daily rotation)
- PM2 dashboard: `pm2 monit`

---

## Important Considerations

### Security

1. **Environment Variables**: NEVER commit `.env` files
2. **JWT Secret**: Use strong, random secret in production
3. **CORS**: Configure `ALLOWED_ORIGINS` for production domains
4. **Helmet**: Enabled for security headers
5. **Input Validation**: Use `express-validator` in controllers
6. **Password Hashing**: bcryptjs with salt rounds (future use)
7. **File Upload**: Validate file types and sizes in `uploadController`

### Performance

1. **Redis Caching**: Implement caching for frequently accessed data
2. **Database Indexes**: Already optimized for common queries
3. **Image Optimization**: Sharp auto-processes images (resize, compress, watermark)
4. **Pagination**: All list endpoints support `page` and `limit` params
5. **Queue Jobs**: Use Bull for async tasks (don't block requests)

### WeChat Mini-Program Specifics

1. **Domain Whitelist**: Add API domain to WeChat admin console
2. **HTTPS Required**: Production API must use HTTPS
3. **Request Limits**: WeChat has concurrent request limits
4. **Local Storage**: Use `Taro.setStorageSync()` (not `localStorage`)
5. **Image Upload**: Use `Taro.chooseImage()` → Upload to backend → Get URL

### Known Limitations

1. **No Tests**: Test suite needs to be added
2. **Mock Data**: Some frontend pages may still use static mock data (check and replace with API calls)
3. **Placeholder Images**: Replace with real assets before production
4. **WeChat AppID**: Required for mini-program deployment

### Code Quality Guidelines

1. **TypeScript**: Use strict typing, avoid `any` when possible
2. **Error Handling**: Always use try-catch in async functions
3. **Logging**: Use Winston logger (backend), console.error (frontend)
4. **Comments**: Add JSDoc for complex functions
5. **Git Commits**: Use conventional commits (feat:, fix:, docs:, etc.)

### Working with This Codebase (AI Assistant Guidelines)

**When adding features**:
1. ✅ Read existing code patterns before implementing
2. ✅ Follow MVC architecture (backend) and service layer pattern (frontend)
3. ✅ Add TypeScript types for all new data structures
4. ✅ Update this CLAUDE.md if adding new architectural patterns
5. ✅ Use existing utilities and helpers when possible

**When fixing bugs**:
1. ✅ Check logs in `/server/logs/` for backend errors
2. ✅ Verify middleware chain (auth → validation → controller)
3. ✅ Check MongoDB indexes if query is slow
4. ✅ Test with WeChat Developer Tools for frontend issues

**When refactoring**:
1. ✅ Maintain backward compatibility with API responses
2. ✅ Update related documentation (README, API docs, this file)
3. ✅ Consider impact on background jobs and queues
4. ✅ Test Socket.io events if touching real-time features

---

## Quick Command Reference

```bash
# Frontend
npm install                    # Install dependencies
npm run dev:weapp             # WeChat dev mode
npm run dev:h5                # H5 dev mode
npm run build:weapp           # Build WeChat
npm run lint                  # Lint code

# Backend
cd server
npm install                   # Install dependencies
cp .env.example .env          # Setup environment
npm run dev                   # Dev with nodemon
npm run build                 # Build to /dist
npm start                     # Run production
npm run lint                  # Lint code
pm2 start ecosystem.config.js # Deploy with PM2

# Database
mongod                        # Start MongoDB
redis-server                  # Start Redis
mongo                         # MongoDB shell
redis-cli                     # Redis CLI

# Docker (optional)
docker run -d -p 27017:27017 --name mongodb mongo
docker run -d -p 6379:6379 --name redis redis
```

---

## Additional Resources

- **Frontend README**: `/README.md`
- **Backend README**: `/server/README.md`
- **Deployment Guide**: `/server/DEPLOYMENT.md`
- **Integration Guide**: `/INTEGRATION_GUIDE.md`
- **API Docs**: `/docs/API.md`, `/docs/MERCHANT_API.md`, `/docs/WECHAT_LOGIN.md`
- **Checklists**: `/API_CHECKLIST.md`, `/INTEGRATION_CHECKLIST.md`
- **Swagger UI**: `http://localhost:3000/api-docs` (when server running)

---

**Last Updated**: 2025-11-22
**Codebase Version**: Latest commit on `claude/claude-md-mi9pyunnxawokt63-01HCtUhvp17h4e2Qc4bybQWL`
**Maintained By**: AI-assisted development (update this file when adding new patterns or conventions)
