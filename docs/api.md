# Way-d API Documentation

## Overview
This document describes the API endpoints and data models for the Way-d application.

## Base URLs
- Development: `http://localhost:5173/api`
- Production: `https://your-domain.com/api`

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout
- `POST /refresh` - Refresh JWT token
- `POST /verify-email` - Verify email address
- `POST /forgot-password` - Request password reset
- `GET /me` - Get current user info

### Profile (`/api/profile`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /profile/photos` - Upload profile photos
- `DELETE /profile/photos/:id` - Delete profile photo
- `GET /profile/preferences` - Get matching preferences
- `PUT /profile/preferences` - Update matching preferences

### Interactions (`/api/interactions`)
- `GET /matches` - Get user matches
- `POST /like/:userId` - Like a user
- `POST /pass/:userId` - Pass on a user
- `GET /likes` - Get received likes
- `POST /super-like/:userId` - Super like a user

### Messages (`/api/messages`)
- `GET /conversations` - Get all conversations
- `GET /conversations/:id/messages` - Get messages in conversation
- `POST /conversations/:id/messages` - Send a message
- `POST /conversations/:id/read` - Mark conversation as read

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  location: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
  photos: Photo[];
  verified: boolean;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}
```

### Profile
```typescript
interface Profile extends User {
  bio: string;
  interests: string[];
  profession: string;
  education: string;
  languages: string[];
  lookingFor: 'serious' | 'casual' | 'friends' | 'networking';
  preferences: MatchingPreferences;
}
```

### MatchingPreferences
```typescript
interface MatchingPreferences {
  ageRange: {
    min: number;
    max: number;
  };
  maxDistance: number;
  genderPreference: 'male' | 'female' | 'both';
  interests: string[];
}
```

## Error Handling
All API responses follow this format:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error
