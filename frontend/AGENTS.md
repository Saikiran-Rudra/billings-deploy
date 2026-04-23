# AGENTS.md — Frontend Rules

## 🏗️ Tech Stack
- Next.js (App Router)
- TypeScript (STRICT)
- Tailwind CSS
- React Query (preferred for server state)

## 🎯 Goal
- Build scalable dashboard modules (Supplier, Purchase, Inventory)
- Follow clean architecture + reusable components
- Maintain Zoho Books–like UX

## 📂 Project Structure (STRICT)

- `app/` → Routing only (NO logic)
- `components/` → UI only (reusable)
- `data/` → configs + enums
- `services/` → API calls
- `validators/` → Zod schemas
- `hooks/` → business logic + API integration
- `store/` → global UI state only
- `types/` → all interfaces
- `lib/` → axios + config
- `utils/` → pure functions

## 📄 Pages Rules (`app/`)

- Pages are **routing shells only**
- ❌ No API calls
- ❌ No business logic
- ❌ No inline forms/tables

✅ Allowed:
- Import components
- Call hooks
- Pass props

## 🧩 Forms (STRICT RULES)

### ✅ Must Use:
- `FormWrapper`
- `InputField`
- `SelectField`
- `CheckboxField`
- `TextareaField`

❌ NEVER:
- Use raw `<input>`, `<select>`, `<textarea>`

## 📦 Form Config (MANDATORY)

All form fields must come from `data/`

## 📊 Tables

### ✅ Must Use:
- `DataTable`
- `TableRow`

❌ NEVER:
- Write raw `<table>`

## 🔌 API Calls (`services/`)

- One file per feature
- ❌ No axios/fetch in components
- Must return typed data

## 🧠 Hooks (`hooks/`)

- All business logic lives here

## ✅ Validation (`validators/`)

- Use Zod ONLY
- ❌ No inline validation

## 🧾 Types (`types/`)

- ❌ NEVER use `any`

## 📦 Data Layer (`data/`)

- Form configs
- Enums
- Dropdown options

❌ NEVER hardcode options in UI

## 🎨 UI Rules

- Tailwind only
- Fully responsive
- Clean dashboard layout

## ⚙️ State Management

- React Query → server data
- Zustand → global UI state

❌ Do NOT store server data in Zustand

## 🔐 Auth & Role

- Role checks in layout or middleware

## 🧱 Reusability Rules

- Extract repeated logic → hooks
- Extract repeated UI → components

## 📌 Mandatory States

Every page MUST handle:
- Loading
- Error
- Empty

## 🚫 STRICT DON'T RULES

- ❌ No `any`
- ❌ No inline API calls
- ❌ No raw form/table elements
- ❌ No hardcoded enums/options
- ❌ No business logic in pages
- ❌ No duplicate code

## ✅ DO RULES

- ✅ Use TypeScript strictly
- ✅ Follow folder structure
- ✅ Reuse components
- ✅ Use hooks for logic

## ⚡ Golden Rule

👉 Pages = structure  
👉 Hooks = logic  
👉 Services = API  
👉 Components = UI  
