# MedLing — Ship Report (2026-06-13)

> Phiên "tiếp tục MedLing": từ một yêu cầu chỉnh sửa của Ralph → ra tính năng US/GB → ký Gate 2 → ship Gate 5.
> Báo cáo cô đọng để review. Chi tiết sống nằm ở `docs/governance/PROJECT_HANDOFF.md`.

## Bối cảnh đầu phiên
Vào phiên, Waves 0–F đã xong, kẹt ở 2 cổng người (Gate 2 ký bài, Gate 5 deploy) và 1 quyết định treo (D26 framework).
Khi review Gate 2, Ralph yêu cầu: **"spelling/IPA rạch ròi cả GB và US, người Việt chủ yếu học US, đưa giải pháp
tối ưu space-efficient"** — đây trở thành công việc chính của phiên.

## Đã giao

**1. D26 — chốt framework = vanilla** (ratified). Đóng câu hỏi treo từ Wave B; không migrate framework.

**2. D33 — công tắc giọng US/GB (US primary).** Phát hiện mấu chốt: voice pool thực ra là **en-US/CA**, không
phải en-GB như ghi chú cũ → để US làm chính *khớp* audio sẵn có, không phá D22.
- *Engine* (`app/engine.js`): state `accent` (localStorage, mặc định US) + helper `vIpa`/`vEn` cắm vào 3 chỗ
  render (chip vocab, flashcard, revision quiz); nút pill `US·GB` cạnh nút tốc độ; **audio giữ giọng Mỹ** cả 2 chế độ.
- *Validator*: nhận optional `ipa_gb`/`en_gb` (đã test cả ca lỗi).
- *Nội dung*: 10 bài 1A chuyển US-primary — US IPA mọi từ (giữ GB ở `ipa_gb`), 7 từ khác chính tả thêm `en_gb`
  (anemia/anaemia, edema/oedema, diarrhea/diarrhoea, ischemia, orthopedic, leukemia, hyperglycemia), prose chuẩn hóa US.
  IPA US sinh bằng luật hệ thống (rhotic /r/, /ɒ/→/ɑː/, /əʊ/→/oʊ/, yod-drop) + **soát tay 14 ca** (schwa cuối -er/-or → /ɚ/).
- *Spec*: `docs/specs/2026-06-12-us-gb-accent-toggle-design.md`.

**3. Gate 2 — Ralph ký cả 10 bài 1A.** Move `_drafts/1a-*.json` → `lessons/`, gỡ cờ DRAFT, đăng ký `index.json`;
picker tự đẩy 1A thành bài chơi được (lọc khỏi mục coming-soon).

**4. Gate 5 — ship live.** Repo `github.com/ralph-tdh/medling` (public) → push → GitHub Pages.
Live tại **https://ralph-tdh.github.io/medling/**.

**5. Audio CI — sửa 2 bug** (sót từ Wave 0 reorg): script tìm bài ở `scripts/lessons/` thay vì repo-root; và
đặt tên clip theo `sit["id"]` (chỉ PB có) thay vì chỉ số situation mà engine dùng. Sau khi sửa: CI sinh
**376 clip** cho 10 bài 1A, commit ngược + phục vụ live.

## Bằng chứng đã verify
- Validator **14/14**, 0 lỗi (sau mọi thay đổi nội dung + schema).
- Preview thật: mặc định US (`ˈkɑːrdioʊ`), bấm GB lật toàn bộ chip (`ˈkɑːdiəʊ`), audio không đổi, dính qua reload,
  console sạch (kèm screenshot trong phiên).
- Live verify: `engine.js` có `toggleAccent`/`vIpa`; `1a-01.json` có `ipa_gb` + US `ˈkɑːrdioʊ`; `1a-08` có
  `diarrhea`+`en_gb:diarrhoea`; file MP3 1A tải về HTTP 200; landing/app/index.json đều 200.

## Trạng thái hiện tại
**Cả 2 cổng người đã thông. Sản phẩm đang live**, có 4 bài demo (PB1–4) + 10 bài Stage 1A, đều miễn phí, có audio.

## Còn lại (tùy chọn, không gấp)
- **Supabase** project — khi muốn bật soft-gate đo pay-intent (`docs/DEPLOY.md` §D).
- **Cloudflare Pages** cutover — giảm độ trễ ở VN.
- **1B→3A** — author hàng loạt *sau khi* có dữ liệu học viên thật trên 1A (giữ D11/D32).
- **PB1–PB4 retrofit US-IPA** — hiện chạy ổn nhờ fallback; làm sau.

## Rủi ro / lưu ý
- Push thay đổi `lessons/*.json` sẽ kích CI tự commit MP3 ngược `main` → luôn `git pull --rebase` trước push kế.
- IPA là trường dễ sai nhất; US IPA mới nên được rà thêm khi có thời gian (Ralph đã spot-check 3 từ mẫu lúc ký).
- Soft-gate/freemium hiện chỉ là client-side intent (D21) — premium thật phải chờ Supabase RLS.
