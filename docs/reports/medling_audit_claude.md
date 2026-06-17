# MedLing — Independent Audit (Claude)

> **Hội đồng audit độc lập 4 thành viên**: Senior Frontend Engineer · Senior Backend Engineer · Expert ESP (Medical English) Teacher · Expert Medical Doctor — bối cảnh Việt Nam.
> Phương pháp: đọc trực tiếp **toàn bộ** mã nguồn và **cả 14 bài học** (PB1–4, 1a-01…10), schema Supabase, scripts, landing. Mọi nhận định kèm bằng chứng `file:line`.
> Ngày: 2026-06-17 · Baseline validator: `PASS — 14 files, 0 issues`.
> Mục tiêu file: liệt kê **đầy đủ nội dung cần hiệu chỉnh** + **trình tự hiệu chỉnh khoa học** + định vị/chiến lược.

---

## 0. Phạm vi đã kiểm

| Nhóm | File đã đọc |
|---|---|
| Frontend | `app/engine.js` (937 dòng), `app/index.html` (picker), `index.html` (landing), `brand/tokens.css`, `app/engine/{auth,softgate}.js` |
| Backend | `supabase/migrations/{0001_init,0002_access_and_entitlements}.sql`, `app/engine/auth.js` |
| Nội dung (14/14) | `lessons/pb1..pb4.json`, `lessons/1a-01..1a-10.json` |
| QA/Build/Governance | `scripts/validate_lessons.py`, `lessons/index.json`, `docs/curriculum/stage-map-1a-3a.md`, `CLAUDE.md`, `docs/governance/decision_log.md` |

---

## 1. Bảng điểm tổng hợp

| Mảng | Điểm | Một câu |
|---|---|---|
| Frontend | 6/10 | Đẹp, ship được; nợ kỹ thuật chín + a11y rớt + 0 test + design-token bị engine bỏ qua |
| Backend (thiết kế) | 7.5/10 | RLS/redeem đúng bài bản |
| Backend (vận hành) | 2/10 | Chưa deploy — rủi ro lớn nhất còn nguyên |
| English / ESP | 7/10 | Sư phạm spiral vững, song ngữ tốt; cue-leak + IPA chưa nhất quán + vài lời hứa per-lesson sai |
| Y khoa | 7/10 | Phạm vi & PB4 xuất sắc; **1 lỗi an toàn lặp lại** (decode-để-trấn-an) phải sửa |
| **Đo lường / Validation** | **1/10** | **Ship live mà mù dữ liệu — lỗi chiến lược #1** |

---

## 2. PHÁT HIỆN ĐẦU NÃO — sản phẩm đang "mù dữ liệu"

Hồ sơ dự án tự nói *"the bottleneck is validation, not code"* (`docs/governance/PROJECT_HANDOFF.md:68`). Nhưng trên site live:

1. **0 analytics.** Grep toàn repo `gtag|plausible|analytics|posthog|mixpanel|umami` → chỉ khớp tài liệu agent/skill; **không có trong** `index.html`, `app/index.html`, `engine.js`. Không đo funnel, drop-off theo màn hình, lượt audio, lượt toggle US/GB.
2. **Backend chưa tồn tại trong prod.** `auth.js` chạy `local` cho tới khi set `window.MEDLING_SUPABASE` (`app/engine/auth.js:22,42`). Mọi sync/entitlement/đo-pay-intent đều no-op.
3. **`pay_intent` (D32) không bắn được** vì cần Supabase (`app/engine/softgate.js` → `auth.logIntent` → `app/engine/auth.js:112`, fallback chỉ ghi `localStorage` rồi nằm đó).
4. **Phản hồi duy nhất = 1 Google Form** (`app/engine.js:923`).

→ Dự án đã "SHIPPED" nhưng **không học được gì từ việc ship**. Đây là lỗi nền tảng, phải xử trước mọi việc khác.

---

## 3. Sổ đăng ký theo bài (14/14)

`✅` đạt · `⚠️` lỗi nhẹ/P1–P2 · `🚩` lỗi an toàn/P0

