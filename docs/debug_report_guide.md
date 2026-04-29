# Báo Cáo Thực Hành: Kỹ Năng Debug Theo Mô Hình Layer Thinking

Trong quá trình vận hành hệ thống, khi xảy ra sự cố (Incident), một kỹ sư DevOps cần áp dụng tư duy phân lớp (Layer Thinking) để khoanh vùng và xử lý lỗi nhanh chóng. Dưới đây là 4 kịch bản lỗi tương ứng với 4 Layer trong hệ thống Task Management.

---

## 💥 Kịch bản 1: Lỗi Layer 3 (Backend / API Layer) - Lỗi CORS
**Mô tả:** Frontend không thể gọi được API của Backend.

1. **Cách tạo lỗi giả (Trigger):**
   - Mở file `.env` ở máy tính.
   - Sửa dòng `FRONTEND_URL=http://localhost:5173` thành `FRONTEND_URL=http://localhost:9999` (sai port).
   - Khởi động lại Backend (`npm run dev` hoặc restart Docker).
2. **Hiện tượng (Observation):**
   - Truy cập trang web Frontend, danh sách Task hiển thị vòng xoay loading vô tận.
   - (Chụp ảnh màn hình) Mở F12 -> tab Console, sẽ thấy dòng chữ đỏ rực: `Access to fetch at '...' has been blocked by CORS policy`.
3. **Phân tích (Layer Thinking):**
   - Giao diện vẫn load được màu sắc -> L4 (Frontend) không sập.
   - Lỗi ghi rõ "CORS blocked" -> Backend từ chối request. Lỗi nằm ở **L3 Backend**.
4. **Nguyên nhân cốt lõi (Root Cause):**
   - Biến môi trường quy định danh sách được phép truy cập (`FRONTEND_URL`) bị cấu hình sai, dẫn đến cơ chế bảo mật CORS của trình duyệt chặn request.
5. **Cách khắc phục (Fix):**
   - Trả lại giá trị đúng: `FRONTEND_URL=http://localhost:5173` (hoặc URL Vercel). Restart Backend.

---

## 💥 Kịch bản 2: Lỗi Layer 2 (External / Database Layer) - Lỗi Xác thực Supabase
**Mô tả:** Mất kết nối Realtime và dữ liệu không thể tải về từ Database.

1. **Cách tạo lỗi giả (Trigger):**
   - Mở file `.env`.
   - Tìm biến `VITE_SUPABASE_ANON_KEY=...` và cố tình xóa đi 1 ký tự cuối cùng của cái Key đó.
   - Lưu lại và reload trang web Frontend.
2. **Hiện tượng (Observation):**
   - Không thấy danh sách Task hiển thị.
   - Chat realtime không kết nối được (không thấy thông báo Online).
   - (Chụp ảnh màn hình) Mở F12 -> tab Network, sẽ thấy các request gửi tới Supabase bị trả về trạng thái màu đỏ `401 Unauthorized` hoặc `403 Forbidden`.
3. **Phân tích (Layer Thinking):**
   - Frontend (L4) vẫn chạy tốt. Backend API (L3) có thể vẫn phản hồi healthcheck ok.
   - Các request giao tiếp trực tiếp với Supabase bị từ chối -> Lỗi ở **L2 External Systems**.
4. **Nguyên nhân cốt lõi:**
   - Client gửi request lên Supabase với sai thông tin mã khoá API Key (Anon Key), khiến hệ thống định danh từ chối cung cấp dữ liệu.
5. **Cách khắc phục:**
   - Khôi phục lại đúng đoạn mã `VITE_SUPABASE_ANON_KEY` và refresh trình duyệt.

---

## 💥 Kịch bản 3: Lỗi Layer 4 (Frontend / Client Layer) - Lỗi Render UI
**Mô tả:** Màn hình trắng tinh (White Screen of Death) khi vào ứng dụng.

1. **Cách tạo lỗi giả:**
   - Mở file `frontend/src/App.tsx`.
   - Ở dòng số 40 (hoặc dòng định nghĩa component), thêm đoạn code gây lỗi trực tiếp:
     ```typescript
     // Chèn dòng này ngay dưới dòng function App() {
     const oops = undefined;
     console.log(oops.crashApp); // Cố tình đọc thuộc tính của undefined
     ```
2. **Hiện tượng:**
   - Vừa vào trang web là màn hình trắng bóc, không có bất kỳ giao diện màu đen hay chữ nào hiện ra.
   - (Chụp ảnh) Mở F12 -> tab Console, sẽ thấy lỗi: `Uncaught TypeError: Cannot read properties of undefined (reading 'crashApp')`.
3. **Phân tích:**
   - Mã HTML vẫn được tải về, nhưng giao diện không hiện ra.
   - Lỗi báo rõ cú pháp JavaScript bị crash ngay tại trình duyệt của User -> Lỗi ở **L4 Frontend**.
4. **Nguyên nhân cốt lõi:**
   - Code React chứa logic gọi biến bị `undefined`, gây ra vỡ DOM ảo (Virtual DOM) khiến quá trình render toàn bộ ứng dụng bị huỷ bỏ (crash).
5. **Cách khắc phục:**
   - Xóa đoạn code lỗi vừa thêm vào đi.

---

## 💥 Kịch bản 4: Lỗi Layer 1 (Infra / Environment) - Container Unhealthy
**Mô tả:** Hệ thống sập do thiết lập sai Infra (Docker Compose).

1. **Cách tạo lỗi giả:**
   - Mở file `docker-compose.yml`.
   - Ở phần `backend`, tìm dòng `healthcheck: test: ["CMD", "wget", ... "http://127.0.0.1:3001/api/health"]`.
   - Cố tình đổi port `3001` thành `9999`.
   - Mở terminal chạy: `docker compose down` rồi `docker compose up -d`.
2. **Hiện tượng:**
   - (Chụp ảnh) Gõ lệnh `docker compose ps` vào terminal.
   - Sẽ thấy backend hiển thị là `(unhealthy)`.
   - Vài giây sau, frontend sẽ báo lỗi hoặc container không thể khởi động vì có thuộc tính `depends_on: backend: condition: service_healthy`.
3. **Phân tích:**
   - App chạy Local bình thường nhưng lên Docker bị sập.
   - Các thành phần không giao tiếp được với nhau ở cấp độ mạng nội bộ của Container -> Lỗi ở **L1 Infra**.
4. **Nguyên nhân cốt lõi:**
   - Cơ chế Healthcheck của Docker ping sai địa chỉ. Dù backend chạy tốt, Docker vẫn tưởng nó đã chết và không cho phép Container Frontend khởi động dựa trên dependency graph.
5. **Cách khắc phục:**
   - Đổi lại đúng port `3001` trong mục healthcheck của `docker-compose.yml` và chạy lại `docker compose up -d`.
