# FIARY - Local Setup Guide 🛠️

This guide will help you set up the FIARY project on your local machine for development or testing.

## Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js:** (Version 18.x or later recommended) - Download from [nodejs.org](https://nodejs.org/)
* **npm** (usually comes with Node.js) or **yarn**
* **MongoDB:** (Version 5.x or later recommended) - You can install it locally or use a cloud service like MongoDB Atlas.
    * [Install MongoDB Community Edition](https://www.mongodb.com/try/download/community)
    * [MongoDB Atlas (Cloud)](https://www.mongodb.com/cloud/atlas/register)
* **Git:** For cloning the repository.

## Setup Steps

### 1. Fork the Repository

First, navigate to the main FIARY repository on GitHub:

[https://github.com/Ritesh381/FIARY](https://github.com/Ritesh381/FIARY)

Click the "Fork" button in the top-right corner to create your own copy of the repository under your GitHub account.

### 2. Clone Your Fork

Now, clone the repository **from your fork**

```bash
git clone https://github.com/your-username/fiary.git
cd fiary
```

### 3. Backend Setup (Express.js & Node.js)

Navigate to the backend directory:

```bash
cd backend
```

Install backend dependencies:

```bash
npm install
# or
# yarn install
```

Create a \`.env\` file in the \`backend\` directory. This file will store your environment variables. Copy the contents of \`.env.example\` (if it exists) or create it with the following essential variables:

```dotenv
MONGODB_URI=your_mongodb_connection_string # Replace with your local or Atlas URI
GEMINI_KEY=your gemini api key
JWT_SECRET=your_strong_jwt_secret # Replace with a strong, random secret key
PORT=8080 # Or any other port you prefer
NODE_ENV=development
```

**Replace placeholders:**

* \`your_mongodb_connection_string\`: If using MongoDB locally, it might be \`mongodb://127.0.0.1:27017/fiary\`. If using Atlas, get the connection string from your cluster dashboard.
* \`your_strong_jwt_secret\`: Generate a random string (at least 32 characters) for security.

### 4. Frontend Setup (React.js)

Navigate to the frontend directory:

```bash
# From the project root directory:
cd ../frontend
# Or from the backend directory:
# cd ../frontend
```

Install frontend dependencies:

```bash
npm install
# or
# yarn install
```

Create a \`.env\` file in the \`frontend\` directory. Add the URL for your backend API:

```dotenv
# .env file in /frontend

# URL of your running backend server
VITE_BACKEND_URL=http://localhost:8080/api # Adjust port if needed
```

**Replace placeholders:**

* Make sure the \`PORT\` matches the one you set in the backend \`.env\` file. The \`/api\` suffix assumes your backend routes are prefixed with \`/api\`.

### 5. Running the Application

You'll need two terminal windows/tabs open.

**Terminal 1: Start the Backend Server**

Navigate to the \`backend\` directory and run:

```bash
npm run dev
# or
# yarn dev
```

(Assuming you have a \`dev\` script in your \`backend/package.json\` like \`"dev": "nodemon index.js"\` or \`"dev": "node index.js"\`).

The backend server should start, typically on \`http://localhost:8080\`.

**Terminal 2: Start the Frontend Development Server**

Navigate to the \`frontend\` directory and run:

```bash
npm run dev
# or
# yarn dev
```

The React development server (Vite) will start, usually on \`http://localhost:5173\` (or another port if 5173 is busy).

Open your browser and navigate to the frontend URL (e.g., \`http://localhost:5173\`). You should now be able to use the FIARY application locally!

## Troubleshooting

* **Connection Errors:** Double-check your \`MONGODB_URI\` and ensure your MongoDB server (local or Atlas) is running and accessible. Check firewall settings if needed.
* **API Errors:** Verify the \`VITE_BACKEND_URL\` in the frontend \`.env\` matches the running backend server address and port. Check the backend terminal for specific error messages.
* **Dependency Issues:** If you encounter errors during \`npm install\`, try deleting \`node_modules\` and \`package-lock.json\` (or \`yarn.lock\`) in both \`frontend\` and \`backend\` directories and running \`npm install\` again.

Happy coding! ✨