| Bài | Chất lượng | Vấn đề chính (file:line) |
|---|---|---|
| pb1 | ⚠️ | **Cue-leak**: option lộ `(đoán đại)` / `(đoán)` → `pb1.json:504,630`. Distractor quá ngắn/lộ giọng. IPA = GB (chưa retrofit). |
| pb2 | ✅ | Decode `-itis/-ectomy/-ologist` chính xác; -ectomy mô tả đúng (không trấn an sai). IPA = GB. |
| pb3 | ✅ | Giao tiếp lâm sàng xuất sắc (AIDET, open vs closed Q, "kê đơn trước khi khám là không an toàn"). IPA = GB. Distractor hơi lộ giọng. |
| pb4 | ✅ | **Mẫu mực**: SpO2 94% → hành-động-không-trấn-an; HR 108 → plain language + escalate; register afebrile vs đời thường. 37.0 đúng. IPA = GB. |
| 1a-01 | ⚠️🚩 | `can_do` hứa "split root/**prefix**/suffix" nhưng bài chỉ dạy root+suffix+combining vowel (`1a-01.json:21,38`). Dạy "gastrology" mà không ghi chú từ thật là *gastroenterology* (`:114`). 🚩 Dialogue t2: "-logist = examines & advises, **not surgery**" — sai lâm sàng (`1a-01.json:177`). |
| 1a-02 | ⚠️🚩 | Nội dung morphology chính xác. 🚩 Dialogue: "Gastritis **is not cancer… usually treatable**" — trấn an tiên lượng từ hậu tố (`1a-02.json:165,178`). IPA US lẫn lộn ký pháp (ɝː vs ɑːr) trong 1 file. |
| 1a-03 | ⚠️ | Procedure suffix chính xác. Dialogue cholecystectomy = mô tả đúng nhưng feedback gọi là "reassuring" hơi lệch (`1a-03.json:164`). |
| 1a-04 | ⚠️ | Vị trí giải phẫu chính xác. Spelling leak US/GB: option "hypoglyc**ae**mia" cạnh "hyperglyc**e**mia" cùng 1 câu (`1a-04.json:55-56`), exp dùng GB (`:192`). |
| 1a-05 | ⚠️ | Chính xác. Dialogue close khái quát "**slow but harmless**" — bradycardia không mặc nhiên vô hại (`1a-05.json:181`); ca này có "asymptomatic" nên còn chấp nhận, nhưng câu close overreach. |
| 1a-06 | 🚩 | **(Bài có soft-gate).** Morphology tốt. 🚩 **Lỗi nặng nhất**: Dialogue t2 "Will they open me up?" → "**angiogram… '-gram' means image, not surgery**" (`1a-06.json:172-176`). Coronary angiogram là thủ thuật xâm lấn — dùng hậu tố để ngụ ý "không xâm lấn / yên tâm" là sai & chạm consent. |
| 1a-07 | ✅ | Hô hấp chính xác. Dialogue dyspnea **sạch** ("đừng làm bệnh nhân hoảng", không trấn an sai). |
| 1a-08 | ⚠️ | GI chính xác. Dialogue gastroscopy "**much gentler than surgery / won't hurt like operation**" (`1a-08.json:174`) — nội soi vẫn có khó chịu/rủi ro nhỏ; nên bớt cam kết "won't hurt". |
| 1a-09 | ✅ | Thần kinh/cơ/xương chính xác. Dialogue **sạch** ("not necessarily", phân biệt -algia/-scopy/-ectomy rõ). |
| 1a-10 | ⚠️ | Capstone dialogue **mẫu mực** ("mild keeps it calm", "worth a check"). NHƯNG title + `can_do` hứa "**name the three anatomical planes**" mà bài **không dạy** sagittal/coronal/transverse (`1a-10.json:23` vs các situation chỉ dạy hướng). |

**Kết luận corpus:** nội dung y khoa **chính xác xuyên suốt**; lỗi an toàn không nằm ở kiến thức mà ở **một mô-típ sư phạm**: dùng nghĩa hậu tố để đưa ra **trấn an lâm sàng** (xâm lấn / tiên lượng). Mô-típ này xuất hiện ở dialogue của 1a-01, 1a-02, 1a-06 (nặng), 1a-05, 1a-08 (nhẹ) — trong khi 1a-07, 1a-09, 1a-10 lại làm ĐÚNG. Cần chuẩn hóa toàn bộ về cách làm của 1a-10.

---

## 4. Phát hiện theo chuyên môn

