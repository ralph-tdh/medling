/* MedLing · Starter Pack — survey + diagnostic engine (validation instrument).
   Wraps the existing lesson engine with: intro → profile → pre-diagnostic → [PB1..PB4 w/ micro] →
   post-diagnostic → before/after result → post-survey → direction routing. CAPTURE-not-GATE:
   everything is skippable except the lessons; contact is opt-in (consent). Records to
   MedLing.analytics (no-op until a sink is configured). Bilingual EN/VI (D10). Language-only items
   (never tests medical knowledge). Loaded synchronously so ?pack routing is ready at boot.
   Ref: docs/specs/2026-06-18-starter-pack-blueprint.md + medling_starter_pack_refinement_update.md */
'use strict';
window.MedLing = window.MedLing || {};

(function (ML) {
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function app(){ return document.getElementById('app'); }
  function go(){ window.scrollTo(0,0); }

  /* ── pack state (localStorage) ───────────────────────────── */
  var KEY = 'medling.pack';
  function load(){ try { return JSON.parse(localStorage.getItem(KEY)||'null'); } catch(e){ return null; } }
  function save(s){ try { localStorage.setItem(KEY, JSON.stringify(s)); } catch(e){} }
  function reset(){ try { localStorage.removeItem(KEY); } catch(e){} }

  /* ── lesson progress (Q5/Q6): per-lesson record drives resume + post-test gate ──
     ORDER = the 4 Starter Pack lessons; nextIncomplete() = first one not yet done. */
  var ORDER = ['pb1','pb2','pb3','pb4'];
  function nextIncomplete(s){
    var done = (s && s.lessons) || {};
    for (var i=0;i<ORDER.length;i++){ if (!done[ORDER[i]]) return ORDER[i]; }
    return null;
  }

  /* ── cohort context: merged into EVERY track payload ───────
     role-mode contract: app/engine.js reads localStorage['medling.pack'].role */
  function cohort(){
    var s = load() || {};
    var c = { cohort:'medstudent_alpha' };
    if (s.role) c.role = s.role;
    if (s.year_group) c.year_group = s.year_group;
    if (s.english_level) c.english_level = s.english_level;
    if (s.primary_goal) c.primary_goal = s.primary_goal;
    return c;
  }
  function track(ev, props){
    try {
      if (!ML.analytics) return;
      var p = props || {}, c = cohort(), out = {};
      for (var k in c) if (c.hasOwnProperty(k)) out[k] = c[k];
      for (var k2 in p) if (p.hasOwnProperty(k2)) out[k2] = p[k2];
      ML.analytics.track(ev, out);
    } catch(e){}
  }

  /* ── role derivation from §6 Q1 group ─────────────────────
     med students → 'student'; doctor/postgrad → 'doctor';
     nurse → 'nurse'; tech/other-HCW/hospital-staff/other → 'other'. */
  function deriveRole(group){
    var g = String(group||'');
    if (/Sinh viên y/i.test(g)) return 'student';
    if (/Bác sĩ|sau đại học/i.test(g)) return 'doctor';
    if (/Điều dưỡng/i.test(g)) return 'nurse';
    return 'other';
  }

  /* ── content (single | multi | scale | text). Diagnostics are PARALLEL forms A/B. ── */
  /* §6 Pre-pack survey Q1–Q6 (target ≤ ~90s) */
  var PROFILE = [
    { id:'group', type:'single', en:'Which group are you in?', vi:'Bạn đang thuộc nhóm nào?', opts:[
      {t:'Sinh viên y năm 1–2'},{t:'Sinh viên y năm 3–4'},{t:'Sinh viên y năm 5–6'},
      {t:'Bác sĩ trẻ / sau đại học'},{t:'Điều dưỡng / KTV / NHS khác'},
      {t:'Nhân sự bệnh viện / CSKH / bảo hiểm / phiên dịch y khoa'},{t:'Khác'} ] },
    { id:'english_level', type:'single', en:'How do you rate your current English?', vi:'Bạn tự đánh giá trình độ tiếng Anh hiện tại?', opts:[
      {t:'Mất gốc / rất yếu'},{t:'A1–A2'},{t:'B1'},{t:'B2'},{t:'C1+'},{t:'Không chắc'} ] },
    { id:'goal', type:'multi', max:2, en:'What do you most need medical English for? (pick up to 2)', vi:'Bạn cần tiếng Anh y khoa nhất cho mục tiêu nào? Chọn tối đa 2.', opts:[
      {t:'Học phần / thi trong trường'},{t:'Học sau đại học'},
      {t:'Đọc textbook / guideline / paper quốc tế'},{t:'Đi lâm sàng / hỏi bệnh / hiểu bệnh án'},
      {t:'Báo cáo hội nghị / hội thảo / case presentation'},{t:'Giao tiếp với bệnh nhân nước ngoài'},
      {t:'Làm việc tại bệnh viện / phòng khám quốc tế'},{t:'Viết email / hồ sơ / báo cáo y khoa'},
      {t:'Thi chứng chỉ / OET / du học / làm việc nước ngoài'},{t:'Chưa rõ, chỉ muốn học nền tảng'} ] },
    { id:'difficulty', type:'multi', max:2, en:'Your biggest difficulty with Medical English? (pick up to 2)', vi:'Khó khăn lớn nhất của bạn khi học Medical English là gì? Chọn tối đa 2.', opts:[
      {t:'Từ vựng dài, khó nhớ'},{t:'Không biết bắt đầu từ đâu'},{t:'Tài liệu khô khan, dễ chán'},
      {t:'Học xong nhanh quên'},{t:'Đọc tài liệu/guideline chậm'},{t:'Sợ nói/sai phát âm'},
      {t:'Không biết dùng từ trong ngữ cảnh lâm sàng'},{t:'Không có lộ trình rõ'},{t:'Thiếu feedback'},{t:'Khác'} ] },
    { id:'current_method', type:'single', en:'How do you currently learn Medical English?', vi:'Bạn hiện đang học Medical English bằng cách nào?', opts:[
      {t:'Sách/textbook'},{t:'Tài liệu ở trường'},{t:'YouTube/social media'},{t:'Quizlet/Anki/flashcard'},
      {t:'ChatGPT/AI'},{t:'Khóa học online/offline'},{t:'Tự tra khi cần'},{t:'Gần như chưa học'} ] },
    { id:'want_help', type:'single', en:'Where do you most want MedLing to help you?', vi:'Bạn muốn MedLing giúp bạn nhất ở phần nào?', opts:[
      {t:'Giải mã thuật ngữ'},{t:'Học từ vựng theo chuyên khoa'},{t:'Đọc textbook/guideline/paper'},
      {t:'Giao tiếp bệnh nhân'},{t:'Trình bày case/hội nghị'},{t:'Nghe nói/phát âm'},
      {t:'Viết email/hồ sơ/báo cáo'},{t:'Ôn tập bằng flashcard/FSRS'},{t:'Chưa rõ'} ] }
  ];

  /* §7 Micro-feedback after each PB (keep light: 2–3 questions) */
  var MICRO = [
    { id:'useful', type:'scale', min:1, max:5, en:'How useful was this lesson for you?', vi:'Bài này hữu ích với bạn mức nào?', lo:'Not — Không', hi:'Very — Rất' },
    { id:'continue', type:'single', en:'Did this make you want to keep learning?', vi:'Bài này làm bạn muốn học tiếp không?', opts:[
      {t:'Có — Yes'},{t:'Không — No'},{t:'Không chắc — Not sure'} ] },
    { id:'note', type:'text', en:'One thing you liked or disliked? (optional)', vi:'Một điều bạn thích hoặc không thích ở bài này? (không bắt buộc)' }
  ];

  /* Diagnostics = 4 language-only items, ONE per PB lesson (Q4); rewritten for measurement validity (audit P0-4):
     d1→pb1 give a SPECIFIC direction · d2→pb2 decode a suffix · d3→pb3 self-introduction · d4→pb4 read a value aloud.
     Pre (A) and post (B) test the SAME construct per lesson (different wording). Distractors are length- and
     register-matched, with a polite-but-wrong option, so the correct answer is never simply the longest/most-polite
     one — this removes the cue-leak that previously let test-wise learners pass without knowledge. */
  var DIAG_A = [
    { id:'d1', en:"A patient asks where the X-ray room is. Best reply?", vi:"BN hỏi phòng X-quang ở đâu. Trả lời tốt nhất?", opts:[
      {t:"It's on the second floor, turn left. — Ở tầng hai, rẽ trái.", ok:true},{t:"It's somewhere over there, I think. — Hình như đâu đó phía kia."},{t:"I'm not sure — try asking reception. — Tôi không chắc, hỏi lễ tân xem."} ] },
    { id:'d2', en:"The suffix '-itis' means…", vi:"Hậu tố '-itis' nghĩa là…", opts:[
      {t:'Inflammation — Viêm', ok:true},{t:'Removal — Cắt bỏ'},{t:'Enlargement — To ra'} ] },
    { id:'d3', en:"You meet a new patient for the first time. Best way to begin?", vi:"Bạn gặp một BN mới lần đầu. Cách mở đầu tốt nhất?", opts:[
      {t:"Hello, I'm Dr. Nam — I'll be seeing you today. — Chào, tôi là BS Nam, sẽ khám cho bạn hôm nay.", ok:true, t_role:{
        doctor:"Hello, I'm Dr. Nam — I'll be seeing you today. — Chào, tôi là BS Nam, sẽ khám cho bạn hôm nay.",
        nurse:"Hi, I'm Nam — one of the nurses looking after you today. — Chào, tôi là Nam, điều dưỡng chăm sóc bạn hôm nay.",
        student:"Hello, I'm Nam — a medical student working with your doctor. — Chào, tôi là Nam, sinh viên y khoa làm việc cùng bác sĩ của bạn." }},{t:"Could you tell me your symptoms first? — Cho tôi biết triệu chứng trước nhé?"},{t:"Please wait here, I'll be with you shortly. — Vui lòng chờ đây, tôi tới ngay."} ] },
    { id:'d4', en:"How do you read a blood pressure of 120/80 aloud?", vi:"Đọc huyết áp 120/80 thành lời thế nào?", opts:[
      {t:'120 over 80', ok:true},{t:'120 slash 80'},{t:'120 and 80'} ] }
  ];
  var DIAG_B = [
    { id:'d1', en:"A patient asks where the pharmacy is. Best reply?", vi:"BN hỏi quầy thuốc ở đâu. Trả lời tốt nhất?", opts:[
      {t:"It's on the ground floor, near the entrance. — Ở tầng trệt, gần lối vào.", ok:true},{t:"It's around here somewhere, I think. — Hình như quanh đây thôi."},{t:"I don't know — try asking reception. — Tôi không biết, hỏi lễ tân xem."} ] },
    { id:'d2', en:"The suffix '-ectomy' means…", vi:"Hậu tố '-ectomy' nghĩa là…", opts:[
      {t:'Removal — Cắt bỏ', ok:true},{t:'Inflammation — Viêm'},{t:'Enlargement — To ra'} ] },
    { id:'d3', en:"A new patient enters and sits down. Your first words?", vi:"BN mới bước vào và ngồi xuống. Câu đầu tiên?", opts:[
      {t:"Good morning, I'm Dr. Lan — your doctor today. — Chào buổi sáng, tôi là BS Lan, bác sĩ của bạn hôm nay.", ok:true, t_role:{
        doctor:"Good morning, I'm Dr. Lan — your doctor today. — Chào buổi sáng, tôi là BS Lan, bác sĩ của bạn hôm nay.",
        nurse:"Good morning, I'm Lan — your nurse today. — Chào buổi sáng, tôi là Lan, điều dưỡng của bạn hôm nay.",
        student:"Good morning, I'm Lan — a medical student on the team. — Chào buổi sáng, tôi là Lan, sinh viên y khoa trong nhóm." }},{t:"Have you been waiting here very long? — Bạn chờ ở đây lâu chưa?"},{t:"Do you have your appointment card ready? — Bạn có sẵn thẻ hẹn chưa?"} ] },
    { id:'d4', en:"How do you read an oxygen saturation of 98% aloud?", vi:"Đọc SpO2 98% thành lời thế nào?", opts:[
      {t:'98 percent', ok:true},{t:'98 per hundred'},{t:'9, 8 percent'} ] }
  ];

  /* §8 Post-pack survey Q1–Q8 */
  var POST = [
    { id:'fit_who', type:'text', en:'After 4 Starter lessons, who do you think MedLing fits best?', vi:'Sau 4 bài Starter Pack, bạn nghĩ MedLing phù hợp nhất với ai?' },
    { id:'most_useful', type:'single', en:'Most useful thing about the Starter Pack?', vi:'Điều hữu ích nhất của Starter Pack là gì?', opts:[
      {t:'Giúp bớt sợ Medical English'},{t:'Giúp hiểu cách học thuật ngữ'},{t:'Bài học ngắn, dễ theo'},
      {t:'Tình huống gần với y khoa'},{t:'Có song ngữ EN/VI'},{t:'Có audio/quiz/review'},{t:'Khác'} ] },
    { id:'weakness', type:'single', en:'Biggest weakness of the Starter Pack?', vi:'Điểm yếu lớn nhất của Starter Pack là gì?', opts:[
      {t:'Quá dễ'},{t:'Quá cơ bản'},{t:'Quá nhiều thuật ngữ'},{t:'Chưa đủ tình huống lâm sàng'},
      {t:'UI/UX chưa mượt'},{t:'Chưa có speaking/roleplay'},{t:'Chưa có review dài hạn'},{t:'Khác'} ] },
    { id:'different', type:'single', en:'Does MedLing feel different from Quizlet/Anki/YouTube/ChatGPT?', vi:'Bạn có thấy MedLing khác Quizlet/Anki/YouTube/ChatGPT không?', opts:[
      {t:'Có, khác rõ'},{t:'Có, nhưng chưa nhiều'},{t:'Không rõ'},{t:'Không khác'} ] },
    { id:'different_why', type:'text', en:'How is it different / not yet different? (optional)', vi:'Khác ở đâu / chưa khác ở đâu? (không bắt buộc)' },
    { id:'direction', type:'multi', max:2, en:'After the Starter Pack, which track(s) should MedLing unlock next? (pick up to 2)', vi:'Sau Starter Pack, bạn muốn MedLing mở khóa hướng nào tiếp theo? Chọn tối đa 2.', opts:[
      {t:'Medical Term Decoder / thuật ngữ & gốc từ', bucket:'A'},
      {t:'Specialty vocabulary theo chuyên khoa', bucket:'A'},
      {t:'Guideline/textbook/paper reading', bucket:'B'},
      {t:'Case presentation / báo cáo hội nghị', bucket:'C'},
      {t:'Clinical communication / hỏi bệnh / giải thích bệnh', bucket:'D'},
      {t:'AI roleplay / speaking feedback', bucket:'D'},
      {t:'Pronunciation', bucket:'E'},
      {t:'Medical writing / email / documentation', bucket:'F'},
      {t:'OET / du học / career mobility', bucket:'G'},
      {t:'Hospital admin / insurance / GOP', bucket:'H'} ] },
    { id:'stage1a', type:'single', en:'Want to continue to Stage 1A — Medical Term Decoder?', vi:'Bạn có muốn học tiếp Stage 1A — Medical Term Decoder không?', opts:[
      {t:'Có, muốn học ngay'},{t:'Có thể, nếu bài học thú vị hơn'},{t:'Chưa chắc'},{t:'Không'} ] },
    { id:'pay_intent', type:'single', en:'What might you pay for in the future?', vi:'Bạn có sẵn sàng trả tiền cho phần nào trong tương lai?', opts:[
      {t:'Không, chỉ muốn dùng miễn phí'},{t:'Có thể trả cho thuật ngữ/chuyên khoa'},
      {t:'Có thể trả cho đọc guideline/paper'},{t:'Có thể trả cho case presentation/hội nghị'},
      {t:'Có thể trả cho speaking/AI roleplay'},{t:'Có thể trả nếu có lộ trình/chứng nhận rõ'},{t:'Chưa chắc'} ] },
    /* price-band signal (audit P0-3): stated-preference, no commitment — lets the founder anchor a price. */
    { id:'price_band', type:'single', en:'If you were to pay, what monthly price would feel fair?', vi:'Nếu trả phí, mức giá theo tháng nào bạn thấy hợp lý?', opts:[
      {t:'Dưới 99k / tháng — Under 99k'},{t:'99–199k / tháng'},{t:'200–399k / tháng'},
      {t:'400k+ / tháng'},{t:'Mình sẽ không trả — Would not pay'} ] }
  ];

  /* §11 direction buckets A–H → track labels for the routing screen */
  var BUCKETS = {
    A: { en:'Terminology / Specialty Foundation', vi:'Thuật ngữ & chuyên khoa', track:'Stage 1A — Medical Term Decoder (open now)' },
    B: { en:'Clinical Reading / Guideline / Paper', vi:'Đọc guideline / textbook / paper', track:'Layer 2A — Clinical Reading (waitlist)' },
    C: { en:'Case Presentation / Conference', vi:'Case presentation / hội nghị', track:'Layer 3 — Academic Output (waitlist)' },
    D: { en:'Clinical Communication / Roleplay', vi:'Giao tiếp lâm sàng / roleplay', track:'Layer 2B — Clinical Communication (waitlist)' },
    E: { en:'Pronunciation / Speaking', vi:'Phát âm / nói', track:'Speaking track (waitlist)' },
    F: { en:'Medical Writing / Documentation', vi:'Viết / hồ sơ y khoa', track:'Layer 3 — Medical Writing (waitlist)' },
    G: { en:'OET / Career Mobility', vi:'OET / du học / nghề nghiệp', track:'Layer 4 — Career Mobility (waitlist)' },
    H: { en:'Hospital Admin / Insurance / GOP', vi:'Hành chính BV / bảo hiểm / GOP', track:'Layer 4 — Hospital Admin (waitlist)' }
  };

  /* ── UI primitives (reuse engine classes .opt/.mbtn/.obtn) ── */
  function shell(inner){
    return '<div style="height:4px;background:linear-gradient(90deg,#B5A98E,#8DA088,#4F6B57,#33473A)"></div>'
      +'<div class="su" style="max-width:460px;margin:0 auto;padding:24px 16px 32px">'+inner+'</div>';
  }
  function head(en, vi){
    return '<div style="margin-bottom:16px">'
      +'<div style="font-size:14px;font-weight:600;color:#1E2B23;line-height:1.5">'+esc(en)+'</div>'
      +(vi?'<div style="font-size:12px;color:#7A7461;font-style:italic;line-height:1.5">'+esc(vi)+'</div>':'')+'</div>';
  }

  /* role-aware option text (role review A): show o.t_role[role] when present, else base o.t — so a
     single-choice item's correct answer matches the learner's role (e.g. d3 self-introduction).
     Scoring is unaffected: the `ok` flag lives on the option, not the role variant. */
  function roleOpt(o){
    try { var r = localStorage.getItem('medling.roleview') || ((load() || {}).role);
      if (r && o.t_role && o.t_role[r]) return o.t_role[r]; } catch(e){}
    return o.t;
  }

  /* runSeq: step through a list of question items, collecting answers, then onDone(answers).
     Types: single | multi (max-select + "Done →") | scale | text. */
  function runSeq(items, label, onDone){
    var i = 0, answers = {};
    function step(){
      if (i >= items.length){ onDone(answers); return; }
      var q = items[i], n = items.length;
      var prog = '<div style="font-size:11px;font-weight:600;color:#5E7268;margin-bottom:10px">'+esc(label)+' · '+(i+1)+'/'+n+'</div>';
      var body;
      if (q.type === 'scale'){
        var btns = '';
        for (var v=q.min; v<=q.max; v++) btns += '<button class="opt" style="justify-content:center;min-width:38px;flex:1" data-v="'+v+'">'+v+'</button>';
        body = head(q.en,q.vi)
          +'<div style="display:flex;gap:6px;flex-wrap:wrap">'+btns+'</div>'
          +'<div style="display:flex;justify-content:space-between;font-size:10px;color:#7A7461;margin-top:6px"><span>'+esc(q.lo||'')+'</span><span>'+esc(q.hi||'')+'</span></div>';
      } else if (q.type === 'text'){
        body = head(q.en,q.vi)
          +'<textarea id="sv-text" rows="2" style="width:100%;border:1px solid #C9C2AE;border-radius:10px;padding:10px;font-family:inherit;font-size:14px;resize:vertical" placeholder="'+esc(q.placeholder||'…')+'"></textarea>'
          +(q.consent?'<label style="display:flex;gap:8px;align-items:flex-start;margin-top:10px;font-size:12px;color:#7A7461;cursor:pointer"><input type="checkbox" id="sv-consent" style="margin-top:2px"><span>'+esc(q.consent)+'</span></label>':'')
          +'<button class="mbtn" id="sv-submit" style="background:#33473A;color:#FBF9F4;margin-top:14px">Done — Xong →</button>'
          +'<button class="obtn" id="sv-skip">Skip — Bỏ qua</button>';
      } else if (q.type === 'multi'){
        var max = q.max || 2;
        body = head(q.en,q.vi)
          + q.opts.map(function(o,oi){ return '<button class="opt" data-i="'+oi+'" aria-pressed="false">'+esc(o.t)+'</button>'; }).join('')
          +'<div id="sv-multimsg" style="font-size:11px;color:#7A7461;margin:6px 0">Chọn tối đa '+max+' — pick up to '+max+'</div>'
          +'<button class="mbtn" id="sv-done" style="background:#33473A;color:#FBF9F4;margin-top:6px">Done — Xong →</button>'
          +'<button class="obtn" id="sv-skip">Skip — Bỏ qua</button>';
      } else { /* single */
        body = head(q.en,q.vi) + q.opts.map(function(o,oi){
          return '<button class="opt" data-i="'+oi+'">'+esc(roleOpt(o))+'</button>';
        }).join('');
      }
      app().innerHTML = shell(prog + body); go();

      if (q.type === 'scale'){
        Array.prototype.forEach.call(document.querySelectorAll('.opt[data-v]'), function(b){
          b.onclick = function(){ answers[q.id] = +b.getAttribute('data-v'); i++; step(); };
        });
      } else if (q.type === 'text'){
        document.getElementById('sv-submit').onclick = function(){
          var t = (document.getElementById('sv-text').value||'').trim();
          var c = document.getElementById('sv-consent');
          answers[q.id] = (q.consent ? (t && c && c.checked) : !!t) ? t : '';
          if (q.consent) answers[q.id+'_consent'] = !!(c && c.checked);
          i++; step();
        };
        document.getElementById('sv-skip').onclick = function(){ answers[q.id]=''; if (q.consent) answers[q.id+'_consent']=false; i++; step(); };
      } else if (q.type === 'multi'){
        var maxN = q.max || 2, picked = [];
        function refresh(){
          var msg = document.getElementById('sv-multimsg');
          if (msg) msg.textContent = picked.length>=maxN
            ? ('Đã chọn '+picked.length+'/'+maxN+' — bỏ chọn để đổi · '+picked.length+'/'+maxN+' selected')
            : ('Chọn tối đa '+maxN+' — pick up to '+maxN+' ('+picked.length+'/'+maxN+')');
        }
        Array.prototype.forEach.call(document.querySelectorAll('.opt[data-i]'), function(b){
          b.onclick = function(){
            var oi = +b.getAttribute('data-i');
            var at = picked.indexOf(oi);
            if (at >= 0){ picked.splice(at,1); b.setAttribute('aria-pressed','false'); b.classList.remove('sel'); b.style.background=''; b.style.borderColor=''; b.style.color=''; }
            else {
              if (picked.length >= maxN) return; /* enforce max */
              picked.push(oi); b.setAttribute('aria-pressed','true'); b.classList.add('sel');
              b.style.background='#EBF0E7'; b.style.borderColor='#4F6B57'; b.style.color='#1E2B23';
            }
            refresh();
          };
        });
        document.getElementById('sv-done').onclick = function(){
          answers[q.id] = picked.map(function(oi){ return q.opts[oi].t; });
          if (q.opts.some(function(o){ return 'bucket' in o; }))
            answers[q.id+'_buckets'] = picked.map(function(oi){ return q.opts[oi].bucket; }).filter(Boolean);
          i++; step();
        };
        document.getElementById('sv-skip').onclick = function(){
          answers[q.id] = [];
          if (q.opts.some(function(o){ return 'bucket' in o; })) answers[q.id+'_buckets'] = [];
          i++; step();
        };
      } else { /* single */
        Array.prototype.forEach.call(document.querySelectorAll('.opt[data-i]'), function(b){
          b.onclick = function(){
            var oi = +b.getAttribute('data-i');
            answers[q.id] = q.opts[oi].t;
            if ('ok' in q.opts[oi] || q.opts.some(function(o){return 'ok' in o;})) answers[q.id+'_ok'] = !!q.opts[oi].ok;
            i++; step();
          };
        });
      }
    }
    step();
  }

  function scoreDiag(items, answers){
    var correct = 0, detail = [];
    items.forEach(function(q){ var ok = !!answers[q.id+'_ok']; if (ok) correct++; detail.push({id:q.id, correct:ok}); });
    return { score: correct, total: items.length, items: detail };
  }

  /* PII safety (audit P0-2): before answers leave the device, replace every free-text (type:'text')
     value with a boolean "answered" flag. The raw text stays only in localStorage (on-device); it is
     never sent to the analytics sink. Non-text answers (options/buckets) pass through unchanged. */
  function scrubText(items, answers){
    var textIds = {};
    (items || []).forEach(function(q){ if (q.type === 'text') textIds[q.id] = 1; });
    var out = {};
    for (var k in answers){
      if (!answers.hasOwnProperty(k)) continue;
      out[k] = textIds[k] ? !!(answers[k] && String(answers[k]).trim()) : answers[k];
    }
    return out;
  }

  /* ── screens ─────────────────────────────────────────────── */
  /* §5 Required UI copy for Starter intro (diagnostic-onboarding framing) */
  function intro(onStart){
    app().innerHTML = shell(
      '<div style="text-align:center">'
      +'<div style="font-size:48px;margin-bottom:10px">🧭</div>'
      +'<h1 class="hf" style="font-size:22px;font-weight:600;color:#1E2B23;margin-bottom:6px">MedLing Starter Pack</h1>'
      +'<div style="font-size:13px;color:#7A7461;font-style:italic;margin-bottom:16px">Diagnostic onboarding into MedLing’s Medical English ecosystem · Cổng nhập môn kiêm phễu chẩn đoán</div>'
      +'<div style="background:#fff;border:1px solid #EAE4D6;border-radius:14px;padding:14px 16px;text-align:left;font-size:13px;color:#1E2B23;line-height:1.7;margin-bottom:14px">'
        +'4 bài nhập môn giúp bạn trải nghiệm cách MedLing biến Medical English từ một môn học khô khan thành một hệ thống học theo tình huống, thuật ngữ và ngữ cảnh lâm sàng.<br><br>'
        +'Sau Starter Pack, bạn sẽ chọn hướng học tiếp phù hợp: giải mã thuật ngữ, đọc guideline, giao tiếp lâm sàng, case presentation hoặc AI roleplay.</div>'
      +'<div style="background:#F2EDE1;border-radius:12px;padding:12px 14px;text-align:left;font-size:12px;color:#5E7268;line-height:1.7;margin-bottom:18px">'
        +'1. Vài câu về bạn · A few questions<br>2. Mini-test trước · Quick pre-test<br>3. 4 bài học + feedback nhanh · 4 lessons<br>4. Mini-test sau, kết quả & định hướng · Post-test, score & your next track</div>'
      +'</div>'
      +'<div style="font-size:11px;color:#7A7461;text-align:center;line-height:1.6;margin-bottom:14px">Nền tảng học ngôn ngữ — không phải tư vấn y khoa · Language learning, not medical advice.<br>MedLing thu thập dữ liệu học tập ẩn danh để cải thiện sản phẩm · Anonymous learning data is collected to improve MedLing.</div>'
      +'<button class="mbtn" style="background:#33473A;color:#FBF9F4" id="pk-go">🚀 Bắt đầu — Start</button>'
      +'<button class="obtn" id="pk-back" onclick="window.location.href=window.location.pathname">← Bài khác — All lessons</button>'
    ); go();
    document.getElementById('pk-go').onclick = onStart;
  }

  function results(s, onNext){
    var pre = s.pre||{score:0,total:4}, post = s.post||{score:0,total:4};
    var gain = post.score - pre.score;
    var msg = gain>0 ? {ic:'📈',en:'You improved!',vi:'Bạn tiến bộ rồi!'} : {ic:'🌱',en:'Good start!',vi:'Khởi đầu tốt!'};
    app().innerHTML = shell(
      '<div style="text-align:center;margin-bottom:18px">'
      +'<div style="font-size:56px;margin-bottom:8px">'+msg.ic+'</div>'
      +'<h2 class="hf" style="font-size:22px;font-weight:600;color:#1E2B23">'+msg.en+'</h2>'
      +'<div style="font-size:13px;color:#7A7461;font-style:italic;margin-bottom:16px">'+msg.vi+'</div>'
      +'<div style="display:flex;gap:12px;justify-content:center">'
        +'<div style="background:#F2EDE1;border-radius:14px;padding:12px 20px"><div style="font-size:11px;color:#7A7461">Before — Trước</div><div class="hf" style="font-size:30px;color:#7A7461">'+pre.score+'/'+pre.total+'</div></div>'
        +'<div style="background:#EBF0E7;border:1px solid #4F6B57;border-radius:14px;padding:12px 20px"><div style="font-size:11px;color:#33473A">After — Sau</div><div class="hf" style="font-size:30px;color:#33473A">'+post.score+'/'+post.total+'</div></div>'
      +'</div>'
      +(gain>0?'<div style="font-size:13px;color:#4F6B57;font-weight:600;margin-top:10px">+'+gain+' câu đúng sau 4 bài · +'+gain+' correct</div>':'')
      +'</div>'
      +'<button class="mbtn" style="background:#33473A;color:#FBF9F4" id="pk-next">Tiếp — vài câu cuối →</button>'
    ); go();
    document.getElementById('pk-next').onclick = onNext;
  }

  /* §8 Q5 + §11 buckets A–H → which track(s) + waitlist/contact capture (opt-in + consent) */
  function routeScreen(packId, post, onDone){
    var buckets = (post && post.direction_buckets) || [];
    var seen = {}, picks = [];
    buckets.forEach(function(b){ if (b && !seen[b] && BUCKETS[b]){ seen[b]=1; picks.push(b); } });
    if (!picks.length) picks = ['A']; /* default route: Stage 1A terminology */

    var cards = picks.map(function(b){
      var d = BUCKETS[b];
      return '<div style="background:#fff;border:1px solid #EAE4D6;border-radius:12px;padding:12px 14px;margin-bottom:8px;text-align:left">'
        +'<div style="font-size:13px;font-weight:600;color:#1E2B23">'+esc(d.en)+'</div>'
        +'<div style="font-size:12px;color:#7A7461;font-style:italic">'+esc(d.vi)+'</div>'
        +'<div style="font-size:12px;color:#4F6B57;font-weight:600;margin-top:4px">→ '+esc(d.track)+'</div>'
      +'</div>';
    }).join('');

    app().innerHTML = shell(
      '<div style="text-align:center;margin-bottom:14px">'
      +'<div style="font-size:48px;margin-bottom:6px">🧭</div>'
      +'<h2 class="hf" style="font-size:21px;font-weight:600;color:#1E2B23">Hướng học tiếp của bạn</h2>'
      +'<div style="font-size:13px;color:#7A7461;font-style:italic">Your next track(s), based on your answers</div>'
      +'</div>'
      + cards
      +'<div style="background:#F2EDE1;border-radius:12px;padding:14px;margin-top:12px">'
        +'<div style="font-size:13px;font-weight:600;color:#1E2B23;margin-bottom:2px">Để được mở sớm — Get early access</div>'
        +'<div style="font-size:12px;color:#7A7461;font-style:italic;margin-bottom:10px">Email hoặc Zalo để được mở sớm các track đang chờ · Leave email/Zalo to unlock waitlisted tracks early</div>'
        +'<textarea id="rt-contact" rows="2" style="width:100%;border:1px solid #C9C2AE;border-radius:10px;padding:10px;font-family:inherit;font-size:14px;resize:vertical;box-sizing:border-box" placeholder="email@… / Zalo"></textarea>'
        +'<label style="display:flex;gap:8px;align-items:flex-start;margin-top:10px;font-size:12px;color:#7A7461;cursor:pointer"><input type="checkbox" id="rt-consent" style="margin-top:2px"><span>Tôi đồng ý nhận thông tin về MedLing — I agree to receive MedLing updates</span></label>'
      +'</div>'
      +'<button class="mbtn" id="rt-submit" style="background:#33473A;color:#FBF9F4;margin-top:14px">Done — Xong →</button>'
      +'<button class="obtn" id="rt-skip">Skip — Bỏ qua</button>'
    ); go();

    function commit(){
      var t = (document.getElementById('rt-contact').value||'').trim();
      var c = document.getElementById('rt-consent');
      var consent = !!(c && c.checked);
      var contact = (t && consent) ? t : '';
      /* [P1-6] only log consent alongside an actual contact — don't record a bare refusal. */
      var payload = { pack:packId, directions:picks, contact:contact };
      if (contact) payload.contact_consent = consent;
      track('route', payload);
      onDone();
    }
    document.getElementById('rt-submit').onclick = commit;
    document.getElementById('rt-skip').onclick = function(){
      track('route', { pack:packId, directions:picks, contact:'' });
      onDone();
    };
  }

  function thanks(){
    app().innerHTML = shell(
      '<div style="text-align:center">'
      +'<div style="font-size:56px;margin-bottom:10px">🎉</div>'
      +'<h2 class="hf" style="font-size:22px;font-weight:600;color:#1E2B23;margin-bottom:6px">Cảm ơn bạn! — Thank you!</h2>'
      +'<div style="font-size:13px;color:#7A7461;line-height:1.7;margin-bottom:18px">Phản hồi của bạn giúp MedLing tốt hơn.<br>Your feedback shapes what we build next.</div>'
      +'</div>'
      +'<button class="mbtn" style="background:#5E7268;color:#fff" onclick="window.location.href=window.location.pathname">← Xem tất cả bài học — All lessons</button>'
    ); go();
    track('pack_complete', { pack:'starter' });
  }

  /* ── micro-feedback (§7): ?pack=<id>&micro=<lessonId> ──────── */
  function getParam(name){
    try {
      var m = new RegExp('[?&]'+name+'=([^&]*)').exec(window.location.search||'');
      return m ? decodeURIComponent(m[1].replace(/\+/g,' ')) : null;
    } catch(e){ return null; }
  }

  function microFlow(packId, lessonId){
    track('pack_micro_open', { pack:packId, lesson:lessonId });
    runSeq(MICRO, 'Phản hồi nhanh — Quick feedback', function(ans){
      track('micro', { pack:packId, lesson:lessonId, answers:scrubText(MICRO, ans) });
      /* [CONTRACT-MICRO] mark this lesson done, then advance to the next INCOMPLETE lesson
         (resume-safe + order-proof). When all 4 are done, hand back to the pack → post-test. */
      var s = load() || {};
      s.lessons = s.lessons || {};
      if (ORDER.indexOf(lessonId) >= 0) s.lessons[lessonId] = true;
      save(s);
      var nxt = nextIncomplete(s);
      window.location.href = nxt ? ('?lesson='+nxt) : ('?pack='+packId);
    });
  }

  /* Resume-safe pre-test (audit P0-1): shared by fresh-start AND the profiling-resume branch, so a learner
     who closes after the profile but before finishing the pre-test resumes cleanly instead of dead-ending. */
  function runPreTest(st, packId){
    runSeq(DIAG_A, 'Pre-test', function(pre){
      var ps = scoreDiag(DIAG_A, pre);
      track('diagnostic', { form:'A', pack:packId, score:ps.score, total:ps.total, items:ps.items });
      st.phase = 'lessons'; st.pre = ps; st.lessons = st.lessons || {}; save(st);
      window.location.href = '?lesson=' + ORDER[0];
    });
  }

  /* ── state machine ───────────────────────────────────────── */
  function route(packId){
    packId = packId || 'starter';

    /* micro-feedback branch: ?pack=<id>&micro=<lessonId> */
    var micro = getParam('micro');
    if (micro){ microFlow(packId, micro); return; }

    var s = load();
    if (!s || s.id !== packId || !s.phase){
      // fresh start: intro → profile → pre → into lessons
      track('pack_open', { pack:packId });
      intro(function(){
        track('pack_start', { pack:packId });
        runSeq(PROFILE, 'Về bạn — About you', function(profile){
          // derive + save normalized role + cohort fields BEFORE tracking so payload carries them
          var role = deriveRole(profile.group);
          try { localStorage.removeItem('medling.roleview'); } catch(e){} /* survey role is authoritative on a fresh run; in-lesson toggle can still override later */
          var primaryGoal = Array.isArray(profile.goal) ? profile.goal : (profile.goal ? [profile.goal] : []); /* [P1-7] keep all goal picks, not just the first */
          var st = { id:packId, phase:'profiling', role:role,
            year_group:(profile.group||''), english_level:(profile.english_level||''),
            primary_goal:primaryGoal, profile:profile };
          save(st); // so cohort() picks up fields for the track call below
          track('survey', { phase:'profile', pack:packId, answers:scrubText(PROFILE, profile) });
          runPreTest(st, packId);
        });
      });
      return;
    }
    if (s.phase === 'profiling'){
      // profile saved but pre-test not finished (closed mid-funnel) → resume at the pre-test, keep profile data
      runPreTest(s, packId);
      return;
    }
    if (s.phase === 'lessons'){
      // Resume-safe (Q5/Q6): if any lesson is still unfinished, send the learner there —
      // handles close-and-reopen mid-pack and out-of-order entry. Post-test runs only once all 4 done.
      var nxtLesson = nextIncomplete(s);
      if (nxtLesson){ window.location.href = '?lesson=' + nxtLesson; return; }
      // all 4 lessons done → post-diagnostic → results → post-survey → direction routing → done
      runSeq(DIAG_B, 'Post-test', function(post){
        var qs = scoreDiag(DIAG_B, post);
        track('diagnostic', { form:'B', pack:packId, score:qs.score, total:qs.total, items:qs.items });
        s.post = qs; s.phase = 'post'; save(s);
        results(s, function(){
          runSeq(POST, 'Feedback', function(ans){
            var buckets = ans.direction_buckets || [];
            track('survey', { phase:'post', pack:packId, answers:scrubText(POST, ans),
              gain: (s.post.score - (s.pre?s.pre.score:0)) });
            s.postsurvey = ans; s.phase = 'route'; save(s);
            routeScreen(packId, { direction_buckets: buckets }, function(){
              s.phase = 'done'; save(s);
              thanks();
            });
          });
        });
      });
      return;
    }
    if (s.phase === 'post'){
      // post-diagnostic already scored but survey not finished → resume at post-survey → routing
      results(s, function(){
        runSeq(POST, 'Feedback', function(ans){
          var buckets = ans.direction_buckets || [];
          track('survey', { phase:'post', pack:packId, answers:ans,
            gain: (s.post?s.post.score:0) - (s.pre?s.pre.score:0) });
          s.postsurvey = ans; s.phase = 'route'; save(s);
          routeScreen(packId, { direction_buckets: buckets }, function(){
            s.phase = 'done'; save(s);
            thanks();
          });
        });
      });
      return;
    }
    if (s.phase === 'route'){
      // survey done but routing not completed → resume at routing screen
      var b = (s.postsurvey && s.postsurvey.direction_buckets) || [];
      routeScreen(packId, { direction_buckets: b }, function(){
        s.phase = 'done'; save(s);
        thanks();
      });
      return;
    }
    // phase 'done' → already completed the funnel. Don't dead-end at the thank-you screen on re-entry
    // (e.g. clicking "Học thử" again) — send them to the lessons (the 4-PB picker) instead.
    window.location.replace(window.location.pathname);
  }

  ML.pack = { route: route, reset: reset, state: load };
})(window.MedLing);
