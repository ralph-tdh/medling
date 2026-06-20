# MedLing Starter Pack — Build Blueprint

> Spec build-ready cho "Starter Pack" = 4 bài PB đóng gói thành 1 đơn vị **đo lường learner thật**.
> Nguồn: audit hội đồng 5 thành viên (`docs/reports/medling_audit_claude.md`). Ngày: 2026-06-18.
> Nguyên tắc cốt lõi: **CAPTURE — không GATE.** Đây là thiết bị đo để QUYẾT curriculum, không phải sản phẩm trả phí.

---

## 0. Mục tiêu (1 câu)
Biến 4 bài PB free thành **một diagnostic 60 phút có before/after** để trả lời 3 câu hỏi sống còn: **ai đến · họ có học được không · họ có ý định trả tiền không** — và khám phá **beachhead** rẻ nhất có thể.

## 1. Nguyên tắc (không vi phạm)
1. **Không tường cứng.** Mở thẳng; chỉ xin liên hệ ở *khoảnh khắc có giá trị* (post-survey), tùy chọn.
2. **Diagnostic parallel-forms.** Pre & post đo **cùng construct** → chứng minh *gain thật*, không chỉ "thấy hữu ích".
3. **Test NGÔN NGỮ, không test kiến thức y khoa** (giữ phạm vi).
4. **Song ngữ EN/VI** (D10). Pre ≤3 câu hồ sơ + ≤8 item; post ≤5 câu.
5. **Sink tối thiểu** — KHÔNG dựng Supabase/RLS cho nội dung free (D21 dành cho nội dung trả phí).
6. **Privacy-first** — PII tối thiểu + consent (Nghị định 13/2023). Tái dùng `app/engine/analytics.js` (đã ship, PR #1).

## 2. User flow (thứ tự màn)
```
[Intro pack]  →  [Profile 3Q]  →  [Pre-diagnostic 8Q form-A]  →  [PB1→PB2→PB3→PB4]
   →  [Post-diagnostic 8Q form-B]  →  [Kết quả: điểm trước/sau]  →  [Post-survey 5Q + contact tùy chọn]
   →  [Completion / chia sẻ / mời nhận bản đầy đủ]
```
- Mỗi bước **bỏ qua được** trừ Intro (đừng ép). Pre-diagnostic đặt SAU profile, TRƯỚC bài 1.
- "Kết quả trước/sau" là **phần thưởng** khiến learner chịu làm cả pre lẫn post.

## 3. Profile (3 câu — segment discovery)
Mục tiêu: biết AI đến. Single-select, song ngữ.
```jsonc
[
 { "id":"role",   "en":"You are a…", "vi":"Bạn là…",
   "opts":["Doctor / Bác sĩ","Nurse / Điều dưỡng","Medical student / SV y","Other HCW / NVYT khác","Not in healthcare / Khác"] },
 { "id":"goal",   "en":"Why learn medical English?", "vi":"Học tiếng Anh y khoa để làm gì?",
   "opts":["Work abroad / Làm việc ở nước ngoài","Pass OET-IELTS / Thi chứng chỉ","Foreign patients at work / BN nước ngoài","Study-CME / Học tập-CME","Personal / Cá nhân"] },
 { "id":"selflevel","en":"Your English now…", "vi":"Tiếng Anh hiện tại…",
   "opts":["Beginner / Mới bắt đầu","Can read a bit / Đọc được chút","Conversational / Giao tiếp được","Advanced / Khá-giỏi"] }
]
```
> `goal` là cột vàng: tỉ lệ chọn "Work abroad" / "Pass OET-IELTS" = **tín hiệu beachhead trực tiếp**.

## 4. Post-survey (5 câu — outcome + pay-intent)
```jsonc
[
 { "id":"confidence_after","type":"scale_1_5","en":"After this pack, decoding medical terms feels…","vi":"Sau pack, việc giải mã thuật ngữ thấy…" },
 { "id":"pay_intent","type":"single","en":"Would you pay for the full course?","vi":"Bạn có trả phí cho khóa đầy đủ không?",
   "opts":["Yes, tell me the price / Có, báo giá","Maybe, depends on price / Tùy giá","Free only / Chỉ học free","No / Không"] },
 { "id":"price_anchor","type":"single","en":"A fair price for one Level (~10-12 lessons)?","vi":"Giá hợp lý cho 1 Level (~10-12 bài)?",
   "opts":["<99k","99-199k","200-399k","400k+","Won't pay / Không trả"] },
 { "id":"nps","type":"scale_0_10","en":"Recommend MedLing to a colleague?","vi":"Giới thiệu MedLing cho đồng nghiệp?" },
 { "id":"contact","type":"optional_text","en":"Email or Zalo to get early access (optional)","vi":"Email/Zalo để nhận bản sớm (không bắt buộc)",
   "consent":"required_checkbox" }
]
```
> `pay_intent` + `price_anchor` = **Van Westendorp rút gọn** → định giá thật, không đoán (DD3).
> `contact` PHẢI tùy chọn + checkbox consent. KHÔNG bắt buộc để xem kết quả.

## 5. Diagnostic item bank (parallel A=pre / B=post)
8 item, **chỉ ngôn ngữ**, rút từ chủ đề PB1–4. Mỗi construct có 1 item form-A + 1 item form-B tương đương.
Tái dùng đúng schema `opts`/`ok`/`gl` của engine → render bằng UI có sẵn.

| # | Construct | Form A (pre) | Form B (post) |
|---|---|---|---|
| 1 | Decode hậu tố | "'-itis' means…" | "'-megaly' means…" |
| 2 | Đọc chỉ số | Read "120/80" aloud | Read "98% SpO2" aloud |
| 3 | Phản hồi BN an toàn | "What's this pill for?" (bạn không chắc) | "How long is the wait?" |
| 4 | Hỏi mở vs đóng | chọn câu hỏi mở mở đầu khám | chọn câu lắng nghe tích cực |
| 5 | Từ vựng điều hướng | "pharmacy" location response | "X-ray room" location response |
| 6 | Chuyên khoa từ chức danh | "dermatologist" treats… | "pulmonologist" treats… |
| 7 | Register BN vs hồ sơ | chọn cách nói nhiệt độ với BN | chọn cách báo vitals cho đồng nghiệp |
| 8 | Giải mã từ mới | "osteitis" = ? | "gastritis" = ? |

> Chấm tự động trong client; **gửi điểm pre/post + per-item correctness** lên sink. "Gain" = post − pre.
> Item viết theo chuẩn an toàn đã sửa (không "decode-để-trấn-an"); 1 ô `ok:true`, có `gl`.

## 6. Data model & sink
**Tái dùng `analytics.js` mode `beacon`** (đã build): mọi event/survey là 1 POST JSON. Thêm 2 event-type:
```jsonc
// survey response
{ "e":"survey", "phase":"profile|pre|post", "pack":"starter", "sid":"<rotating>", "answers":{...}, "t":<ms> }
// diagnostic score
{ "e":"diagnostic", "form":"A|B", "score":6, "total":8, "items":[{id,correct}], "sid":"...", "t":<ms> }
```
**Sink khuyến nghị (founder-friendly, $0, không server):** **Google Apps Script web-app → Google Sheet.**
- Deploy 1 Apps Script `doPost(e)` ghi `JSON.parse(e.postData.contents)` thành 1 dòng Sheet; publish "Anyone".
- Cấu hình: `window.MEDLING_ANALYTICS = { mode:'beacon', endpoint:'<apps-script-exec-url>' }` — **1 dòng, là việc của Ralph (Gate 5)**.
- Ralph đọc data ngay trong Sheet (hợp workflow Drive sẵn có). Đổi sang Plausible/Supabase sau mà không đụng client.
- *Phương án thay thế:* Cloudflare Worker + D1 (mạnh hơn, nhiều setup hơn). KHÔNG dùng Google Form redirect (rò rỉ, phá trải nghiệm).

## 7. Frontend integration (tái dùng engine, ít code)
- **Mới:** `app/engine/survey.js` — render 1 màn câu hỏi (tái dùng class `.opt`/`.mbtn`), gom đáp án, gọi `MedLing.analytics.track('survey'|'diagnostic', …)`. Vanilla, ~150 dòng, theo style module hiện có.
- **Mới:** `app/pack.html` (hoặc `?pack=starter` trong `app/index.html`) — wrapper điều phối flow §2; chuỗi 4 bài dùng `config.next` đã có (PB1→…→PB4 đã chain).
- **Sửa nhẹ:** sau PB4 (màn complete) → route sang post-diagnostic thay vì "Stay tuned".
- **Không** dựng auth/RLS. **Không** đổi schema lesson.
- Verify như PR #1: `node --check`, preview 8081, kiểm event bắn đúng qua `?mldebug=1`.

## 8. Privacy & consent (bắt buộc)
- PII duy nhất = `contact` (email/Zalo) — **opt-in checkbox**, copy rõ mục đích + lưu trữ.
- Copy gợi ý (VI): *"Tôi đồng ý nhận thông tin về MedLing. Bạn có thể rút bất cứ lúc nào."*
- Không thu tên thật/định danh nghề nghiệp chi tiết. `sid` xoay vòng, không cookie (đã có ở analytics.js).
- Nghị định 13/2023: nêu mục đích, cho rút lại, không chia sẻ bên thứ ba. Ghi retention (vd 12 tháng).

## 9. Metrics → quyết định (mỗi số liệu quyết gì)
| Tín hiệu | Quyết định |
|---|---|
| Phân bố `role` × `goal` | **Beachhead** (giả thuyết: "Work abroad / OET" thắng) |
| Funnel start→complete (analytics) | Pack có giữ chân không / bài nào rớt |
| `gain` = post − pre | **Bằng chứng học tập** (marketing + validation) |
| `pay_intent` "Yes/Maybe" % | Có nên viết 1B trả phí không |
| `price_anchor` mode | Giá khởi điểm test (DD3) |
| NPS | Có nên đẩy referral/lan toả không |

## 10. Build order + ước lượng
1. Apps Script sink + Sheet (Ralph, ~30 phút) → bật `MEDLING_ANALYTICS` (Gate 5).
2. `survey.js` + item bank (§3–5) (~1 ngày).
3. `pack.html` wrapper + route sau PB4 (~0.5 ngày).
4. Màn "kết quả trước/sau" (~0.5 ngày).
5. Verify (preview + mldebug) → phát tán cho **20–50 người đúng ICP** (`docs/outreach/`).
> Tổng ~2–3 ngày code. **Không** chạm backend/curriculum. Đây là cổng dữ liệu để quyết 102 bài còn lại.

---
*Liên kết: audit gốc `docs/reports/medling_audit_claude.md`; analytics đã ship `app/engine/analytics.js` (PR #1).*