### 4.1 Frontend Engineer (6/10)
**Mạnh:** shell+JSON (D13) — thêm bài không đụng code; mobile-first + PWA + offline; thẩm mỹ Atelier có gu.
**Lỗi:**
- **Design-token bị bỏ qua bởi engine.** `brand/tokens.css:107-126` định nghĩa `.ml-opt/.ml-vocab-chip/.ml-btn-primary` nhưng `engine.js` hardcode hex (`#4F6B57`…) khắp nơi (`engine.js:27-32,199-202,…`). Hai design-system song song; đổi màu thương hiệu = sửa CSS + săn hex thủ công.
- **A11y rớt WCAG:** `user-scalable=no, maximum-scale=1.0` chặn pinch-zoom (`app/index.html:5`, vi phạm 1.4.4); control `<span onclick role=button>` không `tabindex`/`keydown` → bàn phím/screen-reader không dùng được (`engine.js:131-133`); không focus management khi `renderApp()` thay toàn bộ `innerHTML`.
- **Monolith 937 dòng** sắp vượt luật D20 (`split >1000 dòng`); HTML nối chuỗi khó test/sửa.
- **0 test.** Glob `*test*/*spec*` chỉ ra file định nghĩa agent (`.claude/agents/testing-uat.md`), không phải test code — trong khi `CLAUDE.md:39` tuyên bố "Gate 3 end-to-end tests pass".
- **Validator là linter, không phải QA.** `validate_lessons.py` không bắt được: đáp án có đúng không, IPA có chuẩn không, audio clip tồn tại không, cue-leak, độ khó distractor → "PASS 0 issues" tạo an toàn giả.

### 4.2 Backend Engineer (thiết kế 7.5 / vận hành 2)
**Mạnh:** default-deny RLS mọi bảng (`0001_init.sql`); `lesson_content` chỉ đọc khi có entitlement khớp scope (`0002:79-86`); `redeem_access_key` atomic `for update` (`0002:41-61`); tách anon/service key đúng (`auth.js:7-10`).
**Lỗi:**
- **Vaporware trong prod:** schema đẹp nhưng chưa deploy; rủi ro lớn nhất (founder non-tech tự dựng Supabase + payment) chưa chạm.
- **`pay_intent` mở spam:** policy cho `user_id IS NULL` (`0002:104-106`) → bất kỳ ai cầm anon key insert vô hạn, không rate-limit.
- **Anti-share 2 thiết bị không thật:** `device_id` localStorage + check client-side (`auth.js:34-38,83-88`) → xóa storage/sửa JS là bỏ qua. Chỉ là MVP, đừng tính vào chống thất thoát doanh thu.
- **Email magic-link sai văn hóa VN:** `signInWithOtp` (`auth.js:55`); HCW VN dùng Zalo, deliverability OTP email là điểm rơi rụng.

### 4.3 ESP Teacher (7/10)
**Mạnh:** kỷ luật song ngữ EN/VI tuyệt đối; **spiral curriculum** xuất sắc — mỗi bài tái dùng bài trước có chủ đích ("Reuse Lesson 3/5/6", vd `1a-06.json:89`, `1a-07.json:117`) dồn về capstone `1a-10`; định hướng giao tiếp + an toàn (PB).
**Lỗi:**
- **Cue-leak (lỗi đánh giá nặng):** `pb1.json:504,630` lộ `(đoán đại)/(đoán)` trong option → đo sự tinh ý đọc tiếng Việt, không phải năng lực tiếng Anh. (Đã grep: **chỉ** ở pb1.)
- **Lời hứa per-lesson ≠ nội dung:** 1a-01 hứa "prefix" nhưng không dạy (`1a-01.json:21`); 1a-10 hứa "ba mặt phẳng giải phẫu" nhưng không dạy (`1a-10.json:23`).
- **IPA US chưa nhất quán ký pháp:** US-primary nhưng còn giữ dấu trường `ː` kiểu GB (`1a-01.json:46,51,106`), và trộn `ɝː` (US đúng) với `ɑːr` (lai) trong cùng file (`1a-02.json:49-50`). PB dùng IPA GB toàn bộ (chưa retrofit). Cùng từ `tachycardia` có 2 phiên âm khác nhau PB↔1A (`pb4.json:449` vs `1a-06.json:105`).
- **Spelling leak US/GB:** US-primary nhưng option/exp lọt spelling GB (`1a-04.json:55,192`).
- **Distractor đôi khi quá dễ:** đáp án đúng hay là phương án dài/lịch sự nhất; phương án sai cụt hoặc lộ giọng (PB1/PB3); ở situation-decode, distractor có sẵn gloss-sai nên triệt tiêu được ngay (độ phân biệt thấp).
- **Từ phi-idiomatic không cảnh báo:** "gastrology" dạy như "đúng" (`1a-01.json:114`) trong khi thực tế dùng *gastroenterology*.

