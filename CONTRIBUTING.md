# 🧑‍💻 Contributing to FIARY

First off, thank you for your interest in contributing to **FIARY** — an integrated life dashboard built on the MERN stack.

We welcome developers, designers, and enthusiasts who want to help make FIARY smarter, cleaner, and more powerful.  
This document explains how to set up your environment, follow project conventions, and contribute effectively.

---

## ⚙️ Local Development Setup

### 🪜 Prerequisites
- **Node.js** v18 or newer  
- **MongoDB** (local or cloud cluster)  
- **Git** for version control  

### 🚀 Getting Started
```bash
# 1. Fork and clone the repository
git clone https://github.com/<your-username>/fiary.git
cd fiary

# 2. Install frontend dependencies
cd frontend
npm install

# 3. Run the frontend dev server
npm run dev

# 4. In a new terminal, start the backend server
cd ../backend
npm install
npm run dev
```

> Ensure that your backend \`.env\` file is correctly configured with your MongoDB URI, JWT secret, and any required API keys.

For detailed setup steps, refer to [\`setup.md\`](./setup.md).

---

## 🧩 Project Structure Overview

```
fiary/
├── frontend/
│   ├── src/
│   │   ├── api/              # API call modules (Auth, Entries, Habits, Finance, etc.)
│   │   ├── components/       # Shared UI components (Nav, Cards, Modals, etc.)
│   │   ├── pages/            # Feature pages (Journal, Tasks, Habits, Finance, etc.)
│   │   ├── redux/            # Redux slices and store setup
│   │   ├── config/           # Speech synthesis, constants, theme
│   │   └── AppContent.jsx    # Main routing logic
└── backend/
    ├── models/               # Mongoose schemas
    ├── routes/               # API routes
    ├── controllers/          # Business logic
    └── server.js             # Express app entry point
```

---

## 🔧 Coding Standards & Conventions

To maintain consistency and readability, please follow these conventions:

### 🧱 Frontend (React + Redux)
- Use **functional components** with hooks (\`useState\`, \`useEffect\`, etc.)
- Maintain **clean component structure**: logic → JSX → styles
- Follow **PascalCase** for components and **camelCase** for functions
- Prefer **Tailwind CSS utility classes** for styling
- Keep Redux slices focused and reusable — one slice per domain (e.g., \`streakSlice\`, \`navSlice\`, \`habitsSlice\`)
- Use **async thunks** for API calls where side effects are involved

### ⚙️ Backend (Node.js + Express + MongoDB)
- Use **async/await** for all database operations
- Follow **controller-service-model** separation
- Validate all incoming requests using middleware or validation libraries
- Return **standardized JSON responses**:
  ```json
  { "success": true, "data": {...}, "message": "optional" }
  ```
- Keep error handling consistent using Express middleware

### 🧭 Routing & Nav Logic
- Every page dispatches its navigation items to Redux:
  ```js
  dispatch(setNavItems([
    { id: 1, type: "link", name: "Movies", link: "/shelf?page=1" },
    { id: 2, type: "link", name: "Books", link: "/shelf?page=2" },
  ]));
  ```
- Use \`?page=\` query parameters for tabbed sections.  
  The \`Nav\` component automatically detects and highlights the active section.

---

## 🧠 Branching & Workflow

Follow the **feature-branch workflow**:

```bash
# Create a feature branch
git checkout -b feature/profile-page

# Work on your feature
# Commit with a clear, conventional message
git commit -m "feat: add profile edit form and avatar upload"

# Push and open a pull request
git push origin feature/profile-page
```

### 🧾 Commit Message Format
Follow **Conventional Commits**:
- \`feat:\` → new feature
- \`fix:\` → bug fix
- \`refactor:\` → code cleanup or re-architecture
- \`docs:\` → documentation updates
- \`style:\` → minor UI/styling changes
- \`chore:\` → misc, config, or dependency changes

Example:
```
feat: add monthly AI insights section
fix: resolve habit streak sync issue
refactor: optimize finance transaction queries
```

---

## 🧪 Testing Your Changes

Before submitting a PR:
- Verify app runs without console errors (\`npm run dev\`)
- Test API calls for correct backend responses
- Check UI responsiveness on both desktop and mobile
- Ensure Redux states update correctly
- Run lint check if enabled (\`npm run lint\`)

---

## 📬 Submitting Pull Requests

When your changes are ready:
1. Ensure your branch is **up to date** with \`main\`
2. Push your branch to your fork
3. Open a **Pull Request (PR)** to the main FIARY repository
4. Provide:
   - A clear summary of changes
   - Any relevant screenshots or videos
   - Linked issue numbers (if any)
5. A maintainer will review your PR and provide feedback or merge it

---

## 🧱 Developer Tips

- 🧠 Use \`console.warn\` and \`console.error\` for debugging — not \`alert()\`
- 🪶 Keep components small; extract repetitive UI into reusable ones (e.g., \`GlassCard\`)
- 🧩 Write **semantic commit messages** to keep history readable
- ⚡ Optimize state updates — avoid unnecessary Redux re-renders
- 📦 Use \`.env\` files for all secrets and API URLs

---

## 🤝 Code of Conduct

All contributors are expected to adhere to FIARY’s **Code of Conduct**.  
We foster a friendly, respectful, and inclusive developer community.  
A full version will be added as \`CODE_OF_CONDUCT.md\`.

---

## 💬 Need Help?

- For setup or environment issues: check [\`setup.md\`](./setup.md)
- For bugs or feature discussions: open an [Issue](https://github.com/your-username/fiary/issues)
- For quick clarification: comment on the relevant PR or issue thread

---

### 🪄 TL;DR

- Fork → Branch → Code → Commit → PR ✅  
- Follow the **existing structure and conventions**
- Keep your PRs small, clean, and focused  
- Always test before submitting

---

Thank you for contributing to **FIARY** —  
you’re helping build the most complete personal life dashboard. 🧠🔥
