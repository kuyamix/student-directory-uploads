# Student Directory API

A RESTful API built with **Node.js, Express, and MongoDB** for managing student records. It features JWT-based authentication, bcrypt password hashing, protected CRUD operations, and image uploads using Multer and Cloudinary.

Developed as part of the **Lesson 5 Authentication Lab** and extended in **Lesson 7 File Upload Lab**.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
  - [Authentication](#1-authentication)
  - [Students](#2-student-management)
  - [Image Uploads](#3-image-uploads)
- [Data Models](#data-models)
- [Authentication and Upload Workflow](#authentication-and-upload-workflow)
- [Testing](#testing)
- [Security Considerations](#security-considerations)
- [Reflection](#reflection)
- [Author](#author)
- [License](#license)

---

## Overview

The **Student Directory API** provides a secure backend service for managing student information.

Users can register an account, authenticate using their credentials, and access protected endpoints to manage student records. The API also supports image uploads, with uploaded files stored in Cloudinary rather than on the local server.

Authentication is handled through JSON Web Tokens (JWT), while passwords are securely hashed using bcrypt before being stored in MongoDB.

All student management and image upload endpoints require a valid JWT supplied through the HTTP Authorization header.

### Key Features

- **User Registration** – Create an account using an email address and password.
- **User Authentication** – Log in and receive a signed JWT.
- **Password Security** – Hash passwords using bcrypt before database storage.
- **Student Management** – Perform Create, Read, Update, and Delete (CRUD) operations.
- **Protected Routes** – Restrict access to authorized users.
- **Image Uploads** – Upload images using Multer.
- **Cloud Storage** – Store uploaded images through Cloudinary.
- **Token Expiration** – JWT authentication tokens expire after one hour.

---

## Technology Stack

| Component | Technology |
|---|---|
| Runtime Environment | Node.js 18+ |
| Backend Framework | Express 4 |
| Database | MongoDB Atlas |
| ODM | Mongoose 8 |
| Password Hashing | bcryptjs |
| Authentication | JSON Web Token (JWT) |
| Token Algorithm | HS256 |
| File Upload Handling | Multer |
| File Storage | Cloudinary |
| Environment Configuration | dotenv |

---

## Project Structure

The project follows a modular structure to separate configuration, middleware, database models, and API routes.

```text
student-directory/
│
├── config/
│   └── cloudinary.js
│
├── middleware/
│   ├── auth.js
│   └── upload.js
│
├── models/
│   ├── Student.js
│   └── User.js
│
├── routes/
│   ├── auth.js
│   ├── students.js
│   └── upload.js
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

### Directory Description

| Directory / File | Purpose |
|---|---|
| `config/` | Contains external service configurations, including Cloudinary. |
| `middleware/` | Handles JWT authentication and file upload validation. |
| `models/` | Defines MongoDB schemas using Mongoose. |
| `routes/` | Contains authentication, student, and upload endpoints. |
| `.env` | Stores private environment variables and credentials. |
| `.env.example` | Provides a template for required environment variables. |
| `.gitignore` | Prevents sensitive and unnecessary files from being committed. |
| `server.js` | Main application entry point. |
| `package.json` | Contains project dependencies and npm scripts. |

---

## Installation and Setup

Follow these instructions to run the API locally.

### 1. Clone the Repository

```bash
git clone https://github.com/kuyamix/student-directory-uploads.git
```

Navigate to the project directory:

```bash
cd student-directory-uploads
```

### 2. Install Dependencies

Install the required Node.js packages:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory.

You can use `.env.example` as a template:

```bash
cp .env.example .env
```

Open `.env` and provide your actual configuration values.

See [Environment Variables](#environment-variables) for details.

### 4. Configure MongoDB Atlas

1. Create or log in to your MongoDB Atlas account.
2. Create a database cluster.
3. Create a database user with the necessary permissions.
4. Configure Network Access to allow your development IP address.
5. Copy your MongoDB connection string.
6. Place the connection string in your `.env` file.

### 5. Configure Cloudinary

1. Create an account at [Cloudinary](https://cloudinary.com/).
2. Open your Cloudinary Dashboard.
3. Locate your Cloud Name, API Key, and API Secret.
4. Add these credentials to your `.env` file.

### 6. Start the Server

Run the development server:

```bash
npm run dev
```

Alternatively, start the application normally:

```bash
npm start
```

If everything is configured correctly, the terminal should display:

```text
✅ MongoDB connected
🚀 Server running on port 3000
```

The API will be accessible at:

`http://localhost:3000`

---

## Environment Variables

The application uses dotenv to load configuration values from the `.env` file.

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB Atlas connection string. |
| `JWT_SECRET` | Yes | Secret key used to sign and verify JWTs. |
| `PORT` | No | Server port. Defaults to `3000`. |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary account name. |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret. |

### Example Configuration

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/student_directory?retryWrites=true&w=majority

JWT_SECRET=your_generated_secret

PORT=3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Important:** Never commit your actual `.env` file or expose your database credentials, JWT secret, or Cloudinary API secret.

Make sure `.env` is included in `.gitignore`.

### Generating a JWT Secret

You can generate a strong random secret using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the generated value into `JWT_SECRET`.

**Note:** If your MongoDB password contains special characters such as `@`, `:`, `/`, `?`, or `#`, URL-encode those characters in your connection string.

---

## API Documentation

### Base URL

```text
http://localhost:3000
```

### 1. Authentication

Authentication endpoints allow users to register and log in to the application.

#### Register a User

`POST /api/auth/register`

Creates a new user account.

**Request Body:**

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Successful Response (201 Created):**

```json
{
  "id": "user_id",
  "email": "test@example.com",
  "role": "user"
}
```

**Possible Responses:**

| Status | Description |
|---|---|
| `201` | User successfully registered. |
| `400` | Invalid or incomplete request data. |
| `409` | Email address is already registered. |

#### Login

`POST /api/auth/login`

Authenticates an existing user and returns a JWT.

**Request Body:**

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Successful Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Possible Responses:**

| Status | Description |
|---|---|
| `200` | Authentication successful. |
| `400` | Invalid or incomplete request data. |
| `401` | Invalid email or password. |

---

### 2. Student Management

All student management endpoints require authentication.

Include the JWT in the Authorization header:

```http
Authorization: Bearer <your_token>
```

#### Available Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/students` | Retrieve all student records. |
| `GET` | `/api/students/:id` | Retrieve a specific student. |
| `POST` | `/api/students` | Create a new student record. |
| `PUT` | `/api/students/:id` | Update an existing student. |
| `DELETE` | `/api/students/:id` | Delete a student record. |

#### Student Request Body

For creating or updating a student:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "course": "CS",
  "year": 2
}
```

**Example:** Creating a Student

```http
POST /api/students
Authorization: Bearer <your_token>
Content-Type: application/json
```

**Example Response:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "course": "CS",
  "year": 2
}
```

The actual response may include additional MongoDB-generated fields such as `_id`, `createdAt`, and `updatedAt`.

---

### 3. Image Uploads

The API supports image uploads through Multer and Cloudinary.

#### Upload an Image

`POST /api/upload`

Uploads an image file to Cloudinary.

**Required Headers:**

```http
Authorization: Bearer <your_token>
```

**Request Configuration:**

| Setting | Requirement |
|---|---|
| Content Type | `multipart/form-data` |
| Form Field | `file` |
| Allowed Files | Image MIME types (`image/*`) |
| Maximum File Size | 5 MB |
| Authentication | Required |

**Successful Response (200 OK):**

```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "lesson7_uploads/abc123"
}
```

**Possible Responses:**

| Status | Description |
|---|---|
| `200` | Image successfully uploaded. |
| `400` | No file uploaded. |
| `400` | File type rejected by Multer. |
| `401` | Missing or invalid authentication token. |

**Upload Process:**

1. Authenticate the request using JWT.
2. Select an image file.
3. Send the file using `multipart/form-data`.
4. Multer validates the file and temporarily stores it in memory.
5. The application sends the file buffer to Cloudinary.
6. Cloudinary returns the image URL and public ID.

---

## Data Models

The application uses two primary MongoDB collections: `users` and `students`.

### User Model

The User model stores account information and authentication credentials.

| Attribute | Data Type | Description |
|---|---|---|
| `email` | String | Required, unique, lowercase email address. |
| `password` | String | Required bcrypt password hash. |
| `role` | String | User role: `user` or `admin`. Defaults to `user`. |
| `createdAt` | Date | Account creation timestamp. |
| `updatedAt` | Date | Last account update timestamp. |

### Student Model

The Student model stores student directory information.

| Attribute | Data Type | Description |
|---|---|---|
| `name` | String | Required student name. |
| `email` | String | Required, unique, lowercase email address. |
| `course` | String | Required course or program. |
| `year` | Number | Required academic year (1–5). |
| `createdAt` | Date | Record creation timestamp. |
| `updatedAt` | Date | Last record update timestamp. |

---

## Authentication and Upload Workflow

The API uses a token-based authentication process to protect sensitive endpoints.

### Authentication Workflow

1. **Registration:** A user submits an email and password. The server hashes the password using bcrypt before saving the account in MongoDB.
2. **Login:** The server retrieves the user account and verifies the submitted password using `bcrypt.compare()`.
3. **Token Generation:** If authentication succeeds, the server generates a signed JWT with a one-hour expiration.
4. **Protected Requests:** The client includes the JWT in the Authorization header when accessing protected endpoints.
5. **Token Verification:** Authentication middleware verifies the token before allowing access to protected routes.

### Image Upload Workflow

1. The authenticated client submits an image through a multipart/form-data request.
2. Multer processes the uploaded file using `memoryStorage()`.
3. The middleware checks the file type and maximum file size.
4. The file buffer is transferred to Cloudinary using its upload stream.
5. Cloudinary stores the image and returns its URL and public ID.
6. The API sends the upload information back to the client.

---

## Testing

The API can be tested using **Postman** or **Thunder Client** in Visual Studio Code.

### Recommended Manual Test Cases

| # | Method | Endpoint | Authentication | Expected Result |
|---|---|---|---|---|
| 1 | POST | `/api/auth/register` | Not required | `201 Created` |
| 2 | POST | `/api/auth/login` | Not required | `200 OK` + JWT |
| 3 | GET | `/api/students` | No token | `401 Unauthorized` |
| 4 | GET | `/api/students` | Valid token | `200 OK` |
| 5 | POST | `/api/students` | Valid token | Student created |
| 6 | POST | `/api/upload` | Valid token + image | `200 OK` + image URL |
| 7 | POST | `/api/upload` | Valid token + TXT file | `400 Bad Request` |
| 8 | POST | `/api/upload` | No token | `401 Unauthorized` |

### Testing Image Uploads

In Postman or Thunder Client:

1. Select the `POST` method.
2. Enter `http://localhost:3000/api/upload`.
3. Add the following Authorization header:

   ```http
   Authorization: Bearer <your_token>
   ```

4. Select the **Body** tab.
5. Choose **Form-Data**.
6. Set the key to `file`.
7. Change its type from Text to File.
8. Select an image and send the request.

A successful upload should return the Cloudinary image URL and public ID.

---

## Security Considerations

The application implements several security measures to protect user credentials, student information, and uploaded files.

| Security Measure | Implementation |
|---|---|
| Password Hashing | bcryptjs hashes passwords before database storage. |
| JWT Authentication | Protects student and upload endpoints. |
| Token Expiration | JWTs expire after one hour. |
| Generic Login Errors | Prevents revealing whether an email address is registered. |
| Password Protection | Passwords and password hashes are excluded from API responses. |
| Environment Variables | Sensitive credentials are stored in `.env`. |
| File Validation | Multer checks uploaded file MIME types and file size. |
| Cloud Storage | Uploaded images are stored in Cloudinary instead of local server storage. |

**Additional Security Notes:**

- MIME type validation alone does not guarantee that a file is a genuine or safe image. Production applications should also inspect file signatures and consider image re-encoding.
- Multer's memory storage avoids unnecessary disk operations, but uploaded files consume server RAM. File-size limits and upload rate limits help prevent resource exhaustion.
- JWT secrets and Cloudinary credentials should never be exposed in source code or public repositories.

---

## Reflection

### 1. Why is it dangerous to store passwords in plain text?

Storing passwords in plain text is dangerous because anyone who gains access to the database can immediately read users' passwords. This can also affect other accounts if users reuse the same password across different websites.

Using bcrypt provides an additional layer of security by hashing passwords with a unique salt. Instead of storing the original password, the database stores its hash, making it significantly more difficult for attackers to recover the original credentials.

### 2. Why do we return the same error for "user not found" and "wrong password"?

Returning the same error message, such as `401 Invalid credentials`, prevents attackers from determining whether a particular email address is registered in the system.

This security practice is called preventing **email enumeration**. It makes it more difficult for attackers to identify existing accounts and target them through phishing or credential-based attacks.

### 3. Why use `memoryStorage()` instead of `diskStorage()` for Cloudinary?

We use `memoryStorage()` because the application uploads files directly to Cloudinary, so permanently saving them on the local server is unnecessary.

Multer temporarily stores the uploaded file as a buffer in RAM. The application can then transfer that buffer directly to Cloudinary using its `upload_stream()` method.

Compared with `diskStorage()`, this approach avoids unnecessary disk operations, eliminates the need to manage temporary local files, and simplifies the upload process.

However, memory storage also requires proper file-size restrictions because uploaded files consume server memory while being processed.

---

## Author

**Kuyamix**

Student Directory API  
Lesson 5 – Authentication Lab  
Lesson 7 – File Upload Lab

---

## License

This project is licensed under the **MIT License**.

You are free to use, modify, and distribute this project in accordance with the terms of the license.