### 4.4 Medical Doctor (7/10)
**Mạnh:** tôn trọng ranh giới "dạy tiếng Anh, KHÔNG dạy y khoa" (`CLAUDE.md:3`); nội dung free hiện tại rủi ro lâm sàng thấp (de-risk thông minh); **PB4 hiệu chỉnh lâm sàng mẫu mực**; số liệu nhất quán liên bài (60–100 bpm, SpO2 ≥95, 37.0).
**Lỗi an toàn (mô-típ "decode-để-trấn-an"):**
- 🚩 **Nặng — `1a-06.json:172-176`:** dùng "-gram = image, not surgery" để trấn an về **coronary angiogram** (thủ thuật xâm lấn: catheter, cản quang, rủi ro). Nghĩa hậu tố ĐÚNG; suy ra "không xâm lấn/yên tâm" thì SAI và chạm **consent**.
- 🚩 **Nặng — `1a-01.json:177`:** "-logist = examines and advises, **not surgery**" — gastroenterologist **có** làm thủ thuật xâm lấn (nội soi, sinh thiết).
- ⚠️ **Tiên lượng — `1a-02.json:165,178`:** "Gastritis is **not cancer… usually treatable**" — khẳng định lâm sàng từ hậu tố.
- ⚠️ **Overgeneralize — `1a-05.json:181`** ("slow but harmless"), **`1a-08.json:174`** ("won't hurt / much gentler").
- **Nguyên tắc phải dạy:** hậu tố cho biết **nghĩa từ**, KHÔNG cho biết mức xâm lấn/rủi ro/tiên lượng → chuẩn hóa theo cách `1a-10` đã làm đúng ("worth a check", "mild keeps it calm").

**Rủi ro quản trị:** một bác sĩ (Ralph) tự ký Gate 2 cho nội dung mình viết (`CLAUDE.md:38`) = **xung đột lợi ích**; cần ≥1 lâm sàng độc lập + 1 native ESL review trước khi mở rộng.

---

## 5. Sổ đăng ký lỗi hợp nhất (defect register)

**Mức độ:** P0 = chặn (an toàn/đo lường/đánh giá) · P1 = nên sửa trước khi phát tán rộng · P2 = nợ kỹ thuật/chất lượng.

| ID | Mức | Mảng | Mô tả | Vị trí | Cách sửa |
|---|---|---|---|---|---|
| OPS-01 | **P0** | Đo lường | Không có analytics trên site live | `index.html`, `app/index.html`, `engine.js` | Thêm module analytics vendor-neutral, degrade no-op (mirror `auth.js`) + wire funnel |
| MD-01 | **P0** | Y khoa | Decode-để-trấn-an về thủ thuật xâm lấn (angiogram) | `1a-06.json` dialogue t2 | Tách "nghĩa hậu tố" khỏi "xâm lấn/rủi ro"; chuyển phán đoán lâm sàng cho chuyên khoa |
| MD-02 | **P0** | Y khoa | "-logist = not surgery" (gastroenterologist làm thủ thuật) | `1a-01.json` dialogue t2 | Như trên |
| EN-01 | **P0** | Đánh giá | Cue-leak `(đoán)` lộ đáp án | `pb1.json:504,630` | Bỏ chú thích VN khỏi option |
| MD-03 | P1 | Y khoa | Trấn an tiên lượng "not cancer/treatable" | `1a-02.json:165,178` | Mềm hóa: decode nghĩa, không khẳng định tiên lượng |
| MD-04 | P1 | Y khoa | Overgeneralize "harmless"/"won't hurt" | `1a-05.json:181`, `1a-08.json:174` | Bỏ cam kết tuyệt đối; theo mẫu 1a-10 |
| EN-02 | P1 | ESP | Lời hứa per-lesson ≠ nội dung (prefix / planes) | `1a-01.json:21`, `1a-10.json:23` | Sửa `can_do`/title cho khớp, hoặc bổ sung situation |
| EN-03 | P1 | ESP | IPA US chưa nhất quán + PB chưa retrofit | toàn 1A + PB | Chuẩn hóa ký pháp US (bỏ `ː`, dùng ɚ/ɝː); retrofit PB |
| EN-04 | P1 | ESP | Spelling leak US/GB trong prose/option | `1a-04.json:55,192` | Thống nhất US trong `en`, GB chỉ trong `en_gb` |
| FE-01 | P1 | FE | A11y: chặn zoom + control không keyboard | `app/index.html:5`, `engine.js:131-133` | Bỏ `user-scalable=no`; thêm `tabindex`+`keydown`/đổi sang `<button>` |
| BE-01 | P1 | BE | `pay_intent` open-insert (spam) | `0002:104-106` | Rate-limit qua Edge Function / ràng buộc session |
| EN-05 | P2 | ESP | "gastrology" phi-idiomatic không cảnh báo | `1a-01.json:114` | Thêm note "từ thật: gastroenterology" |
| EN-06 | P2 | ESP | Distractor độ phân biệt thấp | nhiều bài | Làm distractor plausible hơn |
| FE-02 | P2 | FE | Engine bỏ qua design-token (hardcode hex) | `engine.js` | Dần thay hex bằng `var(--ml-*)` |
| FE-03 | P2 | FE | Monolith sắp vượt 1000 dòng, 0 test | `engine.js` | Tách module (D20) + thêm e2e cho Gate 3 |
| BE-02 | P2 | BE | Anti-share client-side; OTP email sai thị trường | `auth.js` | Gắn nhãn MVP; cân nhắc đăng nhập khác email |

