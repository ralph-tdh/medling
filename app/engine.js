'use strict';
/* ============================================================
   Medical English — PocketBook engine (shell)
   Renders any lesson defined in window.LESSON.
   Behaviour & markup are a faithful port of PB1 v6.
   ============================================================ */

if (typeof window.LESSON === 'undefined') {
  document.getElementById('app').innerHTML =
    '<div style="max-width:460px;margin:40px auto;padding:24px;font-family:sans-serif;color:#7A3B27">'
    + '<b>No lesson loaded.</b><br>window.LESSON is undefined. '
    + 'Load a lesson file before engine.js.</div>';
  throw new Error('LESSON not defined');
}

/* ── DATA (from lesson file) ──────────────────────────────── */
var L     = window.LESSON;
var SITS  = L.situations;
var QZS   = L.quiz;
var META  = L.meta;
var CFG   = L.config || {};
var WEL   = L.welcome || {};
var DONE  = L.done || {};

/* ── ANALYTICS (no-op until app/engine/analytics.js loads + a sink is set) ── */
function track(ev, props) {
  try { if (window.MedLing && window.MedLing.analytics) window.MedLing.analytics.track(ev, props || {}); }
  catch (e) {}
}

/* Starter Pack state (set by engine/survey.js) — drives the post-test hand-off. */
function _packState() {
  try { return JSON.parse(localStorage.getItem('medling.pack') || 'null'); }
  catch (e) { return null; }
}

/* Role-mode (D-role): learner role drives optional DISPLAY-only variants.
   rv(base, map) returns map[role] when present, else falls back to base — so
   lessons without *_role sibling maps are completely unaffected. */
function _learnerRole(){ var p=_packState(); return (p && p.role) || null; } // 'doctor'|'nurse'|'student'|'other'
function rv(base, map){ var r=_learnerRole(); return (r && map && map[r]) ? map[r] : base; }

/* ── CONSTANTS ────────────────────────────────────────────── */
/* Atelier lanes (D28): moss - olive - terracotta - ochre */
var TH = [
  {c:'#4F6B57',bg:'#EBF0E7',sh:'#33473A'},
  {c:'#74906F',bg:'#EEF2EA',sh:'#4F6B57'},
  {c:'#A3563C',bg:'#F6EAE4',sh:'#7A3B27'},
  {c:'#A8854B',bg:'#F5EEDD',sh:'#7A5E2E'}
];

/* B1: Override TH[0] with lesson-provided theme if meta.theme_color is set.
   Lessons can define their stage colour in JSON without touching engine. */
if (META.theme_color) {
  TH[0] = {
    c:  META.theme_color,
    bg: META.theme_light  || (META.theme_color + '1A'),
    sh: META.theme_shadow || META.theme_color
  };
}
var ALPHA = ['A','B','C','D'];
var ANN_COLS = ['#4F6B57','#A3563C','#A8854B','#74906F','#5E7268'];

/* themeFor — supports lessons with >4 situations by cycling */
function themeFor(i) { return TH[i % TH.length]; }

/* ── AUDIO ENGINE ─────────────────────────────────────────── */
var _audioRate  = 0.85;
var _mp3Rate    = 1.0;   /* playbackRate for pre-generated MP3 clips (1.0=normal, 0.75=slow) */
var _ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
var _currentAudio = null;

/* Derive audio clip path from lesson id + type + indices.
   Convention matches generate_audio_v2.py output:
     pt  → {id}_s{si+1}_pt.mp3       (patient utterance)
     p   → {id}_s{si+1}_p{idx}.mp3   (phrase idx)
     v   → {id}_s{si+1}_v{idx}.mp3   (vocab chip idx)
     q   → {id}_q{idx}.mp3           (quiz question idx)  */
function clipPath(type, a, b) {
  var base = '../audio/' + META.id + '/' + META.id + '_';
  if (type === 'pt') return base + 's' + (a + 1) + '_pt.mp3';
  if (type === 'p')  return base + 's' + (a + 1) + '_p' + b + '.mp3';
  if (type === 'v')  return base + 's' + (a + 1) + '_v' + b + '.mp3';
  if (type === 'q')  return base + 'q' + a + '.mp3';
  return null;
}

/* speakWith: try pre-generated MP3, fall back to TTS. */
function speakWith(text, clip) {
  track('audio_play', { source: clip ? 'mp3' : 'tts' });
  if (_currentAudio) { _currentAudio.pause(); _currentAudio = null; }
  window.speechSynthesis && window.speechSynthesis.cancel();
  if (clip) {
    var a = new Audio(clip);
    a.playbackRate = _mp3Rate;   /* B3: honour slow-toggle for MP3 clips */
    _currentAudio = a;
    a.onended = function() { _currentAudio = null; };
    a.onerror = function() { _currentAudio = null; _speakTTS(text); };
    a.play().catch(function() { _currentAudio = null; _speakTTS(text); });
    return;
  }
  _speakTTS(text);
}

/* Legacy wrapper — used by inline onclick="speak(...)" calls that
   haven't been migrated (e.g. revision quiz).  */
function speak(text) { _speakTTS(text); }

/* morphExplain: open the Greek/Latin morpheme breakdown for a vocab chip.
   Driven by the visible 🧩 button. Guarded at render time so it only appears
   when the morph module is present (standalone build hides it). */
function morphExplain(btn) {
  if (!(window.MedLing && window.MedLing.morph)) return;
  var d = btn.dataset;
  track('morph_open', { en: d.en || '' });
  var p = window.MedLing.morph.explain(d.en || '', d.ipa || '', d.vi || '', btn.getBoundingClientRect());
  /* explain() resolves false when the word has no Greek/Latin morphemes (e.g. plain
     PB vocab like "elevator") — give brief feedback instead of a dead tap. */
  if (p && p.then) p.then(function (shown) { if (!shown) _morphToast(); });
}
function _morphToast() {
  var t = document.createElement('div');
  t.textContent = 'Từ thông thường — no Greek/Latin roots to break down';
  t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);max-width:90%;'
    + 'background:#1E2B23;color:#FBF9F4;padding:9px 16px;border-radius:20px;font-size:12px;'
    + 'z-index:1100;box-shadow:0 4px 16px rgba(30,43,35,.25);opacity:0;transition:opacity .2s;text-align:center';
  document.body.appendChild(t);
  requestAnimationFrame(function () { t.style.opacity = '1'; });
  setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 260); }, 1800);
}

function _speakTTS(text) {
  if (!_ttsSupported) return;
  window.speechSynthesis.cancel();
  setTimeout(function() {
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = _audioRate;
    window.speechSynthesis.speak(u);
  }, 50);
}

function toggleSpeed() {
  _audioRate = _audioRate > 0.75 ? 0.65 : 0.85;
  _mp3Rate   = _audioRate < 0.75 ? 0.75 : 1.0;   /* B3: keep MP3 rate in sync */
  var btn = document.getElementById('speed-toggle');
  if (!btn) return;
  var isSlow = _audioRate < 0.75;
  btn.innerHTML = isSlow ? '🐢 Slow' : '🔊 Normal';
  btn.style.background  = isSlow ? '#EBF0E7' : '#F2EDE1';
  btn.style.borderColor = isSlow ? '#4F6B57' : '#C9C2AE';
  btn.style.color       = isSlow ? '#33473A' : '#7A7461';
}

/* ── ACCENT (US primary, GB reference) — D33 ──────────────────
   Visible spelling/IPA follow the toggle; audio clips stay US.   */
var _accent = (function(){
  try { return localStorage.getItem('medling.accent') === 'gb' ? 'gb' : 'us'; }
  catch (e) { return 'us'; }
})();
function vIpa(v) { return (_accent === 'gb' && v.ipa_gb) ? v.ipa_gb : v.ipa; }
function vEn(v)  { return (_accent === 'gb' && v.en_gb)  ? v.en_gb  : v.en;  }
function toggleAccent() {
  _accent = _accent === 'gb' ? 'us' : 'gb';
  try { localStorage.setItem('medling.accent', _accent); } catch (e) {}
  track('accent_toggle', { accent: _accent });
  renderApp();
}
function accentPillHTML() {
  var us = _accent === 'us';
  var seg = function(on, label){
    return '<span style="padding:3px 9px;background:'+(on?'#5E7268':'transparent')+';color:'+(on?'#fff':'#7A7461')+'">'+label+'</span>';
  };
  return '<span onclick="toggleAccent()" role="button" aria-label="Toggle US or GB accent" title="US / GB" '
    +'style="display:inline-flex;border:1px solid #C9C2AE;border-radius:20px;overflow:hidden;font-size:11px;font-weight:600;cursor:pointer;user-select:none;-webkit-user-select:none">'
    +seg(us,'US')+seg(!us,'GB')+'</span>';
}

/* ── STATE ────────────────────────────────────────────────── */
var S = {
  screen: 'welcome',
  si: 0, phase: 'learn', pqSel: null, sOpts: null,
  qi: 0, allOpts: [], qSel: null, qDone: false, qScore: 0
};

