# HANDOFF — Tài liệu bàn giao kỹ thuật

## 1. Cấu trúc thư mục
```text
office-rush-3d/
├── index.html              # DOM layout: Canvas, HUD, Modals, Boss Key Excel overlay
├── package.json            # Dependencies (three, vite) & scripts (dev, build, test)
├── vite.config.js          # Cấu hình Vite build (base: './', sourcemap: true)
├── README.md               # Hướng dẫn chạy nhanh
├── docs/
│   ├── SPECIFICATION.md    # Đặc tả game & thông số kỹ thuật
│   ├── ROADMAP.md          # Lộ trình phát triển theo giai đoạn
│   └── HANDOFF.md          # Tài liệu bàn giao cho developer
├── src/
│   ├── main.js             # Entry point: WebGLRenderer, camera, input, vòng lặp chính, UI binding
│   ├── styles/main.css     # Styling HUD, modals & giao diện Excel giả
│   └── game/
│       ├── constants.js    # Hằng số làn đường, độ khó, bảng xếp hạng, màu sắc, storage key
│       ├── state.js        # Pure state machine & logic điểm/combo/va chạm (tách khỏi Three.js để dễ test)
│       ├── audio.js        # Web Audio API synthesizer (SFX + mute)
│       ├── world.js        # Dựng & cuộn 8 segment hành lang văn phòng 3D
│       ├── player.js       # Mesh ghế xoay + nhân vật, vật lý nhảy, nghiêng làn, aura
│       └── spawner.js      # Spawn wave vật cản/vật phẩm & kiểm tra va chạm AABB
└── tests/
    └── state.test.js       # 7 unit tests cho core state logic bằng node:test
```

---

## 2. Lệnh vận hành (Run / Build / Test)
Yêu cầu: Node.js >= 20 (đã kiểm tra trên Node `v24.19.0`, npm `11.17.0`).

```bash
# Cài đặt dependencies
npm install

# Chạy môi trường dev (mặc định http://localhost:5173)
npm run dev

# Chạy unit tests
npm test

# Build bản production (xuất ra thư mục dist/)
npm run build

# Xem trước bản build production
npm run preview
```

---

## 3. Kiến trúc & Điểm mở rộng (Extension Points)

### Tách biệt Logic và Rendering
- Toàn bộ logic tính điểm, tốc độ, combo, Flow State, và xử lý va chạm nằm trong `src/game/state.js` dưới dạng **pure functions** (không import `three` hay `window`). Khi thêm cơ chế mới (ví dụ: khiên bảo vệ, nam châm), nên viết logic ở `state.js` trước rồi viết unit test trong `tests/state.test.js`.

### Thêm vật cản hoặc vật phẩm mới
1. Mở `src/game/spawner.js`:
   - Tạo hàm `build<NewItem>Mesh()` trả về `{ mesh, halfW, height, halfD }`.
   - Thêm key vào `hazardKinds` hoặc nhánh collectible trong `spawnWave(state)`.
2. Mở `src/game/state.js`:
   - Bổ sung thông báo vào `messages` trong `applyHazardHit()` hoặc nhánh xử lý mới trong `applyCollectible()`.

### Thêm chế độ chơi hoặc chức danh mới
- Chỉnh sửa `DIFFICULTIES` và `OFFICE_RANKS` trong `src/game/constants.js`.
- Nếu thêm độ khó mới trên UI, thêm button `<button class="diff-btn" data-diff="...">` tương ứng trong `index.html`.

### Tùy biến Boss Key
- Giao diện ngụy trang nằm trong `<section id="boss-overlay">` (`index.html`) và `.boss-overlay` (`src/styles/main.css`).
- Logic chuyển đổi trạng thái `stealth` nằm ở `toggleBossKey()` trong `src/main.js`.

---

## 4. Giới hạn hiện tại & Lưu ý khi bảo trì
- **Đồ họa procedural:** Toàn bộ model 3D hiện được dựng từ primitive geometries của Three.js (Box, Cylinder, Torus, Dodecahedron) để tối ưu dung lượng và không cần tải `.glb`. Nếu muốn nâng cấp lên model `.glb`, có thể dùng `GLTFLoader` trong `player.js` và `spawner.js`.
- **Pool bộ nhớ:** `spawner.js` hiện tạo mesh mới mỗi wave và `scene.remove()` khi đi qua. Ở tốc độ cao trên thiết bị yếu, có thể nâng cấp sang Object Pooling để giảm GC.
- **Âm thanh trình duyệt:** Web Audio `AudioContext` chỉ được khởi tạo/resume sau thao tác người dùng đầu tiên (theo chính sách autoplay của trình duyệt).