---

## 6. Trình tự hiệu chỉnh khoa học (correction order)

Nguyên tắc sắp xếp: **(a) an toàn & uy tín trước** (lỗi rẻ-sửa nhưng đắt-uy-tín nếu bị bác sĩ phát hiện) → **(b) mở khả năng học hỏi** (đo lường) → **(c) chuẩn hóa nhất quán** → **(d) trả nợ kỹ thuật**. Mỗi bước có cổng kiểm (validator/preview).

**Đợt 0 — P0 (tuần này, vài giờ):**
1. **EN-01** bỏ cue-leak `pb1` → chạy `validate_lessons.py` (cổng).
2. **MD-01 + MD-02** sửa dialogue 1a-06 + 1a-01 → validator (cổng) + đọc lại bằng "nguyên tắc hậu tố".
3. **OPS-01** thêm `app/engine/analytics.js` + wire funnel → cổng: node syntax + preview no-console-error + xác nhận event bắn.

**Đợt 1 — P1 (2–4 tuần, sau khi chọn beachhead):**
4. **MD-03, MD-04** chuẩn hóa toàn bộ dialogue về mẫu 1a-10 (decode + "worth a check").
5. **EN-02** vá `can_do`/title (prefix, planes).
6. **EN-03, EN-04** thống nhất ký pháp IPA US + retrofit PB + dọn spelling leak.
7. **FE-01** a11y (bỏ chặn zoom, keyboard).
8. **BE-01** vá `pay_intent` (khi bật Supabase).

**Đợt 2 — P2 (sau khi có tín hiệu learner):**
9. **EN-05, EN-06** note idiomatic + nâng distractor.
10. **FE-02, FE-03** engine dùng token + tách module + e2e Gate 3.
11. **BE-02** xem lại auth cho thị trường VN.
12. Mời reviewer y khoa + ESL độc lập (gỡ xung đột lợi ích Gate 2).

---

## 7. Định vị & chiến lược

1. **Moat thật nhưng vô hình.** "Bám textbook · do bác sĩ thiết kế · dialogue tất định không hallucination" là khác biệt thật, nhưng learner mở app chỉ thấy một Duolingo nhỏ. → Surface moat: trích nguồn textbook/bài, badge "MD-reviewed", đặt branching-dialogue đối lập chatbot-bịa.
2. **Sai phân khúc theo pay-intent.** Ráp gốc Hy-La = nền tảng, độ khẩn cấp thấp. Pay-intent cao nằm ở: **HCW luyện OET/IELTS đi nước ngoài** (có deadline, có nỗi đau), **BV có khoa quốc tế** (B2B). → Chọn beachhead (đề xuất OET-bound HCW), tái sắp xếp nội dung quanh job-to-be-done; word-building thành "công cụ" không phải "sản phẩm".
3. **Bottleneck thật = distribution + đo lường.** Founder solo, non-tech, chưa có audience. "Build in public" mà không kênh + không đo = bay mù. Sửa OPS-01 trước, rồi đưa link cho 20–30 người đúng ICP và **xem họ học qua analytics** (kế hoạch hiện có ở `docs/outreach/`).
4. **Monetization còn lý thuyết.** Per-stage key, chưa payment provider (DD9), chưa giá VND (DD3); soft-gate không bắn được. → Test **offer thật** (kể cả thủ công: email/Zalo + chuyển khoản vào sớm) để đo giá, trước khi dựng full Supabase + payment.

