# Refresh Token and Access Token Implementation Plan

## Goal Description

Add secure JWT-based authentication with short‑lived access tokens and long‑lived refresh tokens. Implement:
- Storage of refresh tokens in the User model.
- Generation of a refresh token alongside the access token on sign‑in.
- An endpoint to exchange a valid refresh token for a new access token.
- Middleware to verify access tokens for protected routes.

## User Review Required

> [!IMPORTANT]
> This plan introduces new environment variables and database schema changes. Please review the proposed token lifetimes and storage approach before we proceed.

## Open Questions

> [!QUESTION]
> 1. Desired expiry for access tokens (e.g., `15m`, `1h`)?
> 2. Desired expiry for refresh tokens (e.g., `7d`, `30d`)?
> 3. Should refresh tokens be stored as a simple string array on the User document, or in a separate collection?
> 4. Preferred endpoint path for refreshing tokens (e.g., `/api/auth/refresh`)?

## Proposed Changes

---
### Models
#### [MODIFY] [UserSchema.js](file:///c:/Users/zeine/OneDrive/Desktop/MERN/backend/models/UserSchema.js)
- Add a `refreshTokens` field (array of strings) to store valid refresh tokens.

---
### Controllers
#### [MODIFY] [UserController.js](file:///c:/Users/zeine/OneDrive/Desktop/MERN/backend/controllers/UserController.js)
- Update `signinUser` to generate a refresh token (`jwt.sign` with longer expiry) and push it to the user's `refreshTokens` array.
- Return both `accessToken` and `refreshToken` in the login response.
- Add a new `refreshAccessToken` async function that verifies the provided refresh token, checks it exists in the user's stored list, removes the old one, issues a new access token and a new refresh token, and returns them.

---
### Middleware
#### [NEW] [verifyToken.js](file:///c:/Users/zeine/OneDrive/Desktop/MERN/backend/middleware/verifyToken.js)
- Middleware that extracts the `Authorization` header, verifies the access token using `process.env.SECRET_KEY`, attaches `req.user`, and calls `next()`.
- Sends `401`/`403` responses on failure.

---
### Routes (if applicable)
- Ensure the refresh endpoint (`POST /auth/refresh`) uses the new controller and is protected by the refresh token validation logic.

---
## Verification Plan

### Automated Tests
- Unit test for `verifyToken` middleware with valid/invalid tokens.
- Integration test calling `/auth/refresh` with a valid refresh token should return a new access token.

### Manual Verification
- Use Postman to sign in, capture access and refresh tokens.
- Call a protected route with the access token – should succeed.
- After access token expires, call `/auth/refresh` with the refresh token – should receive a new access token.
