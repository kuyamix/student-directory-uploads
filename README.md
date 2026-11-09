
# Student Directory API

A RESTful Node.js / Express + MongoDB API for managing student records, secured with JWT authentication and bcrypt password hashing. Includes image uploads handled by Multer and stored in Cloudinary. Built for the Lesson 5 Auth Lab and extended in Lesson 7.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
  - [Auth](#auth)
  - [Students](#students-all-routes-require-auth)
  - [Uploads](#uploads-require-auth)
- [Data Models](#data-models)
- [Auth Flow](#auth-flow)
- [Testing](#testing)
- [Security Design Decisions](#security-design-decisions)
- [Reflection](#reflection)
- [Author](#author)
- [License](#license)

---

## Overview

The Student Directory API lets an authenticated user:

- Register with an email and password.
- Log in and receive a signed JWT.
- Create, read, update, and delete student records.
- Upload image files to Cloudinary.

Passwords are hashed with **bcrypt** before they reach the database — plaintext is never stored. All student routes and upload routes require a valid **JWT** sent in the `Authorization: Bearer <token>` header. Tokens expire after one hour.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | MongoDB Atlas (Mongoose 8) |
| Password hashing | bcryptjs |
| Authentication | jsonwebtoken (JWT, HS256) |
| File Uploads | Multer (memoryStorage) |
| Cloud Storage | Cloudinary |
| Config | dotenv |

---

## Project Structure

```
student-directory/
├── config/
│   └── cloudinary.js       # Cloudinary SDK configuration
├── middleware/
│   ├── auth.js             # JWT verification middleware
│   └── upload.js           # Multer memoryStorage & file filter
├── models/
│   ├── Student.js          # Student schema
│   └── User.js             # Auth user schema
├── routes/
│   ├── auth.js             # POST /register, POST /login
│   ├── students.js         # Student CRUD (protected)
│   └── upload.js           # Image uploads to Cloudinary (protected)
├── .env                    # Secrets (git-ignored)
├── .env.example            # Template (safe to commit)
├── .gitignore
├── package.json
├── package-lock.json
├── server.js               # Entry point
└── README.md
```

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/kuyamix/student-directory-uploads.git
cd student-directory-uploads
npm install
```

### 2. Create `.env`

Copy the template and fill in real values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/student_directory?retryWrites=true&w=majority
JWT_SECRET=<generate_below>
PORT=3000
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> ⚠️ If your Atlas password contains characters like `@ : / ? # [ ] %`, URL-encode them (e.g. `@` → `%40`).

### 3. Configure external access

- **MongoDB Atlas** — Ensure a database user exists and add your IP address to Network Access.
- **Cloudinary** — Sign up at cloudinary.com. Go to your Dashboard and copy your Cloud Name, API Key, and API Secret.

### 4. Run

```bash
npm run dev      # with nodemon (auto-restart)
# or
npm start        # plain node
```

Expected output:

```
✅ MongoDB connected
🚀 Server running on port 3000
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | yes | MongoDB Atlas connection string |
| `JWT_SECRET` | yes | Secret used to sign/verify JWTs |
| `PORT` | no | HTTP port (defaults to `3000`) |
| `CLOUDINARY_CLOUD_NAME` | yes | Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | yes | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | yes | Cloudinary API Secret |

All real values live in `.env`, which is **git-ignored**. `.env.example` is committed as a template.

---

## API Reference

Base URL: `http://localhost:3000`

### Auth

#### `POST /api/auth/register`
Create a new user.

**Request body**
```json
{ "email": "test@example.com", "password": "password123" }
```
**Responses**
| Status | Body | Meaning |
|---|---|---|
| `201` | `{ "id": "…", "email": "test@example.com", "role": "user" }` | Created |
| `409` | `{ "error": "Email already registered" }` | Duplicate email |
| `400` | `{ "error": "…" }` | Validation error |

#### `POST /api/auth/login`
Authenticate and receive a JWT.

**Request body**
```json
{ "email": "test@example.com", "password": "password123" }
```
**Responses**
| Status | Body | Meaning |
|---|---|---|
| `200` | `{ "token": "eyJhbGciOiJIUzI1NiIs…" }` | Success |
| `401` | `{ "error": "Invalid credentials" }` | Bad email or password |

---

### Students (All routes require auth)

Every request must include:
`Authorization: Bearer <token>`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/students` | Get all students (newest first) |
| `GET` | `/api/students/:id` | Get a single student |
| `POST` | `/api/students` | Create a student |
| `PUT` | `/api/students/:id` | Update a student |
| `DELETE` | `/api/students/:id` | Delete a student |

**Student Request Body (POST/PUT)**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "course": "CS",
  "year": 2
}
```

---

### Uploads (Require auth)

#### `POST /api/upload`
Upload an image to Cloudinary.

**Headers**
- `Authorization: Bearer <token>`

**Body**
- Form-Data (`multipart/form-data`)
- Field name: `file`
- Allowed types: Images only (`image/*`)
- Max size: 5MB

**Responses**
| Status | Body | Meaning |
|---|---|---|
| `200` | `{ "url": "https://res.cloudinary.com/...", "publicId": "lesson7_uploads/abc123" }` | Upload successful |
| `400` | `{ "error": "No file uploaded" }` | No file in request |
| `400` | `{ "error": "Only image files are allowed" }` | File type rejected by Multer |
| `401` | `{ "error": "No token provided" }` | Missing or invalid token |

---

## Data Models

### User
```javascript
{
  email:     String,   // required, unique, lowercase
  password:  String,   // required, bcrypt hash
  role:      String,   // 'user' | 'admin', default 'user'
  createdAt: Date,
  updatedAt: Date
}
```

### Student
```javascript
{
  name:      String,   // required
  email:     String,   // required, unique, lowercase
  course:    String,   // required
  year:      Number,   // required, 1–5
  createdAt: Date,
  updatedAt: Date
}
```

---

## Auth & Upload Flow

1. **Register** — Server bcrypt-hashes the password and stores only the hash.
2. **Login** — Server verifies password via `bcrypt.compare` and signs a 1-hour JWT.
3. **Protected Requests** — Client sends `Authorization: Bearer <token>`. Middleware verifies the signature and attaches `req.user`.
4. **Uploads** — Client sends an image via `multipart/form-data`. Multer stores the file in RAM (`memoryStorage`), and the route streams it directly to Cloudinary. The Cloudinary URL is returned to the client.

---

## Testing

### Manual test flow (Thunder Client / Postman)

| # | Method | Endpoint | Header | Body | Expected |
|---|---|---|---|---|---|
| 1 | POST | `/api/auth/register` | — | `{"email":"test@example.com","password":"password123"}` | `201` |
| 2 | POST | `/api/auth/login` | — | `{"email":"test@example.com","password":"password123"}` | `200` + token |
| 3 | GET | `/api/students` | *(none)* | — | `401` |
| 4 | POST | `/api/upload` | `Bearer {{token}}` | Form-Data `file` (image) | `200` + URL |
| 5 | POST | `/api/upload` | `Bearer {{token}}` | Form-Data `file` (txt) | `400` error |
| 6 | POST | `/api/upload` | *(none)* | Form-Data `file` (image) | `401` |

---

## Security Design Decisions

- **All routes protected** — Reads and writes to the student directory require auth to prevent PII leaks and spam injection.
- **Generic login errors** — Prevents email enumeration.
- **No password in responses** — The API never returns the hashed or plaintext password.
- **Secrets in `.env`** — `.env` is ignored; `.env.example` is committed with placeholders.
- **Multer `memoryStorage`** — Files are held in RAM, not written to disk. This prevents local server storage from filling up and avoids the overhead of disk I/O.
- **File Filtering** — Multer rejects any file that does not have an `image/*` MIME type, preventing malicious file uploads.

---

## Reflection

### 1. Why is it dangerous to store passwords in plain text?
If a database is compromised, plain-text passwords give attackers immediate access to every user's account. Because people reuse passwords, this cascades into breaches on other sites. Hashing (bcrypt) makes the stored value irreversible and adds a unique salt per password, neutralizing rainbow tables.

### 2. Why do we return the same error for "user not found" and "wrong password"?
Returning `401 Invalid credentials` for both prevents **email enumeration**. An attacker probing the login endpoint cannot discover whether an email is registered, which keeps them from building target lists for phishing or credential stuffing.

### 3. Why use `memoryStorage` instead of `diskStorage` for Cloudinary?
We use `memoryStorage` because Cloudinary is a cloud service, so there is no need to permanently save the file to our server's hard drive. `memoryStorage` holds the file temporarily in RAM as a buffer, allowing us to stream it directly to Cloudinary via `upload_stream`. If we used `diskStorage`, the server would have to write the file to disk, read it back to send to the cloud, and then delete the local file. Using `memoryStorage` avoids unnecessary disk I/O and prevents the server's storage from filling up with orphaned files.

---

## Author

**Kuyamix**
Lesson 5 & 7 Labs — Student Directory API



MIT
```