/* ── HELPERS ──────────────────────────────────────────────── */
function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function shuffle(arr) {
  var a = arr.map(function(o){ return Object.assign({},o); });
  for (var i = a.length-1; i > 0; i--) {
    var j = Math.floor(Math.random()*(i+1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function annHTML(text, gl) {
  var keys = Object.keys(gl || {});
  if (!keys.length) return esc(text);
  var escaped = keys.map(function(k){ return k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); });
  var pat = new RegExp('('+escaped.join('|')+')','gi');
  var parts = text.split(pat);
  return parts.map(function(p) {
    var key = null;
    for (var k=0; k<keys.length; k++) {
      if (keys[k].toLowerCase() === p.toLowerCase()) { key = keys[k]; break; }
    }
    if (!key) return esc(p);
    var col = ANN_COLS[keys.indexOf(key) % ANN_COLS.length];
    return '<span style="display:inline-block;position:relative;vertical-align:baseline;margin:0 2px;padding-top:12px">'
      +'<span style="position:absolute;top:0;left:50%;transform:translateX(-50%);font-size:9px;color:'+col+';font-weight:600;white-space:nowrap;line-height:1;font-style:italic">'+esc(gl[key])+'</span>'
      +'<mark style="background:'+col+'22;color:'+col+';font-weight:600;border-radius:5px;padding:2px 5px;border:1px solid '+col+'55;line-height:1.4">'+esc(p)+'</mark>'
      +'</span>';
  }).join('');
}

function progBar(pct) {
  return '<div style="height:5px;background:#F2EDE1;position:sticky;top:0;z-index:20;border-bottom:1px solid #EAE4D6">'
    +'<div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#B5A98E,#8DA088,#4F6B57,#33473A);transition:width .5s ease"></div>'
    +'</div>';
}

function calcPct() {
  if (S.screen === 'welcome') return 0;
  if (S.screen === 'sit') {
    var phaseOff = S.phase === 'practice' ? 1 : 0;
    return Math.round((S.si*2 + phaseOff) / (SITS.length*2) * 65);
  }
  if (S.screen === 'quiz') {
    return 65 + Math.round((S.qi + (S.qDone ? 1 : 0)) / QZS.length * 35);
  }
  return 100;
}

function badge(letter, state) {
  var bgs = {u:'#33473A',ok:'#4F6B57',no:'#A3563C',dim:'#F2EDE1'};
  var fgs = {u:'#fff',ok:'#fff',no:'#fff',dim:'#C9C2AE'};
  var lbl = state==='ok' ? '✓' : state==='no' ? '✗' : letter;
  var extra = state==='u' ? 'border:1px solid #1E2B23;' : '';
  return '<span style="width:27px;height:27px;border-radius:50%;background:'+bgs[state]+';color:'+fgs[state]+';display:inline-flex;align-items:center;justify-content:center;font-weight:600;font-size:12px;flex-shrink:0;'+extra+'">'+lbl+'</span>';
}

/* ── NAVIGATION ───────────────────────────────────────────── */
function goTo(screen) { S.screen = screen; renderApp(); window.scrollTo(0,0); }

function renderApp() {
  var app = document.getElementById('app');
  if (!app) return;
  var html;
  if      (S.screen === 'welcome')   html = renderWelcome();
  else if (S.screen === 'sit')       html = renderSit();
  else if (S.screen === 'dialogue')  html = renderDialogueScreen();
  else if (S.screen === 'quiz')      html = renderQuiz();
  else if (S.screen === 'flashcard') html = renderFlashcard();
  else if (S.screen === 'review')    html = renderReview();
  else if (S.screen === 'revquiz')   html = renderRevQuiz();
  else if (S.screen === 'rqdone')    html = renderRqDone();
  else if (S.screen === 'complete')  html = renderComplete();
  else                               html = renderDone();
  app.innerHTML = html;
}

/* ── WELCOME ──────────────────────────────────────────────── */
function renderWelcome() {
  var sitRows = SITS.map(function(s,i) {
    var th = themeFor(i);
    return '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;'+(i<SITS.length-1?'border-bottom:1px dashed #F2EDE1':'')+'">'
      +'<div style="width:42px;height:42px;border-radius:12px;border:1px solid '+th.c+';background:'+th.bg+';display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;box-shadow:none">'+s.emoji+'</div>'
      +'<div>'
        +'<div style="font-weight:600;font-size:14px;color:#1E2B23">'+esc(s.en)+'</div>'
        +'<div style="font-size:11px;color:#7A7461;font-style:italic">'+esc(s.vi)+'</div>'
      +'</div>'
    +'</div>';
  }).join('');

  var badges = (WEL.badges || []).map(function(x){
    return '<span style="padding:5px 12px;border-radius:20px;border:1px solid #1E2B23;font-size:12px;font-weight:600;background:#fff;box-shadow:none">'+x.icon+' '+esc(x.label)+'</span>';
  }).join('');

  var canDoRows = (WEL.can_do || []).map(function(item){
    return '<div style="display:flex;align-items:flex-start;gap:9px;padding:5px 0">'
      +'<span style="color:#4F6B57;font-weight:600;font-size:15px;flex-shrink:0;line-height:1.4">✓</span>'
      +'<div>'
        +'<div style="font-size:13px;font-weight:600;color:#1A1A1A;line-height:1.45">'+esc(item.en)+'</div>'
        +'<div style="font-size:11px;color:#7A7461;font-style:italic;line-height:1.4">'+esc(item.vi)+'</div>'
      +'</div>'
    +'</div>';
  }).join('');
  var canDoBlock = '<div style="background:#EBF0E7;border-radius:14px;padding:13px 15px;border:1px solid #4F6B57;box-shadow:none;margin-bottom:14px">'
    +'<div style="font-size:10px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:#33473A;margin-bottom:9px">After this lesson, you\'ll be able to — Sau bài này bạn có thể:</div>'
    +canDoRows
  +'</div>';

  var scenarioRows = (WEL.scenario || []).map(function(line, i, arr){
    var wrapOpen = i < arr.length-1 ? '<div style="margin-bottom:8px">' : '<div>';
    var enStyle = line.bold
      ? 'font-size:13px;font-weight:600;color:#1E2B23;line-height:1.6'
      : 'font-size:13px;color:#1E2B23;line-height:1.6';
    return wrapOpen+'<div style="'+enStyle+'">'+esc(line.en)+'</div>'
      +'<div style="font-size:12px;color:#7A7461;font-style:italic;line-height:1.5">'+esc(line.vi)+'</div></div>';
  }).join('');

  return '<div>'
    +'<div style="height:4px;background:linear-gradient(90deg,#B5A98E,#8DA088,#4F6B57,#33473A)"></div>'
    +'<div style="max-width:460px;margin:0 auto;padding:24px 16px" class="su">'
      +'<div style="text-align:center;margin-bottom:24px">'
        +'<div style="width:76px;height:76px;border-radius:50%;border:1px solid #EAE4D6;background:#fff;box-shadow:0 1px 2px rgba(30,43,35,.05);display:flex;align-items:center;justify-content:center;font-size:38px;margin:0 auto 16px">'+(META.hero_emoji||'🏥')+'</div>'
        +'<h1 class="hf" style="font-size:22px;font-weight:600;line-height:1.35;color:#1E2B23;margin:0 0 4px">'+esc(META.title_en)+'</h1>'
        +'<div style="font-size:13px;color:#7A7461;font-style:italic;margin-bottom:16px">'+esc(META.title_vi)+'</div>'
        +'<div style="background:#fff;border-radius:16px;padding:14px 16px;border:1px solid #EAE4D6;box-shadow:none;text-align:left;margin-bottom:20px">'
          +scenarioRows
        +'</div>'
      +'</div>'
      +'<div style="background:#fff;border-radius:16px;padding:14px 16px;border:1px solid #1E2B23;box-shadow:none;margin-bottom:14px">'
        +'<div style="font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:#1E2B23;font-weight:600;margin-bottom:10px">In this lesson — Nội dung bài học</div>'
        +sitRows
      +'</div>'
      +canDoBlock
      +'<div style="display:flex;gap:8px;margin-bottom:20px;justify-content:center;flex-wrap:wrap">'+badges+'</div>'
      +'<button class="mbtn" style="background:#33473A;color:#FBF9F4" onclick="startLesson()">🚀 Let\'s go! — Bắt đầu học ngay</button>'
      +'<button class="obtn" style="margin-top:10px" onclick="window.location.href=window.location.pathname">← Chọn bài khác — Back to all lessons</button>'
    +'</div>'
  +'</div>';
}

function startLesson() {
  S.si = 0; S.phase = 'learn'; S.pqSel = null;
  S.sOpts = shuffle(SITS[0].opts);
  track('lesson_start', { sits: SITS.length });
  goTo('sit');
}

/* ── SITUATION ────────────────────────────────────────────── */
function renderSit() {
  var s = SITS[S.si];
  var th = themeFor(S.si);
  var pct = calcPct();
  var opts = S.sOpts;
  var sel = S.pqSel;
  var answered = sel !== null;
  var isProxy = s.pt.charAt(0) === '(';

  var bubble = '<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:6px">'
    +'<div style="width:38px;height:38px;border-radius:50%;background:#F2EDE1;border:1px solid #1E2B23;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;margin-top:2px">👤</div>'
    +'<div style="flex:1">'
      +'<div style="background:'+th.bg+';border:1px solid '+th.c+';border-radius:4px 16px 16px 16px;padding:11px 14px;box-shadow:none">'
        +(isProxy
          ? '<div style="font-size:13px;color:#7A7461;font-style:italic">'+esc(s.pt)+'</div>'
          : '<div style="font-size:14px;font-weight:600;color:#1E2B23;line-height:1.45;margin-bottom:5px">&ldquo;'+esc(s.pt)+'&rdquo;</div>'
            +'<div style="height:1px;background:'+th.c+'30;margin-bottom:5px"></div>'
            +'<div style="font-size:12px;font-weight:600;color:'+th.sh+';line-height:1.45;font-style:italic">'+esc(s.pt_vi)+'</div>')
      +'</div>'
    +'</div>'
  +'</div>';

  var header = '<div class="su" style="margin-bottom:14px">'
    +'<div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">'
      +'<span style="padding:3px 10px;border-radius:20px;border:1px solid '+th.c+';background:'+th.bg+';color:'+th.c+';font-size:11px;font-weight:600">'+esc(s.tag)+'</span>'
      +'<span style="padding:3px 10px;border-radius:20px;border:1px solid #1E2B23;background:#fff;color:#1E2B23;font-size:11px;font-weight:600">'+esc(s.en_tag)+'</span>'
    +'</div>'
    +'<div style="display:flex;align-items:center;gap:10px">'
      +'<div style="width:48px;height:48px;border-radius:13px;border:1px solid '+th.c+';background:'+th.bg+';display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;box-shadow:none">'+s.emoji+'</div>'
      +'<div>'
        +'<h2 class="hf" style="font-size:20px;font-weight:600;color:#1E2B23">'+esc(s.en)+'</h2>'
        +'<div style="font-size:12px;color:#7A7461;font-style:italic">'+esc(s.vi)+'</div>'
      +'</div>'
    +'</div>'
  +'</div>';

  var content = '';

  if (S.phase === 'learn') {
    var phrases = s.phrases.map(function(p,i){
      var border = i < s.phrases.length-1 ? 'margin-bottom:14px;padding-bottom:14px;border-bottom:1px dashed #F2EDE1' : '';
      var cp = clipPath('p', S.si, i);
      return '<div style="'+border+';display:flex;align-items:flex-start;gap:9px">'
        +'<button onclick="speakWith(this.dataset.w,this.dataset.clip)" data-w="'+esc(p.en)+'" data-clip="'+esc(cp)+'" '
          +'style="flex-shrink:0;margin-top:5px;padding:4px 8px;border-radius:8px;border:1px solid '+th.c+'55;background:'+th.c+'12;color:'+th.c+';font-size:12px;font-weight:600;cursor:pointer;-webkit-appearance:none;appearance:none;line-height:1;box-shadow:none;transition:transform .1s,box-shadow .1s" '
          +'onmousedown="this.style.transform=\'translate(1px,1px)\';this.style.boxShadow=\'none\'" '
          +'onmouseup="this.style.transform=\'\';this.style.boxShadow=\'none\'" '
          +'ontouchstart="this.style.transform=\'translate(1px,1px)\';this.style.boxShadow=\'none\'" '
          +'ontouchend="this.style.transform=\'\';this.style.boxShadow=\'none\'">🔊</button>'
        +'<div style="flex:1">'
          +'<div style="font-size:14px;font-weight:600;color:'+th.c+';line-height:2.1;margin-bottom:2px">'+annHTML(p.en,p.gl)+'</div>'
          +'<div style="font-size:12px;color:#7A7461;font-style:italic">'+esc(p.vi)+'</div>'
        +'</div>'
      +'</div>';
    }).join('');

    var hasMorph = !!(window.MedLing && window.MedLing.morph);
    var chips = s.vocab.map(function(v,i){
      var cp = clipPath('v', S.si, i);
      var morphBtn = hasMorph
        ? '<button onclick="morphExplain(this)" data-en="'+esc(vEn(v))+'" data-ipa="'+esc(vIpa(v))+'" data-vi="'+esc(v.vi)+'" '
          +'aria-label="Break down word — Bóc tách gốc từ" title="Break down — Bóc tách gốc từ" '
          +'style="position:absolute;top:-7px;right:-7px;width:24px;height:24px;border-radius:50%;border:1px solid '+th.c+'70;background:#fff;color:'+th.c+';font-size:12px;line-height:1;cursor:pointer;-webkit-appearance:none;appearance:none;box-shadow:none;display:inline-flex;align-items:center;justify-content:center;padding:0">🧩</button>'
        : '';
      return '<span style="position:relative;display:inline-flex">'
        +'<button onclick="speakWith(this.dataset.w,this.dataset.clip)" data-w="'+esc(v.en)+'" data-clip="'+esc(cp)+'" '
          +'style="display:inline-flex;flex-direction:column;align-items:center;padding:7px 12px;border-radius:14px;border:1px solid '+th.c+'70;background:'+th.c+'14;gap:1px;cursor:pointer;-webkit-appearance:none;appearance:none;box-shadow:none;transition:transform .1s,box-shadow .1s;text-align:center" '
          +'onmousedown="this.style.transform=\'translate(1px,1px)\';this.style.boxShadow=\'none\'" '
          +'onmouseup="this.style.transform=\'\';this.style.boxShadow=\'none\'" '
          +'ontouchstart="this.style.transform=\'translate(1px,1px)\';this.style.boxShadow=\'none\'" '
          +'ontouchend="this.style.transform=\'\';this.style.boxShadow=\'none\'">'
          +'<span style="font-size:8.5px;color:#7A7461;font-family:var(--ml-font-mono);line-height:1.2">/'+esc(vIpa(v))+'/</span>'
          +'<span style="font-size:12px;font-weight:600;color:'+th.c+';line-height:1.3">'+esc(vEn(v))+'</span>'
          +'<span style="font-size:10px;color:'+th.c+'CC;font-weight:600;line-height:1.2;font-style:italic">'+esc(v.vi)+'</span>'
          +'<span style="font-size:9px;margin-top:3px;line-height:1;color:'+th.c+'99">🔊</span>'
        +'</button>'
        +morphBtn
      +'</span>';
    }).join('');

    content = '<div class="su">'
      +'<div style="background:#fff;border-radius:16px;padding:14px 16px;border:1px solid '+th.c+';box-shadow:none;margin-bottom:10px">'
        +'<div style="font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:'+th.c+';font-weight:600;margin-bottom:7px">Scene — Bối cảnh</div>'
        +'<div style="font-size:13px;color:#1E2B23;line-height:1.75;margin-bottom:4px">'+esc(s.ctx_en)+'</div>'
        +'<div style="font-size:12px;color:#7A7461;font-style:italic;line-height:1.7">'+esc(s.ctx_vi)+'</div>'
      +'</div>'
      +'<div style="margin-bottom:10px">'
        +'<div style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#7A7461;font-weight:600;margin-bottom:7px">Patient says — Bệnh nhân nói</div>'
        +bubble
      +'</div>'
      +'<div style="background:#fff;border-radius:16px;padding:14px 16px;border:1px solid #1E2B23;box-shadow:none;margin-bottom:10px">'
        +'<div style="font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:#7A7461;font-weight:600;margin-bottom:10px">Key phrases — Các câu then chốt</div>'
        +phrases
      +'</div>'
      +'<div style="background:'+th.bg+';border-radius:16px;padding:14px 16px;border:1px solid '+th.sh+';box-shadow:none;margin-bottom:16px">'
        +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
          +'<div style="font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:'+th.c+';font-weight:600">Additional vocab — Từ vựng bổ sung</div>'
          +'<div style="display:flex;align-items:center;gap:7px">'+accentPillHTML()
            +'<button id="speed-toggle" onclick="toggleSpeed()" style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;border:1px solid #C9C2AE;background:#f0f0f0;color:#777;cursor:pointer;-webkit-appearance:none;appearance:none;box-shadow:none;transition:all .15s;white-space:nowrap">🔊 Normal</button>'
          +'</div>'
        +'</div>'
        +'<div style="display:flex;flex-wrap:wrap;gap:7px">'+chips+'</div>'
      +'</div>'
      +'<button class="mbtn" style="background:'+th.c+';color:#fff" onclick="goToPractice()">Practice — Thực hành →</button>'
    +'</div>';

  } else {
    var optButtons = opts.map(function(op,i){
      var isMe = sel === i;
      var isOk = op.ok;
      var cls = 'opt' + (answered ? ' locked' : '') + (answered&&isOk ? ' ok' : answered&&isMe ? ' no' : '') + (answered&&!isOk&&!isMe ? ' dim' : '');
      var bState = !answered ? 'u' : isOk ? 'ok' : isMe ? 'no' : 'dim';
      var onclick = answered ? '' : 'onclick="pqPick('+i+')"';
      var ot = rv(op.t, op.t_role);
      var textContent = answered && isOk ? annHTML(ot, op.gl||{}) : esc(ot);
      return '<button class="'+cls+'" '+onclick+'>'
        +badge(ALPHA[i], bState)
        +'<span style="line-height:'+(answered&&isOk?'2.1':'1.5')+'">'+textContent+'</span>'
      +'</button>';
    }).join('');

    var tipBox = answered
      ? '<div class="pop" style="background:#F5EEDD;border:1px solid #A8854B;border-radius:13px;padding:11px 14px;margin-top:8px;box-shadow:none">'
          +'<div style="font-size:13px;color:#6E5326;font-weight:600;line-height:1.7;margin-bottom:3px">💡 '+esc(rv(s.tip_en, s.tip_en_role))+'</div>'
          +'<div style="font-size:12px;color:#8A6F3C;font-style:italic;line-height:1.6">'+esc(rv(s.tip_vi, s.tip_vi_role))+'</div>'
        +'</div>'
      : '';

    var nextLabel = S.si < SITS.length-1
      ? 'Next situation — Tình huống tiếp theo →'
      : 'Start Quiz — Làm bài kiểm tra →';

    var nextBtn = answered
      ? '<div class="pop"><button class="mbtn" style="background:'+th.c+';color:#fff" onclick="nextSit()">'+nextLabel+'</button></div>'
      : '';

    content = '<div class="su">'
      +'<div style="background:#fff;border-radius:16px;padding:14px 16px;border:1px solid '+th.c+';box-shadow:none;margin-bottom:12px">'
        +'<div style="font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:'+th.c+';font-weight:600;margin-bottom:8px">Practice — Thực hành</div>'
        +'<div style="margin-bottom:14px">'
          /* A1a: render optional instruction as a visible topic-sentence above the scenario question */
          +(s.instruction
            ? '<div style="font-size:11px;font-weight:600;color:'+th.c+';letter-spacing:.04em;margin-bottom:6px;text-transform:uppercase">'+esc(s.instruction)+'</div>'
            : '')
          +'<div style="font-size:14px;font-weight:600;color:#1E2B23;line-height:1.6;margin-bottom:3px">'+esc(rv(s.pq_en, s.pq_en_role))+'</div>'
          +'<div style="font-size:12px;color:#7A7461;font-style:italic;line-height:1.55">'+esc(rv(s.pq_vi, s.pq_vi_role))+'</div>'
        +'</div>'
        +optButtons
        +tipBox
      +'</div>'
      +nextBtn
      +'<button class="obtn" onclick="backToLearn()">← Review phrases — Xem lại các câu</button>'
    +'</div>';
  }

  return progBar(pct)
    +'<div style="max-width:460px;margin:0 auto;padding:16px 16px 28px">'
      +header
      +content
    +'</div>';
}

function goToPractice() { S.phase='practice'; renderApp(); window.scrollTo(0,0); }
function backToLearn()  { S.phase='learn'; S.pqSel=null; renderApp(); window.scrollTo(0,0); }
function pqPick(i)      { if (S.pqSel!==null) return; S.pqSel=i; track('practice_answer', { si: S.si, correct: !!(S.sOpts[i] && S.sOpts[i].ok) }); renderApp(); }

function nextSit() {
  if (S.si < SITS.length-1) {
    S.si++; S.phase='learn'; S.pqSel=null;
    S.sOpts = shuffle(SITS[S.si].opts);
    goTo('sit');
  } else if (L.dialogue && window.MedLing && window.MedLing.dialogue && !S.dlgDone) {
    /* Branching dialogue step (tier-2 novel feature) — only when the lesson
       provides one AND the module loaded (standalone w/o module skips to quiz). */
    goTo('dialogue');
  } else {
    initQuiz();
  }
}

/* ── BRANCHING DIALOGUE (lesson-level, optional) ─────────────── */
function renderDialogueScreen() {
  /* Engine paints the frame; MedLing.dialogue manages its own state inside #dlg-mount. */
  setTimeout(function () {
    var mount = document.getElementById('dlg-mount');
    if (!mount) return;
    window.MedLing.dialogue.render(L.dialogue, mount, {
      onDone: function () {
        S.dlgDone = true;
        var btn = document.getElementById('dlg-continue');
        if (btn) btn.style.display = 'block';
      }
    });
  }, 0);
  return progBar(80)
    +'<div class="su" style="max-width:460px;margin:0 auto;padding:16px 16px 28px">'
      +'<div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap">'
        +'<span style="padding:3px 10px;border-radius:20px;border:1px solid var(--ml-sage);background:var(--ml-ok-bg);color:var(--ml-moss);font-size:11px;font-weight:600">💬 '
          +esc((L.dialogue.title_en)||'Clinical Dialogue')+'</span>'
      +'</div>'
      +(L.dialogue.ctx_en
        ? '<div style="background:#fff;border-radius:14px;padding:13px 15px;border:1px solid var(--ml-line);margin-bottom:12px">'
          +'<div style="font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:var(--ml-sage);font-weight:600;margin-bottom:6px">Scene — Bối cảnh</div>'
          +'<div style="font-size:13px;color:var(--ml-ink);line-height:1.7">'+esc(L.dialogue.ctx_en)+'</div>'
          +(L.dialogue.ctx_vi?'<div style="font-size:12px;color:var(--ml-earth);font-style:italic;line-height:1.6">'+esc(L.dialogue.ctx_vi)+'</div>':'')
        +'</div>' : '')
      +'<div id="dlg-mount"></div>'
      +'<button id="dlg-continue" class="mbtn" style="background:var(--ml-forest);color:var(--ml-cream);display:none;margin-top:14px" onclick="initQuiz()">Start Quiz — Làm bài kiểm tra →</button>'
    +'</div>';
}

/* ── QUIZ ─────────────────────────────────────────────────── */
function initQuiz() {
  S.allOpts = QZS.map(function(q){ return shuffle(q.opts); });
  S.qi=0; S.qSel=null; S.qDone=false; S.qScore=0;
  track('quiz_start', { questions: QZS.length });
  goTo('quiz');
}

function renderQuiz() {
  var q = QZS[S.qi];
  var opts = S.allOpts[S.qi];
  var total = QZS.length;
  var answered = S.qDone;
  var sel = S.qSel;
  var okIdx = opts.findIndex(function(o){ return o.ok; });
  var pct = calcPct();

  var optButtons = opts.map(function(op,i){
    var isMe = sel === i;
    var isOk = op.ok;
    var cls = 'opt' + (answered ? ' locked' : '') + (answered&&isOk ? ' ok' : answered&&isMe ? ' no' : '') + (answered&&!isOk&&!isMe ? ' dim' : '');
    var bState = !answered ? 'u' : isOk ? 'ok' : isMe ? 'no' : 'dim';
    var onclick = answered ? '' : 'onclick="qPick('+i+')"';
    var textContent = answered && isOk ? annHTML(op.t, op.gl||{}) : esc(op.t);
    return '<button class="'+cls+'" '+onclick+'>'
      +badge(ALPHA[i], bState)
      +'<span style="line-height:'+(answered&&isOk?'2.1':'1.5')+'">'+textContent+'</span>'
    +'</button>';
  }).join('');

  var feedbackColor = opts[sel] && opts[sel].ok ? '#4F6B57' : '#A3563C';
  var feedbackBg    = opts[sel] && opts[sel].ok ? '#EBF0E7' : '#F6EAE4';
  var feedbackSh    = opts[sel] && opts[sel].ok ? '#33473A' : '#7A3B27';
  var feedbackLabel = opts[sel] && opts[sel].ok
    ? '✓ Correct! — Chính xác!'
    : '✗ Correct answer — Đáp án đúng: '+ALPHA[okIdx];
  var feedbackTxt = opts[sel] && opts[sel].ok ? '#33473A' : '#7A3B27';

  var feedback = answered
    ? '<div class="pop" style="background:'+feedbackBg+';border:1px solid '+feedbackColor+';border-radius:13px;padding:11px 14px;margin-top:8px;box-shadow:none">'
        +'<div style="font-size:12px;font-weight:600;color:'+feedbackTxt+';margin-bottom:4px">'+feedbackLabel+'</div>'
        +'<div style="font-size:13px;color:#1E2B23;line-height:1.65;margin-bottom:3px">'+esc(q.exp_en)+'</div>'
        +'<div style="font-size:12px;color:#7A7461;font-style:italic;line-height:1.6">'+esc(q.exp_vi)+'</div>'
      +'</div>'
    : '';

  var nextLabel = S.qi < total-1
    ? 'Next question — Câu hỏi tiếp theo →'
    : 'See results — Xem kết quả →';

  var nextBtn = answered
    ? '<div class="pop"><button class="mbtn" style="background:#5E7268;color:#fff;margin-top:12px" onclick="nextQ()">'+nextLabel+'</button></div>'
    : '';

  return progBar(pct)
    +'<div class="su" style="max-width:460px;margin:0 auto;padding:16px 16px 28px">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">'
        +'<span style="padding:3px 12px;border-radius:20px;border:1px solid #5E7268;background:#ECEFEA;color:#5E7268;font-size:11px;font-weight:600">Quiz · '+(S.qi+1)+' / '+total+'</span>'
        +'<span style="padding:3px 12px;border-radius:20px;border:1px solid #4F6B57;background:#EBF0E7;color:#4F6B57;font-size:12px;font-weight:600">⭐ '+S.qScore+'</span>'
      +'</div>'
      +'<div style="background:#ECEFEA;border-radius:16px;padding:14px 16px;border:1px solid #5E7268;box-shadow:none;margin-bottom:12px">'
        +'<div style="margin-bottom:14px">'
          +'<div style="font-size:14px;font-weight:600;color:#1E2B23;line-height:1.6;margin-bottom:3px">'+esc(q.en)+'</div>'
          +'<div style="font-size:12px;color:#7A7461;font-style:italic;line-height:1.55">'+esc(q.vi)+'</div>'
        +'</div>'
        +optButtons
        +feedback
      +'</div>'
      +nextBtn
    +'</div>';
}

function qPick(i) {
  if (S.qDone) return;
  S.qSel=i; S.qDone=true;
  if (S.allOpts[S.qi][i].ok) S.qScore++;
  track('quiz_answer', { qi: S.qi, correct: !!(S.allOpts[S.qi][i] && S.allOpts[S.qi][i].ok) });
  renderApp();
}

function nextQ() {
  if (S.qi < QZS.length-1) {
    S.qi++; S.qSel=null; S.qDone=false;
    renderApp(); window.scrollTo(0,0);
  } else {
    track('lesson_complete', { score: S.qScore, total: QZS.length });
    goTo('done');
  }
}

/* ── DONE ─────────────────────────────────────────────────── */
function renderDone() {
  var total = QZS.length;
  var pct = Math.round(S.qScore/total*100);
  var g;
  if (pct>=80) g={ic:'🏆',en:'Excellent!',vi:'Xuất sắc!',bg:'#EBF0E7',bd:'#8DA088',sh:'#33473A',co:'#33473A'};
  else if (pct>=60) g={ic:'👍',en:'Good job!',vi:'Tốt lắm!',bg:'#F5EEDD',bd:'#A8854B',sh:'#7A5E2E',co:'#6E5326'};
  else g={ic:'📚',en:'Keep going!',vi:'Ôn thêm nhé!',bg:'#F6EAE4',bd:'#A3563C',sh:'#7A3B27',co:'#7A3B27'};

  var achievementRecap = (DONE.achievements || []).map(function(r){
    return '<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px dashed #EAE4D6">'
      +'<span style="font-size:20px;flex-shrink:0">'+r.emoji+'</span>'
      +'<div>'
        +'<div style="font-size:13px;font-weight:600;color:#33473A;line-height:1.4">✓ '+esc(r.en)+'</div>'
        +'<div style="font-size:11px;color:#7A7461;font-style:italic;line-height:1.35">'+esc(r.vi)+'</div>'
      +'</div>'
    +'</div>';
  }).join('');

  var vocabCount = buildAllVocab().length;
  var revCount = revisionQuizCount();

  /* FSRS review entry — only when the spaced-repetition module is present. */
  var fsrsBtn = (window.MedLing && window.MedLing.fsrs)
    ? '<button onclick="initReview();goTo(\'review\')" class="mbtn" style="background:#ECEFEA;color:#33473A;border-color:#5E7268;box-shadow:none;margin-bottom:10px;text-align:left;padding:13px 16px">'
        +'<div style="display:flex;align-items:center;justify-content:space-between;gap:10px">'
          +'<div>'
            +'<div style="font-size:15px;font-weight:600;margin-bottom:2px">📒 Review saved terms (FSRS)</div>'
            +'<div style="font-size:11px;font-weight:600;color:#5E7268;opacity:.85">Spaced repetition · Lặp lại ngắt quãng</div>'
            +'<div style="font-size:10px;color:#7A7461;font-style:italic;margin-top:1px">Ôn thẻ đã lưu</div>'
          +'</div>'
          +'<span style="font-size:22px;flex-shrink:0">→</span>'
        +'</div>'
      +'</button>'
    : '';

  var nextBtn = '';
  if (_packState() && _packState().phase === 'lessons') {
    /* In a Starter Pack run, ALWAYS hand back to the pack with &micro=<lesson id>
       (this MUST take priority over config.next so PB1-3 collect micro-feedback too,
       not just PB4). The survey module shows per-lesson feedback, then advances to the
       next PB or the post-test. */
    var _pkid = _packState().id || 'starter';
    var _microUrl = '?pack=' + _pkid + '&micro=' + (META.id || '');
    nextBtn = '<button onclick="window.location.href=\''+_microUrl+'\'" class="mbtn" style="background:#33473A;color:#FBF9F4;margin-bottom:10px;text-align:left;padding:13px 16px">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;gap:10px">'
        +'<div>'
          +'<div style="font-size:15px;font-weight:600;margin-bottom:2px">Continue → Tiếp tục</div>'
          +'<div style="font-size:10px;color:#C9C2AE;font-style:italic;margin-top:1px">Quick feedback, then next — Phản hồi nhanh rồi học tiếp</div>'
        +'</div>'
        +'<span style="font-size:22px;flex-shrink:0;color:#8DA088">→</span>'
      +'</div>'
    +'</button>';
  } else if (CFG.next && CFG.next.url) {
    nextBtn = '<button onclick="window.location.href=window.LESSON.config.next.url" class="mbtn" style="background:#33473A;color:#FBF9F4;margin-bottom:10px;text-align:left;padding:13px 16px">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;gap:10px">'
        +'<div>'
          +'<div style="font-size:15px;font-weight:600;margin-bottom:2px">'+esc(CFG.next.label)+'</div>'
          +'<div style="font-size:10px;color:#C9C2AE;font-style:italic;margin-top:1px">'+esc(CFG.next.label_vi)+(CFG.next.free ? ' · 🆓 Free' : '')+'</div>'
        +'</div>'
        +'<span style="font-size:22px;flex-shrink:0;color:#8DA088">→</span>'
      +'</div>'
    +'</button>';
  } else {
    nextBtn = '<button onclick="goTo(\'complete\')" class="mbtn" style="background:#33473A;color:#FBF9F4;margin-bottom:10px;text-align:left;padding:13px 16px">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;gap:10px">'
        +'<div>'
          +'<div style="font-size:15px;font-weight:600;margin-bottom:2px">What\'s coming next? →</div>'
          +'<div style="font-size:10px;color:#C9C2AE;font-style:italic;margin-top:1px">Tiếp theo sẽ có gì?</div>'
        +'</div>'
        +'<span style="font-size:22px;flex-shrink:0;color:#8DA088">→</span>'
      +'</div>'
    +'</button>';
  }

  return '<div style="max-width:460px;margin:0 auto;padding:28px 16px" class="pop">'
    +'<div style="text-align:center;margin-bottom:20px">'
      +'<div style="font-size:64px;margin-bottom:12px">'+g.ic+'</div>'
      +'<h2 class="hf" style="font-size:22px;font-weight:600;margin-bottom:4px;color:#1E2B23">'+esc(META.complete_en||'Lesson complete!')+'</h2>'
      +'<div style="font-size:13px;color:#7A7461;font-style:italic;margin-bottom:14px">'+esc(META.complete_vi||'Hoàn thành!')+'</div>'
      +'<div style="display:inline-block;padding:14px 32px;background:'+g.bg+';border:1px solid '+g.bd+';border-radius:18px;box-shadow:none">'
        +'<div class="hf" style="font-size:48px;font-weight:600;color:'+g.co+'">'+S.qScore+'/'+total+'</div>'
        +'<div style="font-size:13px;font-weight:600;color:'+g.co+'">'+g.en+'</div>'
        +'<div style="font-size:12px;color:'+g.co+';font-style:italic">'+g.vi+'</div>'
      +'</div>'
    +'</div>'
    +'<div style="background:#fff;border-radius:16px;padding:14px 16px;border:1px solid #4F6B57;box-shadow:none;margin-bottom:10px">'
      +'<div style="font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:#33473A;font-weight:600;margin-bottom:10px">You can now — Bạn đã làm được:</div>'
      +achievementRecap
    +'</div>'
    +'<div style="font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:#7A7461;font-weight:600;margin:16px 0 10px">What\'s next? — Tiếp theo làm gì?</div>'
    +'<button onclick="initFlashcard()" class="mbtn" style="background:#ECEFEA;color:#33473A;border-color:#5E7268;box-shadow:none;margin-bottom:10px;text-align:left;padding:13px 16px">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;gap:10px">'
        +'<div>'
          +'<div style="font-size:15px;font-weight:600;margin-bottom:2px">📚 Review Flashcards</div>'
          +'<div style="font-size:11px;font-weight:600;color:#5E7268;opacity:.85">'+vocabCount+' vocab words · Got it / Again</div>'
          +'<div style="font-size:10px;color:#7A7461;font-style:italic;margin-top:1px">Ôn từ vựng · '+vocabCount+' từ · Biết / Chưa biết</div>'
        +'</div>'
        +'<span style="font-size:22px;flex-shrink:0">→</span>'
      +'</div>'
    +'</button>'
    +'<button onclick="initRevQuiz()" class="mbtn" style="background:#EBF0E7;color:#33473A;border-color:#4F6B57;box-shadow:none;margin-bottom:10px;text-align:left;padding:13px 16px">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;gap:10px">'
        +'<div>'
          +'<div style="font-size:15px;font-weight:600;margin-bottom:2px">🧩 Quick Revision Quiz</div>'
          +'<div style="font-size:11px;font-weight:600;color:#4F6B57;opacity:.9">'+revCount+' questions · Auto-generated from vocab</div>'
          +'<div style="font-size:10px;color:#7A7461;font-style:italic;margin-top:1px">Kiểm tra nhanh · '+revCount+' câu · Tự động tạo</div>'
        +'</div>'
        +'<span style="font-size:22px;flex-shrink:0">→</span>'
      +'</div>'
    +'</button>'
    +fsrsBtn
    +nextBtn
    +'<button class="obtn" onclick="restartLesson()">← Try again — Học lại</button>'
  +'</div>';
}

function restartLesson() {
  _audioRate = 0.85;
  _mp3Rate   = 1.0;   /* B3: reset MP3 speed on restart */
  window.speechSynthesis && window.speechSynthesis.cancel();
  S = {
    screen:'welcome', si:0, phase:'learn', pqSel:null, sOpts:null,
    qi:0, allOpts:[], qSel:null, qDone:false, qScore:0,
    fcDeck:[], fcKnown:0, fcFlipped:false,
    rqItems:[], rqAllOpts:[], rqIdx:0, rqSel:null, rqDone:false, rqScore:0,
    revDue:null, revIdx:0, revFlipped:false, revDone:false
  };
  goTo('welcome');
}

/* ── FLASHCARD ENGINE ─────────────────────────────────────── */
function buildAllVocab() {
  var all = [];
  SITS.forEach(function(s, si) {
    s.vocab.forEach(function(v, vi) {
      var item = Object.assign({}, v);
      item._clip = clipPath('v', si, vi);
      all.push(item);
    });
  });
  return all;
}

function initFlashcard() {
  S.fcDeck = shuffle(buildAllVocab());
  S.fcKnown = 0; S.fcFlipped = false;
  track('flashcard_start', { cards: S.fcDeck.length });
  goTo('flashcard');
}

function fcFlip()  { S.fcFlipped = true; renderApp(); }

function fcGotIt() {
  S.fcKnown++;
  S.fcDeck.shift();
  S.fcFlipped = false;
  renderApp(); window.scrollTo(0,0);
}

function fcAgain() {
  var c = S.fcDeck.shift();
  S.fcDeck.push(c);
  S.fcFlipped = false;
  renderApp(); window.scrollTo(0,0);
}

function renderFlashcard() {
  var total = buildAllVocab().length;
  var deck  = S.fcDeck || [];

  if (deck.length === 0) {
    return '<div style="max-width:460px;margin:0 auto;padding:28px 16px" class="pop">'
      +'<div style="text-align:center;margin-bottom:22px">'
        +'<div style="font-size:64px;margin-bottom:10px">🎉</div>'
        +'<h2 class="hf" style="font-size:22px;font-weight:600;color:#1E2B23;margin-bottom:4px">All cards reviewed!</h2>'
        +'<div style="font-size:13px;color:#7A7461;font-style:italic;margin-bottom:16px">Ôn tập xong!</div>'
        +'<div style="display:inline-block;padding:14px 32px;background:#ECEFEA;border:1px solid #5E7268;border-radius:18px;box-shadow:none">'
          +'<div class="hf" style="font-size:48px;font-weight:600;color:#33473A">'+S.fcKnown+'/'+total+'</div>'
          +'<div style="font-size:12px;font-weight:600;color:#5E7268">Got it first pass — Nhớ ngay lần đầu</div>'
        +'</div>'
      +'</div>'
      +'<button onclick="goTo(\'done\')" class="mbtn" style="background:#5E7268;color:#fff;margin-bottom:10px">← Back to summary — Về tóm tắt</button>'
      +'<button onclick="initFlashcard()" class="obtn">↺ Restart flashcards — Làm lại</button>'
    +'</div>';
  }

  var v   = deck[0];
  var done = total - deck.length;
  var pct  = Math.round(done / total * 100);

  var cardHtml = S.fcFlipped
    ? '<div class="pop" style="background:#ECEFEA;border-radius:20px;border:1px solid #5E7268;box-shadow:none;padding:32px 20px;text-align:center;margin-bottom:12px">'
        +'<div style="font-size:13px;font-family:var(--ml-font-mono);color:#5E7268;font-weight:600;margin-bottom:6px">/'+esc(vIpa(v))+'/</div>'
        +'<div class="hf" style="font-size:30px;font-weight:600;color:#1E2B23;margin-bottom:10px">'+esc(vEn(v))+'</div>'
        +'<div style="height:1.5px;background:#5E726830;margin-bottom:12px"></div>'
        +'<div style="font-size:22px;font-weight:600;color:#4F6B57;margin-bottom:14px">'+esc(v.vi)+'</div>'
        +'<button onclick="speakWith(this.dataset.w,this.dataset.clip)" data-w="'+esc(v.en)+'" data-clip="'+esc(v._clip||'')+'" style="padding:5px 16px;border-radius:20px;border:1px solid #5E7268;background:#fff;color:#5E7268;font-size:13px;font-weight:600;cursor:pointer;-webkit-appearance:none;appearance:none">🔊 '+esc(vEn(v))+'</button>'
      +'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px" class="pop">'
        +'<button onclick="fcAgain()" class="mbtn" style="background:#F6EAE4;color:#7A3B27;border-color:#A3563C;box-shadow:none">✗ Again</button>'
        +'<button onclick="fcGotIt()" class="mbtn" style="background:#EBF0E7;color:#33473A;border-color:#4F6B57;box-shadow:none">✓ Got it</button>'
      +'</div>'
    : '<button onclick="fcFlip()" style="width:100%;background:#fff;border-radius:20px;border:1px solid #1E2B23;box-shadow:none;padding:52px 20px;text-align:center;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;margin-bottom:12px;-webkit-appearance:none;appearance:none;transition:transform .1s,box-shadow .1s" '
        +'onmousedown="this.style.transform=\'translate(2px,2px)\';this.style.boxShadow=\'none\'" '
        +'onmouseup="this.style.transform=\'\';this.style.boxShadow=\'none\'" '
        +'ontouchstart="this.style.transform=\'translate(2px,2px)\';this.style.boxShadow=\'none\'" '
        +'ontouchend="this.style.transform=\'\';this.style.boxShadow=\'none\'">'
        +'<div style="font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:#C9C2AE;font-weight:600;margin-bottom:16px">What does this mean? — Nghĩa là gì?</div>'
        +'<div class="hf" style="font-size:34px;font-weight:600;color:#1E2B23;line-height:1.2">'+esc(v.en)+'</div>'
        +'<div style="font-size:11px;color:#C9C2AE;margin-top:18px">Tap to reveal — Nhấn để xem nghĩa</div>'
      +'</button>';

  return '<div style="height:8px;background:#F2EDE1;position:sticky;top:0;z-index:20;border-bottom:1px solid #1E2B23">'
      +'<div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#8DA088,#4F6B57);transition:width .4s ease;'+(pct>2?'border-right:3px solid #1E2B23':'')+';"></div>'
    +'</div>'
    +'<div class="su" style="max-width:460px;margin:0 auto;padding:16px 16px 28px">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'
        +'<span style="padding:3px 12px;border-radius:20px;border:1px solid #5E7268;background:#ECEFEA;color:#5E7268;font-size:11px;font-weight:600">📚 Cards · '+done+' / '+total+'</span>'
        +'<button onclick="goTo(\'done\')" style="font-size:12px;font-weight:600;color:#7A7461;background:none;border:none;cursor:pointer;padding:4px 8px;-webkit-appearance:none">✕ Exit</button>'
      +'</div>'
      +cardHtml
    +'</div>';
}

/* ── REVISION QUIZ ENGINE ─────────────────────────────────── */
/* Number of revision questions: min(6, vocab count) so small decks still work */
function revisionQuizCount() {
  return Math.min(6, buildAllVocab().length);
}

function buildRevisionQuiz(n) {
  var all  = buildAllVocab();
  var pool = shuffle(all);
  return pool.slice(0, n).map(function(v) {
    var wrongs = shuffle(all.filter(function(x){ return x.en !== v.en; })).slice(0, 3);
    var en = vEn(v), ipa = vIpa(v);
    return {
      q_en: 'What does "' + en + '" mean?',
      q_vi: '"' + en + '" nghĩa là gì?',
      word: en, ipa: ipa,
      opts: shuffle([
        {t: v.vi,         ok: true  },
        {t: wrongs[0].vi, ok: false },
        {t: wrongs[1].vi, ok: false },
        {t: wrongs[2].vi, ok: false }
      ]),
      exp_en: '"' + en + '" /' + ipa + '/ = ' + v.vi,
      exp_vi: 'Phát âm: /' + ipa + '/'
    };
  });
}

function initRevQuiz() {
  S.rqItems    = buildRevisionQuiz(revisionQuizCount());
  S.rqAllOpts  = S.rqItems.map(function(q){ return q.opts; });
  S.rqIdx = 0; S.rqSel = null; S.rqDone = false; S.rqScore = 0;
  track('revquiz_start', { questions: S.rqItems.length });
  goTo('revquiz');
}

function rqPick(i) {
  if (S.rqDone) return;
  S.rqSel = i; S.rqDone = true;
  if (S.rqAllOpts[S.rqIdx][i].ok) S.rqScore++;
  renderApp();
}

function nextRq() {
  if (S.rqIdx < S.rqItems.length - 1) {
    S.rqIdx++; S.rqSel = null; S.rqDone = false;
    renderApp(); window.scrollTo(0,0);
  } else {
    goTo('rqdone');
  }
}

function renderRevQuiz() {
  var items = S.rqItems || [];
  var total = items.length;
  if (!total) return '<div></div>';
  var q        = items[S.rqIdx];
  var opts     = S.rqAllOpts[S.rqIdx];
  var answered = S.rqDone;
  var sel      = S.rqSel;
  var okIdx    = opts.findIndex(function(o){ return o.ok; });
  var fOk      = opts[sel] && opts[sel].ok;
  var pct      = Math.round((S.rqIdx + (answered ? 1 : 0)) / total * 100);

  var optBtns = opts.map(function(op, i) {
    var isMe = sel === i, isOk = op.ok;
    var cls  = 'opt' + (answered ? ' locked' : '')
      + (answered && isOk  ? ' ok'  : '')
      + (answered && isMe && !isOk ? ' no'  : '')
      + (answered && !isOk && !isMe ? ' dim' : '');
    var bState = !answered ? 'u' : isOk ? 'ok' : isMe ? 'no' : 'dim';
    return '<button class="'+cls+'" '+(answered?'':'onclick="rqPick('+i+')"')+'>'
      +badge(ALPHA[i], bState)
      +'<span style="line-height:1.5">'+esc(op.t)+'</span>'
    +'</button>';
  }).join('');

  var feedback = answered
    ? '<div class="pop" style="background:'+(fOk?'#EBF0E7':'#F6EAE4')+';border:1px solid '+(fOk?'#4F6B57':'#A3563C')+';border-radius:13px;padding:11px 14px;margin-top:8px">'
        +'<div style="font-size:12px;font-weight:600;color:'+(fOk?'#33473A':'#7A3B27')+';margin-bottom:4px">'+(fOk?'✓ Correct! — Chính xác!':'✗ Correct answer: '+ALPHA[okIdx])+'</div>'
        +'<div style="font-size:13px;color:#1E2B23;line-height:1.65;margin-bottom:2px">'+esc(q.exp_en)+'</div>'
        +'<div style="font-size:11px;color:#7A7461;font-style:italic">'+esc(q.exp_vi)+'</div>'
      +'</div>'
    : '';

  return '<div style="height:8px;background:#F2EDE1;position:sticky;top:0;z-index:20;border-bottom:1px solid #1E2B23">'
      +'<div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#8DA088,#4F6B57);transition:width .5s ease;'+(pct>2?'border-right:3px solid #1E2B23':'')+';"></div>'
    +'</div>'
    +'<div class="su" style="max-width:460px;margin:0 auto;padding:16px 16px 28px">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">'
        +'<span style="padding:3px 12px;border-radius:20px;border:1px solid #5E7268;background:#ECEFEA;color:#5E7268;font-size:11px;font-weight:600">🧩 Revision · '+(S.rqIdx+1)+' / '+total+'</span>'
        +'<span style="padding:3px 12px;border-radius:20px;border:1px solid #4F6B57;background:#EBF0E7;color:#4F6B57;font-size:12px;font-weight:600">⭐ '+S.rqScore+'</span>'
      +'</div>'
      +'<div style="background:#ECEFEA;border-radius:16px;padding:14px 16px;border:1px solid #5E7268;box-shadow:none;margin-bottom:12px">'
        +'<div style="margin-bottom:14px">'
          +'<div style="font-size:14px;font-weight:600;color:#1E2B23;line-height:1.6;margin-bottom:3px">'+esc(q.q_en)+'</div>'
          +'<div style="font-size:12px;color:#7A7461;font-style:italic">'+esc(q.q_vi)+'</div>'
        +'</div>'
        +optBtns
        +feedback
      +'</div>'
      +(answered
        ? '<div class="pop"><button class="mbtn" style="background:#5E7268;color:#fff;margin-top:4px" onclick="nextRq()">'
            +(S.rqIdx<total-1?'Next — Câu tiếp →':'See results — Kết quả →')
          +'</button></div>'
        : '')
    +'</div>';
}

function renderRqDone() {
  var total = (S.rqItems || []).length;
  var pct   = total ? Math.round(S.rqScore / total * 100) : 0;
  var g;
  if (pct >= 84) g={ic:'🏆',en:'Perfect!',    vi:'Hoàn hảo!',    bg:'#EBF0E7',bd:'#8DA088',sh:'#33473A',co:'#33473A'};
  else if(pct>=50)g={ic:'👍',en:'Good job!',   vi:'Tốt lắm!',     bg:'#F5EEDD',bd:'#A8854B',sh:'#7A5E2E',co:'#6E5326'};
  else           g={ic:'📚',en:'Keep going!',  vi:'Ôn thêm nhé!', bg:'#F6EAE4',bd:'#A3563C',sh:'#7A3B27',co:'#7A3B27'};

  return '<div style="max-width:460px;margin:0 auto;padding:28px 16px" class="pop">'
    +'<div style="text-align:center;margin-bottom:22px">'
      +'<div style="font-size:64px;margin-bottom:10px">'+g.ic+'</div>'
      +'<h2 class="hf" style="font-size:22px;font-weight:600;color:#1E2B23;margin-bottom:4px">Revision complete!</h2>'
      +'<div style="font-size:13px;color:#7A7461;font-style:italic;margin-bottom:16px">Kiểm tra nhanh hoàn thành!</div>'
      +'<div style="display:inline-block;padding:14px 32px;background:'+g.bg+';border:1px solid '+g.bd+';border-radius:18px;box-shadow:none">'
        +'<div class="hf" style="font-size:48px;font-weight:600;color:'+g.co+'">'+S.rqScore+'/'+total+'</div>'
        +'<div style="font-size:13px;font-weight:600;color:'+g.co+'">'+g.en+'</div>'
        +'<div style="font-size:12px;color:'+g.co+';font-style:italic">'+g.vi+'</div>'
      +'</div>'
    +'</div>'
    +'<button onclick="goTo(\'done\')" class="mbtn" style="background:#5E7268;color:#fff;margin-bottom:10px">← Back to summary — Về tóm tắt</button>'
    +'<button onclick="initRevQuiz()" class="obtn">↺ Try quiz again — Làm lại</button>'
  +'</div>';
}

/* ── FSRS REVIEW SCREEN ───────────────────────────────────────
   Pulls due cards (saved via the 🧩 breakdown → Notebook), shows one at a
   time (term front; tap reveals ipa+vi), rates Again/Hard/Good/Easy through
   ML.fsrs.review(id, 1|2|3|4). Visual style mirrors renderFlashcard. */
function initReview() {
  S.revDue = null; S.revIdx = 0; S.revFlipped = false; S.revDone = false;
  if (window.MedLing && window.MedLing.fsrs && window.MedLing.notebook) {
    window.MedLing.fsrs.due().then(function(cards) {
      S.revDue = cards || [];
      track('review_start', { due: S.revDue.length });
      if (S.screen === 'review') renderApp();
    });
  } else {
    S.revDue = [];
  }
}

function revFlip() { S.revFlipped = true; renderApp(); }

function revRate(rating) {
  var deck = S.revDue || [];
  var card = deck[S.revIdx];
  if (!card) return;
  if (window.MedLing && window.MedLing.fsrs) {
    window.MedLing.fsrs.review(card.id, rating);
  }
  track('review_rate', { rating: rating });
  S.revIdx++;
  S.revFlipped = false;
  if (S.revIdx >= deck.length) S.revDone = true;
  renderApp(); window.scrollTo(0,0);
}

function renderReview() {
  var moduleOk = !!(window.MedLing && window.MedLing.fsrs && window.MedLing.notebook);
  var deck = S.revDue;

  /* Still loading the due list (async) → light placeholder, will re-render. */
  if (moduleOk && deck === null) {
    return '<div style="max-width:460px;margin:0 auto;padding:48px 16px;text-align:center;color:#7A7461" class="pop">'
      +'<div style="font-size:13px">Loading… — Đang tải…</div>'
    +'</div>';
  }

  /* Empty state: module absent OR no due cards. */
  if (!moduleOk || !deck || !deck.length) {
    return '<div style="max-width:460px;margin:0 auto;padding:28px 16px" class="pop">'
      +'<div style="text-align:center;margin-bottom:22px">'
        +'<div style="font-size:64px;margin-bottom:10px">📒</div>'
        +'<h2 class="hf" style="font-size:22px;font-weight:600;color:#1E2B23;margin-bottom:4px">No cards yet</h2>'
        +'<div style="font-size:13px;color:#7A7461;font-style:italic;line-height:1.6">save terms with 🧩<br>Chưa có thẻ — lưu từ bằng 🧩</div>'
      +'</div>'
      +'<button onclick="goTo(\'done\')" class="mbtn" style="background:#5E7268;color:#fff">← Back to summary — Về tóm tắt</button>'
    +'</div>';
  }

  /* Done state. */
  if (S.revDone || S.revIdx >= deck.length) {
    return '<div style="max-width:460px;margin:0 auto;padding:28px 16px" class="pop">'
      +'<div style="text-align:center;margin-bottom:22px">'
        +'<div style="font-size:64px;margin-bottom:10px">🎉</div>'
        +'<h2 class="hf" style="font-size:22px;font-weight:600;color:#1E2B23;margin-bottom:4px">All caught up!</h2>'
        +'<div style="font-size:13px;color:#7A7461;font-style:italic;margin-bottom:16px">Đã ôn xong các thẻ đến hạn!</div>'
        +'<div style="display:inline-block;padding:14px 32px;background:#ECEFEA;border:1px solid #5E7268;border-radius:18px;box-shadow:none">'
          +'<div class="hf" style="font-size:48px;font-weight:600;color:#33473A">'+deck.length+'</div>'
          +'<div style="font-size:12px;font-weight:600;color:#5E7268">cards reviewed — thẻ đã ôn</div>'
        +'</div>'
      +'</div>'
      +'<button onclick="goTo(\'done\')" class="mbtn" style="background:#5E7268;color:#fff">← Back to summary — Về tóm tắt</button>'
    +'</div>';
  }

  var c     = deck[S.revIdx];
  var total = deck.length;
  var done  = S.revIdx;
  var pct   = Math.round(done / total * 100);

  var cardHtml = S.revFlipped
    ? '<div class="pop" style="background:#ECEFEA;border-radius:20px;border:1px solid #5E7268;box-shadow:none;padding:32px 20px;text-align:center;margin-bottom:12px">'
        +(c.ipa ? '<div style="font-size:13px;font-family:var(--ml-font-mono);color:#5E7268;font-weight:600;margin-bottom:6px">/'+esc(c.ipa)+'/</div>' : '')
        +'<div class="hf" style="font-size:30px;font-weight:600;color:#1E2B23;margin-bottom:10px">'+esc(c.en)+'</div>'
        +'<div style="height:1.5px;background:#5E726830;margin-bottom:12px"></div>'
        +'<div style="font-size:22px;font-weight:600;color:#4F6B57">'+esc(c.vi||'')+'</div>'
      +'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px" class="pop">'
        +'<button onclick="revRate(1)" class="mbtn" style="background:#F6EAE4;color:#7A3B27;border-color:#A3563C;box-shadow:none">Again — Lại</button>'
        +'<button onclick="revRate(2)" class="mbtn" style="background:#F5EEDD;color:#7A5E2E;border-color:#A8854B;box-shadow:none">Hard — Khó</button>'
        +'<button onclick="revRate(3)" class="mbtn" style="background:#EEF2EA;color:#4F6B57;border-color:#74906F;box-shadow:none">Good — Tốt</button>'
        +'<button onclick="revRate(4)" class="mbtn" style="background:#EBF0E7;color:#33473A;border-color:#4F6B57;box-shadow:none">Easy — Dễ</button>'
      +'</div>'
    : '<button onclick="revFlip()" style="width:100%;background:#fff;border-radius:20px;border:1px solid #1E2B23;box-shadow:none;padding:52px 20px;text-align:center;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;margin-bottom:12px;-webkit-appearance:none;appearance:none;transition:transform .1s,box-shadow .1s" '
        +'onmousedown="this.style.transform=\'translate(2px,2px)\';this.style.boxShadow=\'none\'" '
        +'onmouseup="this.style.transform=\'\';this.style.boxShadow=\'none\'" '
        +'ontouchstart="this.style.transform=\'translate(2px,2px)\';this.style.boxShadow=\'none\'" '
        +'ontouchend="this.style.transform=\'\';this.style.boxShadow=\'none\'">'
        +'<div style="font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:#C9C2AE;font-weight:600;margin-bottom:16px">What does this mean? — Nghĩa là gì?</div>'
        +'<div class="hf" style="font-size:34px;font-weight:600;color:#1E2B23;line-height:1.2">'+esc(c.en)+'</div>'
        +'<div style="font-size:11px;color:#C9C2AE;margin-top:18px">Tap to reveal — Nhấn để xem nghĩa</div>'
      +'</button>';

  return '<div style="height:8px;background:#F2EDE1;position:sticky;top:0;z-index:20;border-bottom:1px solid #1E2B23">'
      +'<div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#8DA088,#4F6B57);transition:width .4s ease;'+(pct>2?'border-right:3px solid #1E2B23':'')+';"></div>'
    +'</div>'
    +'<div class="su" style="max-width:460px;margin:0 auto;padding:16px 16px 28px">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'
        +'<span style="padding:3px 12px;border-radius:20px;border:1px solid #5E7268;background:#ECEFEA;color:#5E7268;font-size:11px;font-weight:600">📒 Review · '+(done+1)+' / '+total+'</span>'
        +'<button onclick="goTo(\'done\')" style="font-size:12px;font-weight:600;color:#7A7461;background:none;border:none;cursor:pointer;padding:4px 8px;-webkit-appearance:none">✕ Exit</button>'
      +'</div>'
      +cardHtml
    +'</div>';
}

/* ── COMPLETE ──────────────────────────────────────────────── */
function renderComplete() {
  return '<div style="max-width:460px;margin:0 auto;padding:28px 16px" class="pop">'
    +'<div style="background:#FBF9F4;border-radius:20px;padding:36px 24px;border:1px solid #A8854B;box-shadow:none;text-align:center;margin-bottom:12px">'
      +'<div style="font-size:48px;margin-bottom:14px">🎉</div>'
      +'<div class="hf" style="font-size:22px;font-weight:600;color:#1E2B23;margin-bottom:8px">4 lessons down.</div>'
      +'<div style="font-size:14px;color:#1E2B23;line-height:1.7;margin-bottom:18px">'
        +'You\'ve completed the demo.<br>'
        +'The rest? <span style="color:#A8854B;font-weight:600">Still being built — carefully.</span>'
      +'</div>'
      +'<div style="width:40px;height:1px;background:#EAE4D6;margin:0 auto 18px"></div>'
      +'<div style="font-size:14px;color:#1E2B23;line-height:1.7;margin-bottom:6px">'
        +'Something <span style="color:#A8854B;font-weight:600">bigger</span> is coming.<br>'
        +'Same focus. Much wider scope.'
      +'</div>'
      +'<div style="font-size:11px;color:#7A7461;margin-top:14px;letter-spacing:.07em;text-transform:uppercase;font-weight:600">Stay tuned · Full release coming soon</div>'
    +'</div>'
    +'<button onclick="window.open(\'https://forms.gle/T4V9APLCynnvaY5o9\',\'_blank\')" class="mbtn" style="background:#33473A;color:#FBF9F4;margin-bottom:10px;text-align:left;padding:13px 16px">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;gap:10px">'
        +'<div>'
          +'<div style="font-size:15px;font-weight:600;margin-bottom:2px">📋 Share your feedback →</div>'
          +'<div style="font-size:10px;color:#C9C2AE;font-style:italic;margin-top:1px">Giúp chúng tôi xây dựng tốt hơn · 2 phút</div>'
        +'</div>'
      +'</div>'
    +'</button>'
    +'<button onclick="goTo(\'done\')" class="obtn">← Back to summary — Về tóm tắt</button>'
  +'</div>';
}

/* ── INIT ─────────────────────────────────────────────────── */
renderApp();
