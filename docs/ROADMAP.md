# ROADMAP — Office Rush 3D

## Phase 1: MVP & Core Playable (Hoàn thành ✅)
- [x] Khởi tạo kiến trúc Vite + Three.js ES Modules.
- [x] Môi trường văn phòng 3D vô hạn (hành lang, vách cubicle, bàn làm việc, màn hình phát sáng, cây xanh, đèn trần).
- [x] Nhân vật ghế xoay 3D + bánh xe xoay + nghiêng thân khi chuyển làn + nhảy + aura Flow State.
- [x] 4 loại vật cản (Sếp, Máy in, Tháp hồ sơ, Sàn ướt) + 3 loại vật phẩm (Cà phê, KPI, Donut).
- [x] Hệ thống Combo, Multiplier, Flow State, 3 độ khó, xếp hạng công sở.
- [x] **Boss Key (`B`)** mở Excel giả + tự động mute/pause.
- [x] Âm thanh Web Audio API tổng hợp + lưu kỷ lục `localStorage`.
- [x] Unit test logic game (`node --test`) và build production (`vite build`).

---

## Phase 2: Visual Juice & Office Variety (2–3 tuần)
- [ ] **Hiệu ứng hạt (Particle System):** Vệt khói/tia sáng khi lướt ghế nhanh, giấy tờ bay tung tóe khi ủi bay tháp hồ sơ trong Flow State.
- [ ] **Kỹ năng trượt/cúi đầu (Slide/Duck `S` / `ArrowDown`):** Thêm vật cản trên cao (ví dụ: dây cáp treo, máy chiếu hạ xuống, sếp gọi video call).
- [ ] **Biến thể hành lang theo tầng:**
  - Tầng Dev (màn hình tối, đèn RGB)
  - Tầng Pantry (quầy pha chế, tủ lạnh)
  - Tầng Sếp (thảm đỏ, phòng kính)
- [ ] **Tùy biến Boss Key:** Cho phép chọn giao diện ngụy trang (Excel Budget, Jira Kanban Board, hoặc VS Code Terminal log).

---

## Phase 3: Retention & Meta-game (3–4 tuần)
- [ ] **Cửa hàng nâng cấp bằng Cà phê (`totalCoffees`):**
  - Mở khóa ghế công thái học (Herman Miller style), ghế gaming RGB, ván trượt văn phòng.
  - Nâng cấp thời gian Flow State hoặc nam châm hút KPI.
- [ ] **Daily Sprint / Nhiệm vụ hàng ngày:** Ví dụ *"Né 20 Sếp trong 1 lượt"*, *"Uống 10 ly cà phê"*.
- [ ] **Hệ thống thành tựu (Achievements):** Huy hiệu nội bộ công ty.

---

## Phase 4: Social & Leaderboard (4+ tuần)
- [ ] **Bảng xếp hạng công ty / phòng ban:** Backend nhẹ (Supabase / Cloudflare Workers) cho phép tạo phòng theo tên team.
- [ ] **Ghost Replay / Share Card:** Tạo ảnh tổng kết cuối ngày ("Hôm nay bạn đã né được 42 cuộc họp!") để chia sẻ lên Slack/Teams.
