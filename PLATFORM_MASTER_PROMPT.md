# 🌟 Master Prompt: Full-Stack Digital Platform Architecture 🌟

هذا الملف يحتوي على "البرومبت السحري" (Master Prompt) الذي يمكنك نسخه ولصقه لأي ذكاء اصطناعي (مثل Claude أو ChatGPT أو Gemini) عندما تريد بناء منصة جديدة بالكامل بنفس قوة، استقرار، وهيكلة منصتك الحالية.

---

## 📋 انسخ النص الموجود بالأسفل وأرسله للذكاء الاصطناعي:

```text
You are an expert Full-Stack Developer AI. I need you to build a complete, production-ready, full-stack digital platform from scratch. The goal is to build a robust architecture where I only need to plug in the final content and images. 

Below is the strict tech stack and feature requirements you must follow:

### 1. Technology Stack
- **Frontend:** Vanilla HTML5, CSS3 (Custom Variables, no Tailwind unless requested), and Vanilla JavaScript (ES6+).
- **Backend:** Node.js with Express.js.
- **Database & Auth:** Supabase (PostgreSQL & Supabase Auth).
- **Hosting:** Cloudflare Pages (Frontend) & Render.com (Backend).
- **Payments:** Gammal Tech Payment SDK.
- **Forms & Notifications:** Web3Forms API.
- **Booking:** Cal.com embedded widget.
- **Analytics:** Google Analytics 4 (GA4).

### 2. Core Systems & Features
- **Authentication System (No Email Verification):**
  - Sign-up must instantly register the user and log them in (Session saved in localStorage permanently).
  - Supabase Email Confirmation must be assumed OFF.
  - Users can log in later using their email and password.
  - Implement a secure `getSession()` logic across all frontend pages.
  - Trigger a Web3Forms `fetch` request from the frontend upon successful sign-up to notify the admin (Name, Email, Time).

- **Course / Premium Content Guard:**
  - Content pages must be protected. A script must verify if the user's session token has access to the specific product in the Supabase database.
  - If they don't have access, redirect them to a "Subscribe" modal or checkout page.
  - Implement a `?preview=admin_password` query parameter to bypass the guard for admin testing.

- **Payment Integration (Gammal Tech):**
  - Create a `payment-service.js` that initializes the Gammal Tech SDK.
  - Create a hidden `payment-success.html` callback page. When Gammal Tech redirects the user here, this page must call the backend to record the purchase in Supabase, then redirect the user to their purchased content.

- **Admin CMS (Content Management System):**
  - Create a hidden `admin.html` dashboard protected by a hardcoded admin password (or Supabase admin role).
  - The CMS must interact with the Node.js backend to perform CRUD operations (Create, Read, Update, Delete) + Reordering (order_index) for:
    1. Blog Posts.
    2. Testimonials / Reviews.
    3. FAQs.
  - The frontend must dynamically fetch and render these tables from the backend.

- **Contact & Inquiries:**
  - Implement a Contact Us form that uses Web3Forms to send messages directly to the admin email.

- **Booking System:**
  - Dedicate a section for booking consultations and embed a Cal.com iframe widget.

### 3. Architecture & File Structure
- Keep the frontend flat (HTML files in root) or in a clean `src/` folder that gets built into a `dist/` folder using a simple Node.js build script.
- Separate `css/style.css`, `js/script.js`, and `js/payment-service.js`.
- The Node.js backend should live in a `server.js` file with clean routing for `/api/auth`, `/api/database`, and `/api/payment`.

### 4. Implementation Steps
Please implement the platform step-by-step. Do not give me generic templates. Write the actual production-ready code for:
1. The Supabase SQL setup script (Tables: profiles, purchases, blog_posts, testimonials, faqs).
2. The Node.js backend (`server.js`).
3. The core Frontend UI (index.html, CSS framework, JS utilities).
4. The Auth & Payment flow (script.js, payment-service.js, payment-success.html).
5. The Admin CMS Dashboard.

Start by acknowledging this prompt and providing the complete Supabase SQL Setup Script.
```
