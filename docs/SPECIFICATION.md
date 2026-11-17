# SPECIFICATION — Office Rush 3D: Coffee & Deadlines

## 1. Tổng quan sản phẩm (Product Overview)
- **Tên game:** Office Rush 3D: Coffee & Deadlines
- **Thể loại:** 3D Endless Arcade Runner / Obstacle Dodger (WebGL / Three.js)
- **Đối tượng mục tiêu:** Dân văn phòng (chơi nhanh 1–3 phút trong giờ nghỉ trưa, giờ giải lao, hoặc lúc chờ build/deploy).
- **Giá trị cốt lõi:**
  - Chạy trực tiếp trên trình duyệt, tải nhanh, không cần cài đặt hay asset nặng bên ngoài.
  - Chủ đề văn phòng gần gũi: ghế xoay, cà phê đá, sếp rủ "Quick Sync", máy in kẹt giấy, tháp hồ sơ deadline, bánh donut phòng pantry.
  - Tích hợp **Boss Key (`B`)** chuyển tức thì sang giao diện bảng tính Excel giả và tắt toàn bộ âm thanh.

---

## 2. Core Gameplay Loop
1. Người chơi chọn chế độ chơi (`Chill Break`, `Crunch Time`, `Friday 5 PM`) và nhấn **Bắt đầu**.
2. Nhân vật ngồi trên ghế xoay 3D tự động trượt về phía trước dọc theo hành lang văn phòng 3 làn (`x ∈ {-2.6, 0, +2.6}`).
3. Người chơi điều khiển chuyển làn (`A`/`D` hoặc `⬅️`/`➡️`, vuốt ngang trên mobile) và nhảy (`W`/`Space`/`⬆️`, vuốt lên) để:
   - **Né vật cản:** Sếp (`manager`), Máy in kẹt giấy (`printer`), Tháp hồ sơ (`stack`), Biển sàn ướt (`wetfloor`).
   - **Thu thập vật phẩm:** Cà phê đá (`coffee`), Tài liệu duyệt KPI (`approval`), Bánh Donut (`donut`).
4. Thu thập liên tiếp vật phẩm tăng **Combo** và **Score Multiplier** (tối đa `x5`).
5. Thu thập đủ 3 ly cà phê kích hoạt **Flow State (5 giây)**: tăng +35% tốc độ, mở rộng FOV camera (62° → 70°), miễn nhiễm sát thương và ủi bay vật cản để nhận thưởng `+75 × multiplier`.
6. Khi **Tinh thần (Sanity)** về `0`, game chuyển sang màn hình **Game Over**, xếp hạng chức danh công sở và lưu kỷ lục vào `localStorage`.

---

## 3. Thông số kỹ thuật & Cơ chế chi tiết (Mechanics Spec)

### 3.1. Chế độ độ khó (`src/game/constants.js`)
| Chế độ | Tốc độ đầu | Tốc độ tối đa | Tăng tốc/giây | Tần suất spawn (s) | Tinh thần đầu |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Chill Break** (`chill`) | 12 | 24 | +0.18 | 1.15 → 0.58 | 4 ❤️ |
| **Crunch Time** (`crunch`) | 15 | 31 | +0.28 | 0.95 → 0.45 | 3 ❤️ |
| **Friday 5 PM** (`friday`) | 19 | 38 | +0.36 | 0.78 → 0.36 | 3 ❤️ |

### 3.2. Vật phẩm & Điểm số (`src/game/state.js`)
- **Điểm theo quãng đường:** `distanceDelta × 1.4 × multiplier`.
- **Cà phê đá (`coffee`):** `+60 × multiplier`, cộng `+34` Caffeine Energy (đạt 100 → kích hoạt **Flow State 5s**; nếu đang trong Flow State thì cộng thêm `+1s`, tối đa `5s`).
- **Tài liệu KPI (`approval`):** `+100 × multiplier`.
- **Bánh Donut (`donut`):** Hồi `+1` Tinh thần (nếu chưa đầy) + `+50 × multiplier`; nếu đã đầy Tinh thần thì thưởng `+120 × multiplier`.
- **Combo Multiplier:** `min(5, 1 + floor(combo / 4))`. Bị reset về `x1` khi va chạm vật cản (ngoài Flow State).

### 3.3. Vật cản & Va chạm (`src/game/spawner.js`)
- Mỗi wave spawn 1–2 vật cản, **luôn đảm bảo còn ít nhất 1 làn an toàn** (không tạo tường kín 3 làn).
- Va chạm tính bằng AABB 3D (`overlapX && overlapZ && overlapY`), cho phép nhảy qua các vật cản thấp như `wetfloor` (`height: 0.55`) hoặc `printer` (`height: 0.95`) khi đang ở đỉnh cú nhảy.
- Sau khi mất 1 Tinh thần, nhân vật có `1.4s` bất tử tạm thời (`invulnTimer`) kèm hiệu ứng nhấp nháy.

### 3.4. Boss Key / Stealth Mode (`B`)
- Nhấn phím `B` hoặc nút **📊 Boss Key [B]** trên HUD:
  - Lưu trạng thái hiện tại (`playing` → tự động pause về `paused`).
  - Tắt tiếng Web Audio ngay lập tức (nhớ trạng thái mute trước đó).
  - Đổi `<title>` tab trình duyệt thành `Q4_Budget_KPI_Tracker_FINAL_v3.xlsx - Excel`.
  - Hiển thị overlay bảng tính Excel giả toàn màn hình.
- Nhấn `B` lần nữa hoặc nút **Quay lại Game [B]** để khôi phục game và âm thanh.

### 3.5. Hệ thống xếp hạng công sở (`OFFICE_RANKS`)
- `0+`: 🪪 Thực tập sinh lạc lối
- `400+`: 💻 Junior né việc
- `1000+`: 🪑 Senior lướt ghế
- `2000+`: ☕ Tech Lead miễn nhiễm họp
- `3500+`: ⚡ Principal Coffee Architect
- `5500+`: 🏆 VP Về Đúng 5h00 Chiều

### 3.6. Âm thanh & Lưu trữ
- **Web Audio API (`src/game/audio.js`):** Tổng hợp hoàn toàn bằng oscillator (nhảy, đổi làn, uống cà phê, Flow State, va chạm, Game Over), không phụ thuộc file MP3/WAV ngoài.
- **Persistence (`localStorage`):** Lưu `bestScore`, `totalCoffees`, `runs` dưới key `office_rush_3d_stats_v1`.

---

## 4. Yêu cầu phi chức năng (Non-Functional Requirements)
- **Hiệu năng:** Mục tiêu 60 FPS trên trình duyệt desktop & mobile hiện đại; tái sử dụng geometry/material cho 8 segment hành lang cuộn vô hạn.
- **Kích thước bundle:** Build Vite gọn nhẹ, không external CDN assets.
- **Tương thích:** Hỗ trợ bàn phím (`WASD` / `Arrows` / `Space` / `B` / `M` / `P`) và cảm ứng (vuốt trái/phải/lên).