**Một câu kết:** Code không phải vấn đề — build quá tốt so với giai đoạn. Vấn đề: **chưa biết ai trả tiền & vì sao, và chưa cắm cảm biến nào để tìm ra.** Sửa P0, chọn 1 beachhead, đưa cho 20 người thật — để dữ liệu quyết định.

---

## 8. Phụ lục — Patch log (Đợt 0 / P0) — ĐÃ THỰC THI 2026-06-17

Quy trình mỗi patch: **plan → execute → audit (cổng kiểm) → iterate**. Baseline & sau mỗi đợt: `validate_lessons.py = PASS, 14 files, 0 issues`.

| ID | Hành động | File | Cổng kiểm | Kết quả |
|---|---|---|---|---|
| EN-01 | Bỏ `(đoán đại)` / `(đoán)` khỏi 2 option | `lessons/pb1.json` | validator + fetch live: `cueLeak_remaining=[]` | ✅ |
| MD-01 | Viết lại dialogue t2 angiogram: tách nghĩa hậu tố khỏi mức xâm lấn, chuyển phán đoán cho cardiologist; đổi prompt "reassure"→"explain without promising clinical" | `lessons/1a-06.json` | validator + fetch live xác nhận text mới | ✅ |
| MD-02 | Viết lại dialogue t2 "-logist": bỏ "not surgery"; hậu tố chỉ gọi tên loại bác sĩ, không hứa về thủ thuật | `lessons/1a-01.json` | validator + fetch live xác nhận text mới | ✅ |
| OPS-01 | Thêm `app/engine/analytics.js` (vendor-neutral, no-op khi chưa cấu hình, tôn trọng DNT, không cookie/PII) + helper `track()` & 9 điểm funnel trong engine + picker_view/lesson_open trong picker | `app/engine/analytics.js` (mới), `app/engine.js`, `app/index.html` | `node --check` cả 2 file JS; preview 8081 | ✅ |

**Bug phát hiện & sửa trong vòng audit (OPS-01):** analytics.js ban đầu load `defer` → script inline của picker chạy ở parse-time TRƯỚC khi analytics sẵn sàng → sự kiện `lesson_open` của **deep-link** (đúng kịch bản Ralph gửi link bài cho learner) bị mất. **Sửa:** load analytics.js đồng bộ (không `defer`) — file nhỏ, không phụ thuộc, local. Verify lại: deep-link `lesson_open` đã được ghi.

**Bằng chứng runtime (preview localhost:8081, `?mldebug=1`):**
- 0 lỗi console khi tải app.
- Funnel bắn đúng & đủ payload: `lesson_open` → `lesson_start (sits=4)` → `practice_answer (si=0, correct=true)`, mỗi event có `lesson`, `accent`, `sid`.
- `mode='off'` khi chưa cấu hình (không truyền dữ liệu ra ngoài) — đúng thiết kế.

**Để KÍCH HOẠT đo lường thật (việc của Ralph — Gate 5, vì là publish ra ngoài):** đặt 1 dòng, ví dụ
`window.MEDLING_ANALYTICS = { mode:'plausible', domain:'ralph-tdh.github.io' };`
(hoặc `mode:'beacon', endpoint:'…'`). Trước khi có sink, mọi thứ no-op; thêm `?mldebug=1` để xem event tại chỗ.

**Còn lại (không thuộc P0, chưa đụng):** toàn bộ P1/P2 trong §5 (MD-03/04 chuẩn hóa dialogue theo mẫu 1a-10, EN-02 vá can_do/title prefix+planes, EN-03/04 IPA/spelling, FE-01 a11y, BE-01 rate-limit pay_intent, …) theo trình tự §6.
