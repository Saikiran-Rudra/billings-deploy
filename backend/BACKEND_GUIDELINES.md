# 🏗️ Backend Architecture Guidelines

## 📌 Tech Stack

- Node.js  
- TypeScript  
- Express.js  
- MongoDB (Mongoose)  

---

## 📁 Project Structure

```
src/
├── controllers/       # Handle req/res only
├── services/          # Business logic + DB operations
├── validators/        # Zod validation schemas
├── routes/            # Express routes (bind middleware + controllers)
├── middleware/        # Auth, role guard, company isolation, error handler
├── models/            # Mongoose schemas & interfaces
├── utils/             # Reusable helpers (formatResponse, sendEmail, etc.)
├── constants/         # Enums, roles, config values
└── types/             # Shared types, Express extensions
```

---

## 🎯 Core Principles

### 1. Thin Controllers
- Only:
  - Parse request (`req`)
  - Call service
  - Send response (`res`)
- ❌ No business logic  
- ❌ No DB queries  
- ❌ No email logic  

---

### 2. Services = Brain of the App
- Handle:
  - Business logic  
  - Database queries  
  - External services (email, tokens, etc.)  
- Throw errors using `AppError`

---

### 3. Validation (Zod)
- All validation schemas go inside `validators/`
- Called:
  - At route level OR
  - At top of service
- Must throw error if invalid

---

### 4. Centralized Error Handling

Use:

- `AppError` class for all custom errors  
- `errorHandler` middleware to catch all errors  

---

### 5. No Hardcoding

❌ Avoid:

```ts
if (role === "admin")
```

✅ Use:

```ts
import { ROLES } from "@/constants/roles";
```

---

### 6. Constants

All static values must go in `constants/`:

- Roles  
- Status values  
- Config keys  

---

### 7. Types

- No `any` ❌  
- All interfaces go in `types/`  
- Extend Express request:

```
req.userId
req.companyId
req.isSuperAdmin
```

---

### 8. Utilities

Reusable helpers go in `utils/`:

- `formatResponse`
- `sendEmail`
- `generateToken`

---

## 🔐 Middleware Responsibilities

- **Auth Middleware** → validate token, attach user info  
- **Role Guard** → check permissions  
- **Company Isolation** → ensure data belongs to company  
- **Error Handler** → centralized error response  

---

## 🧾 Example Flow

```
Route → Controller → Service → Model → DB
```

### Example:

```
POST /api/companies

→ route.ts
→ company.controller.ts
→ company.service.ts
→ company.model.ts
```

---

## ⚠️ Rules to Follow Strictly

- Controllers must be thin  
- Services contain ALL logic  
- Use `AppError` for all errors  
- Use centralized error handler  
- No business logic in routes/controllers  
- No direct DB calls outside services  
- No hardcoded strings  
- Always validate inputs  

---

## ✅ Output Standard (When Building a Feature)

Every feature must include:

```
controllers/
services/
validators/
routes/
models/
types/
```

---

## 🚀 Goal

Maintain a **clean, scalable, and production-ready backend architecture** with:

- Separation of concerns  
- Reusability  
- Maintainability  
- Security  

---

🔥 *Follow this strictly for every module and feature.*
