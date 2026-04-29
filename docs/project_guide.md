# 📋 Task Management App — Hướng Dẫn Hoàn Chỉnh

## ✅ Trạng thái: TẤT CẢ ĐÃ SẴN SÀNG

| Kiểm tra | Kết quả |
|----------|---------|
| Backend lint | ✅ Pass |
| Backend test (3 tests) | ✅ Pass |
| Frontend lint | ✅ Pass |
| Frontend typecheck | ✅ Pass |
| Frontend test (3 tests) | ✅ Pass |
| Frontend build | ✅ Pass (206KB JS + 16KB CSS) |
| Docker files | ✅ Có Dockerfile + docker-compose.yml |
| CI/CD pipeline | ✅ GitHub Actions ci.yml |
| .env.example | ✅ Không chứa secret |
| .gitignore | ✅ Loại .env, node_modules |

---

## 📁 Cấu Trúc Project

```
OrderTrackingSystem/
├── .env                          ← KHÔNG commit – chứa secrets
├── .env.example                  ← COMMIT – mẫu không có giá trị thực
├── .gitignore
├── docker-compose.yml            ← Docker Compose cho toàn bộ hệ thống
├── .github/workflows/ci.yml     ← GitHub Actions CI pipeline
├── backend/
│   ├── Dockerfile                ← Docker image backend
│   ├── .dockerignore
│   ├── server.js                 ← Express entry point
│   ├── package.json
│   ├── vercel.json               ← Vercel deploy config
│   ├── eslint.config.js
│   ├── vitest.config.js
│   └── src/
│       ├── lib/supabase.js       ← Supabase admin client (lazy init)
│       ├── controllers/
│       │   ├── taskController.js ← CRUD + file upload/delete
│       │   ├── chatController.js ← Message history
│       │   └── homeController.js ← API docs endpoint
│       └── __tests__/
│           └── api.test.js
└── frontend/
    ├── Dockerfile                ← Multi-stage build (Node → Nginx)
    ├── .dockerignore
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    ├── vercel.json               ← SPA rewrite config
    ├── eslint.config.js
    ├── package.json
    └── src/
        ├── main.tsx
        ├── App.tsx               ← Main app with tabs (Tasks/Chat)
        ├── types.ts              ← Task, ChatMessage types
        ├── index.css             ← Premium dark UI with animations
        ├── lib/
        │   ├── api.ts            ← API fetch helper
        │   └── supabase.ts       ← Frontend Supabase client
        ├── hooks/
        │   └── useRealtimeTasks.ts ← Realtime subscription hook
        ├── components/
        │   ├── TaskForm.tsx
        │   ├── TaskList.tsx
        │   ├── TaskItem.tsx
        │   └── ChatBox.tsx       ← Broadcast chat (no backend)
        └── test/
            ├── setup.ts
            └── app.test.ts
```

---

## 🚀 Các Bước Tiếp Theo (Theo Thứ Tự)

### Bước 1: Cấu hình Supabase
1. Đăng nhập https://supabase.com → tạo project
2. Chạy SQL tạo bảng tasks + bảng messages:

```sql
-- Bảng tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text null,
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'done')),
  attachment_url text null,
  attachment_name text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Bảng messages (lưu lịch sử chat)
create table messages (
  id uuid primary key default gen_random_uuid(),
  user_name text not null,
  content text not null,
  created_at timestamptz not null default now()
);
```

3. Storage → New bucket → **task-attachments** → Public
4. Database → Publications → bật toggle cho bảng **tasks**

### Bước 2: Điền .env
Sửa file `.env` ở root với giá trị thực từ Supabase:

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
STORAGE_BUCKET=task-attachments
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_key

VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_BASE_URL=
```

### Bước 3: Chạy Local
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```
- Backend: http://localhost:3001/api/health → `{"ok":true}`
- Frontend: http://localhost:5173

### Bước 4: Git & Push
```bash
git init
git add .
git commit -m "feat: initial monorepo setup"
git remote add origin https://github.com/YOUR_USERNAME/my-task-app.git
git branch -M main
git push -u origin main
```

### Bước 5: Deploy Vercel (theo thứ tự)
1. **Backend** → Root: `backend` → Framework: Other → Thêm ENV vars
2. **Frontend** → Root: `frontend` → Framework: Vite → Thêm ENV vars + `VITE_API_BASE_URL`
3. **Update CORS** → Backend settings → `FRONTEND_URL` = URL frontend → Redeploy

### Bước 6: Docker
```bash
docker compose up -d
docker compose logs -f
```

### Bước 7: Thêm GitHub Secrets
Repository → Settings → Secrets → Actions:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`

---

## 🐛 Layer Thinking Quick Reference

| Hiện tượng | Layer | Fix |
|-----------|-------|-----|
| Trang trắng | L4 Frontend | Kiểm tra VITE_* env vars |
| CORS error | L3 Backend | Sửa FRONTEND_URL |
| API 500 | L3 Backend | Kiểm tra Supabase ENV vars |
| Upload fail | L2 External | Kiểm tra STORAGE_BUCKET |
| Realtime off | L2 External | Bật Publications cho bảng tasks |
| CI pass, Vercel fail | L1 Infra | Khai báo ENV vars trên cả 2 nơi |
